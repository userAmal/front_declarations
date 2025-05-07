import { Declaration } from "./declaration";

export class Creance{
    isSelected: boolean;
    id?: number;
    debiteur?: string;
    montant?: number;
    autresPrecision?: string;  
    declaration?: Declaration; 
    isEdit: boolean;   
    fileName?: string;
    fileType?: string;
    fileDownloadUri?: string;
    fileData?: Blob;
}   
