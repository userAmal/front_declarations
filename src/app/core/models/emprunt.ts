import { Declaration } from './declaration';
import { Vocabulaire } from './vocabulaire';

export class Emprunt{
    isSelected: boolean;
    id?: number;
    institutionFinanciere?: string;
    numeroCompte?: string;
    typeEmprunt?: Vocabulaire;
    montantEmprunt?: number;
    typeCompte?:Vocabulaire;
    datePremiereEcheance?:Date;
    montantEnCours?:number;
    dateDernierEcheance?:Date;
    dateCreation?: Date;
    declaration?: Declaration;
    isEdit: boolean;  
    tableauAmortissement?: string;
}
