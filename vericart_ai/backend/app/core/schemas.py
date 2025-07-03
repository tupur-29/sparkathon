from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, date

class ProductVerificationStats(BaseModel):
    """Holds the social proof statistics for a product."""
    total_scans: int
    authentic_scans: int
    authenticity_percentage: float = Field(..., description="A percentage from 0.0 to 100.0")


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
    
    product_id_str: str = Field(..., alias="id")
    name: str
    category: Optional[str] = None
    supplier: Optional[Supplier] = None 

    verification_stats: Optional[ProductVerificationStats] = None

    class Config:
        from_attributes = True
        populate_by_name = True

class ScanRecord(BaseModel):
    """Represents a single scan event as stored in the DB."""
    id: int
    timestamp: datetime
    latitude: float
    longitude: float
    is_authentic: bool 

    class Config:
        from_attributes = True

class Alert(BaseModel):
    id: int
    timestamp: datetime
    alert_type: str
    message: str
    risk_score: float
    status: str
    product: Product 
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



class ProductCreate(BaseModel):
    
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
    product_id: str = Field(..., alias="id") 
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
    highest_risk_regions: List[RiskItem] 

class TokenData(BaseModel):
    """Schema for decoding security tokens."""
    walmart_id: Optional[str] = None

class BusinessMetricSnapshot(BaseModel):
    snapshot_date: date
    estimated_losses_prevented: Optional[float] = None
    fraudulent_returns_reduction_index: Optional[float] = None
    customer_trust_score: Optional[float] = None
    supply_chain_efficiency_score: Optional[float] = None

    class Config:
        from_attributes = True

