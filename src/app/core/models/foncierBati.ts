import { Declaration } from './declaration';
import { Vocabulaire } from './vocabulaire';

export class FoncierBati {
  isSelected: boolean;
  id?: number;
  nature?: Vocabulaire;
  anneeConstruction?: Date;
  modeAcquisition?: Vocabulaire;
  referencesCadastrales?: string;
  superficie?: number;
  localite?: string;
  localisation?:string
  typeUsage?: Vocabulaire;
  coutAcquisitionFCFA?: number;
  coutInvestissements?: number;
  dateCreation: Date;
  declaration: Declaration;
  isEdit: boolean;



}

