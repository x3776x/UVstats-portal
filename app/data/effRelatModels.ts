export type EffRelatModelKey = 
    | 'ER_DBA_DCA'
    | 'ER_FB'
    | 'ER_CB';

export interface EffRelatModel {
    key: EffRelatModelKey;
    shortName: string;
    fullName: string;
}

export const EFF_MODELS: EffRelatModel[] = [
    {
        key: 'ER_DBA_DCA',
        shortName: 'ER_DBA_DCA',
        fullName: 'Eficiencia relativa para DBA vs DCA'
    },
    {
        key: 'ER_FB',
        shortName: 'ER_FB',
        fullName: 'Eficiencia relativa para DCL cuando las filas son consideradas bloques'
    },
    {
        key: 'ER_CB',
        shortName: 'ER_CB',
        fullName: 'Eficiencia relativa para DCL cuando las columnas son consideradas bloques'
    },
]