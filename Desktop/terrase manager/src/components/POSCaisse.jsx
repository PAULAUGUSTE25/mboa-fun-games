import { useState } from "react";
import { useBar } from "../context/BarContext";
import { INITIAL_TABLES, CATEGORIES, SUPPLIERS, APP_LOGO } from "../data/sabcGuinnessCatalog";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  CreditCard,
  Smartphone,
  Banknote,
  Beer,
  ShoppingBag,
} from "lucide-react";

export default function POSCaisse() {
  const {
    products,
    cart,
    addToCart,
    updateCartQty,
    clearCart,
    activeTable,
    setActiveTable,
    validateSale,
    activeServer,
  } = useBar();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedSupplier, setSelectedSupplier] = useState("ALL");
  const [paymentMethod, setPaymentMethod] = useState("Espèces");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [mobileTab, setMobileTab] = useState("catalog"); // "catalog" | "cart"

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      selectedCategory === "ALL" || product.category === selectedCategory;
    const matchesSupplier =
      selectedSupplier === "ALL" || product.supplier === selectedSupplier;

    return matchesSearch && matchesCat && matchesSupplier;
  });

  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.sellPriceBottle * item.quantity,
    0
  );
  const cartFinalTotal = Math.max(0, cartSubtotal - Number(discountAmount));

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const success = validateSale(paymentMethod, Number(discountAmount));
    if (success) {
      setDiscountAmount(0);
    }
  };

  return (
    <div className="h-[calc(100vh-65px)] flex flex-col md:flex-row overflow-hidden bg-transparent relative">
      {/* Mobile Tab Switcher (Visible only on small screens < md) */}
      <div className="md:hidden flex items-center bg-slate-900 text-white p-1.5 shrink-0 border-b border-slate-800">
        <button
          onClick={() => setMobileTab("catalog")}
          className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
            mobileTab === "catalog"
              ? "bg-[#0A5C36] text-white shadow-sm font-black"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Beer className="w-4 h-4 text-amber-300" />
          <span>Catalogue Boissons</span>
        </button>
        <button
          onClick={() => setMobileTab("cart")}
          className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all relative ${
            mobileTab === "cart"
              ? "bg-[#0A5C36] text-white shadow-sm font-black"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-amber-300" />
          <span>Panier & Caisse ({cart.reduce((a, b) => a + b.quantity, 0)})</span>
          {cart.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute top-1.5 right-4" />
          )}
        </button>
      </div>

      {/* LEFT AREA: Product Catalog Grid & Filter Bar */}
      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden border-r border-gray-200 ${
        mobileTab === "catalog" ? "flex" : "hidden md:flex"
      }`}>
        {/* Top Control Bar: Search & Tables */}
        <div className="p-2.5 sm:p-3 bg-white/90 backdrop-blur-xs border-b border-gray-200 space-y-2 shrink-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            {/* Table Selector Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
              <span className="text-[11px] sm:text-xs font-bold text-gray-500 shrink-0 uppercase tracking-wider">
                Emplacement:
              </span>
              {INITIAL_TABLES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTable(t)}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    activeTable.id === t.id
                      ? "bg-[#0A5C36] text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>

            {/* Instant Search Bar */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une boisson..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-gray-100 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
              />
            </div>
          </div>

          {/* Supplier & Category Filters */}
          <div className="flex items-center space-x-2 overflow-x-auto pt-1 border-t border-gray-100 scrollbar-none">
            {/* Supplier Filter */}
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="bg-gray-100 border border-gray-200 text-xs font-bold text-gray-700 rounded-lg px-2.5 py-1 outline-none cursor-pointer shrink-0"
            >
              <option value="ALL">Toutes les Brasseries</option>
              <option value={SUPPLIERS.SABC}>SABC Cameroun</option>
              <option value={SUPPLIERS.GUINNESS}>Guinness Cameroun</option>
            </select>

            {/* Category Pills */}
            <button
              onClick={() => setSelectedCategory("ALL")}
              className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                selectedCategory === "ALL"
                  ? "bg-[#1E1E2F] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Tous les produits
            </button>
            {Object.values(CATEGORIES).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#0A5C36] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid with Real Drink Branding Images */}
        <div className="flex-1 p-2.5 sm:p-3 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3">
          {filteredProducts.map((product) => {
            const inCartItem = cart.find((i) => i.id === product.id);
            const currentBottles = Number(product.currentStockBottles) || 0;
            const minThreshold = Number(product.minAlertThresholdBottles) || 12;
            const isOutOfStock = currentBottles <= 0;
            const isLowStock = currentBottles <= minThreshold;

            return (
              <div
                key={product.id}
                onClick={() => !isOutOfStock && addToCart(product)}
                className={`group relative rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between border transition-all cursor-pointer select-none active:scale-[0.98] ${
                  isOutOfStock
                    ? "bg-gray-100 border-gray-300 opacity-60 cursor-not-allowed"
                    : inCartItem
                    ? "bg-emerald-50/90 border-[#0A5C36] shadow-md ring-2 ring-[#0A5C36]/30"
                    : "bg-white border-gray-200 hover:border-[#0A5C36] hover:shadow-md"
                }`}
              >
                {/* Image Header & Stock Status Badge */}
                <div className="flex items-start justify-between gap-1">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gray-50 border border-gray-100 p-1 flex items-center justify-center overflow-hidden shrink-0">
                    <img
                      src={product.imageUrl || "/hero_bg.jpg"}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                      onError={(e) => {
                        e.currentTarget.src = "/hero_bg.jpg";
                      }}
                    />
                  </div>

                  <span
                    className={`text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full ${
                      isOutOfStock
                        ? "bg-red-100 text-red-700"
                        : isLowStock
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {isOutOfStock
                      ? "RUPTURE"
                      : `${Number(product.currentStockBottles) || 0} btl(s)`}
                  </span>
                </div>

                {/* Drink Details */}
                <div className="my-1.5 sm:my-2 space-y-0.5 sm:space-y-1">
                  <div className="text-xs font-bold text-slate-900 line-clamp-2 group-hover:text-[#0A5C36] transition-colors leading-tight">
                    {product.name}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate font-mono">
                    {product.format} • {product.brand}
                  </div>

                  {/* Chilled & Ambient Stock Badges */}
                  <div className="flex items-center gap-1 pt-1">
                    <span className="text-[9px] px-1 py-0.2 rounded bg-sky-50 text-sky-700 border border-sky-200 font-bold">
                      ❄️ {product.stockGlaces !== undefined && product.stockGlaces !== null ? product.stockGlaces : Math.floor((Number(product.currentStockBottles) || 0) * 0.6)}
                    </span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                      🌡️ {product.stockNonGlaces !== undefined && product.stockNonGlaces !== null ? product.stockNonGlaces : ((Number(product.currentStockBottles) || 0) - Math.floor((Number(product.currentStockBottles) || 0) * 0.6))}
                    </span>
                  </div>
                </div>

                {/* Price & Quantity Indicator */}
                <div className="flex items-center justify-between pt-1.5 sm:pt-2 border-t border-gray-100">
                  <div className="text-xs sm:text-sm font-black text-slate-900 font-mono">
                    {(product.sellPriceBottle || 0).toLocaleString()}{" "}
                    <span className="text-[10px] text-gray-500 font-normal">F</span>
                  </div>

                  {inCartItem ? (
                    <span className="w-6 h-6 rounded-full bg-[#0A5C36] text-white text-xs font-black flex items-center justify-center shadow-sm">
                      {inCartItem.quantity}
                    </span>
                  ) : (
                    <button className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-gray-100 text-gray-700 group-hover:bg-[#0A5C36] group-hover:text-white flex items-center justify-center transition-colors">
                      <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating Mobile Cart Bar (When items exist in cart & catalog tab active) */}
        {cart.length > 0 && (
          <div className="md:hidden p-2.5 bg-[#1E1E2F] text-white border-t border-slate-700 flex items-center justify-between shadow-2xl shrink-0">
            <div>
              <div className="text-[10px] text-gray-400">
                {cart.reduce((a, b) => a + b.quantity, 0)} article(s) • {activeTable?.name || "Terrasse"}
              </div>
              <div className="text-sm font-black text-[#D4AF37] font-mono">
                {cartFinalTotal.toLocaleString()} FCFA
              </div>
            </div>
            <button
              onClick={() => setMobileTab("cart")}
              className="px-4 py-2 rounded-xl bg-[#0A5C36] text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <span>Voir & Encaisser</span>
              <CheckCircle className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* RIGHT AREA: Active Cart & Checkout Panel */}
      <div className={`w-full md:w-96 bg-white flex-col h-full border-t md:border-t-0 md:border-l border-gray-200 shrink-0 ${
        mobileTab === "cart" ? "flex" : "hidden md:flex"
      }`}>
        {/* Cart Header */}
        <div className="p-3.5 bg-[#1E1E2F] text-white flex items-center justify-between shrink-0">
          <div>
            <div className="text-xs text-gray-400">Commande en cours</div>
            <div className="text-sm font-bold text-[#D4AF37] flex items-center gap-1.5">
              <span>{activeTable?.name || "Terrasse"}</span>
              <span className="text-xs text-gray-400">• {activeServer || "Barman"}</span>
            </div>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Vider
            </button>
          )}
        </div>

        {/* Cart Items Scrollable List */}
        <div className="flex-1 p-3 overflow-y-auto space-y-2.5 divide-y divide-gray-100">
          {cart.length > 0 ? (
            cart.map((item) => (
              <div key={item.id} className="pt-2.5 first:pt-0 flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0 flex items-center space-x-2">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-7 h-7 object-contain rounded bg-gray-50 p-0.5 border border-gray-200 shrink-0"
                    onError={(e) => {
                      e.currentTarget.src = APP_LOGO;
                    }}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-gray-500 font-mono">
                      {(item.sellPriceBottle || 0).toLocaleString()} FCFA / unit
                    </div>
                  </div>
                </div>

                {/* Quantity modifier touch buttons */}
                <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-xl shrink-0">
                  <button
                    onClick={() => updateCartQty(item.id, -1)}
                    className="w-6 h-6 rounded-lg bg-white text-gray-700 hover:bg-gray-200 flex items-center justify-center font-bold text-xs shadow-xs cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center font-black text-xs font-mono">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateCartQty(item.id, 1)}
                    className="w-6 h-6 rounded-lg bg-white text-gray-700 hover:bg-gray-200 flex items-center justify-center font-bold text-xs shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="text-right font-mono font-bold text-xs text-slate-900 w-16 shrink-0">
                  {((item.sellPriceBottle || 0) * (item.quantity || 1)).toLocaleString()} F
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center text-gray-400 space-y-2">
              <Beer className="w-10 h-10 mx-auto text-gray-300 stroke-1" />
              <div className="text-xs font-medium">
                Le panier est vide. Cliquez sur une boisson à gauche pour ajouter à la commande.
              </div>
            </div>
          )}
        </div>

        {/* Payment & Checkout Summary Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3 shrink-0">
          {/* Payment Method Selector */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Mode de Règlement
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: "Espèces", icon: Banknote, label: "Cash" },
                { id: "Orange Money", icon: Smartphone, label: "OM" },
                { id: "MTN MoMo", icon: Smartphone, label: "MoMo" },
                { id: "Carte", icon: CreditCard, label: "Carte" },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`flex flex-col items-center justify-center py-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#0A5C36] text-white border-[#0A5C36] shadow-xs"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 mb-0.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Discount Field */}
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Remise exceptionnelle (FCFA):</span>
            <input
              type="number"
              min="0"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(e.target.value)}
              className="w-24 px-2 py-1 bg-white border border-gray-300 rounded-lg text-right font-mono text-xs font-bold text-gray-800 outline-none focus:ring-1 focus:ring-[#0A5C36]"
            />
          </div>

          {/* Total Amount Display */}
          <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
            <div className="text-xs font-extrabold text-gray-500 uppercase">
              Total Net à Payer
            </div>
            <div className="text-2xl font-black text-[#0A5C36] font-mono">
              {cartFinalTotal.toLocaleString()}{" "}
              <span className="text-xs text-gray-500 font-bold">FCFA</span>
            </div>
          </div>

          {/* Checkout Submit Button */}
          <button
            disabled={cart.length === 0}
            onClick={handleCheckout}
            className={`w-full py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer ${
              cart.length > 0
                ? "bg-gradient-to-r from-[#0A5C36] to-[#08492b] text-white hover:brightness-110 active:scale-[0.99]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            <span>Valider la Commande & Décrémenter Stock</span>
          </button>
        </div>
      </div>
    </div>
  );
}
