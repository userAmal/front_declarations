import { Assujetti } from "./assujetti";
import { TypeDeclaration } from "./typedeclaration";


// Interfaces (à ajouter en haut du fichier ou dans un fichier séparé)

export class Declaration {
    id?: number;
    dateCreation?: Date;
    dateValidation?: Date;
    typeDeclaration?: TypeDeclaration;
    etatDeclaration?: string;
    assujetti?: Assujetti;
    salaireMensuel?: number;
    numeroDeclaration?: number;
    numeroRapportProvisoir?: string;
    datePlanificationDelibere?: Date;
}