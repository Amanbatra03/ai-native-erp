from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
import models, schemas, database, os, json, time
from database import engine, get_db
from ai_utils import get_nlq_response, mock_nlq_response, get_ai_insight, score_lead
from auth import (
    verify_password, get_password_hash, create_access_token,
    get_current_user, role_required,
)


def _run_migrations():
    with engine.connect() as conn:
        from sqlalchemy import text, inspect
        inspector = inspect(engine)
        user_cols = [c["name"] for c in inspector.get_columns("users")]
        if "role" not in user_cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'readonly'"))
            conn.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        models.Base.metadata.create_all(bind=engine)
        _run_migrations()
        print("[STARTUP] Database initialized successfully")
    except Exception as exc:
        import traceback
        print(f"[STARTUP ERROR] Database initialization failed: {exc}")
        traceback.print_exc()
    yield


app = FastAPI(title="AI-Native ERP v4.0", lifespan=lifespan)

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,https://ai-native-erp-frontend.onrender.com"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Stats cache (60-second TTL) ────────────────────────────────────────────
_stats_cache: dict = {"data": None, "expires": 0.0}


# ─── Audit helper ────────────────────────────────────────────────────────────
def log_action(
    db: Session,
    user_email: str,
    action: str,
    entity: str,
    entity_id: Optional[int],
    details: dict,
    ip: Optional[str] = None,
):
    db.add(models.AuditLog(
        user_email=user_email,
        action=action,
        entity=entity,
        entity_id=entity_id,
        details=json.dumps(details),
        ip_address=ip,
    ))
    db.commit()


# ─── Root ────────────────────────────────────────────────────────────────────
@app.get("/")
def read_root():
    return {"message": "AI-Native ERP API v4.0"}


# ─── Auth Endpoints ───────────────────────────────────────────────────────────
@app.post("/auth/register", response_model=schemas.User)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == user_in.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    # First user ever → auto-admin
    is_first = db.query(models.User).count() == 0
    role = "admin" if is_first else user_in.role
    db_user = models.User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=role,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@app.post("/auth/login", response_model=schemas.Token)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form.username).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token({"sub": user.email, "role": user.role})
    return {"access_token": token, "token_type": "bearer"}


@app.get("/auth/me", response_model=schemas.User)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user


# ─── Audit Log Endpoint ───────────────────────────────────────────────────────
@app.get("/audit-logs", response_model=List[schemas.AuditLogRead])
def get_audit_logs(
    entity: Optional[str] = None,
    user: Optional[str] = None,
    action: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(role_required("admin")),
):
    q = db.query(models.AuditLog)
    if entity:
        q = q.filter(models.AuditLog.entity == entity)
    if user:
        q = q.filter(models.AuditLog.user_email.contains(user))
    if action:
        q = q.filter(models.AuditLog.action == action)
    return q.order_by(models.AuditLog.timestamp.desc()).offset(skip).limit(limit).all()


# ─── CRM Endpoints ────────────────────────────────────────────────────────────
@app.get("/companies/", response_model=List[schemas.Company])
def read_companies(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Company).offset(skip).limit(limit).all()

@app.post("/companies/", response_model=schemas.Company)
def create_company(
    company: schemas.CompanyCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(role_required("admin", "crm")),
):
    db_company = models.Company(**company.dict())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    log_action(db, current_user.email, "CREATE", "company", db_company.id,
               {"name": db_company.name}, request.client.host if request.client else None)
    return db_company

@app.get("/contacts/", response_model=List[schemas.Contact])
def read_contacts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Contact).offset(skip).limit(limit).all()

@app.post("/contacts/", response_model=schemas.Contact)
def create_contact(
    contact: schemas.ContactCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(role_required("admin", "crm")),
):
    db_contact = models.Contact(**contact.dict())
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    log_action(db, current_user.email, "CREATE", "contact", db_contact.id,
               {"email": db_contact.email}, request.client.host if request.client else None)
    return db_contact

@app.get("/deals/", response_model=List[schemas.Deal])
def read_deals(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Deal).offset(skip).limit(limit).all()

@app.post("/deals/", response_model=schemas.Deal)
def create_deal(
    deal: schemas.DealCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(role_required("admin", "crm")),
):
    db_deal = models.Deal(**deal.dict())
    db.add(db_deal)
    db.commit()
    db.refresh(db_deal)
    log_action(db, current_user.email, "CREATE", "deal", db_deal.id,
               {"title": db_deal.title, "amount": db_deal.amount}, request.client.host if request.client else None)
    return db_deal


# ─── HR Endpoints ─────────────────────────────────────────────────────────────
@app.get("/employees/", response_model=List[schemas.Employee])
def read_employees(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Employee).offset(skip).limit(limit).all()

@app.post("/employees/", response_model=schemas.Employee)
def create_employee(
    employee: schemas.EmployeeCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(role_required("admin", "hr")),
):
    db_employee = models.Employee(**employee.dict())
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    log_action(db, current_user.email, "CREATE", "employee", db_employee.id,
               {"name": f"{db_employee.first_name} {db_employee.last_name}", "role": db_employee.role},
               request.client.host if request.client else None)
    return db_employee

@app.get("/leave-requests/", response_model=List[schemas.LeaveRequest])
def read_leave_requests(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.LeaveRequest).offset(skip).limit(limit).all()

@app.post("/leave-requests/", response_model=schemas.LeaveRequest)
def create_leave_request(
    leave: schemas.LeaveRequestCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(role_required("admin", "hr")),
):
    db_leave = models.LeaveRequest(**leave.dict())
    db.add(db_leave)
    db.commit()
    db.refresh(db_leave)
    log_action(db, current_user.email, "CREATE", "leave_request", db_leave.id,
               {"employee_id": db_leave.employee_id, "type": db_leave.leave_type},
               request.client.host if request.client else None)
    return db_leave

@app.get("/hr/payroll")
def get_hr_payroll(db: Session = Depends(get_db)):
    employees = db.query(models.Employee).with_entities(models.Employee.salary).all()
    total = sum(e[0] for e in employees)
    return {"total_monthly_payroll": total, "employee_count": len(employees)}


# ─── Finance Endpoints ────────────────────────────────────────────────────────
@app.get("/transactions/", response_model=List[schemas.Transaction])
def read_transactions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Transaction).offset(skip).limit(limit).all()

@app.post("/transactions/", response_model=schemas.Transaction)
def create_transaction(
    transaction: schemas.TransactionCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(role_required("admin", "finance")),
):
    db_transaction = models.Transaction(**transaction.dict())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    log_action(db, current_user.email, "CREATE", "transaction", db_transaction.id,
               {"description": db_transaction.description, "amount": db_transaction.amount, "type": db_transaction.type},
               request.client.host if request.client else None)
    return db_transaction


# ─── Supply Chain Endpoints ───────────────────────────────────────────────────
@app.get("/suppliers/", response_model=List[schemas.Supplier])
def read_suppliers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Supplier).offset(skip).limit(limit).all()

@app.post("/suppliers/", response_model=schemas.Supplier)
def create_supplier(
    supplier: schemas.SupplierCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(role_required("admin", "finance")),
):
    db_supplier = models.Supplier(**supplier.dict())
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    log_action(db, current_user.email, "CREATE", "supplier", db_supplier.id,
               {"name": db_supplier.name}, request.client.host if request.client else None)
    return db_supplier

@app.get("/inventory/", response_model=List[schemas.InventoryItem])
def read_inventory(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.InventoryItem).offset(skip).limit(limit).all()

@app.post("/inventory/", response_model=schemas.InventoryItem)
def create_inventory_item(
    item: schemas.InventoryItemCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(role_required("admin", "finance")),
):
    db_item = models.InventoryItem(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    log_action(db, current_user.email, "CREATE", "inventory_item", db_item.id,
               {"name": db_item.name, "sku": db_item.sku}, request.client.host if request.client else None)
    return db_item


# ─── Marketing Endpoints ──────────────────────────────────────────────────────
@app.get("/campaigns/", response_model=List[schemas.Campaign])
def read_campaigns(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Campaign).offset(skip).limit(limit).all()

@app.post("/campaigns/", response_model=schemas.Campaign)
def create_campaign(
    campaign: schemas.CampaignCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(role_required("admin", "crm")),
):
    db_campaign = models.Campaign(**campaign.dict())
    db.add(db_campaign)
    db.commit()
    db_campaign = db.query(models.Campaign).filter(models.Campaign.id == db_campaign.id).first()
    log_action(db, current_user.email, "CREATE", "campaign", db_campaign.id,
               {"name": db_campaign.name}, request.client.host if request.client else None)
    return db_campaign

@app.get("/leads/", response_model=List[schemas.Lead])
def read_leads(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Lead).offset(skip).limit(limit).all()

@app.post("/leads/", response_model=schemas.Lead)
def create_lead(
    lead: schemas.LeadCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(role_required("admin", "crm")),
):
    db_lead = models.Lead(**lead.dict())
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    log_action(db, current_user.email, "CREATE", "lead", db_lead.id,
               {"name": db_lead.name, "email": db_lead.email}, request.client.host if request.client else None)
    return db_lead


# ─── Dashboard Endpoints ──────────────────────────────────────────────────────
@app.get("/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    global _stats_cache
    if time.time() < _stats_cache["expires"] and _stats_cache["data"]:
        return _stats_cache["data"]

    companies_count = db.query(models.Company).count()
    employees_count = db.query(models.Employee).count()
    revenue_sum = db.query(models.Deal).with_entities(models.Deal.amount).all()
    total_revenue = sum(d[0] for d in revenue_sum)

    transactions = db.query(models.Transaction).all()
    income   = sum(t.amount for t in transactions if t.type == "Income")
    expenses = sum(t.amount for t in transactions if t.type == "Expense")
    net_income = income - expenses

    low_stock_count = db.query(models.InventoryItem).filter(
        models.InventoryItem.quantity <= models.InventoryItem.reorder_level
    ).count()

    pending_leaves = db.query(models.LeaveRequest).filter(
        models.LeaveRequest.status == "Pending"
    ).count()

    data = {
        "companies": companies_count,
        "employees": employees_count,
        "revenue": total_revenue,
        "net_income": net_income,
        "low_stock": low_stock_count,
        "pending_leaves": pending_leaves,
    }
    _stats_cache = {"data": data, "expires": time.time() + 60}
    return data


@app.get("/dashboard/insight")
async def get_dashboard_insight(db: Session = Depends(get_db)):
    stats = get_dashboard_stats(db)
    insight = get_ai_insight(stats)
    return {"insight": insight}


# ─── AI & Automation Endpoints ────────────────────────────────────────────────
@app.post("/nlq/")
async def natural_language_query(request: schemas.QueryRequest, db: Session = Depends(get_db)):
    query = request.query
    response = get_nlq_response(query) if os.getenv("GOOGLE_API_KEY") else mock_nlq_response(query)
    return {"query": query, "response": response}


@app.post("/automate/approve-leave/")
async def automate_leave_approval(db: Session = Depends(get_db)):
    pending = db.query(models.LeaveRequest).filter(models.LeaveRequest.status == "Pending").all()
    approvals = 0
    for req in pending:
        duration = (req.end_date - req.start_date).days
        if duration <= 3:
            req.status = "Approved"
            approvals += 1
    db.commit()
    return {"message": f"AI Agent processed leave requests. Approvals: {approvals}"}


@app.post("/automate/predict-restock/")
async def predict_restock(db: Session = Depends(get_db)):
    low = db.query(models.InventoryItem).filter(
        models.InventoryItem.quantity <= models.InventoryItem.reorder_level
    ).all()
    suggestions = [
        {
            "item_name": item.name,
            "current_quantity": item.quantity,
            "reorder_level": item.reorder_level,
            "suggested_order": item.reorder_level * 2 - item.quantity,
            "supplier": item.supplier.name if item.supplier else "Unknown",
        }
        for item in low
    ]
    return {"suggestions": suggestions}


@app.post("/automate/execute-restock")
async def execute_restock(db: Session = Depends(get_db)):
    low = db.query(models.InventoryItem).filter(
        models.InventoryItem.quantity <= models.InventoryItem.reorder_level
    ).all()
    restocked = []
    for item in low:
        added = item.reorder_level * 2
        item.quantity += added
        restocked.append({"name": item.name, "added": added, "new_quantity": item.quantity})
    db.commit()
    return {"message": "Restock automation completed", "restocked_items": restocked}


@app.post("/automate/qualify-leads")
async def qualify_leads(db: Session = Depends(get_db)):
    new_leads = db.query(models.Lead).filter(models.Lead.status == "New").all()
    for lead in new_leads:
        analysis = score_lead({"name": lead.name, "email": lead.email, "source": lead.source})
        lead.ai_score = analysis.get("score", 50)
        lead.priority  = analysis.get("priority", "Warm")
        lead.status    = "Qualified" if lead.ai_score > 60 else "New"
    db.commit()
    return {"message": f"AI Agent processed {len(new_leads)} leads"}
