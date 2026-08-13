import { BarProvider, useBar } from "./context/BarContext";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import BottomNav from "./components/BottomNav";
import Dashboard from "./components/Dashboard";
import POSCaisse from "./components/POSCaisse";
import InventoryManager from "./components/InventoryManager";
import StockMovements from "./components/StockMovements";
import InvoicesReceipts from "./components/InvoicesReceipts";
import LoginModal from "./components/LoginModal";

function AppContent() {
  const { activeTab, currentUser } = useBar();

  if (!currentUser) {
    return <LoginModal />;
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "pos":
        return <POSCaisse />;
      case "inventory":
        return <InventoryManager />;
      case "movements":
        return <StockMovements />;
      case "invoices":
        return <InvoicesReceipts />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-gray-900 selection:bg-[#0A5C36] selection:text-white relative overflow-hidden">
      {/* Background Image Layer for ALL Pages - Vivid Bar Ambiance & Logo */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
        {/* Crisp Vivid Hero & Bar Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.65] scale-105 transition-all duration-500"
          style={{ backgroundImage: `url('/hero_bg.jpg')` }}
        />
        {/* Central Logo Overlay */}
        <div 
          className="absolute inset-0 bg-center bg-no-repeat bg-contain opacity-[0.35] max-w-3xl mx-auto my-auto p-8 transition-all duration-500"
          style={{ backgroundImage: `url('/la-terrasse-logo.png')` }}
        />
        {/* Soft Ambient Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#062414]/30 via-slate-900/10 to-[#062414]/30" />
      </div>

      {/* Top Header Navigation */}
      <Header />

      {/* Main Layout Container */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden relative z-10">
        {/* Responsive Sidebar (Desktop) */}
        <Sidebar />

        {/* Dynamic Tab Viewport */}
        <main className="flex-1 overflow-y-auto min-w-0 pb-16 md:pb-0 bg-transparent">
          {renderActiveTab()}
        </main>

        {/* Fixed Mobile Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BarProvider>
      <AppContent />
    </BarProvider>
  );
}
