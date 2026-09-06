'use client'

/**
 * Panel del Piloto: robot 3D + monitor de sincronización.
 * Sólo presentación. Recibe tres booleanos ya calculados y reacciona a ellos.
 */
import dynamic from 'next/dynamic'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, Crosshair } from 'lucide-react'

/* El robot 3D (three.js) sólo se carga en el navegador */
const Robot3D = dynamic(() => import('@/components/robot-3d'), {
  ssr: false,
  loading: () => (
    <div className="robot3d-wrap robot3d-loading">CARGANDO UNIDAD PILOTO…</div>
  ),
})

export function Piloto({
  oculto,
  fuerte,
  valido,
  tono,
}: {
  oculto: boolean
  fuerte: boolean
  valido: boolean
  /** Color de fortaleza (continuo, derivado de la entropía). */
  tono: string
}) {
  return (
    <div
      className={`pilot-stage ${fuerte ? 'pilot-strong' : ''} ${!valido ? 'pilot-danger' : ''}`}
    >
      <div className="stage-label">
        <Crosshair size={12} /> MONITOR DE SINCRONIZACIÓN
      </div>
      <motion.div
        className="pilot-aura"
        animate={{
          scale: fuerte ? [1, 1.08, 1] : 1,
          opacity: fuerte ? [0.45, 0.75, 0.45] : 0.3,
        }}
        transition={{ repeat: Infinity, duration: 2 }}
      />
      <Robot3D oculto={oculto} valido={valido} tono={tono} />
      <AnimatePresence>
        {!valido && (
          <motion.div
            className="pilot-warning"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <AlertTriangle size={18} /> CRÍTICO
          </motion.div>
        )}
      </AnimatePresence>
      <div
        className={`pilot-status ${fuerte ? 'status-green' : !valido ? 'status-red' : 'status-orange'}`}
      >
        {fuerte
          ? '[ CONTRASEÑA MUY FUERTE — IMPOSIBLE DE ROMPER ]'
          : !valido
            ? '[ CONTRASEÑA DÉBIL — RIESGO DE BRECHA ]'
            : oculto
              ? '[ CAMPO A.T. ACTIVO — CONTRASEÑA PROTEGIDA ]'
              : '[ CAMPO A.T. DISUELTO — CONTRASEÑA EXPUESTA ]'}
      </div>
    </div>
  )
}
