import React, { useState } from 'react';
import {
  Users,
  Copy,
  Check,
  UserPlus,
  DoorOpen,
  ShieldCheck,
  Lock,
  Sparkles,
  X,
  Home,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import type { HouseholdInfo, UserAccount } from '../types';

interface ShareFridgeModalProps {
  currentUser: UserAccount | null;
  household: HouseholdInfo;
  onUpdateHousehold: (updated: HouseholdInfo) => void;
  onJoinHousehold: (code: string) => Promise<{ success: boolean; message: string }>;
  onLeaveHousehold: () => void;
  onClose: () => void;
  onOpenAuth: () => void;
}

export const ShareFridgeModal: React.FC<ShareFridgeModalProps> = ({
  currentUser,
  household,
  onUpdateHousehold,
  onJoinHousehold,
  onLeaveHousehold,
  onClose,
  onOpenAuth
}) => {
  const [activeTab, setActiveTab] = useState<'invite' | 'join'>('invite');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [householdNameInput, setHouseholdNameInput] = useState(household.name);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(household.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    setIsJoining(true);
    setFeedback(null);
    try {
      const res = await onJoinHousehold(joinCodeInput.trim().toUpperCase());
      if (res.success) {
        setFeedback({ type: 'success', text: res.message });
        setJoinCodeInput('');
      } else {
        setFeedback({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'No se pudo unir al frigo compartido' });
    } finally {
      setIsJoining(false);
    }
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!householdNameInput.trim()) return;
    onUpdateHousehold({
      ...household,
      name: householdNameInput.trim()
    });
    setEditingName(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Cabecera */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-1.5">
                <span>Frigo Compartido</span>
                <span className="text-[10px] bg-white/25 text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Piso / Pareja
                </span>
              </h2>
              <p className="text-xs text-emerald-100">
                Comparte lo que hay en la nevera o mantén alimentos en tu Bóveda Privada
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner de inicio de sesión si es invitado */}
        {!currentUser && (
          <div className="bg-amber-50 border-b border-amber-200 p-3 sm:px-5 flex items-center justify-between text-xs text-amber-900">
            <span>Para sincronizar el frigo en tiempo real con otra persona es recomendable iniciar sesión.</span>
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="font-bold underline text-amber-950 ml-2 shrink-0"
            >
              Iniciar sesión
            </button>
          </div>
        )}

        {/* Selector de pestañas */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab('invite');
              setFeedback(null);
            }}
            className={`flex-1 py-3 text-center border-b-2 transition flex items-center justify-center gap-1.5 ${
              activeTab === 'invite'
                ? 'border-emerald-600 text-emerald-800 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Mi Frigo Compartido</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('join');
              setFeedback(null);
            }}
            className={`flex-1 py-3 text-center border-b-2 transition flex items-center justify-center gap-1.5 ${
              activeTab === 'join'
                ? 'border-emerald-600 text-emerald-800 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Unirme a otro Frigo</span>
          </button>
        </div>

        {/* Contenido principal */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {feedback && (
            <div
              className={`p-3 rounded-2xl text-xs flex items-center gap-2 font-medium ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {activeTab === 'invite' ? (
            <div className="space-y-4">
              {/* Nombre del Frigo */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Nombre del Frigo
                  </span>
                  {editingName ? (
                    <form onSubmit={handleSaveName} className="flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        value={householdNameInput}
                        onChange={(e) => setHouseholdNameInput(e.target.value)}
                        className="text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-lg px-2 py-1 outline-hidden focus:ring-2 focus:ring-emerald-500"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="text-xs font-bold bg-emerald-600 text-white px-2 py-1 rounded-lg"
                      >
                        Guardar
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingName(false)}
                        className="text-xs text-slate-500"
                      >
                        Cancelar
                      </button>
                    </form>
                  ) : (
                    <span className="text-sm font-bold text-slate-800">{household.name}</span>
                  )}
                </div>
                {!editingName && (
                  <button
                    onClick={() => setEditingName(true)}
                    className="text-xs font-semibold text-emerald-700 hover:underline"
                  >
                    Cambiar
                  </button>
                )}
              </div>

              {/* Código de Invitación para compartir */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-center space-y-2">
                <span className="text-xs text-emerald-800 font-semibold block">
                  Código de invitación para tus compañeros de piso / pareja:
                </span>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono text-xl sm:text-2xl font-black tracking-widest text-emerald-950 bg-white px-4 py-2 rounded-xl border border-emerald-300 shadow-2xs select-all">
                    {household.inviteCode}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5 active:scale-95"
                    title="Copiar código"
                  >
                    {copied ? <Check className="w-5 h-5 text-white" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-[11px] text-emerald-700">
                  {copied ? '¡Copiado en el portapapeles!' : 'Dile a tu compañero que pulse en "Unirme a otro Frigo" y pegue este código.'}
                </p>
              </div>

              {/* Miembros actuales */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Personas en este Frigo ({household.members.length})</span>
                </h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                  {household.members.map((member) => (
                    <div key={member.id} className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <span>{member.name}</span>
                            {member.id === (currentUser?.id || 'usr_guest') && (
                              <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-md font-semibold">
                                Tú
                              </span>
                            )}
                            {member.isOwner && (
                              <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-md font-bold">
                                Creador
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-400">{member.email}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Explicación de la Bóveda Privada (Vault) */}
              <div className="bg-slate-900 text-slate-200 rounded-2xl p-3.5 sm:p-4 text-xs space-y-2 shadow-xs">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <Lock className="w-4 h-4" />
                  <span>¿Tienes comida que no quieres compartir? (Vault)</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Al añadir o editar cualquier producto, marca la opción <strong>"🔒 Guardar en mi Bóveda Privada"</strong>.
                  Esos alimentos solo los verás tú en tu móvil. Tus compañeros no sabrán que existen ni podrán verlos en el frigo compartido.
                </p>
              </div>

              {/* Botón salir del frigo si hay más de 1 miembro */}
              {household.members.length > 1 && (
                <div className="pt-2 text-center">
                  <button
                    onClick={() => {
                      if (confirm('¿Seguro que deseas desvincularte de este frigorífico compartido y volver a uno individual?')) {
                        onLeaveHousehold();
                      }
                    }}
                    className="text-xs text-red-600 hover:text-red-700 font-semibold inline-flex items-center gap-1 hover:underline"
                  >
                    <DoorOpen className="w-3.5 h-3.5" />
                    <span>Abandonar este frigo compartido</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center py-2 space-y-1">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <UserPlus className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Unirse a un Frigorífico Compartido</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Pídele a tu compañero o pareja el código de invitación de su frigo (ej: <code>FRIGO-8942</code>) e introdúcelo aquí.
                </p>
              </div>

              <form onSubmit={handleJoin} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Código de Invitación
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: FRIGO-1234"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                    className="w-full text-center tracking-widest font-mono text-base font-bold uppercase p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isJoining || !joinCodeInput.trim()}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs py-3 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isJoining ? 'Conectando...' : 'Unirme al Frigo'}</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs px-4 py-2 rounded-xl font-semibold transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

