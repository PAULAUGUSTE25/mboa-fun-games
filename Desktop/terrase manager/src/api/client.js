export const getServerUrl = () => {
  const saved = localStorage.getItem("terrasse_server_url");
  if (saved && saved.trim() !== "") {
    return saved.trim().replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (
      host &&
      host !== "localhost" &&
      host !== "127.0.0.1" &&
      !host.includes("netlify.app") &&
      !host.includes("vercel.app")
    ) {
      return `http://${host}:8000`;
    }
  }
  return "http://localhost:8000";
};

export const getApiBaseUrl = () => `${getServerUrl()}/api`;
export const getWsUrl = () => {
  const base = getServerUrl();
  if (base.startsWith("https://")) {
    return base.replace("https://", "wss://") + "/ws";
  }
  return base.replace("http://", "ws://") + "/ws";
};

export const setServerUrl = (url) => {
  if (!url || url.trim() === "") {
    localStorage.removeItem("terrasse_server_url");
  } else {
    localStorage.setItem("terrasse_server_url", url.trim());
  }
};

// Global Resilient Cloud Shared Room for Real-Time Multi-Phone Sync
const CLOUD_SYNC_PRIMARY = "https://api.restful-api.dev/objects";
const CLOUD_ROOM_ID = "terrasse_pos_yaounde_live_v4";

export const cloudSync = {
  async getRoomData() {
    try {
      const res = await fetch(`${CLOUD_SYNC_PRIMARY}/${CLOUD_ROOM_ID}`, {
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || null;
      }
    } catch (err) {
      console.warn("[CloudSync] Primary fetch error:", err);
    }
    return null;
  },

  async saveRoomData(dataState) {
    try {
      const payload = {
        name: "La Terrasse Bar Yaounde Real-Time Room",
        updatedAt: new Date().toISOString(),
        data: dataState,
      };
      const res = await fetch(`${CLOUD_SYNC_PRIMARY}/${CLOUD_ROOM_ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok && res.status === 404) {
        await fetch(CLOUD_SYNC_PRIMARY, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: CLOUD_ROOM_ID,
            ...payload,
          }),
        });
      }
    } catch (err) {
      console.warn("[CloudSync] Save error:", err);
    }
  },
};

export const api = {
  // Products
  async getProducts() {
    const res = await fetch(`${getApiBaseUrl()}/products`);
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json();
  },

  async addProduct(productData) {
    const res = await fetch(`${getApiBaseUrl()}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });
    if (!res.ok) throw new Error("Failed to create product");
    return res.json();
  },

  async updateProduct(id, productData) {
    const res = await fetch(`${getApiBaseUrl()}/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });
    if (!res.ok) throw new Error("Failed to update product");
    return res.json();
  },

  async deleteProduct(id) {
    const res = await fetch(`${getApiBaseUrl()}/products/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete product");
    return res.json();
  },

  async restockProduct(id, casiers, notes = "") {
    const res = await fetch(
      `${getApiBaseUrl()}/products/${id}/restock?casiers=${casiers}&notes=${encodeURIComponent(notes)}`,
      { method: "POST" }
    );
    if (!res.ok) throw new Error("Failed to restock product");
    return res.json();
  },

  // Sales
  async getSales() {
    const res = await fetch(`${getApiBaseUrl()}/sales`);
    if (!res.ok) throw new Error("Failed to fetch sales");
    return res.json();
  },

  async createSale(saleData) {
    const res = await fetch(`${getApiBaseUrl()}/sales`, {
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
    const res = await fetch(`${getApiBaseUrl()}/sales/${saleId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete sale");
    return res.json();
  },

  // Movements
  async getMovements() {
    const res = await fetch(`${getApiBaseUrl()}/movements`);
    if (!res.ok) throw new Error("Failed to fetch movements");
    return res.json();
  },

  // Real-time WebSocket connection
  connectWebSocket(onEvent) {
    let socket = null;
    try {
      const wsTarget = getWsUrl();
      socket = new WebSocket(wsTarget);

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

      socket.onerror = () => {
        console.warn(
          "[WebSocket Client] Socket error, running in fallback mode"
        );
      };

      socket.onclose = () => {
        setTimeout(() => api.connectWebSocket(onEvent), 5000);
      };
    } catch (e) {
      console.warn("WebSocket initialization failed", e);
    }

    return socket;
  },
};
