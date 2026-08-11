export type ParametroPoblacional = 'media' | 'total' | 'proporcion';
export type NivelConfianza = 95 | 99;

export function redondear(numero: number, digitos: number): number {
    const cifras = Math.pow(10, digitos);
    return Math.round(numero * cifras) / cifras;
}

function zFor(ic: NivelConfianza): number {
    return ic === 95 ? 1.96 : 2.57;
}

export function calcularCPF(N: number, n: number): number {
    return redondear((N - n) / N, 2);
}

export function formatPValue(p: number): string {
    if (p < 0.0001) return '< 0.0001';
    return p.toFixed(4);
}

/* ===========================================================
   MUESTREO ALEATORIO SIMPLE (MAS)
   =========================================================== */

export interface ResultadoMAS {
    parametro: ParametroPoblacional;
    valorEstimado: number;
    varianza: number;
    limiteError: number;
    intervaloConfianza: [number, number];
    cpf: number;
}

export function calcularMAS(
    parametro: ParametroPoblacional,
    N: number,
    n: number,
    ic: NivelConfianza,
    observaciones: number[],
    elementosConCaracteristica?: number
): ResultadoMAS {
    const cpf = calcularCPF(N, n);
    const z = zFor(ic);

    if (parametro === 'proporcion') {
        const suma = elementosConCaracteristica && elementosConCaracteristica > 0
            ? elementosConCaracteristica
            : observaciones.reduce((a, b) => a + b, 0);
        const p = redondear(suma / n, 4);
        const q = 1 - p;
        const limite = redondear(z * Math.sqrt((p * q) / (n - 1)), 4);
        let varianza = (p * q) / (n - 1);
        if (cpf <= 0.95) varianza *= cpf;
        varianza = redondear(varianza, 4);
        return {
            parametro, valorEstimado: p, varianza, limiteError: limite, cpf,
            intervaloConfianza: [redondear(p - limite, 4), redondear(p + limite, 4)],
        };
    }

    const suma = observaciones.reduce((a, b) => a + b, 0);
    const media = redondear(suma / n, 4);
    let varianza = observaciones.reduce((acc, x) => acc + Math.pow(x - media, 2), 0) / (n - 1);
    if (cpf <= 0.95) varianza *= cpf;
    varianza = redondear(varianza, 4);

    if (parametro === 'media') {
        const limite = redondear(z * Math.sqrt(varianza / n), 4);
        return {
            parametro, valorEstimado: media, varianza, limiteError: limite, cpf,
            intervaloConfianza: [redondear(media - limite, 4), redondear(media + limite, 4)],
        };
    }

    // total
    const total = redondear(media * N, 4);
    const limite = redondear(z * Math.sqrt((N * N * varianza) / n), 4);
    return {
        parametro, valorEstimado: total, varianza, limiteError: limite, cpf,
        intervaloConfianza: [redondear(total - limite, 4), redondear(total + limite, 4)],
    };
}

export interface OpcionesTamanoMuestraMAS {
    estimacionVarianza?: number;
    amplitudVariacion?: number;
    proporcionEstimada?: number;
}

export function calcularTamanoMuestraMAS(
    parametro: ParametroPoblacional,
    N: number,
    limiteError: number,
    ic: NivelConfianza,
    opciones: OpcionesTamanoMuestraMAS
): number {
    const z = zFor(ic);

    if (parametro === 'proporcion') {
        const p = opciones.proporcionEstimada ?? 0;
        const q = 1 - p;
        const D = Math.pow(limiteError, 2) / Math.pow(z, 2);
        return redondear((N * p * q) / ((N - 1) * D + p * q), 2);
    }

    const r = opciones.estimacionVarianza !== undefined
        ? opciones.estimacionVarianza
        : Math.pow((opciones.amplitudVariacion ?? 0) / 4, 2);

    if (parametro === 'media') {
        const D = Math.pow(limiteError, 2) / Math.pow(z, 2);
        return redondear((N * r) / ((N - 1) * D + r), 2);
    }

    // total
    const D = Math.pow(limiteError, 2) / (Math.pow(z, 2) * Math.pow(N, 2));
    return redondear((N * r) / ((N - 1) * D + r), 2);
}

/* ===========================================================
   MUESTREO SISTEMÁTICO (MS)
   =========================================================== */

export type ResultadoMS = ResultadoMAS;

export function calcularK(N: number, n: number): number {
    return Math.round(N / n);
}

export function generarIndicesSistematicos(N: number, n: number, kElegido?: number): number[] {
    const K = kElegido ?? calcularK(N, n);
    const J = Math.floor(Math.random() * K) + 1;
    const indices: number[] = [];
    let actual = J;
    for (let i = 0; i < n; i++) {
        indices.push(actual);
        actual += K;
    }
    return indices;
}

export function calcularMS(
    parametro: ParametroPoblacional,
    N: number,
    n: number,
    ic: NivelConfianza,
    observaciones: number[],
    elementosConCaracteristica?: number
): ResultadoMS {
    if (parametro !== 'total') {
        return calcularMAS(parametro, N, n, ic, observaciones, elementosConCaracteristica);
    }
    const cpf = calcularCPF(N, n);
    const z = zFor(ic);
    const suma = observaciones.reduce((a, b) => a + b, 0);
    const media = redondear(suma / n, 4);
    const total = redondear(suma, 4);
    let varianza = observaciones.reduce((acc, x) => acc + Math.pow(x - media, 2), 0) / (n - 1);
    varianza = redondear(Math.pow(N, 2) * varianza * (cpf <= 0.95 ? cpf : 1), 4);
    const limite = redondear(z * Math.sqrt((N * N * varianza) / n), 4);
    return {
        parametro, valorEstimado: total, varianza, limiteError: limite, cpf,
        intervaloConfianza: [redondear(total - limite, 4), redondear(total + limite, 4)],
    };
}

export const calcularTamanoMuestraMS = calcularTamanoMuestraMAS;

/* ===========================================================
   MUESTREO ALEATORIO ESTRATIFICADO (MAE)
   =========================================================== */

export interface EstratoInputMAE {
    unidadesMuestrales: number;
    tamanoMuestra: number;      
}

export interface ResultadoMAE {
    parametro: ParametroPoblacional;
    valorEstimado: number;
    varianza: number;
    limiteError: number;
    intervaloConfianza: [number, number];
    mediasPorEstrato: number[];
}

export function calcularMAE(
    parametro: ParametroPoblacional,
    estratos: EstratoInputMAE[],
    observacionesPorEstrato: number[][],
    ic: NivelConfianza
): ResultadoMAE {
    const z = zFor(ic);
    const N = estratos.reduce((acc, e) => acc + e.unidadesMuestrales, 0);
    const mediasPorEstrato = estratos.map((e, i) => {
        const suma = observacionesPorEstrato[i].reduce((a, b) => a + b, 0);
        return suma / e.tamanoMuestra;
    });

    if (parametro === 'media') {
        const sumas = estratos.reduce((acc, e, i) => acc + e.unidadesMuestrales * mediasPorEstrato[i], 0);
        const media = redondear(sumas / N, 4);

        const varianzasEstrato = estratos.map((e, i) => {
            const suma = observacionesPorEstrato[i].reduce((acc, x) => acc + Math.pow(x - mediasPorEstrato[i], 2), 0);
            return suma / (e.tamanoMuestra - 1);
        });
        const sumaVar = estratos.reduce((acc, e, i) => {
            const Ni = e.unidadesMuestrales, ni = e.tamanoMuestra;
            return acc + Math.pow(Ni, 2) * (varianzasEstrato[i] / ni) * ((Ni - ni) / Ni);
        }, 0);
        const varianza = redondear(sumaVar / Math.pow(N, 2), 4);
        const limite = redondear(z * Math.sqrt(varianza), 4);
        return {
            parametro, valorEstimado: media, varianza, limiteError: limite, mediasPorEstrato,
            intervaloConfianza: [redondear(media - limite, 4), redondear(media + limite, 4)],
        };
    }

    if (parametro === 'total') {
        const sumas = estratos.reduce((acc, e, i) => acc + e.unidadesMuestrales * mediasPorEstrato[i], 0);
        const total = redondear(sumas, 4);

        const varianzasEstrato = estratos.map((e, i) => {
            const suma = observacionesPorEstrato[i].reduce((acc, x) => acc + Math.pow(x - mediasPorEstrato[i], 2), 0);
            return suma / (e.tamanoMuestra - 1);
        });
        const varianza = redondear(estratos.reduce((acc, e, i) => {
            const Ni = e.unidadesMuestrales, ni = e.tamanoMuestra;
            return acc + Math.pow(Ni, 2) * (varianzasEstrato[i] / ni) * ((Ni - ni) / Ni);
        }, 0), 4);
        const limite = redondear(z * Math.sqrt(varianza), 4);
        return {
            parametro, valorEstimado: total, varianza, limiteError: limite, mediasPorEstrato,
            intervaloConfianza: [redondear(total - limite, 4), redondear(total + limite, 4)],
        };
    }

    const proporcionesEstrato = mediasPorEstrato;
    const sumas = estratos.reduce((acc, e, i) => acc + e.unidadesMuestrales * proporcionesEstrato[i], 0);
    const p = redondear(sumas / N, 4);

    const varianza = redondear(estratos.reduce((acc, e, i) => {
        const Ni = e.unidadesMuestrales, ni = e.tamanoMuestra, pi = proporcionesEstrato[i];
        const vi = Math.pow(Ni, 2) * ((pi * (1 - pi)) / (ni - 1)) * ((Ni - ni) / Ni);
        return acc + vi;
    }, 0) / Math.pow(N, 2), 4);
    const limite = redondear(z * Math.sqrt(varianza), 4);
    return {
        parametro, valorEstimado: p, varianza, limiteError: limite, mediasPorEstrato: proporcionesEstrato,
        intervaloConfianza: [redondear(p - limite, 4), redondear(p + limite, 4)],
    };
}

export interface EstratoTamanoMuestraInput {
    unidadesMuestrales: number; 
    aproximacion: number;       
    fraccionAsignada: number;   
}

export function calcularTamanoMuestraMAE(
    parametro: ParametroPoblacional,
    estratos: EstratoTamanoMuestraInput[],
    limiteError: number,
    ic: NivelConfianza
): { totalMuestra: number; tamanosPorEstrato: number[] } {
    const z = zFor(ic);
    const N = estratos.reduce((acc, e) => acc + e.unidadesMuestrales, 0);

    let numerador = 0;
    let denominadorParcial = 0;
    for (const e of estratos) {
        const Ni = e.unidadesMuestrales;
        let ri: number;
        if (parametro === 'proporcion') {
            const p = e.aproximacion, q = 1 - p;
            ri = p * q;
        } else {
            ri = e.aproximacion;
        }
        numerador += Math.pow(Ni, 2) * ri / e.fraccionAsignada;
        denominadorParcial += Ni * ri;
    }

    let D: number;
    if (parametro === 'total') {
        D = Math.pow(limiteError, 2) / (Math.pow(z, 2) * Math.pow(N, 2));
    } else {
        D = Math.pow(limiteError, 2) / Math.pow(z, 2);
    }

    const denominador = Math.pow(N, 2) * D + denominadorParcial;
    const n = redondear(numerador / denominador, 2);
    const tamanosPorEstrato = estratos.map(e => redondear(n * e.fraccionAsignada, 2));
    return { totalMuestra: n, tamanosPorEstrato };
}

/* ===========================================================
   MUESTREO POR CONGLOMERADOS (MC)
   =========================================================== */

export type ParametroPoblacionalMC = 'media' | 'total_M_conocido' | 'total_M_desconocido' | 'proporcion';

export interface ObservacionConglomerado {
    elementos: number;
    observacion: number;
}

export interface ResultadoMC {
    parametro: ParametroPoblacionalMC;
    valorEstimado: number;
    varianza: number;
    limiteError: number;
    intervaloConfianza: [number, number];
}

export function calcularMC(
    parametro: ParametroPoblacionalMC,
    N: number,
    n: number,
    datos: ObservacionConglomerado[],
    ic: NivelConfianza,
    elementosPoblacion?: number
): ResultadoMC {
    const z = zFor(ic);
    const sumaObservaciones = datos.reduce((acc, d) => acc + d.observacion, 0);
    const sumaElementos = datos.reduce((acc, d) => acc + d.elementos, 0);

    if (parametro === 'media' || parametro === 'proporcion') {
        const valor = redondear(sumaObservaciones / sumaElementos, parametro === 'proporcion' ? 6 : 4);

        if (parametro === 'proporcion') {
            const M = sumaElementos / n;
            const Mbarra = Math.pow(M, 2);
            const suma = datos.reduce((acc, d) => acc + Math.pow(d.observacion - valor * d.elementos, 2), 0);
            const varianza = ((N - n) / (N * n * Mbarra)) * (suma / (n - 1));
            const limite = redondear(z * Math.sqrt(varianza), 4);
            return {
                parametro, valorEstimado: valor, varianza: redondear(varianza, 8), limiteError: limite,
                intervaloConfianza: [redondear(valor - limite, 4), redondear(valor + limite, 4)],
            };
        }

        // media
        const x = datos.reduce((acc, d) => acc + Math.pow(d.observacion, 2), 0);
        const xM = datos.reduce((acc, d) => acc + d.observacion * d.elementos, 0);
        const M2 = datos.reduce((acc, d) => acc + Math.pow(d.elementos, 2), 0);
        const suma = x - 2 * valor * xM + Math.pow(valor, 2) * M2;
        const MM = (elementosPoblacion ?? sumaElementos) / N;
        const varianza = redondear(((N - n) / (N * n * Math.pow(MM, 2))) * (suma / (n - 1)), 4);
        const limite = redondear(z * Math.sqrt(varianza), 4);
        return {
            parametro, valorEstimado: valor, varianza, limiteError: limite,
            intervaloConfianza: [redondear(valor - limite, 4), redondear(valor + limite, 4)],
        };
    }

    if (parametro === 'total_M_conocido') {
        const y = sumaObservaciones / sumaElementos;
        const total = redondear(y * (elementosPoblacion ?? sumaElementos), 4);
        const suma = datos.reduce((acc, d) => acc + Math.pow(d.observacion - y * d.elementos, 2), 0);
        const varianza = redondear(Math.pow(N, 2) * ((N - n) / (N * n)) * (suma / (n - 1)), 4);
        const limite = redondear(z * Math.sqrt(varianza), 4);
        return {
            parametro, valorEstimado: total, varianza, limiteError: limite,
            intervaloConfianza: [redondear(total - limite, 4), redondear(total + limite, 4)],
        };
    }

    const media = sumaObservaciones / n;
    const total = redondear(N * media, 4);
    const suma = datos.reduce((acc, d) => acc + Math.pow(d.observacion - media, 2), 0);
    const varianza = redondear(Math.pow(N, 2) * ((N - n) / (N * n)) * (suma / (n - 1)), 4);
    const limite = redondear(z * Math.sqrt(varianza), 4);
    return {
        parametro, valorEstimado: total, varianza, limiteError: limite,
        intervaloConfianza: [redondear(total - limite, 4), redondear(total + limite, 4)],
    };
}

export interface OpcionesTamanoMuestraMC {
    estimacionVarianza?: number;
    tamanoMuestraPreliminar?: number;
    promedioConglomerados?: number;
}

export function calcularTamanoMuestraMC(
    parametro: ParametroPoblacionalMC,
    N: number,
    limiteError: number,
    ic: NivelConfianza,
    opciones: OpcionesTamanoMuestraMC
): number {
    const z = zFor(ic);
    const usaVarianza = opciones.estimacionVarianza !== undefined;
    const r = usaVarianza
        ? opciones.estimacionVarianza!
        : Math.pow((opciones.tamanoMuestraPreliminar ?? 0) / z, 2);

    if (parametro === 'media') {
        const Mbar2 = Math.pow(opciones.promedioConglomerados ?? 1, 2);
        if (usaVarianza) {
            const B = Math.pow(limiteError, 2) / Math.pow(z, 2);
            return redondear((N * r) / (N * Mbar2 * B + r), 2);
        }
        const D = Math.pow(limiteError, 2) / (Math.pow(z, 2) * Math.pow(N, 2));
        return redondear((N * r) / (N * D + r), 2);
    }

    if (parametro === 'proporcion') {
        const Mbar2 = Math.pow(opciones.promedioConglomerados ?? 1, 2);
        if (usaVarianza) {
            const D = (Math.pow(limiteError, 2) * Mbar2) / Math.pow(z, 2);
            return redondear((N * r) / (N * D + r), 2);
        }
        const D = Math.pow(limiteError, 2) / (Math.pow(z, 2) * Math.pow(N, 2));
        return redondear((N * r) / ((N - 1) * D + r), 2);
    }

    if (usaVarianza) {
        const D = Math.pow(limiteError, 2) / (Math.pow(z, 2) * Math.pow(N, 2));
        return redondear((N * r) / (N * D + r), 2);
    }
    const D = Math.pow(limiteError, 2) / (Math.pow(z, 2) * Math.pow(N, 2));
    return redondear((N * r) / ((N - 1) * D + r), 2);
}
