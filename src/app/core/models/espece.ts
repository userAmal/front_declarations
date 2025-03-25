import { Vocabulaire } from './vocabulaire';
import { Declaration } from "./declaration";

export class Espece{
    isSelected: boolean;
    id?: number;
    monnaie?: number;
    devise?: Vocabulaire;
    tauxChange?: number;
    montantFCFA?: number;
    montantTotalFCFA?: number;
    dateEspece?: Date;
    dateCreation?: Date;
    declaration?: Declaration; 
    isEdit: boolean;  
}     
