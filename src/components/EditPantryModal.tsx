import React from 'react';
import { X, UtensilsCrossed, Lock } from 'lucide-react';
import type { PantryItem, Category } from '../types';

interface EditPantryModalProps {
  item: PantryItem;
  onClose: () => void;
  onSave: (updatedItem: PantryItem) => void;
}

export const EditPantryModal: React.FC<EditPantryModalProps> = ({
  item,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = React.useState<PantryItem>({
    ...item,
    location: item.location || (item.isFrozen ? 'congelador' : item.category === 'despensa' ? 'despensa' : 'nevera'),
    isVault: item.isVault || false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-5 w-full max-w-sm max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="font-bold text-slate-800 text-base">Modificar Alimento</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="text-slate-600 font-semibold block mb-1">Nombre</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Cantidad</label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) || 1 })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-center text-sm"
              />
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Unidad</label>
              <select
                value={formData.unit}
                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs"
              >
                <option value="uds">uds</option>
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="ml">ml</option>
                <option value="L">L</option>
                <option value="tupper">tupper</option>
                <option value="raciones">raciones</option>
                <option value="paquete">paq.</option>
              </select>
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Precio (€)</label>
              <input
                type="number"
                step="0.01"
                value={formData.price ?? ''}
                onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || undefined })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-center text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Categoría</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as Category })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs"
              >
                <option value="comida-preparada">🍱 Tupper/Preparada</option>
                <option value="congelados">🧊 Congelados</option>
                <option value="carne-pescado">🥩 Carne/Pescado</option>
                <option value="fruta-verdura">🍎 Fruta/Verdura</option>
                <option value="lacteos">🧀 Lácteos</option>
                <option value="despensa">🥫 Despensa</option>
                <option value="bebidas">🧃 Bebidas</option>
                <option value="otros">🍽️ Otros</option>
              </select>
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Caducidad</label>
              <input
                type="date"
                value={formData.expiryDate || ''}
                onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-[11px]"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-600 font-semibold block mb-1">¿Dónde está guardado?</label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, location: 'nevera', isFrozen: false })}
                className={`py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 border transition ${
                  formData.location === 'nevera'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                <span>❄️ Nevera</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, location: 'congelador', isFrozen: true })}
                className={`py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 border transition ${
                  formData.location === 'congelador'
                    ? 'bg-sky-100 text-sky-800 border-sky-300 font-bold'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                <span>🧊 Congelador</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, location: 'despensa', isFrozen: false })}
                className={`py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 border transition ${
                  formData.location === 'despensa'
                    ? 'bg-amber-100 text-amber-800 border-amber-300 font-bold'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                <span>🥫 Despensa</span>
              </button>
            </div>
          </div>

          {/* Opción de Bóveda Privada (Vault) */}
          <div className="p-3 bg-slate-900 text-white rounded-2xl space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Lock className={`w-4 h-4 ${formData.isVault ? 'text-amber-400' : 'text-slate-400'}`} />
                <span className="text-xs font-bold text-slate-100">Mi Bóveda Privada (Vault)</span>
              </div>
              <input
                type="checkbox"
                id="vaultCheckbox"
                checked={formData.isVault || false}
                onChange={e => setFormData({ ...formData, isVault: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500 cursor-pointer"
              />
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              {formData.isVault
                ? '🔒 Este alimento es SOLO TUYO. Tus compañeros de piso NO lo verán en la nevera.'
                : '🌍 Alimento compartido: Visible para tus compañeros de frigo para que sepan qué hay.'}
            </p>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isPreparedMeal: !formData.isPreparedMeal })}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 border transition ${
                formData.isPreparedMeal
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" /> Tupper / Preparada
            </button>
          </div>

          <div>
            <label className="text-slate-600 font-semibold block mb-1">Notas / Observaciones</label>
            <input
              type="text"
              value={formData.notes || ''}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Ej: Descongelar antes, tupper de mamá..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-semibold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold transition shadow-xs"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

