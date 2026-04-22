'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

const CATEGORIAS = ['Software', 'Hardware', 'Conectividad', 'Accesos', 'Teams', 'Correo', 'Otro'];
const PRIORIDADES = ['Alta', 'Media', 'Baja'];

interface Props {
  open: boolean;
  userEmail: string;
  onClose: () => void;
  onCreated: () => void;
}

async function generarTicketId(): Promise<string> {
  const { data } = await supabase
    .from('tickets')
    .select('ticket_id')
    .order('ticket_id', { ascending: false })
    .limit(1);

  const last = data?.[0]?.ticket_id ?? 'TK-0000';
  const num = parseInt(last.replace('TK-', ''), 10);
  return `TK-${String(num + 1).padStart(4, '0')}`;
}

export default function NuevaSolicitudModal({ open, userEmail, onClose, onCreated }: Props) {
  const [mounted,     setMounted]     = useState(false);
  const [visible,     setVisible]     = useState(false);
  const [categoria,   setCategoria]   = useState('Software');
  const [prioridad,   setPrioridad]   = useState('Media');
  const [descripcion, setDescripcion] = useState('');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setCategoria('Software');
      setPrioridad('Media');
      setDescripcion('');
      setError('');
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setVisible(true);
        setTimeout(() => textareaRef.current?.focus(), 80);
      }));
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 260);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!descripcion.trim()) {
      setError('La descripción es obligatoria.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const ticket_id = await generarTicketId();
      const { error: dbError } = await supabase.from('tickets').insert({
        ticket_id,
        timestamp:   new Date().toISOString(),
        email:       userEmail,
        categoria,
        prioridad,
        descripcion: descripcion.trim(),
        estado:      'Abierto',
        responsable: null,
      });

      if (dbError) throw dbError;

      onCreated();
      onClose();
    } catch {
      setError('No se pudo registrar la solicitud. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      onClick={onClose}
      style={{ transition: 'opacity 0.22s ease', opacity: visible ? 1 : 0 }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

      {/* Modal */}
      <div
        className="relative w-full max-w-[480px] mx-4 bg-tk-bg2 border border-tk-border rounded-lg shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
        style={{
          transition: 'transform 0.26s cubic-bezier(0.22,1,0.36,1), opacity 0.22s ease',
          transform:  visible ? 'translateY(0) scale(1)' : 'translateY(14px) scale(0.985)',
          opacity:    visible ? 1 : 0,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-tk-border">
          <div>
            <div className="font-mono text-[11px] tracking-[0.1em] uppercase text-tk-accent mb-0.5">
              Nueva Solicitud
            </div>
            <div className="text-[13px] text-tk-text font-medium">
              Registrar ticket de soporte IT
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded text-tk-text3 hover:text-tk-text hover:bg-tk-bg3 transition-colors cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">

          {/* Email (solo lectura) */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] tracking-[0.08em] uppercase text-tk-text3">
              Solicitante
            </label>
            <div className="px-3 py-2 bg-tk-bg3 border border-tk-border rounded text-[13px] text-tk-text2 font-mono">
              {userEmail}
            </div>
          </div>

          {/* Categoría + Prioridad en fila */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] tracking-[0.08em] uppercase text-tk-text3">
                Categoría
              </label>
              <div className="relative">
                <select
                  value={categoria}
                  onChange={e => setCategoria(e.target.value)}
                  className="modal-select-el w-full bg-tk-bg3 border border-tk-border2 rounded px-3 py-2 text-[13px] text-tk-text font-sans focus:outline-none focus:border-tk-accent2 transition-colors duration-[0.12s] cursor-pointer appearance-none pr-7"
                >
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-tk-text3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] tracking-[0.08em] uppercase text-tk-text3">
                Prioridad
              </label>
              <div className="relative">
                <select
                  value={prioridad}
                  onChange={e => setPrioridad(e.target.value)}
                  className="modal-select-el w-full bg-tk-bg3 border border-tk-border2 rounded px-3 py-2 text-[13px] text-tk-text font-sans focus:outline-none focus:border-tk-accent2 transition-colors duration-[0.12s] cursor-pointer appearance-none pr-7"
                >
                  {PRIORIDADES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-tk-text3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] tracking-[0.08em] uppercase text-tk-text3">
              Descripción del problema <span className="text-tk-red">*</span>
            </label>
            <textarea
              ref={textareaRef}
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              rows={4}
              placeholder="Describe detalladamente el problema o solicitud…"
              className="modal-textarea search-input w-full bg-tk-bg3 border border-tk-border2 rounded px-3 py-2 text-[13px] text-tk-text font-sans placeholder:text-tk-text3 focus:outline-none focus:border-tk-accent2 transition-colors duration-[0.12s]"
            />
            <div className="text-right font-mono text-[10px] text-tk-text3">
              {descripcion.length} caracteres
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-[rgba(239,83,80,0.06)] border border-[rgba(239,83,80,0.25)] rounded px-3 py-2">
              <p className="font-mono text-[11px] text-tk-red tracking-[0.04em]">{error}</p>
            </div>
          )}

          {/* Acciones */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-transparent border border-tk-border2 rounded text-tk-text2 font-mono text-[11px] tracking-[0.06em] uppercase cursor-pointer transition-[border-color,color,background] duration-[0.15s] hover:border-tk-text2 hover:bg-tk-bg3"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !descripcion.trim()}
              className="flex-[2] flex items-center justify-center gap-2 px-4 py-2 bg-tk-accent text-[#0d0f11] font-mono text-[11px] font-semibold tracking-[0.08em] uppercase rounded cursor-pointer transition-[opacity] duration-[0.15s] hover:opacity-90 active:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="inline-block w-3 h-3 border-2 border-[#0d0f11] border-t-transparent rounded-full animate-spin-sync" />
                  REGISTRANDO…
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  REGISTRAR SOLICITUD
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
