'use client';

import { useState } from 'react';
import MethodCard from '../MethodCard';
import { calcularEstadisticasBasicas, calcularTablaFrecuencias, EstadisticasBasicas, FilaFrecuencia } from '../../utils/estadisticaCalculator';
import { parseEstadisticaFile } from '../../utils/fileParser';
import { useToast } from '../../hooks/useToast';
import Toast from '../Toast';
import { exportarReporteDocx } from '@/utils/exportDocx';

export default function EstadisticaDescriptivaInterface() {
    const { toast, showToast, hideToast } = useToast();
    
    // 1. Datos
    const [dataset, setDataset] = useState<Record<string, number[]>>({});
    const [variablesDisponibles, setVariablesDisponibles] = useState<string[]>([]);
    const [variablesSeleccionadas, setVariablesSeleccionadas] = useState<string[]>([]);
    
    // 2. Configuración de Métricas
    const [config, setConfig] = useState({
        media: true, moda: true, mediana: true,
        desviacion: true, varianza: true, cv: false,
        q1: false, q3: false, iqr: false
    });

    // 3. Resultados
    const [resultadosGenerales, setResultadosGenerales] = useState<Record<string, EstadisticasBasicas> | null>(null);
    const [varFrecuencia, setVarFrecuencia] = useState<string>('');
    const [tablaFrecuencia, setTablaFrecuencia] = useState<FilaFrecuencia[] | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const parsedData = await parseEstadisticaFile(file);
            const headers = Object.keys(parsedData);
            setDataset(parsedData);
            setVariablesDisponibles(headers);
            setVariablesSeleccionadas(headers);
            setResultadosGenerales(null);
            setTablaFrecuencia(null);
            showToast(`Se cargaron ${headers.length} variables numéricas correctamente.`, "success");
        } catch (error: any) {
            showToast(error.message, "error");
        }
    };

    const toggleVariable = (v: string) => {
        setVariablesSeleccionadas(prev => 
            prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]
        );
    };

    const toggleConfig = (key: keyof typeof config) => {
        setConfig(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const calcular = () => {
        if (variablesSeleccionadas.length === 0) {
            showToast("Selecciona al menos una variable para analizar.", "error");
            return;
        }

        const res: Record<string, EstadisticasBasicas> = {};
        variablesSeleccionadas.forEach(v => {
            res[v] = calcularEstadisticasBasicas(dataset[v]);
        });
        
        setResultadosGenerales(res);
        if (!varFrecuencia || !variablesSeleccionadas.includes(varFrecuencia)) {
            generarFrecuencia(variablesSeleccionadas[0], res[variablesSeleccionadas[0]]);
        } else {
            generarFrecuencia(varFrecuencia, res[varFrecuencia]);
        }
        showToast("Análisis descriptivo completado.", "success");
    };

    const generarFrecuencia = (variable: string, stats?: EstadisticasBasicas) => {
        setVarFrecuencia(variable);
        setTablaFrecuencia(calcularTablaFrecuencias(dataset[variable]));
    };

    return (
        <div className="space-y-8 fade-in">
            <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center space-x-3 mb-4">
                    <span className="text-2xl">📂</span>
                    <h2 className="text-lg font-bold text-gray-800">1. Carga de Datos</h2>
                </div>
                <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onClick={(e) => (e.currentTarget.value = '')}
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                />
                <p className="text-xs text-gray-500 mt-2">El Excel debe tener los nombres de las variables en la primera fila (ej. Edad, Salario).</p>
            </div>

            {variablesDisponibles.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-in">
                    {/* Selección de Variables */}
                    <div className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm col-span-1">
                        <h3 className="font-semibold text-gray-800 border-b pb-2 mb-3">Variables a Analizar</h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {variablesDisponibles.map(v => (
                                <label key={v} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                    <input type="checkbox" checked={variablesSeleccionadas.includes(v)} onChange={() => toggleVariable(v)} className="rounded text-blue-600 focus:ring-blue-500" />
                                    <span className="text-sm text-gray-700">{v} <span className="text-xs text-gray-400">({dataset[v].length} datos)</span></span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm col-span-2">
                        <h3 className="font-semibold text-gray-800 border-b pb-2 mb-3">Métricas a Calcular</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Tendencia Central</h4>
                                <label className="flex items-center space-x-2 text-sm"><input type="checkbox" checked={config.media} onChange={() => toggleConfig('media')} /> <span>Media</span></label>
                                <label className="flex items-center space-x-2 text-sm mt-1"><input type="checkbox" checked={config.mediana} onChange={() => toggleConfig('mediana')} /> <span>Mediana (Q2)</span></label>
                                <label className="flex items-center space-x-2 text-sm mt-1"><input type="checkbox" checked={config.moda} onChange={() => toggleConfig('moda')} /> <span>Moda</span></label>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Dispersión</h4>
                                <label className="flex items-center space-x-2 text-sm"><input type="checkbox" checked={config.desviacion} onChange={() => toggleConfig('desviacion')} /> <span>Desviación Estándar</span></label>
                                <label className="flex items-center space-x-2 text-sm mt-1"><input type="checkbox" checked={config.varianza} onChange={() => toggleConfig('varianza')} /> <span>Varianza</span></label>
                                <label className="flex items-center space-x-2 text-sm mt-1"><input type="checkbox" checked={config.cv} onChange={() => toggleConfig('cv')} /> <span>Coef. Variación (%)</span></label>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Posición</h4>
                                <label className="flex items-center space-x-2 text-sm"><input type="checkbox" checked={config.q1} onChange={() => toggleConfig('q1')} /> <span>Cuartil 1 (Q1)</span></label>
                                <label className="flex items-center space-x-2 text-sm mt-1"><input type="checkbox" checked={config.q3} onChange={() => toggleConfig('q3')} /> <span>Cuartil 3 (Q3)</span></label>
                                <label className="flex items-center space-x-2 text-sm mt-1"><input type="checkbox" checked={config.iqr} onChange={() => toggleConfig('iqr')} /> <span>Rango Intercuartílico</span></label>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button onClick={calcular} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium shadow-sm transition-colors">
                                Ejecutar Análisis Múltiple
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {resultadosGenerales && (
                <div className="space-y-6 fade-in">
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex justify-between items-center">
                            <h3 className="font-bold text-blue-900">Resumen Estadístico</h3>
                            
                            <button 
                                onClick={async () => {
                                    try {
                                        await exportarReporteDocx(resultadosGenerales, config, varFrecuencia, tablaFrecuencia);
                                        showToast("Reporte exportado exitosamente.", "success");
                                    } catch (err) {
                                        showToast("Error al generar el documento Word.", "error");
                                    }
                                }}
                                className="bg-blue-600 text-white text-sm px-4 py-2 rounded shadow-sm hover:bg-blue-700 transition-colors flex items-center space-x-2"
                            >
                                <span>📄</span>
                                <span>Exportar a Word</span>
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-600 border-b">
                                    <tr>
                                        <th className="px-6 py-3 font-semibold">Variable</th>
                                        <th className="px-6 py-3 font-semibold">N</th>
                                        {config.media && <th className="px-6 py-3 font-semibold text-right">Media</th>}
                                        {config.mediana && <th className="px-6 py-3 font-semibold text-right">Mediana</th>}
                                        {config.moda && <th className="px-6 py-3 font-semibold text-right">Moda</th>}
                                        {config.desviacion && <th className="px-6 py-3 font-semibold text-right">Desv. Est.</th>}
                                        {config.varianza && <th className="px-6 py-3 font-semibold text-right">Varianza</th>}
                                        {config.cv && <th className="px-6 py-3 font-semibold text-right">CV (%)</th>}
                                        {config.q1 && <th className="px-6 py-3 font-semibold text-right">Q1</th>}
                                        {config.q3 && <th className="px-6 py-3 font-semibold text-right">Q3</th>}
                                        {config.iqr && <th className="px-6 py-3 font-semibold text-right">Rango Int.</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {variablesSeleccionadas.map(v => {
                                        const r = resultadosGenerales[v];
                                        return (
                                            <tr key={v} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-3 font-medium text-gray-900">{v}</td>
                                                <td className="px-6 py-3 text-gray-500">{r.n}</td>
                                                {config.media && <td className="px-6 py-3 text-right">{r.media.toFixed(2)}</td>}
                                                {config.mediana && <td className="px-6 py-3 text-right">{r.mediana.toFixed(2)}</td>}
                                                {config.moda && <td className="px-6 py-3 text-right">{r.moda.length > 0 ? r.moda.join(', ') : 'N/A'}</td>}
                                                {config.desviacion && <td className="px-6 py-3 text-right">{r.desviacionEstandarMuestral.toFixed(2)}</td>}
                                                {config.varianza && <td className="px-6 py-3 text-right">{r.varianzaMuestral.toFixed(2)}</td>}
                                                {config.cv && <td className="px-6 py-3 text-right">{r.coeficienteVariacion.toFixed(2)}%</td>}
                                                {config.q1 && <td className="px-6 py-3 text-right">{r.q1.toFixed(2)}</td>}
                                                {config.q3 && <td className="px-6 py-3 text-right">{r.q3.toFixed(2)}</td>}
                                                {config.iqr && <td className="px-6 py-3 text-right">{r.iqr.toFixed(2)}</td>}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {tablaFrecuencia && tablaFrecuencia.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mt-8">
                            <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex justify-between items-center">
                                <h3 className="font-bold text-indigo-900">Tabla de Frecuencias (Regla de Sturges)</h3>
                                <select 
                                    value={varFrecuencia} 
                                    onChange={(e) => generarFrecuencia(e.target.value)}
                                    className="p-1 border border-indigo-200 rounded text-sm font-medium text-indigo-800 bg-white"
                                >
                                    {variablesSeleccionadas.map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-right">
                                    <thead className="bg-gray-50 text-gray-600 border-b text-xs uppercase">
                                        <tr>
                                            <th className="px-4 py-3 text-left">Clase (Intervalo)</th>
                                            <th className="px-4 py-3">Marca de Clase (xi)</th>
                                            <th className="px-4 py-3">Frecuencia Abs. (fi)</th>
                                            <th className="px-4 py-3">Frecuencia Acum. (Fi)</th>
                                            <th className="px-4 py-3">Frec. Relativa (hi)</th>
                                            <th className="px-4 py-3">Frec. Relativa Acum. (Hi)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {tablaFrecuencia.map((fila, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-left font-medium text-gray-800">
                                                    [{fila.limiteInferior.toFixed(2)} - {fila.limiteSuperior.toFixed(2)}{idx === tablaFrecuencia.length - 1 ? ']' : ')'}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">{fila.marcaClase.toFixed(2)}</td>
                                                <td className="px-4 py-3 font-bold text-indigo-600">{fila.frecuenciaAbsoluta}</td>
                                                <td className="px-4 py-3 text-gray-600">{fila.frecuenciaAcumulada}</td>
                                                <td className="px-4 py-3 text-gray-600">{fila.frecuenciaRelativa.toFixed(2)}%</td>
                                                <td className="px-4 py-3 text-gray-600">{fila.frecuenciaRelativaAcumulada.toFixed(2)}%</td>
                                            </tr>
                                        ))}
                                        <tr className="bg-gray-50 font-bold border-t-2 border-gray-200">
                                            <td className="px-4 py-3 text-left">Total</td>
                                            <td className="px-4 py-3">-</td>
                                            <td className="px-4 py-3 text-indigo-700">{resultadosGenerales[varFrecuencia].n}</td>
                                            <td className="px-4 py-3">-</td>
                                            <td className="px-4 py-3">100.00%</td>
                                            <td className="px-4 py-3">-</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={hideToast} />
        </div>
    );
}