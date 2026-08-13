import { useBar } from "../context/BarContext";
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  ArrowUpDown,
  Receipt,
} from "lucide-react";

export default function BottomNav() {
  const { activeTab, setActiveTab, products, cart } = useBar();

  // Stock alert count
  const alertCount = products.filter(
    (p) => p.currentStockBottles <= p.minAlertThresholdBottles
  ).length;

  const totalCartQty = cart.reduce((sum, i) => sum + i.quantity, 0);

  const navItems = [
    {
      id: "dashboard",
      label: "Tableau",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "pos",
      label: "Caisse POS",
      icon: ShoppingCart,
      badge: totalCartQty > 0 ? totalCartQty : null,
      badgeColor: "bg-amber-500 text-slate-950 font-black",
    },
    {
      id: "inventory",
      label: "Stock",
      icon: Boxes,
      badge: alertCount > 0 ? alertCount : null,
      badgeColor: "bg-red-500 text-white font-bold",
    },
    {
      id: "movements",
      label: "Mouvements",
      icon: ArrowUpDown,
      badge: null,
    },
    {
      id: "invoices",
      label: "Reçus",
      icon: Receipt,
      badge: null,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-1 py-1.5 shadow-2xl">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? "text-[#D4AF37] font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? "text-[#D4AF37] scale-110" : "text-slate-400"
                  }`}
                />
                {item.badge && (
                  <span
                    className={`absolute -top-1.5 -right-2 px-1.5 py-0.2 rounded-full text-[9px] min-w-4 text-center leading-tight shadow-sm ${
                      item.badgeColor || "bg-emerald-500 text-white font-bold"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? "font-extrabold text-white" : "font-medium"}`}>
                {item.label}
              </span>

              {/* Active Tab Underline Indicator */}
              {isActive && (
                <span className="absolute bottom-0 w-6 h-0.5 rounded-full bg-[#D4AF37]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
