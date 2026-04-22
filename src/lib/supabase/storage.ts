import { supabase } from './server';

const BUCKET = 'ticket-attachments';
const MAX_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Solo se permiten imágenes JPG, PNG, GIF o WEBP.';
  }
  if (file.size > MAX_MB * 1024 * 1024) {
    return `El archivo no puede superar ${MAX_MB} MB.`;
  }
  return null;
}

export async function uploadTicketImage(ticketId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `${ticketId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
