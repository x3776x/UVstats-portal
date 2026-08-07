'use client';

import { useState } from 'react';

import EmptyState from '@/components/EmptyState';
import AboutMuestEstad from './aboutMuestEstad';
import ModuleLayout from '@/components/moduleLayout';
import { MUEST_MODELS, MuestEstadModelKey } from '../data/muestEstadModels';

export default function MuestEstadPage() {
    const [activeKey, setActiveKey] = useState<MuestEstadModelKey | 'ABOUT'>('PLACEHOLDER');

    const renderContent = () => {
        switch (activeKey) {
            
            case 'ABOUT': return <AboutMuestEstad/>;
            default:
                const activeModel = MUEST_MODELS.find(m => m.key === activeKey);
                return <EmptyState modelName={activeModel?.fullName || 'Módulo'}/>
        }
    };

    return (
        <ModuleLayout
            title="MuestEstad"
            models={MUEST_MODELS}
            activeKey={activeKey as string}
            onKeyChange={(key) => setActiveKey(key as 'ABOUT')}
            aboutLabel="Acerca de Muest. Estad."
        >
            {renderContent()}
        </ModuleLayout>
    );
}