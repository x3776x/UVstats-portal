'use client';

import { useState } from 'react';
import { EFF_MODELS, EffRelatModelKey } from '../data/effRelatModels';

import ModuleLayout from '@/components/moduleLayout';
import EficienciaRelativaInterface from '@/components/effRelat/eficienciaRelativaInterface';
import AboutEffRelat from './aboutEffRelat';

export default function EficienciaPage() {
    const [activeKey, setActiveKey] = useState<EffRelatModelKey | 'ABOUT'>('ER_DBA_DCA');

    const renderContent = () => {
        if (activeKey === 'ABOUT') return <AboutEffRelat/>;
        
        return <EficienciaRelativaInterface modelKey={activeKey as EffRelatModelKey} />;
    };

    return (
        <ModuleLayout
            title="Eficiencia Relativa"
            models={EFF_MODELS}
            activeKey={activeKey}
            onKeyChange={(key) => setActiveKey(key as EffRelatModelKey | 'ABOUT')}
            aboutLabel="Acerca de Eficiencia Relativa"
        >
            {renderContent()}
        </ModuleLayout>
    );
}