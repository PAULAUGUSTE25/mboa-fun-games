import { createContext, useContext, useState, useEffect, useRef } from "react";
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

  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== "undefined" ? navigator.onLine : true));
  const [isSyncing, setIsSyncing] = useState(false);

  const [offlineQueue, setOfflineQueue] = useState(() => {
    const saved = localStorage.getItem("terrasse_bar_offline_queue");
    return saved ? JSON.parse(saved) : [];
  });

  // Track state changes locally
  const productsRef = useRef(products);
  const salesRef = useRef(sales);
  const movementsRef = useRef(movements);

  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  useEffect(() => {
    salesRef.current = sales;
  }, [sales]);

  useEffect(() => {
    movementsRef.current = movements;
  }, [movements]);

  useEffect(() => {
    localStorage.setItem("terrasse_bar_offline_queue", JSON.stringify(offlineQueue));
  }, [offlineQueue]);

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

  // Helper to persist state to LocalStorage, BroadcastChannel, and Cloud Room
  const persistState = async (newProducts, newSales, newMovements) => {
    if (newProducts) {
      setProducts(newProducts);
      localStorage.setItem("terrasse_bar_products", JSON.stringify(newProducts));
    }
    if (newSales) {
      setSales(newSales);
      localStorage.setItem("terrasse_bar_sales", JSON.stringify(newSales));
    }
    if (newMovements) {
      setMovements(newMovements);
      localStorage.setItem("terrasse_bar_movements", JSON.stringify(newMovements));
    }

    // Broadcast across browser tabs
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        const bc = new BroadcastChannel("terrasse_pos_channel");
        bc.postMessage({ type: "DATA_CHANGED" });
        bc.close();
      } catch (e) {}
    }

    // Push to Cloud Room for remote multi-phone real-time sync
    const stateToPush = {
      products: newProducts || productsRef.current,
      sales: newSales || salesRef.current,
      movements: newMovements || movementsRef.current,
    };
    await cloudSync.saveRoomData(stateToPush);
  };

  // Synchronize state with FastAPI backend or Remote Cloud Room
  const fetchBackendData = async () => {
    try {
      const prods = await api.getProducts();
      const fetchedSales = await api.getSales();
      const fetchedMovs = await api.getMovements();

      if (prods && prods.length > 0) {
        // Map backend products ensuring stockGlaces & stockNonGlaces are set
        const formattedProds = prods.map((p) => {
          const glaced = p.stockGlaces !== undefined && p.stockGlaces !== null
            ? p.stockGlaces
            : Math.floor((p.currentStockBottles || 0) * 0.6);
          const nonGlaced = p.stockNonGlaces !== undefined && p.stockNonGlaces !== null
            ? p.stockNonGlaces
            : ((p.currentStockBottles || 0) - glaced);
          return {
            ...p,
            stockGlaces: glaced,
            stockNonGlaces: nonGlaced,
          };
        });

        setProducts(formattedProds);
        localStorage.setItem("terrasse_bar_products", JSON.stringify(formattedProds));
      }
      if (fetchedSales) {
        setSales(fetchedSales);
        localStorage.setItem("terrasse_bar_sales", JSON.stringify(fetchedSales));
      }
      if (fetchedMovs) {
        setMovements(fetchedMovs);
        localStorage.setItem("terrasse_bar_movements", JSON.stringify(fetchedMovs));
      }

      setIsBackendConnected(true);
      
      // Also push to Cloud Room so remote clients without local backend access get updated
      cloudSync.saveRoomData({
        products: prods || productsRef.current,
        sales: fetchedSales || salesRef.current,
        movements: fetchedMovs || movementsRef.current,
      });
    } catch (e) {
      setIsBackendConnected(false);

      // Shared online cloud room sync (for Netlify & multi-phone online sync)
      try {
        const cloudData = await cloudSync.getRoomData();
        if (cloudData) {
          if (cloudData.products && Array.isArray(cloudData.products) && cloudData.products.length > 0) {
            setProducts(cloudData.products);
            localStorage.setItem("terrasse_bar_products", JSON.stringify(cloudData.products));
          }
          if (cloudData.sales && Array.isArray(cloudData.sales)) {
            setSales(cloudData.sales);
            localStorage.setItem("terrasse_bar_sales", JSON.stringify(cloudData.sales));
          }
          if (cloudData.movements && Array.isArray(cloudData.movements)) {
            setMovements(cloudData.movements);
            localStorage.setItem("terrasse_bar_movements", JSON.stringify(cloudData.movements));
          }
        }
      } catch (errCloud) {
        console.warn("[BarContext] Cloud sync fetch error:", errCloud);
      }
    }
  };

  const syncOfflineQueue = async () => {
    const queueData = JSON.parse(localStorage.getItem("terrasse_bar_offline_queue") || "[]");
    if (queueData.length === 0) return;

    setIsSyncing(true);

    if (isBackendConnected) {
      const remainingQueue = [];
      for (const item of queueData) {
        try {
          await api.createSale(item.payload);
        } catch (err) {
          remainingQueue.push(item);
        }
      }
      setOfflineQueue(remainingQueue);
    } else {
      await cloudSync.saveRoomData({
        products: productsRef.current,
        sales: salesRef.current,
        movements: movementsRef.current,
      });
      setOfflineQueue([]);
      localStorage.removeItem("terrasse_bar_offline_queue");
    }

    setIsSyncing(false);
    await fetchBackendData();
  };

  useEffect(() => {
    // Initial fetch on mount
    fetchBackendData();

    // BroadcastChannel for cross-tab sync
    let broadcastChannel = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      broadcastChannel = new BroadcastChannel("terrasse_pos_channel");
      broadcastChannel.onmessage = (event) => {
        if (event.data && event.data.type === "DATA_CHANGED") {
          fetchBackendData();
        }
      };
    }

    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // WebSocket for real-time multi-tablet synchronization
    const socket = api.connectWebSocket((eventPayload) => {
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

    // Real-time polling every 1.5 seconds across all phones/tablets
    const pollInterval = setInterval(() => {
      if (navigator.onLine) {
        fetchBackendData();
      }
    }, 1500);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(pollInterval);
      if (socket) socket.close();
      if (broadcastChannel) broadcastChannel.close();
    };
  }, []);

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

  // Validate Sale (Synchronizes real-time across all devices)
  const validateSale = async (paymentMethod = "Espèces", discountAmount = 0) => {
    if (cart.length === 0) return false;

    const totalRaw = cart.reduce((sum, item) => sum + item.sellPriceBottle * item.quantity, 0);
    const finalTotal = Math.max(0, totalRaw - discountAmount);

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

    // Calculate updated products with stock deduction
    const updatedProducts = products.map((prod) => {
      const cartItem = cart.find((item) => item.id === prod.id);
      if (cartItem) {
        const soldQty = cartItem.quantity;
        const currentGlaced = prod.stockGlaces !== undefined ? prod.stockGlaces : Math.floor((prod.currentStockBottles || 0) * 0.6);
        const currentNonGlaced = prod.stockNonGlaces !== undefined ? prod.stockNonGlaces : ((prod.currentStockBottles || 0) - currentGlaced);

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

    const updatedSales = [newReceipt, ...sales];
    const newMovements = cart.map((item) => ({
      id: `MOV-OUT-${Date.now()}-${item.id}`,
      date: new Date().toISOString(),
      type: "Sortie (Vente Caisse)",
      supplier: item.supplier || "SABC / Guinness",
      productName: item.name,
      quantityBottles: item.quantity,
      casiersCount: Number((item.quantity / (item.bottlesPerCasier || 12)).toFixed(1)),
      unitCostCasier: item.buyPriceCasier || 0,
      totalCost: item.quantity * item.sellPriceBottle,
      notes: `Vente Table ${activeTable.name} / Reçu #${newReceipt.id}`,
    }));
    const updatedMovements = [...newMovements, ...movements];

    // Immediately persist and push to cloud room
    await persistState(updatedProducts, updatedSales, updatedMovements);
    setLatestReceipt(newReceipt);
    clearCart();
    setIsReceiptModalOpen(true);

    // Try sending to FastAPI backend asynchronously if connected
    if (isBackendConnected) {
      try {
        await api.createSale(salePayload);
        fetchBackendData();
      } catch (err) {
        console.warn("Backend sale sync error, saved in cloud room:", err);
      }
    }

    return true;
  };

  // Transfer ambient bottles to chilled stock (Mettre au frais)
  const transferToGlaces = async (productId, qtyBottles) => {
    const updatedProducts = products.map((prod) => {
      if (prod.id === productId) {
        const currentGlaced = prod.stockGlaces !== undefined ? prod.stockGlaces : Math.floor((prod.currentStockBottles || 0) * 0.6);
        const currentNonGlaced = prod.stockNonGlaces !== undefined ? prod.stockNonGlaces : ((prod.currentStockBottles || 0) - currentGlaced);

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
    });

    await persistState(updatedProducts, sales, movements);

    if (isBackendConnected) {
      const targetProd = updatedProducts.find((p) => p.id === productId);
      if (targetProd) {
        try {
          await api.updateProduct(productId, targetProd);
        } catch (e) {}
      }
    }
  };

  const addRestockMovement = async (productId, casiersCount, unitCost, notes = "") => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const bottlesAdded = casiersCount * product.bottlesPerCasier;

    const currentGlaced = product.stockGlaces !== undefined ? product.stockGlaces : Math.floor((product.currentStockBottles || 0) * 0.6);
    const currentNonGlaced = product.stockNonGlaces !== undefined ? product.stockNonGlaces : ((product.currentStockBottles || 0) - currentGlaced);

    const newNonGlaced = currentNonGlaced + bottlesAdded;
    const newTotal = currentGlaced + newNonGlaced;

    const updatedProducts = products.map((p) =>
      p.id === productId
        ? {
            ...p,
            currentStockBottles: newTotal,
            stockGlaces: currentGlaced,
            stockNonGlaces: newNonGlaced,
          }
        : p
    );

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
    const updatedMovements = [newMov, ...movements];

    await persistState(updatedProducts, sales, updatedMovements);

    if (isBackendConnected) {
      try {
        await api.restockProduct(productId, casiersCount, notes);
        fetchBackendData();
      } catch (e) {}
    }
  };

  const addProduct = async (productData) => {
    const totalStock = Number(productData.currentStockBottles) || 0;
    const glaces = productData.stockGlaces !== undefined ? Number(productData.stockGlaces) : Math.floor(totalStock * 0.6);
    const nonGlaces = productData.stockNonGlaces !== undefined ? Number(productData.stockNonGlaces) : (totalStock - glaces);

    const newProd = {
      ...productData,
      id: productData.id || `prod-${Date.now()}`,
      currentStockBottles: totalStock,
      stockGlaces: glaces,
      stockNonGlaces: nonGlaces,
    };

    const updatedProducts = [newProd, ...products];
    setProducts(updatedProducts);
    productsRef.current = updatedProducts;
    localStorage.setItem("terrasse_bar_products", JSON.stringify(updatedProducts));
    await persistState(updatedProducts, sales, movements);

    if (isBackendConnected) {
      try {
        await api.addProduct(newProd);
      } catch (e) {
        console.warn("[BarContext] Backend addProduct error:", e);
      }
    }
  };

  const updateProduct = async (updatedProd) => {
    const updatedProducts = products.map((p) => (p.id === updatedProd.id ? { ...p, ...updatedProd } : p));
    setProducts(updatedProducts);
    productsRef.current = updatedProducts;
    localStorage.setItem("terrasse_bar_products", JSON.stringify(updatedProducts));
    await persistState(updatedProducts, sales, movements);

    if (isBackendConnected) {
      try {
        await api.updateProduct(updatedProd.id, updatedProd);
      } catch (e) {
        console.warn("[BarContext] Backend updateProduct error:", e);
      }
    }
  };

  const deleteProduct = async (id) => {
    if (confirm("Voulez-vous vraiment supprimer ce produit de l'inventaire ?")) {
      const updatedProducts = products.filter((p) => p.id !== id);
      setProducts(updatedProducts);
      productsRef.current = updatedProducts;
      localStorage.setItem("terrasse_bar_products", JSON.stringify(updatedProducts));
      await persistState(updatedProducts, sales, movements);

      if (isBackendConnected) {
        try {
          await api.deleteProduct(id);
        } catch (e) {
          console.warn("[BarContext] Backend deleteProduct error:", e);
        }
      }
    }
  };

  const deleteSale = async (saleId, restoreStock = true) => {
    const saleToDelete = sales.find((s) => s.id === saleId);
    let updatedProducts = [...products];

    if (restoreStock && saleToDelete && saleToDelete.items) {
      updatedProducts = products.map((prod) => {
        const itemInSale = saleToDelete.items.find(
          (i) => i.id === prod.id || i.product_id === prod.id
        );
        if (itemInSale) {
          const qtyToReturn = itemInSale.quantity || 0;
          const currentGlaced = prod.stockGlaces !== undefined ? prod.stockGlaces : Math.floor((prod.currentStockBottles || 0) * 0.6);
          const currentNonGlaced = prod.stockNonGlaces !== undefined ? prod.stockNonGlaces : ((prod.currentStockBottles || 0) - currentGlaced);
          
          return {
            ...prod,
            currentStockBottles: prod.currentStockBottles + qtyToReturn,
            stockGlaces: currentGlaced + qtyToReturn,
          };
        }
        return prod;
      });
    }

    const updatedSales = sales.filter((s) => s.id !== saleId);
    await persistState(updatedProducts, updatedSales, movements);

    if (isBackendConnected) {
      try {
        await api.deleteSale(saleId);
        fetchBackendData();
      } catch (e) {}
    }
  };

  const resetCatalog = async () => {
    if (confirm("Réinitialiser le catalogue avec les données d'origine sur TOUS les téléphones ?")) {
      localStorage.removeItem("terrasse_bar_products");
      localStorage.removeItem("terrasse_bar_sales");
      localStorage.removeItem("terrasse_bar_movements");
      localStorage.removeItem("terrasse_bar_offline_queue");
      setOfflineQueue([]);

      await persistState(INITIAL_PRODUCTS, INITIAL_SALES_DEMO, []);
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
        fetchBackendData,
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
