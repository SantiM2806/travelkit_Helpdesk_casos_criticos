'use client';

import { useRef, useState, useEffect } from 'react';
import type { PendingMove } from '@/features/tickets/types';

interface ModalProps {
  pendingMove: PendingMove | null;
  onClose:   () => void;
  onConfirm: (responsable: string, accion: string, area: string) => void;
}

export default function Modal({ pendingMove, onClose, onConfirm }: ModalProps) {
  const responsableRef = useRef<HTMLSelectElement>(null);
  const accionRef      = useRef<HTMLTextAreaElement>(null);
  const areaRef        = useRef<HTMLInputElement>(null);
  const confirmBtnRef  = useRef<HTMLButtonElement>(null);

  const visible    = pendingMove !== null;
  const isOtraArea = pendingMove?.toEstado === 'Otra área';

  const [isValid, setIsValid] = useState(false);

  // Reset validation when modal opens/closes
  useEffect(() => {
    if (!visible) setIsValid(false);
  }, [visible]);

  function handleResponsableChange() {
    setIsValid(!!responsableRef.current?.value);
  }

  function handleConfirm() {
    const responsable = responsableRef.current?.value || '';
    const accion      = accionRef.current?.value.trim() || '';
    const area        = areaRef.current?.value.trim() || '';
    if (!responsable) return;
    onConfirm(responsable, accion, area);
  }

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  const inputCls = 'w-full bg-tk-bg3 border border-tk-border rounded px-2.5 py-2 text-tk-text font-sans text-[13px] outline-none transition-[border-color] duration-[0.15s] focus:border-tk-accent2';

  return (
    <div
      onClick={handleOverlayClick}
      className={`fixed inset-0 bg-black/65 z-[1000] flex items-center justify-center p-4 transition-opacity duration-200 ${
        visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        className={`bg-tk-bg2 border border-tk-border2 rounded-[10px] w-full max-w-[440px] shadow-[0_24px_64px_rgba(0,0,0,0.5)] transition-transform duration-[0.22s] ${
          visible ? 'translate-y-0 scale-100' : 'translate-y-2.5 scale-[0.99]'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.22,1,0.36,1)' }}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-0 flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="font-mono text-[12px] font-semibold tracking-[0.08em] uppercase text-tk-text">
              Confirmar movimiento
            </div>
            <div className="text-[12px] text-tk-text3 mt-[3px]">
              Solo en memoria · no persiste al recargar
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-transparent border-none text-tk-text3 cursor-pointer p-[2px] flex flex-shrink-0 hover:text-tk-text transition-colors duration-[0.12s]"
            title="Cerrar"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-5 flex flex-col gap-[14px]">
          {/* Ticket info */}
          <div className="bg-tk-bg3 border border-tk-border rounded-md px-[14px] py-2.5 flex items-center gap-2 font-mono text-[11px] text-tk-text2 flex-wrap">
            <span className="font-semibold text-tk-text">{pendingMove?.ticketId}</span>
            <span className="text-tk-text3 text-xs">·</span>
            <span className="text-tk-red">{pendingMove?.fromEstado}</span>
            <span className="text-tk-text3 text-xs">→</span>
            <span className="text-tk-accent">{pendingMove?.toEstado}</span>
          </div>

          {/* Responsable */}
          <div className="flex flex-col gap-[5px]">
            <label className="font-mono text-[10px] tracking-[0.1em] uppercase text-tk-text3">
              ¿Quién lo mueve?
            </label>
            <select
              ref={responsableRef}
              onChange={handleResponsableChange}
              className={`${inputCls} modal-select-el cursor-pointer`}
            >
              <option value="">— Seleccionar responsable —</option>
              <option value="Jefferson Carvajal">Jefferson Carvajal</option>
              <option value="Santiago Morales">Santiago Morales</option>
            </select>
          </div>

          {/* Área (solo si Otra área) */}
          {isOtraArea && (
            <div className="flex flex-col gap-[5px]">
              <label className="font-mono text-[10px] tracking-[0.1em] uppercase text-tk-text3">
                ¿Qué área se hace responsable?
              </label>
              <input
                ref={areaRef}
                type="text"
                placeholder="Ej: Recursos Humanos, Contabilidad, Legal…"
                autoComplete="off"
                className={inputCls}
              />
            </div>
          )}

          {/* Acción */}
          <div className="flex flex-col gap-[5px]">
            <label className="font-mono text-[10px] tracking-[0.1em] uppercase text-tk-text3">
              ¿Qué va a hacer?
            </label>
            <textarea
              ref={accionRef}
              placeholder="Describe la acción o siguiente paso…"
              className={`${inputCls} modal-textarea h-20 leading-[1.5]`}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-transparent border border-tk-border2 rounded text-tk-text2 font-mono text-[11px] tracking-[0.06em] uppercase cursor-pointer transition-[border-color,color] duration-[0.15s] hover:border-tk-text2 hover:text-tk-text"
          >
            Cancelar
          </button>
          <button
            ref={confirmBtnRef}
            onClick={handleConfirm}
            disabled={!isValid}
            className="px-[18px] py-2 bg-tk-accent2 border-none rounded text-white font-mono text-[11px] font-semibold tracking-[0.06em] uppercase cursor-pointer transition-[background,opacity] duration-[0.15s] hover:enabled:bg-tk-accent disabled:opacity-35 disabled:cursor-not-allowed"
          >
            Confirmar movimiento
          </button>
        </div>
      </div>
    </div>
  );
}
