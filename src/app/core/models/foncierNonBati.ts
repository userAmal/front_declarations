import { Declaration } from "./declaration";

import { Vocabulaire } from "./vocabulaire";

export class FoncierNonBati {

  isSelected: boolean;
  id?: number;
  nature: Vocabulaire;
  modeAcquisition: Vocabulaire;
  ilot: string;
  lotissement: string;
  superficie: number;
  localite: string;
  localisation: string
  titrePropriete: string;
  dateAquis: Date;
  valeurAcquisFCFA: number;
  coutInvestissement: number;
  dateCreation: Date;
  declaration: Declaration;
  isEdit: boolean;

}

