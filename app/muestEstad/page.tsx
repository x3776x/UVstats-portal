'use client';

import { useState } from 'react';
import Link from "next/link";

import EmptyState from '@/components/EmptyState';
import SidebarButton from '@/components/SidebarButton';
import AboutMuestEstad from './aboutMuestEstad';

export default function MuestEstadPage() {
    const [activeKey, setActiveKey] = useState<'ABOUT'>('ABOUT');

    return(
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">

            <aside className="w-full md:w-72 bg-white border-r border-gray-200 shadow-sm">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <Link href="/" className="text-sm text-blue-600 hover:underline md:hidden">
                        &larr; Volver
                    </Link>
                    <h2 className="text-xl font-bold text-gray-800">Muest. Estad</h2>
                </div>

                <nav className="flex overflow-x-auto md:flex-col p-4 gap-2 md:overflow-visible">
                    {/*Models*/}
                     
                </nav>

                <div className="p-4 mt-auto border-t border-gray-200 hidden md:block">
                    <button
                        onClick={() => setActiveKey('ABOUT')}
                        className={`w-full text-left px-4 py-2 text-sm rounded-md transition-colors $ (
                        setActiveKey === 'ABOUT'
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100)`}>
                        ℹ Acerca de Eff Relat.
                    </button>
                </div>
            </aside>

            <main className="flex-1 p-6 md:p-10">
                <div className="mb-6 hidden md:block">
                    <Link href="/" className="text-sm text-blue-600 hover:underline">
                        &larr; Volver al portal
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-sm border-gray-200 p-6 md:p-8">
                    {activeKey === 'ABOUT' && <AboutMuestEstad/>}

                    {!['ABOUT'].includes(activeKey)}
                </div>
            </main>
        </div>
    )
}