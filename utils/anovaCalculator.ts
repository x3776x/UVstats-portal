import { jStat } from 'jstat';

export interface DataRow {
    id: string;
    tratamiento: number;
    repeticion: number;
    produccion: number;
}

export interface AnovaResult {
    scTratamientos: number;
    scError: number;
    scTotal: number;
    glTratamientos: number;
    glError: number;
    glTotal: number;
    cmTratamientos: number;
    cmError: number;
    fCalculada: number;
    fCritico05: number;
    fCritico01: number;
    pValue: number;
    conclusion: string;
}

export function calculateDCA(tratamientos: number, repeticiones: number, datos: DataRow[]): AnovaResult {
    const N = tratamientos * repeticiones;

    // 1. Calculate Sums
    let sumaTotal = 0;
    const sumaTratamientos = new Array(tratamientos).fill(0);

    datos.forEach(fila => {
        sumaTotal += fila.produccion;
        sumaTratamientos[fila.tratamiento - 1] += fila.produccion;
    });

    // 2. Correction Factor (FC)
    const fc = Math.pow(sumaTotal, 2) / N;

    // 3. Sum of Squares (SC)
    let scTotal = 0;
    datos.forEach(fila => {
        scTotal += Math.pow(fila.produccion, 2);
    });
    scTotal = scTotal - fc;

    let scTratamientos = 0;
    for (let i = 0; i < tratamientos; i++) {
        scTratamientos += Math.pow(sumaTratamientos[i], 2);
    }
    scTratamientos = (scTratamientos / repeticiones) - fc;

    const scError = scTotal - scTratamientos;

    // 4. Degrees of Freedom (GL)
    const glTratamientos = tratamientos - 1;
    const glTotal = N - 1;
    const glError = glTotal - glTratamientos;

    // 5. Mean Squares (CM)
    const cmTratamientos = scTratamientos / glTratamientos;
    const cmError = scError / glError;

    // 6. F-Statistic
    const fCalculada = cmTratamientos / cmError;

    const fCritico05 = jStat.centralF.inv(0.95, glTratamientos, glError);
    const fCritico01 = jStat.centralF.inv(0.99, glTratamientos, glError);
    
    // Calculate exact P-Value
    const pValue = 1 - jStat.centralF.cdf(fCalculada, glTratamientos, glError);

    let conclusion = "NS - No Significativo (F < F de tablas al 0.05)";
    if (fCalculada > fCritico01) {
        conclusion = "** - Altamente significativo (F > F de tablas al 0.01)";
    } else if (fCalculada > fCritico05) {
        conclusion = "* - Significativo al 5% (F > F de tablas al 0.05)";
    }

    return {
        scTratamientos, scError, scTotal,
        glTratamientos, glError, glTotal,
        cmTratamientos, cmError,
        fCalculada, fCritico05, fCritico01, pValue, conclusion
    };
}

export function calculateDCADR(datos: { tratamiento: string, produccion: number} []): AnovaResult {
    const N = datos.length;

    // 1. Group data by Treatment dynamically
    let sumaTotal = 0;
    let sumaCuadradosTotalDatos = 0;
    
    const tratamientosMap = new Map<string, { suma: number, n: number }>();

    datos.forEach(fila => {
        sumaTotal += fila.produccion;
        sumaCuadradosTotalDatos += Math.pow(fila.produccion, 2);

        if (!tratamientosMap.has(fila.tratamiento)) {
            tratamientosMap.set(fila.tratamiento, { suma: 0, n: 0 });
        }
        
        const stats = tratamientosMap.get(fila.tratamiento)!;
        stats.suma += fila.produccion;
        stats.n += 1;
    });

    const tratamientosCount = tratamientosMap.size;

    // 2. Factor de Corrección (FC)
    const fc = Math.pow(sumaTotal, 2) / N;

    // 3. Suma de Cuadrados (SC)
    const scTotal = sumaCuadradosTotalDatos - fc;

    let scTratamientos = 0;
    tratamientosMap.forEach(stats => {
        // Formula: (Sum of treatment^2 / n of treatment)
        scTratamientos += Math.pow(stats.suma, 2) / stats.n;
    });
    scTratamientos = scTratamientos - fc;

    const scError = scTotal - scTratamientos;

    // 4. Grados de Libertad (GL)
    const glTratamientos = tratamientosCount - 1;
    const glTotal = N - 1;
    const glError = glTotal - glTratamientos;

    // 5. Cuadrados Medios (CM)
    const cmTratamientos = scTratamientos / glTratamientos;
    const cmError = scError / glError;

    // 6. F-Calculada
    const fCalculada = cmTratamientos / cmError;

    // 7. F-Crítico y P-Value usando jStat
    const fCritico05 = jStat.centralF.inv(0.95, glTratamientos, glError);
    const fCritico01 = jStat.centralF.inv(0.99, glTratamientos, glError);
    const pValue = 1 - jStat.centralF.cdf(fCalculada, glTratamientos, glError);

    // 8. Decisión Estadística
    let conclusion = "NS - No Significativo (F < F de tablas al 0.05)";
    if (fCalculada > fCritico01) {
        conclusion = "** - Altamente significativo (F > F de tablas al 0.01)";
    } else if (fCalculada > fCritico05) {
        conclusion = "* - Significativo al 5% (F > F de tablas al 0.05)";
    }

    return {
        scTratamientos, scError, scTotal,
        glTratamientos, glError, glTotal,
        cmTratamientos, cmError,
        fCalculada, fCritico05, fCritico01, pValue, conclusion
    };
}
