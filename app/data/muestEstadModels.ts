export type MuestEstadModelKey = 
    | 'PLACEHOLDER';

export interface MuestEstadModel {
    key: MuestEstadModelKey;
    shortName: string;
    fullName: string;
}

export const MUEST_MODELS: MuestEstadModel[] = [
    {
        key: 'PLACEHOLDER',
        shortName: 'PLHR',
        fullName: 'Ejemplo'
    },
];