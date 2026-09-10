from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Investigation, Batch, ChainEvent, Alert
from app.services.batch_service import BatchService

router = APIRouter(prefix="/investigations", tags=["Investigations"])

@router.get("")
def list_investigations(db: Session = Depends(get_db)):
    invs = db.query(Investigation).order_by(Investigation.updated_at.desc()).all()
    results = []
    for inv in invs:
        batch = db.query(Batch).filter(Batch.id == inv.batch_id).first()
        enriched_batch = BatchService.enrich_batch_dict(batch, db) if batch else None
        results.append({
            "id": inv.id,
            "investigation_code": inv.investigation_code,
            "batch_id": inv.batch_id,
            "batch_number": batch.batch_number if batch else "Unknown",
            "product_name": batch.product.name if batch and batch.product else "Unknown",
            "risk_score": enriched_batch["risk_score"] if enriched_batch else 0,
            "risk_level": enriched_batch["risk_level"] if enriched_batch else "LOW",
            "status": inv.status,
            "priority": inv.priority,
            "assigned_to": inv.assigned_to,
            "findings": inv.findings,
            "actions_taken": inv.actions_taken,
            "created_at": inv.created_at,
            "updated_at": inv.updated_at
        })
    return results

@router.put("/{inv_id}")
def update_investigation(inv_id: int, status: str, findings: str, actions_taken: str, db: Session = Depends(get_db)):
    inv = db.query(Investigation).filter(Investigation.id == inv_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")
    inv.status = status
    inv.findings = findings
    inv.actions_taken = actions_taken
    db.commit()
    return {"status": "SUCCESS", "message": f"Investigation {inv.investigation_code} updated."}

@router.post("/batch/{batch_id}/dispatch-inspector")
def dispatch_inspector(batch_id: int, db: Session = Depends(get_db)):
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    event = ChainEvent(
        event_code="INSPECTOR_DISPATCHED",
        batch_id=batch.id,
        actor_name="CDSCO Anti-Counterfeiting Cell",
        actor_role="INVESTIGATOR",
        organization_name="State Drug Control Inspectorate",
        location_city=batch.current_location_city,
        quantity=batch.current_quantity,
        action_title="🚔 State Drug Inspector Dispatched",
        details=f"State Drug Inspector dispatched to {batch.current_owner_name} ({batch.current_location_city}) for physical audit of Batch {batch.batch_number}.",
        is_suspicious=True,
        timestamp=datetime.utcnow()
    )
    db.add(event)

    inv = db.query(Investigation).filter(Investigation.batch_id == batch.id).first()
    if inv:
        inv.actions_taken = (inv.actions_taken or "") + f" | Inspector dispatched to {batch.current_location_city} on {datetime.utcnow().strftime('%Y-%m-%d')}."
        inv.status = "IN_PROGRESS"

    db.commit()
    return {
        "status": "SUCCESS",
        "message": f"State Drug Inspector dispatched for Batch {batch.batch_number} at {batch.current_location_city}.",
        "batch": BatchService.enrich_batch_dict(batch, db)
    }

@router.post("/batch/{batch_id}/quarantine")
def quarantine_stock(batch_id: int, db: Session = Depends(get_db)):
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    batch.status = "QUARANTINED"

    event = ChainEvent(
        event_code="QUARANTINE_ISSUED",
        batch_id=batch.id,
        actor_name="State Drug Controller",
        actor_role="INVESTIGATOR",
        organization_name="CDSCO Regulatory Authority",
        location_city=batch.current_location_city,
        quantity=batch.current_quantity,
        action_title="🔒 Mandatory Stock Quarantine Order Issued",
        details=f"Official quarantine order served for Batch {batch.batch_number} at {batch.current_owner_name}. All billing & distribution blocked.",
        is_suspicious=True,
        timestamp=datetime.utcnow()
    )
    db.add(event)

    inv = db.query(Investigation).filter(Investigation.batch_id == batch.id).first()
    if inv:
        inv.actions_taken = (inv.actions_taken or "") + " | Regulatory quarantine order served. Inventory locked."
        inv.status = "IN_PROGRESS"
        inv.priority = "CRITICAL"

    db.commit()
    return {
        "status": "SUCCESS",
        "message": f"Stock quarantine order issued for Batch {batch.batch_number} at {batch.current_owner_name}.",
        "batch": BatchService.enrich_batch_dict(batch, db)
    }
