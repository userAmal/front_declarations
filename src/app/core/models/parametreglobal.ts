export class ParametreGlobal {

    isSelected: boolean;
    id?: number;
    code?: string;
    libelle?: string;
    valChar?: string;
    valNum?: number;
    description?: string;
    isEdit: boolean;
}
export const ParametreGlobalColumns = [
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
        key: 'description',
        type: 'text',
        label: 'Description',
        required: true,
    },
    {
        key: 'valNum',
        type: 'text',
        label: 'Valeur Numérique',
        required: true,
    },
    {
        key: 'valChar',
        type: 'text',
        label: 'Valeur Caractère',
        required: true,
    },

    {
        key: 'isEdit',
        type: 'isEdit',
        label: '',
    },
];