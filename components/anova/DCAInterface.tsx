'use client';

import { useState } from 'react';
import MethodCard from '../MethodCard';
import Toast from '../Toast';
import { useToast } from '@/hooks/useToast';
import { calculateDCA, AnovaResult } from '../../utils/anovaCalculator';
import { parseAnovaFile } from '../../utils/fileParser';

// 1. Define the shape of a single row of data
interface DataRow {
  id: string;
  tratamiento: number;
  repeticion: number;
  produccion: string;
}

export default function DCAInterface() {
    const [method, setMethod] = useState<'manual' | 'excel' | null>(null);
    const { toast, showToast, hideToast } = useToast();
    const [tratamientos, setTratamientos] = useState('');
    const [repeticiones, setRepeticiones] = useState('');
    const [resultados, setResultados ] = useState<AnovaResult | null>(null);
    
    // 2. New states for the table
    const [tableData, setTableData] = useState<DataRow[]>([]);
    const [isTableGenerated, setIsTableGenerated] = useState(false);

    // 3. Logic to generate the empty table based on user input
    const handleGenerateTable = () => {
        const t = parseInt(tratamientos);
        const r = parseInt(repeticiones);

        // Basic validation
        if (isNaN(t) || isNaN(r) || t <= 0 || r <= 0) {
            showToast("Por favor, ingresa valores válidos mayores a 0.", "error");
            return;
        }

        const newData: DataRow[] = [];
        for (let i = 1; i <= t; i++) {
            for (let j = 1; j <= r; j++) {
                newData.push({
                    id: `t${i}-r${j}`,
                    tratamiento: i,
                    repeticion: j,
                    produccion: '',
                });
            }
        }

        setTableData(newData);
        setIsTableGenerated(true);
    };

    // 4. Update specific row data when the user types in an input
    const handleInputChange = (id: string, value: string) => {
        setTableData(prevData => 
            prevData.map(row => 
                row.id === id ? { ...row, produccion: value } : row
            )
        );
    };

    // 5. Reset the table if the user changes the method
    const handleMethodChange = (newMethod: 'manual' | 'excel') => {
        setMethod(newMethod);
        setIsTableGenerated(false);
        setTableData([]);
    };

    return (
        <div className="space-y-8">
            {/* Method selection */}
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

            {/* Excel upload view */}
            {method === 'excel' && (
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                    <label className="block font-medium text-gray-700">
                        Selecciona un archivo:
                    </label>
                    
                    <input
                        type="file"
                        accept=".csv,.xlsx,.xls"

                        onClick={(e) => {
                            e.currentTarget.value = '';
                        }}

                        onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            try {
                                const extractedData = await parseAnovaFile(file);
                                
                                const formattedforUI = extractedData.map(row => ({
                                    ...row,
                                    produccion: row.produccion.toString()
                                }));

                                setTableData(formattedforUI);
                                
                                const maxTratamiento = Math.max(...extractedData.map(d => d.tratamiento));
                                const maxRepeticion = Math.max(...extractedData.map(d => d.repeticion));
                                setTratamientos(maxTratamiento.toString());
                                setRepeticiones(maxRepeticion.toString());
                                
                                setIsTableGenerated(true);
                                setMethod('manual');

                            } catch (error: any) {
                                showToast("${error.message}", "error");
                                e.target.value = ''; 
                            }
                        }}
                        className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0
                        file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                    <p className="text-xs text-gray-400">
                        El archivo debe no tener encabezados (o tenerlos solo en la fila 1).<br/>
                        Columna 1: <code className="bg-gray-100 px-1 rounded">Tratamiento</code>,{' '}
                        Columna 2: <code className="bg-gray-100 px-1 rounded">Producción</code>
                    </p>
                </div>
            )}

            {/* Manual input setup */}
            {method === 'manual' && !isTableGenerated && (
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                    <h3 className="font-semibold text-gray-800">Parámetros del diseño</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 text-sm text-gray-600">
                                Número de tratamientos
                            </label>
                            <input
                                type="number"
                                value={tratamientos}
                                onChange={(e) => setTratamientos(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Ej. 4"
                                min={1}
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm text-gray-600">
                                Número de repeticiones
                            </label>
                            <input
                                type="number"
                                value={repeticiones}
                                onChange={(e) => setRepeticiones(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Ej. 5"
                                min={1}
                            />
                        </div>
                    </div>
                    <button 
                        onClick={handleGenerateTable}
                        className="mt-2 bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium w-full sm:w-auto"
                    >
                        Generar tabla de datos
                    </button>
                </div>
            )}

            {/* The Generated Data Table */}
            {method === 'manual' && isTableGenerated && (
                <div className="space-y-4 fade-in">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800">
                            Ingresar Producción ({tratamientos} Tratamientos, {repeticiones} Repeticiones)
                        </h3>
                        <button 
                            onClick={() => setIsTableGenerated(false)}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            Cambiar parámetros
                        </button>
                    </div>

                    {/* Scrollable container for the table */}
                    <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg shadow-sm">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                                <tr>
                                    <th scope="col" className="px-6 py-3 w-1/3">Tratamiento</th>
                                    <th scope="col" className="px-6 py-3 w-1/3">Repetición</th>
                                    <th scope="col" className="px-6 py-3 w-1/3">Producción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tableData.map((row) => (
                                    <tr key={row.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-3 font-medium text-gray-900">
                                            Tratamiento {row.tratamiento}
                                        </td>
                                        <td className="px-6 py-3">
                                            Rep {row.repeticion}
                                        </td>
                                        <td className="px-6 py-2">
                                            <input
                                                type="number"
                                                value={row.produccion}
                                                onChange={(e) => handleInputChange(row.id, e.target.value)}
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
                        <button 
                            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors font-medium shadow-sm"
                            onClick={() => {
                                try {
                                    const formattedData = tableData.map(row => ({
                                        ...row,
                                        produccion: parseFloat(row.produccion) || 0 
                                    }));
                                    const t = parseInt(tratamientos);
                                    const r = parseInt(repeticiones);
                                    
                                    // Run the math!
                                    const result = calculateDCA(t, r, formattedData);
                                    
                                    // Save it to state so React can draw the table
                                    setResultados(result);

                                } catch (error) {
                                    console.error("Error en el cálculo:", error);
                                    showToast("Ocurrio un error al calcular. Verifica los datos.", "error");
                                }
                            }}
                        >
                            Calcular ANOVA
                        </button>
                    </div>
                </div>
            )}

            {/* The Results Table (Only shows if 'resultados' is not null) */}
            {resultados && (
                <div className="mt-8 p-6 bg-white border border-gray-200 rounded-xl shadow-lg fade-in">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Tabla ANOVA (DCA)</h3>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-700 border-collapse">
                            <thead className="bg-blue-50 text-blue-900 border-b-2 border-blue-200">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Fuente de Variación</th>
                                    <th className="px-4 py-3 font-semibold text-right">Grados de Libertad (GL)</th>
                                    <th className="px-4 py-3 font-semibold text-right">Suma de Cuadrados (SC)</th>
                                    <th className="px-4 py-3 font-semibold text-right">Cuadrado Medio (CM)</th>
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
            <Toast 
                message={toast.message} 
                type={toast.type} 
                isVisible={toast.isVisible} 
                onClose={hideToast} 
            />
        </div>
    );
}