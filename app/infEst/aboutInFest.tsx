'use client';

export default function AboutInfEst() {
    return (
        <div className="max-w-3xl space-y-8 fade-in">
            <div className="bg-wihte p-8 rounded-xl shadow-sm border border=gray-200">
                <div className="flex items-center space-x-3 mb-6 border-b pb-4">
                    <span className="text-3xl">ℹ️</span>
                    <h2 className="text-2xl font-bold text-gray-900">Acerca del módulo Inferencia Estadistica</h2>
                </div>

                <div className="space-y-6 text-gray-600 leading-relaxed">
                    <p>
                        El módulo de Inferencia Estadistica calcula intervalos de confianza y realiza pruebas de hipotesis para la media aritmetica y la proporcion para uno o dos grupos.
                    </p>
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 mt-8">
                        <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-4">Créditos de Desarrollo</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Autores Originales */}
                            <div>
                                <h4 className="font-semidold text-blue-800 mb-2 border-b border-blue-200 pb-1">Desarrollo Original (Java)</h4>
                                <ul>                            
                                    <li>• [Dr. Juan Ramirez - jruiz@uv.mx]</li>
                                    <li>• [Mtro. Christian Pérez Salazar - chperez@uv.mx]</li>
                                    <li>• [Dr. Iván Hernández - ivan.ruiz@uv.es]</li>
                                    <li>• [Mtro. Zoylo Morales Romero - zmorales@uv.mx]</li>
                                    <li>• [Axel Panama Velazquez - ]</li>
                                    <li>• [Bryan Alexis Jimenez Santiago - ]</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold text-blue-800 mb-2 border-b border-blue-200 pb-1">Migración y Desarrollo Web</h4>
                                <ul className="space-y-1 text-sm text-blue-900/80">
                                    <li className="font-medium">• [Abraham Vazquez - abrahamvquinto@gmail.com]</li>
                                    <li className="text-xs mt-2 italic text-blue-800/60">
                                        Refactorización a TypeScript, React y Next.js.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}