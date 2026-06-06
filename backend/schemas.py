from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, date

# --- CRM Schemas ---
class ContactBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    company_id: Optional[int] = None

class ContactCreate(ContactBase):
    pass

class Contact(ContactBase):
    id: int
    class Config:
        from_attributes = True

class CompanyBase(BaseModel):
    name: str
    industry: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None

class CompanyCreate(CompanyBase):
    pass

class Company(CompanyBase):
    id: int
    contacts: List[Contact] = []
    class Config:
        from_attributes = True

class DealBase(BaseModel):
    title: str
    amount: float
    status: str
    company_id: int

class DealCreate(DealBase):
    pass

class Deal(DealBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# --- HR Schemas ---

class EmployeeBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    department: str
    role: str
    hire_date: Optional[date] = None
    salary: float
    company_id: int

class EmployeeCreate(EmployeeBase):
    pass

class Employee(EmployeeBase):
    id: int
    class Config:
        from_attributes = True

class LeaveRequestBase(BaseModel):
    employee_id: int
    start_date: date
    end_date: date
    leave_type: str
    reason: Optional[str] = None

class LeaveRequestCreate(LeaveRequestBase):
    pass

class LeaveRequest(LeaveRequestBase):
    id: int
    status: str
    class Config:
        from_attributes = True

# --- Finance Schemas ---

class TransactionBase(BaseModel):
    description: str
    amount: float
    type: str
    category: str
    company_id: int

class TransactionCreate(TransactionBase):
    pass

class Transaction(TransactionBase):
    id: int
    date: datetime
    class Config:
        from_attributes = True

# --- Supply Chain Schemas ---

class SupplierBase(BaseModel):
    name: str
    contact_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    category: Optional[str] = None

class SupplierCreate(SupplierBase):
    pass

class Supplier(SupplierBase):
    id: int
    class Config:
        from_attributes = True

class InventoryItemBase(BaseModel):
    name: str
    sku: str
    quantity: int
    reorder_level: int
    unit_price: float
    supplier_id: int

class InventoryItemCreate(InventoryItemBase):
    pass

class InventoryItem(InventoryItemBase):
    id: int
    class Config:
        from_attributes = True

# --- Marketing Schemas ---

class LeadBase(BaseModel):
    name: str
    email: EmailStr
    source: str
    campaign_id: int

class LeadCreate(LeadBase):
    pass

class Lead(LeadBase):
    id: int
    ai_score: int
    priority: str
    status: str
    class Config:
        from_attributes = True

class CampaignBase(BaseModel):
    name: str
    budget: float
    status: Optional[str] = "Active"

class CampaignCreate(CampaignBase):
    pass

class Campaign(CampaignBase):
    id: int
    leads: List[Lead] = []
    class Config:
        from_attributes = True

# --- Auth & User Schemas ---

class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str
    role: Optional[str] = "readonly"

class User(UserBase):
    id: int
    role: str
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- Audit Log Schema ---

class AuditLogRead(BaseModel):
    id: int
    user_email: str
    action: str
    entity: str
    entity_id: Optional[int] = None
    details: Optional[str] = None
    timestamp: datetime
    ip_address: Optional[str] = None
    class Config:
        from_attributes = True

# --- Misc ---

class QueryRequest(BaseModel):
    query: str
