'use client';

import { useState } from 'react';

import { ANOVA_MODELS, AnovaModelKey } from '../data/anovaModels';
import ModuleLayout from '@/components/moduleLayout';
import EmptyState from '../../components/EmptyState';
import DCAInterface from '../../components/anova/DCAInterface';
import DCADRInterface from '../../components/anova/DCADRInterface';
import DBAInterface from '@/components/anova/DBAInterface';
import DBAFaltanteInterface from '@/components/anova/DBAFaltanteInterface';
import DCLInterface from '@/components/anova/DCLInterface';
import BifactorialDCAInterface from '@/components/anova/BifactorialDCAInterface';
import BifactorialDBAInterface from '@/components/anova/BifactorialDBAInterface';
import DCLFaltanteInterface from '@/components/anova/DCLFaltanteInterface';
import PDDCAInterface from '@/components/anova/PDDCAInterface';
import PDDBAInterface from '@/components/anova/PDDBAInterface';
import AboutAnova from './aboutAnova';

export default function AnovaPage() {
    const [activeKey, setActiveKey] = useState<AnovaModelKey | 'ABOUT'>('DCA');

    const renderContent = () => {
        switch (activeKey) {
            case 'DCA': return <DCAInterface />;
            case 'DCA_DR': return <DCADRInterface />;
            case 'DBA': return <DBAInterface/>;
            case 'DBA_DF': return <DBAFaltanteInterface/>;
            case 'DCL': return <DCLInterface/>;
            case 'DCL_DF': return <DCLFaltanteInterface/>;
            case 'BIF_DCA': return <BifactorialDCAInterface/>;
            case 'BIF_DBA': return <BifactorialDBAInterface/>;
            case 'PD_DCA': return <PDDCAInterface/>;
            case 'PD_DBA': return <PDDBAInterface/>;
            case 'ABOUT': return <AboutAnova />;
            default: 
                const activeModel = ANOVA_MODELS.find(m => m.key === activeKey);
                return <EmptyState modelName={activeModel?.fullName || 'Módulo'} />;
        }
    };

    return (
        <ModuleLayout
            title="ANOVA"
            models={ANOVA_MODELS}
            activeKey={activeKey as string}
            onKeyChange={(key) => setActiveKey(key as AnovaModelKey | 'ABOUT')}
            aboutLabel="Acerca de ANOVA"
        >
            {renderContent()}
        </ModuleLayout>
    );
}