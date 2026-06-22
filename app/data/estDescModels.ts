export type EstDescModelKey = 
        | 'MP'
        | 'EstDesc';

export interface EstDescModel {
    key: EstDescModelKey;
    shortName: string;
    fullName: string;
}

export const ESTDESC_MODELS: EstDescModel[] = [
    {
        key: 'MP',
        shortName: 'MP',
        fullName: 'Media ponderada'
    },
    {
        key: 'EstDesc',
        shortName: 'EstDesc',
        fullName: 'Estadistica descriptiva' 
    },
];