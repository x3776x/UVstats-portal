'use client';

import { useState } from 'react';
import MethodCard from '../MethodCard';
import Toast from '../Toast';
import { useToast } from '@/hooks/useToast';
import { parseAnovaFile } from '@/utils/fileParser';
import { calculateDBAFaltante, AnovaResultDBAFaltante, DataRowDBAFaltante } from '../../utils/anovaCalculator';

export default function DBAFaltanteInterface() {
    const [method, setMethod] = useState<'manual' | 'excel' | null>(null);
    const { toast, showToast, hideToast } = useToast();
    const [tratamientos, setTratamientos] = useState('');
    const [bloques, setBloques] = useState('');
    
    const [tableData, setTableData] = useState<{id: string, tratamiento: number, bloque: number, produccion: string}[]>([]);
    const [isTableGenerated, setIsTableGenerated] = useState(false);
    const [resultados, setResultados] = useState<AnovaResultDBAFaltante | null>(null);

    const handleGenerateTable = () => {
        const t = parseInt(tratamientos);
        const b = parseInt(bloques);

        if (isNaN(t) || isNaN(b) || t <= 0 || b <= 0) {
            showToast("Por favor, ingresa valores mayores a 0.", "error");
            return;
        }

        const newData = [];
        for (let i = 1; i <= t; i++) {
            for (let j = 1; j <= b; j++) {
                newData.push({
                    id: `t${i}-b${j}`, tratamiento: i, bloque: j, produccion: '',
                });
            }
        }
        setTableData(newData);
        setIsTableGenerated(true);
        setResultados(null);
    };

    const handleInputChange = (id: string, value: string) => {
        setTableData(prevData => prevData.map(row => row.id === id ? { ...row, produccion: value } : row));
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MethodCard icon="📁" label="Cargar datos (Excel/CSV)" isActive={method === 'excel'} onClick={() => { setMethod('excel'); setIsTableGenerated(false); setTableData([]); setResultados(null); }} />
                <MethodCard icon="⌨️" label="Introducir datos (Manual)" isActive={method === 'manual'} onClick={() => { setMethod('manual'); setIsTableGenerated(false); setTableData([]); setResultados(null); }} />
                
            </div>

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
                                const extractedData = await parseAnovaFile(file);
                                
                                const mappedData = extractedData.map(row => ({
                                    id: row.id,
                                    tratamiento: row.tratamiento,
                                    bloque: row.repeticion, 
                                    produccion: row.produccion === null ? '' : String(row.produccion)
                                }));
                                
                                setTableData(mappedData);
                                
                                setTratamientos(Math.max(...mappedData.map(d => d.tratamiento)).toString());
                                setBloques(Math.max(...mappedData.map(d => d.bloque)).toString());
                                setIsTableGenerated(true);
                                
                                setMethod('manual'); 
                                setResultados(null);
                                showToast("Archivo cargado. Verifica que el dato faltante esté en blanco.", "success");
                            } catch (error: any) { 
                                showToast(error.message || "Error al leer el archivo", "error"); 
                            }
                        }}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-xs text-gray-400">
                        Asegúrate de dejar <b>una celda vacía</b> en la columna de Producción de tu Excel.
                    </p>
                </div>
            )}

            {method === 'manual' && !isTableGenerated && (
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                    <h3 className="font-semibold text-gray-800">Parámetros del diseño</h3>
                    <p className="text-sm text-gray-500">Nota: Genera la tabla y deja <b>exactamente un</b> campo en blanco.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 text-sm text-gray-600">Número de Tratamientos</label>
                            <input type="number" value={tratamientos} onChange={(e) => setTratamientos(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" min={1} />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm text-gray-600">Número de Bloques</label>
                            <input type="number" value={bloques} onChange={(e) => setBloques(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" min={1} />
                        </div>
                    </div>
                    <button onClick={handleGenerateTable} className="mt-2 bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 w-full sm:w-auto">Generar tabla</button>
                </div>
            )}

            {method === 'manual' && isTableGenerated && (
                <div className="space-y-4 fade-in">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800 text-red-600">Deja un campo vacío para el dato faltante.</h3>
                        <button onClick={() => setIsTableGenerated(false)} className="text-sm text-blue-600 hover:underline">Cambiar parámetros</button>
                    </div>

                    <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg shadow-sm">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 w-1/3">Tratamiento</th>
                                    <th className="px-6 py-3 w-1/3">Bloque</th>
                                    <th className="px-6 py-3 w-1/3">Producción</th>
                                </tr>
                            </thead>
                            <tbody>
                                
                                {tableData.map((row) => (
                                    <tr key={row.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-3 font-medium text-gray-900">Trat. {row.tratamiento}</td>
                                        <td className="px-6 py-3">Bloque {row.bloque}</td>
                                        <td className="px-6 py-2">
                                            <input type="number" value={row.produccion} onChange={(e) => handleInputChange(row.id, e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 placeholder-red-300" placeholder="Vacio = Faltante" />
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
                                    const formattedData: DataRowDBAFaltante[] = tableData.map(row => ({
                                        id: row.id, tratamiento: row.tratamiento, bloque: row.bloque,
                                        produccion: row.produccion.trim() === '' ? null : parseFloat(row.produccion)
                                    }));
                                    
                                    setResultados(calculateDBAFaltante(parseInt(tratamientos), parseInt(bloques), formattedData));
                                } catch (error: any) { 
                                    showToast("${error.message}", "error"); 
                                }
                            }}>
                            Estimar y Calcular
                        </button>
                    </div>
                </div>
            )}

            {resultados && (
                <div className="mt-8 space-y-6 fade-in">
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
                        <span className="text-2xl mr-3">🧮</span>
                        <div>
                            <h4 className="text-yellow-800 font-bold mb-1">Dato Faltante Estimado (Fórmula de Yates)</h4>
                            <p className="text-yellow-900">
                                Para el <b>Tratamiento {resultados.tratFaltante}</b> en el <b>Bloque {resultados.bloqFaltante}</b>, 
                                se estimó un valor de producción de <strong className="text-lg bg-yellow-200 px-2 py-1 rounded">{resultados.valorEstimado.toFixed(4)}</strong>. 
                                Se han restado los grados de libertad correspondientes.
                            </p>
                        </div>
                    </div>

                    {/* DBA TABLE */}
                    <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-lg">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Tabla ANOVA Ajustada</h3>
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
                                        <td className="px-4 py-3 font-medium">Bloques</td>
                                        <td className="px-4 py-3 text-right">{resultados.glBloques}</td>
                                        <td className="px-4 py-3 text-right">{resultados.scBloques.toFixed(4)}</td>
                                        <td className="px-4 py-3 text-right">{resultados.cmBloques.toFixed(4)}</td>
                                        <td className="px-4 py-3 text-right font-bold text-purple-600">{resultados.fCalcBloq.toFixed(4)}</td>
                                        <td className="px-4 py-3 text-right text-gray-500">{resultados.fCrit05Bloq.toFixed(4)}</td>
                                        <td className="px-4 py-3 text-right text-gray-500">{resultados.fCrit01Bloq.toFixed(4)}</td>
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