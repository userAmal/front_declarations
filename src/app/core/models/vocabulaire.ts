import { TypeVocabulaire } from "./typeVocabulaire";

export class Vocabulaire {
    isSelected: boolean;
    id?: number;
    code?: string;
    libelle?: string;
    typevocabulaire?: TypeVocabulaire;
    isEdit: boolean;

}

export const VocabulaireColumns = [
    {
        key: 'isSelected',
        type: 'isSelected',
        label: '',
    },
    {
        key: 'code',
        type: 'text',
        label: 'Code',
        required: true,
    },
    {
        key: 'libelle',
        type: 'text',
        label: 'Libelle',
        required: true,
    },
    {
        key: 'isEdit',
        type: 'isEdit',
        label: '',
    },
];