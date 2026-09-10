import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Batch, Handoff, ChainEvent, Alert, Organization, ReturnRequest
from app.schemas.schemas import HandoffVerifyRequest
from app.services.batch_service import BatchService
from app.risk_engine.risk_scorer import RiskScorer

router = APIRouter(prefix="/handoffs", tags=["Handoffs"])

@router.get("")
def list_handoffs(db: Session = Depends(get_db)):
    handoffs = db.query(Handoff).all()
    results = []
    for h in handoffs:
        batch = db.query(Batch).filter(Batch.id == h.batch_id).first()
        from_org = db.query(Organization).filter(Organization.id == h.from_org_id).first()
        to_org = db.query(Organization).filter(Organization.id == h.to_org_id).first()
        results.append({
            "id": h.id,
            "batch_id": h.batch_id,
            "batch_number": batch.batch_number if batch else "Unknown",
            "from_org_name": from_org.name if from_org else "Unknown",
            "to_org_name": to_org.name if to_org else "Unknown",
            "declared_quantity": h.declared_quantity,
            "verified_quantity": h.verified_quantity,
            "discrepancy_count": h.discrepancy_count,
            "status": h.status,
            "created_at": h.created_at
        })
    return results

@router.post("/verify")
def verify_handoff(payload: HandoffVerifyRequest, db: Session = Depends(get_db)):
    batch = db.query(Batch).filter(Batch.id == payload.batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    dist_org = db.query(Organization).filter(Organization.org_type == "DISTRIBUTOR").first()
    
    declared = batch.return_quantity or batch.current_quantity
    verified = payload.received_quantity
    discrepancy = max(0, declared - verified)

    status = "DISCREPANCY_FLAGGED" if discrepancy > 0 else "ACCEPTED"

    handoff = Handoff(
        batch_id=batch.id,
        from_org_id=batch.current_owner_id,
        to_org_id=dist_org.id if dist_org else 2,
        declared_quantity=declared,
        verified_quantity=verified,
        discrepancy_count=discrepancy,
        status=status,
        weight_kg=payload.weight_kg or (verified * 0.02),
        receipt_photo_url=payload.receipt_photo_url or "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&q=80"
    )
    db.add(handoff)

    # Update batch location & owner
    if dist_org:
        batch.current_owner_id = dist_org.id
        batch.current_location_city = dist_org.location_city

    batch.current_quantity = verified
    batch.status = "DISTRIBUTOR_RECEIVED"

    # Audit chain event
    event = ChainEvent(
        event_code="DISTRIBUTOR_RECEIVED" if discrepancy == 0 else "QUANTITY_DISCREPANCY_DETECTED",
        batch_id=batch.id,
        actor_name="Distributor Logistics Officer",
        actor_role="DISTRIBUTOR",
        organization_name=dist_org.name if dist_org else "Distributor",
        location_city=batch.current_location_city,
        quantity=verified,
        action_title="Received by Distributor" if discrepancy == 0 else f"⚠️ Handoff Quantity Discrepancy ({discrepancy} missing)",
        details=f"Declared {declared} units, verified {verified} units." + (f" Loss of {discrepancy} units flagged!" if discrepancy > 0 else ""),
        evidence_url=payload.receipt_photo_url,
        is_suspicious=(discrepancy > 0),
        timestamp=datetime.utcnow()
    )
    db.add(event)

    # Trigger alert if discrepancy exists
    if discrepancy > 0:
        alert = Alert(
            alert_code=f"ALT-DISC-{uuid.uuid4().hex[:6].upper()}",
            alert_type="QUANTITY_DISCREPANCY",
            severity="HIGH" if discrepancy > 20 else "MEDIUM",
            batch_id=batch.id,
            title=f"Quantity Discrepancy Flagged: Batch {batch.batch_number}",
            reason=f"Retailer declared {declared} units; Distributor verified {verified} units ({discrepancy} units missing in transit).",
            location_city=batch.current_location_city,
            status="OPEN",
            recommended_action="Conduct transit audit with courier service and verify package weight seals.",
            timestamp=datetime.utcnow()
        )
        db.add(alert)

    # Re-calculate risk score
    score, level, _ = RiskScorer.calculate_risk(batch)
    batch.risk_score = score

    db.commit()

    return {
        "status": "SUCCESS",
        "has_discrepancy": (discrepancy > 0),
        "discrepancy_count": discrepancy,
        "batch": BatchService.enrich_batch_dict(batch, db)
    }
