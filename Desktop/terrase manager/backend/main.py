import time
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from backend.database import engine, Base, get_db
from backend.models import ProductModel, SaleModel, SaleItemModel, MovementModel
from backend.schemas import (
    ProductCreate,
    ProductResponse,
    SaleCreate,
    SaleResponse,
    MovementCreate,
    MovementResponse,
)
from backend.seed import seed_initial_data
from backend.websocket_manager import manager

# Create DB tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI App
app = FastAPI(
    title="Terrasse Bars Manager API",
    description="Backend API & Real-time WebSockets for Multi-Tablet Bar Management (SABC & Guinness Cameroun)",
    version="2.4.0",
)

# Enable CORS for React Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows local Vite dev server and mobile tablet IPs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    db = next(get_db())
    seed_initial_data(db)


# WebSocket Route for Real-time Tablet Synchronization
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection open and listen for ping/messages
            data = await websocket.receive_text()
            print(f"[WebSocket Received]: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# --- API ROUTES ---

@app.get("/api/products", response_model=List[ProductResponse])
def get_products(db: Session = Depends(get_db)):
    products = db.query(ProductModel).all()
    return products


@app.post("/api/products", response_model=ProductResponse)
async def create_product(prod: ProductCreate, db: Session = Depends(get_db)):
    prod_id = prod.id or f"prod-{int(time.time() * 1000)}"
    glaces = prod.stockGlaces if prod.stockGlaces is not None else int(prod.currentStockBottles * 0.6)
    non_glaces = prod.stockNonGlaces if prod.stockNonGlaces is not None else (prod.currentStockBottles - glaces)
    db_prod = ProductModel(
        id=prod_id,
        name=prod.name,
        brand=prod.brand,
        supplier=prod.supplier,
        category=prod.category,
        format=prod.format,
        bottles_per_casier=prod.bottlesPerCasier,
        buy_price_casier=prod.buyPriceCasier,
        sell_price_bottle=prod.sellPriceBottle,
        current_stock_bottles=prod.currentStockBottles,
        stock_glaces=glaces,
        stock_non_glaces=non_glaces,
        min_alert_threshold_bottles=prod.minAlertThresholdBottles,
        image_url=prod.imageUrl or "🍺",
    )
    db.add(db_prod)
    db.commit()
    db.refresh(db_prod)

    # Broadcast stock update via WebSocket
    await manager.broadcast("PRODUCT_CREATED", {"productId": db_prod.id, "name": db_prod.name})
    return db_prod


@app.put("/api/products/{product_id}", response_model=ProductResponse)
async def update_product(product_id: str, prod: ProductCreate, db: Session = Depends(get_db)):
    db_prod = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if not db_prod:
        raise HTTPException(status_code=404, detail="Produit introuvable")

    db_prod.name = prod.name
    db_prod.brand = prod.brand
    db_prod.supplier = prod.supplier
    db_prod.category = prod.category
    db_prod.format = prod.format
    db_prod.bottles_per_casier = prod.bottlesPerCasier
    db_prod.buy_price_casier = prod.buyPriceCasier
    db_prod.sell_price_bottle = prod.sellPriceBottle
    db_prod.current_stock_bottles = prod.currentStockBottles
    if prod.stockGlaces is not None:
        db_prod.stock_glaces = prod.stockGlaces
    if prod.stockNonGlaces is not None:
        db_prod.stock_non_glaces = prod.stockNonGlaces
    db_prod.min_alert_threshold_bottles = prod.minAlertThresholdBottles
    db_prod.image_url = prod.imageUrl or "🍺"

    db.commit()
    db.refresh(db_prod)

    await manager.broadcast("PRODUCT_UPDATED", {"productId": db_prod.id, "newStock": db_prod.current_stock_bottles})
    return db_prod


@app.delete("/api/products/{product_id}")
async def delete_product(product_id: str, db: Session = Depends(get_db)):
    db_prod = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if not db_prod:
        raise HTTPException(status_code=404, detail="Produit introuvable")

    db.delete(db_prod)
    db.commit()
    await manager.broadcast("PRODUCT_DELETED", {"productId": product_id})
    return {"message": "Produit supprimé avec succès"}


@app.post("/api/products/{product_id}/restock")
async def restock_product(
    product_id: str, casiers: int, notes: Optional[str] = "", db: Session = Depends(get_db)
):
    db_prod = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if not db_prod:
        raise HTTPException(status_code=404, detail="Produit introuvable")

    bottles_added = casiers * db_prod.bottles_per_casier
    db_prod.current_stock_bottles += bottles_added
    db_prod.stock_non_glaces += bottles_added

    movement = MovementModel(
        id=f"MOV-IN-{int(time.time() * 1000)}",
        date=datetime.utcnow(),
        type="Entrée (Livraison)",
        supplier=db_prod.supplier,
        product_name=db_prod.name,
        quantity_bottles=bottles_added,
        casiers_count=casiers,
        unit_cost_casier=db_prod.buy_price_casier,
        total_cost=casiers * db_prod.buy_price_casier,
        notes=notes or "Réapprovisionnement camion",
    )
    db.add(movement)
    db.commit()

    # Broadcast real-time stock update to all connected tablets
    await manager.broadcast(
        "STOCK_UPDATED",
        {
            "productId": product_id,
            "productName": db_prod.name,
            "addedBottles": bottles_added,
            "newStock": db_prod.current_stock_bottles,
        },
    )
    return {"message": "Stock rechargé avec succès", "newStock": db_prod.current_stock_bottles}


# --- SALES ROUTES ---

@app.get("/api/sales", response_model=List[SaleResponse])
def get_sales(db: Session = Depends(get_db)):
    sales = db.query(SaleModel).order_by(SaleModel.timestamp.desc()).all()
    return sales


@app.post("/api/sales", response_model=SaleResponse)
async def create_sale(sale: SaleCreate, db: Session = Depends(get_db)):
    if not sale.items:
        raise HTTPException(status_code=400, detail="La commande ne contient aucun article")

    # Verify stock levels
    raw_total = 0.0
    items_to_create = []

    for item in sale.items:
        db_prod = db.query(ProductModel).filter(ProductModel.id == item.id).first()
        if not db_prod:
            raise HTTPException(status_code=404, detail=f"Produit {item.name} introuvable")

        if db_prod.current_stock_bottles < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Stock insuffisant pour {db_prod.name}. Reste: {db_prod.current_stock_bottles} btl(s)",
            )

        # Deduct chilled first then non-chilled
        glaced_current = db_prod.stock_glaces or 0
        deduct_glaced = min(glaced_current, item.quantity)
        remaining_deduct = item.quantity - deduct_glaced

        db_prod.stock_glaces = max(0, glaced_current - deduct_glaced)
        db_prod.stock_non_glaces = max(0, (db_prod.stock_non_glaces or 0) - remaining_deduct)
        db_prod.current_stock_bottles = max(0, db_prod.current_stock_bottles - item.quantity)

        line_total = item.quantity * item.unitPrice
        raw_total += line_total

        items_to_create.append(
            {
                "product_id": db_prod.id,
                "product_name": db_prod.name,
                "quantity": item.quantity,
                "unit_price": item.unitPrice,
                "total": line_total,
                "supplier": db_prod.supplier,
                "bottles_per_casier": db_prod.bottles_per_casier,
                "buy_price_casier": db_prod.buy_price_casier,
            }
        )

    final_total = max(0.0, raw_total - sale.discount)
    sale_id = f"REC-{int(time.time())}"

    db_sale = SaleModel(
        id=sale_id,
        timestamp=datetime.utcnow(),
        server=sale.server,
        table_name=sale.table,
        raw_total=raw_total,
        discount=sale.discount,
        total_amount=final_total,
        payment_method=sale.paymentMethod,
    )
    db.add(db_sale)
    db.commit()

    # Create sale items and exit movements
    for item_data in items_to_create:
        db_item = SaleItemModel(
            sale_id=sale_id,
            product_id=item_data["product_id"],
            product_name=item_data["product_name"],
            quantity=item_data["quantity"],
            unit_price=item_data["unit_price"],
            total=item_data["total"],
        )
        db.add(db_item)

        movement = MovementModel(
            id=f"MOV-OUT-{int(time.time() * 1000)}-{item_data['product_id']}",
            date=datetime.utcnow(),
            type="Sortie (Vente Caisse)",
            supplier=item_data["supplier"],
            product_name=item_data["product_name"],
            quantity_bottles=item_data["quantity"],
            casiers_count=round(item_data["quantity"] / item_data["bottles_per_casier"], 1),
            unit_cost_casier=item_data["buy_price_casier"],
            total_cost=item_data["total"],
            notes=f"Vente Table {sale.table} / Reçu #{sale_id}",
        )
        db.add(movement)

    db.commit()
    db.refresh(db_sale)

    # REAL-TIME WEBSOCKET BROADCAST to all connected tablet terminals!
    await manager.broadcast(
        "SALE_CREATED",
        {
            "saleId": sale_id,
            "table": sale.table,
            "server": sale.server,
            "totalAmount": final_total,
            "items": [
                {"id": i["product_id"], "name": i["product_name"], "qty": i["quantity"]}
                for i in items_to_create
            ],
        },
    )

    return db_sale


@app.delete("/api/sales/{sale_id}")
async def delete_sale(sale_id: str, db: Session = Depends(get_db)):
    db_sale = db.query(SaleModel).filter(SaleModel.id == sale_id).first()
    if not db_sale:
        raise HTTPException(status_code=404, detail="Facture introuvable")

    # Restore stock for each item in the cancelled sale
    for item in db_sale.items:
        db_prod = db.query(ProductModel).filter(ProductModel.id == item.product_id).first()
        if db_prod:
            db_prod.current_stock_bottles += item.quantity

    db.delete(db_sale)
    db.commit()

    await manager.broadcast("SALE_DELETED", {"saleId": sale_id})
    return {"message": f"Facture #{sale_id} supprimée et stock restauré avec succès"}


# --- MOVEMENTS ROUTES ---

@app.get("/api/movements", response_model=List[MovementResponse])
def get_movements(db: Session = Depends(get_db)):
    movements = db.query(MovementModel).order_by(MovementModel.date.desc()).all()
    return movements


# --- AI PREDICTION ROUTE ---

@app.post("/api/ai/predict")
def predict_stock_demand(prompt: str = "Bon de commande SABC", db: Session = Depends(get_db)):
    products = db.query(ProductModel).all()
    critical = [p for p in products if p.current_stock_bottles <= p.min_alert_threshold_bottles]

    sabc_critical = [p for p in critical if "SABC" in p.supplier]
    gn_critical = [p for p in critical if "Guinness" in p.supplier]

    report = f"📦 **RAPPORT INTELLIGENT DE COMMANDE - TERRASSE BARS MANAGER**\n"
    report += f"Généré le: {datetime.now().strftime('%d/%m/%Y %H:%M')}\n\n"

    report += f"🔹 **COMMANDES URGENTES SABC CAMEROUN**:\n"
    if sabc_critical:
        for p in sabc_critical:
            casiers = int((p.min_alert_threshold_bottles * 2 - p.current_stock_bottles) / p.bottles_per_casier) + 1
            report += f" - {p.name}: {casiers} casier(s) [Stock actuel: {p.current_stock_bottles} btls]\n"
    else:
        report += " - Aucun produit SABC sous le seuil critique.\n"

    report += f"\n🔸 **COMMANDES URGENTES GUINNESS CAMEROUN**:\n"
    if gn_critical:
        for p in gn_critical:
            casiers = int((p.min_alert_threshold_bottles * 2 - p.current_stock_bottles) / p.bottles_per_casier) + 1
            report += f" - {p.name}: {casiers} casier(s) [Stock actuel: {p.current_stock_bottles} btls]\n"
    else:
        report += " - Aucun produit Guinness sous le seuil critique.\n"

    report += f"\n💡 *Conseil IA*: Effectuez la validation auprès des répartiteurs avant vendredi 14h."

    return {"prediction": report, "criticalCount": len(critical)}


@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": "Terrasse Bars Manager API",
        "ws_endpoint": "ws://localhost:8000/ws",
        "documentation": "/docs",
    }
