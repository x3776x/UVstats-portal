import * as XLSX from 'xlsx';
import { DataRow } from './anovaCalculator';

export async function parseAnovaFile(file: File): Promise<DataRow[]> {
    return new Promise((resolve, reject) => {
        // wrong format
        const validExtensions = ['csv', 'xls', 'xlsx'];
        const fileExt = file.name.split('.').pop()?.toLowerCase();
        if (!fileExt || !validExtensions.includes(fileExt)) {
            return reject(new Error("Formato inválido. Por favor sube un archivo .csv o .xlsx"));
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                // Read the raw binary data into the XLSX library
                const workbook = XLSX.read(data, { type: 'binary' });

                // empty file
                if (workbook.SheetNames.length === 0) {
                    return reject(new Error("El archivo de Excel está vacío."));
                }

                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                if (rawRows.length < 2) {
                    return reject(new Error("El archivo no tiene suficientes datos."));
                }

                const parsedData: DataRow[] = [];
                let repeticionTracker: Record<number, number> = {};

                for (let i = 1; i < rawRows.length; i++) {
                    const row = rawRows[i];

                    // Empty rows 
                    if (!row || row.length === 0 || row[0] === undefined || row[0] === null || String(row[0]).trim() === '') {
                        continue; 
                    }

                    const tratamiento = Number(row[0]);
                    
                    let produccion: number | null = null;
                    if (row[1] !== undefined && row[1] !== null && String(row[1]).trim() !== '') {
                        produccion = Number(row[1]);
                    }

                    if (isNaN(tratamiento) || (produccion !== null && isNaN(produccion))) {
                        return reject(new Error(`Datos inválidos en la fila ${i + 1}. Asegúrate de usar solo números.`));
                    }

                    if (!repeticionTracker[tratamiento]) {
                        repeticionTracker[tratamiento] = 1;
                    } else {
                        repeticionTracker[tratamiento]++;
                    }

                    parsedData.push({
                        id: `t${tratamiento}-r${repeticionTracker[tratamiento]}`,
                        tratamiento: tratamiento,
                        repeticion: repeticionTracker[tratamiento],
                        produccion: produccion
                    });
                }

                if (parsedData.length === 0) {
                    return reject(new Error("No se encontraron datos válidos en el archivo."));
                }

                resolve(parsedData);

            } catch (error) {
                reject(new Error("Ocurrió un error al leer el archivo."));
            }
        };

        reader.onerror = () => {
            reject(new Error("El navegador no pudo leer el archivo."));
        };

        reader.readAsArrayBuffer(file);
    });
}

export interface DataRowBifactorialParsed {
    id: string;
    factorA: number;
    factorB: number;
    repeticion: number;
    rendimiento: number | null;
}

export async function parseBifactorialFile(file: File): Promise<DataRowBifactorialParsed[]> {
    return new Promise((resolve, reject) => {
        const validExtensions = ['csv', 'xls', 'xlsx'];
        const fileExt = file.name.split('.').pop()?.toLowerCase();
        if (!fileExt || !validExtensions.includes(fileExt)) {
            return reject(new Error("Formato inválido. Sube un archivo .csv o .xlsx"));
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                if (workbook.SheetNames.length === 0) return reject(new Error("El archivo está vacío."));

                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                const parsedData: DataRowBifactorialParsed[] = [];

                for (let i = 1; i < rawRows.length; i++) {
                    const row = rawRows[i];

                    if (!row || row.length === 0 || row[0] === null || row[0] === undefined || String(row[0]).trim() === '') {
                        continue;
                    }

                    const factorA = Number(row[0]);
                    const factorB = Number(row[1]);
                    const repeticion = Number(row[2]);
                    
                    let rendimiento: number | null = null;
                    if (row[3] !== undefined && row[3] !== null && String(row[3]).trim() !== '') {
                        rendimiento = Number(row[3]);
                    }

                    if (isNaN(factorA) || isNaN(factorB) || isNaN(repeticion) || (rendimiento !== null && isNaN(rendimiento))) {
                        return reject(new Error(`Error en la fila ${i + 1}. Asegúrate de usar solo números en las 4 columnas.`));
                    }

                    parsedData.push({
                        id: `a${factorA}-b${factorB}-r${repeticion}`,
                        factorA,
                        factorB,
                        repeticion,
                        rendimiento
                    });
                }

                if (parsedData.length === 0) return reject(new Error("No se encontraron datos válidos."));
                resolve(parsedData);

            } catch (error) {
                reject(new Error("Ocurrió un error al leer el archivo Excel."));
            }
        };
        reader.readAsArrayBuffer(file);
    });
}