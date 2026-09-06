'use client'

import { useMemo, useState } from 'react'
import {
  Activity,
  Binary,
  Calculator,
  ChevronDown,
  ChevronUp,
  ClipboardCopy,
  Divide,
  Eye,
  EyeOff,
  Hash,
  Layers,
  LockKeyhole,
  Radio,
  RefreshCw,
  ShieldCheck,
  Sigma,
  Terminal,
  Zap,
} from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════
   LÓGICA — toda la matemática vive en lib/password-analysis.ts.
   Este archivo NO calcula nada: sólo pide resultados y los muestra.
   ═══════════════════════════════════════════════════════════════ */
import {
  evaluar,
  generarContrasena,
  validar,
  esFuerte,
  REGLAS,
  formatBig,
  sci,
} from '@/lib/password-analysis'

/* ═══════════════════════════════════════════════════════════════
   COMPONENTES VISUALES
   ═══════════════════════════════════════════════════════════════ */
import { Panel, Paso, Teoria, Teorema } from '@/components/hud'
import { Piloto } from '@/components/piloto'

/* Contraseñas de ejemplo para los botones de carga rápida */
const presets = [
  ['PRUEBA_ALFA', 'c4fe#Tigre79!Nube'],
  ['PRUEBA_BETA', 'm4R3a_Azul#2026'],
  ['PRUEBA_GAMMA', 'Sol#Verde_8492'],
] as const

/* ═══════════════════════════════════════════════════════════════
   PÁGINA PRINCIPAL
   ═══════════════════════════════════════════════════════════════ */
export default function Page() {
  const [password, setPassword] = useState('c4fe#Tigre79!Nube')
  const [visible, setVisible] = useState(false)
  const [longitud, setLongitud] = useState(16)
  const [usarMayus, setUsarMayus] = useState(true)
  const [usarMinus, setUsarMinus] = useState(true)
  const [usarDigitos, setUsarDigitos] = useState(true)
  const [usarSimbolos, setUsarSimbolos] = useState(true)
  const [copiado, setCopiado] = useState(false)
  const [verProc, setVerProc] = useState(true)

  /* Validación y nivel: lógica importada, no calculada aquí. */
  const results = validar(password)
  const valid = results.every(Boolean)
  const strong = esFuerte(password)

  /* Todo el análisis combinatorio ocurre en lib/password-analysis.ts.
     Se recalcula sólo cuando cambia la contraseña. */
  const stats = useMemo(() => evaluar(password), [password])

  const nivelFortaleza = strong
    ? 'SISTEMA ÓPTIMO'
    : valid
      ? 'DEFENSA NOMINAL'
      : 'RIESGO DE BRECHA'

  function handleGenerar() {
    const nueva = generarContrasena(
      longitud,
      usarMayus,
      usarMinus,
      usarDigitos,
      usarSimbolos,
    )
    if (nueva) setPassword(nueva)
  }

  function handleCopiar() {
    navigator.clipboard.writeText(password)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 1200)
  }

  return (
    <main className="magi-app">
      {/* ── CABECERA ── */}
      <header className="command-header">
        <div>
          <div className="eyebrow">
            <Radio size={13} /> CENTRO DE COMANDO // RED MAGI EN LÍNEA
          </div>
          <h1>
            SISTEMA MAGI <span>//</span> ANALIZADOR DE SEGURIDAD
          </h1>
          <p>
            TÉCNICAS DE CONTEO — MATEMÁTICAS DE LA INFORMÁTICA AVANZADA{' '}
            <b>v.01</b>
          </p>
        </div>
        <div className="header-status">
          <span>
            <i className="led led-orange" /> ANÁLISIS ACTIVO
          </span>
          <span>
            <i className="led led-blue" /> CONTEO COMBINATORIO
          </span>
          <span>
            <i className="led led-green" /> NIVEL DE DEFENSA 4
          </span>
        </div>
      </header>

      {/* ── TERMINAL + PANDA ── */}
      <div className="top-grid">
        <Panel className="terminal-panel">
          <div className="panel-heading">
            <span>
              <Terminal size={16} /> TERMINAL DE CONTRASEÑAS
            </span>
            <span className="panel-code">SEC/ANL-01</span>
          </div>
          <label htmlFor="password">
            INGRESE CONTRASEÑA // AUTORIZACIÓN REQUERIDA
          </label>
          <div className="password-input">
            <input
              id="password"
              type={visible ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-label="Contraseña a analizar"
            />
            <button
              onClick={() => setVisible(!visible)}
              aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {visible ? <EyeOff size={18} /> : <Eye size={18} />}
              <span>[ {visible ? 'OCULTAR' : 'MOSTRAR'} ]</span>
            </button>
          </div>

          {/* Validación */}
          <div className="check-grid">
            {REGLAS.map((regla, i) => (
              <div
                className={results[i] ? 'check pass' : 'check'}
                key={regla.etiqueta}
              >
                <span className="tactical-led" />
                {regla.etiqueta}
                <b>{results[i] ? 'CUMPLE' : 'FALLA'}</b>
              </div>
            ))}
          </div>

          {/* Contraseñas de prueba */}
          <div className="quick-load">
            <span>CARGA RÁPIDA //</span>
            {presets.map(([name, value]) => (
              <button key={name} onClick={() => setPassword(value)}>
                {name}
              </button>
            ))}
          </div>

          {/* Opciones de generación */}
          <div
            style={{
              marginTop: 18,
              borderTop: '1px solid var(--line)',
              paddingTop: 16,
            }}
          >
            <div
              className="eyebrow"
              style={{ marginBottom: 10, fontSize: 10 }}
            >
              <RefreshCw size={12} /> GENERADOR DE CONTRASEÑAS
            </div>
            <div className="check-grid" style={{ marginTop: 0 }}>
              {(
                [
                  ['Mayúsculas A-Z', usarMayus, setUsarMayus],
                  ['Minúsculas a-z', usarMinus, setUsarMinus],
                  ['Números 0-9', usarDigitos, setUsarDigitos],
                  ['Símbolos !@#', usarSimbolos, setUsarSimbolos],
                ] as [string, boolean, (v: boolean) => void][]
              ).map(([label, val, setter]) => (
                <label
                  className={val ? 'check pass' : 'check'}
                  key={label}
                  style={{ cursor: 'pointer' }}
                >
                  <input
                    type="checkbox"
                    checked={val}
                    onChange={(e) => setter(e.target.checked)}
                    style={{ accentColor: 'var(--orange)', width: 13, height: 13 }}
                  />
                  {label}
                  <b>{val ? 'SÍ' : 'NO'}</b>
                </label>
              ))}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginTop: 12,
              }}
            >
              <span
                style={{
                  color: 'var(--muted)',
                  fontSize: 10,
                  letterSpacing: '.1em',
                }}
              >
                LONGITUD:
              </span>
              <input
                type="range"
                min={8}
                max={32}
                value={longitud}
                onChange={(e) => setLongitud(Number(e.target.value))}
                style={{
                  flex: 1,
                  accentColor: 'var(--orange)',
                  height: 4,
                }}
              />
              <span
                style={{
                  color: 'var(--orange)',
                  fontFamily: 'Orbitron',
                  fontWeight: 700,
                  fontSize: 15,
                  width: 28,
                  textAlign: 'right',
                }}
              >
                {longitud}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button
                className="gen-btn"
                onClick={handleGenerar}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  background: 'rgba(255,85,0,.12)',
                  border: '1px solid var(--orange)',
                  color: 'var(--orange)',
                  padding: '10px 14px',
                  fontSize: 10,
                  letterSpacing: '.1em',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                <Zap size={14} /> GENERAR CONTRASEÑA
              </button>
              <button
                onClick={handleCopiar}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(255,85,0,.06)',
                  border: '1px solid var(--line)',
                  color: copiado ? 'var(--green)' : 'var(--muted)',
                  padding: '10px 14px',
                  fontSize: 10,
                  letterSpacing: '.1em',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'color .2s',
                }}
              >
                <ClipboardCopy size={14} />
                {copiado ? '¡COPIADO!' : 'COPIAR'}
              </button>
            </div>
          </div>
        </Panel>
        <Piloto
          oculto={!visible}
          fuerte={strong}
          valido={valid}
          tono={stats.fortaleza.color}
        />
      </div>

      {/* ── SEPARADOR ── */}
      <div className="section-rule">
        <span>SUPERCOMPUTADORA MAGI — ANÁLISIS EN VIVO</span>
        <span className="rule-right">
          <button className="proc-toggle" onClick={() => setVerProc(!verProc)}>
            {verProc ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {verProc ? 'OCULTAR PROCEDIMIENTO' : 'VER PROCEDIMIENTO'}
          </button>
          TELEMETRÍA //{' '}
          <b className={strong ? 'green' : 'orange'}>{nivelFortaleza}</b>
        </span>
      </div>

      {/* ── TARJETAS DE ANÁLISIS (3 columnas) ── */}
      <div className="analyst-grid">
        {/* MELCHIOR — Espacio muestral n^k */}
        <Panel className="analyst-card">
          <div className="analyst-title">
            <span className="analyst-mark">M</span>
            <div>
              <small>UNIDAD DE ANÁLISIS</small>
              <h2>MELCHIOR</h2>
            </div>
            <LockKeyhole size={15} />
          </div>
          <div className="metric-label">
            VARIACIONES CON REPETICIÓN<span>n^k</span>
          </div>
          <div className="metric-value">{sci(stats.rep)}</div>
          <div className="full-value">
            ENTERO COMPLETO: <b>{formatBig(stats.rep)}</b>
          </div>

          {verProc && (
            <>
              <div className="deriv-head">
                <Sigma size={11} /> DESARROLLO — REGLA DEL PRODUCTO
              </div>
              <div className="derivation">
                <Paso n={1} label="Tamaño del alfabeto (regla de la suma)">
                  n = {stats.sumaN} = <b>{stats.sets}</b>
                </Paso>
                <Paso n={2} label="Fórmula general — variaciones con repetición">
                  VR(n, k) = n<sup>k</sup>
                </Paso>
                <Paso n={3} label="Sustitución de los datos">
                  VR({stats.sets}, {stats.k}) = {stats.sets}
                  <sup>{stats.k}</sup>
                </Paso>
                <Paso n={4} label={`Producto de ${stats.k} factores (uno por posición)`}>
                  {stats.devRep}
                </Paso>
                <Paso n={5} label="Resultado">
                  = <b>{sci(stats.rep)}</b> claves posibles
                </Paso>
                <Paso n={6} label="Equivalente en información (entropía)">
                  H = k · log₂(n) = {stats.k} · log₂({stats.sets}) ={' '}
                  <b>{stats.bits.toFixed(1)} bits</b>
                </Paso>
              </div>
              <Teoria>
                Construir la clave es un proceso de <b>k = {stats.k} etapas</b>{' '}
                independientes: una por cada posición. Cada etapa se puede completar de{' '}
                <b>n = {stats.sets}</b> maneras y, como <b>sí se permite repetir</b>{' '}
                caracteres, el alfabeto no se agota entre etapas. Por el{' '}
                <b>principio multiplicativo</b> el total es n·n·…·n = n<sup>k</sup>. Éste
                es el <b>espacio muestral</b> que un atacante debe recorrer por fuerza
                bruta.
              </Teoria>
            </>
          )}

          <div className="card-bottom">
            <span>
              ALFABETO (n) <b>{stats.sets}</b>
            </span>
            <span>
              LONGITUD (k) <b>{stats.k}</b>
            </span>
          </div>
        </Panel>

        {/* BALTHASAR — Variaciones sin repetición */}
        <Panel className="analyst-card">
          <div className="analyst-title">
            <span className="analyst-mark">B</span>
            <div>
              <small>UNIDAD DE ANÁLISIS</small>
              <h2>BALTHASAR</h2>
            </div>
            <LockKeyhole size={15} />
          </div>
          <div className="metric-label">
            VARIACIONES SIN REPETICIÓN<span>n!/(n−k)!</span>
          </div>
          <div className="metric-value">
            {stats.noRep ? sci(stats.noRep) : 'N/A'}
          </div>
          <div className="full-value">
            {stats.noRep ? (
              <>
                ENTERO COMPLETO: <b>{formatBig(stats.noRep)}</b>
              </>
            ) : (
              <>
                NO POSIBLE: <b>k ({stats.k}) excede n ({stats.sets})</b>
              </>
            )}
          </div>
          {verProc && (
            <>
              <div className="deriv-head">
                <Divide size={11} /> DESARROLLO — PRODUCTO DESCENDENTE
              </div>
              <div className="derivation">
                <Paso n={1} label="Fórmula general — variaciones sin repetición">
                  V(n, k) = n · (n−1) · (n−2) · … · (n−k+1) = n! / (n−k)!
                </Paso>
                <Paso n={2} label="Sustitución de los datos">
                  V({stats.sets}, {stats.k}) = {stats.sets}! / ({stats.sets} − {stats.k})!
                  {stats.puedeSinRep && ` = ${stats.sets}! / ${stats.sets - stats.k}!`}
                </Paso>
                {stats.puedeSinRep ? (
                  <>
                    <Paso n={3} label="Producto descendente: cada etapa pierde una opción">
                      {stats.devNoRep}
                    </Paso>
                    <Paso n={4} label="Resultado">
                      = <b>{sci(stats.noRep)}</b>
                    </Paso>
                    <Paso n={5} label="Comparación con MELCHIOR (n^k)">
                      V / VR = <b>{stats.porcNoRep.toFixed(2)} %</b> — prohibir
                      repeticiones <b>reduce</b> el espacio de claves
                    </Paso>
                  </>
                ) : (
                  <Paso n={3} label="Principio del palomar (casillas y palomas)">
                    k = {stats.k} &gt; n = {stats.sets} ⇒ hay más posiciones que símbolos
                    disponibles, así que <b>alguna letra debe repetirse</b> por fuerza.
                    V(n, k) no está definida.
                  </Paso>
                )}
              </div>
              <Teoria>
                Si <b>prohibimos repetir</b> caracteres, la primera posición admite n
                opciones, la segunda sólo n−1 (ya se gastó un símbolo), la tercera n−2, y
                así hasta la k-ésima con n−k+1. Ese producto descendente se abrevia como{' '}
                <b>n! / (n−k)!</b>. Es siempre <b>menor</b> que n<sup>k</sup>, lo que
                demuestra un resultado clave: <b>obligar a no repetir debilita la clave</b>{' '}
                porque encoge el espacio de búsqueda. Cuando k &gt; n, el{' '}
                <b>principio del palomar</b> garantiza que la repetición es inevitable.
              </Teoria>
            </>
          )}

          <div className="card-bottom">
            <span>
              FÓRMULA{' '}
              <b>
                {stats.sets}!/({stats.sets}−{stats.k})!
              </b>
            </span>
            <span>
              BITS <b>{stats.bits.toFixed(1)}</b>
            </span>
          </div>
        </Panel>

        {/* CASPAR — Permutaciones k! */}
        <Panel className="analyst-card">
          <div className="analyst-title">
            <span className="analyst-mark">C</span>
            <div>
              <small>UNIDAD DE ANÁLISIS</small>
              <h2>CASPAR</h2>
            </div>
            <LockKeyhole size={15} />
          </div>
          <div className="metric-label">
            PERMUTACIONES (k!)<span>{stats.k}!</span>
          </div>
          <div className="metric-value">{sci(stats.perm)}</div>
          <div className="full-value">
            ENTERO COMPLETO: <b>{formatBig(stats.perm)}</b>
          </div>
          {verProc && (
            <>
              <div className="deriv-head">
                <Layers size={11} /> DESARROLLO — ORDENACIONES
              </div>
              <div className="derivation">
                <Paso n={1} label="Fórmula general — permutaciones de k elementos">
                  P(k) = k!
                </Paso>
                <Paso n={2} label="Sustitución y desarrollo del factorial">
                  {stats.k}! = {stats.devPerm}
                </Paso>
                <Paso n={3} label="Resultado">
                  = <b>{sci(stats.perm)}</b> ordenaciones
                </Paso>
                <Paso n={4} label="Corrección por repetidos — permutaciones con repetición">
                  PR = k! / (r₁!·r₂!·…·r<sub>m</sub>!) = {stats.k}! / ({stats.divisorTxt})
                </Paso>
                <Paso n={5} label="Resultado distinguible">
                  = <b>{formatBig(stats.permDist)}</b>
                </Paso>
                <Paso n={6} label="Multiplicidades detectadas">
                  {stats.tieneRepetidos
                    ? stats.repChars.join(' · ')
                    : 'ninguna repetición ⇒ el divisor es 1 y PR = k!'}
                </Paso>
              </div>
              <Teoria>
                Aquí no contamos claves nuevas, sino{' '}
                <b>reordenaciones de estos mismos {stats.k} caracteres</b> (sus anagramas).
                Con todos distintos hay k! ordenaciones. Si un carácter se repite r veces,
                sus r! intercambios producen <b>la misma cadena</b>, así que hay que
                dividir entre r! para no contar de más — es el{' '}
                <b>coeficiente multinomial</b>. Mide el esfuerzo de un atacante que ya
                conoce <i>qué</i> caracteres usaste pero no <i>en qué orden</i>.
              </Teoria>
            </>
          )}

          <div className="card-bottom">
            <span>
              DISTINGUIBLES <b>{formatBig(stats.permDist)}</b>
            </span>
            <span>
              REPETIDOS{' '}
              <b>{stats.tieneRepetidos ? stats.repeatedFactorials.join('·') : 'NO'}</b>
            </span>
          </div>
        </Panel>
      </div>

      {/* ── MARCO TEÓRICO ── */}
      {verProc && (
        <>
          <div className="section-rule">
            <span>MARCO TEÓRICO — TÉCNICAS DE CONTEO</span>
            <span>MATEMÁTICAS PARA LA INFORMÁTICA</span>
          </div>

          <Panel className="theory-panel">
            <div className="theory-grid">
              <Teorema
                icon={<Calculator size={13} />}
                titulo="1. Regla de la suma"
                formula="Si A ∩ B = ∅  ⇒  |A ∪ B| = |A| + |B|"
              >
                Los cuatro conjuntos de caracteres (mayúsculas, minúsculas, dígitos y
                símbolos) son <b>disjuntos</b>: ningún carácter pertenece a dos a la vez.
                Por eso el alfabeto se obtiene <b>sumando</b> sus tamaños:{' '}
                <code>{stats.sumaN} = {stats.sets}</code>. Se usa cuando las opciones son
                <b> alternativas excluyentes</b> («o esto o lo otro»).
              </Teorema>

              <Teorema
                icon={<Sigma size={13} />}
                titulo="2. Regla del producto"
                formula="n₁ · n₂ · … · nₖ   →   n^k  si todas son iguales"
              >
                Cuando una tarea se descompone en <b>etapas sucesivas e independientes</b>{' '}
                («esto y luego lo otro»), el total es el <b>producto</b> de las opciones de
                cada etapa. Elegir la clave = elegir el carácter 1 <i>y</i> el 2 <i>y</i>…
                el {stats.k}. Es el fundamento de <b>MELCHIOR</b>.
              </Teorema>

              <Teorema
                icon={<Layers size={13} />}
                titulo="3. Variaciones con repetición"
                formula="VR(n, k) = n^k"
              >
                Se eligen k elementos de un conjunto de n <b>importando el orden</b> y{' '}
                <b>pudiendo repetir</b>. Es exactamente el caso de una contraseña: «ab» ≠
                «ba» (importa el orden) y «aa» es válida (se repite). Da el{' '}
                <b>espacio muestral completo</b>.
              </Teorema>

              <Teorema
                icon={<Divide size={13} />}
                titulo="4. Variaciones sin repetición"
                formula="V(n, k) = n! / (n − k)!"
              >
                Mismo caso pero <b>sin poder repetir</b>: cada elección consume un símbolo
                del alfabeto, así que las opciones bajan de n a n−1, n−2… Siempre resulta{' '}
                <b>menor</b> que n^k. Es <b>BALTHASAR</b>, y demuestra que exigir
                caracteres distintos <b>reduce</b> la seguridad.
              </Teorema>

              <Teorema
                icon={<Hash size={13} />}
                titulo="5. Permutaciones (con y sin repetición)"
                formula={
                  <>
                    P(k) = k!
                    <br />
                    PR = k! / (r₁! · r₂! · … · rₘ!)
                  </>
                }
              >
                Cuentan las <b>reordenaciones</b> de los k caracteres que ya tienes. Si
                todos son distintos hay k!. Si uno se repite r veces, sus r!
                intercambios generan la misma cadena y hay que dividir: es el{' '}
                <b>coeficiente multinomial</b>. Es <b>CASPAR</b>.
              </Teorema>

              <Teorema
                icon={<Binary size={13} />}
                titulo="6. Del conteo a la información"
                formula="H = log₂(n^k) = k · log₂(n)   [bits]"
              >
                La <b>entropía</b> traduce el conteo a bits: es el número de preguntas
                sí/no necesarias para adivinar la clave. Aquí{' '}
                <b>H = {stats.bits.toFixed(1)} bits</b>. Y el{' '}
                <b>principio del palomar</b> cierra el marco: si k &gt; n, alguna posición
                repite símbolo obligatoriamente.
              </Teorema>
            </div>

            {/* Desarrollo del tiempo de fuerza bruta */}
            <div className="deriv-head" style={{ marginTop: 22 }}>
              <Activity size={11} /> DESARROLLO — TIEMPO DE FUERZA BRUTA
            </div>
            <div className="derivation derivation-wide">
              <Paso n={1} label="Modelo: recorrer todo el espacio muestral a R intentos/segundo">
                T = VR / R,  donde VR = n<sup>k</sup> y R = 10⁶ intentos/s
              </Paso>
              <Paso n={2} label="Sustitución">
                T = {sci(stats.rep)} / 10⁶
              </Paso>
              <Paso n={3} label="Resultado en segundos y en unidades legibles">
                T ≈ <b>{stats.tiempoFmt}</b>
              </Paso>
              <Paso n={4} label="Nota metodológica">
                Es el <b>peor caso</b> para el atacante (probar todas las claves). En
                promedio bastaría con la mitad, VR/2, lo que no cambia el orden de
                magnitud.
              </Paso>
            </div>
          </Panel>
        </>
      )}

      {/* ── MÉTRICAS DE PIE ── */}
      <Panel className="footer-metrics">
        <div>
          <Activity size={16} />
          <span>TIEMPO FUERZA BRUTA</span>
          <b>{stats.tiempoFmt}</b>
        </div>
        <div>
          <Zap size={16} />
          <span>TASA DE INTENTOS</span>
          <b>1.000.000 / SEG</b>
        </div>
        <div>
          <ShieldCheck size={16} />
          <span>INTEGRIDAD</span>
          <b className={valid ? 'green' : 'red'}>
            {valid ? 'SEGURA' : 'COMPROMETIDA'}
          </b>
        </div>
      </Panel>

      {/* ── PIE DE PÁGINA ── */}
      <footer>
        MAGI-01 // TÉCNICAS DE CONTEO
        <span>
          {stats.tipos.join(' | ')}
        </span>
        <span>
          SYNC: 100% <i className="led led-green" />
        </span>
      </footer>
    </main>
  )
}
