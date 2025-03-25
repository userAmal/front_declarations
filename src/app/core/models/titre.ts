import { Declaration } from "./declaration";

export class Titre {
    isSelected: boolean;
    id?: number;
    designationNatureAction?: string;
    valeurEmplacement?: number;
    emplacement?: string;
    autrePrecision?: string;
    dateCreation?: Date;
    declaration?: Declaration; 
    isEdit: boolean;
} 

