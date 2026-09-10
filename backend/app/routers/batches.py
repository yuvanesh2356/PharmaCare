from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Batch, Product, Organization, ChainEvent
from app.schemas.schemas import BatchSchema, BatchDetailSchema, BatchCreate, ReentryScanRequest, NaturalLanguageQueryRequest
from app.services.batch_service import BatchService
from app.services.fraud_service import FraudService
from app.services.investigation_assistant import InvestigationAssistant

router = APIRouter(prefix="/batches", tags=["Batches"])

@router.get("")
def get_batches(
    status: Optional[str] = None,
    risk_level: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Batch)

    if status:
        query = query.filter(Batch.status == status)

    batches = query.order_by(Batch.updated_at.desc()).all()
    
    results = []
    for b in batches:
        enriched = BatchService.enrich_batch_dict(b, db)
        
        # Filter by risk_level if provided
        if risk_level and enriched["risk_level"] != risk_level.upper():
            continue
            
        # Search filter
        if search:
            s = search.lower()
            if not (s in b.batch_number.lower() or s in enriched["product_name"].lower() or s in b.current_location_city.lower()):
                continue

        results.append(enriched)

    return results

@router.post("")
def create_batch(payload: BatchCreate, db: Session = Depends(get_db)):
    # Check if product exists or create
    prod = db.query(Product).filter(Product.name == payload.product_name).first()
    if not prod:
        prod = Product(
            name=payload.product_name,
            generic_name=payload.generic_name,
            dosage_form="Tablet",
            manufacturer_name=payload.manufacturer_name
        )
        db.add(prod)
        db.commit()
        db.refresh(prod)

    # Check manufacturer org
    mfg_org = db.query(Organization).filter(Organization.org_type == "MANUFACTURER").first()

    batch = Batch(
        batch_number=payload.batch_number,
        product_id=prod.id,
        mfg_date=payload.mfg_date,
        expiry_date=payload.expiry_date,
        pack_size=payload.pack_size,
        original_quantity=payload.quantity,
        current_quantity=payload.quantity,
        current_owner_id=mfg_org.id if mfg_org else 1,
        current_location_city=payload.location_city,
        status="ACTIVE",
        risk_score=0
    )
    db.add(batch)
    db.commit()
    db.refresh(batch)

    # Audit event
    event = ChainEvent(
        event_code="BATCH_CREATED",
        batch_id=batch.id,
        actor_name="Production Manager",
        actor_role="MANUFACTURER",
        organization_name=payload.manufacturer_name,
        location_city=payload.location_city,
        quantity=payload.quantity,
        action_title="Batch Digital Twin Created",
        details=f"Batch {batch.batch_number} created with QR digital twin registry.",
        timestamp=datetime.utcnow()
    )
    db.add(event)
    db.commit()

    return BatchService.enrich_batch_dict(batch, db)

@router.get("/{id}")
def get_batch_detail(id: int, db: Session = Depends(get_db)):
    batch = db.query(Batch).filter(Batch.id == id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    return BatchService.enrich_batch_dict(batch, db)

@router.post("/scan-reentry")
def scan_reentry(payload: ReentryScanRequest, db: Session = Depends(get_db)):
    result = FraudService.process_reentry_scan(
        batch_number=payload.batch_number,
        scanning_pharmacy=payload.scanning_pharmacy_name,
        city=payload.scanning_city,
        db=db
    )
    return result

@router.post("/query-assistant")
def query_assistant(payload: NaturalLanguageQueryRequest, db: Session = Depends(get_db)):
    return InvestigationAssistant.answer_query(
        question=payload.question,
        batch_id=payload.batch_id,
        db=db
    )
