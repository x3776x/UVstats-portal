'use client';

import { useState } from "react";
import MethodCard from '../MethodCard';
import { useToast } from "@/hooks/useToast";
import Toast from "../Toast";
import { ciUnaMedia } from "@/utils/inferenciaCalculator";
import { calcularEstadisticasBasicas } from "@/utils/estadisticaCalculator";
import { parseEstadisticaFile } from "@/utils/fileParser";

export default function UnaMediaInterface() {
    const { toast, showToast, hideToast } = useToast();
    //tabs
    const [activeTab, setActiveTab] = useState<'Cargar datos' | 'Ingresar datos'>('Cargar datos');

    const [method, setMethod] = useState<'manual' | 'excel' | null>(null);
    const [nManual, setNManual] = useState('');
    const [tableData, setTableData] = useState<{ id: string, valor: string }[]>([]);
    const [isTableGenerated, setIsTableGenerated] = useState(false);

    const [nCalc, setNCalc] = useState('');
    const [mediaCalc, setMediaCalc] = useState('');
    const [desviacionCalc, setDesviacionCalc] = useState('');

    const [confianza, setConfianza] = useState('0.95');
    const [resultados, setResultados] = useState<{ media: number, desviacion: number, n: number, intervalo: [number, number] } | null>(null);

    const handleGenerateTable = () => {
        const n = parseInt(nManual);
        if (isNaN(n) || n < 2) {
            showToast("El tamanio de muestra (n) debe ser al menos 2.", "error");
            return;
        }
        setTableData(Array.from({ length: n }, (_, i) => ({ id: `row-${i}`, valor: ''})));
        setIsTableGenerated(true);
        setResultados(null);
    };

    const calcularDesdeCrudos = () => {
        try {
            if (tableData.some(row => row.valor.trim() === '')) {
                showToast("Por favor llena todos los campos de la tabla.", "error");
                return;
            }
            const numeros = tableData.map(r => parseFloat(r.valor));
            const stats = calcularEstadisticasBasicas(numeros);

            ejecutarInferencia(stats.media, stats.desviacionEstandarMuestral, stats.n);
        } catch (error: any) {
            showToast(error.message || "Error al calcular los datos", "error");
        }
    };

    const calcularDesdeResumen =  () => {
        const n = parseInt(nCalc);
        const media = parseFloat(mediaCalc);
        const s = parseFloat(desviacionCalc);

        if (isNaN(n) || isNaN(media) || isNaN(s) || n < 2) {
            showToast("Verifica que N, la media y la desviacion sean numeros validos.", "error");
            return;
        }
        ejecutarInferencia(media, s, n);
    };

    const ejecutarInferencia = (media: number, s: number, n: number) => {
        const zt = confianza === '0.95' ? 1.96 : 2.576; 
        const intervalo = ciUnaMedia(media, zt, s, n);
        
        setResultados({ media, desviacion: s, n, intervalo });
        showToast("Intervalo de confianza calculado.", "success");
    };

    return (
        <div className="space-y-6 fade-in">
            <div className="flex bg-gray-100 p-1 rounded-lg w-full max-w-md mx-auto">
                <button 
                    onClick={() => { setActiveTab('Cargar datos'); setResultados(null); }}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'Cargar datos' ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    📝 Carga de Datos (Crudos)
                </button>
                <button 
                    onClick={() => { setActiveTab('Ingresar datos'); setResultados(null); }}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'Ingresar datos' ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    🧮 Introducir Datos Calculados
                </button>
            </div>

            {activeTab === 'Cargar datos' && (
                <div className="space-y-6 fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <MethodCard icon="📁" label="Cargar datos (Excel/CSV)" isActive={method === 'excel'} onClick={() => { setMethod('excel'); setIsTableGenerated(false); }} />
                        <MethodCard icon="⌨️" label="Introducir datos (Manual)" isActive={method === 'manual'} onClick={() => { setMethod('manual'); setIsTableGenerated(false); }} />
                    </div>

                    {method === 'excel' && (
                        <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                            <label className="block font-medium text-gray-700 mb-2">Selecciona un archivo Excel/CSV:</label>
                            <input
                                type="file" accept=".csv,.xlsx,.xls" onClick={(e) => (e.currentTarget.value = '')}
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    try {
                                        const extractedDict = await parseEstadisticaFile(file);
                                        const primerVariable = Object.keys(extractedDict)[0]; // Tomamos la primera columna
                                        const valores = extractedDict[primerVariable];
                                        
                                        setTableData(valores.map((v, i) => ({ id: `r-${i}`, valor: String(v) })));
                                        setIsTableGenerated(true);
                                        setMethod('manual');
                                        showToast(`Se cargaron ${valores.length} datos de la columna "${primerVariable}".`, "success");
                                    } catch (error: any) { showToast(error.message, "error"); }
                                }}
                                className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700"
                            />
                        </div>
                    )}

                    {method === 'manual' && !isTableGenerated && (
                        <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 flex items-end space-x-4">
                            <div className="flex-1">
                                <label className="block mb-1 text-sm text-gray-700">Tamaño de muestra (n)</label>
                                <input type="number" value={nManual} onChange={e => setNManual(e.target.value)} className="w-full p-2 border rounded-md" min={2} placeholder="Ej. 15" />
                            </div>
                            <button onClick={handleGenerateTable} className="bg-blue-600 text-white px-5 py-2 rounded-md">Generar</button>
                        </div>
                    )}

                    {method === 'manual' && isTableGenerated && (
                        <div className="p-6 bg-white border rounded-xl shadow-sm space-y-4">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-4">
                                <h3 className="font-bold text-gray-800">Ingresa los Datos (N={tableData.length})</h3>
                                <div className="mt-4 sm:mt-0 flex items-center space-x-2">
                                    <label className="text-sm font-medium text-gray-600">Nivel de Confianza:</label>
                                    <select value={confianza} onChange={e => setConfianza(e.target.value)} className="p-2 border rounded-md text-sm bg-white">
                                        <option value="0.95">95%</option>
                                        <option value="0.99">99%</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="max-h-60 overflow-y-auto border rounded-lg">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-100 sticky top-0"><tr className="border-b"><th className="px-6 py-2">Dato (x)</th></tr></thead>
                                    <tbody>
                                        {tableData.map((row) => (
                                            <tr key={row.id} className="border-b hover:bg-gray-50">
                                                <td className="px-6 py-1">
                                                    <input type="number" value={row.valor} onChange={(e) => setTableData(prev => prev.map(r => r.id === row.id ? { ...r, valor: e.target.value } : r))} className="w-full p-2 border rounded" placeholder="0.0" />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex justify-end pt-2"><button onClick={calcularDesdeCrudos} className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 font-medium">Calcular Intervalo</button></div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'Ingresar datos' && (
                <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm fade-in space-y-6">
                    <h3 className="font-bold text-gray-800 border-b pb-2">Parámetros Estadísticos Muestrales</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Muestra (n)</label>
                            <input type="number" value={nCalc} onChange={e => setNCalc(e.target.value)} className="w-full p-2 border rounded" placeholder="n ≥ 2" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Media (x̄)</label>
                            <input type="number" value={mediaCalc} onChange={e => setMediaCalc(e.target.value)} className="w-full p-2 border rounded" placeholder="0.0" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Desviación Est. (S)</label>
                            <input type="number" value={desviacionCalc} onChange={e => setDesviacionCalc(e.target.value)} className="w-full p-2 border rounded" placeholder="0.0" />
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-3 mb-4 sm:mb-0">
                            <label className="text-sm font-medium text-gray-700">Confianza:</label>
                            <select value={confianza} onChange={e => setConfianza(e.target.value)} className="p-2 border rounded-md font-semibold bg-white text-blue-700">
                                <option value="0.95">95%</option>
                                <option value="0.99">99%</option>
                            </select>
                        </div>
                        <button onClick={calcularDesdeResumen} className="w-full sm:w-auto bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 font-medium">Calcular Intervalo</button>
                    </div>
                </div>
            )}

            {resultados && (
                <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl shadow-sm fade-in">
                    <h4 className="text-sm font-bold text-blue-900 uppercase tracking-widest mb-4">Resultado de Inferencia</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-3 rounded shadow-sm"><p className="text-xs text-gray-500">Muestra (n)</p><p className="font-mono font-bold text-gray-800">{resultados.n}</p></div>
                        <div className="bg-white p-3 rounded shadow-sm"><p className="text-xs text-gray-500">Media (x̄)</p><p className="font-mono font-bold text-gray-800">{resultados.media.toFixed(4)}</p></div>
                        <div className="bg-white p-3 rounded shadow-sm"><p className="text-xs text-gray-500">Desv. Est. (S)</p><p className="font-mono font-bold text-gray-800">{resultados.desviacion.toFixed(4)}</p></div>
                        <div className="bg-white p-3 rounded shadow-sm"><p className="text-xs text-gray-500">Confianza</p><p className="font-mono font-bold text-gray-800">{parseFloat(confianza) * 100}%</p></div>
                    </div>
                    <div className="bg-white border border-blue-200 p-5 rounded-lg text-center shadow-sm">
                        <p className="text-sm text-gray-600 mb-2">Intervalo de Confianza para la Media Poblacional (µ)</p>
                        <p className="text-2xl sm:text-3xl font-bold text-blue-900">
                            [ {resultados.intervalo[0].toFixed(4)} , {resultados.intervalo[1].toFixed(4)} ]
                        </p>
                    </div>
                </div>
            )}

            <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={hideToast} />
        </div>
    );
}