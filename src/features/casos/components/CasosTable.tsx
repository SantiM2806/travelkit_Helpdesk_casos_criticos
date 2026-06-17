'use client';

import { Plus, Inbox, Paperclip } from 'lucide-react';
import type { CasoCritico } from '@/features/casos/types';
import Badge from './Badge';
import Flag from './Flag';
import { estatusVariant, estatusBorde, fmtFechaHora } from '@/features/casos/utils/format';

const TH = 'px-2 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-tk-ink3 align-bottom';
const TD = 'px-2 py-2 align-top text-xs text-tk-ink';

export default function CasosTable({
  casos, onSelect,
}: {
  casos: CasoCritico[];
  onSelect: (c: CasoCritico) => void;
}) {
  if (casos.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed border-tk-card-bd bg-white py-16 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50">
          <Inbox className="h-5 w-5 text-brand-600" />
        </div>
        <p className="text-sm font-semibold text-tk-ink">Sin casos que mostrar</p>
        <p className="mt-1 max-w-xs text-xs text-tk-ink2">
          Ajusta los filtros o registra un nuevo caso crítico para empezar el seguimiento.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-tk-card-bd bg-white shadow-sm">
      <table className="w-full table-fixed border-collapse">
        <colgroup>
          <col className="w-[9%]" />   {/* N.º caso */}
          <col className="w-[8%]" />   {/* Proveedor */}
          <col className="w-[13%]" />  {/* Voucher */}
          <col className="w-[17%]" />  {/* Paciente */}
          <col className="w-[11%]" />  {/* Área */}
          <col className="w-[12%]" />  {/* Estatus */}
          <col className="w-[11%]" />  {/* Fecha evento */}
          <col className="w-[8%]" />   {/* Fecha apertura */}
          <col className="w-[7%]" />   {/* Origen viaje */}
          <col className="w-[7%]" />   {/* País servicio */}
          <col className="w-[5%]" />   {/* Opciones */}
        </colgroup>
        <thead className="bg-gray-50">
          <tr className="border-b border-tk-card-bd">
            <th className={TH}>N.º de Caso</th>
            <th className={TH}>Proveedor</th>
            <th className={TH}>Voucher</th>
            <th className={TH}>Paciente</th>
            <th className={TH}>Área</th>
            <th className={TH}>Estatus</th>
            <th className={TH}>Fecha Evento</th>
            <th className={TH}>Apertura</th>
            <th className={TH}>Origen viaje</th>
            <th className={TH}>País servicio</th>
            <th className={`${TH} text-center`}>Opc.</th>
          </tr>
        </thead>
        <tbody>
          {casos.map(c => {
            const ev = fmtFechaHora(c.fecha_evento);
            return (
              <tr
                key={c.id}
                onClick={() => onSelect(c)}
                className={`cursor-pointer border-b border-tk-card-bd border-l-4 ${estatusBorde(c.estatus)} transition-colors hover:bg-gray-50`}
              >
                <td className={`${TD} font-semibold tabular-nums`}>{c.numero_caso}</td>
                <td className={TD}><Badge variant="outline" className="font-semibold">{c.proveedor}</Badge></td>
                <td className={`${TD} font-mono tabular-nums break-all`}>{c.voucher}</td>
                <td className={`${TD} font-medium break-words`}>
                  {c.nombre_paciente}
                  {c.documentos.length > 0 && (
                    <span className="ml-1 inline-flex items-center gap-0.5 align-middle text-tk-ink3" title={`${c.documentos.length} documento(s)`}>
                      <Paperclip className="h-3 w-3" /><span className="text-[10px] tabular-nums">{c.documentos.length}</span>
                    </span>
                  )}
                </td>
                <td className={`${TD} text-tk-ink2`}>{c.area}</td>
                <td className={TD}>
                  <Badge variant={estatusVariant(c.estatus)} className="w-fit max-w-full whitespace-normal leading-tight">{c.estatus}</Badge>
                </td>
                <td className={TD}>
                  <span className="tabular-nums">{ev.fecha}</span>
                  {ev.hora && <span className="block text-[11px] text-tk-ink3 tabular-nums">{ev.hora}</span>}
                </td>
                <td className={`${TD} tabular-nums`}>{c.fecha_apertura}</td>
                <td className={TD}><Flag iso={c.origen_viaje} /></td>
                <td className={TD}><Flag iso={c.pais_servicio} /></td>
                <td className={`${TD} text-center`}>
                  <button
                    onClick={e => { e.stopPropagation(); onSelect(c); }}
                    aria-label={`Ver detalle del caso ${c.numero_caso}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-tk-card-bd text-tk-ink2 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
