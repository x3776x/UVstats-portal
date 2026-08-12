'use client';

import { useState, useRef } from 'react';
import MethodCard from '../MethodCard';
import Toast from '../Toast';
import { useToast } from '@/hooks/useToast';
import {
    Registro,
    RegistroConGrupo,
    ValoresIniciales,
    ResultadoDyH,
    ResultadoGeo,
    calcularValoresIniciales,
    calcularIntervalosDyH,
    calcularIntervalosGeo,
    ordenarPorDato,
    mostrarAmplitudGrupos,
    formatoDatosMostrados,
    parseExcelEstratificacion,
    exportarExcelDyH,
    exportarExcelGeo,
} from '@/utils/estratificacionCalculator';

type Tab = 'datos' | 'calculados' | 'grupoFinal';

export default function EstratificacionInterface() {
    const { toast, showToast, hideToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [metodo, setMetodo] = useState<'manual' | 'excel' | null>(null);
    const [registros, setRegistros] = useState<Registro[]>([]);
    const [gruposFinalesTexto, setGruposFinalesTexto] = useState('3');

    const [calculoListo, setCalculoListo] = useState(false);
    const [valores, setValores] = useState<ValoresIniciales | null>(null);
    const [resultadoDyH, setResultadoDyH] = useState<ResultadoDyH | null>(null);
    const [resultadoGeo, setResultadoGeo] = useState<ResultadoGeo | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('datos');

    const esDyH = valores?.tecnica === 'DyH';
    const gruposFinales: RegistroConGrupo[] | null = esDyH
        ? resultadoDyH?.gruposFinales ?? null
        : resultadoGeo?.gruposFinales ?? null;
    const cadenaElementosPorGrupo = esDyH ? resultadoDyH?.cadenaElementosPorGrupo : resultadoGeo?.cadenaElementosPorGrupo;
    const cadenaRangos = esDyH ? resultadoDyH?.cadenaRangos : resultadoGeo?.cadenaRangos;

    const resetResultados = () => {
        setCalculoListo(false);
        setValores(null);
        setResultadoDyH(null);
        setResultadoGeo(null);
        setActiveTab('datos');
    };

    const handleMetodoChange = (nuevo: 'manual' | 'excel') => {
        setMetodo(nuevo);
        setRegistros([]);
        resetResultados();
    };

    const handleImportarClick = () => fileInputRef.current?.click();

    const handleImportarArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.currentTarget.value = '';
        if (!file) return;
        if (!file.name.endsWith('.xls') && !file.name.endsWith('.xlsx')) {
            showToast('Elija un formato válido (.xls o .xlsx).', 'error');
            return;
        }
        try {
            const datos = await parseExcelEstratificacion(file);
            setRegistros(datos);
            resetResultados();
            showToast('Se importaron los datos de manera exitosa.', 'success');
        } catch (err: any) {
            showToast('Hubo un error al importar el archivo: ' + err.message, 'error');
        }
    };

    const [numElementosManual, setNumElementosManual] = useState('');
    const [mostrarPromptManual, setMostrarPromptManual] = useState(false);

    const handleIntroducirDatos = () => setMostrarPromptManual(true);

    const handleCrearTablaManual = () => {
        const n = parseInt(numElementosManual);
        if (isNaN(n) || n <= 0) {
            showToast('Especifique un valor numérico mayor a cero (0).', 'error');
            return;
        }
        setRegistros(Array.from({ length: n }, (_, i) => ({ clave: `P${i + 1}`, dato: 0 })));
        setMostrarPromptManual(false);
        resetResultados();
    };

    const handleRegistroChange = (idx: number, campo: 'clave' | 'dato', valor: string) => {
        setRegistros(prev => prev.map((r, i) => i === idx
            ? { ...r, [campo]: campo === 'dato' ? parseFloat(valor) : valor }
            : r
        ));
    };

    const handleCalcularIntervalos = () => {
        const grupos = parseInt(gruposFinalesTexto);
        if (isNaN(grupos) || grupos <= 0) {
            showToast('Especifique un valor numérico mayor a cero (0) en los grupos finales.', 'error');
            return;
        }
        if (registros.length < 3) {
            showToast('Se necesitan al menos 3 elementos para calcular los intervalos.', 'error');
            return;
        }

        let hayVacios = false;
        const limpios = registros.map(r => {
            if (isNaN(r.dato)) { hayVacios = true; return { ...r, dato: 0 }; }
            return r;
        });
        if (hayVacios) {
            showToast('Se detectaron algunos datos vacíos y fueron rellenados con ceros (0).', 'success');
        }

        const ordenados = ordenarPorDato(limpios);
        setRegistros(ordenados);

        const valoresIniciales = calcularValoresIniciales(ordenados, grupos);
        setValores(valoresIniciales);

        if (valoresIniciales.tecnica === 'DyH') {
            const resultado = calcularIntervalosDyH(ordenados, valoresIniciales, grupos);
            setResultadoDyH(resultado);
            setResultadoGeo(null);
            showToast(
                `El Coeficiente de Asimetría de los datos importados es: ${valoresIniciales.ca}\npor lo tanto se utilizará la técnica de Dalenius y Hodges.`,
                'success'
            );
        } else {
            const resultado = calcularIntervalosGeo(ordenados, valoresIniciales.datoMayor, valoresIniciales.datoMenor, grupos);
            setResultadoGeo(resultado);
            setResultadoDyH(null);
            showToast(
                `El Coeficiente de Asimetría de los datos importados es: ${valoresIniciales.ca}\npor lo tanto se utilizará la técnica de estratificación geométrica.`,
                'success'
            );
        }

        setCalculoListo(true);
        setActiveTab(valoresIniciales.tecnica === 'DyH' ? 'calculados' : 'grupoFinal');
    };

    const handleExportar = async () => {
        if (!valores) return;
        const nombreArchivo = esDyH ? 'Estratificacion_DyH.xlsx' : 'Estratificacion_Geometrica.xlsx';
        try {
            if (esDyH && resultadoDyH) {
                await exportarExcelDyH(registros, resultadoDyH.intervalos, resultadoDyH.gruposFinales, nombreArchivo);
            } else if (resultadoGeo) {
                await exportarExcelGeo(registros, resultadoGeo.gruposFinales, nombreArchivo);
            }
            showToast('Se exportaron las tablas de manera exitosa.', 'success');
        } catch (err: any) {
            showToast('Hubo un error al exportar las tablas a Excel: ' + err.message, 'error');
        }
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MethodCard icon="📁" label="Importar de Excel" isActive={metodo === 'excel'} onClick={() => handleMetodoChange('excel')} />
                <MethodCard icon="⌨️" label="Introducir Datos (Manual)" isActive={metodo === 'manual'} onClick={() => handleMetodoChange('manual')} />
            </div>

            <input ref={fileInputRef} type="file" accept=".xls,.xlsx" onChange={handleImportarArchivo} className="hidden" />

            {metodo === 'excel' && registros.length === 0 && (
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                    <button onClick={handleImportarClick} className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                        Selecciona archivo (.xls / .xlsx)
                    </button>
                    <p className="text-xs text-gray-400">Columnas esperadas: <code className="bg-gray-100 px-1 rounded">Clave Productor</code>, <code className="bg-gray-100 px-1 rounded">Datos</code></p>
                </div>
            )}

            {metodo === 'manual' && registros.length === 0 && (
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                    {!mostrarPromptManual ? (
                        <button onClick={handleIntroducirDatos} className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                            Introducir Datos
                        </button>
                    ) : (
                        <div className="flex items-end gap-3">
                            <div>
                                <label className="block mb-1 text-sm text-gray-600">Cantidad de elementos a registrar</label>
                                <input type="number" value={numElementosManual} onChange={(e) => setNumElementosManual(e.target.value)} className="w-40 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" min={1} />
                            </div>
                            <button onClick={handleCrearTablaManual} className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-800 text-sm">Crear tabla</button>
                        </div>
                    )}
                </div>
            )}

            {registros.length > 0 && (
                <div className="space-y-4 fade-in">
                    <div className="flex justify-between items-center flex-wrap gap-3">
                        <h3 className="font-semibold text-gray-800">Datos ({registros.length} elementos)</h3>
                        <div className="flex items-end gap-3">
                            <div>
                                <label className="block mb-1 text-xs text-gray-600">Grupos finales</label>
                                <input type="number" value={gruposFinalesTexto} onChange={(e) => setGruposFinalesTexto(e.target.value)} className="w-20 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" min={1} />
                            </div>
                            <button onClick={handleCalcularIntervalos} className="bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium">
                                Calcular Intervalos
                            </button>
                            {calculoListo && (
                                <button onClick={handleExportar} className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-800 text-sm">
                                    Exportar a Excel
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 border-b border-gray-200">
                        <button onClick={() => setActiveTab('datos')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'datos' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Datos</button>
                        {esDyH && (
                            <button onClick={() => setActiveTab('calculados')} disabled={!calculoListo} className={`px-4 py-2 text-sm font-medium disabled:opacity-40 ${activeTab === 'calculados' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Valores calculados</button>
                        )}
                        <button onClick={() => setActiveTab('grupoFinal')} disabled={!calculoListo} className={`px-4 py-2 text-sm font-medium disabled:opacity-40 ${activeTab === 'grupoFinal' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Grupo final</button>
                    </div>

                    {activeTab === 'datos' && (
                        <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg shadow-sm">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                                    <tr>
                                        <th className="px-6 py-3 w-1/2">Clave Productor</th>
                                        <th className="px-6 py-3 w-1/2">Datos</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {registros.map((r, idx) => (
                                        <tr key={idx} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-2">
                                                <input type="text" value={r.clave} disabled={metodo === 'excel'} onChange={(e) => handleRegistroChange(idx, 'clave', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                            </td>
                                            <td className="px-6 py-2">
                                                <input type="number" value={isNaN(r.dato) ? '' : r.dato} disabled={metodo === 'excel'} onChange={(e) => handleRegistroChange(idx, 'dato', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'calculados' && esDyH && resultadoDyH && (
                        <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg shadow-sm">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3">Límite inferior</th>
                                        <th className="px-4 py-3">Límite superior</th>
                                        <th className="px-4 py-3">Frecuencia</th>
                                        <th className="px-4 py-3">Raíz cuadrada</th>
                                        <th className="px-4 py-3">Raíz frecuencia (acumulada)</th>
                                        <th className="px-4 py-3">Grupo final</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {resultadoDyH.intervalos.map((iv, idx) => (
                                        <tr key={idx} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-4 py-2">{formatoDatosMostrados(iv.limiteInferior)}</td>
                                            <td className="px-4 py-2">{formatoDatosMostrados(iv.limiteSuperior)}</td>
                                            <td className="px-4 py-2">{iv.frecuencia}</td>
                                            <td className="px-4 py-2">{formatoDatosMostrados(iv.raizFrecuencia)}</td>
                                            <td className="px-4 py-2">{formatoDatosMostrados(iv.raizFrecuenciaAcumulada)}</td>
                                            <td className="px-4 py-2 font-semibold text-blue-700">{iv.grupoFinal}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'grupoFinal' && gruposFinales && (
                        <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg shadow-sm">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                                    <tr>
                                        <th className="px-6 py-3 w-1/3">Clave Productor</th>
                                        <th className="px-6 py-3 w-1/3">Datos</th>
                                        <th className="px-6 py-3 w-1/3">Grupo final</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {gruposFinales.map((g, idx) => (
                                        <tr key={idx} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-3 font-medium text-gray-900">{g.clave}</td>
                                            <td className="px-6 py-3">{formatoDatosMostrados(g.dato)}</td>
                                            <td className="px-6 py-3 font-semibold text-blue-700">{g.grupoFinal}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {calculoListo && valores && (
                <div className="mt-8 p-6 bg-white border border-gray-200 rounded-xl shadow-lg fade-in">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Resumen de la Estratificación</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-gray-500">Número de elementos</p>
                            <p className="font-bold text-gray-800">{valores.numeroElementos}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-gray-500">Dato mayor</p>
                            <p className="font-bold text-gray-800">{formatoDatosMostrados(valores.datoMayor)}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-gray-500">Dato menor</p>
                            <p className="font-bold text-gray-800">{formatoDatosMostrados(valores.datoMenor)}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-gray-500">Rango (R)</p>
                            <p className="font-bold text-gray-800">{formatoDatosMostrados(valores.rango)}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-gray-500">Número de intervalos (k)</p>
                            <p className="font-bold text-gray-800">{formatoDatosMostrados(valores.numeroIntervalos)}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-gray-500">Amplitud de intervalos (C)</p>
                            <p className="font-bold text-gray-800">{formatoDatosMostrados(valores.amplitudIntervalos)}</p>
                        </div>
                        {esDyH && mostrarAmplitudGrupos(valores.coeficienteAsimetria) && resultadoDyH && (
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-gray-500">Amplitud de Grupos</p>
                                <p className="font-bold text-gray-800">{formatoDatosMostrados(resultadoDyH.amplitudGrupos)}</p>
                            </div>
                        )}
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-gray-500">Elementos por grupo</p>
                            <p className="font-bold text-gray-800">{cadenaElementosPorGrupo}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-gray-500">Coeficiente de Asimetría</p>
                            <p className="font-bold text-gray-800">{valores.ca}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-gray-500">Técnica Utilizada</p>
                            <p className="font-bold text-gray-800">{esDyH ? 'Dalenius y Hodges' : 'Geométrica'}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 sm:col-span-2">
                            <p className="text-gray-500 mb-1">Rangos{esDyH ? ' (Fre. Acum)' : ''}</p>
                            {/* cadenaRangos ya viene como HTML (<br>) igual que en el Java original */}
                            <p className="font-bold text-gray-800" dangerouslySetInnerHTML={{ __html: (cadenaRangos ?? '').replace(/<html>|<\/html>/g, '') }} />
                        </div>
                    </div>
                </div>
            )}

            <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={hideToast} />
        </div>
    );
}