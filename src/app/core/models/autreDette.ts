import { Declaration } from "./declaration";

export class AutreDette{
    isSelected: boolean;
    id?: number;
    creancier?: string;
    montant?: number;
    pathJustificatif?: string;
    autresPrecision?: string;
    dateCreation?: Date;
    declaration?: Declaration;
    isEdit: boolean;
}
