'use client';

export default function AboutAnova() {
    return (
        <div className="max-w-3xl space-y-8 fade-in">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center space-x-3 mb-6 border-b pb-4">
                    <span className="text-3xl">ℹ️</span>
                    <h2 className="text-2xl font-bold text-gray-900">Acerca del Módulo ANOVA</h2>
                </div>

                <div className="space-y-6 text-gray-600 leading-relaxed">
                    <p>
                        El modulo de ANOVA realiza el analisis de varianza de los principales disenios experimentales y de tratamientos mediante modulos de efectos fijos con su correspondiente estimacion de un dato daltante y su comparacion de medias mediante la prueba de Tukey y con contrastes ortogonales y ademas evalua la eiciencia del dise;o experimental empleado mediante el calculo de eficiencia relativa.
                    </p>

                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 mt-8">
                        <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-4">Créditos de Desarrollo</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Autores Originales */}
                            <div>
                                <h4 className="font-semibold text-blue-800 mb-2 border-b border-blue-200 pb-1">Desarrollo Original (Java)</h4>
                                <ul className="space-y-1 text-sm text-blue-900/80">
                                    <li>• [Mtro. Christian Pérez Salazar - chperez@uv.mx]</li>
                                    <li>• [Dr. Juan Ramirez - jruiz@uv.mx]</li>
                                    <li>• [Mtra. Ana Luz Polo apolo@uv.mx]</li>
                                    <li>• [Dra. Gabriela Eréndira Hernández gabyerendira@yahoo.com</li>
                                    <li>• [Dr. Iván Hernández - ivan.ruiz@uv.es]</li>
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
    );
}