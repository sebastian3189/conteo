import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MAGI-01 // Analizador de Seguridad Combinatoria',
  description: 'Gestor, Generador y Evaluador de Contraseñas — Técnicas de Conteo.',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#08080C',
  userScalable: true,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es" className="bg-[#08080C]"><body className="antialiased">{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
