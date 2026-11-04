import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Store,
  Layers,
  Sparkles,
  X,
  Database,
  RefreshCw
} from 'lucide-react';
import type { ProposedFoodItem } from '../types';

interface AdminPanelModalProps {
  proposals: ProposedFoodItem[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onMergeWithExisting: (proposalId: string, existingId: string) => void;
  onClose: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  proposals,
  onApprove,
  onReject,
  onMergeWithExisting,
  onClose,
}) => {
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [dbStatus, setDbStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [dbMessage, setDbMessage] = useState<string | null>(null);

  const handleInitDatabase = async () => {
    if (!confirm('¿Deseas inicializar la base de datos Cloudflare D1 con las tablas limpias (usuarios, catálogo, despensa, etc.)?')) {
      return;
    }
    setDbStatus('running');
    setDbMessage(null);
    try {
      const res = await fetch('/api/init-db?key=admin');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al conectar con Cloudflare D1');
      setDbStatus('success');
      setDbMessage(data.message || 'Tablas creadas e inicializadas en D1 con éxito');
    } catch (err: any) {
      setDbStatus('error');
      setDbMessage(err.message || 'Error de conexión');
    }
  };

  const pendingList = proposals.filter(p => p.status === 'pending');
  const displayedList = filter === 'pending' ? pendingList : proposals;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Cabecera del panel */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                Panel de Administración
                <span className="text-[10px] bg-amber-500 text-slate-950 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Admin
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Revisión de nuevos alimentos propuestos por usuarios antes de añadirlos al catálogo global.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-700/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de estado y filtros */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">
              Pendientes de moderar: <strong className="text-amber-600 font-bold">{pendingList.length}</strong>
            </span>
          </div>

          <div className="flex gap-1 bg-white p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                filter === 'pending' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Solo pendientes ({pendingList.length})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                filter === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Todos ({proposals.length})
            </button>
          </div>
        </div>

        {/* Listado de alimentos para moderar */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {displayedList.length === 0 ? (
            <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500/60" />
              <p className="font-semibold text-slate-600 text-sm">¡Al día! No hay alimentos pendientes de revisión.</p>
              <p className="text-xs mt-1">Cuando un usuario cree un producto en su nevera, aparecerá aquí como sugerencia privada.</p>
            </div>
          ) : (
            displayedList.map(item => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition space-y-3 ${
                  item.duplicateSuspect
                    ? 'bg-amber-50/40 border-amber-300'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-bold text-slate-800">{item.name}</span>
                      <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md flex items-center gap-1 capitalize">
                        <Store className="w-3 h-3 text-emerald-600" />
                        {item.supermarket}
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {item.category}
                      </span>
                      {item.price !== undefined && (
                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {item.price.toFixed(2)}€ / {item.unit}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Creado en privado por: <strong className="text-slate-600">{item.userEmail || item.userId}</strong> el {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Estado de la propuesta */}
                  <div>
                    {item.status === 'approved' && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                        ✓ En catálogo global
                      </span>
                    )}
                    {item.status === 'rejected' && (
                      <span className="text-[11px] font-bold text-red-600 bg-red-100 px-2.5 py-1 rounded-full">
                        ✕ Rechazado (Solo uso privado)
                      </span>
                    )}
                  </div>
                </div>

                {/* ALERTA DE POSIBLE DUPLICADO (Detección inteligente) */}
                {item.duplicateSuspect && item.status === 'pending' && (
                  <div className="bg-amber-100/70 border border-amber-300 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-950">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-amber-900 font-bold">
                          ⚠️ Sospecha de duplicado detectada ({item.duplicateSuspect.similarity}% coincidencia):
                        </strong>
                      </div>
                      <p className="text-[11px] text-amber-800">
                        {item.duplicateSuspect.reason} Coincide con el producto existente:
                        <span className="font-semibold underline ml-1">"{item.duplicateSuspect.existingName}"</span>
                      </p>
                      <button
                        onClick={() => onMergeWithExisting(item.id, item.duplicateSuspect!.existingId)}
                        className="mt-1 text-[11px] font-bold text-amber-950 bg-amber-200 hover:bg-amber-300 px-2.5 py-1 rounded-lg transition inline-flex items-center gap-1 shadow-2xs"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Actualizar precio/nombre del producto existente</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Acciones para moderador */}
                {item.status === 'pending' && (
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                    <button
                      onClick={() => onReject(item.id)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 text-xs font-semibold transition active:scale-95 flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Mantener solo privado</span>
                    </button>

                    <button
                      onClick={() => onApprove(item.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition active:scale-95 shadow-xs flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Aprobar para todos</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pie del modal con Acciones de Sistema y D1 */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-800">Estructura Base de Datos D1</p>
                <p className="text-[11px] text-slate-500">Crea o actualiza las tablas (usuarios, recetas, despensa, etc.) directamente en Cloudflare Edge.</p>
              </div>
            </div>
            <button
              onClick={handleInitDatabase}
              disabled={dbStatus === 'running'}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs shrink-0 disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${dbStatus === 'running' ? 'animate-spin' : ''}`} />
              <span>{dbStatus === 'running' ? 'Aplicando SQL...' : 'Inicializar Tablas D1'}</span>
            </button>
          </div>

          {dbMessage && (
            <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 font-medium ${dbStatus === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {dbStatus === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />}
              <span>{dbMessage}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>Los alimentos aprobados pasan a estar disponibles en la búsqueda de tickets de todos los usuarios.</span>
            <button
              onClick={onClose}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-xl font-semibold transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
