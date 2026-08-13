import { useBar } from "../context/BarContext";
import { APP_LOGO } from "../data/sabcGuinnessCatalog";
import {
  TrendingUp,
  Boxes,
  ShoppingBag,
  ArrowRight,
  ShieldAlert,
  Zap,
  BarChart3,
  ShoppingCart,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function Dashboard() {
  const { products, sales, setActiveTab, addRestockMovement } = useBar();

  // Calculate REAL statistics from actual recorded sales
  const todayStr = new Date().toDateString();
  const todaySales = sales.filter(
    (s) => new Date(s.timestamp).toDateString() === todayStr
  );

  const todayRevenue = todaySales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  const totalSalesCount = todaySales.length;

  // Critical stock items
  const criticalProducts = products.filter(
    (p) => p.currentStockBottles <= p.minAlertThresholdBottles
  );

  // Revenue by Category calculated strictly from real sales
  const categoryRevenueMap = {};
  sales.forEach((sale) => {
    sale.items?.forEach((item) => {
      const prod = products.find((p) => p.id === item.id);
      const cat = prod?.category || "Autres";
      const lineTotal = item.total || (item.unitPrice * item.quantity);
      categoryRevenueMap[cat] = (categoryRevenueMap[cat] || 0) + lineTotal;
    });
  });

  const categoryChartData = Object.keys(categoryRevenueMap).map((cat) => ({
    name: cat,
    value: categoryRevenueMap[cat],
  }));

  const COLORS = ["#0A5C36", "#D4AF37", "#3B82F6", "#EC4899", "#8B5CF6"];

  // Hourly sales progression calculated dynamically from real sales today
  const hoursList = ["08h", "10h", "12h", "14h", "16h", "18h", "20h", "22h", "00h"];
  const hourlyRevenueMap = {};
  hoursList.forEach((h) => (hourlyRevenueMap[h] = 0));

  todaySales.forEach((sale) => {
    const d = new Date(sale.timestamp);
    const h = d.getHours();
    let slot = "12h";
    if (h < 10) slot = "08h";
    else if (h < 12) slot = "10h";
    else if (h < 14) slot = "12h";
    else if (h < 16) slot = "14h";
    else if (h < 18) slot = "16h";
    else if (h < 20) slot = "18h";
    else if (h < 22) slot = "20h";
    else slot = "22h";

    hourlyRevenueMap[slot] += sale.totalAmount || 0;
  });

  // Calculate cumulative hourly progression
  let cumulative = 0;
  const hourlyData = hoursList.map((h) => {
    cumulative += hourlyRevenueMap[h];
    return { hour: h, revenue: cumulative };
  });

  // Best seller drinks calculated strictly from actual sales
  const productSalesMap = {};
  sales.forEach((sale) => {
    sale.items?.forEach((item) => {
      if (!productSalesMap[item.name]) {
        productSalesMap[item.name] = {
          name: item.name,
          quantity: 0,
          totalXaf: 0,
          id: item.id,
        };
      }
      productSalesMap[item.name].quantity += item.quantity;
      productSalesMap[item.name].totalXaf += (item.unitPrice || 0) * item.quantity;
    });
  });

  const topSellers = Object.values(productSalesMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Calculate chilled vs ambient stock counts
  const totalGlacedBottles = products.reduce(
    (sum, p) => sum + (p.stockGlaces !== undefined ? p.stockGlaces : Math.floor((p.currentStockBottles || 0) * 0.6)),
    0
  );
  const totalNonGlacedBottles = products.reduce(
    (sum, p) => sum + (p.stockNonGlaces !== undefined ? p.stockNonGlaces : ((p.currentStockBottles || 0) - Math.floor((p.currentStockBottles || 0) * 0.6))),
    0
  );
  const totalSoldTodayBottles = sales.reduce((sum, sale) => {
    return sum + (sale.items?.reduce((itemSum, item) => itemSum + item.quantity, 0) || 0);
  }, 0);

  return (
    <div className="min-h-full p-4 md:p-6 space-y-6 max-w-7xl mx-auto bg-transparent">
      {/* Welcome Hero Banner with Custom Background Image */}
      <div 
        className="relative overflow-hidden rounded-2xl p-6 text-white shadow-xl border border-[#D4AF37]/50 bg-cover bg-center transition-all"
        style={{ backgroundImage: `linear-gradient(to right, rgba(5, 40, 24, 0.62), rgba(10, 92, 54, 0.32), rgba(5, 40, 24, 0.62)), url('/hero_bg.jpg')` }}
      >
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-full border-2 border-[#D4AF37] p-0.5 bg-slate-900/60 shrink-0 shadow-md">
                <img
                  src={APP_LOGO}
                  alt="Logo App"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-900/60 text-amber-300 border border-[#D4AF37]/50 text-xs font-bold flex items-center gap-1.5 backdrop-blur-md shadow-xs">
                <span>🟢</span> Caisse POS & Gestion Active
              </span>
              <span className="text-xs text-emerald-100 font-medium drop-shadow-sm">Terrasse Lounge & Bar</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white font-sans drop-shadow-md">
              Tableau de Bord & État des Stocks de Boissons
            </h2>
            <p className="text-sm text-emerald-100 font-medium drop-shadow-sm">
              ✅ Gestion bitempérature active : Suivi direct des bouteilles glacées (frigo) et en réserve (non glacées).
            </p>
          </div>

          <button
            onClick={() => setActiveTab("pos")}
            className="flex items-center space-x-2.5 px-5 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-400 text-slate-950 font-extrabold text-sm hover:from-amber-400 hover:to-[#D4AF37] active:scale-95 transition-all shadow-lg shrink-0 cursor-pointer border border-amber-300"
          >
            <ShoppingCart className="w-4 h-4 text-slate-950" />
            <span>Prise de Commande</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: C.A. RÉEL DU JOUR */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              C.A. RÉEL DU JOUR
            </span>
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {todayRevenue.toLocaleString()}{" "}
              <span className="text-xs font-extrabold text-[#0A5C36]">FCFA</span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Calculé sur <span className="font-bold text-slate-800">{totalSalesCount}</span> reçus réels
            </div>
          </div>

          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#0A5C36] shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: BOISSONS GLACÉES (PRÊTES À SERVIR) */}
        <div className="bg-white rounded-2xl p-5 border border-sky-200 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
          <div className="space-y-1">
            <span className="text-xs font-bold text-sky-700 uppercase tracking-wider block flex items-center gap-1">
              <span>❄️</span> Boissons Glacées
            </span>
            <div className="text-2xl font-black text-sky-900 font-mono tracking-tight">
              {totalGlacedBottles}{" "}
              <span className="text-xs font-bold text-sky-600">btls</span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Au frigo (Prêtes à servir)
            </div>
          </div>

          <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shrink-0">
            <Zap className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: STOCK NON GLACÉ (EN RÉSERVE) */}
        <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
          <div className="space-y-1">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block flex items-center gap-1">
              <span>🌡️</span> Stock Non Glacé
            </span>
            <div className="text-2xl font-black text-amber-900 font-mono tracking-tight">
              {totalNonGlacedBottles}{" "}
              <span className="text-xs font-bold text-amber-600">btls</span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Stock ambiant en réserve
            </div>
          </div>

          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4: BOUTEILLES VENDUES AUJOURD'HUI */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Bouteilles Vendues
            </span>
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {totalSoldTodayBottles}{" "}
              <span className="text-xs font-bold text-slate-500">btls</span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Ventes enregistrées en caisse
            </div>
          </div>

          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Visual Charts Section (Calculated strictly from real sales) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Sales Progression Chart */}
        <div 
          className="lg:col-span-2 rounded-2xl p-5 border border-[#D4AF37]/40 shadow-xl space-y-4 text-white bg-cover bg-center overflow-hidden transition-all relative"
          style={{ backgroundImage: `linear-gradient(to bottom right, rgba(20, 26, 45, 0.88), rgba(10, 50, 30, 0.84)), url('/hero_bg.jpg')` }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">
                Évolution du Chiffre d'Affaires Réel
              </h3>
              <p className="text-xs text-gray-300">
                Calculé à partir des ventes saisies en caisse aujourd'hui
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#0A5C36] text-[#D4AF37] border border-[#D4AF37]/30">
              Données Réelles
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {todayRevenue > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                  <XAxis dataKey="hour" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} unit=" F" />
                  <Tooltip
                    formatter={(val) => [`${val.toLocaleString()} FCFA`, "Revenu"]}
                    contentStyle={{ backgroundColor: "#121212", borderRadius: "12px", border: "1px solid #D4AF37", color: "#fff" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10B981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center p-8 space-y-2 text-gray-400">
                <BarChart3 className="w-10 h-10 mx-auto text-gray-500 stroke-1" />
                <div className="text-xs font-bold text-gray-300">
                  Aucune vente enregistrée pour le moment aujourd'hui.
                </div>
                <p className="text-[11px] text-gray-400 max-w-sm">
                  Effectuez votre première prise de commande dans le menu <strong>Prise de Commande</strong> pour voir apparaître la courbe réelle.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Category Revenue Breakdown */}
        <div 
          className="rounded-2xl p-5 border border-[#D4AF37]/40 shadow-xl space-y-4 text-white bg-cover bg-center overflow-hidden transition-all relative"
          style={{ backgroundImage: `linear-gradient(to bottom right, rgba(20, 26, 45, 0.88), rgba(10, 50, 30, 0.84)), url('/hero_bg.jpg')` }}
        >
          <div>
            <h3 className="text-base font-bold text-white">
              Répartition par Catégorie
            </h3>
            <p className="text-xs text-gray-300">Part du C.A. réel selon vos ventes</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => `${val.toLocaleString()} FCFA`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-gray-400 italic text-center p-6">
                Aucune vente par catégorie disponible.
              </div>
            )}
          </div>

          <div className="space-y-1.5 pt-2 border-t border-gray-700/60">
            {categoryChartData.map((cat, i) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  ></span>
                  <span className="text-gray-300 font-medium">{cat.name}</span>
                </div>
                <span className="font-bold text-white font-mono">
                  {cat.value.toLocaleString()} FCFA
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Real Top Sellers & Stock Critical Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Sellers (Real) */}
        <div 
          className="rounded-2xl p-5 border border-[#D4AF37]/40 shadow-xl space-y-4 text-white bg-cover bg-center overflow-hidden transition-all relative"
          style={{ backgroundImage: `linear-gradient(to bottom right, rgba(20, 26, 45, 0.88), rgba(10, 50, 30, 0.84)), url('/hero_bg.jpg')` }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#D4AF37]" />
              Classement Réel des Boissons les Plus Vendues
            </h3>
            <button
              onClick={() => setActiveTab("pos")}
              className="text-xs font-semibold text-[#D4AF37] hover:underline"
            >
              Caisse POS &rarr;
            </button>
          </div>

          <div className="divide-y divide-gray-700/50">
            {topSellers.length > 0 ? (
              topSellers.map((item, index) => (
                <div key={item.name} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-[#D4AF37] border border-[#D4AF37]/50 text-xs font-black flex items-center justify-center">
                      #{index + 1}
                    </span>
                    <div>
                      <div className="text-sm font-bold text-white">{item.name}</div>
                      <div className="text-xs text-gray-400 font-mono">
                        {item.quantity} bouteille(s) encaissée(s)
                      </div>
                    </div>
                  </div>
                  <div className="text-right font-mono font-bold text-[#10B981] text-sm">
                    {item.totalXaf.toLocaleString()} FCFA
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-gray-400 italic space-y-1">
                <div>Aucune vente enregistrée dans le classement.</div>
                <div className="text-[11px] text-gray-400">
                  Validez des commandes à la caisse pour alimenter ce classement en temps réel.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Critical Stock Alert Action Panel */}
        <div 
          className="rounded-2xl p-5 border border-[#D4AF37]/40 shadow-xl space-y-4 text-white bg-cover bg-center overflow-hidden transition-all relative"
          style={{ backgroundImage: `linear-gradient(to bottom right, rgba(20, 26, 45, 0.88), rgba(10, 50, 30, 0.84)), url('/hero_bg.jpg')` }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              Articles sous le Seuil Critique ({criticalProducts.length})
            </h3>
            <button
              onClick={() => setActiveTab("inventory")}
              className="text-xs font-semibold text-red-400 hover:underline"
            >
              Gérer l'inventaire &rarr;
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {criticalProducts.length > 0 ? (
              criticalProducts.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-red-950/70 border border-red-500/50 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-10 h-10 object-contain rounded-lg bg-slate-900 p-1 border border-gray-700 shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = "/hero_bg.jpg";
                      }}
                    />
                    <div>
                      <div className="text-sm font-bold text-white">{p.name}</div>
                      <div className="text-xs text-gray-300">
                        {p.supplier.includes("SABC") ? "SABC Cameroun" : "Guinness Cameroun"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-xs font-bold text-red-400 font-mono">
                        Reste: {p.currentStockBottles} btl(s)
                      </div>
                      <div className="text-[10px] text-gray-400">
                        Seuil min: {p.minAlertThresholdBottles}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const casiers = prompt(`Combien de casiers de ${p.name} souhaitez-vous ajouter au stock ?`, "5");
                        if (casiers && !isNaN(casiers)) {
                          addRestockMovement(p.id, parseInt(casiers, 10), p.buyPriceCasier, "Restock rapide depuis Dashboard");
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#0A5C36] text-white text-xs font-bold hover:bg-[#08492b] transition-colors shrink-0"
                    >
                      + Recharger
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-emerald-400 font-medium text-sm bg-emerald-950/60 rounded-xl border border-emerald-500/50">
                🎉 Tous les stocks SABC & Guinness sont actuellement au-dessus du seuil de sécurité !
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
