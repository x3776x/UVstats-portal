'use client';

import { useState } from 'react';
import Link from "next/link";

import { ESTDESC_MODELS, EstDescModelKey } from "../data/estDescModels";
import SidebarButton from "@/components/SidebarButton";
import EmptyState from "@/components/EmptyState";
import AboutEscDesc from './aboutEstDesc'
import MediaPonderadaInterface from '@/components/estdesc/MediaPonderadaInterface';

export default function EstDescPage() {
    const [activeKey, setActiveKey] = useState<EstDescModelKey | 'ABOUT'>('MP');

    const activeModel = ESTDESC_MODELS.find((m) => m.key === activeKey);

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-full md:w-72 bg-white border-r border-gray-200 shadow=sm">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <Link href="/" className="text-sm text-blue-600 hover:underline md:hidden">
                        &larr; Volver
                    </Link>
                    <h2 className="text-xl font-bold text-gray-800">Estadistica descriptiva</h2>
                </div>

                <nav className="flex overflow-x-auto md:flex-col p-4 gap-2 md:overflow-visible">
                    {ESTDESC_MODELS.map((model) => (
                        <SidebarButton
                            key={model.key}
                            label={model.shortName}
                            isActive={activeKey === model.key}
                            onClick={() => setActiveKey(model.key)}
                        />
                    ))}
                </nav>

                <div className="p-4 mt-auto border-t border-gray-200 hidden md:block">
                    <button
                        onClick={() => setActiveKey('ABOUT')}
                        className={`w-full text-left px-4 py-2 text-sm rounded-md transition-colors ${
                            activeKey === 'ABOUT'
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                    >
                        ℹ️ Acerca de EstDesc
                    </button>
                </div>
            </aside>

            {/* main content */}
            <main className="flex-1 p-6 md:p-10">
                <div className="mb-6 hidden:block">
                    <Link href="/" className="text-sm text-blue-600 hover:underline">
                        &larr; Volver al portal
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
                    {/* Header titles */}
                    {activeModel && (
                        <div className="mb-6 border-b pb-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-1">
                                {activeModel.shortName}
                            </p>
                            <h1 className="text-2xl font-bold text-gray 900">
                                {activeModel.fullName}
                            </h1>
                        </div>
                    )}
                    {/*TODO: interfaces */}
                    {activeKey === 'MP' && <MediaPonderadaInterface />}
                    {activeKey === 'EstDesc'}

                    {activeKey === 'ABOUT' && <AboutEscDesc/>}

                    {!['MP', 'EstDesc', 'ABOUT'].includes(activeKey) && (
                        <EmptyState modelName={activeModel?.fullName || 'Modulo'} />
                    )}
                </div>
            </main>
        </div>
    );
}