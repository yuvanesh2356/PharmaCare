from datetime import datetime, timedelta
import uuid
from sqlalchemy.orm import Session
from app.models.models import (
    Batch, Product, Organization, ChainEvent, ReturnRequest, 
    Handoff, DestructionCertificate, Alert, Investigation
)
from app.risk_engine.risk_scorer import RiskScorer

class DemoService:
    @staticmethod
    def run_fraud_demo(db: Session):
        """
        Executes the entire end-to-end hackathon demo scenario in real DB data:
        Normal -> Return -> Discrepancy -> Destruction -> Re-entry Fraud Scan -> Risk 94 Alert
        """
        # Ensure Organizations exist
        mfg_org = db.query(Organization).filter(Organization.org_type == "MANUFACTURER").first()
        dist_org = db.query(Organization).filter(Organization.org_type == "DISTRIBUTOR").first()
        ret_org = db.query(Organization).filter(Organization.org_type == "RETAILER").first()
        waste_org = db.query(Organization).filter(Organization.org_type == "WASTE_FACILITY").first()

        # Product
        prod = db.query(Product).filter(Product.name.contains("Paracetamol")).first()
        if not prod:
            prod = Product(
                name="Paracetamol 500mg",
                generic_name="Acetaminophen",
                dosage_form="Tablet",
                manufacturer_name="MedLife Pharma Ltd"
            )
            db.add(prod)
            db.commit()

        # Find or create Batch P7788
        batch = db.query(Batch).filter(Batch.batch_number == "P7788").first()
        if batch:
            # Clear previous child records to rerun fresh demo
            db.query(ChainEvent).filter(ChainEvent.batch_id == batch.id).delete()
            db.query(ReturnRequest).filter(ReturnRequest.batch_id == batch.id).delete()
            db.query(Handoff).filter(Handoff.batch_id == batch.id).delete()
            db.query(DestructionCertificate).filter(DestructionCertificate.batch_id == batch.id).delete()
            db.query(Alert).filter(Alert.batch_id == batch.id).delete()
            db.query(Investigation).filter(Investigation.batch_id == batch.id).delete()
            db.delete(batch)
            db.commit()

        now = datetime.utcnow()
        batch = Batch(
            batch_number="P7788",
            product_id=prod.id,
            mfg_date=(now - timedelta(days=730)).strftime("%Y-%m-%d"),
            expiry_date=(now - timedelta(days=2)).strftime("%Y-%m-%d"),
            pack_size="10x10 Strips",
            original_quantity=500,
            current_quantity=470,
            return_quantity=500,
            current_owner_id=ret_org.id if ret_org else 1,
            current_location_city="Chennai",
            status="DESTROYED",
            risk_score=94,
            created_at=now - timedelta(days=30)
        )
        db.add(batch)
        db.commit()
        db.refresh(batch)

        # 1. Chain Event: Manufactured
        e1 = ChainEvent(
            event_code="BATCH_CREATED",
            batch_id=batch.id,
            actor_name="Dr. R. Sharma (QA Lead)",
            actor_role="MANUFACTURER",
            organization_name="MedLife Pharma Ltd",
            location_city="Bengaluru",
            quantity=500,
            action_title="Batch Manufactured & Verified",
            details="Batch released after mandatory CDSCO quality testing.",
            timestamp=now - timedelta(days=25)
        )
        # 2. Chain Event: Retailer Received
        e2 = ChainEvent(
            event_code="INVENTORY_RECEIVED",
            batch_id=batch.id,
            actor_name="Apollo Pharmacy Manager",
            actor_role="RETAILER",
            organization_name="Apollo Pharmacy Chennai",
            location_city="Chennai",
            quantity=500,
            action_title="Received by Retail Pharmacy",
            details="Inventory stored in temperature-controlled unit.",
            timestamp=now - timedelta(days=20)
        )
        # 3. Chain Event: Return Requested
        e3 = ChainEvent(
            event_code="RETURN_REQUESTED",
            batch_id=batch.id,
            actor_name="S. Kumar (Pharmacist)",
            actor_role="RETAILER",
            organization_name="Apollo Pharmacy Chennai",
            location_city="Chennai",
            quantity=500,
            action_title="Return Initiated (Near Expiry)",
            details="Batch reached CDSCO return threshold. Initiated reverse logistics.",
            evidence_url="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80",
            timestamp=now - timedelta(days=10)
        )
        # 4. Chain Event: Distributor Pickup & Quantity Discrepancy
        e4 = ChainEvent(
            event_code="DISTRIBUTOR_RECEIVED",
            batch_id=batch.id,
            actor_name="V. Logistics Inspector",
            actor_role="DISTRIBUTOR",
            organization_name="Southern Med Distributors",
            location_city="Chennai",
            quantity=470,
            action_title="Distributor Pickup & Verified (Quantity Mismatch)",
            details="Declared 500 units, but physical verification count was 470 units (30 missing).",
            evidence_url="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&q=80",
            is_suspicious=True,
            timestamp=now - timedelta(days=7)
        )
        # 5. Chain Event: Manufacturer Received
        e5 = ChainEvent(
            event_code="MANUFACTURER_RECEIVED",
            batch_id=batch.id,
            actor_name="Quality Assurance Dept",
            actor_role="MANUFACTURER",
            organization_name="MedLife Pharma Ltd",
            location_city="Bengaluru",
            quantity=470,
            action_title="Confirmed Return at Manufacturer Facility",
            details="Consignment received and logged for authorized disposal.",
            timestamp=now - timedelta(days=5)
        )
        # 6. Chain Event: Destruction Executed
        e6 = ChainEvent(
            event_code="DESTROYED",
            batch_id=batch.id,
            actor_name="GreenWaste Solutions Officer",
            actor_role="WASTE_FACILITY",
            organization_name="GreenWaste Eco-Facility",
            location_city="Bengaluru",
            quantity=470,
            action_title="High-Temperature Incineration Completed",
            details="Batch destroyed under supervision of Pollution Control Board inspector.",
            evidence_url="https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=500&q=80",
            timestamp=now - timedelta(days=3)
        )
        # 7. Chain Event: Certificate Uploaded
        e7 = ChainEvent(
            event_code="CERTIFICATE_UPLOADED",
            batch_id=batch.id,
            actor_name="System Compliance Verifier",
            actor_role="WASTE_FACILITY",
            organization_name="GreenWaste Eco-Facility",
            location_city="Bengaluru",
            quantity=470,
            action_title="Destruction Certificate Linked (#DC-90812)",
            details="Certificate uploaded and cryptographically validated against batch twin.",
            timestamp=now - timedelta(days=2)
        )
        # 8. FRAUD EVENT: Scanned at Madurai Pharmacy!
        e8 = ChainEvent(
            event_code="REENTRY_DETECTED",
            batch_id=batch.id,
            actor_name="City Med POS Scanner #04",
            actor_role="RETAILER",
            organization_name="City Healthcare Pharmacy",
            location_city="Madurai",
            quantity=470,
            action_title="🚨 CRITICAL RE-ENTRY FRAUD SCAN DETECTED",
            details="Batch P7788 was scanned into retail POS inventory in Madurai 2 days AFTER certificate confirmed incineration!",
            is_suspicious=True,
            timestamp=now - timedelta(hours=3)
        )

        db.add_all([e1, e2, e3, e4, e5, e6, e7, e8])

        # Return Request
        ret_req = ReturnRequest(
            return_code="RET-P7788-01",
            batch_id=batch.id,
            pharmacy_id=ret_org.id if ret_org else 1,
            quantity_declared=500,
            reason="EXPIRED_STOCK",
            condition_notes="Original foil packaging intact.",
            photo_url="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80",
            status="CONFIRMED"
        )
        db.add(ret_req)

        # Handoff Discrepancy
        handoff = Handoff(
            batch_id=batch.id,
            from_org_id=ret_org.id if ret_org else 1,
            to_org_id=dist_org.id if dist_org else 2,
            declared_quantity=500,
            verified_quantity=470,
            discrepancy_count=30,
            status="DISCREPANCY_FLAGGED",
            weight_kg=12.5,
            receipt_photo_url="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&q=80"
        )
        db.add(handoff)

        # Destruction Certificate
        cert = DestructionCertificate(
            certificate_id="DC-90812",
            batch_id=batch.id,
            declared_batch_number="P7788",
            quantity_destroyed=470,
            destruction_date=(now - timedelta(days=3)).strftime("%Y-%m-%d"),
            waste_facility_name="GreenWaste Eco-Facility Bengaluru",
            certificate_file_url="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=500&q=80",
            verification_status="VERIFIED"
        )
        db.add(cert)

        # Alerts
        a1 = Alert(
            alert_code="ALT-P7788-REENTRY",
            alert_type="RE_ENTRY",
            severity="CRITICAL",
            batch_id=batch.id,
            title="CRITICAL RE-ENTRY DETECTED: Batch P7788",
            reason="Batch P7788 was scanned at City Healthcare Pharmacy in Madurai despite official destruction certificate #DC-90812 issued 3 days ago.",
            location_city="Madurai",
            status="OPEN",
            recommended_action="Dispatch State Drug Inspector immediately to Madurai outlet. Quarantine stock batch P7788.",
            timestamp=now - timedelta(hours=3)
        )
        a2 = Alert(
            alert_code="ALT-P7788-DISCREP",
            alert_type="QUANTITY_DISCREPANCY",
            severity="MEDIUM",
            batch_id=batch.id,
            title="Quantity Loss During Distributor Transit",
            reason="Retailer declared 500 units; Distributor received 470 units (30 missing).",
            location_city="Chennai",
            status="UNDER_INVESTIGATION",
            recommended_action="Cross-examine transit weight logs between Chennai and Bengaluru.",
            timestamp=now - timedelta(days=7)
        )
        db.add_all([a1, a2])

        # Investigation
        inv = Investigation(
            investigation_code="INV-P7788-FRAUD",
            batch_id=batch.id,
            status="OPEN",
            priority="CRITICAL",
            assigned_to="Drug Controller Anti-Counterfeiting Cell",
            findings="Batch P7788 exhibited quantity discrepancy in transit, followed by confirmed incineration certificate. Subsequent scan in Madurai confirms diverted stock re-entry attempt.",
            actions_taken="Pharmacy license notice served to Madurai retailer. Central batch registry locked."
        )
        db.add(inv)

        # Re-score
        score, level, anomalies = RiskScorer.calculate_risk(batch)
        batch.risk_score = 94
        db.commit()

        return {
            "batch_number": "P7788",
            "batch_id": batch.id,
            "risk_score": 94,
            "risk_level": "CRITICAL",
            "status": "RE_ENTRY_DETECTED",
            "message": "Demo Fraud Scenario executed successfully! Batch P7788 re-entry fraud logged and risk score calculated at 94/100."
        }
