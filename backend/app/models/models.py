from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    org_type = Column(String, nullable=False)  # RETAILER, DISTRIBUTOR, MANUFACTURER, WASTE_FACILITY, INVESTIGATOR
    location_city = Column(String, nullable=False)
    location_state = Column(String, nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    contact_email = Column(String, nullable=True)

    users = relationship("User", back_populates="organization")
    batches_owned = relationship("Batch", back_populates="current_owner")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # RETAILER, DISTRIBUTOR, MANUFACTURER, INVESTIGATOR
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)

    organization = relationship("Organization", back_populates="users")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    generic_name = Column(String, nullable=False)
    dosage_form = Column(String, default="Tablet")
    manufacturer_name = Column(String, nullable=False)

    batches = relationship("Batch", back_populates="product")

class Batch(Base):
    __tablename__ = "batches"

    id = Column(Integer, primary_key=True, index=True)
    batch_number = Column(String, index=True, nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    
    mfg_date = Column(String, nullable=False)
    expiry_date = Column(String, nullable=False)
    pack_size = Column(String, default="10x10 Strips")
    
    original_quantity = Column(Integer, nullable=False)
    current_quantity = Column(Integer, nullable=False)
    return_quantity = Column(Integer, default=0)
    
    current_owner_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    current_location_city = Column(String, nullable=False)
    
    status = Column(String, default="ACTIVE")
    risk_score = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    product = relationship("Product", back_populates="batches")
    current_owner = relationship("Organization", back_populates="batches_owned")
    events = relationship("ChainEvent", back_populates="batch", order_by="ChainEvent.timestamp.asc()")
    returns = relationship("ReturnRequest", back_populates="batch")
    handoffs = relationship("Handoff", back_populates="batch")
    certificates = relationship("DestructionCertificate", back_populates="batch")
    alerts = relationship("Alert", back_populates="batch")
    investigations = relationship("Investigation", back_populates="batch")

class Inventory(Base):
    __tablename__ = "inventories"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    last_scanned_at = Column(DateTime, default=datetime.utcnow)

class ReturnRequest(Base):
    __tablename__ = "return_requests"

    id = Column(Integer, primary_key=True, index=True)
    return_code = Column(String, unique=True, index=True, nullable=False)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=False)
    pharmacy_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    quantity_declared = Column(Integer, nullable=False)
    reason = Column(String, nullable=False)
    condition_notes = Column(String, nullable=True)
    photo_url = Column(String, nullable=True)
    status = Column(String, default="RETURN_REQUESTED")  # RETURN_REQUESTED, PICKED_UP, CONFIRMED
    created_at = Column(DateTime, default=datetime.utcnow)

    batch = relationship("Batch", back_populates="returns")

class Handoff(Base):
    __tablename__ = "handoffs"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=False)
    from_org_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    to_org_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    declared_quantity = Column(Integer, nullable=False)
    verified_quantity = Column(Integer, nullable=False)
    discrepancy_count = Column(Integer, default=0)
    status = Column(String, default="PENDING")  # PENDING, ACCEPTED, DISCREPANCY_FLAGGED
    weight_kg = Column(Float, nullable=True)
    receipt_photo_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    batch = relationship("Batch", back_populates="handoffs")

class ChainEvent(Base):
    __tablename__ = "chain_events"

    id = Column(Integer, primary_key=True, index=True)
    event_code = Column(String, nullable=False)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=False)
    actor_name = Column(String, nullable=False)
    actor_role = Column(String, nullable=False)
    organization_name = Column(String, nullable=False)
    location_city = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    action_title = Column(String, nullable=False)
    details = Column(Text, nullable=True)
    evidence_url = Column(String, nullable=True)
    is_suspicious = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    batch = relationship("Batch", back_populates="events")

class DestructionCertificate(Base):
    __tablename__ = "destruction_certificates"

    id = Column(Integer, primary_key=True, index=True)
    certificate_id = Column(String, unique=True, index=True, nullable=False)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=False)
    return_code = Column(String, nullable=True)
    declared_batch_number = Column(String, nullable=False)
    quantity_destroyed = Column(Integer, nullable=False)
    destruction_date = Column(String, nullable=False)
    waste_facility_name = Column(String, nullable=False)
    certificate_file_url = Column(String, nullable=True)
    verification_status = Column(String, default="VERIFIED")  # VERIFIED, MISMATCH_SUSPECTED
    mismatch_reason = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    batch = relationship("Batch", back_populates="certificates")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_code = Column(String, unique=True, index=True, nullable=False)
    alert_type = Column(String, nullable=False)  # RE_ENTRY, QUANTITY_DISCREPANCY, CERTIFICATE_MISMATCH, LOCATION_ANOMALY, TIMELINE_ANOMALY, CUSTODY_CONFLICT, MISSING_DESTRUCTION
    severity = Column(String, nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=False)
    title = Column(String, nullable=False)
    reason = Column(Text, nullable=False)
    location_city = Column(String, nullable=False)
    status = Column(String, default="OPEN")  # OPEN, UNDER_INVESTIGATION, RESOLVED
    recommended_action = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    batch = relationship("Batch", back_populates="alerts")

class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=False)
    risk_score = Column(Integer, nullable=False)
    breakdown_json = Column(JSON, nullable=False)
    explanation_text = Column(Text, nullable=False)
    assessed_at = Column(DateTime, default=datetime.utcnow)

class Investigation(Base):
    __tablename__ = "investigations"

    id = Column(Integer, primary_key=True, index=True)
    investigation_code = Column(String, unique=True, index=True, nullable=False)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=False)
    status = Column(String, default="OPEN")  # OPEN, IN_PROGRESS, RESOLVED, ESCALATED
    priority = Column(String, default="HIGH")
    assigned_to = Column(String, default="Drug Inspectorate Team A")
    findings = Column(Text, nullable=True)
    actions_taken = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    batch = relationship("Batch", back_populates="investigations")
