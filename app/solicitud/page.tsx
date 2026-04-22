'use client';

import { useState, FormEvent, useRef, useCallback } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { uploadTicketImage, validateImageFile } from '@/lib/storage';
import {
  sanitize,
  validateEmail,
  validateNombre,
  validateDescripcion,
  validateCategoria,
  validatePrioridad,
  ALLOWED_CATEGORIAS,
  LIMITS,
} from '@/lib/validation';

const CATEGORIAS = ALLOWED_CATEGORIAS;
const PRIORIDADES = [
  {
    value: 'Alta',  label: 'Alta',  hint: 'No puedo trabajar',
    activeClass: 'border-[#D32F2F] bg-[#fff5f5]',
    hoverClass:  'hover:border-[#D32F2F] hover:bg-[#fff5f5]',
    textClass:   'text-[#D32F2F]',
  },
  {
    value: 'Media', label: 'Media', hint: 'Me afecta pero puedo continuar',
    activeClass: 'border-[#F57C00] bg-[#fff8f0]',
    hoverClass:  'hover:border-[#F57C00] hover:bg-[#fff8f0]',
    textClass:   'text-[#F57C00]',
  },
  {
    value: 'Baja',  label: 'Baja',  hint: 'Cuando puedan',
    activeClass: 'border-[#388E3C] bg-[#f0faf0]',
    hoverClass:  'hover:border-[#388E3C] hover:bg-[#f0faf0]',
    textClass:   'text-[#388E3C]',
  },
];

async function generarTicketId(): Promise<string> {
  const { data } = await supabase
    .from('tickets')
    .select('ticket_id')
    .order('ticket_id', { ascending: false })
    .limit(1);
  const last = data?.[0]?.ticket_id ?? 'TK-0000';
  const num = parseInt(last.replace('TK-', ''), 10);
  return `TK-${String(num + 1).padStart(4, '0')}`;
}

type Step = 'form' | 'success';

export default function SolicitudPage() {
  const [step,        setStep]        = useState<Step>('form');
  const [ticketId,    setTicketId]    = useState('');
  const [nombre,      setNombre]      = useState('');
  const [email,       setEmail]       = useState('');
  const [categoria,   setCategoria]   = useState('');
  const [prioridad,   setPrioridad]   = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imageFile,   setImageFile]   = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragOver,    setDragOver]    = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const emailErr    = validateEmail(email);
    const nombreErr   = validateNombre(nombre);
    const descErr     = validateDescripcion(descripcion);
    const categoriaErr = validateCategoria(categoria);
    const prioridadErr = validatePrioridad(prioridad);
    const firstErr = emailErr ?? nombreErr ?? descErr ?? categoriaErr ?? prioridadErr;
    if (firstErr) { setError(firstErr); return; }

    setError('');
    setLoading(true);

    try {
      const ticket_id = await generarTicketId();

      let imagen_url: string | null = null;
      if (imageFile) {
        imagen_url = await uploadTicketImage(ticket_id, imageFile);
      }

      const { error: dbError } = await supabase.from('tickets').insert({
        ticket_id,
        timestamp:   new Date().toISOString(),
        email:       sanitize(email).toLowerCase(),
        categoria,
        prioridad,
        descripcion: `[${sanitize(nombre)}] ${sanitize(descripcion)}`,
        estado:      'Abierto',
        responsable: null,
        imagen_url,
      });

      if (dbError) throw dbError;
      setTicketId(ticket_id);
      setStep('success');
    } catch {
      setError('No pudimos registrar tu solicitud. Intenta de nuevo o escríbenos al canal de IT.');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setStep('form');
    setNombre(''); setEmail(''); setCategoria('');
    setPrioridad(''); setDescripcion('');
    setImageFile(null); setImagePreview(null);
    setTicketId('');
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] font-sans" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>

      {/* Header de marca */}
      <header className="bg-white border-b border-[#e8e8e8]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Image
            src="/travelkit-logo_nbtjgf-67feae5fe38949.68302424.png"
            alt="Travelkit"
            width={130}
            height={40}
            className="h-9 w-auto object-contain"
            priority
          />
          <span className="text-[13px] text-[#888] hidden sm:block">
            Portal de soporte interno
          </span>
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

            {/* Card formulario */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#ebebeb] overflow-hidden">

              {/* Barra roja superior */}
              <div className="h-1 bg-[#D32F2F]" />

              <form onSubmit={handleSubmit} className="p-5 sm:p-8 flex flex-col gap-5 sm:gap-6">

                {/* Nombre + Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-medium text-[#333] tracking-wide">
                      Nombre completo <span className="text-[#D32F2F]">*</span>
                    </label>
                    <input
                      type="text"
                      value={nombre}
                      onChange={e => setNombre(e.target.value)}
                      placeholder="Ej. María García"
                      required
                      maxLength={LIMITS.nombre}
                      className="px-4 py-3 bg-[#fafafa] border border-[#ddd] rounded-xl text-[14px] text-[#1a1a1a] placeholder:text-[#bbb] outline-none transition-all duration-150 focus:border-[#D32F2F] focus:bg-white focus:shadow-[0_0_0_3px_rgba(211,47,47,0.08)]"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-medium text-[#333] tracking-wide">
                      Correo corporativo <span className="text-[#D32F2F]">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="nombre@travelkit.co"
                      required
                      className="px-4 py-3 bg-[#fafafa] border border-[#ddd] rounded-xl text-[14px] text-[#1a1a1a] placeholder:text-[#bbb] outline-none transition-all duration-150 focus:border-[#D32F2F] focus:bg-white focus:shadow-[0_0_0_3px_rgba(211,47,47,0.08)]"
                    />
                  </div>
                </div>

                {/* Categoría */}
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-medium text-[#333] tracking-wide">
                    ¿De qué es el problema? <span className="text-[#D32F2F]">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIAS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCategoria(c)}
                        className={`px-4 py-2 rounded-full text-[13px] font-medium border transition-all duration-150 cursor-pointer ${
                          categoria === c
                            ? 'bg-[#D32F2F] border-[#D32F2F] text-white shadow-sm'
                            : 'bg-white border-[#ddd] text-[#555] hover:border-[#D32F2F] hover:text-[#D32F2F]'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prioridad */}
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-medium text-[#333] tracking-wide">
                    ¿Qué tan urgente es? <span className="text-[#D32F2F]">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {PRIORIDADES.map(p => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setPrioridad(p.value)}
                        className={`flex flex-col items-center gap-1 px-3 py-3.5 rounded-xl border text-center transition-all duration-150 cursor-pointer ${
                          prioridad === p.value
                            ? `${p.activeClass} shadow-sm`
                            : `border-[#ddd] bg-white ${p.hoverClass}`
                        }`}
                      >
                        <span className={`text-[13px] font-semibold ${
                          prioridad === p.value ? p.textClass : 'text-[#333]'
                        }`}>{p.label}</span>
                        <span className="text-[11px] text-[#999] leading-tight">{p.hint}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Descripción */}
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-medium text-[#333] tracking-wide">
                    Describe tu problema <span className="text-[#D32F2F]">*</span>
                  </label>
                  <textarea
                    value={descripcion}
                    onChange={e => setDescripcion(e.target.value)}
                    rows={4}
                    placeholder="Cuéntanos con detalle qué está pasando, desde cuándo y qué ya intentaste…"
                    required
                    maxLength={LIMITS.descripcion}
                    className="px-4 py-3 bg-[#fafafa] border border-[#ddd] rounded-xl text-[14px] text-[#1a1a1a] placeholder:text-[#bbb] outline-none resize-none transition-all duration-150 focus:border-[#D32F2F] focus:bg-white focus:shadow-[0_0_0_3px_rgba(211,47,47,0.08)] leading-relaxed"
                  />
                  <span className="text-right text-[11px] text-[#bbb]">{descripcion.length} caracteres</span>
                </div>

                {/* Imagen adjunta */}
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-medium text-[#333] tracking-wide">
                    Adjuntar imagen{' '}
                    <span className="text-[#aaa] font-normal">(opcional · máx. 5 MB)</span>
                  </label>

                  {imagePreview ? (
                    /* Preview */
                    <div className="flex items-center gap-4 px-4 py-3 bg-[#fafafa] border border-[#ddd] rounded-xl">
                      <img
                        src={imagePreview}
                        alt="preview"
                        className="w-14 h-14 object-cover rounded-lg flex-shrink-0 border border-[#eee]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-[#333] font-medium truncate">{imageFile?.name}</p>
                        <p className="text-[12px] text-[#999] mt-0.5">
                          {imageFile ? (imageFile.size / 1024).toFixed(0) + ' KB' : ''}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#eee] text-[#aaa] hover:text-[#D32F2F] hover:border-[#D32F2F] transition-colors flex-shrink-0 cursor-pointer"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  ) : (
                    /* Dropzone */
                    <div
                      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={onDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex flex-col items-center gap-2 px-6 py-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-150 ${
                        dragOver
                          ? 'border-[#D32F2F] bg-[#fff5f5]'
                          : 'border-[#ddd] hover:border-[#D32F2F] hover:bg-[#fafafa]'
                      }`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke={dragOver ? '#D32F2F' : '#bbb'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 transition-colors">
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

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={onFileInput}
                    className="hidden"
                  />
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
                  type="submit"
                  disabled={loading}
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
          /* ── Pantalla de éxito ── */
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
                  <h2 className="text-[22px] font-semibold text-[#1a1a1a] mb-2">
                    ¡Solicitud enviada!
                  </h2>
                  <p className="text-[14px] text-[#666] leading-relaxed">
                    Tu ticket fue registrado con el número
                  </p>
                  <div className="inline-block mt-3 px-5 py-2 bg-[#fff5f5] border border-[#fcc] rounded-full">
                    <span className="font-mono font-semibold text-[#D32F2F] text-[16px] tracking-wider">
                      {ticketId}
                    </span>
                  </div>
                </div>

                <p className="text-[13px] text-[#888] leading-relaxed max-w-xs">
                  El equipo de IT revisará tu caso y te contactará por correo a la brevedad.
                </p>

                <button
                  onClick={resetForm}
                  className="mt-2 px-6 py-2.5 border border-[#D32F2F] text-[#D32F2F] font-medium text-[14px] rounded-xl hover:bg-[#fff5f5] transition-colors duration-150 cursor-pointer"
                >
                  Enviar otra solicitud
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-8 mt-4">
        <p className="text-[12px] text-[#bbb]">
          Travelkit Colombia · Soporte IT interno · {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
