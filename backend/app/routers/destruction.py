import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Batch, DestructionCertificate, ChainEvent, Alert, Organization
from app.schemas.schemas import CertificateUploadRequest
from app.services.batch_service import BatchService
from app.risk_engine.risk_scorer import RiskScorer

router = APIRouter(prefix="/destruction", tags=["Destruction"])

@router.post("/manufacturer-receive/{batch_id}")
def manufacturer_receive(batch_id: int, db: Session = Depends(get_db)):
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    mfg_org = db.query(Organization).filter(Organization.org_type == "MANUFACTURER").first()
    if mfg_org:
        batch.current_owner_id = mfg_org.id
        batch.current_location_city = mfg_org.location_city

    batch.status = "MANUFACTURER_RECEIVED"

    event = ChainEvent(
        event_code="MANUFACTURER_RECEIVED",
        batch_id=batch.id,
        actor_name="Factory Quality Head",
        actor_role="MANUFACTURER",
        organization_name=mfg_org.name if mfg_org else "Manufacturer Plant",
        location_city=batch.current_location_city,
        quantity=batch.current_quantity,
        action_title="Received by Manufacturer Plant",
        details=f"Batch {batch.batch_number} received from distributor and logged for disposal.",
        timestamp=datetime.utcnow()
    )
    db.add(event)
    db.commit()

    return {"status": "SUCCESS", "batch": BatchService.enrich_batch_dict(batch, db)}

@router.post("/upload-certificate")
def upload_certificate(payload: CertificateUploadRequest, db: Session = Depends(get_db)):
    batch = db.query(Batch).filter(Batch.id == payload.batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    # Business Gate: Check if batch has valid return custody before accepting destruction certificate
    allowed_statuses = ["DISTRIBUTOR_RECEIVED", "MANUFACTURER_RECEIVED", "DESTRUCTION_PENDING", "DESTROYED", "CERTIFICATE_VERIFIED"]
    if batch.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot upload destruction certificate for batch in '{batch.status}' state. Stock must first be received by distributor/manufacturer."
        )

    mismatch_reason = None
    verification_status = "VERIFIED"

    # Validation Checks
    if payload.declared_batch_number.strip().upper() != batch.batch_number.strip().upper():
        verification_status = "MISMATCH_SUSPECTED"
        mismatch_reason = f"Certificate specifies Batch '{payload.declared_batch_number}', but digital twin is '{batch.batch_number}'."

    elif payload.quantity_destroyed > batch.original_quantity:
        verification_status = "MISMATCH_SUSPECTED"
        mismatch_reason = f"Certificate declared {payload.quantity_destroyed} units destroyed, which exceeds original batch size of {batch.original_quantity}."

    # Look up return code if not explicitly provided
    return_code = payload.return_code
    if not return_code and batch.returns:
        return_code = batch.returns[0].return_code

    cert = DestructionCertificate(
        certificate_id=payload.certificate_id,
        batch_id=batch.id,
        return_code=return_code,
        declared_batch_number=payload.declared_batch_number,
        quantity_destroyed=payload.quantity_destroyed,
        destruction_date=payload.destruction_date,
        waste_facility_name=payload.waste_facility_name,
        certificate_file_url=payload.certificate_file_url or "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=500&q=80",
        verification_status=verification_status,
        mismatch_reason=mismatch_reason
    )
    db.add(cert)

    if verification_status == "VERIFIED":
        batch.status = "CERTIFICATE_VERIFIED"
        waste_org = db.query(Organization).filter(Organization.org_type == "WASTE_FACILITY").first()
        if waste_org:
            batch.current_owner_id = waste_org.id
            batch.current_location_city = waste_org.location_city
    else:
        batch.status = "DESTRUCTION_PENDING"

    # Log destruction chain event
    e_destroy = ChainEvent(
        event_code="DESTROYED",
        batch_id=batch.id,
        actor_name="Pollution Control Supervisor",
        actor_role="WASTE_FACILITY",
        organization_name=payload.waste_facility_name,
        location_city=batch.current_location_city,
        quantity=payload.quantity_destroyed,
        action_title="Authorized Incineration Executed",
        details=f"Destruction of {payload.quantity_destroyed} units carried out at {payload.waste_facility_name}.",
        timestamp=datetime.utcnow()
    )
    db.add(e_destroy)

    # Log certificate chain event
    e_cert = ChainEvent(
        event_code="CERTIFICATE_UPLOADED" if verification_status == "VERIFIED" else "CERTIFICATE_MISMATCH_DETECTED",
        batch_id=batch.id,
        actor_name="Compliance Verification Bot",
        actor_role="INVESTIGATOR",
        organization_name="State Drug Controller Registry",
        location_city=batch.current_location_city,
        quantity=payload.quantity_destroyed,
        action_title=f"Destruction Certificate Linked (#{payload.certificate_id})" if verification_status == "VERIFIED" else "⚠️ Certificate Mismatch Detected",
        details=f"Certificate #{payload.certificate_id} verified." if verification_status == "VERIFIED" else mismatch_reason,
        evidence_url=payload.certificate_file_url,
        is_suspicious=(verification_status != "VERIFIED"),
        timestamp=datetime.utcnow()
    )
    db.add(e_cert)

    if verification_status != "VERIFIED":
        alert = Alert(
            alert_code=f"ALT-CERT-{uuid.uuid4().hex[:6].upper()}",
            alert_type="CERTIFICATE_MISMATCH",
            severity="HIGH",
            batch_id=batch.id,
            title=f"Destruction Certificate Mismatch: Batch {batch.batch_number}",
            reason=mismatch_reason,
            location_city=batch.current_location_city,
            status="OPEN",
            recommended_action="Audit waste facility logs and cross-verify physical destruction receipts.",
            timestamp=datetime.utcnow()
        )
        db.add(alert)

    # Recalculate risk score
    score, level, _ = RiskScorer.calculate_risk(batch)
    batch.risk_score = score

    db.commit()

    return {
        "status": "SUCCESS",
        "verification_status": verification_status,
        "mismatch_reason": mismatch_reason,
        "batch": BatchService.enrich_batch_dict(batch, db)
    }
