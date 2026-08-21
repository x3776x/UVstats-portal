'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/useToast';
import Toast from '../Toast';
import { calcularProyecciones, GasolinaRow, EtanolRow } from '@/utils/geGasCalculator';

export default function GeGasInterface() {
    const { toast, showToast, hideToast } = useToast();
    
    // Gasolina States
    const [anios, setAnios] = useState<number>(10);
    const [anioActual, setAnioActual] = useState<number>(new Date().getFullYear());
    const [prodDiaria, setProdDiaria] = useState<number | ''>('');
    const [crecimientoProd, setCrecimientoProd] = useState<number | ''>('');
    const [imporDiaria, setImporDiaria] = useState<number | ''>('');
    const [crecimientoImpor, setCrecimientoImpor] = useState<number | ''>('');

    // Etanol/Ha States
    const [sustitucionEtanol, setSustitucionEtanol] = useState<number | ''>('');
    const [hectareasDisponibles, setHectareasDisponibles] = useState<number | ''>('');
    const [precioDolar, setPrecioDolar] = useState<number | ''>('');
    const [precioGasolina, setPrecioGasolina] = useState<number | ''>('');
    const [litrosEtanol, setLitrosEtanol] = useState<number | ''>('');
    const [rendimientoCampo, setRendimientoCampo] = useState<number | ''>('');

    // Results
    const [resGasolina, setResGasolina] = useState<GasolinaRow[]>([]);
    const [resEtanol, setResEtanol] = useState<EtanolRow[]>([]);

    const handleCalcular = () => {
        if (!prodDiaria || !imporDiaria || !crecimientoImpor || !sustitucionEtanol || !precioDolar || !precioGasolina || !litrosEtanol || !rendimientoCampo || !hectareasDisponibles) {
            showToast('Por favor, llene todos los campos requeridos para realizar ambas proyecciones.', 'error');
            return;
        }

        try {
            const { gasolinas, etanoles } = calcularProyecciones(
                anios,
                anioActual,
                Number(prodDiaria),
                Number(imporDiaria),
                Number(crecimientoImpor),
                Number(sustitucionEtanol),
                Number(precioGasolina),
                Number(precioDolar),
                Number(litrosEtanol),
                Number(rendimientoCampo),
                Number(hectareasDisponibles)
            );
            
            setResGasolina(gasolinas);
            setResEtanol(etanoles);
            showToast('Proyecciones calculadas exitosamente.', 'success');
        } catch (error) {
            showToast('Error al calcular las proyecciones.', 'error');
        }
    };

    return (
        <div className="space-y-8">
            {/* Input Form Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gasolina Card */}
                <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm space-y-4">
                    <h3 className="font-bold text-lg border-b pb-2">Proyección de Gasolinas</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <label className="block text-gray-600 mb-1">Años de proyección</label>
                            <input type="number" value={anios} onChange={e => setAnios(Number(e.target.value))} className="w-full p-2 border rounded focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-gray-600 mb-1">Año actual</label>
                            <input type="number" value={anioActual} onChange={e => setAnioActual(Number(e.target.value))} className="w-full p-2 border rounded focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-gray-600 mb-1">Prod. diaria (barriles)</label>
                            <input type="number" value={prodDiaria} onChange={e => setProdDiaria(Number(e.target.value))} className="w-full p-2 border rounded focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-gray-600 mb-1">Import. diaria (barriles)</label>
                            <input type="number" value={imporDiaria} onChange={e => setImporDiaria(Number(e.target.value))} className="w-full p-2 border rounded focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-gray-600 mb-1">Crecimiento Prod. (%)</label>
                            <input type="number" value={crecimientoProd} onChange={e => setCrecimientoProd(Number(e.target.value))} className="w-full p-2 border rounded focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-gray-600 mb-1">Crecimiento Import. (%)</label>
                            <input type="number" value={crecimientoImpor} onChange={e => setCrecimientoImpor(Number(e.target.value))} className="w-full p-2 border rounded focus:ring-blue-500" />
                        </div>
                    </div>
                </div>

                {/* Etanol Card */}
                <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm space-y-4">
                    <h3 className="font-bold text-lg border-b pb-2">Parámetros de Etanol y Campo</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <label className="block text-gray-600 mb-1">Precio Dólar (MXN)</label>
                            <input type="number" value={precioDolar} onChange={e => setPrecioDolar(Number(e.target.value))} className="w-full p-2 border rounded focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-gray-600 mb-1">Precio Gasolina (MXN)</label>
                            <input type="number" value={precioGasolina} onChange={e => setPrecioGasolina(Number(e.target.value))} className="w-full p-2 border rounded focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-gray-600 mb-1">Sustitución Etanol (%)</label>
                            <input type="number" value={sustitucionEtanol} onChange={e => setSustitucionEtanol(Number(e.target.value))} className="w-full p-2 border rounded focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-gray-600 mb-1">Hectáreas disponibles</label>
                            <input type="number" value={hectareasDisponibles} onChange={e => setHectareasDisponibles(Number(e.target.value))} className="w-full p-2 border rounded focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-gray-600 mb-1">Litros Etanol / Ton.</label>
                            <input type="number" value={litrosEtanol} onChange={e => setLitrosEtanol(Number(e.target.value))} className="w-full p-2 border rounded focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-gray-600 mb-1">Ton. Caña / Ha (Rend.)</label>
                            <input type="number" value={rendimientoCampo} onChange={e => setRendimientoCampo(Number(e.target.value))} className="w-full p-2 border rounded focus:ring-blue-500" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button onClick={handleCalcular} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium">
                    Generar Proyecciones
                </button>
            </div>

            {/* Results Tables */}
            {resGasolina.length > 0 && (
                <div className="space-y-6 fade-in">
                    <h3 className="font-bold text-gray-800 text-lg">Proyección de Gasolina</h3>
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                        <table className="w-full text-sm text-right text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-center">Año</th>
                                    <th className="px-4 py-3">Consumo (B/D)</th>
                                    <th className="px-4 py-3">Consumo (B/A)</th>
                                    <th className="px-4 py-3">Import. (B/D)</th>
                                    <th className="px-4 py-3">Import. (B/A)</th>
                                    <th className="px-4 py-3">Consumo (Lts)</th>
                                    <th className="px-4 py-3">Import. (Lts)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resGasolina.map((r, i) => (
                                    <tr key={i} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-4 py-2 text-center font-medium">{r.anio}</td>
                                        <td className="px-4 py-2">{r.consumoDiario.toLocaleString('en-US', {maximumFractionDigits: 2})}</td>
                                        <td className="px-4 py-2">{r.consumoAnual.toLocaleString('en-US', {maximumFractionDigits: 2})}</td>
                                        <td className="px-4 py-2">{r.importacionDiaria.toLocaleString('en-US', {maximumFractionDigits: 2})}</td>
                                        <td className="px-4 py-2">{r.importacionAnual.toLocaleString('en-US', {maximumFractionDigits: 2})}</td>
                                        <td className="px-4 py-2">{r.consumoLts.toLocaleString('en-US', {maximumFractionDigits: 2})}</td>
                                        <td className="px-4 py-2">{r.importacionLts.toLocaleString('en-US', {maximumFractionDigits: 2})}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <h3 className="font-bold text-gray-800 text-lg mt-8">Proyección de Etanol y Hectáreas</h3>
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                        <table className="w-full text-sm text-right text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-center">Año</th>
                                    <th className="px-4 py-3">Consumo Nal. Gasolina (Lts)</th>
                                    <th className="px-4 py-3">Gasolina Sustituible</th>
                                    <th className="px-4 py-3">Ahorro ($USD)</th>
                                    <th className="px-4 py-3">Ha Necesarias</th>
                                    <th className="px-4 py-3">Ha Adicionales</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resEtanol.map((r, i) => (
                                    <tr key={i} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-4 py-2 text-center font-medium">{r.anio}</td>
                                        <td className="px-4 py-2">{r.consumoGasolina.toLocaleString('en-US', {maximumFractionDigits: 2})}</td>
                                        <td className="px-4 py-2">{r.gasolinaSustituible.toLocaleString('en-US', {maximumFractionDigits: 2})}</td>
                                        <td className="px-4 py-2 text-green-700 font-semibold">{r.ahorroDolares.toLocaleString('en-US', {maximumFractionDigits: 2})}</td>
                                        <td className="px-4 py-2">{r.haNecesarias.toLocaleString('en-US', {maximumFractionDigits: 2})}</td>
                                        <td className="px-4 py-2">{r.haAdicionales.toLocaleString('en-US', {maximumFractionDigits: 2})}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={hideToast} />
        </div>
    );
}