from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import models, schemas, database, os
from database import engine, get_db
from ai_utils import get_nlq_response, mock_nlq_response, get_ai_insight, score_lead

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI-Native ERP")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI-Native ERP API"}

# --- CRM Endpoints ---

@app.post("/companies/", response_model=schemas.Company)
def create_company(company: schemas.CompanyCreate, db: Session = Depends(get_db)):
    db_company = models.Company(**company.dict())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company

@app.get("/companies/", response_model=List[schemas.Company])
def read_companies(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Company).offset(skip).limit(limit).all()

@app.post("/contacts/", response_model=schemas.Contact)
def create_contact(contact: schemas.ContactCreate, db: Session = Depends(get_db)):
    db_contact = models.Contact(**contact.dict())
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact

@app.get("/contacts/", response_model=List[schemas.Contact])
def read_contacts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Contact).offset(skip).limit(limit).all()

@app.post("/deals/", response_model=schemas.Deal)
def create_deal(deal: schemas.DealCreate, db: Session = Depends(get_db)):
    db_deal = models.Deal(**deal.dict())
    db.add(db_deal)
    db.commit()
    db.refresh(db_deal)
    return db_deal

@app.get("/deals/", response_model=List[schemas.Deal])
def read_deals(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Deal).offset(skip).limit(limit).all()

# --- HR Endpoints ---

@app.post("/employees/", response_model=schemas.Employee)
def create_employee(employee: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    db_employee = models.Employee(**employee.dict())
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

@app.get("/employees/", response_model=List[schemas.Employee])
def read_employees(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Employee).offset(skip).limit(limit).all()

@app.post("/leave-requests/", response_model=schemas.LeaveRequest)
def create_leave_request(leave: schemas.LeaveRequestCreate, db: Session = Depends(get_db)):
    db_leave = models.LeaveRequest(**leave.dict())
    db.add(db_leave)
    db.commit()
    db.refresh(db_leave)
    return db_leave

@app.get("/leave-requests/", response_model=List[schemas.LeaveRequest])
def read_leave_requests(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.LeaveRequest).offset(skip).limit(limit).all()

@app.get("/hr/payroll")
def get_hr_payroll(db: Session = Depends(get_db)):
    employees = db.query(models.Employee).with_entities(models.Employee.salary).all()
    total_monthly_payroll = sum(e[0] for e in employees)
    return {"total_monthly_payroll": total_monthly_payroll, "employee_count": len(employees)}

# --- Finance Endpoints (Phase 3) ---

@app.post("/transactions/", response_model=schemas.Transaction)
def create_transaction(transaction: schemas.TransactionCreate, db: Session = Depends(get_db)):
    db_transaction = models.Transaction(**transaction.dict())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@app.get("/transactions/", response_model=List[schemas.Transaction])
def read_transactions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Transaction).offset(skip).limit(limit).all()

# --- Supply Chain Endpoints (Phase 3) ---

@app.post("/suppliers/", response_model=schemas.Supplier)
def create_supplier(supplier: schemas.SupplierCreate, db: Session = Depends(get_db)):
    db_supplier = models.Supplier(**supplier.dict())
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    return db_supplier

@app.get("/suppliers/", response_model=List[schemas.Supplier])
def read_suppliers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Supplier).offset(skip).limit(limit).all()

@app.post("/inventory/", response_model=schemas.InventoryItem)
def create_inventory_item(item: schemas.InventoryItemCreate, db: Session = Depends(get_db)):
    db_item = models.InventoryItem(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.get("/inventory/", response_model=List[schemas.InventoryItem])
def read_inventory(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.InventoryItem).offset(skip).limit(limit).all()

# --- Marketing Endpoints (Phase 4 / v3.0) ---

@app.post("/campaigns/", response_model=schemas.Campaign)
def create_campaign(campaign: schemas.CampaignCreate, db: Session = Depends(get_db)):
    db_campaign = models.Campaign(**campaign.dict())
    db.add(db_campaign)
    db.commit()
    db_campaign = db.query(models.Campaign).filter(models.Campaign.id == db_campaign.id).first()
    return db_campaign

@app.get("/campaigns/", response_model=List[schemas.Campaign])
def read_campaigns(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Campaign).offset(skip).limit(limit).all()

@app.post("/leads/", response_model=schemas.Lead)
def create_lead(lead: schemas.LeadCreate, db: Session = Depends(get_db)):
    db_lead = models.Lead(**lead.dict())
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead

@app.get("/leads/", response_model=List[schemas.Lead])
def read_leads(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Lead).offset(skip).limit(limit).all()

# --- v2.0 Dashboard & Analytics Endpoints ---

@app.get("/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    companies_count = db.query(models.Company).count()
    employees_count = db.query(models.Employee).count()
    revenue_sum = db.query(models.Deal).with_entities(models.Deal.amount).all()
    total_revenue = sum(d[0] for d in revenue_sum)
    
    transactions = db.query(models.Transaction).all()
    income = sum(t.amount for t in transactions if t.type == 'Income')
    expenses = sum(t.amount for t in transactions if t.type == 'Expense')
    net_income = income - expenses
    
    low_stock_count = db.query(models.InventoryItem).filter(
        models.InventoryItem.quantity <= models.InventoryItem.reorder_level
    ).count()
    
    pending_leaves = db.query(models.LeaveRequest).filter(
        models.LeaveRequest.status == "Pending"
    ).count()
    
    return {
        "companies": companies_count,
        "employees": employees_count,
        "revenue": total_revenue,
        "net_income": net_income,
        "low_stock": low_stock_count,
        "pending_leaves": pending_leaves
    }

@app.get("/dashboard/insight")
async def get_dashboard_insight(db: Session = Depends(get_db)):
    stats = get_dashboard_stats(db)
    insight = get_ai_insight(stats)
    return {"insight": insight}

# --- AI & Automation Endpoints ---

@app.post("/nlq/")
async def natural_language_query(request: schemas.QueryRequest, db: Session = Depends(get_db)):
    query = request.query
    if os.getenv("GOOGLE_API_KEY"):
        response = get_nlq_response(query)
    else:
        response = mock_nlq_response(query)
    return {"query": query, "response": response}

@app.post("/automate/approve-leave/")
async def automate_leave_approval(db: Session = Depends(get_db)):
    pending = db.query(models.LeaveRequest).filter(models.LeaveRequest.status == "Pending").all()
    approvals = 0
    for request in pending:
        duration = (request.end_date - request.start_date).days
        if duration <= 3:
            request.status = "Approved"
            approvals += 1
    db.commit()
    return {"message": f"AI Agent processed leave requests. Approvals: {approvals}"}

@app.post("/automate/predict-restock/")
async def predict_restock(db: Session = Depends(get_db)):
    """
    Predictive Analytics: Identifies items below reorder level and suggests restock.
    """
    low_stock_items = db.query(models.InventoryItem).filter(models.InventoryItem.quantity <= models.InventoryItem.reorder_level).all()
    suggestions = []
    for item in low_stock_items:
        suggestions.append({
            "item_name": item.name,
            "current_quantity": item.quantity,
            "reorder_level": item.reorder_level,
            "suggested_order": item.reorder_level * 2 - item.quantity,
            "supplier": item.supplier.name if item.supplier else "Unknown"
        })
    return {"suggestions": suggestions}

@app.post("/automate/execute-restock")
async def execute_restock(db: Session = Depends(get_db)):
    """
    Automates the replenishment of all low-stock items.
    """
    low_stock_items = db.query(models.InventoryItem).filter(
        models.InventoryItem.quantity <= models.InventoryItem.reorder_level
    ).all()
    
    restocked = []
    for item in low_stock_items:
        added_qty = item.reorder_level * 2
        item.quantity += added_qty
        restocked.append({"name": item.name, "added": added_qty, "new_quantity": item.quantity})
    
    db.commit()
    return {"message": "Restock automation completed", "restocked_items": restocked}

@app.post("/automate/qualify-leads")
async def qualify_leads(db: Session = Depends(get_db)):
    """
    AI Agent: Scores and qualifies all 'New' leads.
    """
    new_leads = db.query(models.Lead).filter(models.Lead.status == "New").all()
    qualified_count = 0
    
    for lead in new_leads:
        lead_data = {"name": lead.name, "email": lead.email, "source": lead.source}
        analysis = score_lead(lead_data)
        
        lead.ai_score = analysis.get("score", 50)
        lead.priority = analysis.get("priority", "Warm")
        lead.status = "Qualified" if lead.ai_score > 60 else "New"
        qualified_count += 1
        
    db.commit()
    return {"message": f"AI Agent processed leads. Qualified: {qualified_count}"}
