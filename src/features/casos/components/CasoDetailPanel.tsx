'use client';

import { useState, useEffect } from 'react';
import {
  X, Send, Clock, MapPin, IdCard, Cake, Ticket, Building2, Layers, FileText, Download,
  ListChecks, Plus, AlertTriangle, Check, Bell,
} from 'lucide-react';
import type { CasoCritico } from '@/features/casos/types';
import Badge from './Badge';
import Flag from './Flag';
import { paisNombre, estatusVariant, fmtFechaHora } from '@/features/casos/utils/format';

interface NuevaTarea { texto: string; fecha_limite: string; notificar: boolean }

interface Props {
  caso:          CasoCritico | null;
  onClose:       () => void;
  onAddNota:     (casoId: string, texto: string) => void;
  onAddTarea:    (casoId: string, datos: NuevaTarea) => void;
  onToggleTarea: (casoId: string, tareaId: string, completada: boolean) => void;
}

function Dato({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-tk-ink3">{icon}</span>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-tk-ink3">{label}</p>
        <p className="text-sm text-tk-ink">{children}</p>
      </div>
    </div>
  );
}

const TAREA_VACIA: NuevaTarea = { texto: '', fecha_limite: '', notificar: true };

export default function CasoDetailPanel({ caso, onClose, onAddNota, onAddTarea, onToggleTarea }: Props) {
  const [nota, setNota]   = useState('');
  const [tarea, setTarea] = useState<NuevaTarea>(TAREA_VACIA);

  useEffect(() => {
    setNota(''); setTarea(TAREA_VACIA);
    function onEsc(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    if (caso) window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [caso, onClose]);

  if (!caso) return null;

  function enviarNota() {
    const t = nota.trim();
    if (!t || !caso) return;
    onAddNota(caso.id, t);
    setNota('');
  }

  function crearTarea() {
    if (!tarea.texto.trim() || !tarea.fecha_limite || !caso) return;
    onAddTarea(caso.id, { ...tarea, texto: tarea.texto.trim() });
    setTarea(TAREA_VACIA);
  }

  const ahora = Date.now();

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto p-4 sm:p-6">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-label={`Detalle del caso ${caso.numero_caso}`}
        className="animate-fade-up relative my-4 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        {/* Header */}
        <header className="flex items-start justify-between gap-3 border-b border-tk-card-bd px-6 py-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-tk-ink3">Caso crítico</p>
            <h2 className="text-xl font-bold tracking-tight text-tk-ink tabular-nums">{caso.numero_caso}</h2>
            <div className="mt-1.5 flex items-center gap-2">
              <Badge variant={estatusVariant(caso.estatus)}>{caso.estatus}</Badge>
              <Badge variant="brand">{caso.area}</Badge>
              <Badge variant="outline" className="font-semibold">{caso.proveedor}</Badge>
            </div>
          </div>
          <button onClick={onClose} aria-label="Cerrar"
            className="flex h-9 w-9 items-center justify-center rounded-md text-tk-ink2 transition-colors hover:bg-gray-50 hover:text-tk-ink">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Paciente */}
          <h3 className="text-base font-semibold text-tk-ink">{caso.nombre_paciente}</h3>
          {caso.descripcion && <p className="mt-0.5 text-sm text-tk-ink2">{caso.descripcion}</p>}

          <div className="mt-5 grid grid-cols-2 gap-4">
            <Dato icon={<Ticket className="h-4 w-4" />} label="Voucher"><span className="font-mono tabular-nums">{caso.voucher}</span></Dato>
            <Dato icon={<Building2 className="h-4 w-4" />} label="Proveedor">{caso.proveedor}</Dato>
            <Dato icon={<Layers className="h-4 w-4" />} label="Área">{caso.area}</Dato>
            <Dato icon={<IdCard className="h-4 w-4" />} label="Documento de identidad"><span className="tabular-nums">{caso.pasaporte || '—'}</span></Dato>
            <Dato icon={<Cake className="h-4 w-4" />} label="Nacimiento"><span className="tabular-nums">{caso.fecha_nacimiento || '—'}</span></Dato>
            <Dato icon={<MapPin className="h-4 w-4" />} label="Origen del viaje"><span className="inline-flex items-center gap-1.5"><Flag iso={caso.origen_viaje} showCode={false} /> {paisNombre(caso.origen_viaje)}</span></Dato>
            <Dato icon={<MapPin className="h-4 w-4" />} label="País del servicio"><span className="inline-flex items-center gap-1.5"><Flag iso={caso.pais_servicio} showCode={false} /> {paisNombre(caso.pais_servicio)}</span></Dato>
            <Dato icon={<Clock className="h-4 w-4" />} label="Fecha evento"><span className="tabular-nums">{fmtFechaHora(caso.fecha_evento).fecha} {fmtFechaHora(caso.fecha_evento).hora}</span></Dato>
            <Dato icon={<Clock className="h-4 w-4" />} label="Fecha apertura"><span className="tabular-nums">{caso.fecha_apertura}</span></Dato>
          </div>

          {/* Documentos */}
          <div className="mt-8">
            <p className="text-[11px] font-bold uppercase tracking-wider text-tk-ink3">Documentos</p>
            {caso.documentos.length === 0 ? (
              <p className="mt-3 text-sm text-tk-ink3">Sin documentos adjuntos.</p>
            ) : (
              <ul className="mt-3 space-y-1.5">
                {caso.documentos.map((d, i) => (
                  <li key={i} className="flex items-center gap-2 rounded-md border border-tk-card-bd bg-white px-3 py-2 text-sm">
                    <FileText className="h-4 w-4 flex-shrink-0 text-tk-ink3" />
                    <span className="flex-1 truncate text-tk-ink">{d.nombre}</span>
                    {d.url && (
                      <a href={d.url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700">
                        <Download className="h-3.5 w-3.5" /> Abrir
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recordatorios */}
          <div className="mt-8">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-tk-ink3">
              <ListChecks className="h-3.5 w-3.5" /> Recordatorios
            </p>

            {caso.tareas.length > 0 && (
              <ul className="mt-3 space-y-2">
                {caso.tareas.map(t => {
                  const vencida = !t.completada && t.fecha_limite && new Date(t.fecha_limite).getTime() < ahora;
                  return (
                    <li key={t.id}
                      className={`flex items-start gap-2.5 rounded-md border px-3 py-2.5 ${
                        t.completada ? 'border-tk-card-bd bg-gray-50' : vencida ? 'border-red-200 bg-red-50/50' : 'border-tk-card-bd bg-white'
                      }`}>
                      <button
                        onClick={() => onToggleTarea(caso.id, t.id, !t.completada)}
                        aria-label={t.completada ? 'Marcar pendiente' : 'Marcar completado'}
                        className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-colors ${
                          t.completada ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-tk-ink3 hover:border-brand-500'
                        }`}>
                        {t.completada && <Check className="h-3 w-3" strokeWidth={3} />}
                      </button>
                      <div className="flex-1">
                        <p className={`text-sm ${t.completada ? 'text-tk-ink3 line-through' : 'text-tk-ink'}`}>{t.texto}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-tk-ink3">
                          <span className="inline-flex items-center gap-1 tabular-nums">
                            <Clock className="h-3 w-3" />{fmtFechaHora(t.fecha_limite).fecha} {fmtFechaHora(t.fecha_limite).hora}
                          </span>
                          {t.notificar && !t.completada && <span className="inline-flex items-center gap-1"><Bell className="h-3 w-3" />Recordatorio</span>}
                          {vencida && <span className="inline-flex items-center gap-1 font-semibold text-red-600"><AlertTriangle className="h-3 w-3" />Vencido</span>}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Nuevo recordatorio */}
            <div className="mt-3 rounded-md border border-dashed border-tk-card-bd bg-tk-surface p-3">
              <input
                value={tarea.texto}
                onChange={e => setTarea(p => ({ ...p, texto: e.target.value }))}
                placeholder="Nuevo recordatorio… (ej. Llamar a la central)"
                className="h-9 w-full rounded-md border border-tk-card-bd bg-white px-3 text-sm text-tk-ink placeholder:text-tk-ink3 focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-100"
              />
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <input
                  type="datetime-local" value={tarea.fecha_limite}
                  onChange={e => setTarea(p => ({ ...p, fecha_limite: e.target.value }))}
                  className="h-9 flex-1 rounded-md border border-tk-card-bd bg-white px-2 text-sm text-tk-ink tabular-nums focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-100"
                />
                <label className="inline-flex items-center gap-1.5 text-xs text-tk-ink2">
                  <input type="checkbox" checked={tarea.notificar} onChange={e => setTarea(p => ({ ...p, notificar: e.target.checked }))} className="accent-brand-600" />
                  Recordatorio por correo
                </label>
                <button
                  onClick={crearTarea}
                  disabled={!tarea.texto.trim() || !tarea.fecha_limite}
                  className="inline-flex h-9 items-center gap-1.5 rounded-md bg-brand-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" /> Agregar
                </button>
              </div>
            </div>
          </div>

          {/* Seguimiento */}
          <div className="mt-8">
            <p className="text-[11px] font-bold uppercase tracking-wider text-tk-ink3">Seguimiento</p>
            {caso.seguimiento.length === 0 ? (
              <p className="mt-3 text-sm text-tk-ink3">Aún no hay notas de seguimiento. Registra la primera abajo.</p>
            ) : (
              <ol className="relative mt-4">
                <span className="absolute bottom-2 left-[15px] top-2 w-px bg-tk-card-bd" aria-hidden />
                {caso.seguimiento.map(n => (
                  <li key={n.id} className="relative flex gap-3 pb-5">
                    <div className="z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 ring-4 ring-white">
                      <Clock className="h-4 w-4 text-brand-600" />
                    </div>
                    <div className="pt-0.5">
                      <p className="text-sm text-tk-ink">{n.texto}</p>
                      <p className="mt-0.5 text-xs text-tk-ink3">
                        {n.autor} · <span className="tabular-nums">{fmtFechaHora(n.timestamp).fecha} {fmtFechaHora(n.timestamp).hora}</span>
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        {/* Añadir nota */}
        <footer className="border-t border-tk-card-bd bg-tk-surface px-6 py-4">
          <div className="flex items-end gap-2">
            <textarea
              value={nota}
              onChange={e => setNota(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) enviarNota(); }}
              rows={2}
              placeholder="Agregar nota de seguimiento… (Ctrl/Cmd + Enter)"
              className="flex-1 resize-none rounded-md border border-tk-card-bd bg-white px-3 py-2 text-sm text-tk-ink placeholder:text-tk-ink3 focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-100"
            />
            <button
              onClick={enviarNota}
              disabled={!nota.trim()}
              className="inline-flex h-10 items-center gap-1.5 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" /> Enviar
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
