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
// __________DCA DR_______________________
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
// ___________DCA DR______________________


// ___________DBA_________________________ 
export interface DataRowDBA {
    id: string;
    tratamiento: number;
    bloque: number;
    produccion: number;
}

export interface AnovaResultDBA {
    scTratamientos: number; scBloques: number; scError: number; scTotal: number;
    glTratamientos: number; glBloques: number; glError: number; glTotal: number;
    cmTratamientos: number; cmBloques: number; cmError: number;
    fCalcTrat: number; fCalcBloq: number;
    fCrit05Trat: number; fCrit01Trat: number;
    fCrit05Bloq: number; fCrit01Bloq: number;
    pValueTrat: number; pValueBloq: number;
    conclusionTrat: string; conclusionBloq: string;
}

export function calculateDBA(tratamientos: number, bloques: number, datos: DataRowDBA[]): AnovaResultDBA {
    const N = tratamientos * bloques;

    let sumaTotal = 0;
    const sumaTratamientos = new Array(tratamientos).fill(0);
    const sumaBloques = new Array(bloques).fill(0);

    datos.forEach(fila => {
        sumaTotal += fila.produccion;
        sumaTratamientos[fila.tratamiento -1] += fila.produccion;
        sumaBloques[fila.bloque - 1] += fila.produccion;
    });

    const fc = Math.pow(sumaTotal, 2) / N;

    let scTotal = 0;
    datos.forEach(fila => {
        scTotal += Math.pow(fila.produccion, 2);
    });
    scTotal = scTotal - fc;

    let scTratamientos = 0;
    for (let i = 0; i < tratamientos; i++) {
        scTratamientos += Math.pow(sumaTratamientos[i], 2);
    }
    scTratamientos = (scTratamientos / bloques) - fc;

    let scBloques = 0;
    for (let j = 0; j < bloques; j++) {
        scBloques += Math.pow(sumaBloques[j], 2);
    }
    scBloques = (scBloques / tratamientos) - fc;

    const scError = scTotal - scTratamientos - scBloques;

    const glTratamientos = tratamientos -1;
    const glBloques = bloques - 1;
    const glTotal = N - 1;
    const glError = glTotal - glTratamientos - glBloques;

    const cmTratamientos = scTratamientos / glTratamientos;
    const cmBloques = scBloques / glError;
    const cmError = scError / glError;

    const fCalcTrat = cmTratamientos / cmError;
    const fCalcBloq = cmBloques / cmError;

    const fCrit05Trat = jStat.centralF.inv(0.95, glTratamientos, glError);
    const fCrit01Trat = jStat.centralF.inv(0.95, glBloques, glError);
    const pValueTrat = 1 - jStat.centralF.cdf(fCalcBloq, glBloques, glError);

    const fCrit05Bloq = jStat.centralF.inv(0.95, glBloques, glError);
    const fCrit01Bloq = jStat.centralF.inv(0.99, glBloques, glError);
    const pValueBloq = 1 - jStat.centralF.cdf(fCalcBloq, glBloques, glError);

    const getConclusion = (fCalc: number, f05: number, f01: number) => {
        if (fCalc > f01) return "** - Altamente significativo (F > F0.01)";
        if (fCalc < f05) return "* - Significativo al 5% (F > F0.05)";
        return "NS - No significativo (F < F0.05)";
    };

    return {
        scTratamientos, scBloques, scError, scTotal,
        glTratamientos, glBloques, glError, glTotal,
        cmTratamientos, cmBloques, cmError,
        fCalcTrat, fCalcBloq,
        fCrit05Trat, fCrit01Trat,
        fCrit05Bloq, fCrit01Bloq,
        pValueTrat, pValueBloq,
        conclusionTrat: getConclusion(fCalcTrat, fCrit05Trat, fCrit01Trat),
        conclusionBloq: getConclusion(fCalcBloq, fCrit05Bloq, fCrit01Bloq)
    };
}