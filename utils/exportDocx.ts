import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, HeadingLevel, WidthType } from 'docx';
import { saveAs } from 'file-saver';
import { EstadisticasBasicas, FilaFrecuencia } from './estadisticaCalculator';

export async function exportarReporteDocx(
    resultados: Record<string, EstadisticasBasicas>,
    config: any,
    varFrecuencia: string,
    tablaFrecuencia: FilaFrecuencia[] | null
) {
    const variables = Object.keys(resultados);
    if (variables.length === 0) return;

    const headersResumen = [
        new TableCell({ children: [new Paragraph({ text: "Variable", style: "Strong" })] }),
        new TableCell({ children: [new Paragraph({ text: "N", style: "Strong" })] })
    ];
    if (config.media) headersResumen.push(new TableCell({ children: [new Paragraph({ text: "Media", style: "Strong" })] }));
    if (config.mediana) headersResumen.push(new TableCell({ children: [new Paragraph({ text: "Mediana", style: "Strong" })] }));
    if (config.moda) headersResumen.push(new TableCell({ children: [new Paragraph({ text: "Moda", style: "Strong" })] }));
    if (config.desviacion) headersResumen.push(new TableCell({ children: [new Paragraph({ text: "Desv. Est.", style: "Strong" })] }));
    if (config.varianza) headersResumen.push(new TableCell({ children: [new Paragraph({ text: "Varianza", style: "Strong" })] }));
    if (config.cv) headersResumen.push(new TableCell({ children: [new Paragraph({ text: "CV (%)", style: "Strong" })] }));
    if (config.q1) headersResumen.push(new TableCell({ children: [new Paragraph({ text: "Q1", style: "Strong" })] }));
    if (config.q3) headersResumen.push(new TableCell({ children: [new Paragraph({ text: "Q3", style: "Strong" })] }));
    if (config.iqr) headersResumen.push(new TableCell({ children: [new Paragraph({ text: "Rango Int.", style: "Strong" })] }));

    const rowsResumen = variables.map(v => {
        const r = resultados[v];
        const cells = [
            new TableCell({ children: [new Paragraph(v)] }),
            new TableCell({ children: [new Paragraph(r.n.toString())] })
        ];
        if (config.media) cells.push(new TableCell({ children: [new Paragraph(r.media.toFixed(4))] }));
        if (config.mediana) cells.push(new TableCell({ children: [new Paragraph(r.mediana.toFixed(4))] }));
        if (config.moda) cells.push(new TableCell({ children: [new Paragraph(r.moda.length > 0 ? r.moda.join(', ') : 'N/A')] }));
        if (config.desviacion) cells.push(new TableCell({ children: [new Paragraph(r.desviacionEstandarMuestral.toFixed(4))] }));
        if (config.varianza) cells.push(new TableCell({ children: [new Paragraph(r.varianzaMuestral.toFixed(4))] }));
        if (config.cv) cells.push(new TableCell({ children: [new Paragraph(r.coeficienteVariacion.toFixed(4))] }));
        if (config.q1) cells.push(new TableCell({ children: [new Paragraph(r.q1.toFixed(4))] }));
        if (config.q3) cells.push(new TableCell({ children: [new Paragraph(r.q3.toFixed(4))] }));
        if (config.iqr) cells.push(new TableCell({ children: [new Paragraph(r.iqr.toFixed(4))] }));
        return new TableRow({ children: cells });
    });

    const tablaResumen = new Table({
        rows: [new TableRow({ children: headersResumen }), ...rowsResumen],
        width: { size: 100, type: WidthType.PERCENTAGE }
    });

    const childrenContenido: any[] = [
        new Paragraph({
            text: "Reporte de Estadística Descriptiva",
            heading: HeadingLevel.HEADING_1,
            alignment: "center"
        }),
        new Paragraph({ text: "Resumen Estadístico", heading: HeadingLevel.HEADING_2 }),
        tablaResumen,
        new Paragraph({ text: "" })
    ];

    if (tablaFrecuencia && tablaFrecuencia.length > 0) {
        childrenContenido.push(
            new Paragraph({ text: `Tabla de Frecuencias: ${varFrecuencia} (Regla de Sturges)`, heading: HeadingLevel.HEADING_2 })
        );

        const headersFrec = ["Clase (Intervalo)", "Marca Clase", "Frec. Abs (fi)", "Frec. Acum (Fi)", "Frec. Rel (%)", "Frec. Rel Acum (%)"].map(
            text => new TableCell({ children: [new Paragraph({ text, style: "Strong" })] })
        );

        const rowsFrec = tablaFrecuencia.map((f, i) => {
            return new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph(`[${f.limiteInferior.toFixed(2)} - ${f.limiteSuperior.toFixed(2)}${i === tablaFrecuencia.length - 1 ? ']' : ')'}`)] }),
                    new TableCell({ children: [new Paragraph(f.marcaClase.toFixed(2))] }),
                    new TableCell({ children: [new Paragraph(f.frecuenciaAbsoluta.toString())] }),
                    new TableCell({ children: [new Paragraph(f.frecuenciaAcumulada.toString())] }),
                    new TableCell({ children: [new Paragraph(f.frecuenciaRelativa.toFixed(2))] }),
                    new TableCell({ children: [new Paragraph(f.frecuenciaRelativaAcumulada.toFixed(2))] })
                ]
            });
        });

        childrenContenido.push(new Table({
            rows: [new TableRow({ children: headersFrec }), ...rowsFrec],
            width: { size: 100, type: WidthType.PERCENTAGE }
        }));
    }

    const doc = new Document({
        sections: [{ properties: {}, children: childrenContenido }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "Reporte_Estadistica_Descriptiva.docx");
}