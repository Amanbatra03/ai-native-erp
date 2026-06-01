from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, Date
from sqlalchemy.orm import relationship
from database import Base
import datetime

# --- CRM Models ---

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)

class Company(Base):
    __tablename__ = "companies"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    industry = Column(String)
    website = Column(String)
    description = Column(Text)
    
    contacts = relationship("Contact", back_populates="company")
    deals = relationship("Deal", back_populates="company")
    employees = relationship("Employee", back_populates="company")
    transactions = relationship("Transaction", back_populates="company")

class Contact(Base):
    __tablename__ = "contacts"
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, index=True)
    last_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    company_id = Column(Integer, ForeignKey("companies.id"))
    
    company = relationship("Company", back_populates="contacts")

class Deal(Base):
    __tablename__ = "deals"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    amount = Column(Float)
    status = Column(String)
    company_id = Column(Integer, ForeignKey("companies.id"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    company = relationship("Company", back_populates="deals")

# --- HR Models ---

class Employee(Base):
    __tablename__ = "employees"
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, index=True)
    last_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    department = Column(String, index=True)
    role = Column(String)
    hire_date = Column(Date, default=datetime.date.today)
    salary = Column(Float)
    company_id = Column(Integer, ForeignKey("companies.id"))
    
    company = relationship("Company", back_populates="employees")
    leave_requests = relationship("LeaveRequest", back_populates="employee")

class LeaveRequest(Base):
    __tablename__ = "leave_requests"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    start_date = Column(Date)
    end_date = Column(Date)
    leave_type = Column(String)
    status = Column(String, default="Pending")
    reason = Column(Text)
    
    employee = relationship("Employee", back_populates="leave_requests")

# --- Finance Models (Phase 3) ---

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, default=datetime.datetime.utcnow)
    description = Column(String)
    amount = Column(Float)
    type = Column(String) # 'Income', 'Expense'
    category = Column(String)
    company_id = Column(Integer, ForeignKey("companies.id"))
    
    company = relationship("Company", back_populates="transactions")

# --- Supply Chain Models (Phase 3) ---

class Supplier(Base):
    __tablename__ = "suppliers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    contact_name = Column(String)
    email = Column(String)
    phone = Column(String)
    category = Column(String)
    
    items = relationship("InventoryItem", back_populates="supplier")

class InventoryItem(Base):
    __tablename__ = "inventory_items"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    sku = Column(String, unique=True, index=True)
    quantity = Column(Integer)
    reorder_level = Column(Integer)
    unit_price = Column(Float)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    
    supplier = relationship("Supplier", back_populates="items")

# --- Marketing Models (Phase 4 / v3.0) ---

class Campaign(Base):
    __tablename__ = "campaigns"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    budget = Column(Float)
    status = Column(String, default="Active") # 'Active', 'Completed', 'Paused'
    
    leads = relationship("Lead", back_populates="campaign")

class Lead(Base):
    __tablename__ = "leads"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, index=True)
    source = Column(String)
    ai_score = Column(Integer, default=0)
    priority = Column(String, default="Cold") # 'Hot', 'Warm', 'Cold'
    status = Column(String, default="New") # 'New', 'Qualified', 'Contacted', 'Converted', 'Lost'
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))
    
    campaign = relationship("Campaign", back_populates="leads")
