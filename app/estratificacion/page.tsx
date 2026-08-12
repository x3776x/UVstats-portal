'use client';

import { useState } from 'react';

import EmptyState from '@/components/EmptyState';
import AboutEstratificacion from './aboutEstratificacion';
import ModuleLayout from '@/components/moduleLayout';
import EstratificacionInterface from '@/components/estratificacion/estratificacionInterface';

type EstratificacionKey = 'MAIN' | 'ABOUT';

export default function EstratificacionPage() {
    const [activeKey, setActiveKey] = useState<EstratificacionKey>('MAIN');

    const renderContent = () => {
        switch (activeKey) {
            case 'MAIN': return <EstratificacionInterface />;
            case 'ABOUT': return <AboutEstratificacion />;
            default:
                return <EmptyState modelName="Módulo" />;
        }
    };

    return (
        <ModuleLayout
            title="Estratificación"
            models={[]}
            activeKey={activeKey}
            onKeyChange={(key) => setActiveKey(key as EstratificacionKey)}
            aboutLabel="Acerca del módulo Estratificación."
        >
            {renderContent()}
        </ModuleLayout>
    );
}