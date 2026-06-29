'use client';

import { useState } from 'react';
import MethodCard from '../MethodCard';
import { useToast } from '../../hooks/useToast';
import Toast from '../Toast';
import { ciUnaMedia, t0UnaMedia } from '../../utils/inferenciaCalculator';
import { calcularEstadisticasBasicas } from '../../utils/estadisticaCalculator';
import { parseEstadisticaFile } from '../../utils/fileParser';

export default function UnaMediaInterface() {
    const { toast, showToast, hideToast } = useToast();
    
    const [activeTab, setActiveTab] = useState<'crudos' | 'calculados'>('crudos');
    
    const [method, setMethod] = useState<'manual' | 'excel' | null>(null);
    const [nManual, setNManual] = useState('');
    const [tableData, setTableData] = useState<{ id: string, valor: string }[]>([]);
    const [isTableGenerated, setIsTableGenerated] = useState(false);
    
    const [nCalc, setNCalc] = useState('');
    const [mediaCalc, setMediaCalc] = useState('');
    const [desviacionCalc, setDesviacionCalc] = useState('');

    const [stats, setStats] = useState<{ media: number, desviacion: number, n: number } | null>(null);

    const [confianza, setConfianza] = useState('0.95');
    const [valorSupuesto, setValorSupuesto] = useState('');
    const [tipoPrueba, setTipoPrueba] = useState<'diferente' | 'menor' | 'mayor'>('diferente');

    const handleGenerateTable = () => {
        const n = parseInt(nManual);
        if (isNaN(n) || n < 2) {
            showToast("El tamaño de muestra (n) debe ser al menos 2.", "error");
            return;
        }
        setTableData(Array.from({ length: n }, (_, i) => ({ id: `row-${i}`, valor: '' })));
        setIsTableGenerated(true);
        setStats(null);
    };

    const cargarDesdeCrudos = () => {
        try {
            if (tableData.some(row => row.valor.trim() === '')) {
                showToast("Llena todos los campos de la tabla.", "error");
                return;
            }
            const numeros = tableData.map(r => parseFloat(r.valor));
            const estadisticas = calcularEstadisticasBasicas(numeros);
            
            setStats({ media: estadisticas.media, desviacion: estadisticas.desviacionEstandarMuestral, n: estadisticas.n });
            showToast("Datos analizados. Revisa los resultados abajo.", "success");
        } catch (error: any) {
            showToast(error.message || "Error al calcular los datos.", "error");
        }
    };

    const cargarDesdeResumen = () => {
        const n = parseInt(nCalc);
        const media = parseFloat(mediaCalc);
        const s = parseFloat(desviacionCalc);

        if (isNaN(n) || isNaN(media) || isNaN(s) || n < 2) {
            showToast("Verifica que N, la Media y la Desviación sean válidos (N ≥ 2).", "error");
            return;
        }
        setStats({ media, desviacion: s, n });
        showToast("Datos cargados. Revisa los resultados abajo.", "success");
    };

    let intervalo: [number, number] | null = null;
    let t0: number | null = null;
    let valorCritico = 0;
    let conclusion = "";

    if (stats) {
        const is95 = confianza === '0.95';
        const zt = is95 ? 1.96 : 2.576; 
        intervalo = ciUnaMedia(stats.media, zt, stats.desviacion, stats.n);

        const mu0 = parseFloat(valorSupuesto);
        if (!isNaN(mu0)) {
            t0 = t0UnaMedia(stats.media, mu0, Math.pow(stats.desviacion, 2), stats.n);
            
            if (tipoPrueba === 'diferente') {
                valorCritico = is95 ? 1.96 : 2.576;
                conclusion = Math.abs(t0) > valorCritico ? "Se rechaza H0" : "No se rechaza H0";
            } else if (tipoPrueba === 'menor') {
                valorCritico = is95 ? -1.645 : -2.326;
                conclusion = t0 < valorCritico ? "Se rechaza H0" : "No se rechaza H0";
            } else {
                valorCritico = is95 ? 1.645 : 2.326;
                conclusion = t0 > valorCritico ? "Se rechaza H0" : "No se rechaza H0";
            }
        }
    }

    return (
        <div className="space-y-6 fade-in">
            <div className="flex bg-gray-100 p-1 rounded-lg w-full max-w-md mx-auto">
                <button 
                    onClick={() => { setActiveTab('crudos'); setStats(null); }}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'crudos' ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    📝 Datos Crudos
                </button>
                <button 
                    onClick={() => { setActiveTab('calculados'); setStats(null); }}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'calculados' ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    🧮 Datos Calculados
                </button>
            </div>

            {activeTab === 'crudos' && (
                <div className="space-y-4 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <MethodCard icon="📁" label="Cargar datos (Excel)" isActive={method === 'excel'} onClick={() => { setMethod('excel'); setIsTableGenerated(false); }} />
                        <MethodCard icon="⌨️" label="Introducir datos (Manual)" isActive={method === 'manual'} onClick={() => { setMethod('manual'); setIsTableGenerated(false); }} />
                    </div>

                    {method === 'excel' && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <input
                                type="file" accept=".csv,.xlsx,.xls" onClick={(e) => (e.currentTarget.value = '')}
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    try {
                                        const dict = await parseEstadisticaFile(file);
                                        const primeraVar = Object.keys(dict)[0];
                                        setTableData(dict[primeraVar].map((v, i) => ({ id: `r-${i}`, valor: String(v) })));
                                        setIsTableGenerated(true);
                                        setMethod('manual');
                                        showToast(`Datos cargados de "${primeraVar}".`, "success");
                                    } catch (error: any) { showToast(error.message, "error"); }
                                }}
                                className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700"
                            />
                        </div>
                    )}

                    {method === 'manual' && !isTableGenerated && (
                        <div className="flex items-end space-x-4">
                            <div className="flex-1"><label className="block mb-1 text-sm">Tamaño de muestra (n)</label><input type="number" value={nManual} onChange={e => setNManual(e.target.value)} className="w-full p-2 border rounded" min={2} /></div>
                            <button onClick={handleGenerateTable} className="bg-blue-600 text-white px-5 py-2 rounded">Generar</button>
                        </div>
                    )}

                    {method === 'manual' && isTableGenerated && (
                        <div className="space-y-4 border-t pt-4">
                            <div className="max-h-48 overflow-y-auto border rounded-lg">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-100 sticky top-0"><tr><th className="px-6 py-2">Dato (x)</th></tr></thead>
                                    <tbody>
                                        {tableData.map((row) => (
                                            <tr key={row.id} className="border-b"><td className="px-6 py-1"><input type="number" value={row.valor} onChange={(e) => setTableData(prev => prev.map(r => r.id === row.id ? { ...r, valor: e.target.value } : r))} className="w-full p-2 border rounded" placeholder="0.0" /></td></tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex justify-end"><button onClick={cargarDesdeCrudos} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium">Fijar Datos Muestrales</button></div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'calculados' && (
                <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4">Ingresar Estadísticos</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-4">
                        <div><label className="block text-sm text-gray-600 mb-1">Muestra (n)</label><input type="number" value={nCalc} onChange={e => setNCalc(e.target.value)} className="w-full p-2 border rounded" /></div>
                        <div><label className="block text-sm text-gray-600 mb-1">Media (x̄)</label><input type="number" value={mediaCalc} onChange={e => setMediaCalc(e.target.value)} className="w-full p-2 border rounded" /></div>
                        <div><label className="block text-sm text-gray-600 mb-1">Desviación Est. (S)</label><input type="number" value={desviacionCalc} onChange={e => setDesviacionCalc(e.target.value)} className="w-full p-2 border rounded" /></div>
                    </div>
                    <div className="flex justify-end"><button onClick={cargarDesdeResumen} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium">Fijar Datos Muestrales</button></div>
                </div>
            )}

            {stats && (
                <div className="mt-8 space-y-6 fade-in">
                    <div className="flex items-center space-x-2">
                        <span className="text-xl">📊</span><h3 className="text-xl font-bold text-gray-800">Panel de Análisis</h3>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white border-t-4 border-t-blue-500 rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col h-full">
                            <h4 className="font-bold text-gray-800 mb-4 border-b pb-2">Intervalo de Confianza</h4>
                            <div className="mb-6 flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nivel de Confianza</label>
                                <select value={confianza} onChange={e => setConfianza(e.target.value)} className="w-full p-2 border rounded bg-gray-50">
                                    <option value="0.95">95% (Z = 1.96)</option>
                                    <option value="0.99">99% (Z = 2.576)</option>
                                </select>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg text-center mt-auto">
                                <p className="text-xs text-blue-800 font-semibold uppercase tracking-wider mb-2">Límites del Intervalo (µ)</p>
                                <p className="text-2xl font-bold text-blue-900">
                                    [ {intervalo?.[0].toFixed(4)} , {intervalo?.[1].toFixed(4)} ]
                                </p>
                            </div>
                        </div>

                        <div className="bg-white border-t-4 border-t-indigo-500 rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col h-full">
                            <h4 className="font-bold text-gray-800 mb-4 border-b pb-2">Prueba de Hipótesis</h4>
                            
                            <div className="grid grid-cols-2 gap-4 mb-6 flex-1">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor Supuesto (µ0)</label>
                                    <input type="number" value={valorSupuesto} onChange={e => setValorSupuesto(e.target.value)} className="w-full p-2 border rounded bg-gray-50" placeholder="Ej. 100" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Hipótesis Alternativa (H1)</label>
                                    <select value={tipoPrueba} onChange={e => setTipoPrueba(e.target.value as any)} className="w-full p-2 border rounded bg-gray-50">
                                        <option value="diferente">µ ≠ µ0 (Dos colas)</option>
                                        <option value="menor">µ &lt; µ0 (Cola izquierda)</option>
                                        <option value="mayor">µ &gt; µ0 (Cola derecha)</option>
                                    </select>
                                </div>
                            </div>

                            {t0 !== null ? (
                                <div className={`p-4 rounded-lg text-center mt-auto ${conclusion.includes('No se rechaza') ? 'bg-gray-100 text-gray-800' : 'bg-red-50 text-red-800'}`}>
                                    <div className="flex justify-between text-sm mb-2 opacity-80 border-b pb-2">
                                        <span>Estadístico (Z0): <b>{t0.toFixed(4)}</b></span>
                                        <span>Z Crítico: <b>{valorCritico}</b></span>
                                    </div>
                                    <p className="text-lg font-bold uppercase mt-2">{conclusion}</p>
                                </div>
                            ) : (
                                <div className="bg-gray-50 p-4 rounded-lg text-center mt-auto text-gray-400 border border-dashed">
                                    <p className="text-sm">Ingresa un Valor Supuesto (µ0) para evaluar la hipótesis.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={hideToast} />
        </div>
    );
}