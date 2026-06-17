'use client';

import { Calendar, Hash, Ticket, User, IdCard, Cake, Layers, ListFilter, Building2, Search, X } from 'lucide-react';
import type { CasosFiltros } from '@/features/casos/types';
import { AREAS, ESTATUS, PROVEEDORES } from '@/features/casos/types';

interface Props {
  filtros:   CasosFiltros;
  onChange:  (f: Partial<CasosFiltros>) => void;
  onBuscar:  () => void;
  onLimpiar: () => void;
}

const inputCls =
  'h-11 w-full rounded-md border border-tk-card-bd bg-muted pl-10 pr-3 text-sm text-tk-ink ' +
  'placeholder:text-tk-ink3 transition-colors focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-100';

function Field({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-tk-ink3">{icon}</span>
      {children}
    </div>
  );
}

export default function CasosFilters({ filtros, onChange, onBuscar, onLimpiar }: Props) {
  const ic = 'h-4 w-4';
  return (
    <div className="rounded-xl border border-tk-card-bd bg-white p-5 shadow-sm">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {/* Rango de fechas */}
        <Field icon={<Calendar className={ic} />}>
          <div className="flex h-11 items-center gap-1 rounded-md border border-tk-card-bd bg-muted pl-10 pr-2">
            <input
              type="date" value={filtros.desde} onChange={e => onChange({ desde: e.target.value })}
              className="w-full bg-transparent text-sm text-tk-ink tabular-nums focus:outline-none"
              aria-label="Fecha desde"
            />
            <span className="text-tk-ink3">–</span>
            <input
              type="date" value={filtros.hasta} onChange={e => onChange({ hasta: e.target.value })}
              className="w-full bg-transparent text-sm text-tk-ink tabular-nums focus:outline-none"
              aria-label="Fecha hasta"
            />
          </div>
        </Field>

        <Field icon={<Hash className={ic} />}>
          <input className={inputCls} placeholder="Número de Caso" value={filtros.numero_caso}
            onChange={e => onChange({ numero_caso: e.target.value })} />
        </Field>

        <Field icon={<Ticket className={ic} />}>
          <input className={inputCls} placeholder="Voucher" value={filtros.voucher}
            onChange={e => onChange({ voucher: e.target.value })} />
        </Field>

        <Field icon={<User className={ic} />}>
          <input className={inputCls} placeholder="Nombre del pasajero" value={filtros.nombre}
            onChange={e => onChange({ nombre: e.target.value })} />
        </Field>

        <Field icon={<IdCard className={ic} />}>
          <input className={inputCls} placeholder="Documento de identidad" value={filtros.documento}
            onChange={e => onChange({ documento: e.target.value })} />
        </Field>

        <Field icon={<Cake className={ic} />}>
          <input type="date" className={`${inputCls} tabular-nums`} value={filtros.fecha_nacimiento}
            onChange={e => onChange({ fecha_nacimiento: e.target.value })} aria-label="Fecha de nacimiento" />
        </Field>

        <Field icon={<Layers className={ic} />}>
          <select className={`${inputCls} appearance-none`} value={filtros.area}
            onChange={e => onChange({ area: e.target.value as CasosFiltros['area'] })}>
            <option value="">Área</option>
            {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </Field>

        <Field icon={<ListFilter className={ic} />}>
          <select className={`${inputCls} appearance-none`} value={filtros.estatus}
            onChange={e => onChange({ estatus: e.target.value as CasosFiltros['estatus'] })}>
            <option value="">Estatus</option>
            {ESTATUS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>

        <Field icon={<Building2 className={ic} />}>
          <select className={`${inputCls} appearance-none`} value={filtros.proveedor}
            onChange={e => onChange({ proveedor: e.target.value as CasosFiltros['proveedor'] })}>
            <option value="">Proveedor</option>
            {PROVEEDORES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </Field>
      </div>

      <div className="mt-4 flex justify-end gap-3">
        <button
          onClick={onLimpiar}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-tk-card-bd bg-white px-5 text-sm font-medium text-tk-ink2 transition-colors hover:bg-gray-50"
        >
          <X className="h-4 w-4" /> Limpiar
        </button>
        <button
          onClick={onBuscar}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-brand-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-700 active:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2"
        >
          <Search className="h-4 w-4" /> Buscar
        </button>
      </div>
    </div>
  );
}
