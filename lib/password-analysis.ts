/**
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║  Gestor, Generador y Evaluador de Contraseñas                     ║
 * ║  Técnicas de Conteo — Matemáticas de la Informática Avanzada      ║
 * ║                                                                   ║
 * ║  LÓGICA PURA. Sin React, sin JSX, sin nada visual.                ║
 * ║  Es el equivalente TypeScript de `gestor_contrasenas.py`.         ║
 * ║                                                                   ║
 * ║  Este archivo se puede leer, explicar y probar por sí solo.       ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 */

/* ═══════════════════════════════════════════════════════════════════
   CONSTANTES
   ═══════════════════════════════════════════════════════════════════ */
export const MAYUSCULAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' // 26 caracteres
export const MINUSCULAS = 'abcdefghijklmnopqrstuvwxyz' // 26 caracteres
export const DIGITOS = '0123456789' //                    10 caracteres
export const SIMBOLOS = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/~`\\' // 32 caracteres

/** Tasa de fuerza bruta asumida: 10^6 intentos por segundo. */
export const INTENTOS_POR_SEGUNDO = 1_000_000

/* Paleta de estado. Son EXACTAMENTE los tres colores de marca definidos
   en app/globals.css (--red, --orange, --green). No se usan otros tonos:
   así el robot muestra el mismo color escribiendo que al generar. */
export const ROJO = '#ff0033'
export const NARANJA = '#ff5500'
export const VERDE = '#00ff66'

/* ═══════════════════════════════════════════════════════════════════
   MOTOR MATEMÁTICO — Técnicas de Conteo
   ═══════════════════════════════════════════════════════════════════ */

/** k! — factorial. Devuelve BigInt porque los valores desbordan Number. */
export function factorial(n: number): bigint {
  let r = 1n
  for (let i = 2; i <= n; i++) r *= BigInt(i)
  return r
}

/**
 * Determina n (tamaño del alfabeto) por la REGLA DE LA SUMA:
 * los conjuntos de caracteres son disjuntos, así que n = |A| + |B| + ...
 */
export function calcularAlfabeto(contrasena: string) {
  const hayMayus = /[A-Z]/.test(contrasena)
  const hayMinus = /[a-z]/.test(contrasena)
  const hayDigito = /\d/.test(contrasena)
  const haySimbolo = /[^A-Za-z0-9]/.test(contrasena)

  const partes: number[] = []
  const tipos: string[] = []
  if (hayMayus) { partes.push(26); tipos.push('Mayúsculas (+26)') }
  if (hayMinus) { partes.push(26); tipos.push('Minúsculas (+26)') }
  if (hayDigito) { partes.push(10); tipos.push('Dígitos (+10)') }
  if (haySimbolo) { partes.push(32); tipos.push('Símbolos (+32)') }

  const n = partes.reduce((a, b) => a + b, 0)
  return { n, tipos, partes }
}

/** Variaciones CON repetición (principio multiplicativo): S = n^k */
export function espacioMuestral(n: number, k: number): bigint {
  if (n === 0 || k === 0) return 0n
  return BigInt(n) ** BigInt(k)
}

/** Variaciones SIN repetición: V(n,k) = n! / (n−k)!  — sólo si k <= n */
export function variacionesSinRep(n: number, k: number): bigint {
  if (k > n || n === 0) return 0n
  return factorial(n) / factorial(n - k)
}

/** Permutaciones totales: P(k) = k! */
export function permutaciones(k: number): bigint {
  return factorial(k)
}

/** Frecuencia de cada carácter (para el coeficiente multinomial). */
export function frecuencias(contrasena: string): Record<string, number> {
  const freq: Record<string, number> = {}
  for (const c of contrasena) freq[c] = (freq[c] || 0) + 1
  return freq
}

/**
 * Permutaciones con elementos repetidos (coeficiente multinomial):
 * P = k! / (r1! · r2! · … · rm!)
 */
export function permutacionesDistinguibles(contrasena: string): bigint {
  const freq = frecuencias(contrasena)
  let denominador = 1n
  for (const v of Object.values(freq)) denominador *= factorial(v)
  return factorial(contrasena.length) / denominador
}

/** Segundos = espacio_total / INTENTOS_POR_SEGUNDO */
export function tiempoFuerzaBruta(espacioTotal: bigint): number {
  if (espacioTotal === 0n) return 0
  return Number(espacioTotal) / INTENTOS_POR_SEGUNDO
}

/** Bits de entropía = k · log2(n) */
export function entropiaBits(n: number, k: number): number {
  if (n <= 0 || k <= 0) return 0
  return k * Math.log2(n)
}

/* ═══════════════════════════════════════════════════════════════════
   FORMATO DE NÚMEROS Y TIEMPO
   ═══════════════════════════════════════════════════════════════════ */

/** Entero completo con separadores de miles: 1.234.567 */
export function formatBig(value: bigint): string {
  return value.toLocaleString('es-ES')
}

/**
 * Descompone un entero en notación científica: 4.47 y 25 para 4.47 × 10^25.
 *
 * Devuelve las piezas por separado en vez de una cadena, porque el
 * exponente hay que pintarlo con <sup> real. Los superíndices Unicode
 * NO sirven: ¹ ² ³ son caracteres heredados de Latin-1 (U+00B9/B2/B3)
 * y el resto vienen del bloque Superscripts (U+2070, U+2074…U+2079),
 * así que las fuentes los dibujan a tamaños distintos y un exponente
 * como 25 sale descuadrado. Unicode no ofrece un juego uniforme.
 */
export function sciPartes(value: bigint): { mantisa: string; exp: number } {
  if (value === 0n) return { mantisa: '0', exp: 0 }
  const s = value.toString()
  const exp = s.length - 1
  return { mantisa: `${s[0]}.${s.slice(1, 3).padEnd(2, '0')}`, exp }
}

/** Convierte segundos a la unidad de tiempo más adecuada. */
export function fmtTiempo(segundos: number): string {
  if (segundos < 0.001) return 'Instantáneo'
  if (segundos < 1) return '< 1 segundo'
  if (segundos < 60) return `${segundos.toFixed(0)} segundos`
  if (segundos < 3600) return `${(segundos / 60).toFixed(1)} minutos`
  if (segundos < 86400) return `${(segundos / 3600).toFixed(1)} horas`
  if (segundos < 31_536_000) return `${(segundos / 86400).toFixed(0)} días`
  const anios = segundos / 31_536_000
  if (anios < 1_000) return `${anios.toFixed(1)} años`
  if (anios < 1e6) return `${Math.round(anios).toLocaleString('es-ES')} años`
  if (anios < 1e9) return `${(anios / 1e6).toFixed(1)} millones de años`
  if (anios < 1e12) return `${(anios / 1e9).toFixed(1)} mil millones de años`
  const exp = Math.floor(Math.log10(anios))
  const m = anios / 10 ** exp
  return `${m.toFixed(2)} × 10^${exp} años`
}

/* ═══════════════════════════════════════════════════════════════════
   VALIDACIÓN DE CONTRASEÑAS
   ═══════════════════════════════════════════════════════════════════ */
export const REGLAS: { etiqueta: string; cumple: (p: string) => boolean }[] = [
  { etiqueta: 'LONGITUD >= 12', cumple: (p) => p.length >= 12 },
  { etiqueta: 'MAYÚSCULAS: A-Z', cumple: (p) => /[A-Z]/.test(p) },
  { etiqueta: 'NÚMEROS: 0-9', cumple: (p) => /\d/.test(p) },
  { etiqueta: 'ESPECIALES: #, _, !', cumple: (p) => /[^A-Za-z0-9]/.test(p) },
]

/** Evalúa cada regla en orden. Devuelve un booleano por regla. */
export function validar(contrasena: string): boolean[] {
  return REGLAS.map((r) => r.cumple(contrasena))
}

/** Cumple TODAS las reglas. */
export function esValida(contrasena: string): boolean {
  return validar(contrasena).every(Boolean)
}

/** Cumple todas las reglas y además mide 16 o más. */
export function esFuerte(contrasena: string): boolean {
  return esValida(contrasena) && contrasena.length >= 16
}

/** Entropía a partir de la cual una clave que ya cumple las reglas
 *  se considera excelente. 90 bits ≈ 14 caracteres del alfabeto completo. */
export const BITS_MUY_FUERTE = 90

/**
 * Nivel de fortaleza. Es lo que da su color al robot.
 *
 * Se apoya en DOS criterios, y por eso no es sólo la entropía:
 *
 *  1. Si falla cualquier regla de `validar`, la clave es insegura y va
 *     en ROJO por muchos bits que tenga. Así el robot dice lo mismo que
 *     la lista de comprobación y el aviso CRÍTICO: sin esto, generar una
 *     clave de 8 caracteres (52 bits) marcaba «RIESGO DE BRECHA» en el
 *     panel mientras el robot seguía en naranja.
 *  2. Ya cumpliendo las reglas, la entropía separa lo correcto de lo
 *     excelente.
 */
export function nivelFortaleza(contrasena: string) {
  const { n } = calcularAlfabeto(contrasena)
  const k = contrasena.length
  const bits = entropiaBits(n, k)

  let nivel: string
  let color: string
  if (!esValida(contrasena)) { nivel = 'Insegura'; color = ROJO }
  else if (bits < BITS_MUY_FUERTE) { nivel = 'Segura'; color = NARANJA }
  else { nivel = 'Muy fuerte'; color = VERDE }

  return {
    bits: Math.round(bits * 10) / 10,
    nivel,
    color,
    porcentaje: Math.min(bits / 128, 1),
  }
}

/* ═══════════════════════════════════════════════════════════════════
   GENERADOR DE CONTRASEÑAS
   ═══════════════════════════════════════════════════════════════════ */

/**
 * Genera una contraseña aleatoria garantizando al menos un carácter
 * de cada tipo seleccionado.
 */
export function generarContrasena(
  longitud: number,
  usarMayus: boolean,
  usarMinus: boolean,
  usarDigitos: boolean,
  usarSimbolos: boolean,
): string {
  let pool = ''
  const obligatorios: string[] = []
  const tomar = (set: string) => set[Math.floor(Math.random() * set.length)]

  if (usarMayus) { pool += MAYUSCULAS; obligatorios.push(tomar(MAYUSCULAS)) }
  if (usarMinus) { pool += MINUSCULAS; obligatorios.push(tomar(MINUSCULAS)) }
  if (usarDigitos) { pool += DIGITOS; obligatorios.push(tomar(DIGITOS)) }
  if (usarSimbolos) { pool += SIMBOLOS; obligatorios.push(tomar(SIMBOLOS)) }
  if (!pool) return ''

  const chars = [...obligatorios]
  for (let i = 0; i < longitud - obligatorios.length; i++) chars.push(tomar(pool))

  // Barajado Fisher-Yates: si no, los obligatorios quedarían siempre al inicio.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars.slice(0, longitud).join('')
}

/* ═══════════════════════════════════════════════════════════════════
   EVALUACIÓN COMPLETA (función principal)
   ═══════════════════════════════════════════════════════════════════ */

export type Analisis = ReturnType<typeof evaluar>

/**
 * Ejecuta TODOS los análisis sobre una contraseña y devuelve tanto los
 * valores numéricos como el desarrollo paso a paso ya formateado.
 */
export function evaluar(contrasena: string) {
  const k = contrasena.length
  const { n: sets, tipos, partes } = calcularAlfabeto(contrasena)
  const n = BigInt(Math.max(sets, 1))

  // 1. Espacio muestral n^k
  const rep = espacioMuestral(Math.max(sets, 1), k)

  // 2. Variaciones sin repetición n!/(n−k)!
  const puedeSinRep = k <= sets && sets > 0 && k > 0
  const noRep = puedeSinRep ? variacionesSinRep(sets, k) : 0n

  // 3. Permutaciones k!
  const perm = permutaciones(k)

  // 4. Permutaciones distinguibles k! / (r1!·r2!·…·rm!)
  const freq = frecuencias(contrasena)
  const permDist = permutacionesDistinguibles(contrasena)
  const repeatedFactorials = Object.values(freq)
    .filter((v) => v > 1)
    .map((v) => `${v}!`)
  const tieneRepetidos = repeatedFactorials.length > 0

  // 5. Tiempo de fuerza bruta y entropía
  const tiempoSeg = tiempoFuerzaBruta(rep)
  const tiempoFmt = fmtTiempo(tiempoSeg)
  const bits = entropiaBits(sets, k)
  const fortaleza = nivelFortaleza(contrasena)

  /* ── Desarrollo paso a paso (notación matemática lista para mostrar) ── */

  // Regla de la suma: n se obtiene sumando conjuntos disjuntos
  const sumaN = partes.join(' + ')

  // Producto de k factores iguales
  const devRep =
    k <= 6 && k > 0
      ? Array.from({ length: k }, () => sets).join(' × ')
      : `${sets} × ${sets} × ${sets} × … × ${sets}`

  // Producto descendente n(n−1)…(n−k+1)
  const devNoRep = !puedeSinRep
    ? ''
    : k <= 5
      ? Array.from({ length: k }, (_, i) => sets - i).join(' × ')
      : `${sets} × ${sets - 1} × ${sets - 2} × … × ${sets - k + 1}`

  // Qué porcentaje del espacio total queda al prohibir repeticiones
  const porcNoRep =
    noRep > 0n && rep > 0n ? Number((noRep * 10000n) / rep) / 100 : 0

  // Desarrollo de k!
  const devPerm =
    k <= 6 && k > 0
      ? Array.from({ length: k }, (_, i) => k - i).join(' × ')
      : `${k} × ${k - 1} × ${k - 2} × … × 2 × 1`

  // Multiplicidades > 1 (para el coeficiente multinomial)
  const repChars = Object.entries(freq)
    .filter(([, v]) => v > 1)
    .map(([c, v]) => `'${c}' aparece ${v} veces`)
  const divisorTxt = repeatedFactorials.length
    ? repeatedFactorials.join(' × ')
    : '1'

  return {
    // Parámetros base
    sets, tipos, k, n,
    // Resultados de conteo
    rep, noRep, perm, permDist,
    tieneRepetidos, repeatedFactorials,
    // Tiempo y entropía
    tiempoSeg, tiempoFmt, bits, fortaleza,
    // Desarrollo paso a paso
    sumaN, partes, devRep, puedeSinRep, devNoRep, porcNoRep,
    devPerm, repChars, divisorTxt,
  }
}
