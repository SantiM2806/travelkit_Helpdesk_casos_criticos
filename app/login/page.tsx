'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createSupabaseBrowser } from '@/lib/supabase-browser';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createSupabaseBrowser();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError('Correo o contraseña incorrectos.');
      setLoading(false);
      return;
    }

    router.push('/');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-tk-bg flex flex-col items-center justify-center px-4 animate-fade-in">
      {/* Card */}
      <div className="w-full max-w-[380px] bg-tk-bg2 border border-tk-border rounded-lg overflow-hidden animate-fade-up">

        {/* Header de la card */}
        <div className="px-6 sm:px-8 pt-7 sm:pt-8 pb-5 sm:pb-6 border-b border-tk-border flex flex-col items-center gap-3">
          <Image
            src="/travelkit-logo_nbtjgf-67feae5fe38949.68302424.png"
            alt="Travelkit"
            width={110}
            height={34}
            className="h-8 w-auto object-contain"
            priority
          />
          <div className="font-mono text-[11px] font-semibold tracking-[0.1em] text-tk-text3 uppercase">
            <span className="text-tk-accent">IT</span> / HELPDESK · ACCESO
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-6 sm:py-7 flex flex-col gap-5">

          {/* Campo email */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] tracking-[0.08em] uppercase text-tk-text3">
              Correo corporativo
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="nombre@travelkit.co"
              className="search-input w-full bg-tk-bg3 border border-tk-border2 rounded px-3 py-2 text-[13px] text-tk-text font-sans placeholder:text-tk-text3 focus:outline-none focus:border-tk-accent2 transition-colors duration-[0.12s]"
            />
          </div>

          {/* Campo contraseña */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] tracking-[0.08em] uppercase text-tk-text3">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="search-input w-full bg-tk-bg3 border border-tk-border2 rounded px-3 py-2 text-[13px] text-tk-text font-sans placeholder:text-tk-text3 focus:outline-none focus:border-tk-accent2 transition-colors duration-[0.12s]"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-[rgba(239,83,80,0.06)] border border-[rgba(239,83,80,0.25)] rounded px-3 py-2">
              <p className="font-mono text-[11px] text-tk-red tracking-[0.04em]">{error}</p>
            </div>
          )}

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-tk-accent text-[#0d0f11] font-mono text-[11px] font-semibold tracking-[0.08em] uppercase rounded transition-[opacity,background] duration-[0.15s] hover:opacity-90 active:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <span className="inline-block w-3 h-3 border-2 border-[#0d0f11] border-t-transparent rounded-full animate-spin-sync" />
                VERIFICANDO
              </>
            ) : (
              'INGRESAR AL SISTEMA'
            )}
          </button>
        </form>

        {/* Footer de la card */}
        <div className="px-6 sm:px-8 pb-5 sm:pb-6 text-center">
          <p className="font-mono text-[10px] text-tk-text3 tracking-[0.04em]">
            Acceso restringido · Solo personal IT autorizado
          </p>
        </div>
      </div>

      {/* Marca de agua inferior */}
      <p className="mt-6 font-mono text-[10px] tracking-[0.08em] uppercase text-tk-text3">
        Travelkit Colombia · Sistema interno
      </p>
    </div>
  );
}
