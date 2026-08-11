'use client';

import { useState } from 'react';
import MethodCard from '../MethodCard';
import Toast from '../Toast';
import { useToast } from '@/hooks/useToast';
import {
    calcularMS,
    calcularTamanoMuestraMS,
    calcularCPF,
    calcularK,
    ParametroPoblacional,
    NivelConfianza,
    ResultadoMS,
} from '@/utils/muestreoCalculator';

const PARAMETRO_LABEL: Record<ParametroPoblacional, string> = {
    media: 'Media Poblacional',
    total: 'Total Poblacional',
    proporcion: 'Proporción Poblacional',
};

export default function MSInterface() {
    const { toast, showToast, hideToast } = useToast();

    const [parametro, setParametro] = useState<ParametroPoblacional | null>(null);

    const [tamanoPoblacion, setTamanoPoblacion] = useState('');
    const [tamanoMuestra, setTamanoMuestra] = useState('');
    const [ic, setIc] = useState<NivelConfianza>(95);
    const [elementosCaracteristica, setElementosCaracteristica] = useState('');
    const [valorK, setValorK] = useState('');
    const [kSugerido, setKSugerido] = useState<number | null>(null);

    const [tablaGenerada, setTablaGenerada] = useState(false);
    const [observaciones, setObservaciones] = useState<{ id: string; indice: number; valor: string }[]>([]);
    const [resultado, setResultado] = useState<ResultadoMS | null>(null);
    const [cpfNota, setCpfNota] = useState<string | null>(null);

    // Calculadora de tamaño de muestra
    const [mostrarCalculadora, setMostrarCalculadora] = useState(false);
    const [tmPoblacion, setTmPoblacion] = useState('');
    const [tmError, setTmError] = useState('');
    const [tmModoVarianza, setTmModoVarianza] = useState(true);
    const [tmVarianza, setTmVarianza] = useState('');
    const [tmAmplitud, setTmAmplitud] = useState('');
    const [tmProporcion, setTmProporcion] = useState('');
    const [tmResultado, setTmResultado] = useState<number | null>(null);
    const [tmKSugerido, setTmKSugerido] = useState<number | null>(null);

    const handleParametroChange = (p: ParametroPoblacional) => {
        setParametro(p);
        setTablaGenerada(false);
        setObservaciones([]);
        setResultado(null);
        setCpfNota(null);
        setTamanoPoblacion('');
        setTamanoMuestra('');
        setElementosCaracteristica('');
        setValorK('');
        setKSugerido(null);
        setMostrarCalculadora(false);
        setTmResultado(null);
    };

    const handleCalcularK = () => {
        const N = parseInt(tamanoPoblacion);
        const n = parseInt(tamanoMuestra);
        if (!isNaN(N) && !isNaN(n) && n > 0) {
            const k = calcularK(N, n);
            setKSugerido(k);
        }
    };

    const handleContinuar = () => {
        const N = parseInt(tamanoPoblacion);
        const n = parseInt(tamanoMuestra);
        const K = parseInt(valorK);
        if (isNaN(N) || isNaN(n) || N <= 0 || n <= 0 || n > N) {
            showToast('Verifica el tamaño de la población y de la muestra.', 'error');
            return;
        }
        if (isNaN(K) || K <= 0) {
            showToast('Especifica el valor de K (intervalo de selección sistemática).', 'error');
            return;
        }
        if (parametro === 'proporcion' && elementosCaracteristica.trim() === '') {
            showToast('Especifica el número de elementos con la característica (o "N" si lo desconoces).', 'error');
            return;
        }

        const cpf = calcularCPF(N, n);
        setCpfNota(
            cpf > 0.95
                ? `Corrección por Población Finita: ${cpf} (población grande, se podría omitir).`
                : `Corrección por Población Finita: ${cpf} (población pequeña, se debe considerar).`
        );

        let indice = K;
        const nuevas = Array.from({ length: n }, () => {
            const item = { id: `obs-${indice}`, indice, valor: '' };
            indice += K;
            return item;
        });
        setObservaciones(nuevas);
        setTablaGenerada(true);
        setResultado(null);
    };

    const handleInputChange = (id: string, valor: string) => {
        setObservaciones(prev => prev.map(o => (o.id === id ? { ...o, valor } : o)));
    };

    const handleEstimar = () => {
        if (!parametro) return;
        const N = parseInt(tamanoPoblacion);
        const n = parseInt(tamanoMuestra);

        const valores = observaciones.map(o => parseFloat(o.valor));
        if (valores.some(v => isNaN(v))) {
            showToast('Verifica que todos los valores de las observaciones sean numéricos.', 'error');
            return;
        }
        if (parametro === 'proporcion' && !valores.every(v => v === 0 || v === 1)) {
            showToast("Para proporción poblacional, sólo se aceptan valores '0' o '1'.", 'error');
            return;
        }

        const elementosNum = elementosCaracteristica.trim().toUpperCase() === 'N'
            ? undefined
            : parseInt(elementosCaracteristica) || undefined;

        const res = calcularMS(parametro, N, n, ic, valores, elementosNum);
        setResultado(res);
    };

    const handleCalcularTamano = () => {
        const N = parseInt(tmPoblacion);
        const B = parseFloat(tmError);
        if (isNaN(N) || isNaN(B)) {
            showToast('Especifica el tamaño de la población y el límite de error de estimación.', 'error');
            return;
        }
        if (!parametro) return;

        let n: number;
        if (parametro === 'proporcion') {
            const p = parseFloat(tmProporcion);
            if (isNaN(p)) {
                showToast('Especifica la proporción estimada.', 'error');
                return;
            }
            n = calcularTamanoMuestraMS('proporcion', N, B, ic, { proporcionEstimada: p });
        } else if (tmModoVarianza) {
            const v = parseFloat(tmVarianza);
            if (isNaN(v)) {
                showToast('Especifica la estimación de varianza.', 'error');
                return;
            }
            n = calcularTamanoMuestraMS(parametro, N, B, ic, { estimacionVarianza: v });
        } else {
            const a = parseFloat(tmAmplitud);
            if (isNaN(a)) {
                showToast('Especifica la amplitud de variación.', 'error');
                return;
            }
            n = calcularTamanoMuestraMS(parametro, N, B, ic, { amplitudVariacion: a });
        }
        setTmResultado(n);
        setTmKSugerido(n > 0 ? Math.round(N / n) : null);
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <MethodCard icon="📊" label="Media Poblacional" isActive={parametro === 'media'} onClick={() => handleParametroChange('media')} />
                <MethodCard icon="Σ" label="Total Poblacional" isActive={parametro === 'total'} onClick={() => handleParametroChange('total')} />
                <MethodCard icon="%" label="Proporción Poblacional" isActive={parametro === 'proporcion'} onClick={() => handleParametroChange('proporcion')} />
            </div>

            {parametro && !tablaGenerada && (
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                    <h3 className="font-semibold text-gray-800">Datos de la población y la muestra</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 text-sm text-gray-600">Tamaño de la población (N)</label>
                            <input type="number" value={tamanoPoblacion} onChange={(e) => { setTamanoPoblacion(e.target.value); }} onBlur={handleCalcularK} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" min={1} />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm text-gray-600">Tamaño de la muestra (n)</label>
                            <input type="number" value={tamanoMuestra} onChange={(e) => { setTamanoMuestra(e.target.value); }} onBlur={handleCalcularK} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" min={1} />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm text-gray-600">Valor de K {kSugerido ? `(sugerido: 1 en ${kSugerido})` : ''}</label>
                            <input type="number" value={valorK} onChange={(e) => setValorK(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" min={1} />
                        </div>
                        {parametro !== 'proporcion' && (
                            <div>
                                <label className="block mb-1 text-sm text-gray-600">Nivel de confianza</label>
                                <select value={ic} onChange={(e) => setIc(Number(e.target.value) as NivelConfianza)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none">
                                    <option value={95}>95%</option>
                                    <option value={99}>99%</option>
                                </select>
                            </div>
                        )}
                        {parametro === 'proporcion' && (
                            <div>
                                <label className="block mb-1 text-sm text-gray-600">Elementos con la característica (o "N" si se desconoce)</label>
                                <input type="text" value={elementosCaracteristica} onChange={(e) => setElementosCaracteristica(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Ej. 12 ó N" />
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
                                        <label className="block mb-1 text-sm text-gray-600">Tamaño de la población</label>
                                        <input type="number" value={tmPoblacion} onChange={(e) => setTmPoblacion(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />
                                    </div>
                                    <div>
                                        <label className="block mb-1 text-sm text-gray-600">Límite para el error de estimación</label>
                                        <input type="number" value={tmError} onChange={(e) => setTmError(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />
                                    </div>
                                    {parametro === 'proporcion' ? (
                                        <div>
                                            <label className="block mb-1 text-sm text-gray-600">Proporción estimada</label>
                                            <input type="number" step="0.01" value={tmProporcion} onChange={(e) => setTmProporcion(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <input type="radio" checked={tmModoVarianza} onChange={() => setTmModoVarianza(true)} id="tmVarS" />
                                                <label htmlFor="tmVarS" className="text-sm text-gray-600">Estimación de varianza</label>
                                                <input type="number" disabled={!tmModoVarianza} value={tmVarianza} onChange={(e) => setTmVarianza(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-100" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input type="radio" checked={!tmModoVarianza} onChange={() => setTmModoVarianza(false)} id="tmAmpS" />
                                                <label htmlFor="tmAmpS" className="text-sm text-gray-600">Amplitud de variación</label>
                                                <input type="number" disabled={tmModoVarianza} value={tmAmplitud} onChange={(e) => setTmAmplitud(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-100" />
                                            </div>
                                        </>
                                    )}
                                </div>
                                <button onClick={handleCalcularTamano} className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-800 text-sm">Calcular tamaño</button>
                                {tmResultado !== null && (
                                    <p className="text-sm text-gray-700 bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg">
                                        Se necesitan muestrear <span className="font-bold">{tmResultado}</span> observaciones con un {ic}% de confianza.
                                        {tmKSugerido && <> Muestra sistemática sugerida: 1 en {tmKSugerido}.</>}
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
                        <h3 className="font-semibold text-gray-800">Ingresar Observaciones (1 en {valorK}, n = {tamanoMuestra})</h3>
                        <button onClick={() => setTablaGenerada(false)} className="text-sm text-blue-600 hover:underline">Cambiar parámetros</button>
                    </div>
                    {cpfNota && <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-200">{cpfNota}</p>}

                    <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg shadow-sm">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 w-1/2">Elemento No.</th>
                                    <th className="px-6 py-3 w-1/2">Valor{parametro === 'proporcion' ? ' (0 ó 1)' : ''}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {observaciones.map((o) => (
                                    <tr key={o.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-3 font-medium text-gray-900">{o.indice}</td>
                                        <td className="px-6 py-2">
                                            <input type="number" value={o.valor} onChange={(e) => handleInputChange(o.id, e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="0.00" />
                                        </td>
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
                    <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Resultados — Muestreo Sistemático</h3>
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
