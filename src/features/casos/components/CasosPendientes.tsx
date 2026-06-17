'use client';

import { Check, Clock, AlertTriangle, Bell, CheckCircle2, ExternalLink } from 'lucide-react';
import type { CasoCritico } from '@/features/casos/types';
import Badge from './Badge';
import { estatusVariant, fmtFechaHora } from '@/features/casos/utils/format';

interface Props {
  casos:    CasoCritico[];
  onSelect: (c: CasoCritico) => void;
  onToggle: (casoId: string, tareaId: string, completada: boolean) => void;
}

export default function CasosPendientes({ casos, onSelect, onToggle }: Props) {
  const ahora = Date.now();

  const pendientes = casos
    .flatMap(c => c.tareas.filter(t => !t.completada).map(t => ({ caso: c, tarea: t })))
    .sort((a, b) => a.tarea.fecha_limite.localeCompare(b.tarea.fecha_limite));

  if (pendientes.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed border-tk-card-bd bg-white py-16 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        </div>
        <p className="text-sm font-semibold text-tk-ink">Todo al día</p>
        <p className="mt-1 max-w-xs text-xs text-tk-ink2">No hay recordatorios pendientes en ningún caso.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-tk-card-bd bg-white shadow-sm">
      <ul className="divide-y divide-tk-card-bd">
        {pendientes.map(({ caso, tarea }) => {
          const venc = fmtFechaHora(tarea.fecha_limite);
          const vencida = new Date(tarea.fecha_limite).getTime() < ahora;
          return (
            <li key={tarea.id} className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50 ${vencida ? 'bg-red-50/40' : ''}`}>
              <button
                onClick={() => onToggle(caso.id, tarea.id, true)}
                aria-label="Marcar completado"
                className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border border-tk-ink3 transition-colors hover:border-emerald-500 hover:bg-emerald-50"
              >
                <Check className="h-3.5 w-3.5 text-transparent" />
              </button>

              <div className="flex-1">
                <p className="text-sm font-medium text-tk-ink">{tarea.texto}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-tk-ink3">
                  <span className="inline-flex items-center gap-1 tabular-nums">
                    <Clock className="h-3 w-3" />{venc.fecha} {venc.hora}
                  </span>
                  {tarea.notificar && <span className="inline-flex items-center gap-1"><Bell className="h-3 w-3" />Recordatorio</span>}
                  {vencida && <span className="inline-flex items-center gap-1 font-semibold text-red-600"><AlertTriangle className="h-3 w-3" />Vencido</span>}
                </div>
              </div>

              <button
                onClick={() => onSelect(caso)}
                className="flex flex-col items-end gap-1 text-right"
              >
                <span className="inline-flex items-center gap-1 text-xs font-semibold tabular-nums text-tk-ink hover:text-brand-600">
                  {caso.numero_caso} <ExternalLink className="h-3 w-3" />
                </span>
                <span className="text-[11px] text-tk-ink3">{caso.nombre_paciente}</span>
                <Badge variant={estatusVariant(caso.estatus)} className="mt-0.5">{caso.estatus}</Badge>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
