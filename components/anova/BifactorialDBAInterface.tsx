'use client';

import { useState } from 'react';
import MethodCard from '../MethodCard';
import { calculateBifactorialDBA, AnovaResultBiDBA, DataRowBiDBA } from '../../utils/anovaCalculator';

export default function BifactorialDBAInterface() {
    const [method, setMethod] = useState<'manual' | null>(null);
    const [nivelesA, setNivelesA] = useState('');
    const [nivelesB, setNivelesB] = useState('');
    const [bloques, setBloques] = useState('');
    
    const [tableData, setTableData] = useState<{id: string, factorA: number, factorB: number, bloque: number, rendimiento: string}[]>([]);
    const [isTableGenerated, setIsTableGenerated] = useState(false);
    const [resultados, setResultados] = useState<AnovaResultBiDBA | null>(null);

    const handleGenerateTable = () => {
        const a = parseInt(nivelesA);
        const b = parseInt(nivelesB);
        const r = parseInt(bloques);

        if (isNaN(a) || isNaN(b) || isNaN(r) || a < 2 || b < 2 || r < 2) {
            alert("Se requieren al menos 2 niveles para cada factor y 2 bloques.");
            return;
        }

        const newData = [];
        for (let i = 1; i <= a; i++) {
            for (let j = 1; j <= b; j++) {
                for (let k = 1; k <= r; k++) {
                    newData.push({
                        id: `a${i}-b${j}-blk${k}`,
                        factorA: i,
                        factorB: j,
                        bloque: k,
                        rendimiento: '',
                    });
                }
            }
        }
        setTableData(newData);
        setIsTableGenerated(true);
        setResultados(null);
    };

    const handleInputChange = (id: string, value: string) => {
        setTableData(prevData => prevData.map(row => row.id === id ? { ...row, rendimiento: value } : row));
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MethodCard icon="⌨️" label="Introducir datos (Manual)" isActive={method === 'manual'} onClick={() => { setMethod('manual'); setIsTableGenerated(false); setTableData([]); setResultados(null); }} />
            </div>

            {method === 'manual' && !isTableGenerated && (
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                    <h3 className="font-semibold text-gray-800">Parámetros del Diseño Bifactorial DBA</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block mb-1 text-sm text-gray-600">Niveles Factor A (Variedades)</label>
                            <input type="number" value={nivelesA} onChange={(e) => setNivelesA(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" min={2} />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm text-gray-600">Niveles Factor B (Tratamientos)</label>
                            <input type="number" value={nivelesB} onChange={(e) => setNivelesB(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" min={2} />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm text-gray-600">Número de Bloques</label>
                            <input type="number" value={bloques} onChange={(e) => setBloques(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" min={2} />
                        </div>
                    </div>
                    <button onClick={handleGenerateTable} className="mt-2 bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 w-full sm:w-auto">Generar tabla</button>
                </div>
            )}

            {method === 'manual' && isTableGenerated && (
                <div className="space-y-4 fade-in">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800">Ingresar Rendimiento ({parseInt(nivelesA) * parseInt(nivelesB) * parseInt(bloques)} datos)</h3>
                        <button onClick={() => setIsTableGenerated(false)} className="text-sm text-blue-600 hover:underline">Cambiar parámetros</button>
                    </div>

                    <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg shadow-sm">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 w-1/4">Factor A</th>
                                    <th className="px-6 py-3 w-1/4">Factor B</th>
                                    <th className="px-6 py-3 w-1/4">Bloque</th>
                                    <th className="px-6 py-3 w-1/4">Rendimiento</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tableData.map((row) => (
                                    <tr key={row.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-3 font-medium text-gray-900">Nivel {row.factorA}</td>
                                        <td className="px-6 py-3">Nivel {row.factorB}</td>
                                        <td className="px-6 py-3">Bloque {row.bloque}</td>
                                        <td className="px-6 py-2">
                                            <input type="number" value={row.rendimiento} onChange={(e) => handleInputChange(row.id, e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" placeholder="0.00" />
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
                                    const hasEmpty = tableData.some(r => r.rendimiento.trim() === '');
                                    if (hasEmpty) { alert("Llena todos los campos de rendimiento."); return; }

                                    const formattedData: DataRowBiDBA[] = tableData.map(row => ({
                                        ...row, rendimiento: parseFloat(row.rendimiento) || 0
                                    }));
                                    
                                    setResultados(calculateBifactorialDBA(parseInt(nivelesA), parseInt(nivelesB), parseInt(bloques), formattedData));
                                } catch (error) { alert("Ocurrió un error al calcular."); }
                            }}>
                            Calcular ANOVA
                        </button>
                    </div>
                </div>
            )}

            {resultados && (
                <div className="mt-8 p-6 bg-white border border-gray-200 rounded-xl shadow-lg fade-in">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Tabla ANOVA (Bifactorial DBA)</h3>
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
                                    <td className="px-4 py-3 font-medium">Bloques</td>
                                    <td className="px-4 py-3 text-right">{resultados.glBloques}</td>
                                    <td className="px-4 py-3 text-right">{resultados.scBloques.toFixed(4)}</td>
                                    <td className="px-4 py-3 text-right">{resultados.cmBloques.toFixed(4)}</td>
                                    <td className="px-4 py-3 text-right font-bold text-purple-600">{resultados.fCalcBloques.toFixed(4)}</td>
                                    <td className="px-4 py-3 text-right text-gray-500">{resultados.fCrit05Bloques.toFixed(4)}</td>
                                    <td className="px-4 py-3 text-right text-gray-500">{resultados.fCrit01Bloques.toFixed(4)}</td>
                                </tr>
                                <tr className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium">Factor A</td>
                                    <td className="px-4 py-3 text-right">{resultados.glA}</td>
                                    <td className="px-4 py-3 text-right">{resultados.scA.toFixed(4)}</td>
                                    <td className="px-4 py-3 text-right">{resultados.cmA.toFixed(4)}</td>
                                    <td className="px-4 py-3 text-right font-bold text-blue-600">{resultados.fCalcA.toFixed(4)}</td>
                                    <td className="px-4 py-3 text-right text-gray-500">{resultados.fCrit05A.toFixed(4)}</td>
                                    <td className="px-4 py-3 text-right text-gray-500">{resultados.fCrit01A.toFixed(4)}</td>
                                </tr>
                                <tr className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium">Factor B</td>
                                    <td className="px-4 py-3 text-right">{resultados.glB}</td>
                                    <td className="px-4 py-3 text-right">{resultados.scB.toFixed(4)}</td>
                                    <td className="px-4 py-3 text-right">{resultados.cmB.toFixed(4)}</td>
                                    <td className="px-4 py-3 text-right font-bold text-green-600">{resultados.fCalcB.toFixed(4)}</td>
                                    <td className="px-4 py-3 text-right text-gray-500">{resultados.fCrit05B.toFixed(4)}</td>
                                    <td className="px-4 py-3 text-right text-gray-500">{resultados.fCrit01B.toFixed(4)}</td>
                                </tr>
                                <tr className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium">Interacción A×B</td>
                                    <td className="px-4 py-3 text-right">{resultados.glAB}</td>
                                    <td className="px-4 py-3 text-right">{resultados.scAB.toFixed(4)}</td>
                                    <td className="px-4 py-3 text-right">{resultados.cmAB.toFixed(4)}</td>
                                    <td className="px-4 py-3 text-right font-bold text-orange-600">{resultados.fCalcAB.toFixed(4)}</td>
                                    <td className="px-4 py-3 text-right text-gray-500">{resultados.fCrit05AB.toFixed(4)}</td>
                                    <td className="px-4 py-3 text-right text-gray-500">{resultados.fCrit01AB.toFixed(4)}</td>
                                </tr>
                                <tr className="border-b hover:bg-gray-50 text-gray-600">
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

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3 bg-purple-50 border-l-4 border-purple-500 rounded-r-lg">
                            <p className="text-sm text-purple-900"><b>Bloques:</b> {resultados.conclusionBloques}</p>
                        </div>
                        <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                            <p className="text-sm text-blue-900"><b>Factor A:</b> {resultados.conclusionA}</p>
                        </div>
                        <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                            <p className="text-sm text-green-900"><b>Factor B:</b> {resultados.conclusionB}</p>
                        </div>
                        <div className="p-3 bg-orange-50 border-l-4 border-orange-500 rounded-r-lg">
                            <p className="text-sm text-orange-900"><b>Interacción A×B:</b> {resultados.conclusionAB}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}