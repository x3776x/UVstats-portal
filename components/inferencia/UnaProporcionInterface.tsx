'use client';

import { useState } from 'react';
import MethodCard from '../MethodCard';
import { useToast } from '../../hooks/useToast';
import Toast from '../Toast';
import { ciUnaProporcion } from '../../utils/inferenciaCalculator';
import { parseEstadisticaFile } from '../../utils/fileParser';

export default function UnaProporcionInterface() {
    const { toast, showToast, hideToast } = useToast();
    
    // tabs
    const [activeTab, setActiveTab] = useState<'crudos' | 'calculados'>('crudos');
    
    const [method, setMethod] = useState<'manual' | 'excel' | null>(null);
    const [nManual, setNManual] = useState('');
    const [tableData, setTableData] = useState<{ id: string, valor: string }[]>([]);
    const [isTableGenerated, setIsTableGenerated] = useState(false);
    
    const [valoresUnicos, setValoresUnicos] = useState<string[]>([]);
    const [valorExito, setValorExito] = useState<string>('');

    const [calcN, setCalcN] = useState('');
    const [calcX, setCalcX] = useState('');

    const [stats, setStats] = useState<{ n: number, x: number, p: number, q: number } | null>(null);

    const [confianza, setConfianza] = useState('0.95');
    const [valorSupuesto, setValorSupuesto] = useState('');
    const [tipoPrueba, setTipoPrueba] = useState<'diferente' | 'menor' | 'mayor'>('diferente');

    const handleGenerateTable = () => {
        const n = parseInt(nManual);
        if (isNaN(n) || n < 2) {
            showToast("La muestra (n) debe ser al menos 2.", "error");
            return;
        }
        setTableData(Array.from({ length: n }, (_, i) => ({ id: `row-${i}`, valor: '' })));
        setIsTableGenerated(true);
        setValoresUnicos([]);
        setStats(null);
    };

    const identificarValoresUnicos = (datos: string[]) => {
        const unicos = Array.from(new Set(datos.filter(d => d.trim() !== '')));
        setValoresUnicos(unicos);
        if (unicos.length > 0) setValorExito(unicos[0]);
    };

    const cargarDesdeCrudos = () => {
        if (tableData.some(r => r.valor.trim() === '')) {
            showToast("Llena todos los campos de la tabla.", "error");
            return;
        }
        if (!valorExito) {
            showToast("Selecciona cuál valor representa el 'Éxito'.", "error");
            return;
        }

        const n = tableData.length;
        const x = tableData.filter(r => r.valor.trim() === valorExito).length;
        const p = x / n;
        
        setStats({ n, x, p, q: 1 - p });
        showToast("Datos analizados exitosamente.", "success");
    };

    const cargarDesdeResumen = () => {
        const n = parseInt(calcN);
        const x = parseInt(calcX);

        if (isNaN(n) || isNaN(x) || n < 2 || x < 0 || x > n) {
            showToast("Verifica que N y X sean válidos (N ≥ 2 y X no puede ser mayor que N).", "error");
            return;
        }
        
        const p = x / n;
        setStats({ n, x, p, q: 1 - p });
        showToast("Datos muestrales fijados.", "success");
    };

    let intervalo: [number, number] | null = null;
    let z0: number | null = null;
    let valorCritico = 0;
    let conclusion = "";

    if (stats) {
        const is95 = confianza === '0.95';
        const zt = is95 ? 1.96 : 2.576; 
        intervalo = ciUnaProporcion(stats.p, stats.q, stats.n, zt);

        const p0 = parseFloat(valorSupuesto);
        if (!isNaN(p0) && p0 > 0 && p0 < 1) {
            const errorEstandarP0 = Math.sqrt((p0 * (1 - p0)) / stats.n);
            z0 = (stats.p - p0) / errorEstandarP0;
            
            if (tipoPrueba === 'diferente') {
                valorCritico = is95 ? 1.96 : 2.576;
                conclusion = Math.abs(z0) > valorCritico ? "Se rechaza H0" : "No se rechaza H0";
            } else if (tipoPrueba === 'menor') {
                valorCritico = is95 ? -1.645 : -2.326;
                conclusion = z0 < valorCritico ? "Se rechaza H0" : "No se rechaza H0";
            } else {
                valorCritico = is95 ? 1.645 : 2.326;
                conclusion = z0 > valorCritico ? "Se rechaza H0" : "No se rechaza H0";
            }
        }
    }

    return (
        <div className="space-y-6 fade-in">
            <div className="flex bg-gray-100 p-1 rounded-lg w-full max-w-md mx-auto">
                <button 
                    onClick={() => { setActiveTab('crudos'); setStats(null); }}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'crudos' ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
                >📝 Datos Crudos</button>
                <button 
                    onClick={() => { setActiveTab('calculados'); setStats(null); }}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'calculados' ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
                >🧮 Datos Calculados</button>
            </div>

            {activeTab === 'crudos' && (
                <div className="space-y-4 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <MethodCard icon="📁" label="Cargar datos (Excel)" isActive={method === 'excel'} onClick={() => { setMethod('excel'); setIsTableGenerated(false); }} />
                        <MethodCard icon="⌨️" label="Introducir datos (Manual)" isActive={method === 'manual'} onClick={() => { setMethod('manual'); setValoresUnicos([]); }} />
                    </div>

                    {method === 'excel' && (
                        <div className="p-5 bg-gray-50 rounded-lg space-y-4 border border-gray-200">
                            <input
                                type="file" accept=".csv,.xlsx,.xls" onClick={(e) => (e.currentTarget.value = '')}
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    try {
                                        const dict = await parseEstadisticaFile(file);
                                        const primeraVar = Object.keys(dict)[0];
                                        const datos = dict[primeraVar].map(String);
                                        setTableData(datos.map((v, i) => ({ id: `r-${i}`, valor: v })));
                                        identificarValoresUnicos(datos);
                                        setIsTableGenerated(true);
                                        setMethod('manual');
                                        showToast(`Se cargaron ${datos.length} datos de "${primeraVar}".`, "success");
                                    } catch (error: any) { showToast(error.message, "error"); }
                                }}
                                className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                            />
                            <p className="text-xs text-gray-500">Nota: El archivo debe contener una columna (ej. 1 para éxito, 0 para fracaso).</p>
                        </div>
                    )}

                    {method === 'manual' && !isTableGenerated && (
                        <div className="flex items-end space-x-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex-1"><label className="block mb-1 text-sm">Tamaño de muestra (n)</label><input type="number" value={nManual} onChange={e => setNManual(e.target.value)} className="w-full p-2 border rounded" min={2} /></div>
                            <button onClick={handleGenerateTable} className="bg-blue-600 text-white px-5 py-2 rounded">Generar</button>
                        </div>
                    )}

                    {method === 'manual' && isTableGenerated && (
                        <div className="space-y-4 border-t pt-4">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                                <button onClick={() => identificarValoresUnicos(tableData.map(r => r.valor))} className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded transition-colors">
                                    🔍 Escanear Valores Únicos
                                </button>
                                
                                {valoresUnicos.length > 0 && (
                                    <div className="flex-1 bg-blue-50 p-3 rounded border border-blue-100 flex items-center space-x-3">
                                        <label className="text-sm font-bold text-blue-900">¿Qué valor representa el "Éxito"?</label>
                                        <select value={valorExito} onChange={e => setValorExito(e.target.value)} className="p-1 border rounded bg-white text-sm flex-1">
                                            {valoresUnicos.map(v => <option key={v} value={v}>{v}</option>)}
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="max-h-48 overflow-y-auto border rounded-lg">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-100 sticky top-0"><tr><th className="px-6 py-2">Categoría / Dato</th></tr></thead>
                                    <tbody>
                                        {tableData.map((row) => (
                                            <tr key={row.id} className="border-b">
                                                <td className="px-6 py-1">
                                                    <input type="text" value={row.valor} onChange={(e) => setTableData(prev => prev.map(r => r.id === row.id ? { ...r, valor: e.target.value } : r))} className="w-full p-2 border rounded" placeholder="Ej. 1 o 0" />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex justify-end"><button onClick={cargarDesdeCrudos} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Analizar Proporción</button></div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'calculados' && (
                <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4">
                    <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Ingresar Frecuencias</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Tamaño de la Muestra (n)</label>
                            <input type="number" value={calcN} onChange={e => setCalcN(e.target.value)} className="w-full p-2 border rounded bg-gray-50" placeholder="Ej. 100" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Número de Éxitos (x)</label>
                            <input type="number" value={calcX} onChange={e => setCalcX(e.target.value)} className="w-full p-2 border rounded bg-gray-50" placeholder="Ej. 45" />
                        </div>
                    </div>
                    <div className="flex justify-end pt-4"><button onClick={cargarDesdeResumen} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium">Fijar Datos Muestrales</button></div>
                </div>
            )}

            {stats && (
                <div className="mt-8 space-y-6 fade-in">
                    <div className="flex items-center space-x-2">
                        <span className="text-xl">📊</span><h3 className="text-xl font-bold text-gray-800">Panel de Análisis</h3>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-around text-center">
                        <div><p className="text-xs text-gray-500 uppercase tracking-widest">Muestra (N)</p><p className="text-xl font-bold">{stats.n}</p></div>
                        <div><p className="text-xs text-gray-500 uppercase tracking-widest">Éxitos (x)</p><p className="text-xl font-bold">{stats.x}</p></div>
                        <div><p className="text-xs text-gray-500 uppercase tracking-widest">Proporción Muestral (p̂)</p><p className="text-xl font-bold text-blue-600">{(stats.p * 100).toFixed(2)}%</p></div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* INTERVALO DE CONFIANZA */}
                        <div className="bg-white border-t-4 border-t-blue-500 rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col h-full">
                            <h4 className="font-bold text-gray-800 mb-4 border-b pb-2">Intervalo de Confianza</h4>
                            <div className="mb-6 flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nivel de Confianza</label>
                                <select value={confianza} onChange={e => setConfianza(e.target.value)} className="w-full p-2 border rounded bg-gray-50">
                                    <option value="0.95">95% (Z ≈ 1.96)</option>
                                    <option value="0.99">99% (Z ≈ 2.576)</option>
                                </select>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg text-center mt-auto">
                                <p className="text-xs text-blue-800 font-semibold uppercase tracking-wider mb-2">Límites de la Proporción Verdadera (p)</p>
                                <p className="text-2xl font-bold text-blue-900">
                                    [ {(intervalo?.[0]! * 100).toFixed(2)}% , {(intervalo?.[1]! * 100).toFixed(2)}% ]
                                </p>
                            </div>
                        </div>

                        {/* PRUEBA DE HIPÓTESIS */}
                        <div className="bg-white border-t-4 border-t-indigo-500 rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col h-full">
                            <h4 className="font-bold text-gray-800 mb-4 border-b pb-2">Prueba de Hipótesis (H0: p = p0)</h4>
                            
                            <div className="grid grid-cols-2 gap-4 mb-6 flex-1">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Proporción Supuesta (p0)</label>
                                    <input type="number" value={valorSupuesto} onChange={e => setValorSupuesto(e.target.value)} className="w-full p-2 border rounded bg-gray-50" placeholder="Ej. 0.5" min={0} max={1} step={0.01} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Hipótesis Alternativa</label>
                                    <select value={tipoPrueba} onChange={e => setTipoPrueba(e.target.value as any)} className="w-full p-2 border rounded bg-gray-50 text-xs">
                                        <option value="diferente">Diferente (≠)</option>
                                        <option value="menor">Menor que (&lt;)</option>
                                        <option value="mayor">Mayor que (&gt;)</option>
                                    </select>
                                </div>
                            </div>

                            {z0 !== null ? (
                                <div className={`p-4 rounded-lg text-center mt-auto ${conclusion.includes('No se rechaza') ? 'bg-gray-100 text-gray-800' : 'bg-red-50 text-red-800'}`}>
                                    <div className="flex justify-between text-sm mb-2 opacity-80 border-b pb-2">
                                        <span>Estadístico (Z0): <b>{z0.toFixed(4)}</b></span>
                                        <span>Z Crítico: <b>{valorCritico}</b></span>
                                    </div>
                                    <p className="text-lg font-bold uppercase mt-2">{conclusion}</p>
                                </div>
                            ) : (
                                <div className="bg-gray-50 p-4 rounded-lg text-center mt-auto text-gray-400 border border-dashed">
                                    <p className="text-sm">Ingresa una Proporción Supuesta (p0) entre 0 y 1 para evaluar.</p>
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