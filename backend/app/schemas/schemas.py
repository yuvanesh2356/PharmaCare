from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, EmailStr

# Auth & User Schemas
class UserBase(BaseModel):
    email: str
    full_name: str
    role: str
    organization_id: Optional[int] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    organization_name: Optional[str] = None

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Product & Organization
class OrganizationSchema(BaseModel):
    id: int
    name: str
    org_type: str
    location_city: str
    location_state: str
    lat: float
    lng: float
    contact_email: Optional[str] = None

    class Config:
        from_attributes = True

class ProductSchema(BaseModel):
    id: int
    name: str
    generic_name: str
    dosage_form: str
    manufacturer_name: str

    class Config:
        from_attributes = True

# Batch & Twin Digital Schemas
class BatchCreate(BaseModel):
    product_name: str
    generic_name: str
    batch_number: str
    manufacturer_name: str
    mfg_date: str
    expiry_date: str
    pack_size: str = "10x10 Strips"
    quantity: int
    location_city: str = "Chennai"

class ChainEventSchema(BaseModel):
    id: int
    event_code: str
    batch_id: int
    actor_name: str
    actor_role: str
    organization_name: str
    location_city: str
    quantity: int
    action_title: str
    details: Optional[str] = None
    evidence_url: Optional[str] = None
    is_suspicious: bool = False
    timestamp: datetime

    class Config:
        from_attributes = True

class DestructionCertificateSchema(BaseModel):
    id: int
    certificate_id: str
    batch_id: int
    return_code: Optional[str] = None
    declared_batch_number: str
    quantity_destroyed: int
    destruction_date: str
    waste_facility_name: str
    certificate_file_url: Optional[str] = None
    verification_status: str
    mismatch_reason: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class AlertSchema(BaseModel):
    id: int
    alert_code: str
    alert_type: str
    severity: str
    batch_id: int
    title: str
    reason: str
    location_city: str
    status: str
    recommended_action: str
    timestamp: datetime

    class Config:
        from_attributes = True

class BatchSchema(BaseModel):
    id: int
    batch_number: str
    product_id: int
    product_name: str
    generic_name: str
    mfg_date: str
    expiry_date: str
    days_remaining: int
    expiry_state: str  # NORMAL, NEAR_EXPIRY, CRITICAL_NEAR_EXPIRY, EXPIRING_TODAY, EXPIRED
    pack_size: str
    original_quantity: int
    current_quantity: int
    return_quantity: int
    current_owner_id: int
    current_owner_name: str
    current_location_city: str
    status: str
    risk_score: int
    risk_level: str  # LOW, MEDIUM, HIGH, CRITICAL
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class BatchDetailSchema(BatchSchema):
    product: ProductSchema
    current_owner: OrganizationSchema
    events: List[ChainEventSchema] = []
    certificates: List[DestructionCertificateSchema] = []
    alerts: List[AlertSchema] = []
    suspicious_reasons: List[str] = []
    compliance_summary: Dict[str, Any] = {}
    quantity_flow: List[Dict[str, Any]] = []

# Action Schemas
class ReturnRequestCreate(BaseModel):
    batch_id: int
    quantity_declared: int
    reason: str
    condition_notes: Optional[str] = None
    photo_url: Optional[str] = None

class HandoffVerifyRequest(BaseModel):
    batch_id: int
    received_quantity: int
    weight_kg: Optional[float] = None
    receipt_photo_url: Optional[str] = None

class CertificateUploadRequest(BaseModel):
    certificate_id: str
    batch_id: int
    return_code: Optional[str] = None
    declared_batch_number: str
    quantity_destroyed: int
    destruction_date: str
    waste_facility_name: str
    certificate_file_url: Optional[str] = None

class ReentryScanRequest(BaseModel):
    batch_number: str
    scanning_pharmacy_name: str
    scanning_city: str

class NaturalLanguageQueryRequest(BaseModel):
    question: str
    batch_id: Optional[int] = None
