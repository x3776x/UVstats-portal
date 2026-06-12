'use client';

import { useState } from "react";
import MethodCard from "../MethodCard";
import { calculateDCADR, AnovaResult } from "@/utils/anovaCalculator";

interface DataRow {
    id: string;
    totalDatos: number;
    tratamiento: string;
    produccion: string;
}

export default function DCADRInterface() {
    const [ method, setMethod ] = useState<'manual' | 'excel' | null>(null);
    const [ totalDatos, setTotalDatos ] = useState('');
    const [ resultados, setResultados ] = useState<AnovaResult | null>(null);
    
    // Table
    const [ tableData, setTableData ] = useState<DataRow[]>([]);
    const [ isTableGenerated, setIsTableGenerated ] = useState(false);

    // Generate table based on user input
    const handleGenerateTable = () => {
        const total = parseInt(totalDatos);

        if (isNaN(total) || total <= 0) {
            alert("Ingresa un valor mayor a 0");
            return;
        }

        const newData: DataRow[] = [];
        for (let i = 1; i <= total; i++) {
            newData.push({
                id: `row-${i}`,
                totalDatos: total,
                tratamiento: '',
                produccion: '',
            });
        }

        setTableData(newData);
        setIsTableGenerated(true);
    };

    const handleInputChange = (id: string, field: 'tratamiento' | 'produccion', value: string) => {
        setTableData(prevData =>
            prevData.map(row => 
                row.id === id ? { ...row, [field]: value } : row
            )
        );
    };

    const handleMethodChange = (newMethod: 'manual' | 'excel') => {
        setMethod(newMethod);
        setIsTableGenerated(true);
        setTableData([]);
    };

    return (
        <div className="space-y-8">
            {/* Method selection */ }
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MethodCard
                    icon="📁"
                    label="Cargar datos (Excel/CSV)"
                    isActive={method === 'excel'}
                    onClick={() => handleMethodChange('excel')}
                />
                <MethodCard
                    icon="⌨️"
                    label="Introducir datos (Manual)"
                    isActive={method === 'manual'}
                    onClick={() => handleMethodChange('manual')}
                />
            </div>

            {/* excel */ }
            
            { /* Manual */ }
            {method === 'manual' && !isTableGenerated && (
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                    <h3 className="font-semibold text-gray-800"> Parametros </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 text-sm text-gray-600">
                                Total de datos
                            </label>
                            <input
                                type="number"
                                value={totalDatos}
                                onChange={(e) => setTotalDatos(e.target.value)}
                                className="w-full p-2 border boder-gray-300 rounder-md 
                                            focus:ring-blue-500 focus:outline-none"
                                placeholder="Ej. 3"
                                min={1}
                            />
                        </div> 
                    </div>
                    <button onClick={handleGenerateTable}
                        className="mt-2 bg-blue-600 text-white px-5 py-2 rounded-md
                        hover:bg-blue-700 transition-colors text-sm font-medium w-full
                        sm:w-auto"
                    >
                        Generar tabla
                    </button>
                </div>
            )}

            { /* table */ }
            {method === 'manual' && isTableGenerated && (
                <div className="space-y-4 fade-in">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800">
                            Ingresa total de datos ({totalDatos})
                        </h3>
                        <button onClick={() => setIsTableGenerated(false)}
                            className="text-sm text-blue-600 hover:underline">
                            Cambiar parametros
                        </button>
                    </div>

                    { /* scrollable container 4 table */ }
                    <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg
                        shadow-sm">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                                    <tr>
                                        {/* Changed header from Repetición to Tratamiento */}
                                        <th scope="col" className="px-6 py-3 w-1/2">Tratamiento</th>
                                        <th scope="col" className="px-6 py-3 w-1/2">Producción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData.map((row) => (
                                        <tr key={row.id} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-3">
                                                <input
                                                    type="number"
                                                    value={row.tratamiento}
                                                    onChange={(e) => handleInputChange(row.id, 'tratamiento', e.target.value)}
                                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                    placeholder="Ej. 1"
                                                />
                                            </td>
                                            <td className="px-6 py-2">
                                                <input
                                                    type="number"
                                                    value={row.produccion}
                                                    onChange={(e) => handleInputChange(row.id, 'produccion', e.target.value)}
                                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                    placeholder="0.00"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-end pt-4 border-t">
                            <button className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors font-medium shadow-sm"
                                onClick={() => {
                                    try {
                                        // 1. Check for empty fields
                                        const hasEmptyFields = tableData.some(row => row.tratamiento === '' || row.produccion === '');
                                        if (hasEmptyFields) {
                                            alert("Por favor, llena todos los campos de Tratamiento y Producción.");
                                            return;
                                        }

                                        // 2. Format the data to ensure Produccion is a number
                                        const formattedData = tableData.map(row => ({
                                            tratamiento: row.tratamiento,
                                            produccion: parseFloat(row.produccion)
                                        }));

                                        // 3. Check if there are at least 2 unique treatments
                                        const uniqueTreatments = new Set(formattedData.map(d => d.tratamiento));
                                        if (uniqueTreatments.size < 2) {
                                            alert("Se requieren al menos 2 tratamientos diferentes para calcular el ANOVA.");
                                            return;
                                        }

                                        // 4. Calculate
                                        const result = calculateDCADR(formattedData);
                                        setResultados(result);

                                    } catch (error) {
                                        console.error(error);
                                        alert("Ocurrió un error en el cálculo. Verifica los datos ingresados.");
                                    }
                                }}>
                                Calcular ANOVA
                            </button>
                        </div>
                </div>
            )}

            {/* Results */}
            {resultados && (
                <div className="mt-8 p-6 bg-white border border-gray-200 rounded-xl shadow-lg fade-in">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Tabla ANOVA (DCA - Diferentes Repeticiones)</h3>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-700 border-collapse">
                            <thead className="bg-blue-50 text-blue-900 border-b-2 border-blue-200">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Fuente de Variación</th>
                                    <th className="px-4 py-3 font-semibold text-right">GL</th>
                                    <th className="px-4 py-3 font-semibold text-right">SC</th>
                                    <th className="px-4 py-3 font-semibold text-right">CM</th>
                                    <th className="px-4 py-3 font-semibold text-right">F Calculada</th>
                                    <th className="px-4 py-3 font-semibold text-right">F (0.05)</th>
                                    <th className="px-4 py-3 font-semibold text-right">F (0.01)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium">Tratamientos</td>
                                    <td className="px-4 py-3 text-right">{resultados.glTratamientos}</td>
                                    <td className="px-4 py-3 text-right">{resultados.scTratamientos.toFixed(4)}</td>
                                    <td className="px-4 py-3 text-right">{resultados.cmTratamientos.toFixed(4)}</td>
                                    <td className="px-4 py-3 text-right font-bold text-blue-600">{resultados.fCalculada.toFixed(4)}</td>
                                    <td className="px-4 py-3 text-right text-gray-500">{resultados.fCritico05.toFixed(4)}</td>
                                    <td className="px-4 py-3 text-right text-gray-500">{resultados.fCritico01.toFixed(4)}</td>
                                </tr>
                                <tr className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium">Error Experimental</td>
                                    <td className="px-4 py-3 text-right">{resultados.glError}</td>
                                    <td className="px-4 py-3 text-right">{resultados.scError.toFixed(4)}</td>
                                    <td className="px-4 py-3 text-right">{resultados.cmError.toFixed(4)}</td>
                                    <td className="px-4 py-3 text-right">-</td>
                                    <td className="px-4 py-3 text-right">-</td>
                                    <td className="px-4 py-3 text-right">-</td>
                                </tr>
                                <tr className="bg-gray-50 font-bold border-t-2 border-gray-200">
                                    <td className="px-4 py-3">Total</td>
                                    <td className="px-4 py-3 text-right">{resultados.glTotal}</td>
                                    <td className="px-4 py-3 text-right">{resultados.scTotal.toFixed(4)}</td>
                                    <td className="px-4 py-3 text-right">-</td>
                                    <td className="px-4 py-3 text-right">-</td>
                                    <td className="px-4 py-3 text-right">-</td>
                                    <td className="px-4 py-3 text-right">-</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                            <p className="text-sm text-blue-800 font-semibold mb-1">Decisión Estadística:</p>
                            <p className="text-lg text-blue-900 font-bold">{resultados.conclusion}</p>
                        </div>
                        <div className="mt-2 sm:mt-0 text-right">
                            <p className="text-xs text-blue-600 font-semibold">Valor P exacto:</p>
                            <p className="text-sm font-mono text-blue-800">{resultados.pValue.toExponential(4)}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}