'use client';

import { useState } from 'react';
import { Paperclip, ListChecks } from 'lucide-react';
import type { CasoCritico, EstatusCaso } from '@/features/casos/types';
import { ESTATUS } from '@/features/casos/types';
import Badge from './Badge';
import { estatusBorde } from '@/features/casos/utils/format';

interface Props {
  casos:    CasoCritico[];
  onSelect: (c: CasoCritico) => void;
  onMover:  (casoId: string, estatus: EstatusCaso) => void;
}

const COL_PUNTO: Record<EstatusCaso, string> = {
  'Abierto':             'bg-red-500',
  'En seguimiento':      'bg-blue-500',
  'Respuesta Proveedor': 'bg-amber-400',
  'Resuelto':            'bg-emerald-500',
};

export default function CasosKanban({ casos, onSelect, onMover }: Props) {
  const [arrastrando, setArrastrando] = useState<string | null>(null);
  const [sobre, setSobre] = useState<EstatusCaso | null>(null);

  function soltar(estatus: EstatusCaso) {
    if (arrastrando) {
      const caso = casos.find(c => c.id === arrastrando);
      if (caso && caso.estatus !== estatus) onMover(arrastrando, estatus);
    }
    setArrastrando(null);
    setSobre(null);
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {ESTATUS.map(estatus => {
        const items = casos.filter(c => c.estatus === estatus);
        const activa = sobre === estatus;
        return (
          <div
            key={estatus}
            onDragOver={e => { e.preventDefault(); setSobre(estatus); }}
            onDragLeave={() => setSobre(s => (s === estatus ? null : s))}
            onDrop={() => soltar(estatus)}
            className={`flex flex-col rounded-xl border bg-tk-surface/60 transition-colors ${
              activa ? 'border-brand-300 bg-brand-50/40' : 'border-tk-card-bd'
            }`}
          >
            <div className="flex items-center justify-between gap-2 border-b border-tk-card-bd px-3 py-2.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-tk-ink2">
                <span className={`h-2 w-2 rounded-full ${COL_PUNTO[estatus]}`} aria-hidden />
                {estatus}
              </span>
              <span className="rounded-full bg-gray-100 px-1.5 text-[10px] font-semibold tabular-nums text-tk-ink2">{items.length}</span>
            </div>

            <div className="flex min-h-[120px] flex-1 flex-col gap-2 p-2">
              {items.map(c => {
                const pendientes = c.tareas.filter(t => !t.completada).length;
                return (
                  <article
                    key={c.id}
                    draggable
                    onDragStart={() => setArrastrando(c.id)}
                    onDragEnd={() => { setArrastrando(null); setSobre(null); }}
                    onClick={() => onSelect(c)}
                    className={`cursor-pointer rounded-lg border border-l-4 border-tk-card-bd ${estatusBorde(c.estatus)} bg-white p-3 shadow-sm transition-all hover:-translate-y-px hover:shadow-md ${
                      arrastrando === c.id ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold tabular-nums text-tk-ink">{c.numero_caso}</span>
                      <Badge variant="outline" className="font-semibold">{c.proveedor}</Badge>
                    </div>
                    <p className="mt-1 text-sm font-medium leading-tight text-tk-ink">{c.nombre_paciente}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-tk-ink3">
                      <Badge variant="brand">{c.area}</Badge>
                      {c.documentos.length > 0 && (
                        <span className="inline-flex items-center gap-0.5"><Paperclip className="h-3 w-3" />{c.documentos.length}</span>
                      )}
                      {pendientes > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-amber-600"><ListChecks className="h-3 w-3" />{pendientes}</span>
                      )}
                    </div>
                  </article>
                );
              })}
              {items.length === 0 && (
                <p className="px-1 py-6 text-center text-[11px] text-tk-ink3">Arrastra casos aquí</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
