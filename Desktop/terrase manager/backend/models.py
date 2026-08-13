from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database import Base


class ProductModel(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    brand = Column(String, index=True)
    supplier = Column(String, index=True, nullable=False)
    category = Column(String, index=True, nullable=False)
    format = Column(String, nullable=False)
    bottles_per_casier = Column(Integer, default=12)
    buy_price_casier = Column(Float, nullable=False)
    sell_price_bottle = Column(Float, nullable=False)
    current_stock_bottles = Column(Integer, default=0)
    min_alert_threshold_bottles = Column(Integer, default=24)
    image_url = Column(String, default="🍺")


class SaleModel(Base):
    __tablename__ = "sales"

    id = Column(String, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    server = Column(String, nullable=False)
    table_name = Column(String, nullable=False)
    raw_total = Column(Float, nullable=False)
    discount = Column(Float, default=0.0)
    total_amount = Column(Float, nullable=False)
    payment_method = Column(String, default="Espèces")

    items = relationship("SaleItemModel", back_populates="sale", cascade="all, delete-orphan")


class SaleItemModel(Base):
    __tablename__ = "sale_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    sale_id = Column(String, ForeignKey("sales.id"), nullable=False)
    product_id = Column(String, nullable=False)
    product_name = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    total = Column(Float, nullable=False)

    sale = relationship("SaleModel", back_populates="items")


class MovementModel(Base):
    __tablename__ = "stock_movements"

    id = Column(String, primary_key=True, index=True)
    date = Column(DateTime, default=datetime.utcnow, index=True)
    type = Column(String, nullable=False)  # "Entrée (Livraison)" or "Sortie (Vente)"
    supplier = Column(String, nullable=False)
    product_name = Column(String, nullable=False)
    quantity_bottles = Column(Integer, nullable=False)
    casiers_count = Column(Float, default=0.0)
    unit_cost_casier = Column(Float, default=0.0)
    total_cost = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)
