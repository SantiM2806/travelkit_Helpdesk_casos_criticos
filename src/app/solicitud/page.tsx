'use client';

import { useState, useCallback, useRef, FormEvent } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/server';
import { uploadTicketImage, validateImageFile } from '@/lib/supabase/storage';
import { sanitize, validateEmail, validateNombre, validateDescripcion, LIMITS } from '@/features/tickets/utils/validations';

// ── Áreas de la empresa ────────────────────────────────────────────────────
const AREAS_EMPRESA = ['Operaciones', 'Facturación', 'Comercial', 'Alta gerencia'] as const;

// ── Categorías y subcategorías ─────────────────────────────────────────────
const MAIN_CATEGORIES = ['Software Propio', 'Herramientas Corporativas', 'Accesos y Redes'] as const;

const SUBCATEGORIES: Record<string, string[]> = {
  'Software Propio':          ['Cacao', 'Legacy', 'Garland'],
  'Herramientas Corporativas':['Microsoft Teams', 'Correo Electrónico', 'Licenciamientos/Otros'],
  'Accesos y Redes':          ['Página web bloqueada', 'Reseteo de contraseña'],
};

// ── Tipos de requerimiento ─────────────────────────────────────────────────
const TIPOS_REQUERIMIENTO = [
  'Reporte de Falla / Error',
  'Solicitud de Acceso',
  'Consulta General',
  'Solicitud de Equipos',
];

// ── Urgencia ───────────────────────────────────────────────────────────────
const URGENCIAS = [
  { value: 'Alta',  label: 'Alta',  hint: 'No puedo trabajar',              activeClass: 'border-[#D32F2F] bg-[#fff5f5]', hoverClass: 'hover:border-[#D32F2F] hover:bg-[#fff5f5]', textClass: 'text-[#D32F2F]' },
  { value: 'Media', label: 'Media', hint: 'Me afecta pero puedo continuar', activeClass: 'border-[#F57C00] bg-[#fff8f0]', hoverClass: 'hover:border-[#F57C00] hover:bg-[#fff8f0]', textClass: 'text-[#F57C00]' },
  { value: 'Baja',  label: 'Baja',  hint: 'Cuando puedan',                  activeClass: 'border-[#388E3C] bg-[#f0faf0]', hoverClass: 'hover:border-[#388E3C] hover:bg-[#f0faf0]', textClass: 'text-[#388E3C]' },
];

// ── Generador de ticket ID ─────────────────────────────────────────────────
async function generarTicketId(): Promise<string> {
  const { data } = await supabase.from('tickets').select('ticket_id').order('ticket_id', { ascending: false }).limit(1);
  const last = data?.[0]?.ticket_id ?? 'TK-0000';
  return `TK-${String(parseInt(last.replace('TK-', ''), 10) + 1).padStart(4, '0')}`;
}

type Step = 'form' | 'success';

export default function SolicitudPage() {
  // ── Flujo ──────────────────────────────────────────────────────────────
  const [step,     setStep]     = useState<Step>('form');
  const [ticketId, setTicketId] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  // ── Campos del formulario ──────────────────────────────────────────────
  const [nombre,            setNombre]            = useState('');
  const [email,             setEmail]             = useState('');
  const [departamento,      setDepartamento]      = useState('');
  const [mainCategoria,     setMainCategoria]     = useState('');
  const [subCategoria,      setSubCategoria]      = useState('');
  const [tipoRequerimiento, setTipoRequerimiento] = useState('');
  const [urgencia,          setUrgencia]          = useState('');
  const [asunto,            setAsunto]            = useState('');
  const [descripcion,       setDescripcion]       = useState('');

  // ── Imagen ─────────────────────────────────────────────────────────────
  const [imageFile,    setImageFile]    = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragOver,     setDragOver]     = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // La evidencia es requerida solo si el tipo es "Reporte de Falla / Error"
  const evidenciaRequerida = tipoRequerimiento === 'Reporte de Falla / Error';

  // ── Cambio de categoría principal → resetea subcategoría ───────────────
  function handleMainCategoria(cat: string) {
    setMainCategoria(cat);
    setSubCategoria('');
  }

  // ── Manejo de imagen ───────────────────────────────────────────────────
  const handleFile = useCallback((file: File) => {
    const err = validateImageFile(file);
    if (err) { setError(err); return; }
    setError('');
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = e => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function removeImage() { setImageFile(null); setImagePreview(null); }

  // ── Submit ─────────────────────────────────────────────────────────────
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // Validaciones
    const emailErr  = validateEmail(email);
    const nombreErr = validateNombre(nombre);
    const descErr   = validateDescripcion(descripcion);

    if (emailErr || nombreErr || descErr) {
      setError(emailErr ?? nombreErr ?? descErr ?? '');
      return;
    }
    if (!mainCategoria)     { setError('Selecciona una categoría principal.');      return; }
    if (!subCategoria)      { setError('Selecciona una subcategoría.');             return; }
    if (!tipoRequerimiento) { setError('Selecciona el tipo de requerimiento.');     return; }
    if (!urgencia)          { setError('Selecciona el nivel de urgencia.');         return; }
    if (!asunto.trim())     { setError('Escribe un asunto para tu solicitud.');     return; }
    if (!departamento.trim()){ setError('Selecciona el área a la que perteneces.');   return; }
    if (evidenciaRequerida && !imageFile) {
      setError('Para reportes de falla es obligatorio adjuntar una evidencia (imagen).');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const ticket_id = await generarTicketId();

      let attachment_url: string | null = null;
      if (imageFile) {
        attachment_url = await uploadTicketImage(ticket_id, imageFile);
      }

      const payload = {
        ticket_id,
        timestamp:     new Date().toISOString(),
        full_name:     sanitize(nombre),
        email:         sanitize(email).toLowerCase(),
        department:    sanitize(departamento),
        main_category: mainCategoria,
        sub_category:  subCategoria,
        request_type:  tipoRequerimiento,
        urgency:       urgencia,
        subject:       sanitize(asunto),
        description:   sanitize(descripcion),
        attachment_url,
        estado:        'Abierto',
        responsable:   null,
        // Mantiene compatibilidad con la tabla tickets existente
        categoria:     mainCategoria,
        prioridad:     urgencia,
        descripcion:   `[${sanitize(nombre)} · ${sanitize(departamento)}] ${sanitize(asunto)} — ${sanitize(descripcion)}`,
      };

      console.log('📋 Payload solicitud:', payload);

      const { error: dbError } = await supabase.from('tickets').insert({
        // Columnas nuevas (campos propios del formulario)
        ticket_id:     payload.ticket_id,
        timestamp:     payload.timestamp,
        full_name:     payload.full_name,
        email:         payload.email,
        department:    payload.department,
        main_category: payload.main_category,
        sub_category:  payload.sub_category,
        request_type:  payload.request_type,
        urgency:       payload.urgency,
        subject:       payload.subject,
        description:   payload.description,
        attachment_url: payload.attachment_url,
        estado:        payload.estado,
        responsable:   payload.responsable,
        // Columnas legacy (compatibilidad con el pipeline existente)
        categoria:     payload.main_category,
        prioridad:     payload.urgency,
        descripcion:   `[${payload.full_name}] ${payload.subject}`,
        imagen_url:    payload.attachment_url,
      });

      if (dbError) {
        console.error('❌ Supabase insert error:', dbError);
        throw dbError;
      }
      setTicketId(ticket_id);
      setStep('success');

      // Enviar correo de confirmación (no bloquea el flujo si falla)
      fetch('/api/send-ticket-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:     sanitize(email).toLowerCase(),
          full_name: sanitize(nombre),
          ticket_id,
          urgency,
          subject:   sanitize(asunto),
        }),
      }).catch(() => null);
    } catch (err) {
      console.error('❌ Error al registrar solicitud:', err);
      setError('No pudimos registrar tu solicitud. Intenta de nuevo o escríbenos al canal de IT.');
    } finally {
      setLoading(false);
    }
  }

  // ── Reset ──────────────────────────────────────────────────────────────
  function resetForm() {
    setStep('form');
    setNombre(''); setEmail(''); setDepartamento('');
    setMainCategoria(''); setSubCategoria('');
    setTipoRequerimiento(''); setUrgencia('');
    setAsunto(''); setDescripcion('');
    setImageFile(null); setImagePreview(null);
    setTicketId(''); setError('');
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f7f7f7] font-sans" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>

      {/* Header */}
      <header className="bg-white border-b border-[#e8e8e8]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Image src="/travelkit-logo_nbtjgf-67feae5fe38949.68302424.png" alt="Travelkit" width={130} height={40} className="h-9 w-auto object-contain" priority />
          <span className="text-[13px] text-[#888] hidden sm:block">Portal de soporte interno</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 sm:py-12">

        {step === 'form' ? (
          <>
            {/* Título */}
            <div className="text-center mb-7 sm:mb-10">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#D32F2F] mb-4 sm:mb-5 shadow-md">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-6 sm:h-6">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <h1 className="text-[22px] sm:text-[28px] font-semibold text-[#1a1a1a] leading-tight mb-2">
                ¿Necesitas ayuda de IT?
              </h1>
              <p className="text-[14px] sm:text-[15px] text-[#666] max-w-md mx-auto leading-relaxed">
                Cuéntanos tu problema y el equipo de tecnología lo atenderá lo antes posible.
              </p>
            </div>

            {/* Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#ebebeb] overflow-hidden">
              <div className="h-1 bg-[#D32F2F]" />

              <form onSubmit={handleSubmit} className="p-5 sm:p-8 flex flex-col gap-5 sm:gap-6">

                {/* Nombre + Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-medium text-[#333] tracking-wide">
                      Nombre completo <span className="text-[#D32F2F]">*</span>
                    </label>
                    <input
                      type="text" value={nombre} onChange={e => setNombre(e.target.value)}
                      placeholder="Ej. María García" required maxLength={LIMITS.nombre}
                      className="px-4 py-3 bg-[#fafafa] border border-[#ddd] rounded-xl text-[14px] text-[#1a1a1a] placeholder:text-[#bbb] outline-none transition-all duration-150 focus:border-[#D32F2F] focus:bg-white focus:shadow-[0_0_0_3px_rgba(211,47,47,0.08)]"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-medium text-[#333] tracking-wide">
                      Correo corporativo <span className="text-[#D32F2F]">*</span>
                    </label>
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="nombre@travelkit.co" required
                      className="px-4 py-3 bg-[#fafafa] border border-[#ddd] rounded-xl text-[14px] text-[#1a1a1a] placeholder:text-[#bbb] outline-none transition-all duration-150 focus:border-[#D32F2F] focus:bg-white focus:shadow-[0_0_0_3px_rgba(211,47,47,0.08)]"
                    />
                  </div>
                </div>

                {/* Área */}
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-medium text-[#333] tracking-wide">
                    Área <span className="text-[#D32F2F]">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AREAS_EMPRESA.map(a => (
                      <button
                        key={a} type="button" onClick={() => setDepartamento(a)}
                        className={`px-4 py-2 rounded-full text-[13px] font-medium border transition-all duration-150 cursor-pointer ${
                          departamento === a
                            ? 'bg-[#D32F2F] border-[#D32F2F] text-white shadow-sm'
                            : 'bg-white border-[#ddd] text-[#555] hover:border-[#D32F2F] hover:text-[#D32F2F]'
                        }`}
                      >{a}</button>
                    ))}
                  </div>
                </div>

                {/* Categoría Principal */}
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-medium text-[#333] tracking-wide">
                    Categoría principal <span className="text-[#D32F2F]">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {MAIN_CATEGORIES.map(c => (
                      <button
                        key={c} type="button" onClick={() => handleMainCategoria(c)}
                        className={`px-4 py-2 rounded-full text-[13px] font-medium border transition-all duration-150 cursor-pointer ${
                          mainCategoria === c
                            ? 'bg-[#D32F2F] border-[#D32F2F] text-white shadow-sm'
                            : 'bg-white border-[#ddd] text-[#555] hover:border-[#D32F2F] hover:text-[#D32F2F]'
                        }`}
                      >{c}</button>
                    ))}
                  </div>
                </div>

                {/* Subcategoría — aparece solo cuando hay categoría seleccionada */}
                {mainCategoria && (
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-medium text-[#333] tracking-wide">
                      Subcategoría <span className="text-[#D32F2F]">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {SUBCATEGORIES[mainCategoria].map(s => (
                        <button
                          key={s} type="button" onClick={() => setSubCategoria(s)}
                          className={`px-4 py-2 rounded-full text-[13px] font-medium border transition-all duration-150 cursor-pointer ${
                            subCategoria === s
                              ? 'bg-[#D32F2F] border-[#D32F2F] text-white shadow-sm'
                              : 'bg-white border-[#ddd] text-[#555] hover:border-[#D32F2F] hover:text-[#D32F2F]'
                          }`}
                        >{s}</button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tipo de Requerimiento */}
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-medium text-[#333] tracking-wide">
                    Tipo de requerimiento <span className="text-[#D32F2F]">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TIPOS_REQUERIMIENTO.map(t => (
                      <button
                        key={t} type="button" onClick={() => setTipoRequerimiento(t)}
                        className={`px-4 py-2 rounded-full text-[13px] font-medium border transition-all duration-150 cursor-pointer ${
                          tipoRequerimiento === t
                            ? 'bg-[#D32F2F] border-[#D32F2F] text-white shadow-sm'
                            : 'bg-white border-[#ddd] text-[#555] hover:border-[#D32F2F] hover:text-[#D32F2F]'
                        }`}
                      >{t}</button>
                    ))}
                  </div>
                </div>

                {/* Urgencia */}
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-medium text-[#333] tracking-wide">
                    ¿Qué tan urgente es? <span className="text-[#D32F2F]">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {URGENCIAS.map(u => (
                      <button
                        key={u.value} type="button" onClick={() => setUrgencia(u.value)}
                        className={`flex flex-col items-center gap-1 px-3 py-3.5 rounded-xl border text-center transition-all duration-150 cursor-pointer ${
                          urgencia === u.value
                            ? `${u.activeClass} shadow-sm`
                            : `border-[#ddd] bg-white ${u.hoverClass}`
                        }`}
                      >
                        <span className={`text-[13px] font-semibold ${urgencia === u.value ? u.textClass : 'text-[#333]'}`}>{u.label}</span>
                        <span className="text-[11px] text-[#999] leading-tight">{u.hint}</span>
                      </button>
                    ))}
                  </div>

                  {/* Alerta urgencia Alta */}
                  {urgencia === 'Alta' && (
                    <div className="flex items-start gap-3 bg-[#fff8f0] border border-[#F57C00]/40 rounded-xl px-4 py-3 mt-1">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#F57C00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mt-0.5 flex-shrink-0">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                      <p className="text-[13px] text-[#c45c00] leading-relaxed">
                        ⚠️ Nota: La urgencia ALTA está reservada estrictamente para incidentes que tengan impacto directo en la emisión de vouchers o en la operativa de facturación.
                      </p>
                    </div>
                  )}
                </div>

                {/* Asunto */}
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-medium text-[#333] tracking-wide">
                    Asunto <span className="text-[#D32F2F]">*</span>
                  </label>
                  <input
                    type="text" value={asunto} onChange={e => setAsunto(e.target.value)}
                    placeholder="Resumen breve del problema" required maxLength={120}
                    className="px-4 py-3 bg-[#fafafa] border border-[#ddd] rounded-xl text-[14px] text-[#1a1a1a] placeholder:text-[#bbb] outline-none transition-all duration-150 focus:border-[#D32F2F] focus:bg-white focus:shadow-[0_0_0_3px_rgba(211,47,47,0.08)]"
                  />
                </div>

                {/* Descripción */}
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-medium text-[#333] tracking-wide">
                    Describe tu problema <span className="text-[#D32F2F]">*</span>
                  </label>
                  <textarea
                    value={descripcion} onChange={e => setDescripcion(e.target.value)}
                    rows={4} placeholder="Cuéntanos con detalle qué está pasando, desde cuándo y qué ya intentaste…"
                    required maxLength={LIMITS.descripcion}
                    className="px-4 py-3 bg-[#fafafa] border border-[#ddd] rounded-xl text-[14px] text-[#1a1a1a] placeholder:text-[#bbb] outline-none resize-none transition-all duration-150 focus:border-[#D32F2F] focus:bg-white focus:shadow-[0_0_0_3px_rgba(211,47,47,0.08)] leading-relaxed"
                  />
                  <span className="text-right text-[11px] text-[#bbb]">{descripcion.length} caracteres</span>
                </div>

                {/* Imagen / Evidencia */}
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-medium text-[#333] tracking-wide">
                    Evidencia adjunta{' '}
                    {evidenciaRequerida
                      ? <span className="text-[#D32F2F]">* (obligatorio para reportes de falla)</span>
                      : <span className="text-[#aaa] font-normal">(opcional · máx. 5 MB)</span>
                    }
                  </label>

                  {imagePreview ? (
                    <div className="flex items-center gap-4 px-4 py-3 bg-[#fafafa] border border-[#ddd] rounded-xl">
                      <img src={imagePreview} alt="preview" className="w-14 h-14 object-cover rounded-lg flex-shrink-0 border border-[#eee]" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-[#333] font-medium truncate">{imageFile?.name}</p>
                        <p className="text-[12px] text-[#999] mt-0.5">{imageFile ? (imageFile.size / 1024).toFixed(0) + ' KB' : ''}</p>
                      </div>
                      <button type="button" onClick={removeImage} className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#eee] text-[#aaa] hover:text-[#D32F2F] hover:border-[#D32F2F] transition-colors flex-shrink-0 cursor-pointer">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div
                      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={onDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex flex-col items-center gap-2 px-6 py-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-150 ${
                        dragOver ? 'border-[#D32F2F] bg-[#fff5f5]'
                        : evidenciaRequerida ? 'border-[#F57C00] hover:border-[#D32F2F] hover:bg-[#fafafa]'
                        : 'border-[#ddd] hover:border-[#D32F2F] hover:bg-[#fafafa]'
                      }`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke={dragOver ? '#D32F2F' : evidenciaRequerida ? '#F57C00' : '#bbb'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 transition-colors">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                      <div className="text-center">
                        <p className="text-[13px] text-[#666]">
                          Arrastra una imagen aquí o{' '}
                          <span className="text-[#D32F2F] font-medium underline">selecciona un archivo</span>
                        </p>
                        <p className="text-[12px] text-[#bbb] mt-0.5">JPG · PNG · GIF · WEBP</p>
                      </div>
                    </div>
                  )}

                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={onFileInput} className="hidden" />
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-start gap-3 bg-[#fff5f5] border border-[#fcc] rounded-xl px-4 py-3">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#D32F2F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mt-0.5 flex-shrink-0">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <p className="text-[13px] text-[#c00]">{error}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2.5 py-4 bg-[#D32F2F] hover:bg-[#b71c1c] active:bg-[#9a1616] text-white font-semibold text-[15px] rounded-xl transition-all duration-150 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                      </svg>
                      {imageFile ? 'Subiendo imagen…' : 'Enviando solicitud…'}
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                      Enviar solicitud
                    </>
                  )}
                </button>

                <p className="text-center text-[12px] text-[#aaa] -mt-2">
                  Tu solicitud llegará directamente al equipo de IT y será atendida a la brevedad.
                </p>
              </form>
            </div>
          </>
        ) : (
          /* Pantalla de éxito */
          <div className="text-center animate-fade-up">
            <div className="bg-white rounded-2xl shadow-sm border border-[#ebebeb] overflow-hidden max-w-md mx-auto">
              <div className="h-1 bg-[#D32F2F]" />
              <div className="p-10 flex flex-col items-center gap-5">
                <div className="w-16 h-16 rounded-full bg-[#fff5f5] border-2 border-[#D32F2F] flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#D32F2F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-[22px] font-semibold text-[#1a1a1a] mb-2">¡Solicitud enviada!</h2>
                  <p className="text-[14px] text-[#666] leading-relaxed">Tu ticket fue registrado con el número</p>
                  <div className="inline-block mt-3 px-5 py-2 bg-[#fff5f5] border border-[#fcc] rounded-full">
                    <span className="font-mono font-semibold text-[#D32F2F] text-[16px] tracking-wider">{ticketId}</span>
                  </div>
                </div>
                <p className="text-[13px] text-[#888] leading-relaxed max-w-xs">
                  El equipo de IT revisará tu caso y te contactará por correo a la brevedad.
                </p>
                <button onClick={resetForm} className="mt-2 px-6 py-2.5 border border-[#D32F2F] text-[#D32F2F] font-medium text-[14px] rounded-xl hover:bg-[#fff5f5] transition-colors duration-150 cursor-pointer">
                  Enviar otra solicitud
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="text-center py-8 mt-4">
        <p className="text-[12px] text-[#bbb]">Travelkit Colombia · Soporte IT interno · {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
