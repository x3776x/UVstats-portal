export interface GasolinaRow {
    anio: number;
    consumoDiario: number;
    consumoAnual: number;
    importacionDiaria: number;
    importacionAnual: number;
    consumoLts: number;
    importacionLts: number;
    porcentajePemex: number;
}

export interface EtanolRow {
    anio: number;
    consumoGasolina: number;
    gasolinaSustituible: number;
    importacionAnualBarriles: number;
    importacionAnualLitros: number;
    ahorroDolares: number;
    haNecesarias: number;
    haAdicionales: number;
}

export const calcularProyecciones = (
    anios: number,
    anioActual: number,
    prodDiaria: number,
    imporDiaria: number,
    crecimientoImpor: number,
    sustitucionEtanol: number,
    precioGasolina: number,
    precioDolar: number,
    litrosEtanol: number,
    rendimientoCampo: number,
    hectareasDisponibles: number
): { gasolinas: GasolinaRow[], etanoles: EtanolRow[] } => {
    const gasolinas: GasolinaRow[] = [];
    const etanoles: EtanolRow[] = [];
    
    let consumoBarriles = prodDiaria + imporDiaria;

    for (let i = 0; i < anios; i++) {
        if (i === 0) {
            gasolinas.push({
                anio: anioActual,
                consumoDiario: consumoBarriles,
                consumoAnual: consumoBarriles * 365,
                importacionDiaria: imporDiaria,
                importacionAnual: imporDiaria * 365,
                consumoLts: (consumoBarriles * 365) * 159,
                importacionLts: (imporDiaria * 365) * 159,
                porcentajePemex: (imporDiaria * 100) / prodDiaria
            });
        } else {
            const prev = gasolinas[i - 1];
            const nuevoConsumoDiario = prev.consumoDiario + (prev.consumoDiario * crecimientoImpor / 100);
            const nuevoImportacionDiaria = prev.importacionDiaria + (prev.consumoDiario * crecimientoImpor / 100);
            
            gasolinas.push({
                anio: anioActual + i,
                consumoDiario: nuevoConsumoDiario,
                consumoAnual: prev.consumoAnual + (prev.consumoAnual * crecimientoImpor / 100),
                importacionDiaria: nuevoImportacionDiaria,
                importacionAnual: nuevoImportacionDiaria * 365,
                consumoLts: (prev.consumoAnual + (prev.consumoAnual * crecimientoImpor / 100)) * 159,
                importacionLts: (nuevoImportacionDiaria * 365) * 159,
                porcentajePemex: (nuevoImportacionDiaria * 100) / prodDiaria
            });
        }
    }

    for (let i = 0; i < anios; i++) {
        const gasRow = gasolinas[i];
        const pctSustitucion = sustitucionEtanol / 100;
        
        const consumoGasolina = gasRow.consumoLts;
        const gasolinaSustituible = consumoGasolina * pctSustitucion;
        const imporBarriles = gasRow.importacionAnual;
        const imporLitros = gasRow.importacionLts;
        const ahorroDolares = gasolinaSustituible * precioGasolina / precioDolar;
        const haNecesarias = (gasolinaSustituible / litrosEtanol / rendimientoCampo) - hectareasDisponibles;
        
        let haAdicionales = 0;
        if (i > 0) {
            haAdicionales = haNecesarias - etanoles[i - 1].haNecesarias;
        }

        etanoles.push({
            anio: gasRow.anio,
            consumoGasolina,
            gasolinaSustituible,
            importacionAnualBarriles: imporBarriles,
            importacionAnualLitros: imporLitros,
            ahorroDolares,
            haNecesarias,
            haAdicionales
        });
    }

    return { gasolinas, etanoles };
};