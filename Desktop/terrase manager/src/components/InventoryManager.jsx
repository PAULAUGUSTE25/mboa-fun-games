import { useState } from "react";
import { useBar } from "../context/BarContext";
import { SUPPLIERS, CATEGORIES, APP_LOGO } from "../data/sabcGuinnessCatalog";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Package,
  Moon,
  RefreshCw,
  Camera,
  Upload,
  ShieldCheck,
  Lock,
} from "lucide-react";

export default function InventoryManager() {
  const { products, sales, addProduct, updateProduct, deleteProduct, addRestockMovement, transferToGlaces, currentUser } = useBar();

  const [search, setSearch] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEveningReport, setShowEveningReport] = useState(false);

  const isAdmin = currentUser?.role === "ADMIN";

  const verifyAdminPermission = (actionName = "effectuer cette modification") => {
    if (isAdmin) return true;

    const pinInput = prompt(
      `🔒 ACCÈS RESTREINT ADMINISTRATEUR (Paul)\n\nLes serveurs ne sont pas autorisés à modifier le stock ou la liste des boissons.\nSeul l'Administrateur (Paul) est autorisé à ${actionName}.\n\nSaisissez le code PIN Administrateur pour déverrouiller :`
    );

    if (pinInput === "1234") {
      return true;
    } else {
      alert("❌ Code PIN incorrect ou annulation. Action réservée à l'Administrateur.");
      return false;
    }
  };

  // Modal form state for adding/editing product
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    supplier: SUPPLIERS.SABC,
    category: CATEGORIES.BIERES,
    format: "Bouteille 65cl",
    bottlesPerCasier: 12,
    buyPriceCasier: 7200,
    sellPriceBottle: 700,
    currentStockBottles: 144,
    minAlertThresholdBottles: 24,
    imageUrl: "/branding/016e6b54-298e-48f0-b95a-f34c9ce70a96.jpg",
  });

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase());
    const matchSup = supplierFilter === "ALL" || p.supplier === supplierFilter;
    const matchCat = categoryFilter === "ALL" || p.category === categoryFilter;
    return matchSearch && matchSup && matchCat;
  });

  // Calculate sold items today from actual sales
  const todayStr = new Date().toDateString();
  const todaySales = sales.filter(
    (s) => new Date(s.timestamp).toDateString() === todayStr
  );

  const productSoldMap = {};
  todaySales.forEach((sale) => {
    sale.items?.forEach((item) => {
      productSoldMap[item.id] = (productSoldMap[item.id] || 0) + item.quantity;
    });
  });

  const openAddModal = () => {
    if (!verifyAdminPermission("ajouter un nouveau produit")) return;

    setEditingProduct(null);
    setFormData({
      name: "",
      brand: "",
      supplier: SUPPLIERS.SABC,
      category: CATEGORIES.BIERES,
      format: "Bouteille 65cl",
      bottlesPerCasier: 12,
      buyPriceCasier: 7200,
      sellPriceBottle: 750,
      currentStockBottles: 120,
      stockGlaces: 48,
      minAlertThresholdBottles: 24,
      imageUrl: "/branding/016e6b54-298e-48f0-b95a-f34c9ce70a96.jpg",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (prod) => {
    if (!verifyAdminPermission("modifier le prix ou la fiche produit")) return;

    const totalBottles = Number(prod.currentStockBottles) || 0;
    const glaces = prod.stockGlaces !== undefined && !isNaN(Number(prod.stockGlaces))
      ? Number(prod.stockGlaces)
      : Math.floor(totalBottles * 0.6);

    setEditingProduct(prod);
    setFormData({
      ...prod,
      currentStockBottles: totalBottles,
      stockGlaces: glaces,
    });
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (id) => {
    if (!verifyAdminPermission("supprimer ce produit")) return;
    deleteProduct(id);
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    const totalStock = Number(formData.currentStockBottles) || 0;
    const glaces = Math.min(totalStock, Math.max(0, Number(formData.stockGlaces) || 0));
    const nonGlaces = Math.max(0, totalStock - glaces);

    const payload = {
      ...formData,
      currentStockBottles: totalStock,
      stockGlaces: glaces,
      stockNonGlaces: nonGlaces,
    };

    if (editingProduct) {
      updateProduct({ ...payload, id: editingProduct.id });
    } else {
      addProduct(payload);
    }
    setIsModalOpen(false);
  };

  // Direct quick stock & fridge count update
  const handleQuickStockUpdate = (prod) => {
    if (!verifyAdminPermission("ajuster le stock de ce produit")) return;

    const totalStock = Number(prod.currentStockBottles) || 0;
    const currentGlaced = prod.stockGlaces !== undefined && !isNaN(Number(prod.stockGlaces))
      ? Number(prod.stockGlaces)
      : Math.floor(totalStock * 0.6);

    const newGlacedStr = prompt(
      `❄️ AJUSTEMENT FRIGO pour ${prod.name}\nStock total actuel : ${totalStock} btl (${(totalStock / (prod.bottlesPerCasier || 12)).toFixed(1)} casiers)\n\nEntrez le nombre de bouteilles GLACÉES AU FRIGO :`,
      currentGlaced.toString()
    );

    if (newGlacedStr !== null && !isNaN(newGlacedStr)) {
      const newGlaced = parseInt(newGlacedStr, 10);
      if (newGlaced >= 0) {
        const finalGlaced = Math.min(totalStock, newGlaced);
        const finalNonGlaced = Math.max(0, totalStock - finalGlaced);
        updateProduct({
          ...prod,
          stockGlaces: finalGlaced,
          stockNonGlaces: finalNonGlaced,
        });
      }
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Evening Report Button */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-[#0A5C36]" />
            Gestion des Stocks & Inventaire
          </h2>
          <p className="text-xs text-gray-500">
            Saisie initiale des boissons, suivi en temps réel et décrémentation automatique à la facturation
          </p>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          {/* End of Evening Report Trigger Button */}
          <button
            onClick={() => setShowEveningReport(true)}
            className="flex-1 md:flex-initial flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-[#1E1E2F] text-[#D4AF37] font-bold text-xs hover:bg-slate-800 transition-all border border-[#D4AF37]/30 shadow-md cursor-pointer"
          >
            <Moon className="w-4 h-4 text-[#D4AF37]" />
            <span>Rapport de Fin de Soirée</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex-1 md:flex-initial flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-[#0A5C36] text-white font-bold text-xs hover:bg-[#08492b] transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une Boisson</span>
          </button>
        </div>
      </div>

      {/* Info Banner: Real-time Auto-Decrementation Explanation */}
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#0A5C36] text-white flex items-center justify-center shrink-0">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <div className="font-bold text-[#0A5C36]">
              Décrémentation Automatique des Stocks Active
            </div>
            <div className="text-emerald-800">
              Dès qu'une boisson est commandée et facturée à la caisse POS, le mouvement de sortie est automatiquement enregistré et le stock restant est mis à jour instantanément.
            </div>
          </div>
        </div>

        <div className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-white text-[#0A5C36] border border-emerald-300 shrink-0">
          Ventes facturées aujourd'hui: {todaySales.length} reçus
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom ou marque..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A5C36]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Supplier filter */}
          <select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 rounded-xl px-3 py-2 outline-none cursor-pointer"
          >
            <option value="ALL">Toutes les Brasseries</option>
            <option value={SUPPLIERS.SABC}>SABC Cameroun</option>
            <option value={SUPPLIERS.GUINNESS}>Guinness Cameroun</option>
          </select>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 rounded-xl px-3 py-2 outline-none cursor-pointer"
          >
            <option value="ALL">Toutes les Catégories</option>
            {Object.values(CATEGORIES).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mobile Cards View (Visible on small screens < md) */}
      <div className="md:hidden space-y-3">
        {filteredProducts.map((prod) => {
          const currentStock = Number(prod.currentStockBottles) || Number(prod.current_stock_bottles) || 0;
          const sellPrice = Number(prod.sellPriceBottle) || Number(prod.sell_price_bottle) || 0;
          const soldQty = Number(productSoldMap[prod.id]) || Number(prod.soldBottles) || 0;
          const isCritical = currentStock <= (Number(prod.minAlertThresholdBottles) || 24);
          const isOutOfStock = currentStock <= 0;

          const stockGlaced = (prod.stockGlaces !== undefined && !isNaN(Number(prod.stockGlaces)))
            ? Number(prod.stockGlaces)
            : Math.floor(currentStock * 0.6);

          const stockNonGlaced = (prod.stockNonGlaces !== undefined && !isNaN(Number(prod.stockNonGlaces)))
            ? Number(prod.stockNonGlaces)
            : Math.max(0, currentStock - stockGlaced);

          return (
            <div key={prod.id} className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  <img
                    src={prod.imageUrl}
                    alt={prod.name}
                    className="w-11 h-11 object-contain rounded-xl bg-slate-50 p-1 border border-slate-200 shrink-0"
                    onError={(e) => { e.currentTarget.src = APP_LOGO; }}
                  />
                  <div>
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <span>{prod.name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 font-bold text-slate-600">
                        {prod.supplier.includes("SABC") ? "SABC" : "Guinness"}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      {prod.format} • <span className="font-bold text-[#0A5C36]">{sellPrice} FCFA</span>
                    </div>
                  </div>
                </div>

                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                  isOutOfStock
                    ? "bg-red-100 text-red-700"
                    : isCritical
                    ? "bg-amber-100 text-amber-800"
                    : "bg-emerald-100 text-emerald-800"
                }`}>
                  {isOutOfStock ? "RUPTURE" : isCritical ? "CRITIQUE" : "STOCK OK"}
                </span>
              </div>

              {/* Stock Breakdown Grid */}
              <div className="grid grid-cols-4 gap-1 p-2 bg-slate-50 rounded-xl text-center text-xs font-mono">
                <div>
                  <div className="text-[9px] text-slate-400 font-sans uppercase">Vendues</div>
                  <div className="font-bold text-purple-700">{soldQty} btl</div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-400 font-sans uppercase">❄️ Glacé</div>
                  <div className="font-bold text-sky-700">{stockGlaced} btl</div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-400 font-sans uppercase">🌡️ Ambiant</div>
                  <div className="font-bold text-amber-700">{stockNonGlaced} btl</div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-400 font-sans uppercase">Restant</div>
                  <div className={`font-black ${isOutOfStock ? "text-red-600" : "text-[#0A5C36]"}`}>
                    {currentStock} btl
                  </div>
                </div>
              </div>

              {/* Mobile Actions */}
              <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                <button
                  onClick={() => handleQuickStockUpdate(prod)}
                  className="text-xs text-[#0A5C36] font-bold flex items-center gap-1 cursor-pointer"
                >
                  ✏️ Ajuster stock
                </button>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openEditModal(prod)}
                    className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Éditer
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(prod.id)}
                    className="p-1 bg-red-50 text-red-600 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View (Hidden on small screens < md) */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0A5C36] text-white font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Boisson / Marque</th>
                <th className="py-3.5 px-4 text-center">Stock Initial</th>
                <th className="py-3.5 px-4 text-center">Entrées</th>
                <th className="py-3.5 px-4 text-center">Bouteilles Vendues</th>
                <th className="py-3.5 px-4 text-center">❄️ Stock Glacé (Frigo)</th>
                <th className="py-3.5 px-4 text-center">🌡️ Stock Non Glacé</th>
                <th className="py-3.5 px-4 text-center">Stock Final (Restant)</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredProducts.map((prod) => {
                const currentStock = Number(prod.currentStockBottles) || Number(prod.current_stock_bottles) || 0;
                const sellPrice = Number(prod.sellPriceBottle) || Number(prod.sell_price_bottle) || 0;
                const soldQty = Number(productSoldMap[prod.id]) || Number(prod.soldBottles) || 0;

                const stockInitial = (prod.stockInitial !== undefined && !isNaN(Number(prod.stockInitial)))
                  ? Number(prod.stockInitial)
                  : (currentStock + soldQty);
                const entries = Number(prod.entries) || 0;

                const stockGlaced = (prod.stockGlaces !== undefined && !isNaN(Number(prod.stockGlaces)))
                  ? Number(prod.stockGlaces)
                  : Math.floor(currentStock * 0.6);

                const stockNonGlaced = (prod.stockNonGlaces !== undefined && !isNaN(Number(prod.stockNonGlaces)))
                  ? Number(prod.stockNonGlaces)
                  : Math.max(0, currentStock - stockGlaced);

                const isCritical = currentStock <= (Number(prod.minAlertThresholdBottles) || 24);
                const isOutOfStock = currentStock <= 0;
                const casiersEst = (currentStock / (Number(prod.bottlesPerCasier) || 12)).toFixed(1);

                const handleMettreAuFrais = (product) => {
                  const qtyStr = prompt(`Combien de bouteilles de ${product.name} voulez-vous mettre au frais (Stock non glacé disponible: ${stockNonGlaced} btl) ?`, "12");
                  if (qtyStr && !isNaN(qtyStr)) {
                    const qty = parseInt(qtyStr, 10);
                    if (qty > 0) {
                      transferToGlaces(product.id, qty);
                    }
                  }
                };

                return (
                  <tr key={prod.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          className="w-10 h-10 object-contain rounded-lg bg-slate-50 p-1 border border-slate-200 shrink-0"
                          onError={(e) => { e.currentTarget.src = APP_LOGO; }}
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                            <span>{prod.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 font-bold text-slate-600">
                              {prod.supplier.includes("SABC") ? "SABC" : "Guinness"}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {prod.format} • Vente: <span className="font-bold text-[#0A5C36]">{sellPrice} FCFA</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-600">{stockInitial} btl(s)</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-emerald-700">+{entries} btl(s)</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-mono font-bold px-2 py-1 rounded-lg text-xs ${soldQty > 0 ? "bg-purple-100 text-purple-900" : "bg-slate-100 text-slate-400"}`}>
                        {soldQty} btl(s)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-sky-50 text-sky-800 border border-sky-200 font-mono font-bold text-xs">
                        <span>❄️</span> {stockGlaced} btl(s)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleMettreAuFrais(prod)}
                        title="Cliquer pour mettre au frais (transférer vers le frigo)"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 font-mono font-bold text-xs cursor-pointer transition-colors"
                      >
                        <span>🌡️</span> {stockNonGlaced} btl(s)
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleQuickStockUpdate(prod)}
                        title="Cliquer pour ajuster le stock restant"
                        className="group flex flex-col items-center mx-auto p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
                      >
                        <div className={`font-mono font-black text-sm ${isOutOfStock ? "text-red-600" : isCritical ? "text-amber-600" : "text-[#0A5C36]"}`}>
                          {currentStock} btl(s)
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">~{casiersEst} casiers</div>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleMettreAuFrais(prod)}
                          title="Mettre des bouteilles au frais"
                          className="px-2 py-1 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          ❄️ Frais
                        </button>
                        <button
                          onClick={() => {
                            const count = prompt(`Ajouter des casiers de ${prod.name}:`, "5");
                            if (count && !isNaN(count)) {
                              addRestockMovement(prod.id, parseInt(count, 10), prod.buyPriceCasier, "Réapprovisionnement manuel");
                            }
                          }}
                          className="px-2 py-1 bg-emerald-50 text-[#0A5C36] hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          + Stock
                        </button>
                        <button
                          onClick={() => openEditModal(prod)}
                          className="p-1.5 text-gray-500 hover:text-slate-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* End of Evening Stock Summary Modal (Rapport de Fin de Soirée) */}
      {showEveningReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Moon className="w-5 h-5 text-[#D4AF37]" />
                  Rapport d'Inventaire de Fin de Soirée
                </h3>
                <p className="text-xs text-gray-500">
                  Bilan exact des ventes facturées et des stocks restants en fermeture du bar
                </p>
              </div>

              <button
                onClick={() => setShowEveningReport(false)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700"
              >
                Fermer
              </button>
            </div>

            {/* Summary Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#1E1E2F] text-gray-300 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-3">Désignation Boisson</th>
                    <th className="py-3 px-3 text-center">Vendus Aujourd'hui</th>
                    <th className="py-3 px-3 text-center">Stock Restant (Bouteilles)</th>
                    <th className="py-3 px-3 text-center">Stock Restant (Casiers)</th>
                    <th className="py-3 px-3 text-right">Valeur Vente Restante</th>
                    <th className="py-3 px-3 text-center">Statut Fin de Soirée</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((prod) => {
                    const sold = productSoldMap[prod.id] || 0;
                    const stockVal = prod.currentStockBottles * prod.sellPriceBottle;
                    const casiers = (prod.currentStockBottles / (prod.bottlesPerCasier || 12)).toFixed(1);

                    return (
                      <tr key={prod.id} className="hover:bg-gray-50">
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {prod.name} ({prod.format})
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-700">
                          {sold} btl(s)
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-black text-slate-900">
                          {prod.currentStockBottles} btl(s)
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-gray-600">
                          {casiers} casier(s)
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#0A5C36]">
                          {stockVal.toLocaleString()} FCFA
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {prod.currentStockBottles <= 0 ? (
                            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                              ÉPUISÉ
                            </span>
                          ) : prod.currentStockBottles <= prod.minAlertThresholdBottles ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                              À COMMANDER
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              STOCK OK
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-gray-500">
                Imprimez ou exportez ce rapport avant l'ouverture du lendemain.
              </div>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#0A5C36] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                Imprimer le Rapport de Fin de Soirée
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">
              {editingProduct ? "Modifier la Boisson" : "Ajouter un Nouveau Produit"}
            </h3>

            <form onSubmit={handleSubmitForm} className="space-y-3">
              {/* Photo de la Boisson (Upload ou Galerie de marques) */}
              <div className="p-3 bg-[#0A5C36]/5 border border-[#0A5C36]/20 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-[#0A5C36]" />
                    <span>Photo / Visuel de la Boisson</span>
                  </label>
                  <span className="text-[10px] font-bold text-[#0A5C36]">Saisie Rentrée en Stock</span>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Visual Preview */}
                  <div className="w-16 h-16 rounded-xl bg-white border-2 border-[#0A5C36]/30 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                    <img
                      src={formData.imageUrl || APP_LOGO}
                      alt="Aperçu Boisson"
                      className="w-full h-full object-contain"
                      onError={(e) => { e.currentTarget.src = APP_LOGO; }}
                    />
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center space-x-2">
                      {/* Local File Upload Button */}
                      <label className="px-3 py-1.5 bg-[#0A5C36] hover:bg-[#08492b] text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs inline-flex items-center gap-1.5 transition-all">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Téléverser Photo...</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                if (event.target?.result) {
                                  setFormData({ ...formData, imageUrl: event.target.result });
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>

                      {formData.imageUrl && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, imageUrl: "/branding/016e6b54-298e-48f0-b95a-f34c9ce70a96.jpg" })}
                          className="text-[10px] text-red-500 hover:underline font-bold"
                        >
                          Reset
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      placeholder="Lien URL d'image (ex: /branding/coca_cola.jpg)"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full px-2.5 py-1 bg-white border border-gray-300 rounded-lg text-[11px] font-mono text-slate-800 outline-none focus:ring-1 focus:ring-[#0A5C36]"
                    />
                  </div>
                </div>

                {/* Quick Preset Gallery */}
                <div className="pt-1.5 border-t border-[#0A5C36]/10">
                  <div className="text-[10px] font-bold text-slate-500 mb-1">
                    Choisir parmi les marques enregistrées :
                  </div>
                  <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-thin">
                    {[
                      { name: "Castel", url: "/branding/016e6b54-298e-48f0-b95a-f34c9ce70a96.jpg" },
                      { name: "Mützig", url: "/branding/5a69667c-f61f-47c6-9dc6-3f3d8874210d.jpg" },
                      { name: "33 Export", url: "/branding/5c4621e6-a61c-4d98-b220-131933d4d5d2.jpg" },
                      { name: "Guinness 65", url: "/branding/dc90d4c5-87da-430c-858f-e83f8f4c9d31.png" },
                      { name: "Guinness 33", url: "/branding/a923e57b-55b6-41ca-9c3a-2fc286496a7c.png" },
                      { name: "Beaufort", url: "/branding/9f8b15c8-8bf1-47cb-b0ca-c94a1c76b1fb.jpg" },
                      { name: "Coca-Cola", url: "/branding/coca_cola.jpg" },
                      { name: "Fanta", url: "/branding/fanta_orange.jpg" },
                      { name: "Sprite", url: "/branding/sprite.jpg" },
                      { name: "D'Jino", url: "/branding/74e85544-4149-4f47-8cca-591365404a02.jpg" },
                      { name: "Tangui", url: "/branding/3eb82c7c-b948-467f-959c-a52672c53cd1.jpg" },
                      { name: "Booster", url: "/branding/booster_cider.jpg" },
                      { name: "Smirnoff", url: "/branding/7642241d-d9a1-4bb8-a620-eeed83d9f253.png" },
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: preset.url })}
                        className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold flex items-center space-x-1 shrink-0 transition-all cursor-pointer ${
                          formData.imageUrl === preset.url
                            ? "bg-[#0A5C36] text-white border-[#0A5C36] shadow-xs"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        <img src={preset.url} alt={preset.name} className="w-4 h-4 object-contain rounded" />
                        <span>{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nom du Produit / Boisson
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Castel Beer 65cl"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0A5C36]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Brasserie / Fournisseur
                  </label>
                  <select
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs outline-none"
                  >
                    <option value={SUPPLIERS.SABC}>SABC Cameroun</option>
                    <option value={SUPPLIERS.GUINNESS}>Guinness Cameroun</option>
                    <option value="Autre Brasserie">Autre Distributeur</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Catégorie
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs outline-none"
                  >
                    {Object.values(CATEGORIES).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Format & Conditionnement
                  </label>
                  <input
                    type="text"
                    value={formData.format}
                    onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                    placeholder="Ex: Bouteille 65cl"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Bouteilles par Casier
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.bottlesPerCasier}
                    onChange={(e) =>
                      setFormData({ ...formData, bottlesPerCasier: parseInt(e.target.value, 10) })
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Prix Achat Casier (FCFA)
                  </label>
                  <input
                    type="number"
                    value={formData.buyPriceCasier}
                    onChange={(e) =>
                      setFormData({ ...formData, buyPriceCasier: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Prix Vente Bouteille (FCFA)
                  </label>
                  <input
                    type="number"
                    value={formData.sellPriceBottle}
                    onChange={(e) =>
                      setFormData({ ...formData, sellPriceBottle: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono font-bold text-[#0A5C36] outline-none"
                  />
                </div>
              </div>

              {/* Section Répartition des Bouteilles Glacées vs Casiers Ambiants */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="text-xs font-black text-slate-900 flex items-center justify-between">
                  <span>Répartition du Stock (Frigo vs Réserve Casier)</span>
                  <span className="text-[10px] text-gray-500 font-normal">Calcul automatique</span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Stock Total (Btl)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.currentStockBottles}
                      onChange={(e) => {
                        const total = parseInt(e.target.value, 10) || 0;
                        const currentGlaces = formData.stockGlaces !== undefined ? formData.stockGlaces : Math.floor(total * 0.6);
                        const finalGlaces = Math.min(total, currentGlaces);
                        setFormData({
                          ...formData,
                          currentStockBottles: total,
                          stockGlaces: finalGlaces,
                        });
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs outline-none font-bold"
                    />
                    <div className="text-[9px] text-slate-400 mt-0.5 font-mono">
                      ~{((formData.currentStockBottles || 0) / (formData.bottlesPerCasier || 12)).toFixed(1)} casiers
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-sky-800 mb-1 flex items-center gap-1">
                      <span>❄️</span> Au Frigo (Glacé)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={formData.currentStockBottles}
                      value={formData.stockGlaces !== undefined ? formData.stockGlaces : Math.floor((formData.currentStockBottles || 0) * 0.6)}
                      onChange={(e) => {
                        const glaces = parseInt(e.target.value, 10) || 0;
                        const total = formData.currentStockBottles || 0;
                        setFormData({
                          ...formData,
                          stockGlaces: Math.min(total, Math.max(0, glaces)),
                        });
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-sky-300 rounded-xl text-xs outline-none font-black text-sky-900 focus:ring-2 focus:ring-sky-500"
                    />
                    <div className="text-[9px] text-sky-600 mt-0.5 font-bold">
                      Prêtes à servir
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-amber-800 mb-1 flex items-center gap-1">
                      <span>🌡️</span> En Casier (Ambiant)
                    </label>
                    <div className="w-full px-2.5 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-black text-amber-900 font-mono">
                      {Math.max(0, (formData.currentStockBottles || 0) - (formData.stockGlaces !== undefined ? formData.stockGlaces : Math.floor((formData.currentStockBottles || 0) * 0.6)))} btl
                    </div>
                    <div className="text-[9px] text-amber-700 mt-0.5 font-medium">
                      En réserve casier
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Seuil d'Alerte Critique (Bouteilles)
                </label>
                <input
                  type="number"
                  value={formData.minAlertThresholdBottles}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minAlertThresholdBottles: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs outline-none text-red-600 font-bold"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0A5C36] text-white text-xs font-bold hover:bg-[#08492b] shadow-md cursor-pointer"
                >
                  {editingProduct ? "Enregistrer Modifications" : "Créer la Boisson & Enregistrer Photo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
