import { Declaration } from "./declaration";
import { Vocabulaire } from "./vocabulaire";

export class Revenu {
    id?: number;
    salaireMensuelNet?: number;
    autresRevenus?: Vocabulaire;
    dateCreation?: Date;
    idDeclaration?: Declaration;
    fileName?: string;
    fileType?: string;
    fileDownloadUri?: string;
    fileData?: Blob;
}
