'use client';

import { useState } from 'react';
import MethodCard from '../MethodCard';
import { calculateDCL, AnovaResultDCL, DataRowDCL } from '../../utils/anovaCalculator';

export default function DCLInterface() {
    const [method, setMethod] = useState<'manual' | null>(null);
    const [orden, setOrden] = useState('');
    
    const [tableData, setTableData] = useState<{id: string, fila: number, columna: number, tratamiento: string, produccion: string}[]>([]);
    const [isTableGenerated, setIsTableGenerated] = useState(false);
    const [resultados, setResultados] = useState<AnovaResultDCL | null>(null);

    const handleGenerateTable = () => {
        const n = parseInt(orden);
        if (isNaN(n) || n < 3) {
            alert("El orden del diseño debe ser al menos 3 (un cuadro 3x3). Un 2x2 no tiene error experimental.");
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

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MethodCard icon="⌨️" label="Introducir datos (Manual)" isActive={method === 'manual'} onClick={() => { setMethod('manual'); setIsTableGenerated(false); setTableData([]); setResultados(null); }} />
            </div>

            {method === 'manual' && !isTableGenerated && (
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                    <h3 className="font-semibold text-gray-800">Parámetros del Cuadro Latino</h3>
                    <div className="max-w-md">
                        <label className="block mb-1 text-sm text-gray-600">Orden del diseño (Ej. 4 para un 4x4)</label>
                        <input type="number" value={orden} onChange={(e) => setOrden(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" placeholder="Mínimo 3" min={3} />
                    </div>
                    <button onClick={handleGenerateTable} className="mt-2 bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700">Generar cuadro de datos</button>
                </div>
            )}

            {method === 'manual' && isTableGenerated && (
                <div className="space-y-4 fade-in">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800">Cuadro Latino de {orden}x{orden} ({parseInt(orden) * parseInt(orden)} datos)</h3>
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
                                            <input type="number" value={row.produccion} onChange={(e) => handleInputChange(row.id, 'produccion', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" placeholder="0.00" />
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
                                    const hasEmptyFields = tableData.some(r => r.tratamiento.trim() === '' || r.produccion.trim() === '');
                                    if (hasEmptyFields) { alert("Llena todos los campos."); return; }

                                    const formattedData: DataRowDCL[] = tableData.map(row => ({
                                        id: row.id, fila: row.fila, columna: row.columna, tratamiento: row.tratamiento,
                                        produccion: parseFloat(row.produccion) || 0
                                    }));
                                    
                                    setResultados(calculateDCL(n, formattedData));
                                } catch (error: any) { alert(error.message); }
                            }}>
                            Calcular ANOVA DCL
                        </button>
                    </div>
                </div>
            )}

            {resultados && (
                <div className="mt-8 p-6 bg-white border border-gray-200 rounded-xl shadow-lg fade-in">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Tabla ANOVA (Diseño Cuadro Latino)</h3>
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
                                <tr className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium">Error Exp.</td>
                                    <td className="px-4 py-3 text-right">{resultados.glError}</td>
                                    <td className="px-4 py-3 text-right">{resultados.scError.toFixed(4)}</td>
                                    <td className="px-4 py-3 text-right">{resultados.cmError.toFixed(4)}</td>
                                    <td className="px-4 py-3 text-right">-</td>
                                    <td className="px-4 py-3 text-right">-</td>
                                    <td className="px-4 py-3 text-right">-</td>
                                </tr>
                                <tr className="bg-gray-50 font-bold border-t-2 border-gray-200">
                                    <td className="px-4 py-3">Total</td>
                                    <td className="px-4 py-3 text-right">{resultados.glTotal}</td>
                                    <td className="px-4 py-3 text-right">{resultados.scTotal.toFixed(4)}</td>
                                    <td className="px-4 py-3 text-right">-</td>
                                    <td className="px-4 py-3 text-right">-</td>
                                    <td className="px-4 py-3 text-right">-</td>
                                    <td className="px-4 py-3 text-right">-</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                            <p className="text-xs text-blue-800 font-semibold mb-1">Decisión Tratamientos:</p>
                            <p className="text-sm text-blue-900 font-bold">{resultados.conclusionTrat}</p>
                        </div>
                        <div className="p-3 bg-purple-50 border-l-4 border-purple-500 rounded-r-lg">
                            <p className="text-xs text-purple-800 font-semibold mb-1">Decisión Filas:</p>
                            <p className="text-sm text-purple-900 font-bold">{resultados.conclusionFilas}</p>
                        </div>
                        <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                            <p className="text-xs text-green-800 font-semibold mb-1">Decisión Columnas:</p>
                            <p className="text-sm text-green-900 font-bold">{resultados.conclusionCol}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}