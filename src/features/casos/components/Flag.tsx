import { flagUrl, paisNombre } from '@/features/casos/utils/format';

/** Bandera de país (imagen) + código ISO-2. */
export default function Flag({ iso, showCode = true }: { iso: string; showCode?: boolean }) {
  if (!iso) return <span className="text-tk-ink3">—</span>;
  const url = flagUrl(iso);
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap" title={paisNombre(iso)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={iso} width={20} height={15} className="inline-block rounded-[2px] border border-tk-card-bd" />
      {showCode && <span className="font-mono text-[11px] uppercase tabular-nums">{iso}</span>}
    </span>
  );
}
