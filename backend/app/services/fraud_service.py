from datetime import datetime
import uuid
from sqlalchemy.orm import Session
from app.models.models import Batch, ChainEvent, Alert, Investigation
from app.risk_engine.risk_scorer import RiskScorer

class FraudService:
    @staticmethod
    def process_reentry_scan(batch_number: str, scanning_pharmacy: str, city: str, db: Session):
        batch = db.query(Batch).filter(Batch.batch_number == batch_number).first()
        if not batch:
            return {"status": "NOT_FOUND", "message": f"Batch {batch_number} not found in central registry."}

        # Check if batch has entered return/destruction pipeline
        terminal_states = [
            "RETURN_REQUESTED", "PICKUP_SCHEDULED", "DISTRIBUTOR_RECEIVED",
            "MANUFACTURER_RECEIVED", "DESTRUCTION_PENDING", "DESTROYED", "CERTIFICATE_VERIFIED"
        ]

        if batch.status in terminal_states:
            # Re-entry fraud detected!
            event = ChainEvent(
                event_code="REENTRY_DETECTED",
                batch_id=batch.id,
                actor_name=f"Billing Terminal / POS",
                actor_role="RETAILER",
                organization_name=scanning_pharmacy,
                location_city=city,
                quantity=batch.return_quantity or 470,
                action_title="🚨 Unauthorized Re-Entry Scan Detected",
                details=f"Batch {batch.batch_number} was scanned at {scanning_pharmacy} ({city}) after entering return/destruction status ({batch.status}).",
                is_suspicious=True,
                timestamp=datetime.utcnow()
            )
            db.add(event)

            # Generate Alert
            alert_code = f"ALT-{uuid.uuid4().hex[:6].upper()}"
            alert = Alert(
                alert_code=alert_code,
                alert_type="RE_ENTRY",
                severity="CRITICAL",
                batch_id=batch.id,
                title=f"CRITICAL RE-ENTRY FRAUD: Batch {batch.batch_number}",
                reason=f"Batch {batch.batch_number} marked as {batch.status} was attempted to be scanned into active inventory/billing at {scanning_pharmacy} in {city}.",
                location_city=city,
                status="OPEN",
                recommended_action="Block point-of-sale billing immediately. Quarantined stock and notify State Drug Control Authority.",
                timestamp=datetime.utcnow()
            )
            db.add(alert)

            # Generate or Update Investigation
            investigation = db.query(Investigation).filter(Investigation.batch_id == batch.id).first()
            if not investigation:
                inv_code = f"INV-{uuid.uuid4().hex[:6].upper()}"
                investigation = Investigation(
                    investigation_code=inv_code,
                    batch_id=batch.id,
                    status="OPEN",
                    priority="CRITICAL",
                    assigned_to="Drug Controller Anti-Counterfeiting Cell",
                    findings=f"Illegal inventory re-entry detected at {scanning_pharmacy}, {city}. Batch was previously verified destroyed.",
                    actions_taken="Immediate quarantine alert dispatched; retailer portal locked for this batch code."
                )
                db.add(investigation)

            # Update batch status and score
            score, level, _ = RiskScorer.calculate_risk(batch)
            batch.risk_score = max(score, 94)
            db.commit()
            db.refresh(batch)

            return {
                "status": "BLOCKED",
                "alert_code": alert_code,
                "risk_score": batch.risk_score,
                "message": f"🚨 BLOCKED ACTION! Batch {batch_number} has already entered disposal. Re-entry fraud recorded and flagged for investigation."
            }

        return {"status": "NORMAL", "message": f"Batch {batch_number} scan valid."}
