"""
╔═══════════════════════════════════════════════════════════════════╗
║  Gestor, Generador y Evaluador de Contraseñas                    ║
║  Técnicas de Conteo — Matemáticas de la Informática Avanzada     ║
║                                                                   ║
║  Backend / Lógica pura (sin interfaz gráfica).                    ║
║  Diseñado para ser consumido por cualquier frontend moderno.      ║
╚═══════════════════════════════════════════════════════════════════╝
"""

import string
import random
import math
from collections import Counter

# ═══════════════════════════════════════════════════════════════════
#  CONSTANTES
# ═══════════════════════════════════════════════════════════════════
MAYUSCULAS = string.ascii_uppercase   # 26 caracteres (A-Z)
MINUSCULAS = string.ascii_lowercase   # 26 caracteres (a-z)
DIGITOS    = string.digits            # 10 caracteres (0-9)
SIMBOLOS   = string.punctuation       # 32 caracteres (!@#$%...)

INTENTOS_POR_SEGUNDO = 1_000_000      # Tasa de fuerza bruta


# ═══════════════════════════════════════════════════════════════════
#  MOTOR MATEMÁTICO — Técnicas de Conteo
# ═══════════════════════════════════════════════════════════════════
def calcular_alfabeto(contrasena: str) -> tuple[int, list[str]]:
    """Determina n (tamaño del alfabeto) según los tipos de
    caracteres presentes en la contraseña.

    Retorna: (n, lista_de_tipos_encontrados)
    """
    n = 0
    tipos = []
    if any(c in MAYUSCULAS for c in contrasena):
        n += 26;  tipos.append("Mayúsculas (+26)")
    if any(c in MINUSCULAS for c in contrasena):
        n += 26;  tipos.append("Minúsculas (+26)")
    if any(c in DIGITOS for c in contrasena):
        n += 10;  tipos.append("Dígitos (+10)")
    if any(c in SIMBOLOS for c in contrasena):
        n += 32;  tipos.append("Símbolos (+32)")
    return n, tipos


def espacio_muestral(n: int, k: int) -> int:
    """Variaciones CON repetición (Principio Multiplicativo).
    S = n^k"""
    if n == 0 or k == 0:
        return 0
    return n ** k


def variaciones_sin_rep(n: int, k: int) -> int:
    """Variaciones SIN repetición.
    V(n,k) = n! / (n-k)!
    Solo posible si k <= n."""
    if k > n or n == 0:
        return 0
    return math.factorial(n) // math.factorial(n - k)


def permutaciones(k: int) -> int:
    """Permutaciones totales.
    P(k) = k!"""
    return math.factorial(k)


def permutaciones_distinguibles(contrasena: str) -> int:
    """Permutaciones con elementos repetidos.
    P = k! / (r1! * r2! * ... * rm!)
    Donde ri es la frecuencia del carácter i."""
    k = len(contrasena)
    frecuencias = Counter(contrasena)
    denominador = 1
    for freq in frecuencias.values():
        denominador *= math.factorial(freq)
    return math.factorial(k) // denominador


def tiempo_fuerza_bruta(espacio_total: int) -> float:
    """Segundos = espacio_total / INTENTOS_POR_SEGUNDO"""
    if espacio_total == 0:
        return 0
    return espacio_total / INTENTOS_POR_SEGUNDO


def entropia_bits(n: int, k: int) -> float:
    """Bits de entropía = k * log2(n)"""
    if n <= 0 or k <= 0:
        return 0
    return k * math.log2(n)


# ═══════════════════════════════════════════════════════════════════
#  FORMATO DE NÚMEROS Y TIEMPO
# ═══════════════════════════════════════════════════════════════════
def fmt_numero(n: int) -> str:
    """Formatea un entero grande de forma legible."""
    if n == 0:
        return "0"
    if abs(n) < 10**15:
        return f"{n:,}"
    exp = len(str(abs(n))) - 1
    mantisa = n / (10 ** exp)
    return f"{mantisa:.2f} × 10^{exp}"


def fmt_tiempo(segundos: float) -> str:
    """Convierte segundos a la unidad de tiempo más adecuada."""
    if segundos < 0.001:
        return "Instantáneo"
    if segundos < 1:
        return "< 1 segundo"
    if segundos < 60:
        return f"{segundos:.0f} segundos"
    if segundos < 3600:
        return f"{segundos / 60:.1f} minutos"
    if segundos < 86400:
        return f"{segundos / 3600:.1f} horas"
    if segundos < 31_536_000:
        return f"{segundos / 86400:.0f} días"
    anios = segundos / 31_536_000
    if anios < 1_000:
        return f"{anios:.1f} años"
    if anios < 1e6:
        return f"{anios:,.0f} años"
    if anios < 1e9:
        return f"{anios / 1e6:,.1f} millones de años"
    if anios < 1e12:
        return f"{anios / 1e9:,.1f} mil millones de años"
    exp = math.floor(math.log10(anios))
    mantisa = anios / (10 ** exp)
    return f"{mantisa:.2f} × 10^{exp} años"


# ═══════════════════════════════════════════════════════════════════
#  VALIDACIÓN DE CONTRASEÑAS
# ═══════════════════════════════════════════════════════════════════
def validar(contrasena: str) -> dict:
    """Valida la contraseña contra las reglas de seguridad.

    Retorna un dict con cada criterio y si se cumple (bool).
    """
    return {
        "longitud":  len(contrasena) >= 12,
        "mayuscula": any(c in MAYUSCULAS for c in contrasena),
        "numero":    any(c in DIGITOS for c in contrasena),
        "especial":  any(c in SIMBOLOS for c in contrasena),
    }


def nivel_fortaleza(n: int, k: int) -> dict:
    """Calcula el nivel de fortaleza basado en bits de entropía.

    Retorna: { bits, nivel, color_hex, porcentaje_barra (0-1) }
    """
    bits = entropia_bits(n, k)
    if bits < 30:
        nivel, color = "Muy débil", "#e74c3c"
    elif bits < 50:
        nivel, color = "Débil", "#e67e22"
    elif bits < 65:
        nivel, color = "Moderada", "#f39c12"
    elif bits < 90:
        nivel, color = "Fuerte", "#27ae60"
    else:
        nivel, color = "Muy fuerte", "#00695c"

    return {
        "bits": round(bits, 1),
        "nivel": nivel,
        "color": color,
        "porcentaje": min(bits / 128, 1.0),
    }


# ═══════════════════════════════════════════════════════════════════
#  GENERADOR DE CONTRASEÑAS
# ═══════════════════════════════════════════════════════════════════
def generar(longitud: int = 16,
            usar_mayusculas: bool = True,
            usar_minusculas: bool = True,
            usar_digitos: bool = True,
            usar_simbolos: bool = True) -> str:
    """Genera una contraseña aleatoria garantizando al menos
    un carácter de cada tipo seleccionado."""
    pool = ""
    obligatorios = []

    if usar_mayusculas:
        pool += MAYUSCULAS
        obligatorios.append(random.choice(MAYUSCULAS))
    if usar_minusculas:
        pool += MINUSCULAS
        obligatorios.append(random.choice(MINUSCULAS))
    if usar_digitos:
        pool += DIGITOS
        obligatorios.append(random.choice(DIGITOS))
    if usar_simbolos:
        pool += SIMBOLOS
        obligatorios.append(random.choice(SIMBOLOS))

    if not pool:
        return ""

    restantes = max(0, longitud - len(obligatorios))
    chars = obligatorios + [random.choice(pool) for _ in range(restantes)]
    random.shuffle(chars)
    return "".join(chars[:longitud])


# ═══════════════════════════════════════════════════════════════════
#  EVALUACIÓN COMPLETA (función principal)
# ═══════════════════════════════════════════════════════════════════
def evaluar(contrasena: str) -> dict:
    """Ejecuta TODOS los análisis sobre una contraseña.

    Retorna un diccionario completo con validación, cálculos
    matemáticos, fortaleza y fórmulas formateadas.
    """
    if not contrasena:
        return {"error": "Contraseña vacía"}

    k = len(contrasena)
    n, tipos = calcular_alfabeto(contrasena)

    S  = espacio_muestral(n, k)
    V  = variaciones_sin_rep(n, k)
    P  = permutaciones(k)
    PD = permutaciones_distinguibles(contrasena)
    T  = tiempo_fuerza_bruta(S)

    freq = Counter(contrasena)
    tiene_repetidos = any(v > 1 for v in freq.values())

    return {
        # Parámetros base
        "n": n,
        "k": k,
        "tipos": tipos,

        # Validación de reglas
        "validacion": validar(contrasena),

        # Fortaleza
        "fortaleza": nivel_fortaleza(n, k),

        # Cálculos matemáticos (valores como string para JSON)
        "matematicas": {
            "espacio_muestral": str(S),
            "variaciones_sin_rep": str(V),
            "permutaciones": str(P),
            "permutaciones_distinguibles": str(PD),
            "tiempo_segundos": T,
            "tiene_repetidos": tiene_repetidos,
            "frecuencias": dict(freq),
        },

        # Cálculos formateados para mostrar en UI
        "formateado": {
            "espacio_muestral": f"{n}^{k} = {fmt_numero(S)}",
            "variaciones_sin_rep": (
                f"{n}!/({n}-{k})! = {fmt_numero(V)}" if k <= n
                else f"No posible (k={k} > n={n})"
            ),
            "permutaciones": f"{k}! = {fmt_numero(P)}",
            "permutaciones_distinguibles": (
                f"{k}! / ({' × '.join(f'{v}!' for v in freq.values() if v > 1)}) = {fmt_numero(PD)}"
                if tiene_repetidos
                else f"{k}! = {fmt_numero(PD)} (sin caracteres repetidos)"
            ),
            "tiempo": f"{fmt_tiempo(T)} (a 10^6 intentos/seg)",
        },
    }


# ═══════════════════════════════════════════════════════════════════
#  PRUEBA RÁPIDA (ejecutar directamente para verificar)
# ═══════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    ejemplos = [
        "c4fe#Tigre79!Nube",
        "m4R3a_Azul#2026",
        "Sol#Verde_8492",
        generar(16),
    ]

    for pwd in ejemplos:
        print(f"\n{'='*60}")
        print(f"  Contrasena: {pwd}")
        print(f"{'='*60}")
        r = evaluar(pwd)

        print(f"  Alfabeto (n) = {r['n']}   Longitud (k) = {r['k']}")
        tipos_ascii = [t.replace("ú","u").replace("í","i") for t in r['tipos']]
        print(f"  Tipos: {', '.join(tipos_ascii)}")

        print(f"\n  --- Validacion ---")
        for crit, ok in r["validacion"].items():
            sym = "[OK]" if ok else "[X] "
            print(f"    {sym} {crit}")

        print(f"\n  --- Matematicas ---")
        for nombre, valor in r["formateado"].items():
            print(f"    {nombre}: {valor}")

        f = r["fortaleza"]
        print(f"\n  Fortaleza: {f['nivel']} ({f['bits']} bits)")
