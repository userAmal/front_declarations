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
  kilometrage: number;  // New field for mileage
  carburant: Vocabulaire; // New field for fuel type
  transmission: Vocabulaire; // New field for transmission type
  dateCreation: string;
  isSynthese: boolean;
  idDeclaration: Declaration;
  isEdit: boolean;
  fileName?: string;
  fileType?: string;
  fileDownloadUri?: string;
  fileData?: Blob;
}
