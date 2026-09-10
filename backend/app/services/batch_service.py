from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.models import Batch, ChainEvent, DestructionCertificate, Alert, Investigation, Handoff, ReturnRequest
from app.risk_engine.risk_scorer import RiskScorer
from app.risk_engine.explanations import ExplanationGenerator

class BatchService:
    @staticmethod
    def calculate_expiry_state(expiry_date_str: str) -> Dict[str, Any]:
        """
        > 60 days       NORMAL
        30–60 days      NEAR EXPIRY
        1–30 days       CRITICAL NEAR EXPIRY
        0 days          EXPIRING TODAY
        < 0 days        EXPIRED
        """
        try:
            exp = datetime.strptime(expiry_date_str, "%Y-%m-%d")
            today = datetime.utcnow()
            days_remaining = (exp - today).days
        except Exception:
            days_remaining = 30  # Fallback

        if days_remaining > 60:
            state = "NORMAL"
        elif 30 <= days_remaining <= 60:
            state = "NEAR_EXPIRY"
        elif 1 <= days_remaining < 30:
            state = "CRITICAL_NEAR_EXPIRY"
        elif days_remaining == 0:
            state = "EXPIRING_TODAY"
        else:
            state = "EXPIRED"

        return {"days_remaining": days_remaining, "expiry_state": state}

    @staticmethod
    def enrich_batch_dict(batch: Batch, db: Session) -> Dict[str, Any]:
        exp_info = BatchService.calculate_expiry_state(batch.expiry_date)
        score, level, anomalies = RiskScorer.calculate_risk(batch)
        reasons = ExplanationGenerator.generate_explanation(batch)

        # Update cached risk score if changed
        if batch.risk_score != score:
            batch.risk_score = score
            db.commit()

        # Build quantity flow visualization data
        quantity_flow = [
            {"step": "Original Mfg", "quantity": batch.original_quantity, "location": "Manufacturer Plant", "flag": False},
        ]
        
        for event in batch.events:
            flag = "DISCREPANCY" in event.event_code or "REENTRY" in event.event_code or event.is_suspicious
            quantity_flow.append({
                "step": event.action_title,
                "quantity": event.quantity,
                "location": event.location_city,
                "flag": flag,
                "actor": event.actor_name
            })

        # Compliance status breakdown
        has_return = len(batch.returns) > 0
        has_distributor = any("DISTRIBUTOR" in e.event_code for e in batch.events)
        has_manufacturer = any("MANUFACTURER" in e.event_code for e in batch.events)
        has_destruction = any("DESTROYED" in e.event_code for e in batch.events)
        has_cert = len(batch.certificates) > 0 and batch.certificates[0].verification_status == "VERIFIED"
        
        discrepancies = [h for h in batch.handoffs if h.discrepancy_count > 0]
        reentry = any(e.event_code == "REENTRY_DETECTED" for e in batch.events)

        overall_compliance = "COMPLIANT"
        if reentry or any(c.verification_status != "VERIFIED" for c in batch.certificates) or len(discrepancies) > 0:
            overall_compliance = "NON_COMPLIANT"
        elif not has_cert and batch.status in ["DESTROYED", "DESTRUCTION_PENDING"]:
            overall_compliance = "PENDING_CERTIFICATE"

        compliance_summary = {
            "return_compliance": "COMPLIANT" if has_return else "NOT_STARTED",
            "handoff_compliance": "WARNING_DISCREPANCY" if len(discrepancies) > 0 else ("COMPLIANT" if has_distributor else "PENDING"),
            "destruction_compliance": "COMPLIANT" if has_destruction else "PENDING",
            "certificate_compliance": "VERIFIED" if has_cert else ("MISMATCH" if len(batch.certificates) > 0 else "MISSING"),
            "overall_compliance": overall_compliance
        }

        batch_dict = {
            "id": batch.id,
            "batch_number": batch.batch_number,
            "product_id": batch.product_id,
            "product_name": batch.product.name if batch.product else "Unknown Product",
            "generic_name": batch.product.generic_name if batch.product else "",
            "mfg_date": batch.mfg_date,
            "expiry_date": batch.expiry_date,
            "days_remaining": exp_info["days_remaining"],
            "expiry_state": exp_info["expiry_state"],
            "pack_size": batch.pack_size,
            "original_quantity": batch.original_quantity,
            "current_quantity": batch.current_quantity,
            "return_quantity": batch.return_quantity,
            "current_owner_id": batch.current_owner_id,
            "current_owner_name": batch.current_owner.name if batch.current_owner else "Unknown Org",
            "current_location_city": batch.current_location_city,
            "status": batch.status,
            "risk_score": score,
            "risk_level": level,
            "created_at": batch.created_at,
            "updated_at": batch.updated_at,
            "suspicious_reasons": reasons,
            "compliance_summary": compliance_summary,
            "quantity_flow": quantity_flow,
            "product": {
                "id": batch.product.id,
                "name": batch.product.name,
                "generic_name": batch.product.generic_name,
                "dosage_form": batch.product.dosage_form,
                "manufacturer_name": batch.product.manufacturer_name
            } if batch.product else None,
            "current_owner": {
                "id": batch.current_owner.id,
                "name": batch.current_owner.name,
                "org_type": batch.current_owner.org_type,
                "location_city": batch.current_owner.location_city,
                "location_state": batch.current_owner.location_state,
                "lat": batch.current_owner.lat,
                "lng": batch.current_owner.lng
            } if batch.current_owner else None,
            "events": [
                {
                    "id": e.id,
                    "event_code": e.event_code,
                    "batch_id": e.batch_id,
                    "actor_name": e.actor_name,
                    "actor_role": e.actor_role,
                    "organization_name": e.organization_name,
                    "location_city": e.location_city,
                    "quantity": e.quantity,
                    "action_title": e.action_title,
                    "details": e.details,
                    "evidence_url": e.evidence_url,
                    "is_suspicious": e.is_suspicious,
                    "timestamp": e.timestamp
                } for e in batch.events
            ],
            "certificates": [
                {
                    "id": c.id,
                    "certificate_id": c.certificate_id,
                    "batch_id": c.batch_id,
                    "return_code": c.return_code,
                    "declared_batch_number": c.declared_batch_number,
                    "quantity_destroyed": c.quantity_destroyed,
                    "destruction_date": c.destruction_date,
                    "waste_facility_name": c.waste_facility_name,
                    "certificate_file_url": c.certificate_file_url,
                    "verification_status": c.verification_status,
                    "mismatch_reason": c.mismatch_reason,
                    "created_at": c.created_at
                } for c in batch.certificates
            ],
            "alerts": [
                {
                    "id": a.id,
                    "alert_code": a.alert_code,
                    "alert_type": a.alert_type,
                    "severity": a.severity,
                    "batch_id": a.batch_id,
                    "title": a.title,
                    "reason": a.reason,
                    "location_city": a.location_city,
                    "status": a.status,
                    "recommended_action": a.recommended_action,
                    "timestamp": a.timestamp
                } for a in batch.alerts
            ]
        }

        return batch_dict
