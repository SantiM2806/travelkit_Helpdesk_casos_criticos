'use client';

import { useState, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { createSupabaseBrowser } from '@/lib/supabase/client';
import type { TipoCliente, Integrador, EstadoCliente } from '@/features/clientes/types';

const ALLOWED_TIPOS: TipoCliente[]       = ['AGV Mayorista', 'AGV Minorista', 'Comparadora', 'E-commerce'];
const ALLOWED_INTEGRADORES: Integrador[] = ['Garlan', 'Cacao', 'Legacy'];
const ALLOWED_ESTADOS: EstadoCliente[]   = ['Activa', 'Inactiva', 'En Desarrollo'];

interface ParsedRow {
  nombre:             string;
  empresa:            string;
  tipo_cliente:       string;
  integrador:         string;
  estado:             string;
  origen_integracion: string;
  consolidador:       string;
  responsable:        string;
  _errors:            string[];
}

/* Normaliza un encabezado a la clave interna */
function normalizeHeader(h: string): keyof Omit<ParsedRow, '_errors'> | null {
  const map: Record<string, keyof Omit<ParsedRow, '_errors'>> = {
    nombre:             'nombre',
    name:               'nombre',
    cliente:            'nombre',
    empresa:            'empresa',
    company:            'empresa',
    tipo:               'tipo_cliente',
    'tipo de cliente':  'tipo_cliente',
    tipo_cliente:       'tipo_cliente',
    integrador:         'integrador',
    estado:             'estado',
    status:             'estado',
    origen:             'origen_integracion',
    'origen de integracion': 'origen_integracion',
    'origen de integración': 'origen_integracion',
    origen_integracion: 'origen_integracion',
    consolidador:       'consolidador',
    responsable:        'responsable',
    responsable_it:     'responsable',
    'responsable it':   'responsable',
  };
  return map[h.toLowerCase().trim()] ?? null;
}

function validateRow(row: ParsedRow, idx: number): string[] {
  const errs: string[] = [];
  if (!row.nombre.trim()) errs.push(`Fila ${idx + 2}: "Nombre" es obligatorio`);
  if (row.tipo_cliente && !ALLOWED_TIPOS.includes(row.tipo_cliente as TipoCliente))
    errs.push(`Fila ${idx + 2}: Tipo "${row.tipo_cliente}" no válido`);
  if (row.integrador && !ALLOWED_INTEGRADORES.includes(row.integrador as Integrador))
    errs.push(`Fila ${idx + 2}: Integrador "${row.integrador}" no válido`);
  if (row.estado && !ALLOWED_ESTADOS.includes(row.estado as EstadoCliente))
    errs.push(`Fila ${idx + 2}: Estado "${row.estado}" no válido`);
  if (row.origen_integracion && !['Directo', 'Consolidador'].includes(row.origen_integracion))
    errs.push(`Fila ${idx + 2}: Origen "${row.origen_integracion}" no válido`);
  return errs;
}

function parseSheet(wb: XLSX.WorkBook): ParsedRow[] {
  const ws = wb.Sheets[wb.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' });

  if (raw.length === 0) return [];

  return raw.map((r, idx) => {
    const row: ParsedRow = {
      nombre: '', empresa: '', tipo_cliente: '', integrador: '',
      estado: '', origen_integracion: '', consolidador: '', responsable: '',
      _errors: [],
    };

    for (const [key, val] of Object.entries(r)) {
      const mapped = normalizeHeader(key);
      if (mapped) row[mapped] = String(val ?? '').trim();
    }

    if (!row.estado) row.estado = 'En Desarrollo';
    row._errors = validateRow(row, idx);
    return row;
  });
}

/* ── Descargar plantilla ── */
function downloadTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([
    ['Nombre', 'Empresa', 'Tipo', 'Integrador', 'Estado', 'Origen', 'Consolidador', 'Responsable'],
    ['Agencia Ejemplo', 'Empresa S.A.S', 'AGV Mayorista', 'Garlan', 'Activa', 'Directo', '', 'Juan Pérez'],
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Clientes');
  XLSX.writeFile(wb, 'plantilla_clientes.xlsx');
}

interface Props {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

type Step = 'upload' | 'preview' | 'importing' | 'done';

export default function ImportClientesModal({ open, onClose, onImported }: Props) {
  const [step,     setStep]     = useState<Step>('upload');
  const [rows,     setRows]     = useState<ParsedRow[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imported, setImported] = useState(0);
  const [failed,   setFailed]   = useState(0);
  const [fileName, setFileName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setStep('upload');
    setRows([]);
    setProgress(0);
    setImported(0);
    setFailed(0);
    setFileName('');
  }, []);

  function handleClose() { reset(); onClose(); }

  function processFile(file: File) {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = e => {
      const data = new Uint8Array(e.target!.result as ArrayBuffer);
      const wb   = XLSX.read(data, { type: 'array' });
      const parsed = parseSheet(wb);
      setRows(parsed);
      setStep('preview');
    };
    reader.readAsArrayBuffer(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  }

  async function handleImport() {
    const valid = rows.filter(r => r._errors.length === 0 && r.nombre.trim());
    if (valid.length === 0) return;

    setStep('importing');
    setProgress(0);
    let ok = 0, err = 0;
    const sb = createSupabaseBrowser();

    for (let i = 0; i < valid.length; i++) {
      const r = valid[i];
      const { error } = await sb.from('clientes').insert({
        nombre:             r.nombre.trim(),
        empresa:            r.empresa.trim() || null,
        tipo_cliente:       ALLOWED_TIPOS.includes(r.tipo_cliente as TipoCliente) ? r.tipo_cliente : null,
        integrador:         ALLOWED_INTEGRADORES.includes(r.integrador as Integrador) ? r.integrador : null,
        estado:             (ALLOWED_ESTADOS.includes(r.estado as EstadoCliente) ? r.estado : 'En Desarrollo') as EstadoCliente,
        origen_integracion: ['Directo', 'Consolidador'].includes(r.origen_integracion) ? r.origen_integracion : null,
        consolidador:       r.origen_integracion === 'Consolidador' ? r.consolidador.trim() || null : null,
        responsable:        r.responsable.trim() || null,
      });
      if (error) err++; else ok++;
      setProgress(Math.round(((i + 1) / valid.length) * 100));
    }

    setImported(ok);
    setFailed(err);
    setStep('done');
    onImported();
  }

  if (!open) return null;

  const validRows   = rows.filter(r => r._errors.length === 0);
  const invalidRows = rows.filter(r => r._errors.length > 0);
  const allErrors   = rows.flatMap(r => r._errors);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div
        className="w-full flex flex-col rounded-2xl"
        style={{
          background: 'var(--bg2)',
          border: '1px solid var(--border)',
          maxWidth: step === 'preview' ? '860px' : '520px',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <p className="font-mono text-[11px] tracking-[0.1em] uppercase mb-0.5" style={{ color: '#D32F2F' }}>
              Importar clientes
            </p>
            <p className="text-[13px] text-tk-text font-medium">
              {step === 'upload'    && 'Carga un archivo CSV o Excel'}
              {step === 'preview'   && `${rows.length} fila${rows.length !== 1 ? 's' : ''} encontrada${rows.length !== 1 ? 's' : ''} en "${fileName}"`}
              {step === 'importing' && 'Importando clientes…'}
              {step === 'done'      && 'Importación completada'}
            </p>
          </div>
          <button onClick={handleClose} className="w-7 h-7 flex items-center justify-center rounded text-tk-text3 hover:text-tk-text hover:bg-tk-bg3 transition-colors cursor-pointer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">

          {/* ── PASO 1: Upload ── */}
          {step === 'upload' && (
            <div className="flex flex-col gap-5">
              {/* Dropzone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
                className="flex flex-col items-center gap-3 py-10 px-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-150"
                style={{ borderColor: dragOver ? '#D32F2F' : 'var(--border2)', background: dragOver ? 'rgba(211,47,47,0.04)' : 'var(--bg3)' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-tk-text3">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="12" y1="18" x2="12" y2="12"/>
                  <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
                <div className="text-center">
                  <p className="text-[14px] text-tk-text font-medium">
                    Arrastra tu archivo aquí o <span style={{ color: '#D32F2F' }}>selecciónalo</span>
                  </p>
                  <p className="text-[12px] text-tk-text3 mt-1">CSV · XLSX · XLS — hasta 5 MB</p>
                </div>
              </div>
              <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={onFileInput} className="hidden" />

              {/* Columnas esperadas */}
              <div className="rounded-xl p-4 flex flex-col gap-2" style={{ background: 'var(--bg3)', border: '1px solid var(--border)' }}>
                <p className="font-mono text-[10px] font-semibold text-tk-text3 uppercase tracking-[0.08em] mb-1">Columnas esperadas</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                  {[
                    { col: 'Nombre', note: 'Obligatorio' },
                    { col: 'Empresa', note: 'Opcional' },
                    { col: 'Tipo', note: 'AGV Mayorista · AGV Minorista · Comparadora · E-commerce' },
                    { col: 'Integrador', note: 'Garlan · Cacao · Legacy' },
                    { col: 'Estado', note: 'Activa · Inactiva · En Desarrollo' },
                    { col: 'Origen', note: 'Directo · Consolidador' },
                    { col: 'Consolidador', note: 'Si Origen = Consolidador' },
                    { col: 'Responsable', note: 'Opcional' },
                  ].map(({ col, note }) => (
                    <div key={col} className="flex items-baseline gap-2">
                      <span className="font-mono text-[11px] text-tk-text font-semibold w-24 flex-shrink-0">{col}</span>
                      <span className="text-[11px] text-tk-text3">{note}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Descargar plantilla */}
              <button
                onClick={e => { e.stopPropagation(); downloadTemplate(); }}
                className="flex items-center gap-2 text-[12px] font-mono text-tk-text3 hover:text-tk-text transition-colors cursor-pointer self-start"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Descargar plantilla Excel
              </button>
            </div>
          )}

          {/* ── PASO 2: Preview ── */}
          {step === 'preview' && (
            <div className="flex flex-col gap-4">
              {/* Resumen */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[20px] font-semibold" style={{ color: '#4caf8a' }}>{validRows.length}</span>
                  <span className="font-mono text-[10px] text-tk-text3 uppercase tracking-[0.06em]">Listas para importar</span>
                </div>
                {invalidRows.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[20px] font-semibold" style={{ color: '#ef5350' }}>{invalidRows.length}</span>
                    <span className="font-mono text-[10px] text-tk-text3 uppercase tracking-[0.06em]">Con errores (se omiten)</span>
                  </div>
                )}
              </div>

              {/* Errores */}
              {allErrors.length > 0 && (
                <div className="rounded-lg px-4 py-3 flex flex-col gap-1" style={{ background: 'rgba(239,83,80,0.06)', border: '1px solid rgba(239,83,80,0.25)' }}>
                  {allErrors.map((e, i) => (
                    <p key={i} className="font-mono text-[11px]" style={{ color: '#ef5350' }}>{e}</p>
                  ))}
                </div>
              )}

              {/* Tabla preview */}
              {validRows.length > 0 && (
                <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border)' }}>
                  <table className="w-full text-left text-[12px]">
                    <thead style={{ background: 'var(--bg3)', borderBottom: '1px solid var(--border)' }}>
                      <tr>
                        {['Nombre', 'Empresa', 'Tipo', 'Integrador', 'Estado', 'Origen', 'Responsable'].map(h => (
                          <th key={h} className="px-3 py-2.5 font-mono text-[10px] font-semibold text-tk-text3 uppercase tracking-[0.06em] whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {validRows.map((r, i) => (
                        <tr key={i} className="border-t" style={{ borderColor: 'var(--border)' }}>
                          <td className="px-3 py-2.5 text-tk-text font-medium">{r.nombre}</td>
                          <td className="px-3 py-2.5 text-tk-text2">{r.empresa || '—'}</td>
                          <td className="px-3 py-2.5 text-tk-text2">{r.tipo_cliente || '—'}</td>
                          <td className="px-3 py-2.5 text-tk-text2">{r.integrador || '—'}</td>
                          <td className="px-3 py-2.5">
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded" style={{
                              background: r.estado === 'Activa' ? '#0d2b1f' : r.estado === 'Inactiva' ? '#2b0d0d' : '#2b1a00',
                              color:      r.estado === 'Activa' ? '#4caf8a' : r.estado === 'Inactiva' ? '#ef5350' : '#ffa726',
                            }}>
                              {r.estado || 'En Desarrollo'}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-tk-text2">{r.origen_integracion || '—'}</td>
                          <td className="px-3 py-2.5 text-tk-text2">{r.responsable || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── PASO 3: Importing ── */}
          {step === 'importing' && (
            <div className="flex flex-col items-center gap-5 py-8">
              <div className="w-12 h-12 border-4 border-tk-border2 rounded-full animate-spin" style={{ borderTopColor: '#CC0000' }} />
              <div className="w-full flex flex-col gap-2">
                <div className="flex justify-between font-mono text-[11px] text-tk-text2">
                  <span>Importando…</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ background: 'var(--bg3)' }}>
                  <div className="h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: '#CC0000' }} />
                </div>
              </div>
            </div>
          )}

          {/* ── PASO 4: Done ── */}
          {step === 'done' && (
            <div className="flex flex-col items-center gap-5 py-6">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: '#0d2b1f' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#4caf8a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div className="text-center flex flex-col gap-1">
                <p className="text-[15px] font-semibold text-tk-text">
                  {imported} cliente{imported !== 1 ? 's' : ''} importado{imported !== 1 ? 's' : ''}
                </p>
                {failed > 0 && (
                  <p className="text-[12px]" style={{ color: '#ef5350' }}>
                    {failed} fila{failed !== 1 ? 's' : ''} con error al insertar
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex gap-3 justify-end flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
          {step === 'upload' && (
            <button onClick={handleClose}
              className="px-4 py-2 border border-tk-border2 rounded-lg text-tk-text2 font-mono text-[11px] uppercase tracking-wide cursor-pointer hover:border-tk-border hover:text-tk-text transition-colors">
              Cancelar
            </button>
          )}

          {step === 'preview' && (
            <>
              <button onClick={reset}
                className="px-4 py-2 border border-tk-border2 rounded-lg text-tk-text2 font-mono text-[11px] uppercase tracking-wide cursor-pointer hover:border-tk-border hover:text-tk-text transition-colors">
                Cargar otro archivo
              </button>
              <button
                onClick={handleImport}
                disabled={validRows.length === 0}
                className="px-5 py-2 rounded-lg text-white font-mono text-[11px] font-semibold uppercase tracking-wide cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-40"
                style={{ background: '#CC0000' }}
              >
                Importar {validRows.length} cliente{validRows.length !== 1 ? 's' : ''}
              </button>
            </>
          )}

          {step === 'done' && (
            <button onClick={handleClose}
              className="px-5 py-2 rounded-lg text-white font-mono text-[11px] font-semibold uppercase tracking-wide cursor-pointer hover:opacity-90 transition-opacity"
              style={{ background: '#CC0000' }}>
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
