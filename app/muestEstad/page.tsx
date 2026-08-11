'use client';

import { useState } from 'react';

import EmptyState from '@/components/EmptyState';
import AboutMuestEstad from './aboutMuestEstad';
import ModuleLayout from '@/components/moduleLayout';
import { MUEST_MODELS, MuestEstadModelKey } from '../data/muestEstadModels';
import MASInterface from '@/components/muestEstad/masInterface';
import MSInterface from '@/components/muestEstad/MSInterface';
import MAEInterface from '@/components/muestEstad/MAEInterface';
import MCInterface from '@/components/muestEstad/MCInterface';


export default function MuestEstadPage() {
    const [activeKey, setActiveKey] = useState<MuestEstadModelKey | 'ABOUT'>('MAS');

    const renderContent = () => {
        switch (activeKey) {
            case 'MAS': return <MASInterface/>;
            case 'MS': return <MSInterface/>;
            case 'MAE': return <MAEInterface/>;
            case 'MC': return <MCInterface/>;
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
            onKeyChange={(key) => setActiveKey(key as MuestEstadModelKey | 'ABOUT')}
            aboutLabel="Acerca de Muest. Estad."
        >
            {renderContent()}
        </ModuleLayout>
    );
}