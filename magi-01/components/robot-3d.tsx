'use client'

/* ═══════════════════════════════════════════════════════════════
   MAGI-01 // UNIDAD PILOTO 3D
   Robot en Three.js construido con primitivas.
   - Los ojos (pupilas + cabeza) siguen al cursor.
   - Los párpados se cierran cuando la contraseña está oculta
     y se abren cuando está visible. Parpadeo aleatorio.
   ═══════════════════════════════════════════════════════════════ */

import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree, type ThreeElements } from '@react-three/fiber'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import * as THREE from 'three'

/* ── Paleta del chasis ── */
const CREAM = '#efe9de'
const CREAM_2 = '#c7c0b1'
const DARK = '#37373d'
const DARK_2 = '#4c4c55'
const RED = '#c4202e'

/* ── Puntero global (normalizado -1..1 respecto a la ventana) ── */
const puntero = { x: 0, y: 0 }

/* ═══════════════ Geometría auxiliar: caja redondeada ═══════════ */
function cajaRedondeada(w: number, h: number, d: number, r: number, bevel: number) {
  const s = new THREE.Shape()
  const x = -w / 2
  const y = -h / 2
  s.moveTo(x + r, y)
  s.lineTo(x + w - r, y)
  s.quadraticCurveTo(x + w, y, x + w, y + r)
  s.lineTo(x + w, y + h - r)
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  s.lineTo(x + r, y + h)
  s.quadraticCurveTo(x, y + h, x, y + h - r)
  s.lineTo(x, y + r)
  s.quadraticCurveTo(x, y, x + r, y)

  const prof = Math.max(d - bevel * 2, 0.001)
  const g = new THREE.ExtrudeGeometry(s, {
    depth: prof,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 4,
    curveSegments: 14,
  })
  g.translate(0, 0, -prof / 2)
  g.computeVertexNormals()
  return g
}

type MeshProps = ThreeElements['mesh']
type MatProps = ThreeElements['meshStandardMaterial']

function Caja({
  w,
  h,
  d,
  r,
  bevel = 0.025,
  children,
  ...props
}: { w: number; h: number; d: number; r: number; bevel?: number } & MeshProps) {
  const geo = useMemo(() => cajaRedondeada(w, h, d, r, bevel), [w, h, d, r, bevel])
  useEffect(() => () => geo.dispose(), [geo])
  return (
    <mesh geometry={geo} {...props}>
      {children}
    </mesh>
  )
}

/* ── Materiales reutilizables ── */
const Blanco = (p: MatProps) => (
  <meshStandardMaterial color={CREAM} roughness={0.42} metalness={0.14} envMapIntensity={0.85} {...p} />
)
const Hueso = (p: MatProps) => (
  <meshStandardMaterial color={CREAM_2} roughness={0.36} metalness={0.2} envMapIntensity={0.9} {...p} />
)
const Grafito = (p: MatProps) => (
  <meshStandardMaterial color={DARK} roughness={0.3} metalness={0.55} envMapIntensity={1} {...p} />
)
const Acero = (p: MatProps) => (
  <meshStandardMaterial color={DARK_2} roughness={0.25} metalness={0.75} envMapIntensity={1.1} {...p} />
)

/* ═══════════════ Entorno HDRI procedimental ═══════════════ */
function Entorno() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const sala = new RoomEnvironment()
    const rt = pmrem.fromScene(sala, 0.04)
    scene.environment = rt.texture
    return () => {
      scene.environment = null
      rt.dispose()
      pmrem.dispose()
    }
  }, [gl, scene])
  return null
}

/* ═══════════════ Un ojo (globo + pupila + párpados) ═══════════ */
function Ojo({
  lado,
  pupila,
  parpadoSup,
  parpadoInf,
  borde,
}: {
  lado: 1 | -1
  pupila: React.RefObject<THREE.Group | null>
  parpadoSup: React.RefObject<THREE.Group | null>
  parpadoInf: React.RefObject<THREE.Group | null>
  borde: React.RefObject<THREE.Mesh | null>
}) {
  return (
    <group position={[lado * 0.235, 0.05, 0.5]}>
      {/* globo ocular */}
      <mesh>
        <sphereGeometry args={[0.185, 48, 48]} />
        <meshStandardMaterial color="#ffffff" roughness={0.08} metalness={0.02} envMapIntensity={0.45} />
      </mesh>

      {/* contorno oscuro del ojo (delante, para que no lo tape el párpado) */}
      <mesh position={[0, 0, 0.024]}>
        <torusGeometry args={[0.188, 0.0125, 10, 48]} />
        <meshStandardMaterial color="#2a2930" roughness={0.4} metalness={0.35} />
      </mesh>

      {/* iris + pupila: orbitan sobre la superficie siguiendo al cursor */}
      <group ref={pupila}>
        <mesh position={[0, 0, 0.1]}>
          <sphereGeometry args={[0.105, 40, 40]} />
          <meshStandardMaterial color="#1a1a20" roughness={0.1} metalness={0.4} envMapIntensity={1.2} />
        </mesh>
        {/* brillo especular */}
        <mesh position={[-0.033 * lado, 0.043, 0.178]}>
          <sphereGeometry args={[0.026, 16, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* párpado superior (casquete semiesférico) */}
      <group ref={parpadoSup}>
        <mesh>
          <sphereGeometry args={[0.215, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            color={CREAM}
            roughness={0.42}
            metalness={0.14}
            side={THREE.DoubleSide}
            envMapIntensity={0.85}
          />
        </mesh>
        {/* borde del párpado: al cerrarse dibuja la línea del ojo */}
        <mesh ref={borde} visible={false} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.214, 0.0095, 10, 52]} />
          <meshStandardMaterial color="#33323a" roughness={0.45} metalness={0.3} />
        </mesh>
      </group>

      {/* párpado inferior */}
      <group ref={parpadoInf}>
        <mesh>
          <sphereGeometry args={[0.215, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            color={CREAM}
            roughness={0.42}
            metalness={0.14}
            side={THREE.DoubleSide}
            envMapIntensity={0.85}
          />
        </mesh>
      </group>
    </group>
  )
}

/* ═══════════════ Un brazo ═══════════════ */
function Brazo({ lado, refBrazo }: { lado: 1 | -1; refBrazo: React.RefObject<THREE.Group | null> }) {
  return (
    <group position={[lado * 0.47, 0.22, 0.02]} ref={refBrazo}>
      {/* hombro */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.115, 0.115, 0.17, 28]} />
        <Grafito />
      </mesh>
      {/* brazo */}
      <mesh position={[0, -0.18, 0]}>
        <cylinderGeometry args={[0.072, 0.078, 0.32, 24]} />
        <Blanco />
      </mesh>
      {/* codo */}
      <mesh position={[0, -0.37, 0]}>
        <sphereGeometry args={[0.088, 26, 26]} />
        <Acero />
      </mesh>
      {/* antebrazo */}
      <mesh position={[0, -0.55, 0]}>
        <cylinderGeometry args={[0.062, 0.07, 0.29, 24]} />
        <Blanco />
      </mesh>
      {/* muñeca */}
      <mesh position={[0, -0.71, 0]}>
        <sphereGeometry args={[0.055, 20, 20]} />
        <Grafito />
      </mesh>
      {/* palma */}
      <Caja w={0.14} h={0.15} d={0.085} r={0.045} bevel={0.02} position={[0, -0.79, 0.01]}>
        <Blanco />
      </Caja>
      {/* dedos */}
      {[-0.042, 0, 0.042].map((dx) => (
        <mesh key={dx} position={[dx, -0.885, 0.01]} rotation={[0, 0, dx * 3]}>
          <capsuleGeometry args={[0.017, 0.06, 4, 10]} />
          <Blanco />
        </mesh>
      ))}
      {/* pulgar */}
      <mesh position={[lado * -0.07, -0.83, 0.03]} rotation={[0, 0, lado * 0.9]}>
        <capsuleGeometry args={[0.018, 0.055, 4, 10]} />
        <Blanco />
      </mesh>
    </group>
  )
}

/* ═══════════════ Una pierna ═══════════════ */
function Pierna({ lado }: { lado: 1 | -1 }) {
  return (
    <group position={[lado * 0.21, -0.6, 0]} rotation={[0, 0, lado * -0.04]}>
      {/* cadera */}
      <mesh>
        <sphereGeometry args={[0.1, 26, 26]} />
        <Acero />
      </mesh>
      {/* muslo */}
      <mesh position={[0, -0.16, 0]}>
        <cylinderGeometry args={[0.072, 0.078, 0.28, 24]} />
        <Blanco />
      </mesh>
      {/* rodilla */}
      <mesh position={[0, -0.33, 0]}>
        <sphereGeometry args={[0.088, 26, 26]} />
        <Acero />
      </mesh>
      {/* espinilla acampanada */}
      <mesh position={[0, -0.56, 0]}>
        <cylinderGeometry args={[0.078, 0.185, 0.42, 30]} />
        <Blanco />
      </mesh>
      {/* pie */}
      <group position={[0, -0.82, 0.07]} rotation={[0, lado * 0.12, 0]}>
        <Caja w={0.3} h={0.15} d={0.44} r={0.07} bevel={0.03}>
          <Blanco />
        </Caja>
        {/* suela */}
        <Caja w={0.315} h={0.06} d={0.46} r={0.03} bevel={0.022} position={[0, -0.075, 0]}>
          <Grafito />
        </Caja>
        {/* piloto rojo frontal */}
        <mesh position={[0, 0.01, 0.225]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.042, 0.042, 0.02, 24]} />
          <meshStandardMaterial color={RED} emissive={RED} emissiveIntensity={0.45} roughness={0.2} />
        </mesh>
      </group>
    </group>
  )
}

/* ═══════════════ EL ROBOT ═══════════════ */
function Robot({ oculto, tono, alerta }: { oculto: boolean; tono: string; alerta: boolean }) {
  const raiz = useRef<THREE.Group>(null)
  const cabeza = useRef<THREE.Group>(null)
  const pupilaI = useRef<THREE.Group>(null)
  const pupilaD = useRef<THREE.Group>(null)
  const supI = useRef<THREE.Group>(null)
  const supD = useRef<THREE.Group>(null)
  const infI = useRef<THREE.Group>(null)
  const infD = useRef<THREE.Group>(null)
  const bordeI = useRef<THREE.Mesh>(null)
  const bordeD = useRef<THREE.Mesh>(null)
  const brazoI = useRef<THREE.Group>(null)
  const brazoD = useRef<THREE.Group>(null)
  const antena = useRef<THREE.MeshStandardMaterial>(null)

  /* estado de animación */
  const cierre = useRef(0)
  const parpadeo = useRef({ t: 0, sig: 2.5, dur: 0 })

  const reduce = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const t = state.clock.elapsedTime
    const mx = puntero.x
    const my = puntero.y
    const d = THREE.MathUtils.damp

    /* ── cuerpo: giro suave hacia el cursor + respiración ── */
    if (raiz.current) {
      raiz.current.rotation.y = d(raiz.current.rotation.y, mx * 0.2, 3, dt)
      raiz.current.position.y = reduce ? 0 : Math.sin(t * 1.25) * 0.028
      raiz.current.rotation.z = reduce ? 0 : Math.sin(t * 0.62) * 0.018
    }

    /* ── cabeza: mira al cursor ── */
    if (cabeza.current) {
      cabeza.current.rotation.y = d(cabeza.current.rotation.y, mx * 0.38, 6, dt)
      cabeza.current.rotation.x = d(
        cabeza.current.rotation.x,
        -my * 0.34 + (oculto ? 0.1 : 0),
        6,
        dt,
      )
      cabeza.current.rotation.z = d(cabeza.current.rotation.z, mx * 0.08, 4, dt)
    }

    /* ── pupilas: orbitan sobre el globo ocular hacia el cursor ── */
    // Límite: más allá de ~0.42 rad la pupila se saldría del globo ocular
    const py = THREE.MathUtils.clamp(mx * 0.5, -0.42, 0.42)
    const px = THREE.MathUtils.clamp(-my * 0.42, -0.34, 0.34)
    for (const p of [pupilaI.current, pupilaD.current]) {
      if (!p) continue
      p.rotation.y = d(p.rotation.y, py, 12, dt)
      p.rotation.x = d(p.rotation.x, px, 12, dt)
    }

    /* ── párpados: cerrados si la contraseña está oculta, + parpadeo ── */
    let objetivo = oculto ? 1 : 0
    if (!oculto) {
      const b = parpadeo.current
      b.t += dt
      if (b.dur > 0) {
        b.dur -= dt
        objetivo = 1
      } else if (b.t > b.sig) {
        b.t = 0
        b.sig = 2.2 + Math.random() * 4
        b.dur = 0.12
      }
    }
    cierre.current = d(cierre.current, objetivo, oculto ? 11 : 26, dt)
    const c = cierre.current
    for (const l of [supI.current, supD.current]) {
      if (l) l.rotation.x = -(Math.PI / 2) * (1 - c)
    }
    for (const l of [infI.current, infD.current]) {
      if (l) l.rotation.x = Math.PI + (Math.PI / 2) * (1 - c)
    }
    for (const b of [bordeI.current, bordeD.current]) {
      if (b) b.visible = c > 0.4
    }

    /* ── brazos: se levantan tímidamente al ocultar la contraseña ── */
    const bal = reduce ? 0 : Math.sin(t * 1.25) * 0.05
    if (brazoI.current) {
      brazoI.current.rotation.x = d(brazoI.current.rotation.x, oculto ? -2.5 : bal, 5, dt)
      brazoI.current.rotation.z = d(brazoI.current.rotation.z, oculto ? 0.19 : -0.12, 5, dt)
    }
    if (brazoD.current) {
      brazoD.current.rotation.x = d(brazoD.current.rotation.x, oculto ? -2.5 : -bal, 5, dt)
      brazoD.current.rotation.z = d(brazoD.current.rotation.z, oculto ? -0.19 : 0.12, 5, dt)
    }

    /* ── antena: parpadeo del piloto ── */
    if (antena.current) {
      antena.current.emissiveIntensity = alerta
        ? 1.4 + Math.sin(t * 12) * 0.9
        : 0.9 + Math.sin(t * 3.2) * 0.5
    }
  })

  return (
    <group ref={raiz}>
      {/* ══════════ CABEZA ══════════ */}
      <group ref={cabeza} position={[0, 1.02, 0]}>
        {/* cráneo */}
        <mesh scale={[1.06, 0.99, 0.98]}>
          <sphereGeometry args={[0.62, 64, 48]} />
          <Blanco />
        </mesh>

        {/* casquete superior gris */}
        <mesh rotation={[-0.16, 0, -0.2]} scale={[1.068, 0.997, 0.987]}>
          <sphereGeometry args={[0.622, 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.26]} />
          <Hueso />
        </mesh>

        {/* costura frontal */}
        <mesh position={[0, 0.03, 0.02]} rotation={[0, 0, 0.15]} scale={[1.02, 1, 1]}>
          <torusGeometry args={[0.605, 0.005, 8, 80]} />
          <meshStandardMaterial color="#b9b1a4" roughness={0.6} metalness={0.2} />
        </mesh>

        {/* ── oído/cámara izquierdo (con aro rojo) ── */}
        <group position={[-0.58, 0.09, 0.0]} rotation={[0, 0, Math.PI / 2]}>
          <mesh>
            <cylinderGeometry args={[0.19, 0.185, 0.16, 32]} />
            <Grafito />
          </mesh>
          <mesh position={[0, 0.075, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.148, 0.03, 14, 34]} />
            <meshStandardMaterial color={RED} roughness={0.25} metalness={0.4} envMapIntensity={1.2} />
          </mesh>
          <mesh position={[0, 0.092, 0]}>
            <cylinderGeometry args={[0.125, 0.125, 0.03, 32]} />
            <meshStandardMaterial color="#8e9096" roughness={0.08} metalness={0.95} envMapIntensity={1.6} />
          </mesh>
        </group>

        {/* ── oído derecho ── */}
        <group position={[0.6, 0.09, 0.0]} rotation={[0, 0, Math.PI / 2]}>
          <mesh>
            <cylinderGeometry args={[0.165, 0.16, 0.14, 32]} />
            <Grafito />
          </mesh>
          <mesh position={[0, 0.075, 0]}>
            <cylinderGeometry args={[0.11, 0.11, 0.03, 32]} />
            <Acero />
          </mesh>
        </group>

        {/* ── antena ── */}
        <group position={[-0.26, 0.5, -0.06]} rotation={[0.08, 0, 0.34]}>
          <mesh position={[0, 0.27, 0]}>
            <cylinderGeometry args={[0.011, 0.016, 0.54, 12]} />
            <Grafito />
          </mesh>
          <mesh position={[0, 0.57, 0]}>
            <sphereGeometry args={[0.055, 24, 24]} />
            <meshStandardMaterial
              ref={antena}
              color={alerta ? RED : tono}
              emissive={alerta ? RED : tono}
              emissiveIntensity={1}
              roughness={0.2}
              metalness={0.1}
            />
          </mesh>
        </group>

        {/* ── ojos ── */}
        <Ojo lado={-1} pupila={pupilaI} parpadoSup={supI} parpadoInf={infI} borde={bordeI} />
        <Ojo lado={1} pupila={pupilaD} parpadoSup={supD} parpadoInf={infD} borde={bordeD} />

        {/* ── boca ── */}
        <mesh position={[0, -0.29, 0.5]} rotation={[0.32, 0, 0]}>
          <capsuleGeometry args={[0.014, 0.07, 4, 10]} />
          <meshStandardMaterial color="#9a9287" roughness={0.6} metalness={0.2} />
        </mesh>
        {/* micro-sensor mejilla */}
        <mesh position={[-0.4, -0.16, 0.4]}>
          <sphereGeometry args={[0.018, 12, 12]} />
          <Grafito />
        </mesh>
      </group>

      {/* ══════════ CUELLO ══════════ */}
      <mesh position={[0, 0.44, 0]}>
        <cylinderGeometry args={[0.15, 0.17, 0.18, 28]} />
        <Grafito />
      </mesh>

      {/* ══════════ TORSO ══════════ */}
      <Caja w={0.86} h={0.94} d={0.44} r={0.22} bevel={0.05} position={[0, -0.05, 0]}>
        <Blanco />
      </Caja>

      {/* pantallas del pecho */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.155, 0.08, 0.215]}>
          <Caja w={0.245} h={0.32} d={0.055} r={0.05} bevel={0.018}>
            <Grafito />
          </Caja>
          <Caja w={0.19} h={0.265} d={0.02} r={0.035} bevel={0.008} position={[0, 0, 0.03]}>
            <meshStandardMaterial
              color="#0e1116"
              emissive={tono}
              emissiveIntensity={0.28}
              roughness={0.2}
              metalness={0.1}
            />
          </Caja>
        </group>
      ))}

      {/* botonera central */}
      {[0, 1, 2].map((i) => (
        <Caja
          key={i}
          w={0.085}
          h={0.03}
          d={0.03}
          r={0.014}
          bevel={0.008}
          position={[0.02, -0.14 - i * 0.062, 0.225]}
        >
          <Grafito />
        </Caja>
      ))}
      {[0, 1, 2].map((i) => (
        <mesh key={`c${i}`} position={[-0.07, -0.14 - i * 0.062, 0.225]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.02, 18]} />
          <Acero />
        </mesh>
      ))}

      {/* pilotos rojos */}
      {[-1, 1].map((s) => (
        <mesh key={`p${s}`} position={[s * 0.24, -0.26, 0.215]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.034, 0.034, 0.025, 22]} />
          <meshStandardMaterial color={RED} emissive={RED} emissiveIntensity={0.5} roughness={0.2} />
        </mesh>
      ))}

      {/* rejilla lateral */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={`r${i}`} position={[-0.345, 0.18 - i * 0.045, 0.16]} rotation={[0, 0.5, 0]}>
          <boxGeometry args={[0.13, 0.012, 0.02]} />
          <Grafito />
        </mesh>
      ))}

      {/* ══════════ BRAZOS ══════════ */}
      <Brazo lado={-1} refBrazo={brazoI} />
      <Brazo lado={1} refBrazo={brazoD} />

      {/* ══════════ PELVIS ══════════ */}
      <Caja w={0.52} h={0.2} d={0.38} r={0.08} bevel={0.03} position={[0, -0.55, 0]}>
        <Grafito />
      </Caja>

      {/* ══════════ PIERNAS ══════════ */}
      <Pierna lado={-1} />
      <Pierna lado={1} />
    </group>
  )
}

/* ═══════════════ ESCENA / CANVAS ═══════════════ */
export default function Robot3D({
  oculto,
  fuerte,
  valido,
}: {
  oculto: boolean
  fuerte: boolean
  valido: boolean
}) {
  const wrap = useRef<HTMLDivElement>(null)

  /* Seguimiento del cursor MEDIDO DESDE LA CABEZA DEL ROBOT.
     Así, con el cursor sobre su cara mira de frente, y al alejarlo
     gira hacia él en la dirección correcta. */
  useEffect(() => {
    let caja: DOMRect | null = null
    const medir = () => {
      caja = wrap.current?.getBoundingClientRect() ?? null
    }
    medir()

    const mover = (e: PointerEvent) => {
      if (!caja || caja.width === 0) {
        medir()
        if (!caja || caja.width === 0) return
      }
      // La cabeza queda centrada horizontalmente y al 28% de la altura
      const cx = caja.left + caja.width / 2
      const cy = caja.top + caja.height * 0.28
      // Distancia a la que la mirada se satura
      const radio = Math.max(caja.width, 340)
      puntero.x = THREE.MathUtils.clamp((e.clientX - cx) / radio, -1.2, 1.2)
      puntero.y = THREE.MathUtils.clamp((e.clientY - cy) / radio, -1.2, 1.2)
    }
    const salir = () => {
      puntero.x = 0
      puntero.y = 0
    }

    window.addEventListener('pointermove', mover, { passive: true })
    window.addEventListener('pointerleave', salir)
    window.addEventListener('scroll', medir, { passive: true })
    window.addEventListener('resize', medir)
    return () => {
      window.removeEventListener('pointermove', mover)
      window.removeEventListener('pointerleave', salir)
      window.removeEventListener('scroll', medir)
      window.removeEventListener('resize', medir)
    }
  }, [])

  const tono = fuerte ? '#00ff66' : valido ? '#ff5500' : '#ff0033'

  return (
    <div className="robot3d-wrap" ref={wrap}>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0.62, 8.2], fov: 30 }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <Entorno />
        <ambientLight intensity={0.22} />
        <hemisphereLight args={['#bcd8ff', '#2a1030', 0.45]} />
        <directionalLight position={[3.2, 4, 5]} intensity={2.4} color="#fff4e6" />
        <directionalLight position={[-3, 2.4, -2.6]} intensity={2.2} color="#8a2be2" />
        <pointLight position={[-2.6, 0.4, 2.4]} intensity={26} decay={2} color="#8a2be2" />
        <pointLight position={[2.8, -0.8, 2.2]} intensity={16} decay={2} color="#00d9ff" />
        <Robot oculto={oculto} tono={tono} alerta={!valido} />
      </Canvas>
    </div>
  )
}
