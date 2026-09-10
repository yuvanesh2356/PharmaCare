from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Alert, Batch
from app.schemas.schemas import AlertSchema

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("")
def get_alerts(
    alert_type: Optional[str] = None,
    severity: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Alert)
    if alert_type:
        query = query.filter(Alert.alert_type == alert_type)
    if severity:
        query = query.filter(Alert.severity == severity)
    
    alerts = query.order_by(Alert.timestamp.desc()).all()
    results = []
    for a in alerts:
        batch = db.query(Batch).filter(Batch.id == a.batch_id).first()
        results.append({
            "id": a.id,
            "alert_code": a.alert_code,
            "alert_type": a.alert_type,
            "severity": a.severity,
            "batch_id": a.batch_id,
            "batch_number": batch.batch_number if batch else "Unknown",
            "product_name": batch.product.name if batch and batch.product else "Unknown",
            "title": a.title,
            "reason": a.reason,
            "location_city": a.location_city,
            "status": a.status,
            "recommended_action": a.recommended_action,
            "timestamp": a.timestamp
        })
    return results

@router.post("/{alert_id}/resolve")
def resolve_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.status = "RESOLVED"
    db.commit()
    return {"status": "SUCCESS", "message": f"Alert {alert.alert_code} resolved."}
