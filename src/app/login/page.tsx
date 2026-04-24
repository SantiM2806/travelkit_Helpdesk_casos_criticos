'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createSupabaseBrowser } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSent,  setResetSent]  = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createSupabaseBrowser();
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError('Correo o contraseña incorrectos. Verifica tus datos e intenta de nuevo.');
      setLoading(false);
      return;
    }

    const role = data.user?.user_metadata?.role;
    router.push(role === 'executive' ? '/executive' : '/');
    router.refresh();
  }

  async function handleForgotPassword(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createSupabaseBrowser();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    setLoading(false);
    if (resetError) {
      setError('No se pudo enviar el correo. Verifica el email e intenta de nuevo.');
      return;
    }
    setResetSent(true);
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] font-sans flex flex-col items-center justify-center px-4">

      {/* Card */}
      <div className="w-full max-w-[400px] bg-white border border-[#ebebeb] rounded-2xl shadow-sm overflow-hidden">

        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-[#f0f0f0] flex flex-col items-center gap-4">
          <Image
            src="/travelkit-logo_nbtjgf-67feae5fe38949.68302424.png"
            alt="Travelkit"
            width={120}
            height={36}
            className="h-8 w-auto object-contain"
            priority
          />
          <div className="text-center">
            <h1 className="text-[18px] font-semibold text-[#1a1a1a] leading-tight">
              Portal de Soporte IT
            </h1>
            <p className="text-[13px] text-[#888] mt-0.5">
              Ingresa con tus credenciales corporativas
            </p>
          </div>
        </div>

        {/* Form */}
        {forgotMode ? (
          <div className="px-8 py-7 flex flex-col gap-5">
            {resetSent ? (
              <div className="text-center flex flex-col gap-3">
                <p className="text-[14px] text-[#1a1a1a] font-medium">Correo enviado</p>
                <p className="text-[13px] text-[#666]">Revisa tu bandeja de entrada y haz clic en el enlace para crear una nueva contraseña.</p>
                <button onClick={() => { setForgotMode(false); setResetSent(false); }} className="mt-2 text-[13px] text-[#D32F2F] underline">
                  Volver al login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-[#444] tracking-wide">Correo corporativo</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="nombre@travelkit.co"
                    className="w-full px-4 py-3 bg-[#fafafa] border border-[#ddd] rounded-xl text-[14px] text-[#1a1a1a] placeholder:text-[#bbb] outline-none transition-all duration-150 focus:border-[#D32F2F] focus:bg-white focus:shadow-[0_0_0_3px_rgba(211,47,47,0.08)]"
                  />
                </div>
                {error && (
                  <div className="flex items-start gap-3 bg-[#fff5f5] border border-[#fcc] rounded-xl px-4 py-3">
                    <p className="text-[13px] text-[#c00]">{error}</p>
                  </div>
                )}
                <button type="submit" disabled={loading} className="w-full py-3.5 bg-[#D32F2F] hover:bg-[#b71c1c] text-white font-semibold text-[15px] rounded-xl transition-all disabled:opacity-50 cursor-pointer">
                  {loading ? 'Enviando…' : 'Enviar correo de recuperación'}
                </button>
                <button type="button" onClick={() => setForgotMode(false)} className="text-[13px] text-[#888] underline text-center">
                  Volver al login
                </button>
              </form>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-8 py-7 flex flex-col gap-5">

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#444] tracking-wide">
                Correo corporativo
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="nombre@travelkit.co"
                className="w-full px-4 py-3 bg-[#fafafa] border border-[#ddd] rounded-xl text-[14px] text-[#1a1a1a] placeholder:text-[#bbb] outline-none transition-all duration-150 focus:border-[#D32F2F] focus:bg-white focus:shadow-[0_0_0_3px_rgba(211,47,47,0.08)]"
              />
            </div>

            {/* Contraseña */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-medium text-[#444] tracking-wide">
                  Contraseña
                </label>
                <button type="button" onClick={() => setForgotMode(true)} className="text-[12px] text-[#D32F2F] hover:underline">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#fafafa] border border-[#ddd] rounded-xl text-[14px] text-[#1a1a1a] placeholder:text-[#bbb] outline-none transition-all duration-150 focus:border-[#D32F2F] focus:bg-white focus:shadow-[0_0_0_3px_rgba(211,47,47,0.08)]"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 bg-[#fff5f5] border border-[#fcc] rounded-xl px-4 py-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="#D32F2F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mt-0.5 flex-shrink-0">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p className="text-[13px] text-[#c00] leading-relaxed">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full flex items-center justify-center gap-2.5 py-3.5 bg-[#D32F2F] hover:bg-[#b71c1c] active:bg-[#9a1616] text-white font-semibold text-[15px] rounded-xl transition-all duration-150 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  Verificando credenciales…
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Ingresar al sistema
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="px-8 pb-6 text-center">
          <p className="text-[12px] text-[#aaa]">
            Acceso restringido · Solo personal IT autorizado
          </p>
        </div>
      </div>

      <p className="mt-6 text-[12px] text-[#bbb]">
        Travelkit Colombia · Sistema interno · {new Date().getFullYear()}
      </p>
    </div>
  );
}
