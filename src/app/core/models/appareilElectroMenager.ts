import { Declaration } from "./declaration";
import { Vocabulaire } from "./vocabulaire";


export class AppareilElectroMenager {
    isSelected: boolean;
    id?: number;
    designation?: string; 
    anneeAcquisition?: Date; 
    valeurAcquisition?: number; 
    etatGeneral?: Vocabulaire; 
    dateCreation?: string;  
    declaration?: Declaration; 
    isEdit: boolean; 
}

