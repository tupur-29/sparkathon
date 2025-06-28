

'''from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# ===================================================================
# Schemas that map directly to Database Models (for reading data)
# ===================================================================
# Base schema with common attributes
class SupplierBase(BaseModel):
    name: str
    location: str

# Schema for creating a supplier (request body)
class SupplierCreate(SupplierBase):
    pass

# Full Supplier schema for responses
class Supplier(SupplierBase):
    id: int
    risk_score: float

    class Config:
        orm_mode = True

class UserBase(BaseModel):
    walmart_customer_id: str

# Schema for creating a user (what the API receives)
class UserCreate(UserBase):
    pass

# Full User schema for responses (what the API sends back)
class User(UserBase):
    id: int
    role: str
    points: int

    class Config:
        orm_mode = True

# --- Product Schemas ---
class Product(BaseModel):
    id: int
    product_id_str: str
    name: str
    category: Optional[str] = None
    supplier: Optional[Supplier] = None

    class Config:
        from_attributes = True

# --- Scan Schemas ---
class Scan(BaseModel):
    id: int
    timestamp: datetime
    latitude: float
    longitude: float
    user_id: str
    is_anomaly: bool

    class Config:
        from_attributes = True

# --- Alert Schemas ---
class Alert(BaseModel):
    id: int
    timestamp: datetime
    alert_type: str
    risk_score: Optional[float] = None
    status: str
    notes: Optional[str] = None
    product: Product  # Nest full product info for rich alert data

    class Config:
        from_attributes = True

# ===================================================================
# Schemas for API Request Bodies (for creating/updating data)
# ===================================================================

class ProductCreate(BaseModel):
    product_id_str: str
    name: str
    category: Optional[str] = None
    supplier: Optional[str] = None

class VerificationRequest(BaseModel):
    product_id_str: str
    user_id: str
    latitude: float
    longitude: float

class AlertStatusUpdate(BaseModel):
    new_status: str
    notes: Optional[str] = None

# ===================================================================
# Schemas for Specific API Responses
# ===================================================================

class VerificationResponse(BaseModel):
    status: str
    message: str
    product_journey: List[Scan] = []

class AlertDetail(BaseModel):
    alert_details: Alert
    triggering_scan: Scan
    previous_scan: Optional[Scan] = None

class DashboardAnalyticsSummary(BaseModel):
    total_scans_24h: int
    total_anomalies_24h: int
    highest_risk_products: List[dict] # e.g., [{"product_id_str": "abc", "count": 5}]
    highest_risk_regions: List[dict] # e.g., [{"region": "NY", "count": 10}]

class DashboardScan(Scan):
    """A schema for WebSocket broadcasting that includes product info."""
    product: Product
    alert: Optional[Alert] = None

class TokenData(BaseModel):
    walmart_id: Optional[str] = None

class NFCVerificationRequest(BaseModel):
    product_id: str
    latitude: float
    longitude: float
    user_id: Optional[int] = None

# A single step in the product's journey
class ProvenanceEntry(BaseModel):
    status: str
    location: str
    timestamp: datetime
    handler: str

    class Config:
        orm_mode = True

class ScanVerificationResponse(BaseModel):
    status: str
    message: str
    product: Optional[Product] = None # Use your existing Pydantic Product model
    provenance: List[ProvenanceEntry] = []'''

# backend/app/core/schemas.py

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# ===================================================================
# GAMIFICATION SCHEMAS
# ===================================================================

class Badge(BaseModel):
    """Represents a master badge definition."""
    name: str
    description: str
    icon_url: Optional[str] = None

    class Config:
        from_attributes = True

class UserBadge(BaseModel):
    """Represents a badge that a user has earned."""
    badge: Badge
    awarded_at: datetime

    class Config:
        from_attributes = True
        
class UserGamificationProfile(BaseModel):
    """A summary of a user's points and badges."""
    total_points: int
    badges: List[UserBadge] = []

class ScanReward(BaseModel):
    """A simple object to represent the reward given immediately after a scan."""
    points_awarded: int
    message: str

# ===================================================================
# 1. Core Data Models (Building Blocks for DB <-> API)
# These schemas map closely to your SQLAlchemy models.
# ===================================================================

class Supplier(BaseModel):
    id: int
    name: str
    location: str
    risk_score: float

    class Config:
        from_attributes = True

class User(BaseModel):
    id: int
    walmart_customer_id: str
    role: str
    points: int

    gamification_profile: Optional[UserGamificationProfile] = None

    class Config:
        from_attributes = True

class Product(BaseModel):
    # id: str  # Standardized on `id` for the public string identifier
    product_id_str: str = Field(..., alias="id")
    name: str
    category: Optional[str] = None
    supplier: Optional[Supplier] = None # For rich responses

    class Config:
        from_attributes = True
        populate_by_name = True

class ScanRecord(BaseModel):
    """Represents a single scan event as stored in the DB."""
    id: int
    timestamp: datetime
    latitude: float
    longitude: float
    is_authentic: bool # Standardized on `is_authentic` for clarity

    class Config:
        from_attributes = True

class Alert(BaseModel):
    id: int
    timestamp: datetime
    alert_type: str
    message: str
    risk_score: float
    status: str
    product: Product # Nest full product info for rich alert data

    class Config:
        from_attributes = True

class ProvenanceEntry(BaseModel):
    """A single step in the product's journey (Digital Passport)."""
    status: str
    location: str
    timestamp: datetime
    handler: str

    class Config:
        from_attributes = True

class EducationalContent(BaseModel):
    """Represents a single piece of educational content for API responses."""
    id: int
    category: str
    title: str
    content: str
    updated_at: datetime

    class Config:
        from_attributes = True


# ===================================================================
# GAMIFICATION SCHEMAS
# ===================================================================

class Badge(BaseModel):
    """Represents a master badge definition."""
    name: str
    description: str
    icon_url: Optional[str] = None

    class Config:
        from_attributes = True

class UserBadge(BaseModel):
    """Represents a badge that a user has earned."""
    badge: Badge
    awarded_at: datetime

    class Config:
        from_attributes = True
        
class UserGamificationProfile(BaseModel):
    """A summary of a user's points and badges."""
    total_points: int
    badges: List[UserBadge] = []

class ScanReward(BaseModel):
    """A simple object to represent the reward given immediately after a scan."""
    points_awarded: int
    message: str

# ===================================================================
# 2. API Payloads (For creating/updating data via POST/PUT)
# ===================================================================

class ProductCreate(BaseModel):
    # id: str = Field(..., description="The unique public-facing product identifier (e.g., GTIN, SKU).")
    product_id_str: str = Field(..., alias="id", description="The unique public-facing product identifier (e.g., GTIN, SKU).")
    name: str
    category: Optional[str] = None
    supplier_id: int = Field(..., description="The integer primary key of the supplier.")

class UserCreate(BaseModel):
    walmart_customer_id: str

class SupplierCreate(BaseModel):
    name: str
    location: str

class EducationalContentCreate(BaseModel):
    """Schema for creating a new piece of educational content (for seeding/admin)."""
    category: str
    title: str
    content: str

class NFCVerificationRequest(BaseModel):
    product_id: str = Field(..., alias="id") # Alias allows client to send `id` and maps to `product_id`
    latitude: float
    longitude: float
    user_id: Optional[str] = None

class AlertStatusUpdate(BaseModel):
    new_status: str
    notes: Optional[str] = None

class ScanCreate(BaseModel):
    latitude: float
    longitude: float
    scan_order: int

class AlertCreate(BaseModel):
    alert_type: str
    message: str
    risk_score: float

# ===================================================================
# 3. API Responses (For specific endpoint GET responses)
# ===================================================================

class VerificationResponse(BaseModel):
    """Consolidated response schema for all verification endpoints."""
    status: str
    message: str
    product: Optional[Product] = None
    provenance: List[ProvenanceEntry] = []
    reward: Optional[ScanReward] = None

class AlertDetail(BaseModel):
    alert_details: Alert
    triggering_scan: ScanRecord
    previous_scan: Optional[ScanRecord] = None

class RiskItem(BaseModel):
    """A typed item for dashboard analytics."""
    name: str
    count: int

class DashboardAnalyticsSummary(BaseModel):
    total_scans_24h: int
    total_anomalies_24h: int
    highest_risk_products: List[RiskItem]
    highest_risk_regions: List[RiskItem] # You can use the same RiskItem model

class TokenData(BaseModel):
    """Schema for decoding security tokens."""
    walmart_id: Optional[str] = None