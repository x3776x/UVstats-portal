export interface EstadisticasBasicas {
    n: number;
    minimo: number;
    maximo: number;
    rango: number;
    media: number;
    mediana: number;
    moda: number[];
    varianzaMuestral: number;
    desviacionEstandarMuestral: number;
    coeficienteVariacion: number;
    q1: number;
    q2: number;
    q3: number;
    iqr: number;
}

export function calcularEstadisticasBasicas(datos: number[]): EstadisticasBasicas {
    if (!datos || datos.length === 0) {
        throw new Error("El arreglo de datos está vacío.");
    }

    const n = datos.length;
    
    const ordenados = [...datos].sort((a, b) => a - b);

    const minimo = ordenados[0];
    const maximo = ordenados[n - 1];
    const rango = maximo - minimo;

    const suma = ordenados.reduce((acc, val) => acc + val, 0);
    const media = suma / n;

    const calcularMediana = (arr: number[]) => {
        const mitad = Math.floor(arr.length / 2);
        if (arr.length % 2 === 0) {
            return (arr[mitad - 1] + arr[mitad]) / 2;
        }
        return arr[mitad];
    };
    const mediana = calcularMediana(ordenados);

    const frecuencias: Record<number, number> = {};
    let maxFrecuencia = 0;
    
    ordenados.forEach(num => {
        frecuencias[num] = (frecuencias[num] || 0) + 1;
        if (frecuencias[num] > maxFrecuencia) {
            maxFrecuencia = frecuencias[num];
        }
    });

    let moda: number[] = [];
    if (maxFrecuencia > 1) { 
        for (const clave in frecuencias) {
            if (frecuencias[clave] === maxFrecuencia) {
                moda.push(Number(clave));
            }
        }
    }

    let sumaDiferenciasCuadradas = 0;
    ordenados.forEach(num => {
        sumaDiferenciasCuadradas += Math.pow(num - media, 2);
    });
    
    const varianzaMuestral = n > 1 ? sumaDiferenciasCuadradas / (n - 1) : 0;
    const desviacionEstandarMuestral = Math.sqrt(varianzaMuestral);

    const coeficienteVariacion = media !== 0 ? (desviacionEstandarMuestral / media) * 100 : 0;

    const calcularCuartil = (arr: number[], q: 1 | 3) => {
        const posicion = (q / 4) * (n + 1);
        const indiceBase = Math.floor(posicion) - 1;
        const fraccion = posicion - Math.floor(posicion);

        if (indiceBase < 0) return arr[0];
        if (indiceBase >= n - 1) return arr[n - 1];

        return arr[indiceBase] + fraccion * (arr[indiceBase + 1] - arr[indiceBase]);
    };

    const q1 = calcularCuartil(ordenados, 1);
    const q3 = calcularCuartil(ordenados, 3);
    const iqr = q3 - q1;

    return {
        n, minimo, maximo, rango,
        media, mediana, moda,
        varianzaMuestral, desviacionEstandarMuestral, coeficienteVariacion,
        q1, q2: mediana, q3, iqr
    };
}

export function calcularMediaPonderada(valores: number[], pesos: number[]): number {
    if (valores.length !== pesos.length || valores.length === 0) {
        throw new Error("La cantidad de valores y pesos debe ser igual y mayor a 0.");
    }
    let sumaProducto = 0;
    let sumaPesos = 0;
    for (let i = 0; i < valores.length; i++) {
        sumaProducto += valores[i] * pesos[i];
        sumaPesos += pesos[i];
    }
    return sumaPesos === 0 ? 0 : sumaProducto / sumaPesos;
}

export interface FilaFrecuencia {
    limiteInferior: number;
    limiteSuperior: number;
    marcaClase: number;
    frecuenciaAbsoluta: number;
    frecuenciaAcumulada: number;
    frecuenciaRelativa: number;
    frecuenciaRelativaAcumulada: number;
}

export function calcularTablaFrecuencias(datos: number[]): FilaFrecuencia[] {
    if (!datos || datos.length === 0) return [];

    const n = datos.length;
    const ordenados = [...datos].sort((a, b) => a - b);
    const minimo = ordenados[0];
    const maximo = ordenados[n - 1];
    const rango = maximo - minimo;

    const numIntervalos = Math.ceil(1 + Math.log2(n));
    const amplitud = rango / numIntervalos;

    const tabla: FilaFrecuencia[] = [];
    let frecuenciaAcumulada = 0;
    let porcentajeAcumulado = 0;

    for (let i = 0; i < numIntervalos; i++) {
        const limiteInferior = minimo + (i * amplitud);
        const limiteSuperior = minimo + ((i + 1) * amplitud);
        const marcaClase = (limiteInferior + limiteSuperior) / 2;
        
        let frecuenciaAbsoluta = 0;
        ordenados.forEach(dato => {
            if (dato >= limiteInferior && (dato < limiteSuperior || (i === numIntervalos - 1 && dato <= limiteSuperior))) {
                frecuenciaAbsoluta++;
            }
        });

        frecuenciaAcumulada += frecuenciaAbsoluta;
        const frecuenciaRelativa = (frecuenciaAbsoluta / n) * 100;
        porcentajeAcumulado += frecuenciaRelativa;

        tabla.push({
            limiteInferior,
            limiteSuperior,
            marcaClase,
            frecuenciaAbsoluta,
            frecuenciaAcumulada,
            frecuenciaRelativa,
            frecuenciaRelativaAcumulada: porcentajeAcumulado
        });
    }

    return tabla;
}