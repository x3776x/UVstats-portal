'use client';

import { useState } from "react";

import { INFEST_MODELS, InfEstModelKey } from '../data/infestModels';
import EmptyState from "@/components/EmptyState";
import AboutInfEst from "./aboutInFest";
import UnaMediaInterface from "@/components/inferencia/UnaMediaInterface";
import DosMediasInterface from "@/components/inferencia/DosMediasInterface";
import UnaProporcionInterface from "@/components/inferencia/UnaProporcionInterface";
import DosProporcionesInterface from "@/components/inferencia/DosProporcionesInterface";
import ModuleLayout from "@/components/moduleLayout";

export default function InfEstPage() {
    const [activeKey, setActiveKey] = useState<InfEstModelKey | 'ABOUT'>('UNA_MEDIA');

    const renderContent = () => {
        switch (activeKey) {
            case 'UNA_MEDIA': return <UnaMediaInterface/>;
            case 'DOS_MEDIAS': return <DosMediasInterface/>;
            case 'UNA_PROP': return <UnaProporcionInterface/>;
            case 'DOS_PROP': return <DosProporcionesInterface/>;
            case 'ABOUT': return <AboutInfEst/>;
            default: 
                const activeModel = INFEST_MODELS.find(m => m.key === activeKey);
                return <EmptyState modelName={activeModel?.fullName || 'Módulo'}/>
        }
    };

    return (
        <ModuleLayout
            title="InfEst"
            models={INFEST_MODELS}
            activeKey={activeKey as string}
            onKeyChange={(key) => setActiveKey(key as InfEstModelKey | 'ABOUT')}
            aboutLabel="Acerca de InfEst"
        >
            {renderContent()}
        </ModuleLayout>
    )
}