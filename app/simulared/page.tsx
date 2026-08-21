'use client';

import { useState } from "react";

import EmptyState from "@/components/EmptyState";
import ModuleLayout from "@/components/moduleLayout";
import AboutSimRed from "./aboutSimulaRed";

type SimRedKey = "MAIN" | "ABOUT";

export default function SimRedPage() {
    const [activeKey, setActiveKey] = useState<SimRedKey>('MAIN');

    const renderContent = () => {
        switch (activeKey) {
            case 'MAIN': return <AboutSimRed/>
            case 'ABOUT': return <AboutSimRed/>
            default:
                return <EmptyState modelName='Módulo'/>
        }
    };

    return (
        <ModuleLayout
            title="SIMULARED"
            models={[]}
            activeKey={activeKey}
            onKeyChange={(key) => setActiveKey(key as SimRedKey)}
            aboutLabel='Acerca de SIMULARED'
        >
            {renderContent()}
        </ModuleLayout>
    )
}