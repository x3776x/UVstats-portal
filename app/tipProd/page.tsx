'use client';


import { useState } from 'react';

import EmptyState from '@/components/EmptyState';
import AboutTipProd from './aboutTipProd';
import ModuleLayout from '@/components/moduleLayout';
import TiProInterface from '@/components/tipProd/TipProdInterface';

type TipProdKey = "MAIN" | "ABOUT";

export default function TipProdPage() {
    const [activeKey, setActiveKey] = useState<TipProdKey>('MAIN');

    const renderContent = () => {
        switch (activeKey) {
            case 'MAIN': return <TiProInterface/>;
            case 'ABOUT': return <AboutTipProd/>;
            default:
                return <EmptyState modelName='Módulo'/>
        }
    };

    return (
        <ModuleLayout
            title="Tipología de productores"
            models={[]}
            activeKey={activeKey}
            onKeyChange={(key) => setActiveKey(key as TipProdKey)}
            aboutLabel='Acerca de Tipología de productores'
        >
            {renderContent()}
        </ModuleLayout>
    );
}