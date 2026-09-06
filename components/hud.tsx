/**
 * Piezas visuales reutilizables del HUD.
 * Sólo presentación: reciben props y devuelven marcado. Cero matemática.
 */
import { BookOpen } from 'lucide-react'

/* ── Contenedor con el marco del HUD ── */
export function Panel({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return <section className={`hud-panel ${className}`}>{children}</section>
}

/* ── Un paso del desarrollo matemático ── */
export function Paso({
  n,
  label,
  children,
}: {
  n: number
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="deriv-step">
      <i>{n}</i>
      <div>
        <small>{label}</small>
        <code>{children}</code>
      </div>
    </div>
  )
}

/* ── Nota teórica al pie de cada tarjeta ── */
export function Teoria({ children }: { children: React.ReactNode }) {
  return (
    <p className="theory">
      <BookOpen size={11} />
      <span>{children}</span>
    </p>
  )
}

/* ── Bloque del marco teórico ── */
export function Teorema({
  icon,
  titulo,
  formula,
  children,
}: {
  icon: React.ReactNode
  titulo: string
  formula: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="teorema">
      <div className="teorema-head">
        {icon}
        <h3>{titulo}</h3>
      </div>
      <code className="teorema-formula">{formula}</code>
      <p>{children}</p>
    </div>
  )
}
