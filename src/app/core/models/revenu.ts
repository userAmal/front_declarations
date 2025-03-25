import { Declaration } from "./declaration";
import { Vocabulaire } from "./vocabulaire";

export class Revenu {

    id?: number;
    typeRevenu?: Vocabulaire;
    entite?:Vocabulaire;
    valeurRevenu?: number;
    isEdit: boolean;
    dateCreation?: Date
    declaration?: Declaration




}
