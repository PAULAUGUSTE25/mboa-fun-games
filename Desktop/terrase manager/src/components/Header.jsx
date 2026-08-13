import { useState, useEffect } from "react";
import { useBar } from "../context/BarContext";
import { APP_LOGO } from "../data/sabcGuinnessCatalog";
import {
  UserCheck,
  Clock,
  ShoppingBag,
  RefreshCw,
  Wifi,
  LogOut,
  ShieldCheck,
  Download,
} from "lucide-react";

export default function Header() {
  const {
    products,
    sales,
    cart,
    currentUser,
    logout,
    resetCatalog,
    isBackendConnected,
    isOnline,
    isSyncing,
    offlineQueue,
    syncOfflineQueue,
  } = useBar();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } else {
      alert(
        "📱 POUR INSTALLER L'APPLICATION SUR VOTRE APPAREIL :\n\n" +
          "• Sur Android / Chrome : Cliquez sur le menu (⋮) -> 'Ajouter à l'écran d'accueil' ou 'Installer l'application'.\n" +
          "• Sur iPhone / iPad (Safari) : Cliquez sur Partager (⎋) -> 'Sur l'écran d'accueil'.\n" +
          "• Sur Ordinateur / Chrome : Cliquez sur l'icône d'installation dans la barre d'adresse."
      );
    }
  };

  // Calculate REAL revenue strictly from actual recorded sales today
  const todaySalesTotal = sales
    .filter((s) => {
      const saleDate = new Date(s.timestamp).toDateString();
      const today = new Date().toDateString();
      return saleDate === today;
    })
    .reduce((sum, s) => sum + (s.totalAmount || 0), 0);

  // Critical stock items
  const criticalStockCount = products.filter(
    (p) => p.currentStockBottles <= p.minAlertThresholdBottles
  ).length;

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const isAdmin = currentUser?.role === "ADMIN";

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 sticky top-0 z-40 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 relative z-10">
        {/* Top Mobile Row / Left Branding */}
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center space-x-2.5">
            <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 border-[#0A5C36] flex items-center justify-center shadow-xs overflow-hidden shrink-0 bg-slate-50 ring-2 ring-[#0A5C36]/20">
              <img
                src={APP_LOGO}
                alt="Logo La Terrasse"
                className="w-full h-full object-cover rounded-full transform hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>

            <div>
              <div className="flex items-center space-x-1.5">
                <h1 className="text-sm sm:text-lg font-black tracking-tight text-slate-900 font-sans flex items-center gap-1">
                  LA TERRASSE <span className="text-[#0A5C36] tracking-wide">BAR</span>
                </h1>
                <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-[#0A5C36]/10 text-[#0A5C36] border border-[#0A5C36]/30 font-extrabold tracking-widest uppercase">
                  POS
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3 h-3 text-[#0A5C36] shrink-0" />
                <span className="text-slate-600 font-medium">
                  {currentTime.toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>

                <span className="h-2.5 w-px bg-slate-300"></span>

                {/* Network & Offline Status Badge */}
                <span className="flex items-center gap-1 text-[9px] sm:text-[10px]">
                  <Wifi className={`w-3 h-3 ${isOnline ? "text-emerald-600" : "text-amber-600 animate-pulse"}`} />
                  {isSyncing ? (
                    <span className="text-sky-700 font-extrabold animate-pulse flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Synchro...
                    </span>
                  ) : isOnline ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <span>En Ligne</span>
                      {offlineQueue.length > 0 && (
                        <button
                          onClick={syncOfflineQueue}
                          title="Cliquer pour synchroniser les ventes hors-ligne"
                          className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300 font-mono font-black"
                        >
                          {offlineQueue.length} en attente 🔄
                        </button>
                      )}
                    </span>
                  ) : (
                    <span className="text-amber-800 font-extrabold bg-amber-100 px-1.5 py-0.2 rounded-md border border-amber-300">
                      Hors Ligne ({offlineQueue.length} vente{offlineQueue.length > 1 ? "s" : ""} locale{offlineQueue.length > 1 ? "s" : ""})
                    </span>
                  )}
                </span>
              </p>
            </div>
          </div>

          {/* Mobile User Logout Button */}
          <button
            onClick={logout}
            title="Changer de session / Déconnexion"
            className="sm:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-[11px] shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-amber-300" />
            <span>Quitter</span>
          </button>
        </div>

        {/* Center: Real-Time KPIs Bar (Desktop & Tablet) */}
        <div className="hidden lg:flex items-center space-x-4 bg-slate-50 px-4 py-1.5 rounded-xl border border-slate-200 shadow-inner">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
              C.A. du jour (Réel)
            </span>
            <span className="text-sm font-black text-[#0A5C36] font-mono">
              {todaySalesTotal.toLocaleString()} FCFA
            </span>
          </div>

          <div className="h-6 w-px bg-slate-300"></div>

          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
              Alertes Stock
            </span>
            <span
              className={`text-sm font-black font-mono ${
                criticalStockCount > 0 ? "text-red-600" : "text-[#0A5C36]"
              }`}
            >
              {criticalStockCount > 0 ? `${criticalStockCount} Produit(s)` : "Stock OK"}
            </span>
          </div>

          {totalCartCount > 0 && (
            <>
              <div className="h-6 w-px bg-slate-300"></div>
              <div className="flex items-center space-x-1.5 text-amber-700 text-xs font-bold bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                <ShoppingBag className="w-4 h-4 text-amber-600" />
                <span>Panier: {totalCartCount} art.</span>
              </div>
            </>
          )}
        </div>

        {/* Right: PWA Download Button & User Profile */}
        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2">
          {/* PWA Download App Button */}
          <button
            onClick={handleInstallPWA}
            title="Installer l'application sur tablette/mobile/PC"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#0A5C36] border border-emerald-300 font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#0A5C36]" />
            <span className="hidden sm:inline">Télécharger App</span>
            <span className="sm:hidden">App</span>
          </button>

          {/* Active User Badge & Role Tag */}
          <div className="flex items-center space-x-2 bg-slate-100 border border-slate-300 rounded-xl px-3 py-1 shadow-xs">
            <div className="w-6 h-6 rounded-full bg-[#0A5C36] text-white flex items-center justify-center font-extrabold text-[11px] shrink-0">
              {isAdmin ? <ShieldCheck className="w-3.5 h-3.5 text-amber-300" /> : <UserCheck className="w-3.5 h-3.5" />}
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-900 max-w-[120px] sm:max-w-none truncate leading-tight">
                {currentUser?.name || "Jean-Paul"}
              </div>
              <div className="text-[9px] font-black text-[#0A5C36] uppercase tracking-wider">
                {isAdmin ? "Administrateur" : "Serveur (Caisse)"}
              </div>
            </div>
          </div>

          {/* Reset catalog data button (Admin only) */}
          {isAdmin && (
            <button
              onClick={resetCatalog}
              title="Réinitialiser le catalogue"
              className="p-2 rounded-xl bg-slate-50 text-slate-500 hover:text-slate-900 border border-slate-300 hover:border-slate-400 transition-all cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Switch User / Logout Button */}
          <button
            onClick={logout}
            title="Déconnexion / Changer d'utilisateur"
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-md hover:bg-slate-800 active:scale-95 transition-all cursor-pointer shrink-0 border border-slate-800"
          >
            <LogOut className="w-3.5 h-3.5 text-amber-400" />
            <span>Changer</span>
          </button>
        </div>
      </div>
    </header>
  );
}
