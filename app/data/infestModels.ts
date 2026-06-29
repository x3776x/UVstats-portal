export type InfEstModelKey =
| 'IC'
| 'PdH';

export interface InfEstModel {
    key: InfEstModelKey;
    shortName: string;
    fullName: string;
}

export const INFEST_MODELS: InfEstModel[] = [
    {
        key: 'IC',
        shortName: 'IC',
        fullName: 'Intervalos de confianza'
    },
    {
        key: 'PdH',
        shortName: 'PdH',
        fullName: 'Prueba de hipotesis'
    },
];