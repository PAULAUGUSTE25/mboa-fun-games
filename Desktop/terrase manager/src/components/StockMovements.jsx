import { useState } from "react";
import { useBar } from "../context/BarContext";
import {
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";

export default function StockMovements() {
  const { movements, products, addRestockMovement, currentUser } = useBar();
  const [filterType, setFilterType] = useState("ALL");
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);

  const isAdmin = currentUser?.role === "ADMIN";

  const handleOpenRestockModal = () => {
    if (!isAdmin) {
      const pinPrompt = prompt(
        "🔒 ACCÈS RESTREINT ADMINISTRATEUR (Paul)\n\nSeul l'Administrateur (Paul) est autorisé à saisir une livraison de stock.\nSaisissez le code PIN Administrateur pour déverrouiller :"
      );
      if (pinPrompt !== "1234") {
        alert("❌ Code PIN incorrect ou annulation. Action réservée à l'Administrateur.");
        return;
      }
    }
    setIsRestockModalOpen(true);
  };

  // Form for restock entry
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || "");
  const [casiersCount, setCasiersCount] = useState(10);
  const [notes, setNotes] = useState("Livraison camion SABC/Guinness");

  const filteredMovements = movements.filter((m) => {
    if (filterType === "ENTREE") return m.type.includes("Entrée");
    if (filterType === "SORTIE") return m.type.includes("Sortie");
    return true;
  });

  const handleRestockSubmit = (e) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    addRestockMovement(
      selectedProductId,
      Number(casiersCount),
      prod.buyPriceCasier,
      notes
    );
    setIsRestockModalOpen(false);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Historique des Mouvements de Stock
          </h2>
          <p className="text-xs text-gray-500">
            Traçabilité complète des livraisons brasseries et des sorties de caisse
          </p>
        </div>

        <button
          onClick={handleOpenRestockModal}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#0A5C36] text-white font-bold text-xs hover:bg-[#08492b] transition-all shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Saisir une Livraison (Entrée)</span>
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center space-x-2 bg-white p-2 rounded-2xl border border-gray-200 shadow-xs">
        {[
          { id: "ALL", label: "Tous les Mouvements" },
          { id: "ENTREE", label: "Entrées (Livraisons Brasseries)" },
          { id: "SORTIE", label: "Sorties (Ventes & Pertes)" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === tab.id
                ? "bg-[#1E1E2F] text-white shadow-xs"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Mobile Movements Cards View (Visible on small screens < md) */}
      <div className="md:hidden space-y-3">
        {filteredMovements.map((mov) => {
          const isEntry = mov.type.includes("Entrée");
          return (
            <div
              key={mov.id}
              className="bg-white rounded-2xl p-3.5 border border-gray-200 shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isEntry
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {isEntry ? (
                    <>
                      <ArrowDownLeft className="w-3 h-3 text-emerald-600" /> Entrée (Livraison)
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="w-3 h-3 text-amber-600" /> Sortie (Vente)
                    </>
                  )}
                </span>

                <span className="font-mono text-[10px] text-gray-500">
                  {new Date(mov.date).toLocaleString("fr-FR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{mov.productName}</div>
                  <div className="text-gray-500 text-[11px] font-mono">{mov.supplier}</div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-black text-slate-900 text-sm">
                    {isEntry ? `+${mov.quantityBottles}` : `-${mov.quantityBottles}`} btl(s)
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono">
                    ~{mov.casiersCount} casier(s)
                  </div>
                </div>
              </div>

              {mov.notes && (
                <div className="text-[11px] text-gray-500 pt-1 border-t border-gray-100 font-mono italic">
                  Note: {mov.notes}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Movements Table (Desktop) */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1E1E2F] text-gray-300 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Date & Heure</th>
                <th className="py-3.5 px-4">Type de Mouvement</th>
                <th className="py-3.5 px-4">Produit</th>
                <th className="py-3.5 px-4">Fournisseur</th>
                <th className="py-3.5 px-4 text-center">Quantité (Casiers)</th>
                <th className="py-3.5 px-4 text-center">Quantité (Bouteilles)</th>
                <th className="py-3.5 px-4">Notes / Référence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredMovements.map((mov) => {
                const isEntry = mov.type.includes("Entrée");
                return (
                  <tr key={mov.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-gray-500 text-[11px]">
                      {new Date(mov.date).toLocaleString("fr-FR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          isEntry
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {isEntry ? (
                          <>
                            <ArrowDownLeft className="w-3 h-3 text-emerald-600" /> Entrée (Livraison)
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="w-3 h-3 text-amber-600" /> Sortie (Vente)
                          </>
                        )}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-900">{mov.productName}</td>

                    <td className="py-3 px-4 text-gray-600">{mov.supplier}</td>

                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                      {mov.casiersCount} casier(s)
                    </td>

                    <td className="py-3 px-4 text-center font-mono font-black text-slate-900">
                      {isEntry ? `+${mov.quantityBottles}` : `-${mov.quantityBottles}`} btl(s)
                    </td>

                    <td className="py-3 px-4 text-gray-500 text-[11px]">{mov.notes || "---"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      {isRestockModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              Enregistrer une Livraison Fournisseur
            </h3>

            <form onSubmit={handleRestockSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Sélectionner la Boisson SABC / Guinness
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs outline-none"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.supplier.includes("SABC") ? "SABC" : "Guinness"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nombre de Casiers / Cartons Réceptionnés
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={casiersCount}
                  onChange={(e) => setCasiersCount(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Notes / Référence du Bon de Livraison
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Bon BL-SABC-8492"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsRestockModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0A5C36] text-white text-xs font-bold hover:bg-[#08492b] shadow-md cursor-pointer"
                >
                  Valider la Réception
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
