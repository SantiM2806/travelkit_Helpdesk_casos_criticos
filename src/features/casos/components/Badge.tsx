import { cn } from '@/lib/utils';

type Variant = 'default' | 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'outline';

const VARIANTS: Record<Variant, string> = {
  default: 'bg-gray-100 text-gray-700',
  brand:   'bg-brand-50 text-brand-700',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger:  'bg-red-50 text-red-700',
  info:    'bg-blue-50 text-blue-700',
  outline: 'bg-white border border-tk-card-bd text-tk-ink2',
};

export default function Badge({
  variant = 'default',
  children,
  className,
}: {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        VARIANTS[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
