'use client';

import { useState } from "react";

import EmptyState from "@/components/EmptyState";
import AboutGEGasolinas from "./aboutGeGasolinas";
import ModuleLayout from "@/components/moduleLayout";
import GeGasInterface from "@/components/geGas/geGasInterface";

type GEGasKey = 'MAIN' | 'ABOUT';

export default function GEGasPage() {
    const [activeKey, setActiveKey] = useState<GEGasKey>('MAIN');

    const renderContent = () => {
        switch (activeKey) {
            case 'MAIN': return <GeGasInterface/>;
            case 'ABOUT': return <AboutGEGasolinas/>;
            default: 
                return <EmptyState modelName="Módulo"/>
        }
    };

    return (
        <ModuleLayout
            title="GE Gasolinas"
            models={[]}
            activeKey={activeKey}
            onKeyChange={(key) => setActiveKey(key as GEGasKey)}
            aboutLabel="Acerca de GE Gasolinas"
        >
            {renderContent()}
        </ModuleLayout>
    )
}