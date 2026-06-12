export type AnovaModelKey = 
    | 'DCA'
    | 'DCA_DR'
    | 'DBA'
    | 'DBA_DF'
    | 'DCL'
    | 'DCL_DF'
    | 'BIF_DCA'
    | 'BIF_DBA'
    | 'PD_DCA'
    | 'PD_DBA';

export interface AnovaModel {
    key: AnovaModelKey;
    shortName: string;
    fullName: string;
}

export const ANOVA_MODELS: AnovaModel[] = [
    {
      key: 'DCA',
      shortName: 'DCA',
      fullName: 'Diseño completamente al azar'
    },
    {
      key: 'DCA_DR',
      shortName: 'DCA diferentes repeticiones',
      fullName: 'Diseño completamente al azar con diferentes repeticiones'
    },
    {
      key: 'DBA',
      shortName: 'DBA',
      fullName: 'Diseño de bloques al azar'
    },
    {
      key: 'DBA_DF',
      shortName: 'DBA dato faltante',
      fullName: 'Diseño de bloques al azar con dato faltante'
    },
    {
      key: 'DCL',
      shortName: 'DCL',
      fullName: 'Diseño de cuadrado latino',
    },
    {
      key: 'DCL_DF',
      shortName: 'DCL dato faltante',
      fullName: 'Diseño de cuadrado latino con dato faltante',
    },
    {
      key: 'BIF_DCA',
      shortName: 'Bifactorial-DCA',
      fullName: 'Diseño bifactorial en DCA',
    },
    {
      key: 'BIF_DBA',
      shortName: 'Bifactorial-DBA',
      fullName: 'Diseño bifactorial en DBA',
    },
    {
      key: 'PD_DCA',
      shortName: 'Parcelas divididas-DCA',
      fullName: 'Parcelas divididas en DCA',
    },
    {
      key: 'PD_DBA',
      shortName: 'Parcelas divididas-DBA',
      fullName: 'Parcelas divididas en DBA',
    },
];