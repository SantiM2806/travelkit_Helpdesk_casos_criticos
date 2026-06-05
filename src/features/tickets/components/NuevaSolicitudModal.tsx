'use client';

import { useState, FormEvent, useEffect, useRef, useCallback } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase/client';

const supabase = createSupabaseBrowser();
import { uploadTicketImage, validateImageFile } from '@/lib/supabase/storage';
import {
  sanitize,
  validateDescripcion,
  validateCategoria,
  validatePrioridad,
  ALLOWED_CATEGORIAS,
  ALLOWED_PRIORIDADES,
  LIMITS,
} from '@/features/tickets/utils/validations';

const CATEGORIAS = ALLOWED_CATEGORIAS;
const PRIORIDADES = ALLOWED_PRIORIDADES;

interface Props {
  open: boolean;
  userEmail: string;
  onClose: () => void;
  onCreated: () => void;
}

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

export default function NuevaSolicitudModal({ open, userEmail, onClose, onCreated }: Props) {
  const [mounted,      setMounted]      = useState(false);
  const [visible,      setVisible]      = useState(false);
  const [solicitante,  setSolicitante]  = useState(userEmail);
  const [categoria,    setCategoria]    = useState('Software');
  const [prioridad,    setPrioridad]    = useState('Media');
  const [descripcion,  setDescripcion]  = useState('');
  const [imageFile,    setImageFile]    = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragOver,     setDragOver]     = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const textareaRef  = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setSolicitante(userEmail);
      setCategoria('Software');
      setPrioridad('Media');
      setDescripcion('');
      setImageFile(null);
      setImagePreview(null);
      setError('');
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setVisible(true);
        setTimeout(() => textareaRef.current?.focus(), 80);
      }));
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 260);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

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

    const descErr      = validateDescripcion(descripcion);
    const categoriaErr = validateCategoria(categoria);
    const prioridadErr = validatePrioridad(prioridad);
    const firstErr = descErr ?? categoriaErr ?? prioridadErr;
    if (firstErr) { setError(firstErr); return; }

    setLoading(true);
    setError('');

    try {
      const ticket_id = await generarTicketId();

      let imagen_url: string | null = null;
      if (imageFile) {
        imagen_url = await uploadTicketImage(ticket_id, imageFile);
      }

      const { error: dbError } = await supabase.from('tickets').insert({
        ticket_id,
        timestamp:   new Date().toISOString(),
        email:       solicitante.trim(),
        categoria,
        prioridad,
        descripcion: sanitize(descripcion),
        estado:      'Abierto',
        responsable: null,
        imagen_url,
      });

      if (dbError) throw dbError;

      onCreated();
      onClose();
    } catch {
      setError('No se pudo registrar la solicitud. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      onClick={onClose}
      style={{ transition: 'opacity 0.22s ease', opacity: visible ? 1 : 0 }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

      <div
        className="relative w-full max-w-[480px] mx-4 bg-tk-bg2 border border-tk-border rounded-lg shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
        style={{
          transition: 'transform 0.26s cubic-bezier(0.22,1,0.36,1), opacity 0.22s ease',
          transform:  visible ? 'translateY(0) scale(1)' : 'translateY(14px) scale(0.985)',
          opacity:    visible ? 1 : 0,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-tk-border">
          <div>
            <div className="font-mono text-[11px] tracking-[0.1em] uppercase mb-0.5" style={{ color: '#D32F2F' }}>
              Nueva Solicitud
            </div>
            <div className="text-[13px] text-tk-text font-medium">
              Registrar ticket de soporte IT
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded text-tk-text3 hover:text-tk-text hover:bg-tk-bg3 transition-colors cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">

          {/* Email editable */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] tracking-[0.08em] uppercase text-tk-text3">
              Solicitante
            </label>
            <input
              type="email"
              value={solicitante}
              onChange={e => setSolicitante(e.target.value)}
              placeholder="correo@travelkit.com"
              className="modal-textarea search-input w-full bg-tk-bg3 border border-tk-border2 rounded px-3 py-2 text-[13px] text-tk-text font-mono placeholder:text-tk-text3 focus:outline-none focus:border-tk-accent2 transition-colors duration-[0.12s]"
            />
          </div>

          {/* Categoría + Prioridad en fila */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] tracking-[0.08em] uppercase text-tk-text3">
                Categoría
              </label>
              <div className="relative">
                <select
                  value={categoria}
                  onChange={e => setCategoria(e.target.value)}
                  className="modal-select-el w-full bg-tk-bg3 border border-tk-border2 rounded px-3 py-2 text-[13px] text-tk-text font-sans focus:outline-none focus:border-tk-accent2 transition-colors duration-[0.12s] cursor-pointer appearance-none pr-7"
                >
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-tk-text3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] tracking-[0.08em] uppercase text-tk-text3">
                Prioridad
              </label>
              <div className="relative">
                <select
                  value={prioridad}
                  onChange={e => setPrioridad(e.target.value)}
                  className="modal-select-el w-full bg-tk-bg3 border border-tk-border2 rounded px-3 py-2 text-[13px] text-tk-text font-sans focus:outline-none focus:border-tk-accent2 transition-colors duration-[0.12s] cursor-pointer appearance-none pr-7"
                >
                  {PRIORIDADES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-tk-text3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] tracking-[0.08em] uppercase text-tk-text3">
              Descripción del problema <span className="text-tk-red">*</span>
            </label>
            <textarea
              ref={textareaRef}
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              rows={4}
              placeholder="Describe detalladamente el problema o solicitud…"
              maxLength={LIMITS.descripcion}
              className="modal-textarea search-input w-full bg-tk-bg3 border border-tk-border2 rounded px-3 py-2 text-[13px] text-tk-text font-sans placeholder:text-tk-text3 focus:outline-none focus:border-tk-accent2 transition-colors duration-[0.12s]"
            />
            <div className="text-right font-mono text-[10px] text-tk-text3">
              {descripcion.length} caracteres
            </div>
          </div>

          {/* Imagen adjunta */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] tracking-[0.08em] uppercase text-tk-text3">
              Imagen adjunta <span className="text-tk-text3 normal-case font-sans tracking-normal">(opcional · máx. 5 MB)</span>
            </label>

            {imagePreview ? (
              /* Preview */
              <div className="flex items-center gap-3 px-3 py-2.5 bg-tk-bg3 border border-tk-border2 rounded">
                <img
                  src={imagePreview}
                  alt="preview"
                  className="w-10 h-10 object-cover rounded flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-tk-text truncate">{imageFile?.name}</p>
                  <p className="text-[11px] text-tk-text3 font-mono">
                    {imageFile ? (imageFile.size / 1024).toFixed(0) + ' KB' : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={removeImage}
                  className="w-6 h-6 flex items-center justify-center rounded text-tk-text3 hover:text-tk-red hover:bg-tk-bg transition-colors flex-shrink-0 cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
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
                className={`flex flex-col items-center gap-1.5 px-4 py-4 border border-dashed rounded cursor-pointer transition-colors duration-[0.15s] ${
                  dragOver
                    ? 'border-tk-accent2 bg-tk-bg3'
                    : 'border-tk-border2 hover:border-tk-text3 bg-tk-bg3'
                }`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-tk-text3">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <p className="text-[12px] text-tk-text3 text-center leading-tight">
                  Arrastra una imagen o <span className="text-tk-accent2 underline">selecciona un archivo</span>
                </p>
                <p className="font-mono text-[10px] text-tk-text3 opacity-60">JPG · PNG · GIF · WEBP</p>
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
            <div className="bg-[rgba(239,83,80,0.06)] border border-[rgba(239,83,80,0.25)] rounded px-3 py-2">
              <p className="font-mono text-[11px] text-tk-red tracking-[0.04em]">{error}</p>
            </div>
          )}

          {/* Acciones */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-transparent border border-tk-border2 rounded text-tk-text2 font-mono text-[11px] tracking-[0.06em] uppercase cursor-pointer transition-[border-color,color,background] duration-[0.15s] hover:border-tk-text2 hover:bg-tk-bg3"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !descripcion.trim()}
              className="flex-[2] flex items-center justify-center gap-2 px-4 py-2 text-white font-mono text-[11px] font-semibold tracking-[0.08em] uppercase rounded cursor-pointer transition-[opacity] duration-[0.15s] hover:opacity-90 active:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: '#CC0000' }}
            >
              {loading ? (
                <>
                  <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin-sync" />
                  {imageFile ? 'SUBIENDO…' : 'REGISTRANDO…'}
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  REGISTRAR SOLICITUD
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
