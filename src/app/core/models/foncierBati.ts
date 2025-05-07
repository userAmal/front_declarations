import { Declaration } from './declaration';
import { Vocabulaire } from './vocabulaire';
export interface FoncierBati {
  id?: number;
  nature: Vocabulaire;
  anneeConstruction: number | Date; // Accepte les deux types
  modeAcquisition: Vocabulaire;
  referencesCadastrales: string;
  superficie: string;
  localis: Vocabulaire;
  typeUsage: Vocabulaire;
  coutAcquisitionFCFA: number;
  coutInvestissements: number;
  dateCreation: Date;
  isSynthese: boolean;
  idDeclaration: Declaration;
  fileName?: string;
  fileType?: string;
  fileDownloadUri?: string;
  fileData?: Blob;
}

