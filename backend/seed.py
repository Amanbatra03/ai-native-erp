from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
import datetime

models.Base.metadata.create_all(bind=engine)

def seed_data():
    db = SessionLocal()
    
    # Check if data already exists
    if db.query(models.Company).first():
        print("Data already exists. Skipping seed.")
        return

    # Add Companies
    acme = models.Company(name="Acme Corp", industry="Manufacturing", website="acme.com", description="General manufacturing company")
    globex = models.Company(name="Globex Corp", industry="Technology", website="globex.com", description="High-tech innovation")
    stark = models.Company(name="Stark Industries", industry="Defense", website="stark.com", description="Advanced defense systems")
    
    db.add_all([acme, globex, stark])
    db.commit()

    # Add Contacts
    db.add_all([
        models.Contact(first_name="John", last_name="Doe", email="john@acme.com", company_id=acme.id),
        models.Contact(first_name="Jane", last_name="Smith", email="jane@globex.com", company_id=globex.id),
        models.Contact(first_name="Tony", last_name="Stark", email="tony@stark.com", company_id=stark.id)
    ])
    
    # Add Deals
    db.add_all([
        models.Deal(title="Acme Widget Order", amount=50000, status="Closed Won", company_id=acme.id),
        models.Deal(title="Globex SaaS License", amount=120000, status="Negotiation", company_id=globex.id),
        models.Deal(title="Stark Tech Partnership", amount=1000000, status="Proposal", company_id=stark.id)
    ])

    # Add Employees
    db.add_all([
        models.Employee(first_name="Alice", last_name="Johnson", email="alice@acme.com", department="Engineering", role="Software Engineer", salary=95000, company_id=acme.id),
        models.Employee(first_name="Bob", last_name="Wilson", email="bob@globex.com", department="Sales", role="Account Executive", salary=80000, company_id=globex.id)
    ])

    # Add Suppliers (Phase 3)
    supplier1 = models.Supplier(name="Industrial Parts Inc", contact_name="Dave Miller", email="dave@industrial.com", category="Hardware")
    supplier2 = models.Supplier(name="Cloud Services Ltd", contact_name="Sarah Lee", email="sarah@cloud.com", category="Software")
    db.add_all([supplier1, supplier2])
    db.commit()

    # Add Inventory (Phase 3)
    db.add_all([
        models.InventoryItem(name="Steel Bolts", sku="BOLT-001", quantity=100, reorder_level=150, unit_price=0.5, supplier_id=supplier1.id),
        models.InventoryItem(name="Server Units", sku="SRV-202", quantity=15, reorder_level=10, unit_price=2000, supplier_id=supplier2.id)
    ])

    # Add Transactions (Phase 3)
    db.add_all([
        models.Transaction(description="Initial Investment", amount=500000, type="Income", category="Equity", company_id=acme.id),
        models.Transaction(description="Office Rent", amount=5000, type="Expense", category="Operations", company_id=acme.id),
        models.Transaction(description="Software License Sale", amount=12000, type="Income", category="Sales", company_id=globex.id)
    ])
    
    db.commit()
    print("Comprehensive seed data created successfully.")
    db.close()

if __name__ == "__main__":
    seed_data()
