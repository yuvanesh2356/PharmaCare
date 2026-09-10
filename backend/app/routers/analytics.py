from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Batch, Alert, Handoff, ReturnRequest, DestructionCertificate
from app.services.batch_service import BatchService

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    batches = db.query(Batch).all()
    
    total_batches = len(batches)
    normal_count = 0
    near_expiry_count = 0
    expired_count = 0
    pending_returns = 0
    destroyed_count = 0
    high_risk_count = 0
    critical_risk_count = 0

    for b in batches:
        enriched = BatchService.enrich_batch_dict(b, db)
        state = enriched["expiry_state"]
        if state == "NORMAL":
            normal_count += 1
        elif state in ["NEAR_EXPIRY", "CRITICAL_NEAR_EXPIRY", "EXPIRING_TODAY"]:
            near_expiry_count += 1
        elif state == "EXPIRED":
            expired_count += 1

        if b.status == "RETURN_REQUESTED":
            pending_returns += 1
        elif b.status in ["DESTROYED", "CERTIFICATE_VERIFIED"]:
            destroyed_count += 1

        if enriched["risk_score"] >= 75:
            critical_risk_count += 1
        elif enriched["risk_score"] >= 50:
            high_risk_count += 1

    total_alerts = db.query(Alert).count()
    reentry_alerts = db.query(Alert).filter(Alert.alert_type == "RE_ENTRY").count()
    quantity_discrepancies = db.query(Handoff).filter(Handoff.discrepancy_count > 0).count()
    verified_certs = db.query(DestructionCertificate).filter(DestructionCertificate.verification_status == "VERIFIED").count()

    # Risk distribution chart data
    risk_distribution = [
        {"name": "Low (0-24)", "count": sum(1 for b in batches if b.risk_score < 25), "fill": "#10B981"},
        {"name": "Medium (25-49)", "count": sum(1 for b in batches if 25 <= b.risk_score < 50), "fill": "#F59E0B"},
        {"name": "High (50-74)", "count": sum(1 for b in batches if 50 <= b.risk_score < 75), "fill": "#EF4444"},
        {"name": "Critical (75-100)", "count": sum(1 for b in batches if b.risk_score >= 75), "fill": "#7C3AED"}
    ]

    # Status distribution
    status_distribution = [
        {"name": "Active Stock", "value": sum(1 for b in batches if b.status == "ACTIVE")},
        {"name": "Return Requested", "value": pending_returns},
        {"name": "In Transit", "value": sum(1 for b in batches if b.status in ["PICKUP_SCHEDULED", "DISTRIBUTOR_RECEIVED", "MANUFACTURER_RECEIVED"])},
        {"name": "Destroyed & Certified", "value": destroyed_count}
    ]

    # Overall CDSCO Compliance Rate
    compliant_batches = sum(1 for b in batches if b.risk_score < 50 and b.status in ["ACTIVE", "CERTIFICATE_VERIFIED"])
    compliance_rate = round((compliant_batches / total_batches * 100), 1) if total_batches > 0 else 100.0

    return {
        "total_batches": total_batches,
        "normal_count": normal_count,
        "near_expiry_count": near_expiry_count,
        "expired_count": expired_count,
        "pending_returns": pending_returns,
        "destroyed_count": destroyed_count,
        "high_risk_count": high_risk_count,
        "critical_risk_count": critical_risk_count,
        "total_alerts": total_alerts,
        "reentry_alerts": reentry_alerts,
        "quantity_discrepancies": quantity_discrepancies,
        "verified_certificates": verified_certs,
        "compliance_rate": compliance_rate,
        "risk_distribution": risk_distribution,
        "status_distribution": status_distribution
    }
