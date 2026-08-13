import { useBar } from "../context/BarContext";
import { APP_LOGO, APP_MENU_BG } from "../data/sabcGuinnessCatalog";
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  ArrowUpDown,
  Receipt,
  ShieldCheck,
  Package,
} from "lucide-react";

export default function Sidebar() {
  const { activeTab, setActiveTab, products, cart } = useBar();

  // Stock alert count
  const alertCount = products.filter(
    (p) => p.currentStockBottles <= p.minAlertThresholdBottles
  ).length;

  const totalCartQty = cart.reduce((sum, i) => sum + i.quantity, 0);

  const navItems = [
    {
      id: "dashboard",
      label: "Tableau de Bord",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "pos",
      label: "Prise de Commande",
      icon: ShoppingCart,
      badge: totalCartQty > 0 ? totalCartQty : null,
      badgeColor: "bg-amber-500 text-slate-950 font-bold",
    },
    {
      id: "inventory",
      label: "Stock & Inventaire",
      icon: Boxes,
      badge: alertCount > 0 ? alertCount : null,
      badgeColor: "bg-red-500 text-white font-bold",
    },
    {
      id: "movements",
      label: "Mouvements Stock",
      icon: ArrowUpDown,
      badge: null,
    },
    {
      id: "invoices",
      label: "Factures & Reçus",
      icon: Receipt,
      badge: null,
    },
  ];

  return (
    <aside className="hidden md:flex w-64 border-r border-slate-200/80 flex-col justify-between shrink-0 shadow-lg relative overflow-hidden bg-slate-900 text-white">
      {/* Dedicated Background Image for Menu Section */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 pointer-events-none transition-opacity duration-300 transform scale-105"
        style={{ backgroundImage: `url('${APP_MENU_BG}')` }}
      />
      {/* Gradient Overlay for Optimal Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-900/75 to-slate-950/90 pointer-events-none" />

      {/* Navigation Links Content */}
      <div className="p-3 space-y-1.5 relative z-10">
        {/* Logo Branding Card in Sidebar */}
        <div className="px-3.5 py-3 mb-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center space-x-3 shadow-md">
          <img
            src={APP_LOGO}
            alt="Logo La Terrasse Premium"
            className="w-10 h-10 rounded-full object-cover shrink-0 border-2 border-[#D4AF37]"
          />
          <div>
            <div className="text-xs font-black text-white tracking-wide">LA TERRASSE</div>
            <div className="text-[10px] text-[#D4AF37] font-extrabold tracking-wider uppercase">PREMIUM BAR</div>
          </div>
        </div>

        <div className="px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
          MENU PRINCIPAL
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${isActive
                  ? "bg-gradient-to-r from-[#0A5C36] to-[#08492b] text-white shadow-lg font-bold border border-emerald-500/30"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`w-5 h-5 ${isActive ? "text-[#D4AF37]" : "text-slate-400"
                    }`}
                />
                <span className={isActive ? "text-white font-black" : ""}>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${item.badgeColor || "bg-white/20 text-white"
                    }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Supplier & System Status Footer */}
      <div className="p-4 m-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-3 shadow-md relative z-10">
        <div className="flex items-center space-x-2 text-xs font-bold text-white">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Brasseries Connectées</span>
        </div>

        <div className="space-y-1.5 text-[11px] text-slate-300 font-medium">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Package className="w-3 h-3 text-emerald-400" /> SABC Cameroun
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Package className="w-3 h-3 text-amber-400" /> Guinness Cameroun
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
        </div>

        <div className="pt-2 border-t border-white/10 text-[10px] text-slate-400 text-center font-medium">
          La Terrasse  v3.0 • POS & Caisse
        </div>
      </div>
    </aside>
  );
}
