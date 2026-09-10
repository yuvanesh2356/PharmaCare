import bcrypt
from datetime import datetime, timedelta
from app.database import engine, Base, SessionLocal
from app.models.models import (
    User, Organization, Product, Batch, ChainEvent, 
    ReturnRequest, Handoff, DestructionCertificate, Alert, Investigation
)

DEMO_PASSWORD = "demo123"
DEMO_HASH = bcrypt.hashpw(DEMO_PASSWORD.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def seed_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # 1. Organizations
        mfg_org = Organization(
            name="MedLife Pharma Ltd",
            org_type="MANUFACTURER",
            location_city="Bengaluru",
            location_state="Karnataka",
            lat=12.9716,
            lng=77.5946,
            contact_email="compliance@medlife.com"
        )
        dist_org = Organization(
            name="Southern Med Distributors",
            org_type="DISTRIBUTOR",
            location_city="Chennai",
            location_state="Tamil Nadu",
            lat=13.0827,
            lng=80.2707,
            contact_email="logistics@southmed.com"
        )
        ret1_org = Organization(
            name="Apollo Pharmacy Chennai",
            org_type="RETAILER",
            location_city="Chennai",
            location_state="Tamil Nadu",
            lat=13.0604,
            lng=80.2496,
            contact_email="pharmacy.chennai@apollo.com"
        )
        ret2_org = Organization(
            name="City Healthcare Pharmacy",
            org_type="RETAILER",
            location_city="Madurai",
            location_state="Tamil Nadu",
            lat=9.9252,
            lng=78.1198,
            contact_email="citymed.madurai@gmail.com"
        )
        waste_org = Organization(
            name="GreenWaste Eco-Facility",
            org_type="WASTE_FACILITY",
            location_city="Bengaluru",
            location_state="Karnataka",
            lat=12.9141,
            lng=77.6412,
            contact_email="disposal@greenwaste.in"
        )

        db.add_all([mfg_org, dist_org, ret1_org, ret2_org, waste_org])
        db.commit()

        # 2. Users (Role-based demo credentials)
        u_ret = User(
            email="retailer@pharmachain.demo",
            hashed_password=DEMO_HASH,
            full_name="Rajesh Kumar (Pharmacist)",
            role="RETAILER",
            organization_id=ret1_org.id
        )
        u_ret_alias = User(
            email="retailer@demo.com",
            hashed_password=DEMO_HASH,
            full_name="Rajesh Kumar (Pharmacist)",
            role="RETAILER",
            organization_id=ret1_org.id
        )
        u_ret2 = User(
            email="retailer2@pharmachain.demo",
            hashed_password=DEMO_HASH,
            full_name="Priya Sharma (Retail Pharmacist)",
            role="RETAILER",
            organization_id=ret2_org.id
        )
        u_ret2_alias = User(
            email="retailer2@demo.com",
            hashed_password=DEMO_HASH,
            full_name="Priya Sharma (Retail Pharmacist)",
            role="RETAILER",
            organization_id=ret2_org.id
        )
        u_dist = User(
            email="distributor@pharmachain.demo",
            hashed_password=DEMO_HASH,
            full_name="Anand V. (Logistics Lead)",
            role="DISTRIBUTOR",
            organization_id=dist_org.id
        )
        u_dist_alias = User(
            email="distributor@demo.com",
            hashed_password=DEMO_HASH,
            full_name="Anand V. (Logistics Lead)",
            role="DISTRIBUTOR",
            organization_id=dist_org.id
        )
        u_mfg = User(
            email="manufacturer@pharmachain.demo",
            hashed_password=DEMO_HASH,
            full_name="Dr. Sunita Rao (QA Director)",
            role="MANUFACTURER",
            organization_id=mfg_org.id
        )
        u_mfg_alias = User(
            email="manufacturer@demo.com",
            hashed_password=DEMO_HASH,
            full_name="Dr. Sunita Rao (QA Director)",
            role="MANUFACTURER",
            organization_id=mfg_org.id
        )
        u_inv = User(
            email="investigator@pharmachain.demo",
            hashed_password=DEMO_HASH,
            full_name="Inspector S. Deshmukh (CDSCO)",
            role="INVESTIGATOR",
            organization_id=None
        )
        u_inv_alias = User(
            email="investigator@demo.com",
            hashed_password=DEMO_HASH,
            full_name="Inspector S. Deshmukh (CDSCO)",
            role="INVESTIGATOR",
            organization_id=None
        )

        db.add_all([
            u_ret, u_ret_alias,
            u_ret2, u_ret2_alias,
            u_dist, u_dist_alias,
            u_mfg, u_mfg_alias,
            u_inv, u_inv_alias
        ])
        db.commit()

        # 3. Products
        p1 = Product(name="Paracetamol 500mg", generic_name="Acetaminophen", dosage_form="Tablet", manufacturer_name="MedLife Pharma Ltd")
        p2 = Product(name="Cetirizine 10mg", generic_name="Cetirizine Hydrochloride", dosage_form="Tablet", manufacturer_name="MedLife Pharma Ltd")
        p3 = Product(name="Amoxicillin 500mg", generic_name="Amoxicillin Trihydrate", dosage_form="Capsule", manufacturer_name="MedLife Pharma Ltd")

        db.add_all([p1, p2, p3])
        db.commit()

        now = datetime.utcnow()

        # 4. Batches
        # Batch 1: Normal Batch (P1001)
        b1 = Batch(
            batch_number="P1001",
            product_id=p1.id,
            mfg_date=(now - timedelta(days=90)).strftime("%Y-%m-%d"),
            expiry_date=(now + timedelta(days=365)).strftime("%Y-%m-%d"),
            pack_size="10x10 Strips",
            original_quantity=500,
            current_quantity=500,
            current_owner_id=ret1_org.id,
            current_location_city="Chennai",
            status="ACTIVE",
            risk_score=8
        )

        # Batch 2: Near Expiry Batch (C2045)
        b2 = Batch(
            batch_number="C2045",
            product_id=p2.id,
            mfg_date=(now - timedelta(days=700)).strftime("%Y-%m-%d"),
            expiry_date=(now + timedelta(days=15)).strftime("%Y-%m-%d"),
            pack_size="10x10 Strips",
            original_quantity=120,
            current_quantity=120,
            current_owner_id=ret1_org.id,
            current_location_city="Chennai",
            status="ACTIVE",
            risk_score=22
        )

        # Batch 3: Quantity Discrepancy Batch (A4421)
        b3 = Batch(
            batch_number="A4421",
            product_id=p3.id,
            mfg_date=(now - timedelta(days=400)).strftime("%Y-%m-%d"),
            expiry_date=(now - timedelta(days=10)).strftime("%Y-%m-%d"),
            pack_size="10x10 Strips",
            original_quantity=500,
            current_quantity=470,
            return_quantity=500,
            current_owner_id=dist_org.id,
            current_location_city="Chennai",
            status="DISTRIBUTOR_RECEIVED",
            risk_score=46
        )

        # Batch 4: Critical Fraud Case (P7788)
        b4 = Batch(
            batch_number="P7788",
            product_id=p1.id,
            mfg_date=(now - timedelta(days=730)).strftime("%Y-%m-%d"),
            expiry_date=(now - timedelta(days=2)).strftime("%Y-%m-%d"),
            pack_size="10x10 Strips",
            original_quantity=500,
            current_quantity=470,
            return_quantity=500,
            current_owner_id=waste_org.id,
            current_location_city="Bengaluru",
            status="DESTROYED",
            risk_score=94
        )

        db.add_all([b1, b2, b3, b4])
        db.commit()

        # Events for Batch 1 (P1001)
        e_b1_1 = ChainEvent(
            event_code="BATCH_CREATED", batch_id=b1.id, actor_name="MedLife Production",
            actor_role="MANUFACTURER", organization_name="MedLife Pharma Ltd", location_city="Bengaluru",
            quantity=500, action_title="Batch Released", details="Batch passed CDSCO tests.", timestamp=now - timedelta(days=85)
        )
        e_b1_2 = ChainEvent(
            event_code="INVENTORY_RECEIVED", batch_id=b1.id, actor_name="Apollo Pharmacy",
            actor_role="RETAILER", organization_name="Apollo Pharmacy Chennai", location_city="Chennai",
            quantity=500, action_title="Inventory Logged", details="Stock stored in pharmacy dispensary.", timestamp=now - timedelta(days=80)
        )
        db.add_all([e_b1_1, e_b1_2])

        # Events for Batch 2 (C2045)
        e_b2_1 = ChainEvent(
            event_code="BATCH_CREATED", batch_id=b2.id, actor_name="MedLife Production",
            actor_role="MANUFACTURER", organization_name="MedLife Pharma Ltd", location_city="Bengaluru",
            quantity=120, action_title="Batch Released", details="Cetirizine batch created.", timestamp=now - timedelta(days=680)
        )
        e_b2_2 = ChainEvent(
            event_code="INVENTORY_RECEIVED", batch_id=b2.id, actor_name="Apollo Pharmacy",
            actor_role="RETAILER", organization_name="Apollo Pharmacy Chennai", location_city="Chennai",
            quantity=120, action_title="Inventory Stocked", details="Expires in 15 days.", timestamp=now - timedelta(days=600)
        )
        db.add_all([e_b2_1, e_b2_2])

        # Events & Handoff for Batch 3 (A4421)
        e_b3_1 = ChainEvent(
            event_code="RETURN_REQUESTED", batch_id=b3.id, actor_name="Apollo Pharmacy",
            actor_role="RETAILER", organization_name="Apollo Pharmacy Chennai", location_city="Chennai",
            quantity=500, action_title="Return Initiated", details="500 units declared expired.", timestamp=now - timedelta(days=5)
        )
        e_b3_2 = ChainEvent(
            event_code="QUANTITY_DISCREPANCY_DETECTED", batch_id=b3.id, actor_name="Southern Med Logistics",
            actor_role="DISTRIBUTOR", organization_name="Southern Med Distributors", location_city="Chennai",
            quantity=470, action_title="⚠️ Handoff Quantity Discrepancy (30 missing)",
            details="Declared 500 units, but verified 470 units (30 missing).", is_suspicious=True, timestamp=now - timedelta(days=3)
        )
        db.add_all([e_b3_1, e_b3_2])

        h_b3 = Handoff(
            batch_id=b3.id, from_org_id=ret1_org.id, to_org_id=dist_org.id,
            declared_quantity=500, verified_quantity=470, discrepancy_count=30, status="DISCREPANCY_FLAGGED"
        )
        db.add(h_b3)

        a_b3 = Alert(
            alert_code="ALT-A4421-DISC", alert_type="QUANTITY_DISCREPANCY", severity="MEDIUM",
            batch_id=b3.id, title="Transit Quantity Loss: Batch A4421",
            reason="Retailer declared 500 units; Distributor received 470 units (30 missing).",
            location_city="Chennai", status="OPEN", recommended_action="Verify transit seal logs.", timestamp=now - timedelta(days=3)
        )
        db.add(a_b3)

        # Seed Events for Fraud Batch P7788
        e_b4_1 = ChainEvent(event_code="BATCH_CREATED", batch_id=b4.id, actor_name="Dr. R. Sharma", actor_role="MANUFACTURER", organization_name="MedLife Pharma Ltd", location_city="Bengaluru", quantity=500, action_title="Batch Manufactured & Verified", details="CDSCO quality approved.", timestamp=now - timedelta(days=25))
        e_b4_2 = ChainEvent(event_code="INVENTORY_RECEIVED", batch_id=b4.id, actor_name="Apollo Pharmacy Manager", actor_role="RETAILER", organization_name="Apollo Pharmacy Chennai", location_city="Chennai", quantity=500, action_title="Received by Retail Pharmacy", details="Stocked at retail counter.", timestamp=now - timedelta(days=20))
        e_b4_3 = ChainEvent(event_code="RETURN_REQUESTED", batch_id=b4.id, actor_name="S. Kumar", actor_role="RETAILER", organization_name="Apollo Pharmacy Chennai", location_city="Chennai", quantity=500, action_title="Return Initiated (Near Expiry)", details="Reverse logistics started.", timestamp=now - timedelta(days=10))
        e_b4_4 = ChainEvent(event_code="DISTRIBUTOR_RECEIVED", batch_id=b4.id, actor_name="V. Logistics Inspector", actor_role="DISTRIBUTOR", organization_name="Southern Med Distributors", location_city="Chennai", quantity=470, action_title="Distributor Pickup & Verified (Quantity Mismatch)", details="Declared 500 units, physical count 470.", is_suspicious=True, timestamp=now - timedelta(days=7))
        e_b4_5 = ChainEvent(event_code="MANUFACTURER_RECEIVED", batch_id=b4.id, actor_name="QA Dept", actor_role="MANUFACTURER", organization_name="MedLife Pharma Ltd", location_city="Bengaluru", quantity=470, action_title="Confirmed Return at Manufacturer", details="Logged for destruction.", timestamp=now - timedelta(days=5))
        e_b4_6 = ChainEvent(event_code="DESTROYED", batch_id=b4.id, actor_name="GreenWaste Inspector", actor_role="WASTE_FACILITY", organization_name="GreenWaste Eco-Facility", location_city="Bengaluru", quantity=470, action_title="High-Temperature Incineration Completed", details="Incinerated under supervisor audit.", timestamp=now - timedelta(days=3))
        e_b4_7 = ChainEvent(event_code="CERTIFICATE_UPLOADED", batch_id=b4.id, actor_name="Compliance Verifier", actor_role="WASTE_FACILITY", organization_name="GreenWaste Eco-Facility", location_city="Bengaluru", quantity=470, action_title="Destruction Certificate Linked (#DC-90812)", details="Certificate cryptographically verified.", timestamp=now - timedelta(days=2))
        e_b4_8 = ChainEvent(event_code="REENTRY_DETECTED", batch_id=b4.id, actor_name="City Med POS Scanner", actor_role="RETAILER", organization_name="City Healthcare Pharmacy", location_city="Madurai", quantity=470, action_title="🚨 CRITICAL RE-ENTRY FRAUD SCAN DETECTED", details="Batch P7788 scanned into Madurai pharmacy POS after incineration!", is_suspicious=True, timestamp=now - timedelta(hours=3))

        db.add_all([e_b4_1, e_b4_2, e_b4_3, e_b4_4, e_b4_5, e_b4_6, e_b4_7, e_b4_8])

        c_b4 = DestructionCertificate(
            certificate_id="DC-90812", batch_id=b4.id, declared_batch_number="P7788",
            quantity_destroyed=470, destruction_date=(now - timedelta(days=3)).strftime("%Y-%m-%d"),
            waste_facility_name="GreenWaste Eco-Facility Bengaluru", verification_status="VERIFIED"
        )
        db.add(c_b4)

        alt_b4 = Alert(
            alert_code="ALT-P7788-REENTRY", alert_type="RE_ENTRY", severity="CRITICAL",
            batch_id=b4.id, title="CRITICAL RE-ENTRY FRAUD DETECTED: Batch P7788",
            reason="Batch P7788 was scanned at City Healthcare Pharmacy in Madurai despite official destruction certificate #DC-90812 issued 3 days ago.",
            location_city="Madurai", status="OPEN", recommended_action="Dispatch State Drug Inspector immediately to Madurai outlet. Quarantine stock.", timestamp=now - timedelta(hours=3)
        )
        db.add(alt_b4)

        inv_b4 = Investigation(
            investigation_code="INV-P7788-FRAUD", batch_id=b4.id, status="OPEN", priority="CRITICAL",
            assigned_to="Drug Controller Anti-Counterfeiting Cell",
            findings="Batch P7788 exhibited quantity discrepancy in transit, followed by confirmed incineration certificate. Subsequent scan in Madurai confirms diverted stock re-entry attempt.",
            actions_taken="Pharmacy license notice served to Madurai retailer."
        )
        db.add(inv_b4)

        db.commit()
        print("Database seeded successfully with realistic CDSCO demo data!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
