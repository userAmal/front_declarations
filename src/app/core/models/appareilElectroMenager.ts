import { Declaration } from "./declaration";
import { Vocabulaire } from "./vocabulaire";


export class AppareilElectroMenager {
    isSelected: boolean;
    id?: number;
    designation?: Vocabulaire; 
    anneeAcquisition?: Date; 
    valeurAcquisition?: number; 
    etatGeneral?: Vocabulaire; 
    dateCreation?: string;  
    declaration?: Declaration; 
    isEdit: boolean; 
    fileName?: string;
    fileType?: string;
    fileDownloadUri?: string;
    fileData?: Blob;
}

