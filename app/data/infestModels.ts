export type InfEstModelKey =
| 'UNA_MEDIA'
| 'DOS_MEDIAS'
| 'UNA_PROP' 
| 'DOS_PROP';

export interface InfEstModel {
    key: InfEstModelKey;
    shortName: string;
    fullName: string;
}

export const INFEST_MODELS: InfEstModel[] = [
    {
        key: 'UNA_MEDIA',
        shortName: '1 Media',
        fullName: 'Inferencia para una media'
    },
    {
        key: 'DOS_MEDIAS',
        shortName: '2 Medias',
        fullName: 'Inferencia para dos medias'
    },
    {
        key: 'UNA_PROP',
        shortName: '1 Proporcion',
        fullName: 'Inferencia para una proporcion'
    },
    {
        key: 'DOS_PROP',
        shortName: '2 Proporciones',
        fullName: 'Inferencia para dos proporciones'
    }
];