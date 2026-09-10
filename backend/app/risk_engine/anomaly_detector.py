from typing import List, Dict, Any
from app.models.models import Batch, ChainEvent, DestructionCertificate, ReturnRequest, Handoff

class AnomalyDetector:
    """
    Deterministic anomaly detector analyzing batch digital twin chain events,
    handoffs, certificates, and scan locations.
    """
    @staticmethod
    def detect_anomalies(batch: Batch) -> List[Dict[str, Any]]:
        anomalies = []

        # 1. Re-entry Fraud (Highest Severity - 54 pts base for critical fraud)
        reentry_events = [e for e in batch.events if e.event_code == "REENTRY_DETECTED"]
        if reentry_events or (batch.status in ["DESTROYED", "CERTIFICATE_VERIFIED"] and any(
            e.event_code == "REENTRY_DETECTED" or e.is_suspicious for e in batch.events
        )):
            anomalies.append({
                "type": "RE_ENTRY",
                "points": 54,
                "title": "Unauthorized Re-Entry Detected",
                "description": "This batch was scanned into retail POS/inventory after entering the disposal/destruction pipeline."
            })

        # 2. Certificate Inconsistencies / Mismatch
        for cert in batch.certificates:
            if cert.verification_status == "MISMATCH_SUSPECTED" or cert.mismatch_reason:
                anomalies.append({
                    "type": "CERTIFICATE_MISMATCH",
                    "points": 30,
                    "title": "Destruction Certificate Mismatch",
                    "description": cert.mismatch_reason or f"Certificate #{cert.certificate_id} contains batch or quantity inconsistencies."
                })
            elif cert.declared_batch_number != batch.batch_number:
                anomalies.append({
                    "type": "CERTIFICATE_MISMATCH",
                    "points": 30,
                    "title": "Certificate Batch Number Mismatch",
                    "description": f"Certificate specifies Batch '{cert.declared_batch_number}' but batch twin is '{batch.batch_number}'."
                })
            elif cert.quantity_destroyed > batch.original_quantity:
                anomalies.append({
                    "type": "CERTIFICATE_MISMATCH",
                    "points": 30,
                    "title": "Destruction Quantity Exceeds Original Quantity",
                    "description": f"Certificate specifies {cert.quantity_destroyed} units destroyed, exceeding original quantity of {batch.original_quantity}."
                })

        # 3. Duplicate Custody Conflict
        active_scans = [e for e in batch.events if "RECEIVED" in e.event_code or "SCAN" in e.event_code]
        cities_scanned = set(e.location_city for e in active_scans)
        if len(cities_scanned) > 2 and (reentry_events or batch.status in ["DESTROYED", "CERTIFICATE_VERIFIED"]):
            anomalies.append({
                "type": "CUSTODY_CONFLICT",
                "points": 20,
                "title": "Concurrent / Out-of-Sequence Custody Jump",
                "description": f"Batch active scans recorded across disjoint locations: {', '.join(cities_scanned)}."
            })

        # 4. Quantity Discrepancy Flow
        handoff_discrepancies = [h for h in batch.handoffs if h.discrepancy_count > 0 or h.status == "DISCREPANCY_FLAGGED"]
        for h in handoff_discrepancies:
            anomalies.append({
                "type": "QUANTITY_DISCREPANCY",
                "points": 20,
                "title": f"Quantity Discrepancy at Handoff",
                "description": f"Declared {h.declared_quantity} units but only {h.verified_quantity} units verified (Loss of {h.discrepancy_count} units)."
            })

        # 5. Unexpected Location Movement
        if any(e.event_code == "UNEXPECTED_LOCATION_DETECTED" for e in batch.events):
            anomalies.append({
                "type": "LOCATION_ANOMALY",
                "points": 20,
                "title": "Unexpected Geographic Movement",
                "description": "Batch physical scan location deviates from authorized distributor chain route."
            })

        # 6. Timeline Anomaly
        if any(e.event_code == "TIMELINE_ANOMALY" for e in batch.events):
            anomalies.append({
                "type": "TIMELINE_ANOMALY",
                "points": 15,
                "title": "Impossible Custody Transition Speed",
                "description": "Handoff timestamp between distant facilities occurred faster than physical transport permits."
            })

        return anomalies
