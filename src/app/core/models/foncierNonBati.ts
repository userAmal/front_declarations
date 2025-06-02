import { Declaration } from "./declaration";
import { Vocabulaire } from "./vocabulaire";

export class FoncierNonBati {
  isSelected: boolean;
  id?: number;
  nature: Vocabulaire;
  modeAcquisition: Vocabulaire;
  ilot: string;
  lotissement: string;
  superficie: string; // Changed from number to string to match Java entity
  localite: string;
  localisation: string;
  titrePropriete: string;
  dateAcquis: Date;
  valeurAcquisFCFA: number;
  coutInvestissement: number; // Note: Java uses coutInvestissements (plural)
  dateCreation: Date;
  declaration: Declaration;
  isEdit: boolean;
  fileName?: string;
  fileType?: string;
  fileDownloadUri?: string;
  fileData?: Blob; // Note: Java uses byte[] but we keep Blob for Angular
  
  // New fields from Java entity
  typeTerrain: Vocabulaire;
}