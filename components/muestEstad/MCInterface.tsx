'use client';

import { useState } from 'react';
import MethodCard from '../MethodCard';
import Toast from '../Toast';
import { useToast } from '@/hooks/useToast';
import {
    calcularMC,
    calcularTamanoMuestraMC,
    calcularCPF,
    ParametroPoblacionalMC,
    NivelConfianza,
    ResultadoMC,
    ObservacionConglomerado,
} from '@/utils/muestreoCalculator';

const PARAMETRO_LABEL: Record<ParametroPoblacionalMC, string> = {
    media: 'Media Poblacional',
    total_M_conocido: 'Total Poblacional (M conocido)',
    total_M_desconocido: 'Total Poblacional (M desconocido)',
    proporcion: 'Proporción Poblacional',
};

const NECESITA_M: ParametroPoblacionalMC[] = ['media', 'total_M_conocido', 'proporcion'];

interface FilaMC {
    id: string;
    elementos: string;
    observacion: string;
}

export default function MCInterface() {
    const { toast, showToast, hideToast } = useToast();

    const [parametro, setParametro] = useState<ParametroPoblacionalMC | null>(null);
    const [ic, setIc] = useState<NivelConfianza>(95);

    const [totalConglomerados, setTotalConglomerados] = useState('');
    const [muestraConglomerados, setMuestraConglomerados] = useState('');
    const [elementosPoblacion, setElementosPoblacion] = useState('');

    const [tablaGenerada, setTablaGenerada] = useState(false);
    const [filas, setFilas] = useState<FilaMC[]>([]);
    const [resultado, setResultado] = useState<ResultadoMC | null>(null);
    const [cpfNota, setCpfNota] = useState<string | null>(null);

    // Calculadora de tamaño de muestra
    const [mostrarCalculadora, setMostrarCalculadora] = useState(false);
    const [tmPoblacion, setTmPoblacion] = useState('');
    const [tmError, setTmError] = useState('');
    const [tmModoVarianza, setTmModoVarianza] = useState(true);
    const [tmVarianza, setTmVarianza] = useState('');
    const [tmPreliminar, setTmPreliminar] = useState('');
    const [tmPromedioConglomerados, setTmPromedioConglomerados] = useState('');
    const [tmResultado, setTmResultado] = useState<number | null>(null);

    const requiereM = parametro ? NECESITA_M.includes(parametro) : false;

    const handleParametroChange = (p: ParametroPoblacionalMC) => {
        setParametro(p);
        setTotalConglomerados('');
        setMuestraConglomerados('');
        setElementosPoblacion('');
        setTablaGenerada(false);
        setFilas([]);
        setResultado(null);
        setCpfNota(null);
        setMostrarCalculadora(false);
        setTmResultado(null);
    };

    const handleContinuar = () => {
        const N = parseInt(totalConglomerados);
        const n = parseInt(muestraConglomerados);
        if (isNaN(N) || isNaN(n) || N <= 0 || n <= 0 || n > N) {
            showToast('Verifica el total de conglomerados y el tamaño de la muestra.', 'error');
            return;
        }
        if (requiereM && elementosPoblacion.trim() === '') {
            showToast('Especifica el número de elementos en la población.', 'error');
            return;
        }

        const cpf = calcularCPF(N, n);
        setCpfNota(
            cpf > 0.95
                ? `Corrección por Población Finita: ${cpf} (población grande, se podría omitir).`
                : `Corrección por Población Finita: ${cpf} (población pequeña, se debe considerar).`
        );

        setFilas(Array.from({ length: n }, (_, i) => ({ id: `c${i + 1}`, elementos: '', observacion: '' })));
        setTablaGenerada(true);
        setResultado(null);
    };

    const handleFilaChange = (id: string, field: 'elementos' | 'observacion', value: string) => {
        setFilas(prev => prev.map(f => (f.id === id ? { ...f, [field]: value } : f)));
    };

    const handleEstimar = () => {
        if (!parametro) return;
        const N = parseInt(totalConglomerados);
        const n = parseInt(muestraConglomerados);

        const datos: ObservacionConglomerado[] = filas.map(f => ({
            elementos: parseFloat(f.elementos),
            observacion: parseFloat(f.observacion),
        }));
        if (datos.some(d => isNaN(d.elementos) || isNaN(d.observacion))) {
            showToast('Verifica que todos los valores sean numéricos.', 'error');
            return;
        }

        const M = requiereM ? parseFloat(elementosPoblacion) : undefined;
        const res = calcularMC(parametro, N, n, datos, ic, M);
        setResultado(res);
    };

    const handleCalcularTamano = () => {
        const N = parseInt(tmPoblacion);
        const B = parseFloat(tmError);
        if (isNaN(N) || isNaN(B) || !parametro) {
            showToast('Especifica los conglomerados en la población y el límite de error de estimación.', 'error');
            return;
        }
        const necesitaPromedio = parametro === 'media' || parametro === 'proporcion';
        const promedio = necesitaPromedio ? parseFloat(tmPromedioConglomerados) : undefined;
        if (necesitaPromedio && (promedio === undefined || isNaN(promedio))) {
            showToast('Especifica el tamaño promedio del conglomerado en la población.', 'error');
            return;
        }

        if (tmModoVarianza) {
            const v = parseFloat(tmVarianza);
            if (isNaN(v)) {
                showToast('Especifica la estimación de varianza.', 'error');
                return;
            }
            setTmResultado(calcularTamanoMuestraMC(parametro, N, B, ic, { estimacionVarianza: v, promedioConglomerados: promedio }));
        } else {
            const prelim = parseFloat(tmPreliminar);
            if (isNaN(prelim)) {
                showToast('Especifica el tamaño de muestra preliminar.', 'error');
                return;
            }
            setTmResultado(calcularTamanoMuestraMC(parametro, N, B, ic, { tamanoMuestraPreliminar: prelim, promedioConglomerados: promedio }));
        }
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MethodCard icon="📊" label="Media Poblacional" isActive={parametro === 'media'} onClick={() => handleParametroChange('media')} />
                <MethodCard icon="%" label="Proporción Poblacional" isActive={parametro === 'proporcion'} onClick={() => handleParametroChange('proporcion')} />
                <MethodCard icon="Σ" label="Total Poblacional (M conocido)" isActive={parametro === 'total_M_conocido'} onClick={() => handleParametroChange('total_M_conocido')} />
                <MethodCard icon="Σ?" label="Total Poblacional (M desconocido)" isActive={parametro === 'total_M_desconocido'} onClick={() => handleParametroChange('total_M_desconocido')} />
            </div>

            {parametro && !tablaGenerada && (
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                    <h3 className="font-semibold text-gray-800">Datos de la muestra de conglomerados</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 text-sm text-gray-600">Total de conglomerados en la población (N)</label>
                            <input type="number" value={totalConglomerados} onChange={(e) => setTotalConglomerados(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" min={1} />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm text-gray-600">Conglomerados en la muestra (n)</label>
                            <input type="number" value={muestraConglomerados} onChange={(e) => setMuestraConglomerados(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" min={1} />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm text-gray-600">Nivel de confianza</label>
                            <select value={ic} onChange={(e) => setIc(Number(e.target.value) as NivelConfianza)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none">
                                <option value={95}>95%</option>
                                <option value={99}>99%</option>
                            </select>
                        </div>
                        {requiereM && (
                            <div>
                                <label className="block mb-1 text-sm text-gray-600">Elementos en la población (M)</label>
                                <input type="number" value={elementosPoblacion} onChange={(e) => setElementosPoblacion(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                            </div>
                        )}
                    </div>
                    <button onClick={handleContinuar} className="mt-2 bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium w-full sm:w-auto">Continuar</button>

                    <div className="pt-4 border-t">
                        <button onClick={() => setMostrarCalculadora(!mostrarCalculadora)} className="text-sm text-blue-600 hover:underline">
                            {mostrarCalculadora ? 'Ocultar' : '¿No conoces n? '}Calcular tamaño de muestra
                        </button>
                        {mostrarCalculadora && (
                            <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block mb-1 text-sm text-gray-600">Conglomerados en la población</label>
                                        <input type="number" value={tmPoblacion} onChange={(e) => setTmPoblacion(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />
                                    </div>
                                    <div>
                                        <label className="block mb-1 text-sm text-gray-600">Límite para el error de estimación</label>
                                        <input type="number" value={tmError} onChange={(e) => setTmError(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />
                                    </div>
                                    {(parametro === 'media' || parametro === 'proporcion') && (
                                        <div>
                                            <label className="block mb-1 text-sm text-gray-600">Tamaño promedio del conglomerado en la población</label>
                                            <input type="number" value={tmPromedioConglomerados} onChange={(e) => setTmPromedioConglomerados(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <input type="radio" checked={tmModoVarianza} onChange={() => setTmModoVarianza(true)} id="tmVarC" />
                                        <label htmlFor="tmVarC" className="text-sm text-gray-600">Estimación de varianza</label>
                                        <input type="number" disabled={!tmModoVarianza} value={tmVarianza} onChange={(e) => setTmVarianza(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-100" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="radio" checked={!tmModoVarianza} onChange={() => setTmModoVarianza(false)} id="tmPrelimC" />
                                        <label htmlFor="tmPrelimC" className="text-sm text-gray-600">Tamaño de muestra preliminar</label>
                                        <input type="number" disabled={tmModoVarianza} value={tmPreliminar} onChange={(e) => setTmPreliminar(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-100" />
                                    </div>
                                </div>
                                <button onClick={handleCalcularTamano} className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-800 text-sm">Calcular tamaño</button>
                                {tmResultado !== null && (
                                    <p className="text-sm text-gray-700 bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg">
                                        Se necesitan muestrear <span className="font-bold">{tmResultado}</span> conglomerados con un {ic}% de confianza.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {parametro && tablaGenerada && (
                <div className="space-y-4 fade-in">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800">Ingresar Datos por Conglomerado (n = {muestraConglomerados})</h3>
                        <button onClick={() => setTablaGenerada(false)} className="text-sm text-blue-600 hover:underline">Cambiar parámetros</button>
                    </div>
                    {cpfNota && <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-200">{cpfNota}</p>}

                    <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg shadow-sm">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 w-1/3">Conglomerado</th>
                                    <th className="px-6 py-3 w-1/3">No. Elementos (Mi)</th>
                                    <th className="px-6 py-3 w-1/3">{parametro === 'proporcion' ? 'Elementos con característica' : 'Total de observaciones (yi)'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filas.map((f, idx) => (
                                    <tr key={f.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-3 font-medium text-gray-900">{idx + 1}</td>
                                        <td className="px-6 py-2"><input type="number" value={f.elementos} onChange={(e) => handleFilaChange(f.id, 'elementos', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" /></td>
                                        <td className="px-6 py-2"><input type="number" value={f.observacion} onChange={(e) => handleFilaChange(f.id, 'observacion', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                        <button onClick={handleEstimar} className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors font-medium shadow-sm">
                            Estimar valores
                        </button>
                    </div>
                </div>
            )}

            {resultado && parametro && (
                <div className="mt-8 p-6 bg-white border border-gray-200 rounded-xl shadow-lg fade-in">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Resultados — Muestreo por Conglomerados</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                            <p className="text-sm text-blue-800 font-semibold mb-1">{PARAMETRO_LABEL[parametro]} Estimada:</p>
                            <p className="text-lg text-blue-900 font-bold">{resultado.valorEstimado}</p>
                        </div>
                        <div className="p-4 bg-purple-50 border-l-4 border-purple-500 rounded-r-lg">
                            <p className="text-sm text-purple-800 font-semibold mb-1">Varianza Estimada:</p>
                            <p className="text-lg text-purple-900 font-bold">{resultado.varianza}</p>
                        </div>
                        <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
                            <p className="text-sm text-amber-800 font-semibold mb-1">Límite para el error de estimación:</p>
                            <p className="text-lg text-amber-900 font-bold">± {resultado.limiteError}</p>
                        </div>
                        <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg">
                            <p className="text-sm text-emerald-800 font-semibold mb-1">Intervalo de Confianza ({ic}%):</p>
                            <p className="text-lg text-emerald-900 font-bold">[{resultado.intervaloConfianza[0]} , {resultado.intervaloConfianza[1]}]</p>
                        </div>
                    </div>
                </div>
            )}

            <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={hideToast} />
        </div>
    );
}
