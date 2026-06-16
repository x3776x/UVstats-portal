'use client';

import { useState } from 'react';
import MethodCard from '../MethodCard';
import { calculateDCLFaltante, AnovaResultDCLFaltante, DataRowDCLFaltante } from '../../utils/anovaCalculator';
import { parseDCLFile } from '../../utils/anovaCalculator';
import { useToast } from '../../hooks/useToast';
import Toast from '../Toast';

export default function DCLFaltanteInterface() {
    const [method, setMethod] = useState<'manual' | 'excel' | null>(null);
    const [orden, setOrden] = useState('');
    const { toast, showToast, hideToast } = useToast();
    
    const [tableData, setTableData] = useState<{id: string, fila: number, columna: number, tratamiento: string, produccion: string}[]>([]);
    const [isTableGenerated, setIsTableGenerated] = useState(false);
    const [resultados, setResultados] = useState<AnovaResultDCLFaltante | null>(null);

    const handleGenerateTable = () => {
        const n = parseInt(orden);
        if (isNaN(n) || n < 3) {
            showToast("Para estimar un dato en un DCL, el orden mínimo debe ser 3.", "error");
            return;
        }

        const newData = [];
        for (let f = 1; f <= n; f++) {
            for (let c = 1; c <= n; c++) {
                newData.push({
                    id: `f${f}-c${c}`, fila: f, columna: c, tratamiento: '', produccion: '',
                });
            }
        }
        setTableData(newData);
        setIsTableGenerated(true);
        setResultados(null);
    };

    const handleInputChange = (id: string, field: 'tratamiento' | 'produccion', value: string) => {
        setTableData(prevData => prevData.map(row => row.id === id ? { ...row, [field]: value } : row));
    };

    const handleMethodChange = (newMethod: 'manual' | 'excel') => {
        setMethod(newMethod);
        setIsTableGenerated(false);
        setTableData([]);
        setResultados(null);
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MethodCard icon="📁" label="Cargar datos (Excel/CSV)" isActive={method === 'excel'} onClick={() => handleMethodChange('excel')} />
                <MethodCard icon="⌨️" label="Introducir datos (Manual)" isActive={method === 'manual'} onClick={() => handleMethodChange('manual')} />
            </div>

            {/* SECCIÓN DE EXCEL */}
            {method === 'excel' && (
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                    <label className="block font-medium text-gray-700">Selecciona un archivo Excel/CSV:</label>
                    <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onClick={(e) => (e.currentTarget.value = '')}
                        onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                                const extractedData = await parseDCLFile(file);
                                
                                const mappedData = extractedData.map(row => ({
                                    id: row.id,
                                    fila: row.fila,
                                    columna: row.columna,
                                    tratamiento: row.tratamiento,
                                    produccion: row.produccion === null ? '' : String(row.produccion)
                                }));
                                
                                setTableData(mappedData);
                                
                                const n = Math.max(...mappedData.map(d => d.fila));
                                setOrden(n.toString());
                                setIsTableGenerated(true);
                                
                                setMethod('manual'); 
                                setResultados(null);
                                showToast("Datos cargados. Verifica que solo haya UNA celda de producción en blanco.", "success");
                            } catch (error: any) { 
                                showToast(error.message || "Error al leer el archivo Excel", "error"); 
                            }
                        }}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <div className="text-xs text-gray-500 mt-2">
                        <p>El Excel debe tener 4 columnas obligatorias en este orden:</p>
                        <code className="bg-gray-200 px-2 py-1 rounded">Fila | Columna | Tratamiento | Producción</code>
                        <p className="text-red-500 font-semibold mt-1">Asegúrate de dejar exactamente una celda vacía en Producción.</p>
                    </div>
                </div>
            )}

            {/* SECCIÓN MANUAL */}
            {method === 'manual' && !isTableGenerated && (
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                    <h3 className="font-semibold text-gray-800">Parámetros del Cuadro Latino</h3>
                    <p className="text-sm text-gray-500">Nota: Genera el cuadro y deja <b>exactamente un campo de producción</b> en blanco.</p>
                    <div className="max-w-md">
                        <label className="block mb-1 text-sm text-gray-600">Orden del diseño (Ej. 4 para un 4x4)</label>
                        <input type="number" value={orden} onChange={(e) => setOrden(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" placeholder="Mínimo 3" min={3} />
                    </div>
                    <button onClick={handleGenerateTable} className="mt-2 bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700">Generar cuadro</button>
                </div>
            )}

            {/* TABLA DE DATOS */}
            {method === 'manual' && isTableGenerated && (
                <div className="space-y-4 fade-in">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800 text-red-600">Deja UN campo de Producción vacío.</h3>
                        <button onClick={() => setIsTableGenerated(false)} className="text-sm text-blue-600 hover:underline">Cambiar orden</button>
                    </div>

                    <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg shadow-sm">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3">Fila</th>
                                    <th className="px-6 py-3">Columna</th>
                                    <th className="px-6 py-3">Tratamiento</th>
                                    <th className="px-6 py-3">Producción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tableData.map((row) => (
                                    <tr key={row.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-3 font-medium text-gray-900">Fila {row.fila}</td>
                                        <td className="px-6 py-3">Col {row.columna}</td>
                                        <td className="px-6 py-2">
                                            <input type="text" value={row.tratamiento} onChange={(e) => handleInputChange(row.id, 'tratamiento', e.target.value.toUpperCase())} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" placeholder="Ej. A, B..." />
                                        </td>
                                        <td className="px-6 py-2">
                                            <input type="number" value={row.produccion} onChange={(e) => handleInputChange(row.id, 'produccion', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 placeholder-red-300" placeholder="Vacío = Faltante" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                        <button className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
                            onClick={() => {
                                try {
                                    const n = parseInt(orden);
                                    
                                    if (tableData.some(r => r.tratamiento.trim() === '')) {
                                        showToast("Debes llenar la columna de Tratamientos para todas las filas.", "error");
                                        return;
                                    }

                                    const formattedData: DataRowDCLFaltante[] = tableData.map(row => ({
                                        id: row.id, 
                                        fila: row.fila, 
                                        columna: row.columna, 
                                        tratamiento: row.tratamiento,
                                        produccion: row.produccion.trim() === '' ? null : parseFloat(row.produccion)
                                    }));
                                    
                                    setResultados(calculateDCLFaltante(n, formattedData));
                                    showToast("Estimación y cálculo completados.", "success");
                                } catch (error: any) { 
                                    showToast(error.message || "Ocurrió un error al calcular.", "error"); 
                                }
                            }}>
                            Estimar y Calcular DCL
                        </button>
                    </div>
                </div>
            )}

            {/* RESULTADOS */}
            {resultados && (
                <div className="mt-8 space-y-6 fade-in">
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
                        <span className="text-2xl mr-3">🧮</span>
                        <div>
                            <h4 className="text-yellow-800 font-bold mb-1">Dato Faltante Estimado (Fórmula de Yates para DCL)</h4>
                            <p className="text-yellow-900">
                                Para la celda en <b>Fila {resultados.filaFaltante}, Columna {resultados.colFaltante} (Trat. {resultados.tratFaltante})</b>, 
                                se estimó un valor de <strong className="text-lg bg-yellow-200 px-2 py-1 rounded">{resultados.valorEstimado.toFixed(4)}</strong>. 
                                Se restaron los GL correspondientes del Error y del Total.
                            </p>
                        </div>
                    </div>

                    <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-lg">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Tabla ANOVA Ajustada (Cuadro Latino)</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-700 border-collapse">
                                <thead className="bg-blue-50 text-blue-900 border-b-2 border-blue-200">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">F. de Variación</th>
                                        <th className="px-4 py-3 font-semibold text-right">GL</th>
                                        <th className="px-4 py-3 font-semibold text-right">SC</th>
                                        <th className="px-4 py-3 font-semibold text-right">CM</th>
                                        <th className="px-4 py-3 font-semibold text-right">F Calc</th>
                                        <th className="px-4 py-3 font-semibold text-right">F (0.05)</th>
                                        <th className="px-4 py-3 font-semibold text-right">F (0.01)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium">Tratamientos</td>
                                        <td className="px-4 py-3 text-right">{resultados.glTratamientos}</td>
                                        <td className="px-4 py-3 text-right">{resultados.scTratamientos.toFixed(4)}</td>
                                        <td className="px-4 py-3 text-right">{resultados.cmTratamientos.toFixed(4)}</td>
                                        <td className="px-4 py-3 text-right font-bold text-blue-600">{resultados.fCalcTrat.toFixed(4)}</td>
                                        <td className="px-4 py-3 text-right text-gray-500">{resultados.fCrit05Trat.toFixed(4)}</td>
                                        <td className="px-4 py-3 text-right text-gray-500">{resultados.fCrit01Trat.toFixed(4)}</td>
                                    </tr>
                                    <tr className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium">Filas</td>
                                        <td className="px-4 py-3 text-right">{resultados.glFilas}</td>
                                        <td className="px-4 py-3 text-right">{resultados.scFilas.toFixed(4)}</td>
                                        <td className="px-4 py-3 text-right">{resultados.cmFilas.toFixed(4)}</td>
                                        <td className="px-4 py-3 text-right font-bold text-purple-600">{resultados.fCalcFilas.toFixed(4)}</td>
                                        <td className="px-4 py-3 text-right text-gray-500">{resultados.fCrit05Filas.toFixed(4)}</td>
                                        <td className="px-4 py-3 text-right text-gray-500">{resultados.fCrit01Filas.toFixed(4)}</td>
                                    </tr>
                                    <tr className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium">Columnas</td>
                                        <td className="px-4 py-3 text-right">{resultados.glColumnas}</td>
                                        <td className="px-4 py-3 text-right">{resultados.scColumnas.toFixed(4)}</td>
                                        <td className="px-4 py-3 text-right">{resultados.cmColumnas.toFixed(4)}</td>
                                        <td className="px-4 py-3 text-right font-bold text-green-600">{resultados.fCalcCol.toFixed(4)}</td>
                                        <td className="px-4 py-3 text-right text-gray-500">{resultados.fCrit05Col.toFixed(4)}</td>
                                        <td className="px-4 py-3 text-right text-gray-500">{resultados.fCrit01Col.toFixed(4)}</td>
                                    </tr>
                                    <tr className="border-b hover:bg-gray-50 text-red-600">
                                        <td className="px-4 py-3 font-medium">Error Exp.</td>
                                        <td className="px-4 py-3 text-right font-bold">{resultados.glError}</td>
                                        <td className="px-4 py-3 text-right">{resultados.scError.toFixed(4)}</td>
                                        <td className="px-4 py-3 text-right">{resultados.cmError.toFixed(4)}</td>
                                        <td className="px-4 py-3 text-right">-</td>
                                        <td className="px-4 py-3 text-right">-</td>
                                        <td className="px-4 py-3 text-right">-</td>
                                    </tr>
                                    <tr className="bg-gray-50 font-bold border-t-2 border-gray-200 text-red-600">
                                        <td className="px-4 py-3">Total</td>
                                        <td className="px-4 py-3 text-right font-bold">{resultados.glTotal}</td>
                                        <td className="px-4 py-3 text-right">{resultados.scTotal.toFixed(4)}</td>
                                        <td className="px-4 py-3 text-right">-</td>
                                        <td className="px-4 py-3 text-right">-</td>
                                        <td className="px-4 py-3 text-right">-</td>
                                        <td className="px-4 py-3 text-right">-</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            <Toast 
                message={toast.message} 
                type={toast.type} 
                isVisible={toast.isVisible} 
                onClose={hideToast} 
            />
        </div>
    );
}