import { Vocabulaire } from "./vocabulaire";

export class Assujetti {
    id?: number;
    numero?: string;
    civilite?: Vocabulaire;
    nom?:string;
    prenom?:string;
    email?: string;
    contactTelephonique?: string;
    administration?: Vocabulaire;
    institution?: Vocabulaire;
    fonction?: Vocabulaire;
    matricule?: string;
    datePriseService?: string;
    dateCessationFonction?: string;
    referenceActeNomination?: string;
    justifPriseEnCharge?:string;
    fileBase64?:string;
    etat?:string;
}
