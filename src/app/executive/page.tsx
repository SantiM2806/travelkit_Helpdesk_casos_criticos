'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

// --- INTERFACES & MOCK DATA ---

interface KPI {
  title: string;
  value: string | number;
  description: string;
  trend?: string;
  trendUp?: boolean;
}

interface AreaDistribution {
  area: string;
  tickets: number;
  fill: string;
}

interface TopIssue {
  category: string;
  count: number;
}

interface CriticalTicket {
  id: string;
  area: string;
  waitTime: string;
  assignee: string;
}

interface StrategicProject {
  name: string;
  status: 'Operativo' | 'Advertencia' | 'Crítico';
  description: string;
}

const mockKPIs: KPI[] = [
  { title: "SLA Promedio de Resolución", value: "2.4 hrs", description: "-15% vs mes anterior", trend: "-15%", trendUp: true },
  { title: "Total de Tickets Abiertos", value: 14, description: "3 críticos", trend: "+2", trendUp: false },
  { title: "Tasa de Resolución Semanal", value: "85%", description: "Objetivo: 90%", trend: "-5%", trendUp: false },
  { title: "Tiempo 1ra Respuesta", value: "45 min", description: "Mejora del 10%", trend: "-5m", trendUp: true }
];

const mockAreaDistribution: AreaDistribution[] = [
  { area: "Ventas", tickets: 45, fill: "#F57C00" },
  { area: "Operaciones", tickets: 30, fill: "#1976D2" },
  { area: "Marketing", tickets: 15, fill: "#388E3C" },
  { area: "Finanzas", tickets: 10, fill: "#7B1FA2" },
];

const mockTopIssues: TopIssue[] = [
  { category: "Acceso y Cuentas", count: 32 },
  { category: "Fallas Hardware", count: 24 },
  { category: "Errores Software", count: 18 },
  { category: "Conectividad Red", count: 14 },
  { category: "Solicitud Equipos", count: 9 },
];

const mockCriticalTickets: CriticalTicket[] = [
  { id: "TK-0842", area: "Operaciones", waitTime: "48h", assignee: "Juan Pérez" },
  { id: "TK-0850", area: "Finanzas", waitTime: "36h", assignee: "María García" },
  { id: "TK-0861", area: "Ventas", waitTime: "24h", assignee: "Sin Asignar" },
];

const mockProjects: StrategicProject[] = [
  { name: "Sincronización Bidireccional (N8N)", status: "Operativo", description: "Sincronización en tiempo real activa" },
  { name: "Integración Telegram Bot", status: "Advertencia", description: "Latencia alta en respuestas" },
  { name: "Migración a Supabase", status: "Operativo", description: "Completado y estable" },
];

const chartConfigArea = {
  ventas: { label: "Ventas", color: "#F57C00" },
  operaciones: { label: "Operaciones", color: "#1976D2" },
  marketing: { label: "Marketing", color: "#388E3C" },
  finanzas: { label: "Finanzas", color: "#7B1FA2" },
};

const chartConfigIssues = {
  count: { label: "Tickets", color: "#D32F2F" },
};

export default function ExecutiveDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1a1a1a] font-sans flex relative overflow-hidden">
      
      {/* SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-[90] transition-opacity cursor-pointer"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR DESPLEGABLE */}
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
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-[#fff5f5] text-[#D32F2F] rounded-xl text-[14px] font-medium transition-colors cursor-pointer border border-[#D32F2F]/20 shadow-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <line x1="3" y1="9" x2="21" y2="9"/>
                  <line x1="9" y1="21" x2="9" y2="9"/>
                </svg>
                Dashboard IT
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* MAIN LAYOUT */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* HEADER */}
        <header className="sticky top-0 z-[80] h-14 bg-white border-b border-[#e8e8e8] flex items-center px-4 md:px-6 gap-3 shadow-sm transition-colors duration-300">
          
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 -ml-1 rounded-md hover:bg-[#f5f5f5] text-[#666] transition-colors flex-shrink-0 cursor-pointer"
          >
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[20px] h-[20px]">
               <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
             </svg>
          </button>

          <div className="flex items-center gap-3 h-8 flex-shrink-0">
            <Image
              src="/travelkit-logo_nbtjgf-67feae5fe38949.68302424.png"
              alt="Travelkit"
              width={120}
              height={36}
              className="h-8 w-auto object-contain"
              priority
            />
            <div className="hidden sm:block w-px h-5 bg-[#e8e8e8] mx-2" />
            <div className="text-[13px] text-[#888] hidden sm:block">
              Portal de soporte interno
            </div>
          </div>
        </header>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 p-4 md:p-8 w-full space-y-8 overflow-y-auto max-h-[calc(100vh-56px)]">
          
          {/* Título de la vista */}
          <div className="flex flex-col gap-1 max-w-7xl mx-auto mb-7 sm:mb-10">
            <h1 className="text-[22px] sm:text-[28px] font-semibold text-[#1a1a1a] leading-tight">Dashboard Estratégico IT</h1>
            <p className="text-[14px] sm:text-[15px] text-[#666] leading-relaxed">Vista general de métricas, rendimiento y estado de proyectos clave.</p>
          </div>

          {/* TARJETAS SUPERIORES (KPIs) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto">
            {mockKPIs.map((kpi, idx) => (
              <Card key={idx} className="bg-white border-[#ebebeb] rounded-2xl shadow-sm transition-all duration-300 hover:border-[#D32F2F] group flex flex-col justify-between cursor-pointer overflow-hidden">
                <CardHeader className="pb-2 px-5 pt-5">
                  <CardTitle className="text-[13px] font-medium text-[#666] tracking-wide">{kpi.title}</CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <div className="text-[28px] font-semibold text-[#1a1a1a] group-hover:text-[#D32F2F] transition-colors">{kpi.value}</div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      {kpi.trend && (
                        <span className={`text-[12px] font-semibold px-2 py-1 rounded-md ${
                          kpi.trendUp 
                            ? 'bg-[#f0faf0] text-[#388E3C] border border-[#388E3C]/20' 
                            : 'bg-[#fff5f5] text-[#D32F2F] border border-[#D32F2F]/20'
                        }`}>
                          {kpi.trend}
                        </span>
                      )}
                      <p className="text-[12px] text-[#888] hidden xl:block">{kpi.description}</p>
                    </div>
                    {/* Botón Drill-down micro */}
                    <span className="text-[12px] font-semibold text-[#D32F2F] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      Detalles
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* SECCIÓN ANALÍTICA (GRÁFICOS) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
            
            {/* Gráfico de Dona */}
            <Card className="bg-white border-[#ebebeb] rounded-2xl shadow-sm flex flex-col transition-colors duration-300 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-[#f5f5f5] px-6 py-5 bg-white">
                <div className="flex flex-col gap-1">
                  <CardTitle className="text-[#1a1a1a] text-[16px] font-semibold">Distribución por Área</CardTitle>
                  <CardDescription className="text-[#666] text-[13px]">Volumen de tickets según departamento</CardDescription>
                </div>
                <button className="text-[13px] font-semibold text-[#D32F2F] hover:bg-[#fff5f5] flex items-center gap-1 transition-colors cursor-pointer px-3 py-1.5 rounded-lg border border-transparent hover:border-[#D32F2F]/20">
                  Ir a tabla
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </CardHeader>
              <CardContent className="flex-1 min-h-[300px] p-6">
                <ChartContainer config={chartConfigArea} className="w-full h-[300px]">
                    <PieChart>
                      <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                      <Pie
                        data={mockAreaDistribution}
                        dataKey="tickets"
                        nameKey="area"
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        stroke="#ffffff"
                        strokeWidth={3}
                        paddingAngle={2}
                      >
                        {mockAreaDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Barras */}
            <Card className="bg-white border-[#ebebeb] rounded-2xl shadow-sm flex flex-col transition-colors duration-300 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-[#f5f5f5] px-6 py-5 bg-white">
                <div className="flex flex-col gap-1">
                  <CardTitle className="text-[#1a1a1a] text-[16px] font-semibold">Top 5 Problemas Frecuentes</CardTitle>
                  <CardDescription className="text-[#666] text-[13px]">Categorías con mayor incidencia en la semana</CardDescription>
                </div>
                <button className="text-[13px] font-semibold text-[#D32F2F] hover:bg-[#fff5f5] flex items-center gap-1 transition-colors cursor-pointer px-3 py-1.5 rounded-lg border border-transparent hover:border-[#D32F2F]/20">
                  Ver analítica
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </CardHeader>
              <CardContent className="flex-1 min-h-[300px] p-6">
                <ChartContainer config={chartConfigIssues} className="w-full h-[300px]">
                    <BarChart
                      data={mockTopIssues}
                      layout="vertical"
                      margin={{ top: 10, right: 30, left: 40, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e8e8e8" />
                      <XAxis type="number" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis 
                        dataKey="category" 
                        type="category" 
                        stroke="#666" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <ChartTooltip cursor={{ fill: '#f5f5f5', opacity: 0.5 }} content={<ChartTooltipContent hideLabel />} />
                      <Bar dataKey="count" fill="#D32F2F" radius={[0, 4, 4, 0]} barSize={24} />
                    </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

          </div>

          {/* SECCIÓN DE ALERTAS Y PROYECTOS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto pb-10">
            
            {/* Columna 1 - Tickets Críticos */}
            <Card className="bg-white border-[#ebebeb] rounded-2xl shadow-sm transition-colors duration-300 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-[#f5f5f5] px-6 py-5 bg-white">
                <div className="flex flex-col gap-1">
                  <CardTitle className="text-[#1a1a1a] text-[16px] font-semibold flex items-center gap-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#D32F2F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    Atención Crítica Requerida
                  </CardTitle>
                  <CardDescription className="text-[#666] text-[13px]">Tickets más antiguos sin resolver</CardDescription>
                </div>
                <button className="text-[13px] font-semibold text-[#D32F2F] hover:bg-[#fff5f5] flex items-center gap-1 transition-colors cursor-pointer px-3 py-1.5 rounded-lg border border-transparent hover:border-[#D32F2F]/20">
                  Abrir Kanban
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#fafafa] border-b border-[#ebebeb]">
                      <tr>
                        <th className="px-6 py-4 text-[12px] font-semibold text-[#888] uppercase tracking-wide">ID</th>
                        <th className="px-6 py-4 text-[12px] font-semibold text-[#888] uppercase tracking-wide">Área</th>
                        <th className="px-6 py-4 text-[12px] font-semibold text-[#888] uppercase tracking-wide">Espera</th>
                        <th className="px-6 py-4 text-[12px] font-semibold text-[#888] uppercase tracking-wide text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockCriticalTickets.map((ticket, idx) => (
                        <tr key={ticket.id} className="border-b border-[#ebebeb] hover:bg-[#fafafa] transition-colors last:border-0 group cursor-pointer">
                          <td className="px-6 py-4 font-mono text-[14px] text-[#1a1a1a] font-medium group-hover:text-[#D32F2F] transition-colors">{ticket.id}</td>
                          <td className="px-6 py-4 text-[#666] text-[14px]">{ticket.area}</td>
                          <td className="px-6 py-4">
                            <span className="text-[#D32F2F] font-semibold text-[13px] flex items-center gap-1.5 bg-[#fff5f5] border border-[#D32F2F]/20 px-2.5 py-1 rounded-md w-fit">
                              <span className="w-2 h-2 rounded-full bg-[#D32F2F] animate-pulse"></span>
                              {ticket.waitTime}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-[#888] text-[13px] font-medium group-hover:text-[#D32F2F] flex items-center justify-end gap-1">
                              Revisar
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="9 18 15 12 9 6"/></svg>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Columna 2 - Monitoreo Estratégico */}
            <Card className="bg-white border-[#ebebeb] rounded-2xl shadow-sm transition-colors duration-300 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-[#f5f5f5] px-6 py-5 bg-white">
                <div className="flex flex-col gap-1">
                  <CardTitle className="text-[#1a1a1a] text-[16px] font-semibold">Monitoreo Estratégico</CardTitle>
                  <CardDescription className="text-[#666] text-[13px]">Estado de integraciones y proyectos clave</CardDescription>
                </div>
                <button className="text-[13px] font-semibold text-[#D32F2F] hover:bg-[#fff5f5] flex items-center gap-1 transition-colors cursor-pointer px-3 py-1.5 rounded-lg border border-transparent hover:border-[#D32F2F]/20">
                  Ver logs
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {mockProjects.map((project, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-[#ebebeb] bg-[#fafafa] transition-colors hover:border-[#D32F2F]/30 hover:bg-white cursor-pointer group shadow-sm">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-[15px] text-[#1a1a1a] group-hover:text-[#D32F2F] transition-colors">{project.name}</span>
                        <span className="text-[13px] text-[#666]">{project.description}</span>
                      </div>
                      <div className="flex-shrink-0">
                        {project.status === 'Operativo' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-semibold bg-[#f0faf0] text-[#388E3C] border border-[#388E3C]/20 uppercase tracking-wide">
                            <span className="w-2 h-2 rounded-full bg-[#388E3C]"></span>
                            Operativo
                          </span>
                        )}
                        {project.status === 'Advertencia' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-semibold bg-[#fff8f0] text-[#F57C00] border border-[#F57C00]/20 uppercase tracking-wide">
                            <span className="w-2 h-2 rounded-full bg-[#F57C00]"></span>
                            Advertencia
                          </span>
                        )}
                        {project.status === 'Crítico' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-semibold bg-[#fff5f5] text-[#D32F2F] border border-[#D32F2F]/20 uppercase tracking-wide">
                            <span className="w-2 h-2 rounded-full bg-[#D32F2F] animate-pulse"></span>
                            Crítico
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>
        </main>
      </div>
    </div>
  );
}
