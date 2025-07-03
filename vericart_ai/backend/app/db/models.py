from sqlalchemy import (
    Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text, func, Date, JSON
)
from sqlalchemy.orm import relationship
from datetime import datetime

from .database import Base

# --- Consistent and Finalized Models ---

class Supplier(Base):
    __tablename__ = "suppliers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    location = Column(String)
    risk_score = Column(Float, default=0.0)

    products = relationship("Product", back_populates="supplier")

class Product(Base):
    __tablename__ = "products"
    # INTERNAL Primary Key for relationships (efficient)
    id = Column(Integer, primary_key=True, index=True)
    
    # PUBLIC-FACING Unique ID for API usage (human-readable)
    product_id_str = Column(String, unique=True, index=True, nullable=False)
    
    name = Column(String, nullable=False)
    category = Column(String, index=True)
    
    # Foreign key to Supplier table's `id` column
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    
    # Relationships
    supplier = relationship("Supplier", back_populates="products")
    scans = relationship("Scan", back_populates="product", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="product", cascade="all, delete-orphan")
    provenance_entries = relationship("ProvenanceEntry", back_populates="product", cascade="all, delete-orphan")

class Scan(Base):
    __tablename__ = "scans"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    user_id = Column(String, index=True, nullable=True)
    is_authentic = Column(Boolean, default=True, nullable=False)
    scan_order = Column(Integer, default=1)

    # Foreign key linking to the Product table's `id` (Integer)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    
    product = relationship("Product", back_populates="scans")
    triggered_alert = relationship("Alert", back_populates="triggering_scan", uselist=False, cascade="all, delete-orphan")
    point_transaction = relationship("PointTransaction", back_populates="scan", uselist=False, cascade="all, delete-orphan")

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    alert_type = Column(String, nullable=False)
    message = Column(Text)
    risk_score = Column(Float)
    status = Column(String, default="new", nullable=False, index=True)
    notes = Column(Text)

    # Foreign key linking to Product table's `id` (Integer)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    # Foreign key linking to Scan table's `id` (Integer)
    scan_id = Column(Integer, ForeignKey("scans.id"), nullable=False, unique=True)
    
    product = relationship("Product", back_populates="alerts")
    triggering_scan = relationship("Scan", back_populates="triggered_alert")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    walmart_customer_id = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, default="customer")
    points = Column(Integer, default=0, nullable=False)
    
    point_transactions = relationship("PointTransaction", back_populates="owner", cascade="all, delete-orphan")
    badges = relationship("UserBadge", back_populates="user", cascade="all, delete-orphan")
    
class ProvenanceEntry(Base):
    __tablename__ = "provenance_entries"
    id = Column(Integer, primary_key=True, index=True)
    status = Column(String, nullable=False)
    location = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    handler = Column(String)

    # Foreign key linking to Product table's `id` (Integer)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    
    product = relationship("Product", back_populates="provenance_entries")

class PointTransaction(Base):
    __tablename__ = "point_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    points_awarded = Column(Integer, nullable=False)
    source_scan_id = Column(Integer, ForeignKey("scans.id"), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="point_transactions")
    scan = relationship("Scan")


class Badge(Base):
    __tablename__ = "badges"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, unique=True, nullable=False)
    description = Column(String, nullable=False)
    icon_url = Column(String) # URL to an image for the badge


class UserBadge(Base):
    __tablename__ = "user_badges"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    badge_id = Column(Integer, ForeignKey("badges.id"), nullable=False)
    awarded_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="badges")
    badge = relationship("Badge")

class EducationalContent(Base):
    __tablename__ = "educational_content"

    id = Column(Integer, primary_key=True, index=True)
    
    # Category to group articles, e.g., "electronics", "fashion", "general-tips"
    # Indexing this column makes filtering by category very fast.
    category = Column(String, index=True, nullable=False)
    
    title = Column(String, nullable=False)
    
    # Use Text type for long-form content like an article body.
    content = Column(Text, nullable=False)
    
    # Track when content is created or updated.
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class BusinessMetricSnapshot(Base):
    __tablename__ = "business_metric_snapshots"
    id = Column(Integer, primary_key=True, index=True)
    snapshot_date = Column(Date, nullable=False, unique=True)
    
    # Example metrics
    estimated_losses_prevented = Column(Float)
    fraudulent_returns_reduction_index = Column(Float)
    customer_trust_score = Column(Float)
    supply_chain_efficiency_score = Column(Float)

    # A flexible field to store raw data used for the calculations
    raw_data = Column(JSON)
    
    
