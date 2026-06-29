//una media
export function ciUnaMedia(media: number, zt: number, desviacion: number, n: number): [number, number] {
    const margenError = zt * (desviacion / Math.sqrt(n));
    return [media - margenError, media + margenError];
}

//dos medias
export function ciDosMedias(media1: number, media2: number, zt: number, varianza1: number, varianza2: number,
    n1: number, n2: number): [number, number]{
        const margenError = zt * Math.sqrt((varianza1 / n1) + (varianza2 / n2));
        return [(media1 - media2) - margenError, (media1 - media2) + margenError];
    }

export function ciDosMediasVarianzasIguales(media1: number, media2: number, zt: number, varianzaPonderada: number, n1: number, n2: number): [number, number] {
    const margenError = zt * Math.sqrt(varianzaPonderada) * Math.sqrt((1 / n1) + (1 / n2));
    return [(media1 - media2) - margenError, (media1 - media2) + margenError];
}

//dos Medias (Pareadas / Dependientes) ---
export function ciMediasPareadas(mediaDiferencias: number, zt: number, desviacionDiferencias: number, n: number): [number, number] {
    const margenError = zt * (desviacionDiferencias / Math.sqrt(n));
    return [mediaDiferencias - margenError, mediaDiferencias + margenError];
}

//proporciones ---
export function ciUnaProporcion(p: number, q: number, n: number, z: number): [number, number] {
    const margenError = z * Math.sqrt((p * q) / n);
    return [p - margenError, p + margenError];
}

export function ciDosProporciones(p1: number, q1: number, n1: number, p2: number, q2: number, n2: number, z: number): [number, number] {
    const margenError = z * Math.sqrt((p1 * q1) / n1 + (p2 * q2) / n2);
    return [(p1 - p2) - margenError, (p1 - p2) + margenError];
}

export function t0UnaMedia(promedio: number, supuesto: number, varianza: number, n: number): number {
    return (Math.sqrt(n) * (promedio - supuesto)) / Math.sqrt(varianza); 
}

// --- Dos Medias ---
export function t0DosGruposVarianzasDiferentes(promedio1: number, promedio2: number, supuesto: number, varianza1: number, varianza2: number, n1: number, n2: number): number {
    return (promedio1 - promedio2 - supuesto) / Math.sqrt((varianza1 / n1) + (varianza2 / n2));
}

export function t0DosGruposVarianzasIguales(promedio1: number, promedio2: number, supuesto: number, sp: number, n1: number, n2: number): number {
    return (promedio1 - promedio2 - supuesto) / (sp * Math.sqrt((1 / n1) + (1 / n2)));
}

export function gradosLibertadWelch(varianza1: number, varianza2: number, n1: number, n2: number): number {
    const numerador = Math.pow((varianza1 / n1) + (varianza2 / n2), 2);
    const denominador = (Math.pow(varianza1 / n1, 2) / (n1 - 1)) + (Math.pow(varianza2 / n2, 2) / (n2 - 1));
    const gl = numerador / denominador;
    
    return (gl - Math.floor(gl) >= 0.5) ? Math.ceil(gl) : Math.floor(gl);
}

//Prueba de hipotesis
export function evaluarHipotesisValorAbsoluto(t0: number, valorCritico: number): string {
    if (t0 < 0 && valorCritico < 0) {
        return t0 > valorCritico ? "No se rechaza la Hipótesis nula (H0)" : "Se rechaza la Hipótesis nula (H0)";
    } 
    else if (t0 > valorCritico) {
        return "Se rechaza la Hipótesis nula (H0)";
    } 
    else {
        return "No se rechaza la Hipótesis nula (H0)";
    }
}