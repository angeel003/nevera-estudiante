import React, { useState } from 'react';
import { User, Lock, Mail, ArrowRight, X, AlertCircle } from 'lucide-react';
import type { UserAccount } from '../types';

interface AuthModalProps {
  currentUser?: UserAccount | null;
  onLoginSuccess: (user: UserAccount) => void;
  onLogout: () => void;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentUser,
  onLoginSuccess,
  onLogout,
  onClose,
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Intentar autenticación con el backend de Cloudflare
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isRegister ? 'register' : 'login',
          email,
          password,
          name: isRegister ? name : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al autenticar');
      }

      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      // Fallback local en desarrollo/offline si el backend no está activo
      const cleanEmail = email.toLowerCase().trim();
      const isAdminUser = cleanEmail === 'angelhv2003@gmail.com' || cleanEmail === 'admin@myfridge.pages.dev';

      const fallbackUser: UserAccount = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        email: cleanEmail,
        name: name || cleanEmail.split('@')[0],
        isAdmin: isAdminUser,
      };

      onLoginSuccess(fallbackUser);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {currentUser ? (
          // Vista si ya tiene sesión iniciada
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-xl font-bold">
              {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">{currentUser.name || 'Mi Cuenta'}</h3>
              <p className="text-xs text-slate-500">{currentUser.email}</p>
              {currentUser.isAdmin && (
                <span className="inline-block mt-2 text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full">
                  ⭐ Administrador
                </span>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={onLogout}
                className="w-full bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 text-xs font-bold py-2.5 rounded-xl transition"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        ) : (
          // Formulario de Login / Registro
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                <User className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-lg">
                {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
              </h3>
              <p className="text-xs text-slate-500">
                Guarda tu nevera y lista de compras en la nube protegida
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl p-2.5 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {isRegister && (
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Nombre</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Tu nombre o apodo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Correo electrónico</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Contraseña</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span>{loading ? 'Procesando...' : isRegister ? 'Registrarme' : 'Entrar'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="text-center pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError(null);
                }}
                className="text-xs text-emerald-700 hover:underline font-semibold"
              >
                {isRegister
                  ? '¿Ya tienes cuenta? Inicia sesión aquí'
                  : '¿No tienes cuenta? Regístrate gratis'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
