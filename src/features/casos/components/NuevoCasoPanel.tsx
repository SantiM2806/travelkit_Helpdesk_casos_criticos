'use client';

import { useState, useEffect } from 'react';
import { X, Save, Paperclip, FileText, Trash2, Loader2 } from 'lucide-react';
import type { CasoCritico, DocumentoCaso } from '@/features/casos/types';
import { AREAS, ESTATUS, PROVEEDORES } from '@/features/casos/types';
import { subirDocumento, validarDocumento, supabaseHabilitado } from '@/features/casos/actions/casos';

interface Props {
  open:     boolean;
  onClose:  () => void;
  onCreate: (caso: Omit<CasoCritico, 'id' | 'seguimiento' | 'tareas'>) => void;
}

const PAISES = ['CO', 'EC', 'MX', 'DO', 'US', 'ES', 'PE', 'AR', 'CL', 'BR', 'PA'];

const fieldCls =
  'h-10 w-full rounded-md border border-tk-card-bd bg-white px-3 text-sm text-tk-ink ' +
  'placeholder:text-tk-ink3 focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-100';

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-tk-ink3">{children}</label>;
}

const HOY = () => new Date().toISOString().slice(0, 10);

const VACIO = {
  numero_caso: '', proveedor: 'WTA' as CasoCritico['proveedor'], voucher: '', nombre_paciente: '', pasaporte: '',
  fecha_nacimiento: '',
  area: 'System' as CasoCritico['area'], estatus: 'Abierto' as CasoCritico['estatus'],
  fecha_evento: '', fecha_apertura: HOY(), origen_viaje: 'CO', pais_servicio: 'CO', descripcion: '',
};

export default function NuevoCasoPanel({ open, onClose, onCreate }: Props) {
  const [form, setForm]   = useState(VACIO);
  const [files, setFiles] = useState<File[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const [errFile, setErrFile]   = useState('');

  useEffect(() => {
    if (open) { setForm({ ...VACIO, fecha_apertura: HOY() }); setFiles([]); setErrFile(''); setSubiendo(false); }
    function onEsc(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    if (open) window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [open, onClose]);

  if (!open) return null;

  const set = (k: keyof typeof VACIO, v: string) => setForm(p => ({ ...p, [k]: v }));

  function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    setErrFile('');
    const picked = Array.from(e.target.files ?? []);
    for (const f of picked) {
      const err = validarDocumento(f);
      if (err) { setErrFile(err); return; }
    }
    setFiles(prev => [...prev, ...picked]);
    e.target.value = '';
  }

  const valido = form.numero_caso.trim() && form.nombre_paciente.trim() && form.voucher.trim();

  async function guardar() {
    if (!valido || subiendo) return;
    setSubiendo(true);
    let documentos: DocumentoCaso[] = [];
    try {
      if (files.length && supabaseHabilitado) {
        documentos = await Promise.all(files.map(f => subirDocumento(form.numero_caso, f)));
      } else if (files.length) {
        documentos = files.map(f => ({ nombre: f.name, url: '' }));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      console.error('[CASOS] Error subiendo documentos:', err);
      setErrFile(`No se pudieron subir los documentos → ${msg}`);
      setSubiendo(false);
      return;
    }
    onCreate({
      ...form,
      fecha_evento: form.fecha_evento || new Date().toISOString(),
      documentos,
    });
    setSubiendo(false);
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <aside
        role="dialog"
        aria-label="Registrar caso crítico"
        className="fixed right-0 top-0 z-40 flex h-screen w-full max-w-[520px] flex-col bg-white shadow-2xl"
        style={{ animation: 'slideInRight 0.3s cubic-bezier(0.22,1,0.36,1)' }}
      >
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-tk-card-bd bg-white/95 px-6 py-5 backdrop-blur-sm">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-tk-ink3">Nuevo registro</p>
            <h2 className="text-xl font-bold tracking-tight text-tk-ink">Registrar caso crítico</h2>
          </div>
          <button onClick={onClose} aria-label="Cerrar"
            className="flex h-9 w-9 items-center justify-center rounded-md text-tk-ink2 transition-colors hover:bg-gray-50 hover:text-tk-ink">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>N.º de Caso *</Label><input className={fieldCls} value={form.numero_caso} onChange={e => set('numero_caso', e.target.value)} placeholder="1655479-01" /></div>
            <div><Label>Voucher *</Label><input className={fieldCls} value={form.voucher} onChange={e => set('voucher', e.target.value)} placeholder="TK-XXXXXX" /></div>

            <div><Label>Proveedor</Label>
              <select className={fieldCls} value={form.proveedor} onChange={e => set('proveedor', e.target.value)}>
                {PROVEEDORES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div><Label>Área</Label>
              <select className={fieldCls} value={form.area} onChange={e => set('area', e.target.value)}>
                {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <div className="col-span-2"><Label>Nombre del Paciente *</Label><input className={fieldCls} value={form.nombre_paciente} onChange={e => set('nombre_paciente', e.target.value)} /></div>
            <div><Label>Documento de identidad</Label><input className={fieldCls} value={form.pasaporte} onChange={e => set('pasaporte', e.target.value)} /></div>
            <div><Label>Fecha de nacimiento</Label><input type="date" className={`${fieldCls} tabular-nums`} value={form.fecha_nacimiento} onChange={e => set('fecha_nacimiento', e.target.value)} /></div>

            <div><Label>Estatus</Label>
              <select className={fieldCls} value={form.estatus} onChange={e => set('estatus', e.target.value)}>
                {ESTATUS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div><Label>Fecha evento</Label><input type="datetime-local" className={`${fieldCls} tabular-nums`} value={form.fecha_evento} onChange={e => set('fecha_evento', e.target.value)} /></div>

            <div><Label>Origen del viaje</Label>
              <select className={fieldCls} value={form.origen_viaje} onChange={e => set('origen_viaje', e.target.value)}>
                {PAISES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div><Label>País del servicio</Label>
              <select className={fieldCls} value={form.pais_servicio} onChange={e => set('pais_servicio', e.target.value)}>
                {PAISES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div className="col-span-2"><Label>Descripción</Label>
              <textarea rows={3} className="w-full resize-none rounded-md border border-tk-card-bd bg-white px-3 py-2 text-sm text-tk-ink placeholder:text-tk-ink3 focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-100" value={form.descripcion} onChange={e => set('descripcion', e.target.value)} />
            </div>

            {/* Documentos */}
            <div className="col-span-2">
              <Label>Documentos del caso</Label>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-tk-card-bd bg-tk-surface px-3 py-3 text-sm text-tk-ink2 transition-colors hover:border-brand-300 hover:bg-brand-50/40">
                <Paperclip className="h-4 w-4" /> Adjuntar archivos (PDF, imágenes…)
                <input type="file" multiple className="hidden" onChange={onPickFiles} />
              </label>
              {errFile && <p className="mt-1.5 text-xs text-red-600">{errFile}</p>}
              {files.length > 0 && (
                <ul className="mt-2 space-y-1.5">
                  {files.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 rounded-md border border-tk-card-bd bg-white px-2.5 py-1.5 text-xs">
                      <FileText className="h-3.5 w-3.5 text-tk-ink3" />
                      <span className="flex-1 truncate text-tk-ink">{f.name}</span>
                      <span className="tabular-nums text-tk-ink3">{(f.size / 1024).toFixed(0)} KB</span>
                      <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} aria-label="Quitar"
                        className="text-tk-ink3 transition-colors hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <footer className="flex justify-end gap-3 border-t border-tk-card-bd bg-tk-surface px-6 py-4">
          <button onClick={onClose} className="h-10 rounded-md border border-tk-card-bd bg-white px-5 text-sm font-medium text-tk-ink2 transition-colors hover:bg-gray-50">Cancelar</button>
          <button onClick={guardar} disabled={!valido || subiendo}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-brand-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50">
            {subiendo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {subiendo ? 'Guardando…' : 'Registrar caso'}
          </button>
        </footer>
      </aside>
    </>
  );
}
