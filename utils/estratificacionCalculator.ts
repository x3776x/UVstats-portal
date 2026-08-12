export interface Registro {
    clave: string;
    dato: number;
}

export interface IntervaloDyH {
    limiteInferior: number;
    limiteSuperior: number;
    frecuencia: number;
    raizFrecuencia: number;
    raizFrecuenciaAcumulada: number;
    grupoFinal: number | null;
}

export interface RegistroConGrupo extends Registro {
    grupoFinal: number;
}

export type TecnicaEstratificacion = 'DyH' | 'Geometrica';

export interface ValoresIniciales {
    numeroElementos: number;
    datoMayor: number;
    datoMenor: number;
    rango: number;
    numeroIntervalos: number;
    amplitudIntervalos: number;
    coeficienteAsimetria: number; 
    ca: number;                   
    tecnica: TecnicaEstratificacion;
}

export interface ResultadoDyH {
    intervalos: IntervaloDyH[];
    gruposFinales: RegistroConGrupo[];
    amplitudGrupos: number;
    elementosPorGrupo: number[];
    cadenaElementosPorGrupo: string;
    cadenaRangos: string;
}

export interface ResultadoGeo {
    gruposFinales: RegistroConGrupo[];
    elementosPorGrupo: number[];
    cadenaElementosPorGrupo: string;
    cadenaRangos: string;
    intervalos: number[];
}

export function truncarHaciaAbajo(numero: number, decimales: number): number {
    const factor = Math.pow(10, decimales);
    return Math.trunc(numero * factor) / factor;
}

export function truncarHaciaArriba(numero: number, decimales: number): number {
    const factor = Math.pow(10, decimales);
    return Math.ceil(numero * factor) / factor;
}

export function formatoDatosMostrados(numero: number): string {
    return truncarHaciaAbajo(numero, 6).toString();
}

export function formatoIntervalo(numero: number): string {
    return truncarHaciaArriba(numero, 2).toString();
}

/* ---------- ordenar ---------- */

export function ordenarPorDato(registros: Registro[]): Registro[] {
    return [...registros].sort((a, b) => a.dato - b.dato);
}

/* ---------- coeficiente de asimetría ---------- */

function mediaAritmetica(datos: number[]): number {
    return datos.reduce((a, b) => a + b, 0) / datos.length;
}

function varianzaMuestral(datos: number[], media: number): number {
    const suma = datos.reduce((acc, x) => acc + Math.pow(Math.abs(x - media), 2), 0);
    return suma / (datos.length - 1);
}

export function calcularCoeficienteAsimetria(registros: Registro[]): number {
    const datos = registros.map(r => r.dato);
    const n = datos.length;
    const media = mediaAritmetica(datos);
    const varianza = varianzaMuestral(datos, media);
    const desviacion = Math.sqrt(varianza);

    let ca = 0;
    for (const x of datos) {
        let termino = Math.pow((x - media) / desviacion, 3);
        termino = truncarHaciaAbajo(termino, 9);
        ca += termino;
    }
    ca = (n / ((n - 1) * (n - 2))) * ca;
    return ca;
}

/* ---------- valores iniciales ---------- */

export function calcularValoresIniciales(registrosOrdenados: Registro[], gruposFinales: number): ValoresIniciales {
    const n = registrosOrdenados.length;
    const datoMenor = registrosOrdenados[0].dato;
    const datoMayor = registrosOrdenados[n - 1].dato;
    const rango = datoMayor - datoMenor;
    const numeroIntervalos = 1 + 3.3 * Math.log10(n);
    const amplitudIntervalos = rango / numeroIntervalos;
    const coeficienteAsimetria = calcularCoeficienteAsimetria(registrosOrdenados);
    const ca = Math.abs(truncarHaciaAbajo(coeficienteAsimetria, 1));
    const tecnica: TecnicaEstratificacion = coeficienteAsimetria <= 0.01 ? 'DyH' : 'Geometrica';

    return { numeroElementos: n, datoMayor, datoMenor, rango, numeroIntervalos, amplitudIntervalos, coeficienteAsimetria, ca, tecnica };
}

export function mostrarAmplitudGrupos(coeficienteAsimetriaCrudo: number): boolean {
    return coeficienteAsimetriaCrudo <= 0.001;
}

/* ---------- Dalenius y Hodges ---------- */

export function calcularIntervalosDyH(
    registrosOriginales: Registro[],
    valores: ValoresIniciales,
    gruposFinalesInput: number
): ResultadoDyH {
    const gruposFinales = gruposFinalesInput < 1 ? 3 : gruposFinalesInput;
    const { numeroElementos, datoMayor, rango, numeroIntervalos, amplitudIntervalos } = valores;
    let { datoMenor } = valores;

    const rangoConExceso = numeroIntervalos * amplitudIntervalos;
    const exceso = rangoConExceso > rango ? (rangoConExceso - rango) / 2 : 0;
    datoMenor -= exceso;

    const intervalos: IntervaloDyH[] = [];
    let frecuenciaAcumulada = 0;
    let limiteActual = datoMenor;
    const totalIntervalos = Math.floor(numeroIntervalos);

    for (let i = 0; i < totalIntervalos; i++) {
        const limiteInferior = limiteActual;
        const limiteSuperior = limiteActual + amplitudIntervalos;
        const frecuencia = registrosOriginales.filter(r => r.dato >= limiteInferior && r.dato < limiteSuperior).length;
        const raizFrecuencia = Math.sqrt(frecuencia);
        frecuenciaAcumulada += raizFrecuencia;
        intervalos.push({
            limiteInferior, limiteSuperior, frecuencia, raizFrecuencia,
            raizFrecuenciaAcumulada: frecuenciaAcumulada, grupoFinal: null,
        });
        limiteActual += amplitudIntervalos;
    }

    const amplitudGrupos = frecuenciaAcumulada / gruposFinales;
    const gruposUmbral = Array.from({ length: gruposFinales }, (_, i) => amplitudGrupos * (i + 1));

    for (const intervalo of intervalos) {
        for (let j = 0; j < gruposFinales; j++) {
            if (intervalo.raizFrecuenciaAcumulada <= gruposUmbral[j]) {
                intervalo.grupoFinal = j + 1;
                break;
            }
        }
    }

    const elementosPorGrupo = new Array(gruposFinales).fill(0);
    const gruposFinalesRegistros: RegistroConGrupo[] = registrosOriginales.map(r => {
        const intervalo = intervalos.find(iv => r.dato >= iv.limiteInferior && r.dato < iv.limiteSuperior);
        const grupo = intervalo?.grupoFinal ?? gruposFinales;
        elementosPorGrupo[grupo - 1]++;
        return { ...r, grupoFinal: grupo };
    });

    const cadenaElementosPorGrupo = elementosPorGrupo.join(', ');

    const inArr = [0, ...gruposUmbral];
    let cadenaRangos = '<html>';
    for (let i = 0; i < gruposFinales; i++) {
        cadenaRangos += `${formatoIntervalo(inArr[i])} - ${formatoIntervalo(inArr[i + 1])}<br>`;
    }
    cadenaRangos += '</html>';

    return { intervalos, gruposFinales: gruposFinalesRegistros, amplitudGrupos, elementosPorGrupo, cadenaElementosPorGrupo, cadenaRangos };
}

/* ---------- Estratificación geométrica ---------- */

export function calcularIntervalosGeo(
    registrosOriginales: Registro[],
    datoMayor: number,
    datoMenor: number,
    gruposFinalesInput: number
): ResultadoGeo {
    const gruposFinales = gruposFinalesInput < 1 ? 3 : gruposFinalesInput;

    const num = datoMayor / datoMenor;
    const potencia = 1 / gruposFinales;
    const proporcion = Math.pow(num, potencia);

    const intervalos: number[] = [];
    for (let i = 0; i <= gruposFinales; i++) {
        intervalos.push(datoMenor * Math.pow(proporcion, i));
    }

    const elementosPorGrupo = new Array(gruposFinales).fill(0);
    const gruposFinalesRegistros: RegistroConGrupo[] = registrosOriginales.map(r => {
        let grupo = gruposFinales;
        for (let i = 1; i <= gruposFinales; i++) {
            if (r.dato < intervalos[i]) {
                grupo = i;
                break;
            }
        }
        elementosPorGrupo[grupo - 1]++;
        return { ...r, grupoFinal: grupo };
    });

    const cadenaElementosPorGrupo = elementosPorGrupo.join(', ');

    let cadenaRangos = '<html>';
    for (let i = 0; i < gruposFinales; i++) {
        cadenaRangos += `${formatoIntervalo(intervalos[i])} - ${formatoIntervalo(intervalos[i + 1])}<br>`;
    }
    cadenaRangos += '</html>';

    return { gruposFinales: gruposFinalesRegistros, elementosPorGrupo, cadenaElementosPorGrupo, cadenaRangos, intervalos };
}

/* ---------- Importar / Exportar Excel */

export async function parseExcelEstratificacion(file: File): Promise<Registro[]> {
    const XLSX = await import('xlsx');
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const hoja = workbook.Sheets[workbook.SheetNames[0]];
    const filas: any[][] = XLSX.utils.sheet_to_json(hoja, { header: 1 });

    const registros: Registro[] = [];
    for (let i = 1; i < filas.length; i++) {
        const fila = filas[i];
        if (!fila || fila.length < 2) continue;
        const clave = String(fila[0]);
        const dato = typeof fila[1] === 'number' ? fila[1] : parseFloat(fila[1]);
        registros.push({ clave, dato: isNaN(dato) ? 0 : dato });
    }
    return registros;
}

export async function exportarExcelDyH(
    registros: Registro[],
    intervalos: IntervaloDyH[],
    gruposFinales: RegistroConGrupo[],
    nombreArchivo: string
) {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();

    const hojaDatos = XLSX.utils.json_to_sheet(
        registros.map(r => ({ 'Clave Productor': r.clave, Datos: r.dato }))
    );
    XLSX.utils.book_append_sheet(wb, hojaDatos, 'Datos');

    const hojaIntervalos = XLSX.utils.json_to_sheet(
        intervalos.map(iv => ({
            'Límite inferior': iv.limiteInferior,
            'Límite superior': iv.limiteSuperior,
            Frecuencia: iv.frecuencia,
            'Raíz cuadrada': iv.raizFrecuencia,
            'Raíz frecuencia (acumulada)': iv.raizFrecuenciaAcumulada,
            'Grupo final': iv.grupoFinal,
        }))
    );
    XLSX.utils.book_append_sheet(wb, hojaIntervalos, 'Intervalos');

    const hojaGrupos = XLSX.utils.json_to_sheet(
        gruposFinales.map(g => ({ 'Clave Productor': g.clave, Datos: g.dato, 'Grupo final': g.grupoFinal }))
    );
    XLSX.utils.book_append_sheet(wb, hojaGrupos, 'Grupos finales');

    XLSX.writeFile(wb, nombreArchivo);
}

export async function exportarExcelGeo(
    registros: Registro[],
    gruposFinales: RegistroConGrupo[],
    nombreArchivo: string
) {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();

    const hojaDatos = XLSX.utils.json_to_sheet(
        registros.map(r => ({ 'Clave Productor': r.clave, Datos: r.dato }))
    );
    XLSX.utils.book_append_sheet(wb, hojaDatos, 'Datos');

    const hojaGrupos = XLSX.utils.json_to_sheet(
        gruposFinales.map(g => ({ 'Clave Productor': g.clave, Datos: g.dato, 'Grupo final': g.grupoFinal }))
    );
    XLSX.utils.book_append_sheet(wb, hojaGrupos, 'Grupos finales');

    XLSX.writeFile(wb, nombreArchivo);
}