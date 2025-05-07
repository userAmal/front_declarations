import { Declaration } from "./declaration";

export class AutreDette {
    isSelected: boolean;
    id?: number;
    creancier?: string;
    montant?: number;
    pathJustificatif?: string;
    autresPrecisions?: string; 
    dateCreation?: Date;
    declaration?: Declaration;
    isEdit: boolean;
    fileName?: string;
    fileType?: string;
    fileDownloadUri?: string;
    fileData?: Blob;
  }