from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class ProductBase(BaseModel):
    name: str
    brand: str
    supplier: str
    category: str
    format: str
    bottlesPerCasier: int = Field(12, alias="bottles_per_casier")
    buyPriceCasier: float = Field(..., alias="buy_price_casier")
    sellPriceBottle: float = Field(..., alias="sell_price_bottle")
    currentStockBottles: int = Field(0, alias="current_stock_bottles")
    minAlertThresholdBottles: int = Field(24, alias="min_alert_threshold_bottles")
    imageUrl: Optional[str] = Field("🍺", alias="image_url")

    class Config:
        populate_by_name = True
        from_attributes = True


class ProductCreate(ProductBase):
    id: Optional[str] = None


class ProductResponse(ProductBase):
    id: str


class SaleItemBase(BaseModel):
    id: str = Field(..., alias="product_id")
    name: str = Field(..., alias="product_name")
    quantity: int
    unitPrice: float = Field(..., alias="unit_price")
    total: Optional[float] = 0.0

    class Config:
        populate_by_name = True
        from_attributes = True


class SaleCreate(BaseModel):
    server: str
    table: str = Field(..., alias="table_name")
    items: List[SaleItemBase]
    discount: float = 0.0
    paymentMethod: str = Field("Espèces", alias="payment_method")

    class Config:
        populate_by_name = True


class SaleResponse(BaseModel):
    id: str
    timestamp: datetime
    server: str
    table: str = Field(..., alias="table_name")
    items: List[SaleItemBase]
    rawTotal: float = Field(..., alias="raw_total")
    discount: float
    totalAmount: float = Field(..., alias="total_amount")
    paymentMethod: str = Field(..., alias="payment_method")

    class Config:
        populate_by_name = True
        from_attributes = True


class MovementCreate(BaseModel):
    type: str
    supplier: str
    productName: str = Field(..., alias="product_name")
    quantityBottles: int = Field(..., alias="quantity_bottles")
    casiersCount: float = Field(0.0, alias="casiers_count")
    unitCostCasier: float = Field(0.0, alias="unit_cost_casier")
    totalCost: float = Field(0.0, alias="total_cost")
    notes: Optional[str] = ""

    class Config:
        populate_by_name = True


class MovementResponse(MovementCreate):
    id: str
    date: datetime

    class Config:
        populate_by_name = True
        from_attributes = True
