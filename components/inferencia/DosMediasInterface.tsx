'use client';

import { useState } from 'react';
import MethodCard from '../MethodCard';
import { useToast } from '../../hooks/useToast';
import Toast from '../Toast';
import { ciDosMedias, ciDosMediasVarianzasIguales, ciMediasPareadas, t0DosGruposVarianzasDiferentes, t0DosGruposVarianzasIguales, t0UnaMedia } from '../../utils/inferenciaCalculator';
import { calcularEstadisticasBasicas } from '../../utils/estadisticaCalculator';
import { parseEstadisticaFile } from '../../utils/fileParser';

interface StatsDosMedias {
    n1: number; m1: number; s1: number;
    n2: number; m2: number; s2: number;
    pareadasValidas: boolean;
    md?: number; sd?: number; 
}

export default function DosMediasInterface() {
    const { toast, showToast, hideToast } = useToast();
    
    // tabs
    const [activeTab, setActiveTab] = useState<'crudos' | 'calculados'>('crudos');
    
    const [method, setMethod] = useState<'manual' | 'excel' | null>(null);
    const [n1Manual, setN1Manual] = useState('');
    const [n2Manual, setN2Manual] = useState('');
    const [tableData1, setTableData1] = useState<{ id: string, valor: string }[]>([]);
    const [tableData2, setTableData2] = useState<{ id: string, valor: string }[]>([]);
    const [isTableGenerated, setIsTableGenerated] = useState(false);
    
    const [parsedDict, setParsedDict] = useState<Record<string, number[]> | null>(null);
    const [col1Name, setCol1Name] = useState<string>('');
    const [col2Name, setCol2Name] = useState<string>('');

    const [calc, setCalc] = useState({ n1: '', m1: '', s1: '', n2: '', m2: '', s2: '' });

    const [stats, setStats] = useState<StatsDosMedias | null>(null);

    const [confianza, setConfianza] = useState('0.95');
    const [escenario, setEscenario] = useState<'indep_dif' | 'indep_ig' | 'pareadas'>('indep_dif');
    const [valorSupuesto, setValorSupuesto] = useState('0');
    const [tipoPrueba, setTipoPrueba] = useState<'diferente' | 'menor' | 'mayor'>('diferente');

    const handleGenerateTable = () => {
        const num1 = parseInt(n1Manual);
        const num2 = parseInt(n2Manual);
        if (isNaN(num1) || num1 < 2 || isNaN(num2) || num2 < 2) {
            showToast("Ambas muestras deben tener al menos 2 datos (N ≥ 2).", "error");
            return;
        }
        setTableData1(Array.from({ length: num1 }, (_, i) => ({ id: `g1-${i}`, valor: '' })));
        setTableData2(Array.from({ length: num2 }, (_, i) => ({ id: `g2-${i}`, valor: '' })));
        setIsTableGenerated(true);
        setStats(null);
    };

    const cargarDesdeCrudosManual = () => {
        if (tableData1.some(r => r.valor.trim() === '') || tableData2.some(r => r.valor.trim() === '')) {
            showToast("Llena todos los campos de ambas tablas.", "error");
            return;
        }
        procesarArreglos(
            tableData1.map(r => parseFloat(r.valor)), 
            tableData2.map(r => parseFloat(r.valor))
        );
    };

    const cargarDesdeExcel = () => {
        if (!parsedDict || !col1Name || !col2Name) {
            showToast("Selecciona las columnas para ambos grupos.", "error");
            return;
        }
        procesarArreglos(parsedDict[col1Name], parsedDict[col2Name]);
    };

    const procesarArreglos = (arr1: number[], arr2: number[]) => {
        try {
            const st1 = calcularEstadisticasBasicas(arr1);
            const st2 = calcularEstadisticasBasicas(arr2);
            
            let pareadasValidas = false;
            let md = 0, sd = 0;

            if (st1.n === st2.n) {
                pareadasValidas = true;
                const diferencias = arr1.map((val, idx) => val - arr2[idx]);
                const stDiff = calcularEstadisticasBasicas(diferencias);
                md = stDiff.media;
                sd = stDiff.desviacionEstandarMuestral;
            }

            setStats({
                n1: st1.n, m1: st1.media, s1: st1.desviacionEstandarMuestral,
                n2: st2.n, m2: st2.media, s2: st2.desviacionEstandarMuestral,
                pareadasValidas, md, sd
            });
            showToast("Datos analizados. Revisa el panel inferior.", "success");
        } catch (error: any) {
            showToast(error.message, "error");
        }
    };

    const cargarDesdeResumen = () => {
        const n1 = parseInt(calc.n1), m1 = parseFloat(calc.m1), s1 = parseFloat(calc.s1);
        const n2 = parseInt(calc.n2), m2 = parseFloat(calc.m2), s2 = parseFloat(calc.s2);

        if ([n1, m1, s1, n2, m2, s2].some(isNaN) || n1 < 2 || n2 < 2) {
            showToast("Verifica que todos los campos sean números válidos (N ≥ 2).", "error");
            return;
        }
        
        setStats({ n1, m1, s1, n2, m2, s2, pareadasValidas: false });
        if (escenario === 'pareadas') setEscenario('indep_dif'); 
        showToast("Datos cargados. Revisa el panel inferior.", "success");
    };

    let intervalo: [number, number] | null = null;
    let t0: number | null = null;
    let valorCritico = 0;
    let conclusion = "";

    if (stats) {
        const is95 = confianza === '0.95';
        const zt = is95 ? 1.96 : 2.576; 
        const mu0 = parseFloat(valorSupuesto) || 0;
        const v1 = Math.pow(stats.s1, 2);
        const v2 = Math.pow(stats.s2, 2);

        if (escenario === 'indep_dif') {
            intervalo = ciDosMedias(stats.m1, stats.m2, zt, v1, v2, stats.n1, stats.n2);
            t0 = t0DosGruposVarianzasDiferentes(stats.m1, stats.m2, mu0, v1, v2, stats.n1, stats.n2);
        } 
        else if (escenario === 'indep_ig') {
            const sp2 = ((stats.n1 - 1) * v1 + (stats.n2 - 1) * v2) / (stats.n1 + stats.n2 - 2);
            const sp = Math.sqrt(sp2);
            intervalo = ciDosMediasVarianzasIguales(stats.m1, stats.m2, zt, sp2, stats.n1, stats.n2);
            t0 = t0DosGruposVarianzasIguales(stats.m1, stats.m2, mu0, sp, stats.n1, stats.n2);
        } 
        else if (escenario === 'pareadas' && stats.pareadasValidas) {
            intervalo = ciMediasPareadas(stats.md!, zt, stats.sd!, stats.n1);
            t0 = t0UnaMedia(stats.md!, mu0, Math.pow(stats.sd!, 2), stats.n1);
        }

        if (t0 !== null) {
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
                        <MethodCard icon="⌨️" label="Introducir datos (Manual)" isActive={method === 'manual'} onClick={() => { setMethod('manual'); setParsedDict(null); }} />
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
                                        setParsedDict(dict);
                                        const keys = Object.keys(dict);
                                        setCol1Name(keys[0]);
                                        setCol2Name(keys[1] || keys[0]);
                                        showToast("Excel procesado. Selecciona las columnas.", "success");
                                    } catch (error: any) { showToast(error.message, "error"); }
                                }}
                                className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                            />
                            {parsedDict && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Columna Grupo 1:</label>
                                        <select value={col1Name} onChange={e=>setCol1Name(e.target.value)} className="w-full p-2 border rounded">
                                            {Object.keys(parsedDict).map(k => <option key={k} value={k}>{k} (N={parsedDict[k].length})</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Columna Grupo 2:</label>
                                        <select value={col2Name} onChange={e=>setCol2Name(e.target.value)} className="w-full p-2 border rounded">
                                            {Object.keys(parsedDict).map(k => <option key={k} value={k}>{k} (N={parsedDict[k].length})</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-1 sm:col-span-2 flex justify-end">
                                        <button onClick={cargarDesdeExcel} className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700">Fijar Columnas y Analizar</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {method === 'manual' && !isTableGenerated && (
                        <div className="p-5 bg-gray-50 rounded-lg flex flex-col sm:flex-row items-end space-y-4 sm:space-y-0 sm:space-x-4">
                            <div className="flex-1"><label className="block mb-1 text-sm">Tamaño Grupo 1 (n1)</label><input type="number" value={n1Manual} onChange={e=>setN1Manual(e.target.value)} className="w-full p-2 border rounded" min={2} /></div>
                            <div className="flex-1"><label className="block mb-1 text-sm">Tamaño Grupo 2 (n2)</label><input type="number" value={n2Manual} onChange={e=>setN2Manual(e.target.value)} className="w-full p-2 border rounded" min={2} /></div>
                            <button onClick={handleGenerateTable} className="w-full sm:w-auto bg-blue-600 text-white px-5 py-2 rounded">Generar Tablas</button>
                        </div>
                    )}

                    {method === 'manual' && isTableGenerated && (
                        <div className="space-y-4 border-t pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="max-h-48 overflow-y-auto border rounded-lg">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-100 sticky top-0"><tr><th className="px-4 py-2">Grupo 1</th></tr></thead>
                                        <tbody>
                                            {tableData1.map((row) => (
                                                <tr key={row.id} className="border-b"><td className="p-1"><input type="number" value={row.valor} onChange={(e) => setTableData1(prev => prev.map(r => r.id === row.id ? { ...r, valor: e.target.value } : r))} className="w-full p-2 border rounded" placeholder="0.0" /></td></tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="max-h-48 overflow-y-auto border rounded-lg">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-100 sticky top-0"><tr><th className="px-4 py-2">Grupo 2</th></tr></thead>
                                        <tbody>
                                            {tableData2.map((row) => (
                                                <tr key={row.id} className="border-b"><td className="p-1"><input type="number" value={row.valor} onChange={(e) => setTableData2(prev => prev.map(r => r.id === row.id ? { ...r, valor: e.target.value } : r))} className="w-full p-2 border rounded" placeholder="0.0" /></td></tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="flex justify-end"><button onClick={cargarDesdeCrudosManual} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Analizar Datos</button></div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'calculados' && (
                <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <h4 className="font-bold text-gray-700 border-b pb-2">Muestra 1</h4>
                            <div><label className="block text-xs font-medium text-gray-500 uppercase">Muestra (n1)</label><input type="number" value={calc.n1} onChange={e=>setCalc(prev=>({...prev, n1: e.target.value}))} className="w-full p-2 border rounded mt-1" /></div>
                            <div><label className="block text-xs font-medium text-gray-500 uppercase">Media (x̄1)</label><input type="number" value={calc.m1} onChange={e=>setCalc(prev=>({...prev, m1: e.target.value}))} className="w-full p-2 border rounded mt-1" /></div>
                            <div><label className="block text-xs font-medium text-gray-500 uppercase">Desv. Est. (S1)</label><input type="number" value={calc.s1} onChange={e=>setCalc(prev=>({...prev, s1: e.target.value}))} className="w-full p-2 border rounded mt-1" /></div>
                        </div>
                        <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <h4 className="font-bold text-gray-700 border-b pb-2">Muestra 2</h4>
                            <div><label className="block text-xs font-medium text-gray-500 uppercase">Muestra (n2)</label><input type="number" value={calc.n2} onChange={e=>setCalc(prev=>({...prev, n2: e.target.value}))} className="w-full p-2 border rounded mt-1" /></div>
                            <div><label className="block text-xs font-medium text-gray-500 uppercase">Media (x̄2)</label><input type="number" value={calc.m2} onChange={e=>setCalc(prev=>({...prev, m2: e.target.value}))} className="w-full p-2 border rounded mt-1" /></div>
                            <div><label className="block text-xs font-medium text-gray-500 uppercase">Desv. Est. (S2)</label><input type="number" value={calc.s2} onChange={e=>setCalc(prev=>({...prev, s2: e.target.value}))} className="w-full p-2 border rounded mt-1" /></div>
                        </div>
                    </div>
                    
                    <div className="bg-blue-50 text-blue-800 p-3 rounded text-sm mb-4">
                        <strong>Nota:</strong> Para cálculos de <em>Muestras Pareadas</em>, utiliza la opción de "Datos Crudos" ya que se requiere calcular la media y desviación de las diferencias punto a punto.
                    </div>

                    <div className="flex justify-end"><button onClick={cargarDesdeResumen} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium">Fijar Datos Muestrales</button></div>
                </div>
            )}

            {stats && (
                <div className="mt-8 space-y-6 fade-in">
                    
                    <div className="bg-white border border-gray-300 p-5 rounded-lg shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="font-bold text-gray-800">Escenario Estadístico</h3>
                                <p className="text-xs text-gray-500">Selecciona el tipo de muestras a analizar.</p>
                            </div>
                            <div className="w-full md:w-2/3">
                                <select 
                                    value={escenario} 
                                    onChange={e => setEscenario(e.target.value as any)} 
                                    className="w-full p-3 border-2 border-blue-200 rounded-lg bg-blue-50 font-medium text-blue-900 focus:ring-blue-500"
                                >
                                    <option value="indep_dif">Muestras Independientes (Varianzas Diferentes)</option>
                                    <option value="indep_ig">Muestras Independientes (Varianzas Iguales)</option>
                                    {stats.pareadasValidas && <option value="pareadas">Muestras Pareadas (Dependientes)</option>}
                                </select>
                                {!stats.pareadasValidas && activeTab === 'crudos' && (
                                    <p className="text-xs text-red-500 mt-1 mt-1">* Pareadas no disponible (N1 ≠ N2)</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* INTERVALO DE CONFIANZA */}
                        <div className="bg-white border-t-4 border-t-blue-500 rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col h-full">
                            <h4 className="font-bold text-gray-800 mb-4 border-b pb-2">Intervalo de Confianza (µ1 - µ2)</h4>
                            <div className="mb-6 flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nivel de Confianza</label>
                                <select value={confianza} onChange={e => setConfianza(e.target.value)} className="w-full p-2 border rounded bg-gray-50">
                                    <option value="0.95">95% (Z ≈ 1.96)</option>
                                    <option value="0.99">99% (Z ≈ 2.576)</option>
                                </select>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg text-center mt-auto">
                                <p className="text-xs text-blue-800 font-semibold uppercase tracking-wider mb-2">Límites del Intervalo</p>
                                <p className="text-2xl font-bold text-blue-900">
                                    [ {intervalo?.[0].toFixed(4)} , {intervalo?.[1].toFixed(4)} ]
                                </p>
                            </div>
                        </div>

                        {/* PRUEBA DE HIPÓTESIS */}
                        <div className="bg-white border-t-4 border-t-indigo-500 rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col h-full">
                            <h4 className="font-bold text-gray-800 mb-4 border-b pb-2">Prueba de Hipótesis (H0: µ1 - µ2 = µ0)</h4>
                            
                            <div className="grid grid-cols-2 gap-4 mb-6 flex-1">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor Supuesto (µ0)</label>
                                    <input type="number" value={valorSupuesto} onChange={e => setValorSupuesto(e.target.value)} className="w-full p-2 border rounded bg-gray-50" placeholder="0" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Hipótesis Alternativa (H1)</label>
                                    <select value={tipoPrueba} onChange={e => setTipoPrueba(e.target.value as any)} className="w-full p-2 border rounded bg-gray-50 text-xs">
                                        <option value="diferente">Diferente (≠)</option>
                                        <option value="menor">Menor que (&lt;)</option>
                                        <option value="mayor">Mayor que (&gt;)</option>
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
                            ) : null}
                        </div>
                    </div>
                </div>
            )}

            <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={hideToast} />
        </div>
    );
}