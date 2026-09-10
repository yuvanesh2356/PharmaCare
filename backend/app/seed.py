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
        p4 = Product(name="Azithromycin 500mg", generic_name="Azithromycin Dihydrate", dosage_form="Tablet", manufacturer_name="MedLife Pharma Ltd")
        p5 = Product(name="Metformin 500mg", generic_name="Metformin Hydrochloride", dosage_form="Tablet", manufacturer_name="MedLife Pharma Ltd")
        p6 = Product(name="Pantoprazole 40mg", generic_name="Pantoprazole Sodium", dosage_form="Tablet", manufacturer_name="MedLife Pharma Ltd")
        p7 = Product(name="Amoxicillin 250mg", generic_name="Amoxicillin Trihydrate", dosage_form="Capsule", manufacturer_name="MedLife Pharma Ltd")
        p8 = Product(name="Ibuprofen 400mg", generic_name="Ibuprofen", dosage_form="Tablet", manufacturer_name="MedLife Pharma Ltd")
        p9 = Product(name="Doxycycline 100mg", generic_name="Doxycycline Hyclate", dosage_form="Capsule", manufacturer_name="MedLife Pharma Ltd")
        p10 = Product(name="ORS Sachets", generic_name="Oral Rehydration Salts", dosage_form="Powder", manufacturer_name="MedLife Pharma Ltd")
        p11 = Product(name="Levocetirizine 5mg", generic_name="Levocetirizine Dihydrochloride", dosage_form="Tablet", manufacturer_name="MedLife Pharma Ltd")
        p12 = Product(name="Omeprazole 20mg", generic_name="Omeprazole", dosage_form="Capsule", manufacturer_name="MedLife Pharma Ltd")
        p13 = Product(name="Cefixime 200mg", generic_name="Cefixime Trihydrate", dosage_form="Tablet", manufacturer_name="MedLife Pharma Ltd")

        db.add_all([p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13])
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
            risk_score=0
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
            risk_score=0
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
            risk_score=20
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
            risk_score=74
        )

        # 10 Added Demo Batches
        # Batch 5: Azithromycin 500mg | A3102 | 85 units | 22 days | Expiring Soon | 0
        b5 = Batch(
            batch_number="A3102",
            product_id=p4.id,
            mfg_date=(now - timedelta(days=340)).strftime("%Y-%m-%d"),
            expiry_date=(now + timedelta(days=22)).strftime("%Y-%m-%d"),
            pack_size="10x6 Strips",
            original_quantity=85,
            current_quantity=85,
            current_owner_id=ret1_org.id,
            current_location_city="Chennai",
            status="ACTIVE",
            risk_score=0
        )

        # Batch 6: Metformin 500mg | M5821 | 320 units | 47 days | Normal Active | 0
        b6 = Batch(
            batch_number="M5821",
            product_id=p5.id,
            mfg_date=(now - timedelta(days=300)).strftime("%Y-%m-%d"),
            expiry_date=(now + timedelta(days=47)).strftime("%Y-%m-%d"),
            pack_size="10x10 Strips",
            original_quantity=320,
            current_quantity=320,
            current_owner_id=ret1_org.id,
            current_location_city="Chennai",
            status="ACTIVE",
            risk_score=0
        )

        # Batch 7: Pantoprazole 40mg | P6314 | 180 units | 9 days | Expiring Soon | 0
        b7 = Batch(
            batch_number="P6314",
            product_id=p6.id,
            mfg_date=(now - timedelta(days=350)).strftime("%Y-%m-%d"),
            expiry_date=(now + timedelta(days=9)).strftime("%Y-%m-%d"),
            pack_size="10x10 Strips",
            original_quantity=180,
            current_quantity=180,
            current_owner_id=ret1_org.id,
            current_location_city="Chennai",
            status="ACTIVE",
            risk_score=0
        )

        # Batch 8: Amoxicillin 250mg | A7290 | 95 units | Expired | Return Requested | 15
        b8 = Batch(
            batch_number="A7290",
            product_id=p7.id,
            mfg_date=(now - timedelta(days=400)).strftime("%Y-%m-%d"),
            expiry_date=(now - timedelta(days=12)).strftime("%Y-%m-%d"),
            pack_size="10x10 Strips",
            original_quantity=95,
            current_quantity=95,
            return_quantity=95,
            current_owner_id=ret1_org.id,
            current_location_city="Chennai",
            status="RETURN_REQUESTED",
            risk_score=15
        )

        # Batch 9: Ibuprofen 400mg | I4428 | 210 units | 76 days | Normal Active | 0
        b9 = Batch(
            batch_number="I4428",
            product_id=p8.id,
            mfg_date=(now - timedelta(days=200)).strftime("%Y-%m-%d"),
            expiry_date=(now + timedelta(days=76)).strftime("%Y-%m-%d"),
            pack_size="10x10 Strips",
            original_quantity=210,
            current_quantity=210,
            current_owner_id=ret1_org.id,
            current_location_city="Chennai",
            status="ACTIVE",
            risk_score=0
        )

        # Batch 10: Doxycycline 100mg | D1937 | 64 units | Expired | Distributor Picked Up | 20
        b10 = Batch(
            batch_number="D1937",
            product_id=p9.id,
            mfg_date=(now - timedelta(days=420)).strftime("%Y-%m-%d"),
            expiry_date=(now - timedelta(days=25)).strftime("%Y-%m-%d"),
            pack_size="10x10 Strips",
            original_quantity=64,
            current_quantity=64,
            return_quantity=64,
            current_owner_id=dist_org.id,
            current_location_city="Chennai",
            status="DISTRIBUTOR_RECEIVED",
            risk_score=20
        )

        # Batch 11: ORS Sachets | O8210 | 450 units | 31 days | Normal Active | 0
        b11 = Batch(
            batch_number="O8210",
            product_id=p10.id,
            mfg_date=(now - timedelta(days=330)).strftime("%Y-%m-%d"),
            expiry_date=(now + timedelta(days=31)).strftime("%Y-%m-%d"),
            pack_size="50 Sachets",
            original_quantity=450,
            current_quantity=450,
            current_owner_id=ret1_org.id,
            current_location_city="Chennai",
            status="ACTIVE",
            risk_score=0
        )

        # Batch 12: Levocetirizine 5mg | L3905 | 42 units | 6 days | Expiring Soon | 5
        b12 = Batch(
            batch_number="L3905",
            product_id=p11.id,
            mfg_date=(now - timedelta(days=360)).strftime("%Y-%m-%d"),
            expiry_date=(now + timedelta(days=6)).strftime("%Y-%m-%d"),
            pack_size="10x10 Strips",
            original_quantity=42,
            current_quantity=42,
            current_owner_id=ret1_org.id,
            current_location_city="Chennai",
            status="ACTIVE",
            risk_score=5
        )

        # Batch 13: Omeprazole 20mg | O5146 | 150 units | Expired | Return Requested | 15
        b13 = Batch(
            batch_number="O5146",
            product_id=p12.id,
            mfg_date=(now - timedelta(days=450)).strftime("%Y-%m-%d"),
            expiry_date=(now - timedelta(days=18)).strftime("%Y-%m-%d"),
            pack_size="10x10 Strips",
            original_quantity=150,
            current_quantity=150,
            return_quantity=150,
            current_owner_id=ret1_org.id,
            current_location_city="Chennai",
            status="RETURN_REQUESTED",
            risk_score=15
        )

        # Batch 14: Cefixime 200mg | C6724 | 110 units | 18 days | Expiring Soon | 0
        b14 = Batch(
            batch_number="C6724",
            product_id=p13.id,
            mfg_date=(now - timedelta(days=340)).strftime("%Y-%m-%d"),
            expiry_date=(now + timedelta(days=18)).strftime("%Y-%m-%d"),
            pack_size="10x10 Strips",
            original_quantity=110,
            current_quantity=110,
            current_owner_id=ret1_org.id,
            current_location_city="Chennai",
            status="ACTIVE",
            risk_score=0
        )

        db.add_all([b1, b2, b3, b4, b5, b6, b7, b8, b9, b10, b11, b12, b13, b14])
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
        e_b4_4 = ChainEvent(event_code="DISTRIBUTOR_RECEIVED", batch_id=b4.id, actor_name="V. Logistics Inspector", actor_role="DISTRIBUTOR", organization_name="Southern Med Distributors", location_city="Chennai", quantity=470, action_title="Distributor Pickup & Verified (Quantity Mismatch)", details="Declared 500 units, physical count 470 (30 missing).", is_suspicious=True, timestamp=now - timedelta(days=7))
        e_b4_5 = ChainEvent(event_code="MANUFACTURER_RECEIVED", batch_id=b4.id, actor_name="QA Dept", actor_role="MANUFACTURER", organization_name="MedLife Pharma Ltd", location_city="Bengaluru", quantity=470, action_title="Confirmed Return at Manufacturer", details="Logged for destruction.", timestamp=now - timedelta(days=5))
        e_b4_6 = ChainEvent(event_code="DESTROYED", batch_id=b4.id, actor_name="GreenWaste Inspector", actor_role="WASTE_FACILITY", organization_name="GreenWaste Eco-Facility", location_city="Bengaluru", quantity=470, action_title="High-Temperature Incineration Completed", details="Incinerated under supervisor audit.", timestamp=now - timedelta(days=3))
        e_b4_7 = ChainEvent(event_code="CERTIFICATE_UPLOADED", batch_id=b4.id, actor_name="Compliance Verifier", actor_role="WASTE_FACILITY", organization_name="GreenWaste Eco-Facility", location_city="Bengaluru", quantity=470, action_title="Destruction Certificate Linked (#DC-90812)", details="Certificate uploaded for 470 verified units. 30 missing transit units remain UNACCOUNTED.", timestamp=now - timedelta(days=2))
        e_b4_8 = ChainEvent(event_code="REENTRY_DETECTED", batch_id=b4.id, actor_name="City Med POS Scanner", actor_role="RETAILER", organization_name="City Healthcare Pharmacy", location_city="Madurai", quantity=30, action_title="🚨 30 UNACCOUNTED UNITS DETECTED IN ACTIVE POS", details="30 unaccounted units of Batch P7788 (missing during distributor transit verification) were scanned for active retail sale in Madurai POS!", is_suspicious=True, timestamp=now - timedelta(hours=3))

        db.add_all([e_b4_1, e_b4_2, e_b4_3, e_b4_4, e_b4_5, e_b4_6, e_b4_7, e_b4_8])

        c_b4 = DestructionCertificate(
            certificate_id="DC-90812", batch_id=b4.id, declared_batch_number="P7788",
            quantity_destroyed=470, destruction_date=(now - timedelta(days=3)).strftime("%Y-%m-%d"),
            waste_facility_name="GreenWaste Eco-Facility Bengaluru", verification_status="VERIFIED"
        )
        db.add(c_b4)

        alt_b4 = Alert(
            alert_code="ALT-P7788-REENTRY", alert_type="RE_ENTRY", severity="CRITICAL",
            batch_id=b4.id, title="CRITICAL RE-ENTRY DETECTED: 30 Unaccounted Units (Batch P7788)",
            reason="30 missing/unaccounted units of Batch P7788 (from 500 declared vs 470 verified return) were scanned for active retail billing at City Healthcare Pharmacy in Madurai.",
            location_city="Madurai", status="OPEN", recommended_action="Dispatch State Drug Inspector immediately to Madurai outlet. Quarantine all Batch P7788 stock.", timestamp=now - timedelta(hours=3)
        )
        db.add(alt_b4)

        inv_b4 = Investigation(
            investigation_code="INV-P7788-FRAUD", batch_id=b4.id, status="OPEN", priority="CRITICAL",
            assigned_to="Drug Controller Anti-Counterfeiting Cell",
            findings="Batch P7788 had 500 declared units, 470 verified & incinerated (Certificate #DC-90812). The 30 unaccounted transit units re-entered active retail billing at Madurai.",
            actions_taken="Pharmacy license notice served to Madurai retailer."
        )
        db.add(inv_b4)

        db.commit()
        print("Database seeded successfully with realistic CDSCO demo data!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
