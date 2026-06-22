'use client';

import { useState } from 'react';
import MethodCard from '../MethodCard';
import { calcularMediaPonderada } from "../../utils/estadisticaCalculator";
import { parseMediaPonderadaFile } from '../../utils/fileParser';
import { useToast } from '../../hooks/useToast';
import Toast from '../Toast';

interface DataRow {
    id: string;
    valor: string;
    peso: string;
}

export default function MediaPonderadaInterface() {
    const [method, setMethod] = useState<'manual' | 'excel' | null>(null);
    const [numDatos, setNumDatos] = useState('');
    const { toast, showToast, hideToast } = useToast();
    
    const [tableData, setTableData] = useState<DataRow[]>([]);
    const [isTableGenerated, setIsTableGenerated] = useState(false);
    const [resultado, setResultado] = useState<number | null>(null);

    const handleGenerateTable = () => {
        const n = parseInt(numDatos);
        if (isNaN(n) || n <= 0) {
            showToast("Ingresa un número de datos válido (mayor a 0).", "error");
            return;
        }

        const newData = Array.from({ length: n }, (_, i) => ({
            id: `row-${i + 1}`,
            valor: '',
            peso: ''
        }));

        setTableData(newData);
        setIsTableGenerated(true);
        setResultado(null);
    };

    const handleInputChange = (id: string, field: 'valor' | 'peso', value: string) => {
        setTableData(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
    };

    const handleMethodChange = (newMethod: 'manual' | 'excel') => {
        setMethod(newMethod);
        setIsTableGenerated(false);
        setTableData([]);
        setResultado(null);
    };

    const calcular = () => {
        try {
            const hasEmpty = tableData.some(row => row.valor.trim() === '' || row.peso.trim() === '');
            if (hasEmpty) {
                showToast("Llena todos los campos de Valor y Peso.", "error");
                return;
            }

            const valores = tableData.map(r => parseFloat(r.valor));
            const pesos = tableData.map(r => parseFloat(r.peso));

            const res = calcularMediaPonderada(valores, pesos);
            setResultado(res);
            showToast("Cálculo completado.", "success");
        } catch (error: any) {
            showToast(error.message || "Error en el cálculo.", "error");
        }
    };

    return (
        <div className="space-y-8 fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MethodCard icon="📁" label="Cargar datos (Excel/CSV)" isActive={method === 'excel'} onClick={() => handleMethodChange('excel')} />
                <MethodCard icon="⌨️" label="Introducir datos (Manual)" isActive={method === 'manual'} onClick={() => handleMethodChange('manual')} />
            </div>

            {method === 'excel' && (
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="block font-medium text-gray-700 mb-2">Selecciona un archivo Excel/CSV:</label>
                    <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onClick={(e) => (e.currentTarget.value = '')}
                        onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                                const extractedData = await parseMediaPonderadaFile(file);
                                setTableData(extractedData.map(row => ({
                                    id: row.id,
                                    valor: row.valor === null ? '' : String(row.valor),
                                    peso: row.peso === null ? '' : String(row.peso)
                                })));
                                setNumDatos(extractedData.length.toString());
                                setIsTableGenerated(true);
                                setMethod('manual');
                                setResultado(null);
                                showToast("Datos cargados correctamente.", "success");
                            } catch (error: any) {
                                showToast(error.message, "error");
                            }
                        }}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700"
                    />
                    <p className="text-xs text-gray-500 mt-2">Columnas esperadas: <code className="bg-gray-200 px-1 rounded">Valor (x) | Peso (w)</code></p>
                </div>
            )}

            {method === 'manual' && !isTableGenerated && (
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="block mb-2 text-sm text-gray-700 font-medium">¿Cuántos pares de datos ingresarás?</label>
                    <input
                        type="number"
                        value={numDatos}
                        onChange={(e) => setNumDatos(e.target.value)}
                        className="w-full sm:w-1/2 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        placeholder="Ej. 5"
                        min={1}
                    />
                    <button onClick={handleGenerateTable} className="mt-3 block bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 text-sm">
                        Generar Tabla
                    </button>
                </div>
            )}

            {method === 'manual' && isTableGenerated && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800">Datos Ingresados ({tableData.length})</h3>
                        <button onClick={() => setIsTableGenerated(false)} className="text-sm text-blue-600 hover:underline">Reiniciar</button>
                    </div>

                    <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 w-1/2">Valor (x)</th>
                                    <th className="px-6 py-3 w-1/2">Peso o Frecuencia (w)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tableData.map(row => (
                                    <tr key={row.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-2">
                                            <input type="number" value={row.valor} onChange={(e) => handleInputChange(row.id, 'valor', e.target.value)} className="w-full p-2 border rounded-md" placeholder="0.0" />
                                        </td>
                                        <td className="px-6 py-2">
                                            <input type="number" value={row.peso} onChange={(e) => handleInputChange(row.id, 'peso', e.target.value)} className="w-full p-2 border rounded-md" placeholder="0.0" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button onClick={calcular} className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 font-medium">
                            Calcular Media Ponderada
                        </button>
                    </div>
                </div>
            )}

            {resultado !== null && (
                <div className="mt-6 p-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-xl shadow-sm fade-in flex flex-col sm:flex-row justify-between items-center">
                    <div>
                        <p className="text-sm text-blue-800 font-semibold uppercase tracking-wider mb-1">Resultado Final</p>
                        <h3 className="text-3xl font-bold text-blue-900">Media Ponderada = {resultado.toFixed(4)}</h3>
                    </div>
                    <span className="text-5xl mt-4 sm:mt-0 opacity-50">⚖️</span>
                </div>
            )}

            <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={hideToast} />
        </div>
    );
}