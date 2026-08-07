'use client'

import { useState } from 'react';
import Link from "next/link";

import { EFF_MODELS, EffRelatModelKey } from '../data/effRelatModels';
import EmptyState from '@/components/EmptyState';
import SidebarButton from '@/components/SidebarButton';
import AboutEffRelat from './aboutEffRelat';
import ModuleLayout from '@/components/moduleLayout';

export default function EffRelatPage() {
    const [activeKey, setActiveKey] = useState<EffRelatModelKey | 'ABOUT'>('ER_DBA_DCA');

    const renderContent = () => {
        switch (activeKey) {
            case 'ABOUT': return <AboutEffRelat/>;
            default: 
                const activeModel = EFF_MODELS.find(m => m.key === activeKey);
                return <EmptyState modelName={activeModel?.fullName || 'Módulo'}/>;
        }
    };

    return (
        <ModuleLayout
            title="EffRelat"
            models={EFF_MODELS}
            activeKey={activeKey as string}
            onKeyChange={(key) => setActiveKey(key as EffRelatModelKey | 'ABOUT')}
            aboutLabel="Acerca de Eff Relat."
        >
            {renderContent()}
        </ModuleLayout>
    )
}