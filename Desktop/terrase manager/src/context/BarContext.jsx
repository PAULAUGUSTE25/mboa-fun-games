import { createContext, useContext, useState, useEffect } from "react";
import { INITIAL_PRODUCTS, INITIAL_SALES_DEMO, INITIAL_TABLES } from "../data/sabcGuinnessCatalog";
import { api, cloudSync } from "../api/client";

export const USERS = [
  { id: "u-paul", name: "Paul (Administrateur)", role: "ADMIN", pin: "1234" },
  { id: "u-serveur1", name: "Serveur 1", role: "SERVEUR", pin: "0000" },
  { id: "u-serveur2", name: "Serveur 2", role: "SERVEUR", pin: "1111" },
  { id: "u-serveur3", name: "Serveur 3", role: "SERVEUR", pin: "2222" },
];

const BarContext = createContext();

export function BarProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("terrasse_bar_user");
    return saved ? JSON.parse(saved) : USERS[1];
  });

  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem("terrasse_bar_products");
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [sales, setSales] = useState(() => {
    const saved = localStorage.getItem("terrasse_bar_sales");
    return saved ? JSON.parse(saved) : INITIAL_SALES_DEMO;
  });

  const [movements, setMovements] = useState(() => {
    const saved = localStorage.getItem("terrasse_bar_movements");
    return saved ? JSON.parse(saved) : [];
  });

  const [cart, setCart] = useState([]);
  const [activeTable, setActiveTable] = useState(INITIAL_TABLES[0]);
  const [activeServer, setActiveServer] = useState(() => currentUser?.name || "Jean-Paul (Barman)");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [latestReceipt, setLatestReceipt] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const login = (userId, pin) => {
    const targetUser = USERS.find((u) => u.id === userId);
    if (targetUser && targetUser.pin === pin) {
      setCurrentUser(targetUser);
      setActiveServer(targetUser.name);
      localStorage.setItem("terrasse_bar_user", JSON.stringify(targetUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("terrasse_bar_user");
  };

  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== "undefined" ? navigator.onLine : true);
  const [isSyncing, setIsSyncing] = useState(false);

  const [offlineQueue, setOfflineQueue] = useState(() => {
    const saved = localStorage.getItem("terrasse_bar_offline_queue");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("terrasse_bar_offline_queue", JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  // Sync with FastAPI backend or Shared Cloud Room
  const fetchBackendData = async () => {
    try {
      const prods = await api.getProducts();
      if (prods && prods.length > 0) {
        setProducts(prods);
      }
      const fetchedSales = await api.getSales();
      if (fetchedSales) {
        setSales(fetchedSales);
      }
      const fetchedMovs = await api.getMovements();
      if (fetchedMovs) {
        setMovements(fetchedMovs);
      }
      setIsBackendConnected(true);
      console.log("[BarContext] Successfully synchronized with FastAPI Backend & Database!");
    } catch (e) {
      console.log("[BarContext] Local FastAPI Backend unreachable. Trying Cloud Sync Room...");
      setIsBackendConnected(false);

      // Shared online cloud room sync (for Netlify & multi-phone online sync)
      try {
        const cloudData = await cloudSync.getRoomData();
        if (cloudData) {
          if (cloudData.products && Array.isArray(cloudData.products)) {
            setProducts(cloudData.products);
          }
          if (cloudData.sales && Array.isArray(cloudData.sales)) {
            setSales(cloudData.sales);
          }
          if (cloudData.movements && Array.isArray(cloudData.movements)) {
            setMovements(cloudData.movements);
          }
          console.log("[BarContext] Successfully synchronized with Shared Online Cloud Room!");
        }
      } catch (errCloud) {
        console.warn("[BarContext] Cloud room sync fallback error:", errCloud);
      }
    }
  };

  const syncOfflineQueue = async () => {
    const queueData = JSON.parse(localStorage.getItem("terrasse_bar_offline_queue") || "[]");
    if (queueData.length === 0) return;

    setIsSyncing(true);
    console.log(`[BarContext AutoSync] Processing ${queueData.length} offline sale(s)...`);

    const remainingQueue = [];
    for (const item of queueData) {
      try {
        await api.createSale(item.payload);
        console.log(`[BarContext AutoSync] Successfully synced offline sale for table ${item.payload.table}`);
      } catch (err) {
        console.warn(`[BarContext AutoSync] Failed to sync sale for table ${item.payload.table}, keeping in queue`, err);
        remainingQueue.push(item);
      }
    }

    setOfflineQueue(remainingQueue);
    setIsSyncing(false);
    await fetchBackendData();
  };

  useEffect(() => {
    fetchBackendData();

    // BroadcastChannel for instant cross-tab / cross-window synchronization
    let broadcastChannel = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      broadcastChannel = new BroadcastChannel("terrasse_pos_channel");
      broadcastChannel.onmessage = (event) => {
        console.log("[BroadcastChannel Message]:", event.data);
        if (event.data && event.data.type === "DATA_CHANGED") {
          fetchBackendData();
        }
      };
    }

    const handleOnline = () => {
      setIsOnline(true);
      console.log("[BarContext] Reconnected online! Triggering background sync...");
      syncOfflineQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log("[BarContext] Connection lost. Switching to offline queue mode.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Connect WebSocket for real-time multi-tablet synchronization
    const socket = api.connectWebSocket((eventPayload) => {
      console.log("[BarContext WS Event]:", eventPayload);

      if (
        eventPayload.event === "SALE_CREATED" ||
        eventPayload.event === "SALE_DELETED" ||
        eventPayload.event === "STOCK_UPDATED" ||
        eventPayload.event === "PRODUCT_CREATED" ||
        eventPayload.event === "PRODUCT_UPDATED"
      ) {
        fetchBackendData();
      }
    });

    // Background polling fallback every 8 seconds to ensure total multi-phone sync
    const pollInterval = setInterval(() => {
      if (navigator.onLine) {
        fetchBackendData();
      }
    }, 8000);

    // Auto sync on startup if items exist in queue and online
    if (navigator.onLine && offlineQueue.length > 0) {
      syncOfflineQueue();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(pollInterval);
      if (socket) socket.close();
      if (broadcastChannel) broadcastChannel.close();
    };
  }, []);

  // Sync fallback local persistence & Online Cloud Room Broadcast
  useEffect(() => {
    localStorage.setItem("terrasse_bar_products", JSON.stringify(products));
    localStorage.setItem("terrasse_bar_sales", JSON.stringify(sales));
    localStorage.setItem("terrasse_bar_movements", JSON.stringify(movements));

    // Broadcast across local browser tabs
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        const bc = new BroadcastChannel("terrasse_pos_channel");
        bc.postMessage({ type: "DATA_CHANGED" });
        bc.close();
      } catch (e) {}
    }

    // Save to Cloud Room so all online devices (e.g. Netlify) stay 100% in sync
    if (!isBackendConnected && navigator.onLine) {
      cloudSync.saveRoomData({ products, sales, movements });
    }
  }, [products, sales, movements, isBackendConnected]);

  // Cart operations
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        const newQty = updated[existingIndex].quantity + 1;
        if (newQty > product.currentStockBottles) {
          alert(`Stock insuffisant ! Il ne reste que ${product.currentStockBottles} bouteille(s).`);
          return prevCart;
        }
        updated[existingIndex].quantity = newQty;
        return updated;
      } else {
        if (product.currentStockBottles < 1) {
          alert(`Rupture de stock pour ${product.name} !`);
          return prevCart;
        }
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateCartQty = (productId, delta) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id === productId) {
            const productRef = products.find((p) => p.id === productId);
            const newQty = item.quantity + delta;
            if (newQty > (productRef?.currentStockBottles || 999)) {
              alert(`Stock maximum atteint (${productRef.currentStockBottles} btl).`);
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const clearCart = () => setCart([]);

  // Validate Sale (Tries Backend API first; falls back to local Context)
  const validateSale = async (paymentMethod = "Espèces", discountAmount = 0) => {
    if (cart.length === 0) return false;

    const salePayload = {
      server: activeServer,
      table: activeTable.name,
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.sellPriceBottle,
      })),
      discount: discountAmount,
      paymentMethod: paymentMethod,
    };

    try {
      const createdSale = await api.createSale(salePayload);
      setLatestReceipt(createdSale);
      await fetchBackendData();
      clearCart();
      setIsReceiptModalOpen(true);
      return true;
    } catch (err) {
      console.warn("Backend sale validation error, using local state fallback:", err);

      // Local state fallback
      const totalRaw = cart.reduce((sum, item) => sum + item.sellPriceBottle * item.quantity, 0);
      const finalTotal = Math.max(0, totalRaw - discountAmount);

      const newReceipt = {
        id: `REC-${Date.now().toString().slice(-6)}`,
        timestamp: new Date().toISOString(),
        server: activeServer,
        table: activeTable.name,
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.sellPriceBottle,
          total: item.quantity * item.sellPriceBottle,
        })),
        rawTotal: totalRaw,
        discount: discountAmount,
        totalAmount: finalTotal,
        paymentMethod: paymentMethod,
      };

      setProducts((prevProducts) => {
        return prevProducts.map((prod) => {
          const cartItem = cart.find((item) => item.id === prod.id);
          if (cartItem) {
            const soldQty = cartItem.quantity;
            const currentGlaced = prod.stockGlaces !== undefined ? prod.stockGlaces : Math.floor(prod.currentStockBottles * 0.6);
            const currentNonGlaced = prod.stockNonGlaces !== undefined ? prod.stockNonGlaces : (prod.currentStockBottles - currentGlaced);
            
            // Deduct from chilled stock first, then from ambient if needed
            const deductFromGlaces = Math.min(currentGlaced, soldQty);
            const remainingDeduct = soldQty - deductFromGlaces;
            
            const newGlaced = Math.max(0, currentGlaced - deductFromGlaces);
            const newNonGlaced = Math.max(0, currentNonGlaced - remainingDeduct);
            const newTotal = newGlaced + newNonGlaced;
            
            return {
              ...prod,
              currentStockBottles: newTotal,
              stockGlaces: newGlaced,
              stockNonGlaces: newNonGlaced,
              soldBottles: (prod.soldBottles || 0) + soldQty,
            };
          }
          return prod;
        });
      });

      // Enqueue for background sync when connection is restored
      setOfflineQueue((prevQueue) => [
        ...prevQueue,
        { payload: salePayload, timestamp: new Date().toISOString() },
      ]);

      setSales((prev) => [newReceipt, ...prev]);
      setLatestReceipt(newReceipt);
      clearCart();
      setIsReceiptModalOpen(true);
      return true;
    }
  };

  // Transfer ambient bottles to chilled stock (Mettre au frais)
  const transferToGlaces = (productId, qtyBottles) => {
    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id === productId) {
          const currentGlaced = prod.stockGlaces !== undefined ? prod.stockGlaces : Math.floor(prod.currentStockBottles * 0.6);
          const currentNonGlaced = prod.stockNonGlaces !== undefined ? prod.stockNonGlaces : (prod.currentStockBottles - currentGlaced);
          
          const qtyToMove = Math.min(currentNonGlaced, qtyBottles);
          const newGlaced = currentGlaced + qtyToMove;
          const newNonGlaced = currentNonGlaced - qtyToMove;

          return {
            ...prod,
            stockGlaces: newGlaced,
            stockNonGlaces: newNonGlaced,
          };
        }
        return prod;
      })
    );
  };

  const addRestockMovement = async (productId, casiersCount, unitCost, notes = "") => {
    try {
      await api.restockProduct(productId, casiersCount, notes);
      await fetchBackendData();
    } catch (e) {
      // Local fallback
      const product = products.find((p) => p.id === productId);
      if (!product) return;
      const bottlesAdded = casiersCount * product.bottlesPerCasier;

      const newMov = {
        id: `MOV-IN-${Date.now()}`,
        date: new Date().toISOString(),
        type: "Entrée (Livraison)",
        supplier: product.supplier,
        productName: product.name,
        quantityBottles: bottlesAdded,
        casiersCount: casiersCount,
        unitCostCasier: unitCost || product.buyPriceCasier,
        totalCost: casiersCount * (unitCost || product.buyPriceCasier),
        notes: notes || "Livraison camion",
      };

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, currentStockBottles: p.currentStockBottles + bottlesAdded }
            : p
        )
      );
      setMovements((prev) => [newMov, ...prev]);
    }
  };

  const addProduct = async (productData) => {
    try {
      await api.addProduct(productData);
      await fetchBackendData();
    } catch (e) {
      setProducts((prev) => [{ ...productData, id: `prod-${Date.now()}` }, ...prev]);
    }
  };

  const updateProduct = async (updatedProd) => {
    try {
      await api.updateProduct(updatedProd.id, updatedProd);
      await fetchBackendData();
    } catch (e) {
      setProducts((prev) => prev.map((p) => (p.id === updatedProd.id ? updatedProd : p)));
    }
  };

  const deleteProduct = async (id) => {
    if (confirm("Voulez-vous vraiment supprimer ce produit de l'inventaire ?")) {
      try {
        await api.deleteProduct(id);
        await fetchBackendData();
      } catch (e) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    }
  };

  const deleteSale = async (saleId, restoreStock = true) => {
    const saleToDelete = sales.find((s) => s.id === saleId);

    // If restoreStock is requested, restore bottle quantities to products
    if (restoreStock && saleToDelete && saleToDelete.items) {
      setProducts((prevProducts) =>
        prevProducts.map((prod) => {
          const itemInSale = saleToDelete.items.find(
            (i) => i.id === prod.id || i.product_id === prod.id
          );
          if (itemInSale) {
            const qtyToReturn = itemInSale.quantity || 0;
            const newTotal = (prod.currentStockBottles || 0) + qtyToReturn;
            const currentGlaced =
              prod.stockGlaces !== undefined
                ? prod.stockGlaces
                : Math.floor((prod.currentStockBottles || 0) * 0.6);
            return {
              ...prod,
              currentStockBottles: newTotal,
              stockGlaces: currentGlaced + qtyToReturn,
            };
          }
          return prod;
        })
      );
    }

    try {
      await api.deleteSale(saleId);
      await fetchBackendData();
    } catch (e) {
      setSales((prev) => prev.filter((s) => s.id !== saleId));
    }
  };

  const resetCatalog = () => {
    if (confirm("Réinitialiser le catalogue avec les données d'origine ?")) {
      setProducts(INITIAL_PRODUCTS);
      setSales(INITIAL_SALES_DEMO);
      localStorage.removeItem("terrasse_bar_products");
      localStorage.removeItem("terrasse_bar_sales");
      localStorage.removeItem("terrasse_bar_movements");
      localStorage.removeItem("terrasse_bar_offline_queue");
      setOfflineQueue([]);
    }
  };

  return (
    <BarContext.Provider
      value={{
        USERS,
        currentUser,
        login,
        logout,
        products,
        sales,
        deleteSale,
        movements,
        cart,
        activeTable,
        setActiveTable,
        activeServer,
        setActiveServer,
        activeTab,
        setActiveTab,
        latestReceipt,
        isReceiptModalOpen,
        setIsReceiptModalOpen,
        isBackendConnected,
        isOnline,
        isSyncing,
        offlineQueue,
        syncOfflineQueue,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        validateSale,
        addRestockMovement,
        transferToGlaces,
        addProduct,
        updateProduct,
        deleteProduct,
        resetCatalog,
      }}
    >
      {children}
    </BarContext.Provider>
  );
}

export function useBar() {
  const context = useContext(BarContext);
  if (!context) throw new Error("useBar must be used within BarProvider");
  return context;
}
