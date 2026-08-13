const API_BASE_URL = "http://localhost:8000/api";
const WS_URL = "ws://localhost:8000/ws";

export const api = {
  // Products
  async getProducts() {
    const res = await fetch(`${API_BASE_URL}/products`);
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json();
  },

  async addProduct(productData) {
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });
    if (!res.ok) throw new Error("Failed to create product");
    return res.json();
  },

  async updateProduct(id, productData) {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });
    if (!res.ok) throw new Error("Failed to update product");
    return res.json();
  },

  async deleteProduct(id) {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete product");
    return res.json();
  },

  async restockProduct(id, casiers, notes = "") {
    const res = await fetch(
      `${API_BASE_URL}/products/${id}/restock?casiers=${casiers}&notes=${encodeURIComponent(notes)}`,
      { method: "POST" }
    );
    if (!res.ok) throw new Error("Failed to restock product");
    return res.json();
  },

  // Sales
  async getSales() {
    const res = await fetch(`${API_BASE_URL}/sales`);
    if (!res.ok) throw new Error("Failed to fetch sales");
    return res.json();
  },

  async createSale(saleData) {
    const res = await fetch(`${API_BASE_URL}/sales`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(saleData),
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.detail || "Failed to create sale");
    }
    return res.json();
  },

  async deleteSale(saleId) {
    const res = await fetch(`${API_BASE_URL}/sales/${saleId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete sale");
    return res.json();
  },

  // Movements
  async getMovements() {
    const res = await fetch(`${API_BASE_URL}/movements`);
    if (!res.ok) throw new Error("Failed to fetch movements");
    return res.json();
  },

  // Real-time WebSocket connection
  connectWebSocket(onEvent) {
    let socket = null;
    try {
      socket = new WebSocket(WS_URL);

      socket.onopen = () => {
        console.log("[WebSocket Client] Connected to FastAPI backend!");
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (onEvent) onEvent(payload);
        } catch (e) {
          console.error("Error parsing WS message", e);
        }
      };

      socket.onerror = (err) => {
        console.warn("[WebSocket Client] Socket error, running in fallback mode");
      };

      socket.onclose = () => {
        console.log("[WebSocket Client] Closed, attempting reconnect in 5s...");
        setTimeout(() => api.connectWebSocket(onEvent), 5000);
      };
    } catch (e) {
      console.warn("WebSocket initialization failed", e);
    }

    return socket;
  },
};
