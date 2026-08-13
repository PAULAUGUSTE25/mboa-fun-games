import { useState } from "react";
import { useBar } from "../context/BarContext";
import { APP_LOGO } from "../data/sabcGuinnessCatalog";
import {
  Printer,
  Search,
  QrCode,
  X,
  Trash2,
  ShieldCheck,
} from "lucide-react";

export default function InvoicesReceipts() {
  const { sales, deleteSale, currentUser, latestReceipt, isReceiptModalOpen, setIsReceiptModalOpen } = useBar();
  const [selectedReceipt, setSelectedReceipt] = useState(latestReceipt || sales[0] || null);
  const [search, setSearch] = useState("");

  const isAdmin = currentUser?.role === "ADMIN";

  const filteredSales = sales.filter(
    (s) =>
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.table.toLowerCase().includes(search.toLowerCase()) ||
      s.server.toLowerCase().includes(search.toLowerCase())
  );

  const openReceiptModal = (rec) => {
    setSelectedReceipt(rec);
    setIsReceiptModalOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDeleteReceipt = (saleId) => {
    if (!isAdmin) {
      const pinPrompt = prompt(
        "🔒 ACCÈS RESTREINT ADMINISTRATEUR (Paul)\n\nLes serveurs ne sont pas autorisés à modifier ou supprimer les factures.\nSeul l'Administrateur (Paul) peut annuler une facture mal faite.\n\nSaisissez le code PIN Administrateur pour déverrouiller :"
      );
      if (pinPrompt !== "1234") {
        alert("❌ Code PIN incorrect ou annulation. Action refusée. Seul l'Administrateur peut annuler une facture.");
        return;
      }
    }

    if (confirm(`Voulez-vous vraiment annuler et supprimer la facture #${saleId} ?\n\nLe stock des boissons facturées sera automatiquement réintégré.`)) {
      deleteSale(saleId, true);
      setIsReceiptModalOpen(false);
      alert(`✅ Facture #${saleId} annulée par l'Administrateur. Les bouteilles ont été réintégrées dans le stock avec succès.`);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Factures & Reçus de Caisse
            </h2>
            {isAdmin ? (
              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0A5C36]" /> Mode Administrateur (Paul)
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300 text-[10px] font-bold flex items-center gap-1">
                <span>👤</span> Mode Serveur (Facturation uniquement)
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">
            Archive des ventes et impression. Toute annulation ou modification de facture est strictement réservée à l'Administrateur.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par #Reçu, table ou serveur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0A5C36]"
          />
        </div>
      </div>

      {/* Mobile Receipts Cards View */}
      <div className="md:hidden space-y-3">
        {filteredSales.map((sale) => (
          <div
            key={sale.id}
            className="bg-white rounded-2xl p-3.5 border border-gray-200 shadow-xs space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-[#0A5C36] text-xs">
                #{sale.id}
              </span>
              <div className="flex items-center space-x-1.5">
                <span className="px-2 py-0.5 rounded-md bg-gray-100 font-semibold text-[10px] text-gray-700">
                  {sale.paymentMethod || "Espèces"}
                </span>
                <button
                  onClick={() => handleDeleteReceipt(sale.id)}
                  title="Supprimer la facture (Admin)"
                  className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs cursor-pointer" onClick={() => openReceiptModal(sale)}>
              <div>
                <div className="font-bold text-slate-900">{sale.table}</div>
                <div className="text-gray-500 text-[11px] font-mono">
                  {new Date(sale.timestamp).toLocaleString("fr-FR")} • {sale.server}
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono font-black text-slate-900 text-sm">
                  {(sale.totalAmount || 0).toLocaleString()} F
                </div>
                <div className="text-[10px] text-[#0A5C36] font-bold flex items-center gap-1 justify-end">
                  <Printer className="w-3 h-3" /> Ticket
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sales Receipts Table (Desktop) */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1E1E2F] text-gray-300 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">N° Reçu</th>
                <th className="py-3.5 px-4">Date & Heure</th>
                <th className="py-3.5 px-4">Emplacement (Table)</th>
                <th className="py-3.5 px-4">Serveur</th>
                <th className="py-3.5 px-4">Mode de Règlement</th>
                <th className="py-3.5 px-4 text-right">Montant Total</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#0A5C36]">
                    #{sale.id}
                  </td>
                  <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">
                    {new Date(sale.timestamp).toLocaleString("fr-FR")}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">{sale.table}</td>
                  <td className="py-3 px-4 text-gray-600">{sale.server}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 font-semibold text-[10px] text-gray-700">
                      {sale.paymentMethod || "Espèces"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-black text-slate-900 text-sm">
                    {(sale.totalAmount || 0).toLocaleString()} FCFA
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center space-x-1.5">
                      <button
                        onClick={() => openReceiptModal(sale)}
                        className="px-3 py-1 bg-gray-100 hover:bg-[#0A5C36] hover:text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" /> Voir / Imprimer
                      </button>

                      <button
                        onClick={() => handleDeleteReceipt(sale.id)}
                        title="Supprimer la facture (Admin uniquement)"
                        className="p-1.5 bg-gray-100 hover:bg-red-600 hover:text-white text-gray-400 rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Thermal Receipt Modal */}
      {isReceiptModalOpen && selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setIsReceiptModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Thermal Ticket Format Container */}
            <div
              id="printable-receipt"
              className="p-4 bg-white text-slate-900 font-mono text-xs border border-dashed border-gray-300 rounded-xl space-y-3 shadow-inner"
            >
              {/* Header */}
              <div className="text-center space-y-1 pb-2 border-b border-dashed border-gray-400">
                <img
                  src={APP_LOGO}
                  alt="Logo La Terrasse"
                  className="w-14 h-14 mx-auto rounded-full object-cover border-2 border-slate-900 mb-1"
                />
                <div className="font-black text-sm uppercase tracking-wider">
                  LA TERRASSE
                </div>
                <div className="text-[10px] text-gray-600 font-bold">
                  Jean Vespa • Yaoundé - Cameroun
                </div>
                <div className="text-[10px] text-gray-600">
                  Tél: (+237) 695 58 42 90 • SABC & Guinness
                </div>
              </div>

              {/* Receipt Info */}
              <div className="text-[11px] space-y-0.5 text-gray-700">
                <div className="flex justify-between">
                  <span>Reçu N°:</span>
                  <span className="font-bold">#{selectedReceipt.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{new Date(selectedReceipt.timestamp || Date.now()).toLocaleString("fr-FR")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Serveur:</span>
                  <span className="font-bold">{selectedReceipt.server || "Caissier"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Emplacement:</span>
                  <span className="font-bold">{selectedReceipt.table || "Comptoir"}</span>
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="pt-2 border-t border-dashed border-gray-400 space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold uppercase text-gray-500 pb-1 border-b border-gray-200">
                  <span>Article</span>
                  <span>Qté x P.U = Total</span>
                </div>
                {(selectedReceipt.items || []).map((item, idx) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span className="font-bold truncate pr-2">{item.name}</span>
                    <span className="shrink-0">
                      {item.quantity || 1} x {item.unitPrice || 0} = {((item.quantity || 1) * (item.unitPrice || 0)).toLocaleString()} F
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="pt-2 border-t border-dashed border-gray-400 space-y-1 text-[11px]">
                {(selectedReceipt.discount || 0) > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Remise:</span>
                    <span>-{(selectedReceipt.discount || 0).toLocaleString()} FCFA</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black pt-1 border-t border-gray-300">
                  <span>TOTAL NET:</span>
                  <span>{(selectedReceipt.totalAmount || 0).toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-[10px] text-gray-600">
                  <span>Règlement:</span>
                  <span className="font-bold">{selectedReceipt.paymentMethod || "Espèces"}</span>
                </div>
              </div>

              {/* Footer barcode visual */}
              <div className="text-center pt-3 border-t border-dashed border-gray-400 space-y-1">
                <div className="text-[10px] font-bold text-gray-500">
                  Merci pour votre visite !
                </div>
                <div className="text-[9px] text-gray-400">
                  Logiciel certifié Terrasse Bars Manager
                </div>
                <QrCode className="w-10 h-10 mx-auto opacity-70 mt-1" />
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={handlePrint}
                className="flex-1 py-2.5 rounded-xl bg-[#0A5C36] text-white font-bold text-xs hover:bg-[#08492b] flex items-center justify-center space-x-1.5 shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer (80mm)</span>
              </button>

              <button
                onClick={() => handleDeleteReceipt(selectedReceipt.id)}
                title="Supprimer cette facture (Admin)"
                className="px-3 py-2.5 rounded-xl bg-red-100 hover:bg-red-600 text-red-700 hover:text-white font-bold text-xs flex items-center space-x-1 transition-all cursor-pointer border border-red-300"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Supprimer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
