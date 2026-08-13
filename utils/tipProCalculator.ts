export interface Registro {
    clave: string;
    dato: number;
}

export interface IntervaloTiPro {
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

export interface ValoresInicialesTiPro {
    numeroElementos: number;
    datoMayor: number;
    datoMenor: number;
    rango: number;
    numeroIntervalos: number;
    amplitudIntervalos: number;
}

export interface ResultadoTiPro {
    intervalos: IntervaloTiPro[];
    gruposFinales: RegistroConGrupo[];
    amplitudGrupos: number;
    elementosPorGrupo: number[];
    cadenaElementosPorGrupo: string;
}

/* ---------- ordenar ---------- */
export function ordenarPorDato(registros: Registro[]): Registro[] {
    return [...registros].sort((a, b) => a.dato - b.dato);
}


export function calcularValoresIniciales(registrosOrdenados: Registro[], gruposFinales: number): ValoresInicialesTiPro {
    const n = registrosOrdenados.length;
    const datoMenor = registrosOrdenados[0].dato;
    const datoMayor = registrosOrdenados[n - 1].dato;
    const rango = datoMayor - datoMenor;
    const numeroIntervalos = 1 + 3.3 * Math.log10(n);
    const amplitudIntervalos = rango / numeroIntervalos;

    return { numeroElementos: n, datoMayor, datoMenor, rango, numeroIntervalos, amplitudIntervalos };
}

export function calcularIntervalos(
    registrosOriginales: Registro[],
    valores: ValoresInicialesTiPro,
    gruposFinalesInput: number
): ResultadoTiPro {
    const gruposFinales = gruposFinalesInput < 1 ? 3 : gruposFinalesInput;
    const { numeroElementos, rango, numeroIntervalos, amplitudIntervalos } = valores;
    let { datoMenor } = valores;

    const rangoConExceso = numeroIntervalos * amplitudIntervalos;
    const exceso = rangoConExceso > rango ? (rangoConExceso - rango) / 2 : 0;
    datoMenor -= exceso;

    const intervalos: IntervaloTiPro[] = [];
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

    return { intervalos, gruposFinales: gruposFinalesRegistros, amplitudGrupos, elementosPorGrupo, cadenaElementosPorGrupo };
}

/* ---------- Importar / Exportar Excel*/
export async function parseExcelTiPro(file: File): Promise<Registro[]> {
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

export async function exportarExcelTiPro(
    intervalos: IntervaloTiPro[],
    gruposFinales: RegistroConGrupo[],
    nombreArchivo: string
) {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();

    const hojaIntervalos = XLSX.utils.json_to_sheet(
        intervalos.map(iv => ({
            'Límite inferior': iv.limiteInferior,
            'Límite superior': iv.limiteSuperior,
            Frecuencia: iv.frecuencia,
            'Raíz Frecuencia': iv.raizFrecuencia,
            'Raíz Frecuencia (acumulada)': iv.raizFrecuenciaAcumulada,
            'Grupo final': iv.grupoFinal,
        }))
    );
    XLSX.utils.book_append_sheet(wb, hojaIntervalos, 'Intervalos');

    const hojaGrupos = XLSX.utils.json_to_sheet(
        gruposFinales.map(g => ({ 'Clave productor': g.clave, Datos: g.dato, 'Grupo final': g.grupoFinal }))
    );
    XLSX.utils.book_append_sheet(wb, hojaGrupos, 'Grupos finales');

    XLSX.writeFile(wb, nombreArchivo);
}