import { Declaration } from "./declaration";
import { Vocabulaire } from "./vocabulaire";


export class AutreBienDeValeur{
    isSelected: boolean;
    id?: number;
    designation?: string;
    localite?: string;
    anneeAcquis?: Date;
    valeurAcquisition?: number;
    autresPrecisions?: string;
    type?: Vocabulaire;
    poid?:number;
    dateCreation?: Date;
    declaration?: Declaration;
    isEdit: boolean;
}
