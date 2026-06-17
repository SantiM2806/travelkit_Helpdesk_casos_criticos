import { redirect } from 'next/navigation';

// La aplicación vive en /casos. La raíz sólo redirige.
export default function Page() {
  redirect('/casos');
}
