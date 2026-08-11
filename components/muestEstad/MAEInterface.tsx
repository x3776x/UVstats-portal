'use client';

import { useState } from 'react';
import MethodCard from '../MethodCard';
import Toast from '../Toast';
import { useToast } from '@/hooks/useToast';
import {
    calcularMAE,
    calcularTamanoMuestraMAE,
    ParametroPoblacional,
    NivelConfianza,
    ResultadoMAE,
    EstratoInputMAE,
    EstratoTamanoMuestraInput,
} from '@/utils/muestreoCalculator';

const PARAMETRO_LABEL: Record<ParametroPoblacional, string> = {
    media: 'Media Poblacional',
    total: 'Total Poblacional',
    proporcion: 'Proporción Poblacional',
};

interface EstratoConfig extends EstratoInputMAE {
    id: string;
}

interface ObservacionMAE {
    id: string;
    estratoIdx: number;
    numero: number;
    valor: string;
}

export default function MAEInterface() {
    const { toast, showToast, hideToast } = useToast();

    const [parametro, setParametro] = useState<ParametroPoblacional | null>(null);
    const [ic, setIc] = useState<NivelConfianza>(95);

    const [numEstratos, setNumEstratos] = useState('');
    const [estratos, setEstratos] = useState<EstratoConfig[]>([]);
    const [estratosConfirmados, setEstratosConfirmados] = useState(false);

    const [observaciones, setObservaciones] = useState<ObservacionMAE[]>([]);
    const [tablaGenerada, setTablaGenerada] = useState(false);
    const [resultado, setResultado] = useState<ResultadoMAE | null>(null);

    // Calculadora de tamaño de muestra por estrato
    const [mostrarCalculadora, setMostrarCalculadora] = useState(false);
    const [tmNumEstratos, setTmNumEstratos] = useState('');
    const [tmError, setTmError] = useState('');
    const [tmEstratos, setTmEstratos] = useState<(EstratoTamanoMuestraInput & { id: string })[]>([]);
    const [tmResultado, setTmResultado] = useState<{ totalMuestra: number; tamanosPorEstrato: number[] } | null>(null);

    const handleParametroChange = (p: ParametroPoblacional) => {
        setParametro(p);
        setNumEstratos('');
        setEstratos([]);
        setEstratosConfirmados(false);
        setObservaciones([]);
        setTablaGenerada(false);
        setResultado(null);
        setMostrarCalculadora(false);
        setTmResultado(null);
    };

    const handleOkEstratos = () => {
        const k = parseInt(numEstratos);
        if (isNaN(k) || k < 2) {
            showToast('Especifica un número de estratos válido (mínimo 2).', 'error');
            return;
        }
        setEstratos(Array.from({ length: k }, (_, i) => ({ id: `e${i + 1}`, unidadesMuestrales: 0, tamanoMuestra: 0 })));
        setEstratosConfirmados(false);
    };

    const handleEstratoChange = (id: string, field: 'unidadesMuestrales' | 'tamanoMuestra', value: string) => {
        setEstratos(prev => prev.map(e => e.id === id ? { ...e, [field]: parseInt(value) || 0 } : e));
    };

    const handleContinuarEstratos = () => {
        if (estratos.some(e => e.unidadesMuestrales <= 0 || e.tamanoMuestra <= 0 || e.tamanoMuestra > e.unidadesMuestrales)) {
            showToast('Verifica las unidades muestrales y el tamaño de muestra de cada estrato.', 'error');
            return;
        }
        const nuevas: ObservacionMAE[] = [];
        estratos.forEach((e, idx) => {
            for (let j = 0; j < e.tamanoMuestra; j++) {
                nuevas.push({ id: `${idx}-${j}`, estratoIdx: idx, numero: j + 1, valor: '' });
            }
        });
        setObservaciones(nuevas);
        setEstratosConfirmados(true);
        setTablaGenerada(true);
        setResultado(null);
    };

    const handleInputChange = (id: string, valor: string) => {
        setObservaciones(prev => prev.map(o => (o.id === id ? { ...o, valor } : o)));
    };

    const handleEstimar = () => {
        if (!parametro) return;
        const valores = observaciones.map(o => parseFloat(o.valor));
        if (valores.some(v => isNaN(v))) {
            showToast('Verifica que todos los valores de las observaciones sean numéricos.', 'error');
            return;
        }
        if (parametro === 'proporcion' && !valores.every(v => v === 0 || v === 1)) {
            showToast("Para proporción poblacional, sólo se aceptan valores '0' o '1'.", 'error');
            return;
        }

        const observacionesPorEstrato: number[][] = estratos.map((_, idx) =>
            observaciones.filter(o => o.estratoIdx === idx).map(o => parseFloat(o.valor))
        );

        const res = calcularMAE(parametro, estratos, observacionesPorEstrato, ic);
        setResultado(res);
    };

    // --- Calculadora de tamaño de muestra ---
    const handleOkTmEstratos = () => {
        const k = parseInt(tmNumEstratos);
        if (isNaN(k) || k < 2) {
            showToast('Especifica un número de estratos válido (mínimo 2).', 'error');
            return;
        }
        setTmEstratos(Array.from({ length: k }, (_, i) => ({ id: `te${i + 1}`, unidadesMuestrales: 0, aproximacion: 0, fraccionAsignada: 0 })));
        setTmResultado(null);
    };

    const handleTmEstratoChange = (id: string, field: 'unidadesMuestrales' | 'aproximacion' | 'fraccionAsignada', value: string) => {
        setTmEstratos(prev => prev.map(e => e.id === id ? { ...e, [field]: parseFloat(value) || 0 } : e));
    };

    const handleCalcularTamano = () => {
        const B = parseFloat(tmError);
        if (isNaN(B) || tmEstratos.length === 0 || !parametro) {
            showToast('Completa el límite de error y los datos de cada estrato.', 'error');
            return;
        }
        const res = calcularTamanoMuestraMAE(parametro, tmEstratos, B, ic);
        setTmResultado(res);
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
                    <h3 className="font-semibold text-gray-800">Definición de estratos</h3>
                    <div className="flex items-end gap-3">
                        <div>
                            <label className="block mb-1 text-sm text-gray-600">Número de estratos</label>
                            <input type="number" value={numEstratos} onChange={(e) => setNumEstratos(e.target.value)} className="w-40 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" min={2} />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm text-gray-600">Nivel de confianza</label>
                            <select value={ic} onChange={(e) => setIc(Number(e.target.value) as NivelConfianza)} className="w-32 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none">
                                <option value={95}>95%</option>
                                <option value={99}>99%</option>
                            </select>
                        </div>
                        <button onClick={handleOkEstratos} className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-800 text-sm">OK</button>
                    </div>

                    {estratos.length > 0 && (
                        <div className="space-y-3">
                            <div className="max-h-72 overflow-y-auto border border-gray-200 rounded-lg shadow-sm">
                                <table className="w-full text-sm text-left text-gray-500">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-3">Estrato</th>
                                            <th className="px-4 py-3">Unidades Muestrales (Ni)</th>
                                            <th className="px-4 py-3">Tamaño de Muestra (ni)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {estratos.map((e, idx) => (
                                            <tr key={e.id} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium text-gray-900">{idx + 1}</td>
                                                <td className="px-4 py-2"><input type="number" value={e.unidadesMuestrales || ''} onChange={(ev) => handleEstratoChange(e.id, 'unidadesMuestrales', ev.target.value)} className="w-full p-2 border border-gray-300 rounded-md" /></td>
                                                <td className="px-4 py-2"><input type="number" value={e.tamanoMuestra || ''} onChange={(ev) => handleEstratoChange(e.id, 'tamanoMuestra', ev.target.value)} className="w-full p-2 border border-gray-300 rounded-md" /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <button onClick={handleContinuarEstratos} className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium w-full sm:w-auto">Continuar</button>
                        </div>
                    )}

                    <div className="pt-4 border-t">
                        <button onClick={() => setMostrarCalculadora(!mostrarCalculadora)} className="text-sm text-blue-600 hover:underline">
                            {mostrarCalculadora ? 'Ocultar' : '¿No conoces los tamaños de muestra por estrato? '}Calcular tamaño de muestra
                        </button>
                        {mostrarCalculadora && (
                            <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg space-y-3">
                                <div className="flex items-end gap-3">
                                    <div>
                                        <label className="block mb-1 text-sm text-gray-600">Número de estratos</label>
                                        <input type="number" value={tmNumEstratos} onChange={(e) => setTmNumEstratos(e.target.value)} className="w-40 p-2 border border-gray-300 rounded-md" min={2} />
                                    </div>
                                    <div>
                                        <label className="block mb-1 text-sm text-gray-600">Límite de error de estimación</label>
                                        <input type="number" value={tmError} onChange={(e) => setTmError(e.target.value)} className="w-40 p-2 border border-gray-300 rounded-md" />
                                    </div>
                                    <button onClick={handleOkTmEstratos} className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-800 text-sm">OK</button>
                                </div>

                                {tmEstratos.length > 0 && (
                                    <>
                                        <div className="max-h-72 overflow-y-auto border border-gray-200 rounded-lg shadow-sm">
                                            <table className="w-full text-sm text-left text-gray-500">
                                                <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                                                    <tr>
                                                        <th className="px-4 py-3">Estrato</th>
                                                        <th className="px-4 py-3">Unidades Muestrales</th>
                                                        <th className="px-4 py-3">{parametro === 'proporcion' ? 'Proporción estimada' : 'Varianza aproximada'}</th>
                                                        <th className="px-4 py-3">Fracción asignada (wi)</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {tmEstratos.map((e, idx) => (
                                                        <tr key={e.id} className="bg-white border-b hover:bg-gray-50">
                                                            <td className="px-4 py-3 font-medium text-gray-900">{idx + 1}</td>
                                                            <td className="px-4 py-2"><input type="number" value={e.unidadesMuestrales || ''} onChange={(ev) => handleTmEstratoChange(e.id, 'unidadesMuestrales', ev.target.value)} className="w-full p-2 border border-gray-300 rounded-md" /></td>
                                                            <td className="px-4 py-2"><input type="number" step="0.01" value={e.aproximacion || ''} onChange={(ev) => handleTmEstratoChange(e.id, 'aproximacion', ev.target.value)} className="w-full p-2 border border-gray-300 rounded-md" /></td>
                                                            <td className="px-4 py-2"><input type="number" step="0.01" value={e.fraccionAsignada || ''} onChange={(ev) => handleTmEstratoChange(e.id, 'fraccionAsignada', ev.target.value)} className="w-full p-2 border border-gray-300 rounded-md" /></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <button onClick={handleCalcularTamano} className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-800 text-sm">Calcular tamaño</button>
                                    </>
                                )}

                                {tmResultado && (
                                    <div className="text-sm text-gray-700 bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg space-y-1">
                                        <p>Se necesitan muestrear un total de <span className="font-bold">{tmResultado.totalMuestra}</span> observaciones con un {ic}% de confianza.</p>
                                        {tmResultado.tamanosPorEstrato.map((n, i) => (
                                            <p key={i}>{n} observaciones para el estrato {i + 1}</p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {parametro && tablaGenerada && (
                <div className="space-y-4 fade-in">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800">Ingresar Observaciones por Estrato</h3>
                        <button onClick={() => { setTablaGenerada(false); setEstratosConfirmados(false); }} className="text-sm text-blue-600 hover:underline">Cambiar estratos</button>
                    </div>

                    <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg shadow-sm">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 w-1/3">Estrato</th>
                                    <th className="px-6 py-3 w-1/3">Observación</th>
                                    <th className="px-6 py-3 w-1/3">Valor{parametro === 'proporcion' ? ' (0 ó 1)' : ''}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {observaciones.map((o) => (
                                    <tr key={o.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-3 font-medium text-gray-900">{o.estratoIdx + 1}</td>
                                        <td className="px-6 py-3">{o.estratoIdx + 1}.{o.numero}</td>
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
                    <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Resultados — Muestreo Aleatorio Estratificado</h3>
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
                    <div className="mt-4 text-sm text-gray-600">
                        <p className="font-semibold mb-1">Medias/proporciones por estrato:</p>
                        <p>{resultado.mediasPorEstrato.map((m, i) => `Estrato ${i + 1}: ${m.toFixed(4)}`).join(' · ')}</p>
                    </div>
                </div>
            )}

            <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={hideToast} />
        </div>
    );
}
