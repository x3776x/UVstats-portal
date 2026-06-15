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
// ___________DBA_________________________

// ___________DBA DF_________________________
export interface DataRowDBAFaltante {
    id: string;
    tratamiento: number;
    bloque: number;
    produccion: number | null;
}

export interface AnovaResultDBAFaltante extends AnovaResultDBA {
    valorEstimado: number;
    tratFaltante: number;
    bloqFaltante: number;
}

export function calculateDBAFaltante(tratamientos: number, bloques: number, datos: DataRowDBAFaltante[]): AnovaResultDBAFaltante {
    const faltantes = datos.filter(d => d.produccion === null);
    if (faltantes.length !== 1) {
        throw new Error("El modelo requiere exactamente UN dato faltante (celda vacía).");
    }
    const faltante = faltantes[0];

    let T = 0; let B = 0; let S = 0;
    
    datos.forEach(d => {
        if (d.produccion !== null) {
            S += d.produccion;
            if (d.tratamiento === faltante.tratamiento) T += d.produccion;
            if (d.bloque === faltante.bloque) B += d.produccion;
        }
    });

    const x = ((tratamientos * T) + (bloques * B) - S) / ((tratamientos - 1) * (bloques - 1));

    const datosCompletos = datos.map(d => ({
        ...d,
        produccion: d.produccion === null ? x : d.produccion
    }));

    let sumaTotal = 0;
    const sumaTrat = new Array(tratamientos).fill(0);
    const sumaBloq = new Array(bloques).fill(0);

    datosCompletos.forEach(fila => {
        sumaTotal += fila.produccion;
        sumaTrat[fila.tratamiento - 1] += fila.produccion;
        sumaBloq[fila.bloque - 1] += fila.produccion;
    });

    const fc = Math.pow(sumaTotal, 2) / (tratamientos * bloques);

    let scTotal = 0;
    datosCompletos.forEach(fila => scTotal += Math.pow(fila.produccion, 2));
    scTotal = scTotal - fc;

    let scTratamientos = 0;
    for (let i = 0; i < tratamientos; i++) scTratamientos += Math.pow(sumaTrat[i], 2);
    scTratamientos = (scTratamientos / bloques) - fc;

    let scBloques = 0;
    for (let j = 0; j < bloques; j++) scBloques += Math.pow(sumaBloq[j], 2);
    scBloques = (scBloques / tratamientos) - fc;

    const scError = scTotal - scTratamientos - scBloques;

    const glTratamientos = tratamientos - 1;
    const glBloques = bloques - 1;
    const glTotal = (tratamientos * bloques) - 2;
    const glError = glTotal - glTratamientos - glBloques;

    const cmTratamientos = scTratamientos / glTratamientos;
    const cmBloques = scBloques / glBloques;
    const cmError = scError / glError;

    const fCalcTrat = cmTratamientos / cmError;
    const fCalcBloq = cmBloques / cmError;

    const fCrit05Trat = jStat.centralF.inv(0.95, glTratamientos, glError);
    const fCrit01Trat = jStat.centralF.inv(0.99, glTratamientos, glError);
    const pValueTrat = 1 - jStat.centralF.cdf(fCalcTrat, glTratamientos, glError);

    const fCrit05Bloq = jStat.centralF.inv(0.95, glBloques, glError);
    const fCrit01Bloq = jStat.centralF.inv(0.99, glBloques, glError);
    const pValueBloq = 1 - jStat.centralF.cdf(fCalcBloq, glBloques, glError);

    const getConclusion = (fCalc: number, f05: number, f01: number) => {
        if (fCalc > f01) return "** - Altamente significativo (F > F0.01)";
        if (fCalc > f05) return "* - Significativo al 5% (F > F0.05)";
        return "NS - No Significativo (F < F0.05)";
    };

    return {
        scTratamientos, scBloques, scError, scTotal,
        glTratamientos, glBloques, glError, glTotal,
        cmTratamientos, cmBloques, cmError,
        fCalcTrat, fCalcBloq, fCrit05Trat, fCrit01Trat, fCrit05Bloq, fCrit01Bloq,
        pValueTrat, pValueBloq,
        conclusionTrat: getConclusion(fCalcTrat, fCrit05Trat, fCrit01Trat),
        conclusionBloq: getConclusion(fCalcBloq, fCrit05Bloq, fCrit01Bloq),
        valorEstimado: x,
        tratFaltante: faltante.tratamiento,
        bloqFaltante: faltante.bloque
    };
}
// ___________DBA DF_________________________

// __________DCL ____________________________
export interface DataRowDCL {
    id: string;
    fila: number;
    columna: number;
    tratamiento: string;
    produccion: number;
}

export interface AnovaResultDCL {
    scTratamientos: number; scFilas: number; scColumnas: number; scError: number; scTotal: number;
    glTratamientos: number; glFilas: number; glColumnas: number; glError: number; glTotal: number;
    cmTratamientos: number; cmFilas: number; cmColumnas: number; cmError: number;
    fCalcTrat: number; fCalcFilas: number; fCalcCol: number;
    fCrit05Trat: number; fCrit01Trat: number;
    fCrit05Filas: number; fCrit01Filas: number;
    fCrit05Col: number; fCrit01Col: number;
    pValueTrat: number; pValueFilas: number; pValueCol: number;
    conclusionTrat: string; conclusionFilas: string; conclusionCol: string;
}

export function calculateDCL(n: number, datos: DataRowDCL[]): AnovaResultDCL {
    const N = Math.pow(n, 2);

    let sumaTotal = 0;
    const sumaFilas = new Map<number, number>();
    const sumaColumnas = new Map<number, number>();
    const sumaTratamientos = new Map<string, { suma: number, count: number }>();

    datos.forEach(d => {
        sumaTotal += d.produccion;

        sumaFilas.set(d.fila, (sumaFilas.get(d.fila) || 0) + d.produccion);
        sumaColumnas.set(d.columna, (sumaColumnas.get(d.columna) || 0) + d.produccion);

        if (!sumaTratamientos.has(d.tratamiento)) {
            sumaTratamientos.set(d.tratamiento, { suma: 0, count: 0 });
        }
        const trat = sumaTratamientos.get(d.tratamiento)!;
        trat.suma += d.produccion;
        trat.count += 1;
    });

    sumaTratamientos.forEach((trat, key) => {
        if (trat.count !== n) throw new Error(`El tratamiento ${key} no aparece exactamente ${n} veces.`);
    });

    const fc = Math.pow(sumaTotal, 2) / N;

    let scTotal = 0;
    datos.forEach(d => scTotal += Math.pow(d.produccion, 2));
    scTotal = scTotal - fc;

    let scFilas = 0;
    sumaFilas.forEach(suma => scFilas += Math.pow(suma, 2));
    scFilas = (scFilas / n) - fc;

    let scColumnas = 0;
    sumaColumnas.forEach(suma => scColumnas += Math.pow(suma, 2));
    scColumnas = (scColumnas / n) - fc;

    let scTratamientos = 0;
    sumaTratamientos.forEach(trat => scTratamientos += Math.pow(trat.suma, 2));
    scTratamientos = (scTratamientos / n) - fc;

    const scError = scTotal - scFilas - scColumnas - scTratamientos;

    const glTratamientos = n - 1;
    const glFilas = n - 1;
    const glColumnas = n - 1;
    const glError = (n - 1) * (n - 2);
    const glTotal = N - 1;

    const cmTratamientos = scTratamientos / glTratamientos;
    const cmFilas = scFilas / glFilas;
    const cmColumnas = scColumnas / glColumnas;
    const cmError = glError > 0 ? scError / glError : 0; 

    if (glError === 0) {
        throw new Error("Un Cuadro Latino 2x2 no deja grados de libertad para el error. Se requiere al menos un 3x3.");
    }

    const fCalcTrat = cmTratamientos / cmError;
    const fCalcFilas = cmFilas / cmError;
    const fCalcCol = cmColumnas / cmError;

    const calcStats = (fCalc: number, gl: number) => {
        const f05 = jStat.centralF.inv(0.95, gl, glError);
        const f01 = jStat.centralF.inv(0.99, gl, glError);
        const pVal = 1 - jStat.centralF.cdf(fCalc, gl, glError);
        let conclusion = "NS - No Significativo";
        if (fCalc > f01) conclusion = "** - Altamente significativo";
        else if (fCalc > f05) conclusion = "* - Significativo al 5%";
        
        return { f05, f01, pVal, conclusion };
    };

    const statsTrat = calcStats(fCalcTrat, glTratamientos);
    const statsFilas = calcStats(fCalcFilas, glFilas);
    const statsCol = calcStats(fCalcCol, glColumnas);

    return {
        scTratamientos, scFilas, scColumnas, scError, scTotal,
        glTratamientos, glFilas, glColumnas, glError, glTotal,
        cmTratamientos, cmFilas, cmColumnas, cmError,
        fCalcTrat, fCalcFilas, fCalcCol,
        fCrit05Trat: statsTrat.f05, fCrit01Trat: statsTrat.f01, pValueTrat: statsTrat.pVal, conclusionTrat: statsTrat.conclusion,
        fCrit05Filas: statsFilas.f05, fCrit01Filas: statsFilas.f01, pValueFilas: statsFilas.pVal, conclusionFilas: statsFilas.conclusion,
        fCrit05Col: statsCol.f05, fCrit01Col: statsCol.f01, pValueCol: statsCol.pVal, conclusionCol: statsCol.conclusion,
    };
}
// _________DCL______________________________

//__________DCL DF___________________________
export interface DataRowDCLFaltante {
    id: string;
    fila: number;
    columna: number;
    tratamiento: string;
    produccion: number | null; // null indica el dato faltante
}

export interface AnovaResultDCLFaltante extends AnovaResultDCL {
    valorEstimado: number;
    filaFaltante: number;
    colFaltante: number;
    tratFaltante: string;
}

export function calculateDCLFaltante(n: number, datos: DataRowDCLFaltante[]): AnovaResultDCLFaltante {
    const faltantes = datos.filter(d => d.produccion === null);
    if (faltantes.length !== 1) {
        throw new Error("El modelo requiere exactamente UN dato faltante (celda vacía).");
    }
    const faltante = faltantes[0];

    let F = 0; let C = 0; let T = 0; let S = 0;
    
    datos.forEach(d => {
        if (d.produccion !== null) {
            S += d.produccion;
            if (d.fila === faltante.fila) F += d.produccion;
            if (d.columna === faltante.columna) C += d.produccion;
            if (d.tratamiento === faltante.tratamiento) T += d.produccion;
        }
    });

    if (n < 3) throw new Error("Un Cuadro Latino con dato faltante debe ser de al menos 3x3.");
    
    const x = ((n * (F + C + T)) - (2 * S)) / ((n - 1) * (n - 2));

    const datosCompletos = datos.map(d => ({
        ...d,
        produccion: d.produccion === null ? x : d.produccion
    }));

    let sumaTotal = 0;
    const sumaFilas = new Map<number, number>();
    const sumaColumnas = new Map<number, number>();
    const sumaTratamientos = new Map<string, { suma: number, count: number }>();

    datosCompletos.forEach(d => {
        sumaTotal += d.produccion;
        sumaFilas.set(d.fila, (sumaFilas.get(d.fila) || 0) + d.produccion);
        sumaColumnas.set(d.columna, (sumaColumnas.get(d.columna) || 0) + d.produccion);

        if (!sumaTratamientos.has(d.tratamiento)) {
            sumaTratamientos.set(d.tratamiento, { suma: 0, count: 0 });
        }
        const trat = sumaTratamientos.get(d.tratamiento)!;
        trat.suma += d.produccion;
        trat.count += 1;
    });

    const N = Math.pow(n, 2);
    const fc = Math.pow(sumaTotal, 2) / N;

    let scTotal = 0;
    datosCompletos.forEach(d => scTotal += Math.pow(d.produccion, 2));
    scTotal = scTotal - fc;

    let scFilas = 0;
    sumaFilas.forEach(suma => scFilas += Math.pow(suma, 2));
    scFilas = (scFilas / n) - fc;

    let scColumnas = 0;
    sumaColumnas.forEach(suma => scColumnas += Math.pow(suma, 2));
    scColumnas = (scColumnas / n) - fc;

    let scTratamientos = 0;
    sumaTratamientos.forEach(trat => scTratamientos += Math.pow(trat.suma, 2));
    scTratamientos = (scTratamientos / n) - fc;

    const scError = scTotal - scFilas - scColumnas - scTratamientos;

    const glTratamientos = n - 1;
    const glFilas = n - 1;
    const glColumnas = n - 1;
    const glTotal = N - 2;
    const glError = ((n - 1) * (n - 2)) - 1;

    if (glError <= 0) {
        throw new Error("No hay suficientes grados de libertad en el Error para realizar el cálculo F.");
    }

    const cmTratamientos = scTratamientos / glTratamientos;
    const cmFilas = scFilas / glFilas;
    const cmColumnas = scColumnas / glColumnas;
    const cmError = scError / glError;

    const fCalcTrat = cmTratamientos / cmError;
    const fCalcFilas = cmFilas / cmError;
    const fCalcCol = cmColumnas / cmError;

    const calcStats = (fCalc: number, gl: number) => {
        const f05 = jStat.centralF.inv(0.95, gl, glError);
        const f01 = jStat.centralF.inv(0.99, gl, glError);
        const pVal = 1 - jStat.centralF.cdf(fCalc, gl, glError);
        let conclusion = "NS - No Significativo";
        if (fCalc > f01) conclusion = "** - Altamente significativo";
        else if (fCalc > f05) conclusion = "* - Significativo al 5%";
        return { f05, f01, pVal, conclusion };
    };

    const statsTrat = calcStats(fCalcTrat, glTratamientos);
    const statsFilas = calcStats(fCalcFilas, glFilas);
    const statsCol = calcStats(fCalcCol, glColumnas);

    return {
        scTratamientos, scFilas, scColumnas, scError, scTotal,
        glTratamientos, glFilas, glColumnas, glError, glTotal,
        cmTratamientos, cmFilas, cmColumnas, cmError,
        fCalcTrat, fCalcFilas, fCalcCol,
        fCrit05Trat: statsTrat.f05, fCrit01Trat: statsTrat.f01, pValueTrat: statsTrat.pVal, conclusionTrat: statsTrat.conclusion,
        fCrit05Filas: statsFilas.f05, fCrit01Filas: statsFilas.f01, pValueFilas: statsFilas.pVal, conclusionFilas: statsFilas.conclusion,
        fCrit05Col: statsCol.f05, fCrit01Col: statsCol.f01, pValueCol: statsCol.pVal, conclusionCol: statsCol.conclusion,
        valorEstimado: x,
        filaFaltante: faltante.fila,
        colFaltante: faltante.columna,
        tratFaltante: faltante.tratamiento
    };
}
// _________DCL DF___________________________

// _________Bi DCA___________________________
export interface DataRowBiDCA {
    id: string;
    factorA: number;
    factorB: number;
    repeticion: number;
    rendimiento: number;
}

export interface AnovaResultBiDCA {
    scA: number; scB: number; scAB: number; scError: number; scTotal: number;
    glA: number; glB: number; glAB: number; glError: number; glTotal: number;
    cmA: number; cmB: number; cmAB: number; cmError: number;
    fCalcA: number; fCalcB: number; fCalcAB: number;
    fCrit05A: number; fCrit01A: number;
    fCrit05B: number; fCrit01B: number;
    fCrit05AB: number; fCrit01AB: number;
    pValueA: number; pValueB: number; pValueAB: number;
    conclusionA: string; conclusionB: string; conclusionAB: string;
}

export function calculateBifactorialDCA(a: number, b: number, r: number, datos: DataRowBiDCA[]): AnovaResultBiDCA {
    const N = a * b * r;

    let sumaTotal = 0;
    const sumaA = new Array(a).fill(0);
    const sumaB = new Array(b).fill(0);
    const sumaAB = Array.from({ length: a }, () => new Array(b).fill(0));

    datos.forEach(d => {
        sumaTotal += d.rendimiento;
        sumaA[d.factorA - 1] += d.rendimiento;
        sumaB[d.factorB - 1] += d.rendimiento;
        sumaAB[d.factorA - 1][d.factorB - 1] += d.rendimiento;
    });

    const fc = Math.pow(sumaTotal, 2) / N;

    let scTotal = 0;
    datos.forEach(d => scTotal += Math.pow(d.rendimiento, 2));
    scTotal = scTotal - fc;

    let scA = 0;
    sumaA.forEach(val => scA += Math.pow(val, 2));
    scA = (scA / (b * r)) - fc;

    let scB = 0;
    sumaB.forEach(val => scB += Math.pow(val, 2));
    scB = (scB / (a * r)) - fc;

    let scTratamientos = 0;
    for (let i = 0; i < a; i++) {
        for (let j = 0; j < b; j++) {
            scTratamientos += Math.pow(sumaAB[i][j], 2);
        }
    }
    scTratamientos = (scTratamientos / r) - fc;

    const scAB = scTratamientos - scA - scB;
    const scError = scTotal - scTratamientos;

    const glA = a - 1;
    const glB = b - 1;
    const glAB = (a - 1) * (b - 1);
    const glTotal = N - 1;
    const glError = a * b * (r - 1);

    const cmA = scA / glA;
    const cmB = scB / glB;
    const cmAB = scAB / glAB;
    const cmError = scError / glError;

    const fCalcA = cmA / cmError;
    const fCalcB = cmB / cmError;
    const fCalcAB = cmAB / cmError;

    const calcStats = (fCalc: number, gl: number) => {
        const f05 = jStat.centralF.inv(0.95, gl, glError);
        const f01 = jStat.centralF.inv(0.99, gl, glError);
        const pVal = 1 - jStat.centralF.cdf(fCalc, gl, glError);
        let conclusion = "NS - No Significativo";
        if (fCalc > f01) conclusion = "** - Altamente significativo";
        else if (fCalc > f05) conclusion = "* - Significativo al 5%";
        return { f05, f01, pVal, conclusion };
    };

    const statsA = calcStats(fCalcA, glA);
    const statsB = calcStats(fCalcB, glB);
    const statsAB = calcStats(fCalcAB, glAB);

    return {
        scA, scB, scAB, scError, scTotal,
        glA, glB, glAB, glError, glTotal,
        cmA, cmB, cmAB, cmError,
        fCalcA, fCalcB, fCalcAB,
        fCrit05A: statsA.f05, fCrit01A: statsA.f01,
        fCrit05B: statsB.f05, fCrit01B: statsB.f01,
        fCrit05AB: statsAB.f05, fCrit01AB: statsAB.f01,
        pValueA: statsA.pVal, pValueB: statsB.pVal, pValueAB: statsAB.pVal,
        conclusionA: statsA.conclusion, conclusionB: statsB.conclusion, conclusionAB: statsAB.conclusion
    };
}
// __________Bi DCA_____________________________

// __________Bi DBA_____________________________
export interface DataRowBiDBA {
    id: string;
    factorA: number;
    factorB: number;
    bloque: number;
    rendimiento: number;
}

export interface AnovaResultBiDBA {
    scBloques: number; scA: number; scB: number; scAB: number; scError: number; scTotal: number;
    glBloques: number; glA: number; glB: number; glAB: number; glError: number; glTotal: number;
    cmBloques: number; cmA: number; cmB: number; cmAB: number; cmError: number;
    fCalcBloques: number; fCalcA: number; fCalcB: number; fCalcAB: number;
    fCrit05Bloques: number; fCrit01Bloques: number;
    fCrit05A: number; fCrit01A: number;
    fCrit05B: number; fCrit01B: number;
    fCrit05AB: number; fCrit01AB: number;
    pValueBloques: number; pValueA: number; pValueB: number; pValueAB: number;
    conclusionBloques: string; conclusionA: string; conclusionB: string; conclusionAB: string;
}

export function calculateBifactorialDBA(a: number, b: number, r: number, datos: DataRowBiDBA[]): AnovaResultBiDBA {
    const N = a * b * r;

    let sumaTotal = 0;
    const sumaBloques = new Array(r).fill(0);
    const sumaA = new Array(a).fill(0);
    const sumaB = new Array(b).fill(0);
    const sumaAB = Array.from({ length: a }, () => new Array(b).fill(0));

    datos.forEach(d => {
        sumaTotal += d.rendimiento;
        sumaBloques[d.bloque - 1] += d.rendimiento;
        sumaA[d.factorA - 1] += d.rendimiento;
        sumaB[d.factorB - 1] += d.rendimiento;
        sumaAB[d.factorA - 1][d.factorB - 1] += d.rendimiento;
    });

    const fc = Math.pow(sumaTotal, 2) / N;

    let scTotal = 0;
    datos.forEach(d => scTotal += Math.pow(d.rendimiento, 2));
    scTotal = scTotal - fc;

    let scBloques = 0;
    sumaBloques.forEach(val => scBloques += Math.pow(val, 2));
    scBloques = (scBloques / (a * b)) - fc;

    let scA = 0;
    sumaA.forEach(val => scA += Math.pow(val, 2));
    scA = (scA / (b * r)) - fc;

    let scB = 0;
    sumaB.forEach(val => scB += Math.pow(val, 2));
    scB = (scB / (a * r)) - fc;

    let scTratamientos = 0;
    for (let i = 0; i < a; i++) {
        for (let j = 0; j < b; j++) {
            scTratamientos += Math.pow(sumaAB[i][j], 2);
        }
    }
    scTratamientos = (scTratamientos / r) - fc;

    const scAB = scTratamientos - scA - scB;
    
    const scError = scTotal - scBloques - scTratamientos;

    const glBloques = r - 1;
    const glA = a - 1;
    const glB = b - 1;
    const glAB = (a - 1) * (b - 1);
    const glTotal = N - 1;
    const glError = (r - 1) * ((a * b) - 1);

    const cmBloques = scBloques / glBloques;
    const cmA = scA / glA;
    const cmB = scB / glB;
    const cmAB = scAB / glAB;
    const cmError = scError / glError;

    const fCalcBloques = cmBloques / cmError;
    const fCalcA = cmA / cmError;
    const fCalcB = cmB / cmError;
    const fCalcAB = cmAB / cmError;

    const calcStats = (fCalc: number, gl: number) => {
        const f05 = jStat.centralF.inv(0.95, gl, glError);
        const f01 = jStat.centralF.inv(0.99, gl, glError);
        const pVal = 1 - jStat.centralF.cdf(fCalc, gl, glError);
        let conclusion = "NS - No Significativo";
        if (fCalc > f01) conclusion = "** - Altamente significativo";
        else if (fCalc > f05) conclusion = "* - Significativo al 5%";
        return { f05, f01, pVal, conclusion };
    };

    const statsBloques = calcStats(fCalcBloques, glBloques);
    const statsA = calcStats(fCalcA, glA);
    const statsB = calcStats(fCalcB, glB);
    const statsAB = calcStats(fCalcAB, glAB);

    return {
        scBloques, scA, scB, scAB, scError, scTotal,
        glBloques, glA, glB, glAB, glError, glTotal,
        cmBloques, cmA, cmB, cmAB, cmError,
        fCalcBloques, fCalcA, fCalcB, fCalcAB,
        fCrit05Bloques: statsBloques.f05, fCrit01Bloques: statsBloques.f01,
        fCrit05A: statsA.f05, fCrit01A: statsA.f01,
        fCrit05B: statsB.f05, fCrit01B: statsB.f01,
        fCrit05AB: statsAB.f05, fCrit01AB: statsAB.f01,
        pValueBloques: statsBloques.pVal, pValueA: statsA.pVal, pValueB: statsB.pVal, pValueAB: statsAB.pVal,
        conclusionBloques: statsBloques.conclusion, conclusionA: statsA.conclusion, conclusionB: statsB.conclusion, conclusionAB: statsAB.conclusion
    };
}
// __________Bi DBA_____________________________

// __________PD DCA_____________________________
export interface DataRowPDDCA {
    id: string;
    factorA: number; // Parcela Principal
    factorB: number; // Sub-parcela
    repeticion: number;
    rendimiento: number;
}

export interface AnovaResultPDDCA {
    scA: number; scErrorA: number; scB: number; scAB: number; scErrorB: number; scTotal: number;
    glA: number; glErrorA: number; glB: number; glAB: number; glErrorB: number; glTotal: number;
    cmA: number; cmErrorA: number; cmB: number; cmAB: number; cmErrorB: number;
    fCalcA: number; fCalcB: number; fCalcAB: number;
    fCrit05A: number; fCrit01A: number;
    fCrit05B: number; fCrit01B: number;
    fCrit05AB: number; fCrit01AB: number;
    pValueA: number; pValueB: number; pValueAB: number;
    conclusionA: string; conclusionB: string; conclusionAB: string;
}

export function calculatePDDCA(a: number, b: number, r: number, datos: DataRowPDDCA[]): AnovaResultPDDCA {
    const N = a * b * r;

    let sumaTotal = 0;
    const sumaA = new Array(a).fill(0);
    const sumaB = new Array(b).fill(0);
    const sumaRepA = Array.from({ length: a }, () => new Array(r).fill(0)); // Interacción A x Repeticiones
    const sumaAB = Array.from({ length: a }, () => new Array(b).fill(0));

    datos.forEach(d => {
        sumaTotal += d.rendimiento;
        sumaA[d.factorA - 1] += d.rendimiento;
        sumaB[d.factorB - 1] += d.rendimiento;
        sumaRepA[d.factorA - 1][d.repeticion - 1] += d.rendimiento;
        sumaAB[d.factorA - 1][d.factorB - 1] += d.rendimiento;
    });

    const fc = Math.pow(sumaTotal, 2) / N;

    let scTotal = 0;
    datos.forEach(d => scTotal += Math.pow(d.rendimiento, 2));
    scTotal = scTotal - fc;

    let scA = 0;
    sumaA.forEach(val => scA += Math.pow(val, 2));
    scA = (scA / (b * r)) - fc;

    let scParcelasP = 0;
    for (let i = 0; i < a; i++) {
        for (let k = 0; k < r; k++) {
            scParcelasP += Math.pow(sumaRepA[i][k], 2);
        }
    }
    scParcelasP = (scParcelasP / b) - fc;

    const scErrorA = scParcelasP - scA;

    let scB = 0;
    sumaB.forEach(val => scB += Math.pow(val, 2));
    scB = (scB / (a * r)) - fc;

    let scTratamientos = 0;
    for (let i = 0; i < a; i++) {
        for (let j = 0; j < b; j++) {
            scTratamientos += Math.pow(sumaAB[i][j], 2);
        }
    }
    scTratamientos = (scTratamientos / r) - fc;

    const scAB = scTratamientos - scA - scB;

    const scErrorB = scTotal - scParcelasP - scB - scAB;

    const glA = a - 1;
    const glErrorA = a * (r - 1);
    const glB = b - 1;
    const glAB = (a - 1) * (b - 1);
    const glErrorB = a * (b - 1) * (r - 1);
    const glTotal = N - 1;

    const cmA = scA / glA;
    const cmErrorA = scErrorA / glErrorA;
    const cmB = scB / glB;
    const cmAB = scAB / glAB;
    const cmErrorB = scErrorB / glErrorB;

    const fCalcA = cmA / cmErrorA;
    const fCalcB = cmB / cmErrorB;
    const fCalcAB = cmAB / cmErrorB;

    const calcStats = (fCalc: number, gl: number, glErr: number) => {
        const f05 = jStat.centralF.inv(0.95, gl, glErr);
        const f01 = jStat.centralF.inv(0.99, gl, glErr);
        const pVal = 1 - jStat.centralF.cdf(fCalc, gl, glErr);
        let conclusion = "NS - No Significativo";
        if (fCalc > f01) conclusion = "** - Altamente significativo";
        else if (fCalc > f05) conclusion = "* - Significativo al 5%";
        return { f05, f01, pVal, conclusion };
    };

    const statsA = calcStats(fCalcA, glA, glErrorA);
    const statsB = calcStats(fCalcB, glB, glErrorB);
    const statsAB = calcStats(fCalcAB, glAB, glErrorB);

    return {
        scA, scErrorA, scB, scAB, scErrorB, scTotal,
        glA, glErrorA, glB, glAB, glErrorB, glTotal,
        cmA, cmErrorA, cmB, cmAB, cmErrorB,
        fCalcA, fCalcB, fCalcAB,
        fCrit05A: statsA.f05, fCrit01A: statsA.f01,
        fCrit05B: statsB.f05, fCrit01B: statsB.f01,
        fCrit05AB: statsAB.f05, fCrit01AB: statsAB.f01,
        pValueA: statsA.pVal, pValueB: statsB.pVal, pValueAB: statsAB.pVal,
        conclusionA: statsA.conclusion, conclusionB: statsB.conclusion, conclusionAB: statsAB.conclusion
    };
}

// __________PD DCA_____________________________