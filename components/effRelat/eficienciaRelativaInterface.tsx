'use client';

import { useState, useEffect } from 'react';
import { EffRelatModel, EffRelatModelKey } from '@/app/data/effRelatModels';

interface Props {
    modelKey: EffRelatModelKey;
}

export default function EficienciaRelativaInterface({ modelKey }: Props) {
    const [gl, setGl] = useState('');
    const [glt, setGlt] = useState('');
    const [gle, setGle] = useState('');
    const [cm, setCm] = useState('');
    const [cme, setCme] = useState('');

    const [resultado, setResultado] = useState<number | null>(null);
    const [recomendacion, setRecomendacion] = useState<string>('');
    const [errorMsg, setErrorMsg] = useState<string>('');

    useEffect(() => {
        setResultado(null);
        setRecomendacion('');
        setErrorMsg('');
    }, [modelKey]);

    const getDynamicLabels = () => {
        switch (modelKey) {
            case 'ER_DBA_DCA':
                return { glLabel: 'Grados de libertad de los bloques', cmLabel: 'Cuadrado medio de los bloques' };
            case 'ER_FB':
                return { glLabel: 'Grados de libertad de las filas', cmLabel: 'Cuadrado medio de las filas' };
            case 'ER_CB':
                return { glLabel: 'Grados de libertad de las columnas', cmLabel: 'Cuadrado medio de las columnas' };
            default:
                return { glLabel: 'Grados de libertad', cmLabel: 'Cuadrado medio' };
        }
    };

    const { glLabel, cmLabel } = getDynamicLabels();

    const handleCalculate = () => {
        setErrorMsg('');
        
        const valGl = parseFloat(gl);
        const valGlt = parseFloat(glt);
        const valGle = parseFloat(gle);
        const valCm = parseFloat(cm);
        const valCme = parseFloat(cme);

        if (isNaN(valGl) || isNaN(valGlt) || isNaN(valGle) || isNaN(valCm) || isNaN(valCme)) {
            setErrorMsg('Por favor, ingresa valores numéricos válidos en todos los campos.');
            return;
        }

        const cmde = (valGl * valCm + (valGlt + valGle) * valCme) / (valGl + valGlt + valGle);
        
        const f1 = valGle;
        const f2 = valGl + valGle;
        const eficiencia = ((f1 + 1) * (f2 + 3) * cmde) / ((f2 + 1) * (f1 + 3) * valCme) * 100;

        setResultado(eficiencia);

        if (modelKey === 'ER_DBA_DCA') {
            setRecomendacion(
                eficiencia < 100 
                    ? "Se recomienda utilizar el método DCA" 
                    : "Se recomienda utilizar el método DBA"
            );
        } else {
            setRecomendacion(
                eficiencia < 100 
                    ? "Se recomienda utilizar el método DBA" 
                    : "Se recomienda utilizar el método DCL"
            );
        }
    };

    return (
        <div className="space-y-8 fade-in">
            {errorMsg && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md">
                    {errorMsg}
                </div>
            )}

            {/* Input Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-700 border-b pb-2">Datos Requeridos</h3>
                    
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">{glLabel}</label>
                        <input 
                            type="number" step="any"
                            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                            value={gl} onChange={(e) => setGl(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Grados de libertad de los tratamientos</label>
                        <input 
                            type="number" step="any"
                            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                            value={glt} onChange={(e) => setGlt(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Grados de libertad del error</label>
                        <input 
                            type="number" step="any"
                            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                            value={gle} onChange={(e) => setGle(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">{cmLabel}</label>
                        <input 
                            type="number" step="any"
                            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                            value={cm} onChange={(e) => setCm(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Cuadrado medio del error</label>
                        <input 
                            type="number" step="any"
                            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                            value={cme} onChange={(e) => setCme(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <button 
                onClick={handleCalculate}
                className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition-colors font-medium"
            >
                Calcular Eficiencia
            </button>

            {resultado !== null && (
                <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mt-8">
                    <h3 className="text-blue-900 font-bold mb-4 border-b border-blue-200 pb-2">
                        Resultados
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <span className="text-sm text-blue-800 block">Eficiencia Relativa:</span>
                            <span className="text-3xl font-bold text-blue-600">
                                {resultado.toFixed(4)} %
                            </span>
                        </div>
                        <div className="bg-white p-4 rounded border border-blue-100">
                            <span className="text-sm text-gray-500 block mb-1">Recomendación:</span>
                            <span className="font-semibold text-gray-800">
                                {recomendacion}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}