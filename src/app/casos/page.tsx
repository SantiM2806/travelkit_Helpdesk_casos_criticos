'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { FolderOpen, Clock, Loader2, CheckCircle2, Plus, RefreshCw, Database, Table2, Columns3, ListChecks, LogOut } from 'lucide-react';
import type { CasoCritico, CasosFiltros, EstatusCaso, Tarea } from '@/features/casos/types';
import { FILTROS_VACIOS } from '@/features/casos/types';
import { MOCK_CASOS } from '@/features/casos/data/mock';
import { fetchCasos, insertCaso, insertSeguimiento, insertTarea, toggleTarea, updateEstatus, supabaseHabilitado } from '@/features/casos/actions/casos';
import { createSupabaseBrowser } from '@/lib/supabase/client';
import CasosFilters from '@/features/casos/components/CasosFilters';
import CasosTable from '@/features/casos/components/CasosTable';
import CasosKanban from '@/features/casos/components/CasosKanban';
import CasosPendientes from '@/features/casos/components/CasosPendientes';
import CasoDetailPanel from '@/features/casos/components/CasoDetailPanel';
import NuevoCasoPanel from '@/features/casos/components/NuevoCasoPanel';

type Vista = 'tabla' | 'kanban' | 'pendientes';

function Kpi({ icon, label, value, subtitle, alert }: {
  icon: React.ReactNode; label: string; value: number; subtitle: string; alert?: boolean;
}) {
  return (
    <div className="relative flex items-center gap-4 rounded-xl border border-tk-card-bd bg-white p-5 shadow-sm">
      {alert && (
        <span className="absolute right-3 top-3 flex h-2 w-2">
          <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600" />
        </span>
      )}
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">{icon}</div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-tk-ink3">{label}</p>
        <p className="mt-0.5 text-2xl font-bold tabular-nums text-tk-ink">{value}</p>
        <p className="mt-0.5 text-xs text-tk-ink3">{subtitle}</p>
      </div>
    </div>
  );
}

export default function CasosPage() {
  const [casos, setCasos]     = useState<CasoCritico[]>(supabaseHabilitado ? [] : MOCK_CASOS);
  const [draft, setDraft]     = useState<CasosFiltros>(FILTROS_VACIOS);
  const [aplicados, setAplicados] = useState<CasosFiltros>(FILTROS_VACIOS);
  const [seleccion, setSeleccion] = useState<CasoCritico | null>(null);
  const [nuevoOpen, setNuevoOpen] = useState(false);
  const [cargando, setCargando]   = useState(supabaseHabilitado);
  const [fuenteMock, setFuenteMock] = useState(!supabaseHabilitado);
  const [vista, setVista]     = useState<Vista>('tabla');

  const real = supabaseHabilitado && !fuenteMock;

  const cargar = useCallback(async () => {
    if (!supabaseHabilitado) return;
    setCargando(true);
    try {
      setCasos(await fetchCasos());
      setFuenteMock(false);
    } catch (err) {
      console.warn('[CASOS] Error al leer Supabase, usando mock:', err);
      setCasos(MOCK_CASOS);
      setFuenteMock(true);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const filtrados = useMemo(() => {
    const f = aplicados;
    const inc = (campo: string, q: string) => !q || campo.toLowerCase().includes(q.toLowerCase());
    return casos.filter(c => {
      const fecha = c.fecha_apertura;
      if (f.desde && fecha < f.desde) return false;
      if (f.hasta && fecha > f.hasta) return false;
      if (f.fecha_nacimiento && c.fecha_nacimiento !== f.fecha_nacimiento) return false;
      if (f.area && c.area !== f.area) return false;
      if (f.estatus && c.estatus !== f.estatus) return false;
      if (f.proveedor && c.proveedor !== f.proveedor) return false;
      return inc(c.numero_caso, f.numero_caso)
        && inc(c.voucher, f.voucher)
        && inc(c.nombre_paciente, f.nombre)
        && inc(c.pasaporte, f.documento);
    });
  }, [casos, aplicados]);

  const kpis = useMemo(() => ({
    total:        casos.length,
    abiertos:     casos.filter(c => c.estatus === 'Abierto').length,
    seguimiento:  casos.filter(c => c.estatus === 'En seguimiento').length,
    resueltos:    casos.filter(c => c.estatus === 'Resuelto').length,
  }), [casos]);

  const pendientesCount = useMemo(
    () => casos.reduce((n, c) => n + c.tareas.filter(t => !t.completada).length, 0),
    [casos],
  );

  async function cerrarSesion() {
    try { await createSupabaseBrowser().auth.signOut(); }
    catch (err) { console.error('[CASOS] Error al cerrar sesión:', err); }
    window.location.href = '/login';
  }

  function sincronizarSeleccion(casoId: string, fn: (c: CasoCritico) => CasoCritico) {
    setCasos(prev => prev.map(c => c.id === casoId ? fn(c) : c));
    setSeleccion(prev => prev && prev.id === casoId ? fn(prev) : prev);
  }

  async function addNota(casoId: string, texto: string) {
    let nota = { id: `${Date.now()}`, autor: 'Operativo Travelkit', texto, timestamp: new Date().toISOString() };
    if (real) {
      try { nota = await insertSeguimiento(casoId, nota.autor, texto); }
      catch (err) { console.error('[CASOS] No se pudo guardar la nota:', err); }
    }
    sincronizarSeleccion(casoId, c => ({ ...c, seguimiento: [...c.seguimiento, nota] }));
  }

  async function addTarea(casoId: string, datos: { texto: string; fecha_limite: string; notificar: boolean }) {
    let tarea: Tarea = {
      id: `${Date.now()}`, ...datos, responsable: '', depende_proveedor: false,
      completada: false, notificado: false, created_at: new Date().toISOString(),
    };
    if (real) {
      try { tarea = await insertTarea(casoId, datos); }
      catch (err) { console.error('[CASOS] No se pudo crear el recordatorio:', err); }
    }
    sincronizarSeleccion(casoId, c => ({ ...c, tareas: [...c.tareas, tarea].sort((a, b) => a.fecha_limite.localeCompare(b.fecha_limite)) }));
  }

  async function marcarTarea(casoId: string, tareaId: string, completada: boolean) {
    const texto = casos.find(c => c.id === casoId)?.tareas.find(t => t.id === tareaId)?.texto;
    if (real) {
      try { await toggleTarea(tareaId, completada); }
      catch (err) { console.error('[CASOS] No se pudo actualizar el recordatorio:', err); }
    }
    sincronizarSeleccion(casoId, c => ({ ...c, tareas: c.tareas.map(t => t.id === tareaId ? { ...t, completada } : t) }));
    // Al completar, registrar en el seguimiento con la fecha de ejecución
    if (completada && texto) await addNota(casoId, `Recordatorio completado: ${texto}`);
  }

  async function moverEstatus(casoId: string, estatus: EstatusCaso) {
    sincronizarSeleccion(casoId, c => ({ ...c, estatus }));
    if (real) {
      try { await updateEstatus(casoId, estatus); }
      catch (err) { console.error('[CASOS] No se pudo cambiar el estatus:', err); cargar(); }
    }
  }

  async function crearCaso(nuevo: Omit<CasoCritico, 'id' | 'seguimiento' | 'tareas'>) {
    if (real) {
      try {
        const creado = await insertCaso(nuevo);
        setCasos(prev => [creado, ...prev]);
        return;
      } catch (err) {
        console.error('[CASOS] No se pudo crear el caso en Supabase:', err);
      }
    }
    setCasos(prev => [{ ...nuevo, id: `c${Date.now()}`, seguimiento: [], tareas: [] }, ...prev]);
  }

  const VistaBtn = ({ v, icon, label }: { v: Vista; icon: React.ReactNode; label: string }) => (
    <button
      onClick={() => setVista(v)}
      className={`inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-colors ${
        vista === v ? 'bg-white text-tk-ink shadow-sm' : 'text-tk-ink2 hover:text-tk-ink'
      }`}
    >
      {icon} {label}
    </button>
  );

  return (
    <div className="tk-crm min-h-screen bg-tk-surface text-tk-ink">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-10">
        {/* Barra superior: logo + cerrar sesión */}
        <div className="animate-slide-up mb-6 flex items-center justify-between gap-4">
          <Image
            src="/travelkit-logo_nbtjgf-67feae5fe38949.68302424.png"
            alt="Travelkit" width={150} height={45} priority
            className="h-9 w-auto object-contain"
          />
          <button
            onClick={cerrarSesion}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-tk-card-bd bg-white px-3 text-xs font-semibold text-tk-ink2 transition-colors hover:bg-gray-50 hover:text-tk-ink"
          >
            <LogOut className="h-3.5 w-3.5" /> Cerrar sesión
          </button>
        </div>

        {/* Hero */}
        <div className="animate-slide-up stagger-1 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-tk-ink">Casos críticos</h1>
            <p className="mt-1 text-sm text-tk-ink2">Registro y seguimiento de los casos críticos TRAVELKIT.</p>
          </div>
          <div className="flex items-center gap-2 self-start">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                real ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}
              title={real ? 'Conectado a Supabase' : 'Datos de ejemplo (sin Supabase)'}
            >
              <Database className="h-3 w-3" />
              {real ? 'Supabase' : 'Datos demo'}
            </span>
            {supabaseHabilitado && (
              <button onClick={cargar} aria-label="Recargar"
                className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-tk-card-bd bg-white text-tk-ink2 transition-colors hover:bg-gray-50">
                <RefreshCw className={`h-4 w-4 ${cargando ? 'animate-spin' : ''}`} />
              </button>
            )}
            <button
              onClick={() => setVista('pendientes')}
              className="relative inline-flex h-11 items-center gap-2 rounded-md border border-tk-card-bd bg-white px-4 text-sm font-semibold text-tk-ink2 transition-colors hover:bg-gray-50 hover:text-tk-ink"
            >
              <ListChecks className="h-4 w-4" /> Tareas pendientes
              {pendientesCount > 0 && (
                <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-600 px-1.5 text-[11px] font-bold tabular-nums text-white">
                  {pendientesCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setNuevoOpen(true)}
              className="inline-flex h-11 items-center gap-2 rounded-md bg-brand-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 active:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2"
            >
              <Plus className="h-4 w-4" /> Nuevo caso
            </button>
          </div>
        </div>

        {/* KPIs por estatus */}
        <div className="animate-slide-up stagger-1 mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi icon={<FolderOpen className="h-5 w-5" />}   label="Casos totales"  value={kpis.total}       subtitle="en el sistema" />
          <Kpi icon={<Clock className="h-5 w-5" />}        label="Abiertos"       value={kpis.abiertos}    subtitle="requieren atención" alert={kpis.abiertos > 0} />
          <Kpi icon={<Loader2 className="h-5 w-5" />}      label="En seguimiento" value={kpis.seguimiento} subtitle="en gestión" />
          <Kpi icon={<CheckCircle2 className="h-5 w-5" />} label="Resueltos"      value={kpis.resueltos}   subtitle="resueltos o cerrados" />
        </div>

        {/* Filtros */}
        <div className="animate-slide-up stagger-2 mt-6">
          <CasosFilters
            filtros={draft}
            onChange={p => setDraft(prev => ({ ...prev, ...p }))}
            onBuscar={() => setAplicados(draft)}
            onLimpiar={() => { setDraft(FILTROS_VACIOS); setAplicados(FILTROS_VACIOS); }}
          />
        </div>

        {/* Toggle de vista + contenido */}
        <div className="animate-slide-up stagger-3 mt-6">
          <div className="mb-2 flex items-center justify-between">
            <div className="inline-flex items-center gap-1 rounded-lg bg-gray-100 p-1">
              <VistaBtn v="tabla"  icon={<Table2 className="h-3.5 w-3.5" />}   label="Tabla" />
              <VistaBtn v="kanban" icon={<Columns3 className="h-3.5 w-3.5" />} label="Kanban" />
            </div>
            <p className="text-xs text-tk-ink3 tabular-nums">
              {vista === 'pendientes' ? `${pendientesCount} recordatorios pendientes` : `${filtrados.length} de ${casos.length} casos`}
            </p>
          </div>
          {vista === 'tabla' && <CasosTable casos={filtrados} onSelect={setSeleccion} />}
          {vista === 'kanban' && <CasosKanban casos={filtrados} onSelect={setSeleccion} onMover={moverEstatus} />}
          {vista === 'pendientes' && <CasosPendientes casos={casos} onSelect={setSeleccion} onToggle={marcarTarea} />}
        </div>
      </div>

      <CasoDetailPanel
        caso={seleccion}
        onClose={() => setSeleccion(null)}
        onAddNota={addNota}
        onAddTarea={addTarea}
        onToggleTarea={marcarTarea}
      />
      <NuevoCasoPanel open={nuevoOpen} onClose={() => setNuevoOpen(false)} onCreate={crearCaso} />
    </div>
  );
}
