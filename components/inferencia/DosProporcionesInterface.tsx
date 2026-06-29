'use client';

import { useState } from 'react';
import { useToast } from '../../hooks/useToast';
import Toast from '../Toast';
import { ciDosProporciones } from '../../utils/inferenciaCalculator';

export default function DosProporcionesInterface() {
    const { toast, showToast, hideToast } = useToast();
    
    const [stats, setStats] = useState<{ n1: number, x1: number, p1: number, n2: number, x2: number, p2: number } | null>(null);
    const [calc, setCalc] = useState({ n1: '', x1: '', n2: '', x2: '' });
    
    const [confianza, setConfianza] = useState('0.95');
    const [tipoPrueba, setTipoPrueba] = useState<'diferente' | 'menor' | 'mayor'>('diferente');

    const calcular = () => {
        const n1 = parseInt(calc.n1), x1 = parseInt(calc.x1);
        const n2 = parseInt(calc.n2), x2 = parseInt(calc.x2);

        if ([n1, x1, n2, x2].some(isNaN) || n1 < 2 || n2 < 2 || x1 > n1 || x2 > n2) {
            showToast("Verifica los valores: N ≥ 2 y X no puede ser mayor a N.", "error");
            return;
        }
        
        setStats({ n1, x1, p1: x1 / n1, n2, x2, p2: x2 / n2 });
        showToast("Análisis de proporciones listo.", "success");
    };

    let intervalo: [number, number] | null = null;
    let z0: number | null = null;
    let valorCritico = 0;
    let conclusion = "";

    if (stats) {
        const is95 = confianza === '0.95';
        const zt = is95 ? 1.96 : 2.576;
        intervalo = ciDosProporciones(stats.p1, 1 - stats.p1, stats.n1, stats.p2, 1 - stats.p2, stats.n2, zt);
        
        const pPool = (stats.x1 + stats.x2) / (stats.n1 + stats.n2);
        const qPool = 1 - pPool;
        const errorEstandarPool = Math.sqrt(pPool * qPool * (1 / stats.n1 + 1 / stats.n2));
        z0 = (stats.p1 - stats.p2) / errorEstandarPool;

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

    return (
        <div className="space-y-6 fade-in">
            <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Ingresar Frecuencias</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-sm text-gray-600">Grupo 1</h4>
                        <input type="number" placeholder="Muestra (n1)" value={calc.n1} onChange={e=>setCalc(p=>({...p, n1: e.target.value}))} className="w-full p-2 border rounded" />
                        <input type="number" placeholder="Éxitos (x1)" value={calc.x1} onChange={e=>setCalc(p=>({...p, x1: e.target.value}))} className="w-full p-2 border rounded" />
                    </div>
                    <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-sm text-gray-600">Grupo 2</h4>
                        <input type="number" placeholder="Muestra (n2)" value={calc.n2} onChange={e=>setCalc(p=>({...p, n2: e.target.value}))} className="w-full p-2 border rounded" />
                        <input type="number" placeholder="Éxitos (x2)" value={calc.x2} onChange={e=>setCalc(p=>({...p, x2: e.target.value}))} className="w-full p-2 border rounded" />
                    </div>
                </div>
                <div className="flex justify-end pt-4"><button onClick={calcular} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium">Fijar Datos</button></div>
            </div>

            {stats && (
                <div className="mt-8 space-y-6 fade-in">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white border-t-4 border-t-blue-500 rounded-lg shadow-sm border border-gray-200 p-6">
                            <h4 className="font-bold mb-4">Intervalo (p1 - p2)</h4>
                            <select value={confianza} onChange={e => setConfianza(e.target.value)} className="w-full p-2 border rounded mb-4">
                                <option value="0.95">Confianza 95%</option>
                                <option value="0.99">Confianza 99%</option>
                            </select>
                            <div className="bg-blue-50 p-4 rounded text-center">
                                <p className="text-2xl font-bold text-blue-900">[ {(intervalo?.[0]! * 100).toFixed(2)}% , {(intervalo?.[1]! * 100).toFixed(2)}% ]</p>
                            </div>
                        </div>
                        <div className="bg-white border-t-4 border-t-indigo-500 rounded-lg shadow-sm border border-gray-200 p-6">
                            <h4 className="font-bold mb-4">Prueba de Hipótesis</h4>
                            <select value={tipoPrueba} onChange={e => setTipoPrueba(e.target.value as any)} className="w-full p-2 border rounded mb-4">
                                <option value="diferente">Diferente (≠)</option>
                                <option value="menor">Menor que (&lt;)</option>
                                <option value="mayor">Mayor que (&gt;)</option>
                            </select>
                            <div className={`p-4 rounded text-center ${conclusion.includes('No') ? 'bg-gray-100' : 'bg-red-50'}`}>
                                <p className="text-lg font-bold">{conclusion}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={hideToast} />
        </div>
    );
}