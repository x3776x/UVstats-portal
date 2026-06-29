'use client';

import { useState } from "react";
import Link from 'next/link';

import {INFEST_MODELS, InfEstModelKey } from '../data/infestModels';
import SidebarButton from "@/components/SidebarButton";
import EmptyState from "@/components/EmptyState";
import AboutInfEst from "./aboutInFest";
import UnaMediaInterface from "@/components/inferencia/UnaMediaInterface";

export default function InfEstPage() {
    const [activeKey, setActiveKey] = useState<InfEstModelKey | 'ABOUT'> ('IC');

    const activeModel = INFEST_MODELS.find((m) => m.key === activeKey);

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">

            <aside className="w-full md:w-72 bg-white border-r border-gray-200 shadow-sm">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <Link href="/" className="text-sm text-blue-600 hover:underline md:hidden">
                        &larr; Volver
                    </Link>
                    <h2 className="text-xl font-bold text-gray-800">INFEST</h2>
                </div>

                <nav className="flex overflow-x-auto md:flex-col p-4 gap-2 md:overflow-visible">
                    {INFEST_MODELS.map((model) => (
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
                        ℹ️ Acerca de InfEst
                    </button>
                </div>
            </aside>

            {/* Main Content */}
      <main className="flex-1 p-6 md:p-10">
        <div className="mb-6 hidden md:block">
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            &larr; Volver al portal
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          
          {activeModel && (
            <div className="mb-6 border-b pb-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-1">
                {activeModel.shortName}
              </p>
              <h1 className="text-2xl font-bold text-gray-900">
                {activeModel.fullName}
              </h1>
            </div>
          )}

          {/* Render interface or WIP placeholder */}
          {activeKey === 'IC' && <UnaMediaInterface />}

          {activeKey === 'ABOUT' && <AboutInfEst />}
          
          {!['IC', 'ABOUT'].includes(activeKey) && (
             <EmptyState modelName={activeModel?.fullName || 'Módulo'} />
          )}
        </div>
      </main>
        </div>
    )
}