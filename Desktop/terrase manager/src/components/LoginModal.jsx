import { useState } from "react";
import { useBar } from "../context/BarContext";
import { APP_LOGO } from "../data/sabcGuinnessCatalog";
import { Lock, Delete, KeyRound } from "lucide-react";

export default function LoginModal() {
  const { USERS, login } = useBar();

  const [selectedUserId, setSelectedUserId] = useState(USERS[0].id);
  const [pinInput, setPinInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const selectedUser = USERS.find((u) => u.id === selectedUserId) || USERS[0];

  const handleKeyPress = (numStr) => {
    setErrorMsg("");
    if (pinInput.length < 4) {
      const newPin = pinInput + numStr;
      setPinInput(newPin);

      // Auto validate upon entering 4 digits
      if (newPin.length === 4) {
        const success = login(selectedUserId, newPin);
        if (!success) {
          setErrorMsg("Code PIN incorrect. Veuillez réessayer.");
          setTimeout(() => setPinInput(""), 600);
        }
      }
    }
  };

  const handleDeleteDigit = () => {
    setErrorMsg("");
    setPinInput((prev) => prev.slice(0, -1));
  };

  const handleClearPin = () => {
    setErrorMsg("");
    setPinInput("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pinInput) return;
    const success = login(selectedUserId, pinInput);
    if (!success) {
      setErrorMsg("Code PIN incorrect. Veuillez réessayer.");
      setPinInput("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 selection:bg-[#0A5C36] selection:text-white">
      {/* Ambient background decoration */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 pointer-events-none filter blur-[2px]"
        style={{ backgroundImage: `url('/hero_bg.jpg')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/80 to-[#0A5C36]/30 pointer-events-none" />

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/90 border border-[#D4AF37]/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-white backdrop-blur-xl">
        {/* Branding Header */}
        <div className="text-center space-y-2">
          <div className="relative w-16 h-16 mx-auto rounded-full border-2 border-[#D4AF37] p-0.5 bg-slate-950 shadow-xl overflow-hidden">
            <img
              src={APP_LOGO}
              alt="Logo La Terrasse"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight font-sans text-white">
              LA TERRASSE
            </h2>
            <p className="text-xs text-[#D4AF37] font-extrabold uppercase tracking-widest">
              POS & GESTION CAISSE BAR
            </p>
          </div>
        </div>

        {/* User Selection Chips */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
            Sélectionner votre Profil
          </label>

          <div className="grid grid-cols-3 gap-2">
            {USERS.map((user) => {
              const isSelected = selectedUserId === user.id;
              const isAdmin = user.role === "ADMIN";

              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => {
                    setSelectedUserId(user.id);
                    setPinInput("");
                    setErrorMsg("");
                  }}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-b from-[#0A5C36] to-[#08492b] border-[#D4AF37] shadow-lg ring-2 ring-[#D4AF37]/30 scale-[1.02]"
                      : "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center mb-1 text-xs font-black border border-white/20">
                    {isAdmin ? "👑" : "🍺"}
                  </div>
                  <div className="text-xs font-extrabold truncate w-full">
                    {user.name.split(" ")[0]}
                  </div>
                  <div
                    className={`text-[9px] font-bold uppercase tracking-tight px-1.5 py-0.2 rounded-full mt-0.5 ${
                      isAdmin ? "bg-amber-400 text-slate-950" : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {isAdmin ? "Admin" : "Serveur"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* PIN Input Display */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 text-center">
            <div className="flex items-center justify-center space-x-2 text-xs font-bold text-slate-300">
              <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Entrez le Code PIN ({selectedUser.role === "ADMIN" ? "Admin" : "Serveur"})</span>
            </div>

            {/* 4 Dots PIN Display */}
            <div className="flex items-center justify-center space-x-3 py-2">
              {[0, 1, 2, 3].map((idx) => {
                const filled = pinInput.length > idx;
                return (
                  <div
                    key={idx}
                    className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                      filled
                        ? "bg-[#D4AF37] border-[#D4AF37] shadow-[0_0_10px_#D4AF37]"
                        : "border-slate-600 bg-slate-950/50"
                    }`}
                  />
                );
              })}
            </div>

            {errorMsg && (
              <div className="text-xs font-bold text-red-400 bg-red-950/60 p-2 rounded-xl border border-red-500/40 animate-bounce">
                {errorMsg}
              </div>
            )}
          </div>

          {/* Touchscreen 0-9 Keypad */}
          <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyPress(num)}
                className="py-3 rounded-2xl bg-slate-800 hover:bg-[#0A5C36] active:bg-[#08492b] text-white font-mono font-black text-lg transition-all border border-slate-700/80 shadow-md cursor-pointer active:scale-95"
              >
                {num}
              </button>
            ))}

            <button
              type="button"
              onClick={handleClearPin}
              className="py-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 font-bold text-xs transition-all border border-slate-700/80 cursor-pointer"
            >
              Effacer
            </button>

            <button
              type="button"
              onClick={() => handleKeyPress("0")}
              className="py-3 rounded-2xl bg-slate-800 hover:bg-[#0A5C36] active:bg-[#08492b] text-white font-mono font-black text-lg transition-all border border-slate-700/80 shadow-md cursor-pointer active:scale-95"
            >
              0
            </button>

            <button
              type="button"
              onClick={handleDeleteDigit}
              className="py-3 rounded-2xl bg-slate-800/60 hover:bg-red-950 text-red-400 flex items-center justify-center transition-all border border-slate-700/80 cursor-pointer"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* Security Badge Footer (PINs hidden for privacy) */}
        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 text-center font-medium flex items-center justify-center space-x-2">
          <KeyRound className="w-4 h-4 text-[#D4AF37]" />
          <span>Accès Sécurisé • Saisissez votre code PIN personnel à 4 chiffres</span>
        </div>
      </div>
    </div>
  );
}
