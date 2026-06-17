import type { Metadata } from 'next';
import { IBM_Plex_Sans, IBM_Plex_Mono, Inter } from 'next/font/google';
import './globals.css';
import { cn } from "@/lib/utils";

// Tema claro Travelkit CRM (IDENTIDAD-VISUAL.md) — usado por /casos
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const ibmSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-sans',
  display: 'swap',
});

const ibmMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TRAVELKIT · CASOS CRÍTICOS',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={cn(ibmSans.variable, ibmMono.variable, inter.variable, "font-sans")}
    >
      {/* Aplica el tema guardado antes del primer paint para evitar flash */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{document.documentElement.setAttribute('data-theme',localStorage.getItem('tk-theme')||'dark')}catch(e){}`,
          }}
        />
      </head>
      <body className="font-sans bg-tk-bg text-tk-text text-sm leading-normal min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
