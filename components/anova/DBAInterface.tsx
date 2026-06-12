'use client';

import { useState } from 'react';
import MethodCard from '../MethodCard';
import { parseAnovaFile } from '../../utils/fileParser';
import { calculateDBA, AnovaResultDBA, DataRowDBA } from '../../utils/anovaCalculator';

export default function DBAInterface() {
    const [method, setMethod] = useState<'manual' | 'excel' | null>(null);
    const [tratamientos, setTratamientos] = useState('');
    const [bloques, setBloques] = useState('');
    
    // UI State uses string for inputs
    const [tableData, setTableData] = useState<{id: string, tratamiento: number, bloque: number, produccion: string}[]>([]);
    const [isTableGenerated, setIsTableGenerated] = useState(false);
    const [resultados, setResultados] = useState<AnovaResultDBA | null>(null);

    const handleGenerateTable = () => {
        const t = parseInt(tratamientos);
        const b = parseInt(bloques);

        if (isNaN(t) || isNaN(b) || t <= 0 || b <= 0) {
            alert("Por favor, ingresa valores válidos mayores a 0.");
            return;
        }

        const newData = [];
        for (let i = 1; i <= t; i++) {
            for (let j = 1; j <= b; j++) {
                newData.push({
                    id: `t${i}-b${j}`,
                    tratamiento: i,
                    bloque: j,
                    produccion: '',
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

            {method === 'excel' && (
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                    <label className="block font-medium text-gray-700">Selecciona un archivo:</label>
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
                                    produccion: row.produccion.toString()
                                }));
                                setTableData(mappedData);
                                
                                setTratamientos(Math.max(...mappedData.map(d => d.tratamiento)).toString());
                                setBloques(Math.max(...mappedData.map(d => d.bloque)).toString());
                                setIsTableGenerated(true);
                                setMethod('manual');
                                setResultados(null);
                            } catch (error: any) { alert(error.message); }
                        }}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-xs text-gray-400">Columnas esperadas: <code className="bg-gray-100 px-1 rounded">Tratamiento</code>, <code className="bg-gray-100 px-1 rounded">Bloque (Producción)</code></p>
                </div>
            )}

            {method === 'manual' && !isTableGenerated && (
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                    <h3 className="font-semibold text-gray-800">Parámetros del diseño</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 text-sm text-gray-600">Número de Tratamientos</label>
                            <input type="number" value={tratamientos} onChange={(e) => setTratamientos(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" min={1} />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm text-gray-600">Número de Bloques</label>
                            <input type="number" value={bloques} onChange={(e) => setBloques(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" min={1} />
                        </div>
                    </div>
                    <button onClick={handleGenerateTable} className="mt-2 bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium w-full sm:w-auto">Generar tabla de datos</button>
                </div>
            )}

            {method === 'manual' && isTableGenerated && (
                <div className="space-y-4 fade-in">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800">Ingresar Producción ({tratamientos} Tratamientos, {bloques} Bloques)</h3>
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
                                        <td className="px-6 py-2"><input type="number" value={row.produccion} onChange={(e) => handleInputChange(row.id, e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="0.00" /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                        <button className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors font-medium shadow-sm"
                            onClick={() => {
                                try {
                                    const t = parseInt(tratamientos);
                                    const b = parseInt(bloques);
                                    if (t < 2 || b < 2) { alert("Se requieren al menos 2 tratamientos y 2 bloques."); return; }
                                    
                                    const formattedData: DataRowDBA[] = tableData.map(row => ({
                                        id: row.id, tratamiento: row.tratamiento, bloque: row.bloque,
                                        produccion: parseFloat(row.produccion) || 0 
                                    }));
                                    
                                    setResultados(calculateDBA(t, b, formattedData));
                                } catch (error) { alert("Ocurrió un error al calcular."); }
                            }}>
                            Calcular ANOVA
                        </button>
                    </div>
                </div>
            )}

            {/* DBA TABLE */}
            {resultados && (
                <div className="mt-8 p-6 bg-white border border-gray-200 rounded-xl shadow-lg fade-in">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Tabla ANOVA (Diseño de Bloques al Azar)</h3>
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

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                            <p className="text-sm text-blue-800 font-semibold mb-1">Decisión Tratamientos:</p>
                            <p className="text-md text-blue-900 font-bold">{resultados.conclusionTrat}</p>
                        </div>
                        <div className="p-4 bg-purple-50 border-l-4 border-purple-500 rounded-r-lg">
                            <p className="text-sm text-purple-800 font-semibold mb-1">Decisión Bloques:</p>
                            <p className="text-md text-purple-900 font-bold">{resultados.conclusionBloq}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}