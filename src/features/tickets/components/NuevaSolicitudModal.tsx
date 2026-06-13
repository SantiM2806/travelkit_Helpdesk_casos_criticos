'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import { createCasosCriticosClient } from '@/lib/supabase/casos-criticos';
import { ALLOWED_TIPOS_SOLICITUD, ALLOWED_PRIORIDADES, sanitize } from '@/features/tickets/utils/validations';

const supabase = createCasosCriticosClient();

interface Props {
  open:      boolean;
  userEmail: string;
  onClose:   () => void;
  onCreated: () => void;
}

const SELECT_CLS = 'modal-select-el w-full bg-tk-bg3 border border-tk-border2 rounded px-3 py-2 text-[13px] text-tk-text font-sans focus:outline-none focus:border-tk-accent2 transition-colors duration-[0.12s] cursor-pointer appearance-none pr-7';
const INPUT_CLS  = 'w-full bg-tk-bg3 border border-tk-border2 rounded px-3 py-2 text-[13px] text-tk-text font-mono placeholder:text-tk-text3 focus:outline-none focus:border-tk-accent2 transition-colors duration-[0.12s]';
const LABEL_CLS  = 'font-mono text-[10px] tracking-[0.08em] uppercase text-tk-text3';

const CHEVRON = (
  <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-tk-text3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

async function generarCasoId(): Promise<string> {
  const { data } = await supabase
    .from('tickets')
    .select('ticket_id')
    .ilike('ticket_id', 'TKCC-%')
    .order('ticket_id', { ascending: false })
    .limit(1);

  const last = data?.[0]?.ticket_id ?? 'TKCC-0000';
  const num  = parseInt(last.replace('TKCC-', ''), 10) || 0;
  return `TKCC-${String(num + 1).padStart(4, '0')}`;
}

export default function NuevaSolicitudModal({ open, onClose, onCreated }: Props) {
  const [mounted,       setMounted]       = useState(false);
  const [visible,       setVisible]       = useState(false);
  const [cliente,       setCliente]       = useState('');
  const [agencia,       setAgencia]       = useState('');
  const [tipoSolicitud, setTipoSolicitud] = useState<string>(ALLOWED_TIPOS_SOLICITUD[0]);
  const [prioridad,     setPrioridad]     = useState('Media');
  const [descripcion,   setDescripcion]   = useState('');
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState('');
  const clienteRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setCliente('');
      setAgencia('');
      setTipoSolicitud(ALLOWED_TIPOS_SOLICITUD[0]);
      setPrioridad('Media');
      setDescripcion('');
      setError('');
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setVisible(true);
        setTimeout(() => clienteRef.current?.focus(), 80);
      }));
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 260);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!cliente.trim()) { setError('El nombre del cliente es obligatorio.'); return; }
    if (!agencia.trim()) { setError('El nombre de la agencia es obligatorio.'); return; }

    setLoading(true);
    setError('');
    try {
      const ticket_id = await generarCasoId();

      const { error: dbError } = await supabase.from('tickets').insert({
        ticket_id,
        timestamp:      new Date().toISOString(),
        cliente:        sanitize(cliente),
        agencia:        sanitize(agencia),
        tipo_solicitud: tipoSolicitud,
        prioridad,
        descripcion:    sanitize(descripcion),
        estado:         'Abierto',
        responsable:    null,
      });

      if (dbError) throw dbError;
      onCreated();
      onClose();
    } catch {
      setError('No se pudo registrar el caso. Intenta de nuevo.');
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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

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
            <div className="font-mono text-[11px] tracking-[0.1em] uppercase mb-0.5" style={{ color: '#D32F2F' }}>
              Nuevo Caso
            </div>
            <div className="text-[13px] text-tk-text font-medium">
              Registrar caso crítico
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

          {/* Cliente */}
          <div className="flex flex-col gap-1.5">
            <label className={LABEL_CLS}>Cliente <span className="text-tk-red">*</span></label>
            <input
              ref={clienteRef}
              type="text"
              value={cliente}
              onChange={e => setCliente(e.target.value)}
              placeholder="Nombre del cliente"
              className={INPUT_CLS}
            />
          </div>

          {/* Agencia */}
          <div className="flex flex-col gap-1.5">
            <label className={LABEL_CLS}>Agencia <span className="text-tk-red">*</span></label>
            <input
              type="text"
              value={agencia}
              onChange={e => setAgencia(e.target.value)}
              placeholder="Nombre de la agencia"
              className={INPUT_CLS}
            />
          </div>

          {/* Tipo solicitud + Prioridad */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className={LABEL_CLS}>Tipo de solicitud</label>
              <div className="relative">
                <select value={tipoSolicitud} onChange={e => setTipoSolicitud(e.target.value)} className={SELECT_CLS}>
                  {ALLOWED_TIPOS_SOLICITUD.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {CHEVRON}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={LABEL_CLS}>Prioridad</label>
              <div className="relative">
                <select value={prioridad} onChange={e => setPrioridad(e.target.value)} className={SELECT_CLS}>
                  {ALLOWED_PRIORIDADES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                {CHEVRON}
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="flex flex-col gap-1.5">
            <label className={LABEL_CLS}>Descripción <span className="text-tk-text3 normal-case font-sans tracking-normal">(opcional)</span></label>
            <textarea
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              rows={3}
              placeholder="Detalle del caso crítico…"
              maxLength={2000}
              className="w-full bg-tk-bg3 border border-tk-border2 rounded px-3 py-2 text-[13px] text-tk-text font-sans placeholder:text-tk-text3 focus:outline-none focus:border-tk-accent2 transition-colors duration-[0.12s]"
            />
            <div className="text-right font-mono text-[10px] text-tk-text3">{descripcion.length} / 2000</div>
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
              disabled={loading || !cliente.trim() || !agencia.trim()}
              className="flex-[2] flex items-center justify-center gap-2 px-4 py-2 text-white font-mono text-[11px] font-semibold tracking-[0.08em] uppercase rounded cursor-pointer transition-[opacity] duration-[0.15s] hover:opacity-90 active:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: '#CC0000' }}
            >
              {loading ? (
                <>
                  <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin-sync" />
                  REGISTRANDO…
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  REGISTRAR CASO
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
