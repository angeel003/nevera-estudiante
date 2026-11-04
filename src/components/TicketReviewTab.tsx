import React from 'react';
import {
  FileText,
  Upload,
  CheckCircle2,
  Trash2,
  Plus,
  Sparkles,
  ShoppingBag,
  PauseCircle,
  Share2
} from 'lucide-react';
import type { TicketSession, TicketReviewItem, Category } from '../types';

interface TicketReviewTabProps {
  ticketSession: TicketSession | null;
  selectedSupermarket: string;
  onSelectSupermarket: (sm: string) => void;
  isProcessingFile: boolean;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLoadDemoTicket: () => void;
  onToggleVerified: (id: string) => void;
  onUpdateReviewItem: (id: string, updates: Partial<TicketReviewItem>) => void;
  onDiscardItem: (id: string) => void;
  onOpenAddModal: () => void;
  onDiscardSession: () => void;
  onFinalizeTicket: (onlyVerified: boolean) => void;
}

export const TicketReviewTab: React.FC<TicketReviewTabProps> = ({
  ticketSession,
  selectedSupermarket,
  onSelectSupermarket,
  isProcessingFile,
  onFileInputChange,
  onLoadDemoTicket,
  onToggleVerified,
  onUpdateReviewItem,
  onDiscardItem,
  onOpenAddModal,
  onDiscardSession,
  onFinalizeTicket
}) => {
  const verifiedCount = ticketSession?.items.filter(i => i.status === 'verified').length || 0;
  const totalItems = ticketSession?.items.length || 0;
  const totalCalculatedPrice = ticketSession?.items.reduce((sum, item) => sum + (item.price || 0), 0) || 0;

  return (
    <div className="space-y-4 max-w-full overflow-hidden">
      {/* Selector de supermercado y subida */}
      <div className="bg-white p-3.5 sm:p-4 rounded-3xl shadow-xs border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Escanear y Revisar Ticket</span>
            </h2>
            <p className="text-xs text-slate-500">
              Sube foto, PDF o comparte el ticket digital de la app del súper
            </p>
          </div>
          <span className="self-start sm:self-auto text-[11px] bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200 shrink-0">
            Filtro de súper
          </span>
        </div>

        {/* Estado de detección y Supermercado */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-600">Supermercado:</span>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md capitalize">
              {ticketSession?.supermarket || selectedSupermarket}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500">Cambiar:</span>
            <select
              value={selectedSupermarket}
              onChange={e => onSelectSupermarket(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full sm:w-auto"
            >
              <option value="mercadona">Mercadona</option>
              <option value="dia">Día</option>
              <option value="carrefour">Carrefour</option>
              <option value="lidl">Lidl</option>
              <option value="alcampo">Alcampo</option>
              <option value="eroski">Eroski</option>
              <option value="otro">Otro súper / Tienda</option>
            </select>
          </div>
        </div>

        {/* Upload actions responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <label className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl cursor-pointer active:scale-95 transition shadow-xs text-center">
            <Upload className="w-4 h-4 shrink-0" />
            <span>{isProcessingFile ? 'Leyendo ticket...' : 'Subir foto o PDF'}</span>
            <input
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={onFileInputChange}
              disabled={isProcessingFile}
            />
          </label>

          <button
            onClick={onLoadDemoTicket}
            disabled={isProcessingFile}
            className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2.5 px-3 rounded-xl transition active:scale-95 text-center"
          >
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Probar ticket demo</span>
          </button>
        </div>

        {/* Share target info banner */}
        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-2.5 flex items-start gap-2 text-[11px] text-sky-800">
          <Share2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <strong>Consejo para tickets digitales de Día, Lidl o Carrefour:</strong> Dale a "Compartir PDF" en su app oficial y selecciona esta web para revisarlo al momento.
          </div>
        </div>
      </div>

      {/* Vista de revisión activa */}
      {ticketSession ? (
        <div className="space-y-3">
          {/* Banner de progreso y pausa */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <PauseCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Revisión en pausa disponible</span>
              </span>
              <span className="text-[11px] font-semibold bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded-full shrink-0">
                {verifiedCount} de {totalItems} verificados
              </span>
            </div>
            <p className="text-[11px] text-amber-800">
              Puedes cerrar la aplicación cuando quieras: el ticket se guarda automáticamente como borrador para continuar luego.
            </p>
          </div>

          {/* Barra de acciones de la sesión */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
                Productos detectados ({totalItems})
              </span>
              <p className="text-[11px] text-slate-400">Total aprox: {totalCalculatedPrice.toFixed(2)}€</p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={onOpenAddModal}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1.5 rounded-xl transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir alimento</span>
              </button>
              <button
                onClick={onDiscardSession}
                className="text-slate-400 hover:text-red-500 p-1.5 rounded-xl hover:bg-red-50 transition"
                title="Descartar sesión"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Lista de productos para verificar en Grid Responsive sin desbordamiento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {ticketSession.items.map(item => (
              <div
                key={item.id}
                className={`bg-white p-3.5 rounded-2xl border transition shadow-xs space-y-2 flex flex-col justify-between overflow-hidden ${
                  item.status === 'verified'
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Cabecera del item: texto original vs nombre interpretado */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded truncate block">
                      Texto leído: "{item.rawText}"
                    </span>
                    <div className="mt-1">
                      <input
                        type="text"
                        value={item.name}
                        onChange={e => onUpdateReviewItem(item.id, { name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder="Nombre del alimento"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => onDiscardItem(item.id)}
                    className="text-slate-300 hover:text-red-500 p-1 transition shrink-0"
                    title="Descartar producto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Campos editables: Diseño adaptable que nunca se sale de la pantalla */}
                <div className="space-y-2 pt-1 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Categoría</label>
                    <select
                      value={item.category}
                      onChange={e => onUpdateReviewItem(item.id, { category: e.target.value as Category })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-1.5 text-xs text-slate-700"
                    >
                      <option value="fruta-verdura">🍎 Fruta/Verdura</option>
                      <option value="carne-pescado">🥩 Carne/Pescado</option>
                      <option value="lacteos">🧀 Lácteos</option>
                      <option value="despensa">🥫 Despensa</option>
                      <option value="congelados">🧊 Congelados</option>
                      <option value="comida-preparada">🍱 Preparada</option>
                      <option value="bebidas">🧃 Bebidas</option>
                      <option value="otros">🍽️ Otros</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Cantidad</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => onUpdateReviewItem(item.id, { quantity: Number(e.target.value) || 1 })}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-1.5 text-center font-semibold text-xs"
                        />
                        <span className="text-[11px] text-slate-400 shrink-0">{item.unit}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Precio (€)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.price ?? ''}
                        onChange={e => onUpdateReviewItem(item.id, { price: e.target.value ? parseFloat(e.target.value) : undefined })}
                        placeholder="0.00"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-1.5 text-center font-semibold text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Fecha Caducidad</label>
                    <input
                      type="date"
                      value={item.expiryDate || ''}
                      onChange={e => onUpdateReviewItem(item.id, { expiryDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-1.5 text-xs text-slate-600"
                    />
                  </div>
                </div>

                {/* Botón de verificación individual */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => onToggleVerified(item.id)}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition active:scale-95 ${
                      item.status === 'verified'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-300 hover:border-emerald-400'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${item.status === 'verified' ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.status === 'verified' ? '¡Verificado!' : 'Marcar como revisado'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Botones de Finalización de Ticket */}
          <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200 shadow-lg space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => onFinalizeTicket(true)}
                disabled={verifiedCount === 0}
                className="bg-white border border-emerald-600 text-emerald-700 hover:bg-emerald-50 disabled:opacity-40 text-xs font-bold py-2.5 px-3 rounded-xl transition active:scale-95 text-center"
              >
                Añadir solo verificados ({verifiedCount})
              </button>

              <button
                onClick={() => onFinalizeTicket(false)}
                disabled={totalItems === 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 text-xs font-bold py-2.5 px-3 rounded-xl shadow-xs transition active:scale-95 text-center"
              >
                Añadir todo al frigo ({totalItems})
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center">
              Si añades solo los verificados, el resto se queda en borrador para revisarlo más tarde.
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-slate-300 p-6">
          <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-600 font-medium">No hay ningún ticket en revisión</p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Sube una foto o PDF arriba o pulsa "Probar ticket demo" para ver cómo funciona el lector y revisor de alimentos.
          </p>
        </div>
      )}
    </div>
  );
};
