const ALLOWED_EMAIL_DOMAINS = ['travelkit.co', 'travelkit.us', 'travelkit.com', 'mitravelkit.com'];

const ALLOWED_CATEGORIAS = ['Software', 'Hardware', 'Conectividad', 'Accesos', 'Teams', 'Correo'];
const ALLOWED_PRIORIDADES = ['Alta', 'Media', 'Baja'];

const LIMITS = {
  nombre:      100,
  descripcion: 2000,
  email:       254,
} as const;

export function sanitize(value: string): string {
  return value.replace(/\0/g, '').trim();
}

export function validateEmail(value: string): string | null {
  const clean = sanitize(value);
  if (!clean) return 'El correo es obligatorio.';
  if (clean.length > LIMITS.email) return 'El correo es demasiado largo.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) return 'El correo no tiene un formato válido.';
  const domain = clean.toLowerCase().split('@')[1] ?? '';
  if (!ALLOWED_EMAIL_DOMAINS.includes(domain)) {
    return `Solo se aceptan correos corporativos (${ALLOWED_EMAIL_DOMAINS.join(', ')}).`;
  }
  return null;
}

export function validateNombre(value: string): string | null {
  const clean = sanitize(value);
  if (!clean) return 'El nombre es obligatorio.';
  if (clean.length > LIMITS.nombre) return `El nombre no puede superar ${LIMITS.nombre} caracteres.`;
  return null;
}

export function validateDescripcion(value: string): string | null {
  const clean = sanitize(value);
  if (!clean) return 'La descripción es obligatoria.';
  if (clean.length > LIMITS.descripcion) return `La descripción no puede superar ${LIMITS.descripcion} caracteres.`;
  return null;
}

export function validateCategoria(value: string): string | null {
  if (!ALLOWED_CATEGORIAS.includes(value)) return 'Categoría no válida.';
  return null;
}

export function validatePrioridad(value: string): string | null {
  if (!ALLOWED_PRIORIDADES.includes(value)) return 'Prioridad no válida.';
  return null;
}

export { ALLOWED_EMAIL_DOMAINS, ALLOWED_CATEGORIAS, ALLOWED_PRIORIDADES, LIMITS };
