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

        reader.readAsBinaryString(file);
    });
}