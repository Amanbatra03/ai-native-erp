from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models

def seed_v3():
    db = SessionLocal()
    
    # Add Campaigns
    if not db.query(models.Campaign).first():
        spring = models.Campaign(name="Spring Outbound 2026", budget=25000, status="Active")
        social = models.Campaign(name="LinkedIn SaaS Push", budget=10000, status="Active")
        db.add_all([spring, social])
        db.commit()
        
        # Add Leads
        db.add_all([
            models.Lead(name="Mark Zuckerberg", email="mz@meta.com", source="Referral", campaign_id=spring.id, status="New"),
            models.Lead(name="Satya Nadella", email="satya@microsoft.com", source="LinkedIn", campaign_id=social.id, status="New"),
            models.Lead(name="Sundar Pichai", email="sundar@google.com", source="Web", campaign_id=social.id, status="New"),
            models.Lead(name="Jeff Bezos", email="jeff@amazon.com", source="Inbound", campaign_id=spring.id, status="New")
        ])
        db.commit()
        print("Marketing v3.0 seed data created.")
    else:
        print("Marketing data already exists.")
    
    db.close()

if __name__ == "__main__":
    seed_v3()
