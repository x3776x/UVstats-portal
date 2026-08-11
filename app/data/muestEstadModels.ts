export type MuestEstadModelKey = 
    | 'MAS'
    | 'MAE'
    | 'MS'
    | 'MC';

export interface MuestEstadModel {
    key: MuestEstadModelKey;
    shortName: string;
    fullName: string;
}

export const MUEST_MODELS: MuestEstadModel[] = [
    {
        key: 'MAS',
        shortName: 'M.A.S.',
        fullName: 'Muestreo Aleatorio Simple'
    },
    {
        key: 'MAE',
        shortName: 'M.A.E.',
        fullName: 'Muestreo Aleatorio Estratificado'
    },
    {
        key: 'MS',
        shortName: 'M.S.',
        fullName: 'Muestreo Sistemático'
    },
    {
        key: 'MC',
        shortName: 'M.C.',
        fullName: 'Muestreo por Conglomerados'
    }
];