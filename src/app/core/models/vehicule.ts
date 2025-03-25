import { Declaration } from "./declaration";
import { Vocabulaire } from "./vocabulaire";

export interface Vehicule {
    id?: number;
    designation: Vocabulaire;
    marque: Vocabulaire;
    immatriculation: string;
    anneeAcquisition: number;
    valeurAcquisition: number;
    etatGeneral: Vocabulaire;
    dateCreation: string; 
    isSynthese: boolean;
    idDeclaration: Declaration;
    isEdit: boolean;  

  }