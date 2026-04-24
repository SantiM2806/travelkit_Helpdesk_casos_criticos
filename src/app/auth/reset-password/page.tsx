'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setLoading(true);
    const supabase = createSupabaseBrowser();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError('No se pudo actualizar la contraseña. Solicita un nuevo enlace de recuperación.');
      setLoading(false);
      return;
    }

    router.push('/login');
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center px-4">
      <div className="w-full max-w-[400px] bg-white border border-[#ebebeb] rounded-2xl shadow-sm overflow-hidden">
        <div className="px-8 pt-8 pb-6 border-b border-[#f0f0f0] text-center">
          <h1 className="text-[18px] font-semibold text-[#1a1a1a]">Nueva contraseña</h1>
          <p className="text-[13px] text-[#888] mt-1">Elige una contraseña segura para tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-7 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#444]">Nueva contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Mínimo 8 caracteres"
              className="w-full px-4 py-3 bg-[#fafafa] border border-[#ddd] rounded-xl text-[14px] outline-none focus:border-[#D32F2F] focus:bg-white"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#444]">Confirmar contraseña</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              placeholder="Repite la contraseña"
              className="w-full px-4 py-3 bg-[#fafafa] border border-[#ddd] rounded-xl text-[14px] outline-none focus:border-[#D32F2F] focus:bg-white"
            />
          </div>

          {error && (
            <div className="bg-[#fff5f5] border border-[#fcc] rounded-xl px-4 py-3">
              <p className="text-[13px] text-[#c00]">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full py-3.5 bg-[#D32F2F] hover:bg-[#b71c1c] text-white font-semibold text-[15px] rounded-xl transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Guardando…' : 'Guardar contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}
