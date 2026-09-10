import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Batch, ReturnRequest, ChainEvent, Organization
from app.schemas.schemas import ReturnRequestCreate
from app.services.batch_service import BatchService

router = APIRouter(prefix="/returns", tags=["Returns"])

@router.get("")
def list_returns(db: Session = Depends(get_db)):
    returns = db.query(ReturnRequest).all()
    results = []
    for r in returns:
        batch = db.query(Batch).filter(Batch.id == r.batch_id).first()
        results.append({
            "id": r.id,
            "return_code": r.return_code,
            "batch_id": r.batch_id,
            "batch_number": batch.batch_number if batch else "Unknown",
            "product_name": batch.product.name if batch and batch.product else "Unknown",
            "quantity_declared": r.quantity_declared,
            "reason": r.reason,
            "condition_notes": r.condition_notes,
            "photo_url": r.photo_url,
            "status": r.status,
            "created_at": r.created_at
        })
    return results

@router.post("")
def create_return_request(payload: ReturnRequestCreate, db: Session = Depends(get_db)):
    batch = db.query(Batch).filter(Batch.id == payload.batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    # Check status state transition
    if batch.status in ["DESTROYED", "CERTIFICATE_VERIFIED"]:
        raise HTTPException(status_code=400, detail="Cannot initiate return for already destroyed batch.")

    return_code = f"RET-{uuid.uuid4().hex[:6].upper()}"
    ret = ReturnRequest(
        return_code=return_code,
        batch_id=batch.id,
        pharmacy_id=batch.current_owner_id,
        quantity_declared=payload.quantity_declared,
        reason=payload.reason,
        condition_notes=payload.condition_notes or "Strips inspected. Packaging intact.",
        photo_url=payload.photo_url or "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80",
        status="RETURN_REQUESTED"
    )
    db.add(ret)

    # Update batch status
    batch.status = "RETURN_REQUESTED"
    batch.return_quantity = payload.quantity_declared

    # Audit chain event
    event = ChainEvent(
        event_code="RETURN_REQUESTED",
        batch_id=batch.id,
        actor_name="Pharmacist Lead",
        actor_role="RETAILER",
        organization_name=batch.current_owner.name if batch.current_owner else "Pharmacy",
        location_city=batch.current_location_city,
        quantity=payload.quantity_declared,
        action_title="Return Request Initiated",
        details=f"Return of {payload.quantity_declared} units initiated due to {payload.reason}.",
        evidence_url=payload.photo_url,
        timestamp=datetime.utcnow()
    )
    db.add(event)
    db.commit()

    return {"status": "SUCCESS", "return_code": return_code, "batch": BatchService.enrich_batch_dict(batch, db)}
