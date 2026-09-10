from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.demo_service import DemoService

router = APIRouter(prefix="/demo", tags=["Demo"])

@router.post("/run-fraud-scenario")
def run_fraud_demo_scenario(db: Session = Depends(get_db)):
    result = DemoService.run_fraud_demo(db)
    return result
