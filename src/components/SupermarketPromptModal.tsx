import React, { useState } from 'react';
import { Store, Check, ArrowRight } from 'lucide-react';
import { SUPERMARKET_CATALOGS } from '../supermarkets';

interface SupermarketPromptModalProps {
  detectedName?: string;
  onConfirm: (supermarketId: string, customName?: string) => void;
  onCancel: () => void;
}

export const SupermarketPromptModal: React.FC<SupermarketPromptModalProps> = ({
  detectedName,
  onConfirm,
  onCancel,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('mercadona');
  const [customName, setCustomName] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCustom) {
      if (!customName.trim()) return;
      onConfirm('custom', customName.trim());
    } else {
      onConfirm(selectedPreset);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-2xl border border-slate-100">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <Store className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">¿De qué tienda es el ticket?</h3>
          <p className="text-xs text-slate-500">
            {detectedName
              ? `Hemos detectado indicios de "${detectedName}". Confírmalo o elige la tienda:`
              : 'No pudimos reconocer la tienda automáticamente en el texto del ticket. Indícanos cuál es:'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Opciones de supermercados registrados */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.values(SUPERMARKET_CATALOGS).map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => {
                    setSelectedPreset(cat.id);
                    setIsCustom(false);
                  }}
                  className={`p-2.5 rounded-xl border font-semibold flex items-center justify-between transition ${
                    !isCustom && selectedPreset === cat.id
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  {!isCustom && selectedPreset === cat.id && (
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {/* Opción de otra tienda no registrada */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setIsCustom(true)}
                className={`w-full p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition ${
                  isCustom
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>➕ Otra tienda / Supermercado local</span>
                {isCustom && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
              </button>
            </div>
          </div>

          {/* Campo libre para supermercado personalizado */}
          {isCustom && (
            <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="text-[11px] font-semibold text-slate-600 block">
                Nombre de la tienda o establecimiento:
              </label>
              <input
                type="text"
                placeholder="Ej: Frutería Paco, Carnicería Hermanos López..."
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <p className="text-[10px] text-slate-400">
                La app guardará este supermercado y aprenderá sus productos para futuros tickets.
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2.5 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>Buscar alimentos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
