'use client';

import { useState } from 'react';
import Link from "next/link";

import { ESTDESC_MODELS, EstDescModelKey } from "../data/estDescModels";
import SidebarButton from "@/components/SidebarButton";
import EmptyState from "@/components/EmptyState";
import AboutEscDesc from './aboutEstDesc'
import MediaPonderadaInterface from '@/components/estdesc/MediaPonderadaInterface';
import EstadisticaDescriptivaInterface from '@/components/estdesc/EstadisticaDescriptivaInterface';
import ModuleLayout from '@/components/moduleLayout';

export default function EstDescPage() {
    const [activeKey, setActiveKey] = useState<EstDescModelKey | 'ABOUT'>('MP')

    const renderContent = () => {
        switch (activeKey) {
            case 'MP': return <MediaPonderadaInterface/>;
            case 'EstDesc': return <EstadisticaDescriptivaInterface/>;
            case 'ABOUT': return <AboutEscDesc/>;
            default: 
                const activeModel = ESTDESC_MODELS.find(m => m.key === activeKey);
                return <EmptyState modelName={activeModel?.fullName || 'Módulo'} />;
        }
    };

    return (
        <ModuleLayout
            title="EstDesc"
            models={ESTDESC_MODELS}
            activeKey={activeKey as string}
            onKeyChange={(key) => setActiveKey(key as EstDescModelKey | 'ABOUT')}
            aboutLabel='Acerca de Est Desc.'
        >
            {renderContent()}
        </ModuleLayout>
    );
}