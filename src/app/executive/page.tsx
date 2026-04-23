'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const AREA_COLORS = ["#D32F2F","#F57C00","#1976D2","#388E3C","#7B1FA2","#0097A7"];

const chartConfigArea     = { tickets: { label: "Tickets", color: "#D32F2F" } };
const chartConfigIssues   = { count:   { label: "Tickets", color: "#D32F2F" } };
const chartConfigDept     = { tickets: { label: "Tickets", color: "#1976D2" } };
const chartConfigReqType  = { count:   { label: "Tickets", color: "#F57C00" } };

function horasDesde(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  return h < 24 ? `${h}h` : `${Math.floor(h / 24)}d`;
}

interface KPI            { title: string; value: string | number; description: string; trend?: string; trendUp?: boolean; }
interface AreaDist       { area: string; tickets: number; fill: string; }
interface DeptDist       { dept: string; tickets: number; fill: string; }
interface TopIssue       { category: string; count: number; }
interface ReqType        { type: string; count: number; }
interface CriticalTicket { id: string; area: string; waitTime: string; assignee: string; }
interface Movement       { ticket_id: string; de: string; a: string; responsable: string; area: string | null; accion: string | null; timestamp: string; }

export default function ExecutiveDashboard() {
  const [isSidebarOpen,       setIsSidebarOpen]       = useState(false);
  const [userName,            setUserName]            = useState('');
  const [loading,             setLoading]             = useState(true);
  const [kpis,                setKpis]                = useState<KPI[]>([]);
  const [kpis2,               setKpis2]               = useState<KPI[]>([]);
  const [areaDist,            setAreaDist]            = useState<AreaDist[]>([]);
  const [deptDist,            setDeptDist]            = useState<DeptDist[]>([]);
  const [topIssues,           setTopIssues]           = useState<TopIssue[]>([]);
  const [reqTypeDist,         setReqTypeDist]         = useState<ReqType[]>([]);
  const [criticalTickets,     setCriticalTickets]     = useState<CriticalTicket[]>([]);
  const [movements,           setMovements]           = useState<Movement[]>([]);
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseBrowser();

    supabase.auth.getUser().then(({ data }) => {
      const meta = data.user?.user_metadata;
      const email = data.user?.email || '';
      const nameFromEmail = email.split('@')[0].split('.').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      setUserName(meta?.full_name || meta?.name || nameFromEmail);
    });

    async function load() {
      const [{ data: tickets }, { data: movs }] = await Promise.all([
        supabase.from('tickets').select('*').order('timestamp', { ascending: true }),
        supabase.from('ticket_movements').select('*').order('timestamp', { ascending: false }).limit(200),
      ]);

      const all       = tickets ?? [];
      const movsAll   = movs ?? [];
      const abiertos  = all.filter(t => t.estado?.toLowerCase() === 'abierto');
      const enProceso = all.filter(t => t.estado?.toLowerCase().includes('proceso'));
      const resueltos = all.filter(t => t.estado?.toLowerCase() === 'resuelto');
      const criticos  = all.filter(t => t.urgency?.toLowerCase() === 'alta' || t.prioridad?.toLowerCase() === 'alta').filter(t => t.estado?.toLowerCase() !== 'resuelto');

      // ── KPIs fila 1 ──────────────────────────────────────────────────────
      const tasaResolucion = all.length > 0 ? Math.round((resueltos.length / all.length) * 100) : 0;
      const slaHrs = resueltos.length > 0
        ? (resueltos.reduce((sum, t) => sum + (Date.now() - new Date(t.timestamp).getTime()) / 3600000, 0) / resueltos.length).toFixed(1)
        : '—';

      setKpis([
        { title: "Tickets Abiertos",     value: abiertos.length,    description: `${criticos.length} de alta urgencia`,   trend: `${abiertos.length}`,   trendUp: abiertos.length === 0 },
        { title: "En Proceso",           value: enProceso.length,   description: "Siendo atendidos ahora" },
        { title: "Tasa de Resolución",   value: `${tasaResolucion}%`, description: `${resueltos.length} resueltos`,        trend: `${tasaResolucion}%`,   trendUp: tasaResolucion >= 70 },
        { title: "SLA Promedio",         value: slaHrs === '—' ? '—' : `${slaHrs}h`, description: "Tiempo estimado de atención" },
      ]);

      // ── KPIs fila 2 ──────────────────────────────────────────────────────
      const sinAsignar = abiertos.filter(t => !t.responsable).length;

      const hace7dias = new Date(Date.now() - 7 * 24 * 3600000).toISOString();
      const resueltosEstaSemana = movsAll.filter(m => m.a === 'Resuelto' && m.timestamp >= hace7dias).length;

      // Primer movimiento por ticket (movsAll viene DESC, al iterar queda el más antiguo)
      const ticketFirstMove: Record<string, string> = {};
      movsAll.forEach(m => { ticketFirstMove[m.ticket_id] = m.timestamp; });
      const tiempos = all
        .filter(t => ticketFirstMove[t.ticket_id])
        .map(t => (new Date(ticketFirstMove[t.ticket_id]).getTime() - new Date(t.timestamp).getTime()) / 3600000)
        .filter(h => h >= 0);
      const avgTiempo = tiempos.length > 0
        ? (tiempos.reduce((a, b) => a + b, 0) / tiempos.length).toFixed(1)
        : '—';

      // Herramienta más problemática
      const failCounts: Record<string, number> = {};
      all.filter(t => t.request_type === 'Reporte de Falla / Error').forEach(t => {
        const key = t.sub_category || t.categoria || 'Sin clasificar';
        failCounts[key] = (failCounts[key] || 0) + 1;
      });
      const herramientaCritica = Object.entries(failCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

      setKpis2([
        { title: "Sin Asignar",              value: sinAsignar,       description: "Abiertos sin responsable",     trend: `${sinAsignar}`,  trendUp: sinAsignar === 0 },
        { title: "Resueltos Esta Semana",    value: resueltosEstaSemana, description: "Últimos 7 días",            trend: `${resueltosEstaSemana}`, trendUp: resueltosEstaSemana > 0 },
        { title: "Tiempo 1ª Respuesta",      value: avgTiempo === '—' ? '—' : `${avgTiempo}h`, description: "Promedio hasta primer movimiento" },
        { title: "Herramienta Crítica",      value: herramientaCritica, description: "Con más reportes de falla" },
      ]);

      // ── Distribución IT area (dona) ───────────────────────────────────────
      const areaCounts: Record<string, number> = {};
      all.forEach(t => { const k = t.area || 'Sin área'; areaCounts[k] = (areaCounts[k] || 0) + 1; });
      setAreaDist(Object.entries(areaCounts).map(([area, tickets], i) => ({ area, tickets, fill: AREA_COLORS[i % AREA_COLORS.length] })));

      // ── Distribución empresa (department) ────────────────────────────────
      const deptCounts: Record<string, number> = {};
      all.forEach(t => { const k = t.department || 'Sin área'; deptCounts[k] = (deptCounts[k] || 0) + 1; });
      setDeptDist(Object.entries(deptCounts).sort((a, b) => b[1] - a[1]).map(([dept, tickets], i) => ({ dept, tickets, fill: AREA_COLORS[i % AREA_COLORS.length] })));

      // ── Top 5 problemas (categoría) ───────────────────────────────────────
      const catCounts: Record<string, number> = {};
      all.forEach(t => { const k = t.main_category || t.categoria; if (k) catCounts[k] = (catCounts[k] || 0) + 1; });
      setTopIssues(Object.entries(catCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([category, count]) => ({ category, count })));

      // ── Tipo de requerimiento ─────────────────────────────────────────────
      const reqCounts: Record<string, number> = {};
      all.forEach(t => { const k = t.request_type || 'Sin clasificar'; reqCounts[k] = (reqCounts[k] || 0) + 1; });
      setReqTypeDist(Object.entries(reqCounts).sort((a, b) => b[1] - a[1]).map(([type, count]) => ({ type, count })));

      // ── Tickets críticos ──────────────────────────────────────────────────
      setCriticalTickets(criticos.slice(0, 5).map(t => ({
        id:       t.ticket_id,
        area:     t.department || t.area || t.categoria || '—',
        waitTime: horasDesde(t.timestamp),
        assignee: t.responsable || 'Sin asignar',
      })));

      setMovements(movsAll.slice(0, 20));
      setLoading(false);
    }

    load();
  }, []);

  async function handleLogout() {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1a1a1a] font-sans flex relative overflow-hidden">

      {/* SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-[90] cursor-pointer" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed top-0 left-0 h-screen border-r border-[#ebebeb] bg-white flex flex-col z-[100] transition-transform duration-300 overflow-hidden shadow-xl ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'}`}>
        <div className="h-14 border-b border-[#e8e8e8] flex items-center px-6 justify-between min-w-[256px]">
          <span className="text-[13px] font-semibold text-[#888] uppercase tracking-wide">Navegación</span>
          <button onClick={() => setIsSidebarOpen(false)} className="text-[#888] hover:text-[#D32F2F] p-1 cursor-pointer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <nav className="flex-1 p-4 min-w-[256px]">
          <ul className="space-y-1">
            <li>
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-[#fff5f5] text-[#D32F2F] rounded-xl text-[14px] font-medium cursor-pointer border border-[#D32F2F]/20 shadow-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
                </svg>
                Dashboard IT
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">

        {/* HEADER */}
        <header className="sticky top-0 z-[80] h-14 bg-white border-b border-[#e8e8e8] flex items-center px-4 md:px-6 gap-3 shadow-sm">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 -ml-1 rounded-md hover:bg-[#f5f5f5] text-[#666] transition-colors flex-shrink-0 cursor-pointer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div className="flex items-center gap-3 h-8 flex-shrink-0">
            <Image src="/travelkit-logo_nbtjgf-67feae5fe38949.68302424.png" alt="Travelkit" width={120} height={36} className="h-8 w-auto object-contain" priority />
            <div className="hidden sm:block w-px h-5 bg-[#e8e8e8] mx-2" />
            <span className="text-[13px] text-[#888] hidden sm:block">Portal de soporte interno</span>
          </div>
          <div className="ml-auto flex items-center gap-2 md:gap-3">
            {userName && (
              <>
                <span className="text-[13px] text-[#555] hidden md:block whitespace-nowrap">{userName}</span>
                <div className="w-px h-5 bg-[#e8e8e8]" />
              </>
            )}
            <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#ddd] rounded-lg text-[#666] text-[13px] font-medium hover:border-[#D32F2F] hover:text-[#D32F2F] hover:bg-[#fff5f5] transition-all duration-150 cursor-pointer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </header>

        {/* CONTENIDO */}
        <main className="flex-1 p-4 md:p-8 w-full space-y-6 overflow-y-auto max-h-[calc(100vh-56px)]">

          <div className="max-w-7xl mx-auto">
            <h1 className="text-[22px] sm:text-[28px] font-semibold text-[#1a1a1a] leading-tight">Dashboard Estratégico IT</h1>
            <p className="text-[14px] text-[#666] mt-1">Vista general de métricas, rendimiento y estado operativo.</p>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20 text-[#888] text-[14px]">Cargando datos…</div>
          )}

          {!loading && <>

            {/* ── KPIs FILA 1: Visión general ── */}
            <div className="max-w-7xl mx-auto">
              <p className="text-[11px] font-semibold text-[#aaa] uppercase tracking-widest mb-3">Visión general</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi, idx) => (
                  <Card key={idx} className="bg-white border-[#ebebeb] rounded-2xl shadow-sm hover:border-[#D32F2F] group cursor-pointer overflow-hidden transition-all duration-200">
                    <CardHeader className="pb-1 px-5 pt-5">
                      <CardTitle className="text-[12px] font-medium text-[#888] tracking-wide">{kpi.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5">
                      <div className="text-[26px] font-semibold text-[#1a1a1a] group-hover:text-[#D32F2F] transition-colors">{kpi.value}</div>
                      <div className="flex items-center gap-2 mt-2">
                        {kpi.trend && (
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${kpi.trendUp ? 'bg-[#f0faf0] text-[#388E3C] border border-[#388E3C]/20' : 'bg-[#fff5f5] text-[#D32F2F] border border-[#D32F2F]/20'}`}>
                            {kpi.trend}
                          </span>
                        )}
                        <p className="text-[11px] text-[#aaa] hidden xl:block">{kpi.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* ── KPIs FILA 2: Rendimiento ── */}
            <div className="max-w-7xl mx-auto">
              <p className="text-[11px] font-semibold text-[#aaa] uppercase tracking-widest mb-3">Rendimiento del equipo</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis2.map((kpi, idx) => (
                  <Card key={idx} className="bg-white border-[#ebebeb] rounded-2xl shadow-sm hover:border-[#1976D2] group cursor-pointer overflow-hidden transition-all duration-200">
                    <CardHeader className="pb-1 px-5 pt-5">
                      <CardTitle className="text-[12px] font-medium text-[#888] tracking-wide">{kpi.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5">
                      <div className="text-[22px] font-semibold text-[#1a1a1a] group-hover:text-[#1976D2] transition-colors truncate">{kpi.value}</div>
                      <div className="flex items-center gap-2 mt-2">
                        {kpi.trend !== undefined && (
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${kpi.trendUp ? 'bg-[#f0faf0] text-[#388E3C] border border-[#388E3C]/20' : 'bg-[#fff5f5] text-[#D32F2F] border border-[#D32F2F]/20'}`}>
                            {kpi.trend}
                          </span>
                        )}
                        <p className="text-[11px] text-[#aaa] hidden xl:block">{kpi.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* ── GRÁFICOS FILA 1: Área IT + Top problemas ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">

              <Card className="bg-white border-[#ebebeb] rounded-2xl shadow-sm overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between border-b border-[#f5f5f5] px-6 py-5">
                  <div>
                    <CardTitle className="text-[15px] font-semibold text-[#1a1a1a]">Distribución por Área IT</CardTitle>
                    <CardDescription className="text-[13px] text-[#888] mt-0.5">Área responsable de los tickets</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {areaDist.length === 0
                    ? <p className="text-center text-[#aaa] text-[13px] py-10">Sin datos aún</p>
                    : <ChartContainer config={chartConfigArea} className="w-full h-[260px]">
                        <PieChart>
                          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                          <Pie data={areaDist} dataKey="tickets" nameKey="area" cx="50%" cy="50%" innerRadius={60} outerRadius={90} stroke="#fff" strokeWidth={3} paddingAngle={2}>
                            {areaDist.map((_, i) => <Cell key={i} fill={AREA_COLORS[i % AREA_COLORS.length]} />)}
                          </Pie>
                        </PieChart>
                      </ChartContainer>
                  }
                </CardContent>
              </Card>

              <Card className="bg-white border-[#ebebeb] rounded-2xl shadow-sm overflow-hidden">
                <CardHeader className="border-b border-[#f5f5f5] px-6 py-5">
                  <CardTitle className="text-[15px] font-semibold text-[#1a1a1a]">Top 5 Categorías</CardTitle>
                  <CardDescription className="text-[13px] text-[#888] mt-0.5">Categorías con mayor volumen de tickets</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {topIssues.length === 0
                    ? <p className="text-center text-[#aaa] text-[13px] py-10">Sin datos aún</p>
                    : <ChartContainer config={chartConfigIssues} className="w-full h-[260px]">
                        <BarChart data={topIssues} layout="vertical" margin={{ top: 0, right: 20, left: 30, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                          <XAxis type="number" stroke="#bbb" fontSize={11} tickLine={false} axisLine={false} />
                          <YAxis dataKey="category" type="category" stroke="#666" fontSize={11} tickLine={false} axisLine={false} width={90} />
                          <ChartTooltip cursor={{ fill: '#f5f5f5' }} content={<ChartTooltipContent hideLabel />} />
                          <Bar dataKey="count" fill="#D32F2F" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                      </ChartContainer>
                  }
                </CardContent>
              </Card>

            </div>

            {/* ── GRÁFICOS FILA 2: Área empresa + Tipo requerimiento ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">

              <Card className="bg-white border-[#ebebeb] rounded-2xl shadow-sm overflow-hidden">
                <CardHeader className="border-b border-[#f5f5f5] px-6 py-5">
                  <CardTitle className="text-[15px] font-semibold text-[#1a1a1a]">Tickets por Área de Empresa</CardTitle>
                  <CardDescription className="text-[13px] text-[#888] mt-0.5">Volumen según el área que genera la solicitud</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {deptDist.length === 0
                    ? <p className="text-center text-[#aaa] text-[13px] py-10">Sin datos aún</p>
                    : <ChartContainer config={chartConfigDept} className="w-full h-[220px]">
                        <BarChart data={deptDist} layout="vertical" margin={{ top: 0, right: 20, left: 50, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                          <XAxis type="number" stroke="#bbb" fontSize={11} tickLine={false} axisLine={false} />
                          <YAxis dataKey="dept" type="category" stroke="#666" fontSize={11} tickLine={false} axisLine={false} width={80} />
                          <ChartTooltip cursor={{ fill: '#f0f5ff' }} content={<ChartTooltipContent hideLabel />} />
                          <Bar dataKey="tickets" radius={[0, 4, 4, 0]} barSize={20}>
                            {deptDist.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                          </Bar>
                        </BarChart>
                      </ChartContainer>
                  }
                </CardContent>
              </Card>

              <Card className="bg-white border-[#ebebeb] rounded-2xl shadow-sm overflow-hidden">
                <CardHeader className="border-b border-[#f5f5f5] px-6 py-5">
                  <CardTitle className="text-[15px] font-semibold text-[#1a1a1a]">Tipo de Requerimiento</CardTitle>
                  <CardDescription className="text-[13px] text-[#888] mt-0.5">Clasificación de las solicitudes recibidas</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {reqTypeDist.length === 0
                    ? <p className="text-center text-[#aaa] text-[13px] py-10">Sin datos aún</p>
                    : <ChartContainer config={chartConfigReqType} className="w-full h-[220px]">
                        <BarChart data={reqTypeDist} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                          <XAxis type="number" stroke="#bbb" fontSize={11} tickLine={false} axisLine={false} />
                          <YAxis dataKey="type" type="category" stroke="#666" fontSize={10} tickLine={false} axisLine={false} width={130} />
                          <ChartTooltip cursor={{ fill: '#fff8f0' }} content={<ChartTooltipContent hideLabel />} />
                          <Bar dataKey="count" fill="#F57C00" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                      </ChartContainer>
                  }
                </CardContent>
              </Card>

            </div>

            {/* ── FILA INFERIOR: Críticos + Movimientos ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto pb-10">

              <Card className="bg-white border-[#ebebeb] rounded-2xl shadow-sm overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between border-b border-[#f5f5f5] px-6 py-5">
                  <div>
                    <CardTitle className="text-[15px] font-semibold text-[#1a1a1a] flex items-center gap-2">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#D32F2F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                      Atención Crítica Requerida
                    </CardTitle>
                    <CardDescription className="text-[13px] text-[#888] mt-0.5">Tickets de alta urgencia sin resolver</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-left">
                    <thead className="bg-[#fafafa] border-b border-[#ebebeb]">
                      <tr>
                        <th className="px-5 py-3 text-[11px] font-semibold text-[#aaa] uppercase tracking-wide">ID</th>
                        <th className="px-5 py-3 text-[11px] font-semibold text-[#aaa] uppercase tracking-wide">Área</th>
                        <th className="px-5 py-3 text-[11px] font-semibold text-[#aaa] uppercase tracking-wide">Espera</th>
                        <th className="px-5 py-3 text-[11px] font-semibold text-[#aaa] uppercase tracking-wide">Asignado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {criticalTickets.length === 0
                        ? <tr><td colSpan={4} className="px-5 py-8 text-center text-[#aaa] text-[13px]">Sin tickets críticos activos</td></tr>
                        : criticalTickets.map(ticket => (
                          <tr key={ticket.id} className="border-b border-[#f5f5f5] last:border-0 hover:bg-[#fafafa] transition-colors group">
                            <td className="px-5 py-3 font-mono text-[13px] font-semibold text-[#1a1a1a] group-hover:text-[#D32F2F] transition-colors">{ticket.id}</td>
                            <td className="px-5 py-3 text-[13px] text-[#666]">{ticket.area}</td>
                            <td className="px-5 py-3">
                              <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#D32F2F] bg-[#fff5f5] border border-[#D32F2F]/20 px-2 py-0.5 rounded-md">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#D32F2F] animate-pulse" />
                                {ticket.waitTime}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-[12px] text-[#888]">{ticket.assignee}</td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              <Card className="bg-white border-[#ebebeb] rounded-2xl shadow-sm overflow-hidden">
                <CardHeader className="border-b border-[#f5f5f5] px-6 py-5">
                  <CardTitle className="text-[15px] font-semibold text-[#1a1a1a]">Registro de Movimientos</CardTitle>
                  <CardDescription className="text-[13px] text-[#888] mt-0.5">Últimos cambios de estado en el pipeline</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {movements.length === 0
                    ? <p className="px-6 py-8 text-center text-[#aaa] text-[13px]">Sin movimientos registrados aún</p>
                    : <div className="divide-y divide-[#f5f5f5] max-h-[300px] overflow-y-auto">
                        {movements.map((m, idx) => (
                          <div key={idx} className="flex items-start gap-3 px-6 py-3.5 hover:bg-[#fafafa] transition-colors">
                            <div className="w-2 h-2 rounded-full bg-[#D32F2F] mt-1.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-[12px] font-semibold text-[#1a1a1a]">{m.ticket_id}</span>
                                <span className="text-[11px] text-[#aaa]">{m.de}</span>
                                <svg viewBox="0 0 24 24" fill="none" stroke="#D32F2F" strokeWidth="2" className="w-3 h-3"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                                <span className="text-[12px] font-semibold text-[#D32F2F]">{m.a}</span>
                              </div>
                              <div className="text-[11px] text-[#aaa] mt-0.5">{m.responsable}{m.area ? ` · ${m.area}` : ''}</div>
                            </div>
                            <span className="text-[11px] text-[#ccc] whitespace-nowrap">{horasDesde(m.timestamp)}</span>
                          </div>
                        ))}
                      </div>
                  }
                </CardContent>
              </Card>

            </div>

          </>}
        </main>
      </div>
    </div>
  );
}
