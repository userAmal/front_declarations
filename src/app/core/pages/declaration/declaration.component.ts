import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Animaux } from '../../models/animaux';
import { Vocabulaire } from '../../models/vocabulaire';
import { FoncierNonBati } from '../../models/foncierNonBati';
import { Declaration } from '../../models/declaration';
import { MeubleMeublant } from '../../models/meubleMeublant';
import { AppareilElectroMenager } from '../../models/appareilElectroMenager';
import { DisponibiliteEnBanque } from '../../models/disponibiliteEnBanque';
import { Emprunt } from '../../models/emprunt';
import { Espece } from '../../models/espece';
import { Creance } from '../../models/creance';
import { Revenu } from '../../models/revenu';
import { Vehicule } from '../../models/vehicule';
import { AutreBienDeValeur } from '../../models/autreBienDeValeur';
import { AutreDette } from '../../models/autreDette';
import { Titre } from '../../models/titre';
import { DeclarationService } from '../../services/declaration.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TypeVocabulaire } from '../../models/typeVocabulaire';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { formatDate } from '@angular/common';
// In main.ts or polyfills.ts
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { HttpEventType } from '@angular/common/http';
import { catchError, finalize, switchMap, take, tap } from 'rxjs/operators';
import { ConfirmationService, MessageService } from 'primeng/api';
import { animate, state, style, transition, trigger } from '@angular/animations';


registerLocaleData(localeFr);

@Component({
  selector: 'app-declaration',
  templateUrl: './declaration.component.html',
  styleUrls: ['./declaration.component.scss'],
  providers: [MessageService],
  animations: [
   
    
 
   
  ]
})

export class DeclarationComponent {
  declarationId: string | null = null;
  loading = true;
  
  error: string | null = null;
  declarationData: any = {
    assujetti: {
      code: '',
      nom: '',
      prenom: '',
      datePriseDeService: null
    },
    numeroDeclaration: '',
    typeDeclaration: ''
  };
  constructor(
    private declarationService: DeclarationService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
      private confirmationService: ConfirmationService

  ) {}


  ngOnInit(): void {
    this.loadTypeVocabulaires();
    console.log("Dans ngOnInit, declarationData:", this.declarationData);
    
    this.route.queryParams.subscribe(params => {
      console.log("Params reçus:", params);
      if (params['token']) {
        this.processToken();
      } else {
        this.processToken();
      }
    });
  }
 
  
  private processToken(): void {
    try {
      this.declarationService.getDeclarationByToken().subscribe(
        data => {
          this.declarationId = data.toString();
          console.log("ID de la déclaration:", this.declarationId);
          this.getDeclarationDetails();

        },
        error => {
          console.error("Erreur lors de la récupération de l'ID:", error);
          if (error.error) {
            console.error("Détails de l'erreur:", error.error);
          }
          this.error = "Impossible de valider votre accès. Veuillez vérifier le lien dans votre email.";
          this.loading = false;
        }
      );
      
    } catch (e) {
      console.error("Exception:", e);
      this.error = "Token manquant dans l'URL. Veuillez utiliser le lien complet fourni dans votre email.";
      this.loading = false;
    }
  }

  getDeclarationDetails(): void {
    if (!this.declarationId) {
      console.error("ID de déclaration manquant");
      this.error = "Identifiant de déclaration manquant";
      this.loading = false;
      return;
    }
  
    this.declarationService.getDeclarationDetails(this.declarationId).subscribe(
      data => {
        console.log("Données reçues:", data);
        this.declarationData = {
          ...data,
          numeroDeclaration: data.numeroDeclaration || this.declarationId
        };
        this.loading = false;
        // Charger les fonciers bâtis une fois les détails chargés
        this.loadFonciersBati();
        this.loadFonciersNonBati();
        this.loadMeublesMeublants();
        this.loadAppareilsFromDeclaration();
        this.loadAnimaux();
this.loadEmprunts();
 this.loadEspeces();
 this.loadTitresForDeclaration();

 this.loadCreancesByDeclaration();
 this.loadRevenusByDeclaration();
 this.loadVehiculesByDeclaration();
//this.loadAutresBiensByDeclaration();
this.loadDisponibilites();
      },
      error => {
        console.error("Erreur:", error);
        this.error = "Erreur de chargement";
        this.loading = false;
      }
    );
  }

  typeVocabulaires: TypeVocabulaire[] = [];
  modesAcquisition: Vocabulaire[] = [];
  naturesBien: Vocabulaire[] = [];
  localisations: Vocabulaire[] = [];
  usages: Vocabulaire[] = [];
  Modeanimale: Vocabulaire[] = [];  
  localiteanimalex: Vocabulaire[] = [];
  institutionFinanciere: Vocabulaire[] = [];
  typesBien: Vocabulaire[] = [];
  localites : Vocabulaire[] = [];
  autrePrecisions: Vocabulaire[] = [];
  autresPrecision: Vocabulaire[] = [];
  etatsGeneraux: Vocabulaire[] = [];
  designation: Vocabulaire[] = [];
  designationappareil: Vocabulaire[] = [];
  displayUploadDialog= false;
typesRevenu: Vocabulaire[] = [];
typesEmprunt: Vocabulaire[] = [];
precisionsTitres: Vocabulaire[] = [];
emplacementsTitres: Vocabulaire[] = [];
naturesTitres: Vocabulaire[] = [];
autresPrecisionsCreances: Vocabulaire[] = [];
debiteursCreances: Vocabulaire[] = [];
carburant: Vocabulaire[] = [];
typesTransmission: Vocabulaire[] = [];
autresRevenus: Vocabulaire[] = [];

  loadTypeVocabulaires(): void {
      this.declarationService.getAllTypeVocabulaire().subscribe({
          next: (types: TypeVocabulaire[]) => {
              this.typeVocabulaires = types;
  
              const typesToLoad = [
                  { name: 'modesAcquisition', intitule: 'Mode d\'acquisition' },
                  { name: 'naturesBien', intitule: 'Nature de foncier bâti' },
                  { name: 'naturesNonBati', intitule: 'Nature foncier non bâti' },
                  { name: 'localisations', intitule: 'Localisation' },
                  { name: 'usages', intitule: 'Type d\'usage' },
                  { name: 'designation', intitule: 'Désignation meubles' },
                  { name: 'etatsGeneraux', intitule: 'État général meubles' },
                  { name: 'designationappareil', intitule: 'Désignation appareils' },
                  { name: 'localiteanimalex', intitule: 'localite animale' },
                  { name: 'Modeanimale ', intitule: 'Mode d\'acquisition animale ' },
                  { name: 'typesEmprunt', intitule: 'Type d\'emprunt' },
                  { name: 'typesCompte', intitule: 'Type de compte bancaire' },
                  { name: 'institutionFinanciere', intitule: 'Institutions financières' },
                  { name: 'naturesTitres', intitule: 'Nature des titres' },
                  { name: 'emplacementsTitres', intitule: 'Emplacement titres' },
                  { name: 'precisionsTitres', intitule: 'Autres précisions titres' },
                  { name: 'debiteursCreances', intitule: 'Débiteurs créances' },
                  { name: 'autresPrecisionsCreances', intitule: 'Autres précisions créances' },
                  { name: 'autresRevenus', intitule: 'Type de revenus' },
                  { name: 'entites', intitule: 'Entité' },
                  { name: 'designationsVehicule', intitule: 'Désignation véhicule' },
                  { name: 'marquesVehicule', intitule: 'Marque véhicule' },
                  { name: 'etatsVehicule', intitule: 'État général véhicule' },
                  { name: 'typesBien', intitule: 'Type de biens' },
                  { name: 'localites', intitule: 'Localité autres biens' },
                  { name: 'autrePrecisions', intitule: 'Autres précisions créances' } ,
                  { name: 'creanciers', intitule: 'Créanciers dettes' },
                  { name: 'justificatifs', intitule: 'Justificatifs dettes' },
                  { name: 'autresPrecision', intitule: 'Autres précisions créances' },
                  { name: 'banques', intitule: 'Banques' },
                    { name: 'carburant', intitule: 'carburant' },
    { name: 'typesTransmission', intitule: 'Type de transmission' } 
              ];

              typesToLoad.forEach(config => {
                const type = types.find(t => t.intitule === config.intitule);
                if (type) {
                    this.loadVocabulairesByType(type.id, config.name as keyof this);
                }
            });
            
          },
          error: (err) => console.error('Erreur chargement types', err)
      });
  }
  
  loadVocabulairesByType(typeId: number, target: keyof this): void {
    this.declarationService.getVocabulaireByType(typeId).subscribe({
        next: (vocabulaires: Vocabulaire[]) => {
            (this[target] as Vocabulaire[]) = vocabulaires;
        },
        error: (err) => console.error('Erreur chargement vocabulaires', err)
    });
}

  getIntitule(vocabulaire: Vocabulaire): string {
      return vocabulaire?.intitule || '';
  }

  saveDeclaration() {
    //this.saveFonciersNonBatiDeclaration();
    //this.saveFonciersBatiDeclaration();
    //this.saveMeublesMeublantsDeclaration();
    //this.saveAppareilsDeclaration();
    //this.saveAnimauxDeclaration();
    //this.saveEmpruntsDeclaration();
    //this.saveEspecesDeclaration();
    //this.saveTitresDeclaration();
    //this.saveCreancesDeclaration();
    //this.saveRevenusDeclaration();
    //this.saveVehiculesDeclaration();
    //this.saveAutresBiensDeclaration();
    //this.saveAutresDettes();
   //this.saveDisponibilitesDeclaration();
  }




  @ViewChild('fileUpload') fileUploadElement: ElementRef;
          foncierBatiTemp: any[] = [];
  selectedFonciers: any[] = [];
  tableRowFoncier: any = {};
  isDataModified = false;
  displayAddDialogfoncier = false;
  isAddingTableRow = false;

  uploadedFiles: any[] = [];
  isUploading = false;
  selectedFoncier: any = null;
  showUploadDialogForNewFoncier() {
    this.selectedFoncier = this.tableRowFoncier;
        if (this.fileUploadElement?.nativeElement) {
      this.fileUploadElement.nativeElement.value = '';
    }
    
    this.fileUploadElement?.nativeElement?.click();
  }
  showUploadForFoncierId: number | null = null; 


// Dans votre composant
modifyDocument(foncier: any, file: File) {
  if (!file) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Attention',
      detail: 'Veuillez sélectionner un fichier'
    });
    return;
  }

  this.isUploading = true;
  
  this.declarationService.uploadFoncierDocument(foncier.id, file)
    .pipe(
      finalize(() => {
        this.isUploading = false;
        this.resetFileInput();
      })
    )
    .subscribe({
      next: (response) => {
        foncier.fileName = response.fileName;
        foncier.fileType = response.fileType;
        foncier.fileDownloadUri = response.fileDownloadUri;
        foncier.hasDocument = true;
        
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Document mis à jour avec succès'
        });
        
        this.selectedFoncier = null;
      },
      error: (err) => {
        console.error('Erreur modification document:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Échec de la modification du document: ' + 
                (err.message || 'Erreur serveur')
        });
      }
    });
}
triggerFileUpload(foncier: any) {
  this.selectedFoncier = foncier;
  this.fileUploadElement.nativeElement.click();
}
    downloadDocument(foncier: any) {
    if (!foncier?.hasDocument) {
        this.showError('Aucun document disponible');
        return;
    }

    // Un seul message de chargement
    const loadingMsg = this.messageService.add({
        severity: 'info',
        summary: 'Téléchargement',
        detail: 'Préparation en cours...',
        key: 'download' // Utilisez une clé pour éviter les doublons
    });

    this.declarationService.downloadFoncierDocument(foncier.id)
        .pipe(
            take(1),
            finalize(() => this.messageService.clear('download'))
        )
        .subscribe({
            next: (blob) => {
                // Téléchargement du fichier...
                this.showSuccess('Téléchargement terminé');
            },
            error: (err) => {
                this.showError('Échec du téléchargement');
            }
        });
}
    private showError(detail: string) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: detail,
        life: 5000,
        closable: true
      });
    }
    
    private showSuccess(detail: string) {
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: detail,
        life: 3000
      });
    }
    
    private resetFileInput() {
      if (this.fileUploadElement?.nativeElement) {
        this.fileUploadElement.nativeElement.value = '';
      }
    }
    showUploadDialog(foncier: any) {
      this.selectedFoncier = foncier;
      this.fileUploadElement.nativeElement.click();
    }

submitted: boolean = false;
selectedFile: File = null;
currentFoncierForUpload: any = null;

handleDeleteAction() {
if (this.selectedFonciers.length > 0) {
  this.confirmDeleteSelected();
} else {
  this.confirmDeleteAll();
}
}

handleFileDrop(event: DragEvent): void {
event.preventDefault();
event.stopPropagation();

if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
  const file = event.dataTransfer.files[0];
  const validExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
  
  if (validExtensions.includes(fileExtension)) {
    this.selectedFile = file;
    
    if (this.currentFoncierForUpload) {
      this.currentFoncierForUpload.fileName = file.name;
    } else if (this.tableRowFoncier) {
      this.tableRowFoncier.fileName = file.name;
    }
    
    this.messageService.add({
      severity: 'success',
      summary: 'Fichier prêt',
      detail: `${file.name} est prêt à être uploadé`,
      life: 3000
    });
  } else {
    this.messageService.add({
      severity: 'error',
      summary: 'Format non supporté',
      detail: 'Seuls les fichiers PDF, DOC, DOCX, JPG, JPEG, PNG sont acceptés',
      life: 5000
    });
  }
}
}

selectedNature: any = null;
originalFoncierData: any[] = []; // Pour stocker les données originales

// Dans loadFonciersBati(), après avoir reçu les données:
loadFonciersBati() {
  if (!this.declarationData?.id) {
    console.error('ID de déclaration non disponible');
    return;
  }
  
  this.declarationService.getFonciersBatiByDeclaration(this.declarationData.id)
    .subscribe({
      next: (data) => {
        this.foncierBatiTemp = data.map(item => ({
          ...item,
          localisation: item.localis,
          coutAcquisition: item.coutAcquisitionFCFA,
          coutInvestissement: item.coutInvestissements,
          anneeConstruction: this.formatAnneeConstruction(item.anneeConstruction),
          editing: false,
          hasDocument: !!item.fileName
        }));
        
        this.originalFoncierData = [...this.foncierBatiTemp];
        this.isDataModified = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des fonciers bâtis', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les fonciers bâtis'
        });
      }
    });
}

  prepareFoncierForApi(foncier: any) {
    const annee = foncier.anneeConstruction instanceof Date ? 
                 foncier.anneeConstruction.getFullYear() : foncier.anneeConstruction;
    
    return {
      id: foncier.id > 0 ? foncier.id : null,
      nature: foncier.nature ? { id: foncier.nature.id || foncier.nature } : null,
      anneeConstruction: annee,
      modeAcquisition: foncier.modeAcquisition ? { id: foncier.modeAcquisition.id || foncier.modeAcquisition } : null,
      referencesCadastrales: foncier.referencesCadastrales,
      superficie: foncier.superficie,
      localis: foncier.localisation ? 
        { id: typeof foncier.localisation === 'object' ? foncier.localisation.id : foncier.localisation } : null,
      typeUsage: foncier.typeUsage ? { id: foncier.typeUsage.id || foncier.typeUsage } : null,
      coutAcquisitionFCFA: foncier.coutAcquisition,
      coutInvestissements: foncier.coutInvestissements || foncier.coutInvestissement || 0,
      dateCreation: foncier.dateCreation || new Date().toISOString().split('T')[0],
      isSynthese: foncier.isSynthese || false,
      idDeclaration: { id: this.declarationData.id },
      fileName: foncier.fileName,
      fileType: foncier.fileType,
      fileDownloadUri: foncier.fileDownloadUri
    };
  }
  filterByNature() {
    if (!this.selectedNature) {
      this.foncierBatiTemp = [...this.originalFoncierData];
      return;
    }
  
    this.foncierBatiTemp = this.originalFoncierData.filter(foncier => 
      foncier.nature && foncier.nature.id === this.selectedNature.id
    );
  }
 
  formatAnneeConstruction(annee: any): Date {
    if (typeof annee === 'number') {
      return new Date(annee, 0, 1);
    } else if (typeof annee === 'string' && /^\d+$/.test(annee)) {
      return new Date(parseInt(annee), 0, 1);
    }
    return annee;
  }
  
 
  
showAddFormDialog() {
    this.submitted = false; // Réinitialiser l'état de validation
    this.tableRowFoncier = {
        // Initialisez avec des valeurs par défaut si nécessaire
        anneeConstruction: new Date(),
        coutInvestissement: 0,
        superficie: 0
    };
    this.displayAddDialogfoncier = true;
}
  
  cancelAddFoncier() {
    this.displayAddDialogfoncier = false;
    this.tableRowFoncier = {};
  }
  
confirmAddFoncier() {
    if (!this.validateFoncier(this.tableRowFoncier)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez remplir tous les champs obligatoires'
      });
      return;
    }
    
    this.confirmationService.confirm({
      message: 'Êtes-vous sûr de vouloir ajouter ce foncier ?',
      header: 'Confirmation d\'ajout',
      accept: () => {
        this.addFoncier();
      }
    });
}

addFoncier() {
    const foncierForApi = this.prepareFoncierForApi(this.tableRowFoncier);
    
    this.declarationService.createFoncierBati(foncierForApi)
      .pipe(
        take(1),
        catchError(err => {
          console.error('Erreur création foncier', err);
          this.showError('Erreur lors de la création');
          return throwError(err);
        })
      )
      .subscribe({
        next: (response) => {
          const newFoncier = {
            ...this.tableRowFoncier,
            id: response.id,
            isNew: false,
            hasDocument: false
          };
          
          if (this.tableRowFoncier.file) {
            this.uploadNewFoncierDocument(response.id, this.tableRowFoncier.file, newFoncier);
          } else {
            this.foncierBatiTemp.push(newFoncier);
            this.displayAddDialogfoncier = false;
            this.tableRowFoncier = {};
            this.showSuccess('Foncier ajouté avec succès');
          }
        }
      });
}

uploadNewFoncierDocument(foncierID: number, file: File, newFoncier: any) {
    this.declarationService.uploadFoncierDocument(foncierID, file)
      .subscribe({
        next: (response) => {
          if (response) {
            newFoncier.hasDocument = true;
            newFoncier.fileName = response.fileName;
            newFoncier.fileType = response.fileType;
            newFoncier.fileDownloadUri = response.fileDownloadUri;
          }
          
          this.foncierBatiTemp.push(newFoncier);
          this.displayAddDialogfoncier = false;
          this.tableRowFoncier = {};
          
          // Retirez le messageService.add ici car il est déjà géré dans addFoncier
        },
        error: (err) => {
          console.error('Erreur lors du téléchargement du document', err);
          this.foncierBatiTemp.push(newFoncier);
          this.displayAddDialogfoncier = false;
          this.tableRowFoncier = {};
          
          this.messageService.add({
            severity: 'warning',
            summary: 'Attention',
            detail: 'Foncier ajouté, mais erreur lors du téléchargement du document'
          });
        }
      });
}
  
  confirmDeleteSingle(foncier: any) {
    this.confirmationService.confirm({
      message: 'Êtes-vous sûr de vouloir supprimer ce foncier ?',
      header: 'Confirmation de suppression',
      accept: () => {
        this.selectedFonciers = [foncier];
        this.archiveSelectedFoncier();
      }
    });
  }
  
  confirmDeleteAll() {
    if (this.foncierBatiTemp.length === 0) return;
    
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer tous les ${this.foncierBatiTemp.length} fonciers ?`,
      header: 'Confirmation de suppression totale',
      accept: () => {
        this.deleteAllFonciers();
      }
    });
  }
  
  deleteAllFonciers() {
    if (this.foncierBatiTemp.length === 0) return;
    
    const deletePromises = this.foncierBatiTemp
      .filter(foncier => foncier.id > 0)
      .map(foncier => this.declarationService.deleteFoncierBati(foncier.id).toPromise());
    
    Promise.all(deletePromises)
      .then(() => {
        this.foncierBatiTemp = [];
        this.selectedFonciers = [];
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Tous les fonciers bâtis ont été supprimés'
        });
      })
      .catch((err) => {
        console.error('Erreur lors de la suppression de tous les fonciers', err);
        this.loadFonciersBati();
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de supprimer tous les fonciers bâtis'
        });
      });
  }
  
  confirmSaveUpdatedFoncier(foncier: any) {
    if (!this.validateFoncier(foncier)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez remplir tous les champs obligatoires'
      });
      return;
    }
    
    this.confirmationService.confirm({
      message: 'Êtes-vous sûr de vouloir enregistrer les modifications ?',
      header: 'Confirmation de modification',
      accept: () => {
        this.saveUpdatedFoncier(foncier);
      }
    });
  }

  archiveSelectedFoncier() {
    if (this.selectedFonciers?.length > 0) {
      const deletePromises = this.selectedFonciers
        .filter(foncier => foncier.id > 0)
        .map(foncier => this.declarationService.deleteFoncierBati(foncier.id).toPromise());
      
      this.selectedFonciers.forEach(foncier => {
        const index = this.foncierBatiTemp.findIndex(f => f === foncier || f.id === foncier.id);
        if (index !== -1) this.foncierBatiTemp.splice(index, 1);
      });
      
      Promise.all(deletePromises)
        .then(() => {
          this.selectedFonciers = [];
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Fonciers bâtis supprimés avec succès'
          });
        })
        .catch(() => {
          this.loadFonciersBati();
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible de supprimer tous les fonciers bâtis'
          });
        });
    }
  }
  
  startEditFoncier(foncier: any) {
    this.foncierBatiTemp.forEach(item => item.editing = false);
        foncier.editing = true;
    foncier._backup = { ...foncier };
        this.showUploadForFoncierId = foncier.id;
  }
  
  cancelEditFoncier(foncier: any) {
    if (foncier._backup) {
      Object.assign(foncier, foncier._backup);
      delete foncier._backup;
    }
    foncier.editing = false;
    this.showUploadForFoncierId = null;
  }
  
  saveUpdatedFoncier(foncier: any) {
    const originalYear = foncier.anneeConstruction;
    const foncierForApi = this.prepareFoncierForApi(foncier);
    
    this.declarationService.updateFoncierBati(foncier.id, foncierForApi)
      .subscribe({
        next: () => {
          foncier.editing = false;
          foncier.isModified = false;
          delete foncier._backup;
          foncier.anneeConstruction = originalYear;
          this.showUploadForFoncierId = null;
          
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Foncier bâti mis à jour avec succès'
          });
        },
        error: (err) => {
          this.cancelEditFoncier(foncier);
        }
      });
  }
  
  validateFoncier(foncier: any): boolean {
    return foncier.nature && foncier.anneeConstruction && 
           foncier.modeAcquisition && foncier.referencesCadastrales;
  }
private isValidFileType(file: File): boolean {
  const validTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
  return validTypes.includes(file.type) || 
         ['pdf', 'jpeg', 'jpg', 'png', 'doc', 'docx'].includes(fileExtension || '');
}
// Problème 1: removeSelectedFile n'est pas implémenté
// Ajoutez cette méthode pour supprimer le fichier sélectionné

removeSelectedFilefoncier(): void {
  if (this.tableRowFoncier) {
    this.tableRowFoncier.file = null;
    this.tableRowFoncier.fileName = null;
    this.tableRowFoncier.fileType = null;
    this.tableRowFoncier.fileDownloadUri = null;
  }
  
  if (this.selectedFoncier) {
    this.selectedFoncier.file = null;
    this.selectedFoncier.fileName = null;
    this.selectedFoncier.fileType = null;
  }
  
  this.selectedFile = null;
  this.resetFileInput();
}

resetNatureFilter(): void {
  this.selectedNature = null;
  
  // Réinitialiser avec les données originales si disponibles
  if (this.originalFoncierData?.length > 0) {
    this.foncierBatiTemp = [...this.originalFoncierData];
    return;
  }
  
  // Sinon recharger depuis le serveur
  this.loadFonciersBati();
}

// Problème 3: Message de confirmation doublé
// Modification de la méthode onFileSelect pour éviter le double message

onFileSelect(event: any) {
  try {
    if (!event.target.files || event.target.files.length === 0) {
      this.showError('Aucun fichier sélectionné');
      return;
    }

    const file = event.target.files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (file.size > maxSize) {
      this.showError('Le fichier est trop volumineux (max 5MB)');
      return;
    }

    if (!this.isValidFileType(file)) {
      this.showError('Type de fichier non supporté (PDF, JPEG, PNG uniquement)');
      return;
    }

    // Éviter les messages en double en utilisant un seul showSuccess
    let messageShown = false;

    if (this.selectedFoncier) {
      this.selectedFoncier.file = file;
      this.selectedFoncier.fileName = file.name;
      this.selectedFoncier.fileType = file.type;
      
      // Upload immédiat pour les fonciers existants sans message
      this.uploadDocumentFoncier(this.selectedFoncier, file).subscribe({
        next: () => {
          // Message affiché une seule fois ici après upload réussi
          if (!messageShown) {
            this.showSuccess('Document uploadé avec succès');
            messageShown = true;
          }
        },
        error: (err) => {
          console.error('Erreur upload:', err);
          this.showError('Échec de l\'upload du document');
        }
      });
    } else if (this.tableRowFoncier) {
      this.tableRowFoncier.file = file;
      this.tableRowFoncier.fileName = file.name;
      this.tableRowFoncier.fileType = file.type;
      
      // Un seul message lors de la préparation du fichier
      if (!messageShown) {
        this.showSuccess('Document prêt à être associé au foncier');
        messageShown = true;
      }
    }

    event.target.value = '';
  } catch (error) {
    console.error('Erreur dans onFileSelect:', error);
    this.showError('Erreur lors de la sélection du fichier');
  }
}

// Correction du service d'upload pour éviter les messages en double
uploadDocumentFoncier(foncier: any, file: File): Observable<any> {
  this.isUploading = true;
  
  return this.declarationService.uploadFoncierDocument(foncier.id, file).pipe(
    tap((response) => {
      foncier.fileName = response.fileName;
      foncier.fileType = response.fileType;
      foncier.fileDownloadUri = response.fileDownloadUri;
      foncier.hasDocument = true;
      
      // Pas de message ici, le message est géré par le composant appelant
    }),
    finalize(() => {
      this.isUploading = false;
      this.selectedFoncier = null;
      this.resetFileInput();
    })
  );
}

// Une variable pour contrôler l'affichage du dialogue de téléchargement
displayUploadDialogfoncier: boolean = false;

// Méthode pour annuler l'upload via le dialogue
cancelUpload(): void {
  this.displayUploadDialogfoncier = false;
  this.selectedFile = null;
  this.currentFoncierForUpload = null;
  this.resetFileInput();
}

// Méthode pour uploader le fichier via le dialogue
uploadFile(): void {
  if (!this.selectedFile) {
    this.showError('Aucun fichier sélectionné');
    return;
  }
  
  if (this.currentFoncierForUpload) {
    this.uploadDocumentFoncier(this.currentFoncierForUpload, this.selectedFile)
      .subscribe({
        next: () => {
          this.showSuccess('Document uploadé avec succès');
          this.displayUploadDialogfoncier = false;
          this.selectedFile = null;
          this.currentFoncierForUpload = null;
        },
        error: (err) => {
          console.error('Erreur upload:', err);
          this.showError('Échec de l\'upload du document');
        }
      });
  } else {
    this.showError('Aucun foncier sélectionné pour l\'upload');
  }
}














  fonciersNonBati: any[] = [];
  selectedFoncierNonBati: any[] = [];
  foncierNonBatiTemp: any[] = [];
  isAddingFoncierNonBati = false;
  newFoncierNonBati: any = this.resetFoncier();
  tableRowFoncierNonBati: any = {};
    
// Variables distinctes
displayAddDialogNonBati = false;
confirmDeleteSelected(): void {
  if (!this.selectedFoncierNonBati?.length) return;

  this.confirmationService.confirm({
    message: `Êtes-vous sûr de vouloir supprimer les ${this.selectedFoncierNonBati.length} fonciers non bâtis sélectionnés ?`,
    header: 'Confirmation de suppression',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      this.deleteSelectedFoncierNonBati();
    },
    reject: () => {
      this.selectedFoncierNonBati = [];
    }
  });
}

deleteSelectedFoncierNonBati(): void {
  const deleteRequests = this.selectedFoncierNonBati.map(foncier => 
    this.declarationService.deleteFoncierNonBati(foncier.id).toPromise()
  );

  Promise.all(deleteRequests)
    .then(() => {
      // Filtrer les fonciers supprimés
      this.fonciersNonBati = this.fonciersNonBati.filter(
        f => !this.selectedFoncierNonBati.some(sf => sf.id === f.id)
      );
      
      this.foncierNonBatiTemp = [...this.fonciersNonBati];
      this.selectedFoncierNonBati = [];
      
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Suppression effectuée avec succès',
        life: 3000
      });
    })
    .catch(error => {
      console.error('Erreur lors de la suppression:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Une erreur est survenue lors de la suppression',
        life: 5000
      });
    });
}
// Méthode d'ouverture spécifique
showAddFormDialogfnb() {
  this.newFoncierNonBati = this.resetFoncierNonBati();
  this.displayAddDialogNonBati = true;
  this.submitted = false;
}

  @ViewChild('fileUploadNonBati') fileUploadNonBatiElement: ElementRef;
  uploadedFilesNonBati: any[] = [];
  isUploadingNonBati = false;
  selectedFoncierNonBatiDoc: any = null;
  showUploadForFoncierNonBatiId: number | null = null;
  
removeSelectedFileNonBati(): void {
  // Pour le nouveau foncier en cours d'ajout (si dans un formulaire)
  if (this.newFoncierNonBati) {
    this.newFoncierNonBati.file = null;
    this.newFoncierNonBati.fileName = null;
    this.newFoncierNonBati.fileType = null;
    this.newFoncierNonBati.fileDownloadUri = null;
    this.newFoncierNonBati.hasDocument = false;
  }
  
  // Pour un foncier existant en cours d'édition
  if (this.selectedFoncierNonBatiDoc) {
    this.selectedFoncierNonBatiDoc.file = null;
    this.selectedFoncierNonBatiDoc.fileName = null;
    this.selectedFoncierNonBatiDoc.fileType = null;
    this.selectedFoncierNonBatiDoc.fileDownloadUri = null;
    this.selectedFoncierNonBatiDoc.hasDocument = false;
  }
  
  // Réinitialiser le fichier sélectionné et l'input file
  this.selectedFileNonBati = null;
  this.resetFileInputNonBati();
  
  // Optionnel : message de confirmation
  this.messageService.add({
    severity: 'success',
    summary: 'Succès',
    detail: 'Document supprimé',
    life: 3000
  });
}
  loadFonciersNonBati() {
    if (!this.declarationData?.id) {
      console.error('ID de déclaration non disponible pour le foncier non bâti');
      return;
    }
   
    this.declarationService.getFonciersNonBatiByDeclaration(this.declarationData.id)
      .subscribe({
        next: (data) => {
          this.fonciersNonBati = data.map(item => ({
            ...item,
            coutInvestissement: item.coutInvestissements,
            isEdit: false,
            hasDocument: !!item.fileName
          }));
          this.foncierNonBatiTemp = [...this.fonciersNonBati];
          this.isDataModified = false;
        },
        error: (err) => console.error('Erreur lors du chargement des fonciers non bâtis', err)
      });
  }
  
  resetFoncier(): any {
    return {
      nature: null,
      modeAcquisition: null,
      ilot: '',
      lotissement: '',
      superficie: null,
      localite: '',
      titrePropriete: '',
      dateAcquis: null,
      valeurAcquisFCFA: null,
      coutInvestissement: 0,
      hasDocument: false
    };
  }
  
  validateFoncierNonBati(foncier: any): boolean {
    return !!foncier.nature && 
           !!foncier.modeAcquisition && 
           (foncier.superficie > 0 || foncier.superficieNonBati > 0) && 
           !!foncier.localite &&
           foncier.valeurAcquisFCFA >= 0 &&
           foncier.dateAcquis !== null;
  }
  
 // Corriger la méthode pour le nouveau foncier
showUploadDialogForNewFoncierNonBati() {
  this.selectedFoncierNonBatiDoc = this.newFoncierNonBati; // Utiliser newFoncierNonBati au lieu de tableRowFoncierNonBati
  this.resetFileInputNonBati();
  this.fileUploadNonBatiElement?.nativeElement?.click();
}

// Mettre à jour onFileSelectNonBati
onFileSelectNonBati(event: any) {
  if (!event.target.files || event.target.files.length === 0) {
    this.showError('Aucun fichier sélectionné');
    return;
  }

  const file = event.target.files[0];
  
  if (this.selectedFoncierNonBatiDoc) {
    this.selectedFoncierNonBatiDoc.file = file;
    this.selectedFoncierNonBatiDoc.fileName = file.name;
    this.selectedFoncierNonBatiDoc.hasDocument = true;
    this.showSuccess('Document prêt à être uploadé');
  }
}
uploadDocumentNonBati(foncier: any, file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    this.isUploadingNonBati = true;
    
    this.declarationService.uploadFoncierNonbatiDocument(foncier.id, file)
      .subscribe({
        next: (response) => {
          if (response) {
            const index = this.foncierNonBatiTemp.findIndex(f => f.id === foncier.id);
            if (index !== -1) {
              this.foncierNonBatiTemp[index].fileName = response.fileName;
              this.foncierNonBatiTemp[index].fileType = response.fileType;
              this.foncierNonBatiTemp[index].fileDownloadUri = response.fileDownloadUri;
              this.foncierNonBatiTemp[index].hasDocument = true;
            }
            resolve(response);
          }
          this.isUploadingNonBati = false;
        },
        error: (err) => {
          console.error('Erreur lors du téléchargement du document', err);
          reject(err);
          this.isUploadingNonBati = false;
        }
      });
  });
}
  
  downloadDocumentNonBati(foncier: any) {
    if (!foncier || !foncier.hasDocument) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Aucun document disponible pour ce foncier'
      });
      return;
    }
    
    this.messageService.add({
      severity: 'info',
      summary: 'Téléchargement',
      detail: 'Téléchargement en cours...'
    });
    
    this.declarationService.downloadFoncierNonBatiDocument(foncier.id)
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = foncier.fileName || 'document';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Téléchargement terminé'
          });
        },
        error: (err) => {
          console.error('Erreur lors du téléchargement du document', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible de télécharger le document'
          });
        }
      });
  }
  
  // CRUD Operations
  addTableRowFoncierNonBati() {
    if (!this.validateFoncierNonBati(this.tableRowFoncierNonBati)) {
      this.showError('Veuillez remplir tous les champs obligatoires');
      return;
    }
  
    const foncierForApi = this.prepareFoncierNonBatiForApi(this.tableRowFoncierNonBati);
    
    this.declarationService.createFoncierNonBati(foncierForApi).subscribe({
      next: (response) => {
        const newFoncier = { 
          ...this.tableRowFoncierNonBati, 
          id: response.id,
          isNew: false,
          hasDocument: false
        };
        
        if (this.tableRowFoncierNonBati.file) {
          this.uploadDocumentForNewFoncierNonBati(response.id, this.tableRowFoncierNonBati.file, newFoncier);
        } else {
          this.fonciersNonBati.push(newFoncier);
          this.foncierNonBatiTemp = [...this.fonciersNonBati];
          this.cancelTableRowFoncierNonBati();
          this.showSuccess('Foncier non bâti ajouté avec succès!');
        }
      },
      error: (err) => this.showError('Erreur lors de l\'ajout du foncier non bâti')
    });
  }
  cancelTableRowFoncierNonBati() {
    this.isAddingFoncierNonBati = false;
    this.tableRowFoncierNonBati = {};
  }

displayUploadDialogNonBati = false;
naturesNonBati: any[] = [];
selectedNatureNonBati: any = null;
selectedFileNonBati: File | null = null;

handleFileDropNonBati(event: DragEvent): void {
  event.preventDefault();
  event.stopPropagation();

  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    const file = event.dataTransfer.files[0];
    const validExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (validExtensions.includes(fileExtension)) {
      this.selectedFileNonBati = file;
      
      if (this.selectedFoncierNonBatiDoc) {
        this.selectedFoncierNonBatiDoc.fileName = file.name;
      } else if (this.tableRowFoncierNonBati) {
        this.tableRowFoncierNonBati.fileName = file.name;
      }
      
      this.messageService.add({
        severity: 'success',
        summary: 'Fichier prêt',
        detail: `${file.name} est prêt à être uploadé`,
        life: 3000
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Format non supporté',
        detail: 'Seuls les fichiers PDF, DOC, DOCX, JPG, JPEG, PNG sont acceptés',
        life: 5000
      });
    }
  }
}

showUploadDialogNonBati(foncier: any): void {
  this.selectedFoncierNonBatiDoc = foncier;
  this.displayUploadDialogNonBati = true;
  this.resetFileInputNonBati();
}

uploadFileNonBati(): void {
  if (!this.selectedFileNonBati || !this.selectedFoncierNonBatiDoc) return;

  this.uploadDocumentNonBati(this.selectedFoncierNonBatiDoc, this.selectedFileNonBati);
  this.displayUploadDialogNonBati = false;
  this.selectedFileNonBati = null;
}

cancelUploadNonBati(): void {
  this.displayUploadDialogNonBati = false;
  this.selectedFileNonBati = null;
  this.selectedFoncierNonBatiDoc = null;
}

removeSelectedFile(): void {
  this.tableRowFoncierNonBati.file = null;
  this.tableRowFoncierNonBati.fileName = null;
  this.tableRowFoncierNonBati.fileType = null;
}

filterByNatureNonBati(): void {
  if (!this.selectedNatureNonBati) {
    this.foncierNonBatiTemp = [...this.fonciersNonBati];
    return;
  }
  
  this.foncierNonBatiTemp = this.fonciersNonBati.filter(
    f => f.nature?.id === this.selectedNatureNonBati.id
  );
}


cancelAddFoncierNonBati(): void {
  this.displayAddDialogNonBati = false;
  this.tableRowFoncierNonBati = {};
  this.submitted = false;
}
confirmAddFoncierNonBati(): void {
  this.submitted = true;
  
  if (!this.newFoncierNonBati.nature || 
      !this.newFoncierNonBati.modeAcquisition ||
      !this.newFoncierNonBati.superficie ||
      !this.newFoncierNonBati.localite ||
      !this.newFoncierNonBati.dateAcquis ||
      this.newFoncierNonBati.valeurAcquisFCFA === null) {
    this.showError('Veuillez remplir tous les champs obligatoires');
    return;
  }

  this.confirmationService.confirm({
    message: 'Êtes-vous sûr de vouloir ajouter ce foncier non bâti ?',
    header: 'Confirmation d\'ajout',
    accept: () => {
      this.addFoncierNonBati(this.newFoncierNonBati);
      this.displayAddDialogNonBati = false;
    },
    reject: () => {
    }
  });
}
addFoncierNonBati(foncier: any) {
  const foncierForApi = this.prepareFoncierNonBatiForApi(foncier);
  
  this.declarationService.createFoncierNonBati(foncierForApi).subscribe({
    next: (response) => {
      const newFoncier = { 
        ...foncier, 
        id: response.id,
        hasDocument: false
      };
      
      if (foncier.file) {
        this.uploadDocumentForNewFoncierNonBati(response.id, foncier.file, newFoncier);
      } else {
        this.fonciersNonBati.push(newFoncier);
        this.foncierNonBatiTemp = [...this.fonciersNonBati];
        this.newFoncierNonBati = this.resetFoncierNonBati();
        this.showSuccess('Foncier non bâti ajouté avec succès!');
      }
    },
    error: (err) => this.showError('Erreur lors de l\'ajout du foncier non bâti')
  });
}
resetFoncierNonBati() {
  return {
    nature: null,
    modeAcquisition: null,
    ilot: '',
    lotissement: '',
    superficie: null,
    localite: '',
    titrePropriete: '',
    dateAcquis: null,
    valeurAcquisFCFA: null, 
    coutInvestissement: 0,
    hasDocument: false,
    fileName: null,
    file: null
  };
}
confirmSaveUpdatedFoncierNonBati(foncier: any): void {
  if (!this.validateFoncierNonBati(foncier)) {
    this.showError('Veuillez remplir tous les champs obligatoires');
    return;
  }
  
  this.confirmationService.confirm({
    message: 'Êtes-vous sûr de vouloir enregistrer les modifications ?',
    header: 'Confirmation de modification',
    accept: () => {
      this.saveEditedFoncierNonBati(foncier);
    }
  });
}

startEditFoncierNonBati(foncier: any): void {
  foncier._backup = {...foncier};
  foncier.editing = true;
  this.showUploadForFoncierNonBatiId = foncier.id; // Assurez-vous que c'est bien défini
  console.log('Editing foncier ID:', foncier.id); // Debug
}
triggerFileUploadNonBati(foncier: any) {
  this.selectedFoncierNonBatiDoc = foncier;
  this.resetFileInputNonBati();
  setTimeout(() => {
    this.fileUploadNonBatiElement?.nativeElement?.click();
  });
}
// Modifier saveEditedFoncierNonBati pour gérer les documents
saveEditedFoncierNonBati(foncier: any) {
  if (!this.validateFoncierNonBati(foncier)) {
    this.showError('Veuillez remplir tous les champs obligatoires');
    return;
  }

  const foncierForApi = this.prepareFoncierNonBatiForApi(foncier);
  
  this.declarationService.updateFoncierNonBati(foncier.id, foncierForApi)
    .subscribe({
      next: () => {
        if (foncier.file) {
          this.uploadDocumentNonBati(foncier, foncier.file).then(() => {
            foncier.editing = false;
            delete foncier._backup;
            this.showUploadForFoncierNonBatiId = null;
            this.showSuccess('Foncier mis à jour avec succès!');
          });
        } else {
          foncier.editing = false;
          delete foncier._backup;
          this.showUploadForFoncierNonBatiId = null;
          this.showSuccess('Foncier mis à jour avec succès!');
        }
      },
      error: (err) => {
        this.showError('Erreur lors de la mise à jour');
        this.cancelEditFoncierNonBati(foncier);
      }
    });
}


  uploadDocumentForNewFoncierNonBati(foncierId: number, file: File, newFoncier: any) {
    this.declarationService.uploadFoncierNonbatiDocument(foncierId, file)
      .subscribe({
        next: (response) => {
          if (response) {
            newFoncier.hasDocument = true;
            newFoncier.fileName = response.fileName;
            newFoncier.fileType = response.fileType;
            newFoncier.fileDownloadUri = response.fileDownloadUri;
          }
          
          this.fonciersNonBati.push(newFoncier);
          this.foncierNonBatiTemp = [...this.fonciersNonBati];
          this.cancelTableRowFoncierNonBati();
          this.showSuccess('Foncier non bâti ajouté avec succès!');
        },
        error: (err) => {
          this.fonciersNonBati.push(newFoncier);
          this.foncierNonBatiTemp = [...this.fonciersNonBati];
          this.cancelTableRowFoncierNonBati();
          this.showWarning('Foncier ajouté, mais erreur lors du téléchargement du document');
        }
      });
  }
  
  editFoncierNonBati(foncier: any) {
    foncier._backup = JSON.parse(JSON.stringify(foncier));
    foncier.isEdit = true;
    this.showUploadForFoncierNonBatiId = foncier.id;
  }
 
  
 cancelEditFoncierNonBati(foncier: any) {
  if (foncier._backup) {
    Object.assign(foncier, foncier._backup);
    delete foncier._backup;
  }
  foncier.editing = false;
  this.showUploadForFoncierNonBatiId = null; // Seulement ici
}
  archiveSelectedFoncierNonBati() {
    if (!this.selectedFoncierNonBati?.length) return;
    
    const deletePromises = this.selectedFoncierNonBati
      .filter(foncier => foncier.id > 0)
      .map(foncier => this.declarationService.deleteFoncierNonBati(foncier.id).toPromise());
    
    this.fonciersNonBati = this.fonciersNonBati.filter(
      f => !this.selectedFoncierNonBati.includes(f)
    );
    this.foncierNonBatiTemp = [...this.fonciersNonBati];
    
    Promise.all(deletePromises)
      .then(() => {
        this.showSuccess('Suppression effectuée avec succès');
        this.selectedFoncierNonBati = [];
      })
      .catch(() => {
        this.showError('Erreur lors de la suppression des éléments');
        this.loadFonciersNonBati();
      });
  }

  prepareFoncierNonBatiForApi(foncier: any) {
    return {
      id: foncier.id > 0 ? foncier.id : null,
      nature: foncier.nature ? { id: foncier.nature.id || foncier.nature } : null,
      modeAcquisition: foncier.modeAcquisition ? { id: foncier.modeAcquisition.id || foncier.modeAcquisition } : null,
      ilot: foncier.ilot || '',
      lotissement: foncier.lotissement || '',
      superficie: foncier.superficie,
      localite: foncier.localite,
      titrePropriete: foncier.titrePropriete || '',
      dateAcquis: foncier.dateAcquis instanceof Date
        ? foncier.dateAcquis.toISOString().split('T')[0]
        : foncier.dateAcquis,
      valeurAcquisFCFA: foncier.valeurAcquisFCFA,
      coutInvestissements: foncier.coutInvestissement,
      dateCreation: foncier.dateCreation || new Date().toISOString().split('T')[0],
      isSynthese: foncier.isSynthese || false,
      idDeclaration: { id: this.declarationData.id },
      fileName: foncier.fileName,
      fileType: foncier.fileType,
      fileDownloadUri: foncier.fileDownloadUri
    };
  }
  
  private resetFileInputNonBati() {
    if (this.fileUploadNonBatiElement?.nativeElement) {
      this.fileUploadNonBatiElement.nativeElement.value = '';
    }
  }
  
 
  
  private showWarning(detail: string) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Attention',
      detail: detail,
      life: 5000
    });
  }












  meublesMeublant: any[] = [];
selectedMeublesMeublant: any[] = [];
meublesMeublantTemp: any[] = [];
displayAddDialogMeuble = false;
newMeuble: any = this.resetMeuble();
tableRowMeubleMeublant: any = {};

@ViewChild('fileUploadMeuble') fileUploadMeubleElement: ElementRef;
uploadedFilesMeuble: any[] = [];
isUploadingMeuble = false;
selectedMeubleDoc: any = null;
showUploadForMeubleId: number | null = null;
selectedDesignation: any = null;
resetMeubleFilter() {
  this.selectedDesignation = null;
}
// Méthode d'ouverture spécifique
showAddFormDialogMeuble() {
  this.newMeuble = this.resetMeuble();
  this.displayAddDialogMeuble = true;
  this.submitted = false;
}

loadMeublesMeublants() {
  if (!this.declarationData?.id) {
    console.error('ID de déclaration non disponible pour les meubles meublants');
    return;
  }
 
  this.declarationService.getMeublesMeublantsByDeclaration(this.declarationData.id)
    .subscribe({
      next: (data) => {
        this.meublesMeublant = data.map(item => ({
          ...item,
          anneeAcquisition: this.formatAnnee(item.anneeAcquisition),
          editing: false,
          hasDocument: !!item.fileName
        }));
        this.meublesMeublantTemp = [...this.meublesMeublant];
        this.isDataModified = false;
      },
      error: (err) => console.error('Erreur lors du chargement des meubles meublants', err)
    });
}

resetMeuble(): any {
  return {
    designation: null,
    anneeAcquisition: null,
    valeurAcquisition: null,
    etatGeneral: null,
    hasDocument: false
  };
}

validateMeuble(meuble: any): boolean {
  return !!meuble.designation && 
         !!meuble.anneeAcquisition && 
         (meuble.valeurAcquisition >= 0) && 
         !!meuble.etatGeneral;
}

// Gestion des documents
showUploadDialogForNewMeuble() {
  this.selectedMeubleDoc = this.newMeuble;
  this.resetFileInputMeuble();
  this.fileUploadMeubleElement?.nativeElement?.click();
}

onFileSelectMeuble(event: any) {
  if (!event.target.files || event.target.files.length === 0) {
    this.showError('Aucun fichier sélectionné');
    return;
  }

  const file = event.target.files[0];
  
  if (this.selectedMeubleDoc) {
    this.selectedMeubleDoc.file = file;
    this.selectedMeubleDoc.fileName = file.name;
    this.selectedMeubleDoc.fileType = file.type;
    this.showSuccess('Document prêt à être uploadé avec le meuble');
  }
}

uploadDocumentMeuble(meuble: any, file: File) {
  this.isUploadingMeuble = true;
  
  this.declarationService.uploadMeubleDocument(meuble.id, file)
    .subscribe({
      next: (response) => {
        if (response) {
          const index = this.meublesMeublantTemp.findIndex(m => m.id === meuble.id);
          if (index !== -1) {
            this.meublesMeublantTemp[index].fileName = response.fileName;
            this.meublesMeublantTemp[index].fileType = response.fileType;
            this.meublesMeublantTemp[index].fileDownloadUri = response.fileDownloadUri;
            this.meublesMeublantTemp[index].hasDocument = true;
          }
          
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Document téléchargé avec succès'
          });
        }
        this.selectedMeubleDoc = null;
        this.isUploadingMeuble = false;
      },
      error: (err) => {
        console.error('Erreur lors du téléchargement du document', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de télécharger le document'
        });
        this.isUploadingMeuble = false;
      }
    });
}

downloadDocumentMeuble(meuble: any) {
  if (!meuble || !meuble.hasDocument) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Attention',
      detail: 'Aucun document disponible pour ce meuble'
    });
    return;
  }
  
  this.messageService.add({
    severity: 'info',
    summary: 'Téléchargement',
    detail: 'Téléchargement en cours...'
  });
  
  this.declarationService.downloadMeubleDocument(meuble.id)
    .subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = meuble.fileName || 'document';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Téléchargement terminé'
        });
      },
      error: (err) => {
        console.error('Erreur lors du téléchargement du document', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de télécharger le document'
        });
      }
    });
}

// CRUD Operations
addTableRowMeubleToTable() {
  if (!this.validateMeuble(this.tableRowMeubleMeublant)) {
    this.showError('Veuillez remplir tous les champs obligatoires');
    return;
  }

  const meubleForApi = this.prepareMeubleForApi(this.tableRowMeubleMeublant);
  
  this.declarationService.createMeubleMeublant(meubleForApi).subscribe({
    next: (response) => {
      const newMeuble = { 
        ...this.tableRowMeubleMeublant, 
        id: response.id,
        isNew: false,
        hasDocument: false
      };
      
      if (this.tableRowMeubleMeublant.file) {
        this.uploadDocumentForNewMeuble(response.id, this.tableRowMeubleMeublant.file, newMeuble);
      } else {
        this.meublesMeublant.push(newMeuble);
        this.meublesMeublantTemp = [...this.meublesMeublant];
        this.cancelTableRowMeuble();
        this.showSuccess('Meuble meublant ajouté avec succès!');
      }
    },
    error: (err) => this.showError('Erreur lors de l\'ajout du meuble meublant')
  });
}

cancelTableRowMeuble() {
  this.isAddingTableRow = false;
  this.tableRowMeubleMeublant = {};
}

displayUploadDialogMeuble = false;
selectedFileMeuble: File | null = null;

handleFileDropMeuble(event: DragEvent): void {
  event.preventDefault();
  event.stopPropagation();

  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    const file = event.dataTransfer.files[0];
    const validExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (validExtensions.includes(fileExtension)) {
      this.selectedFileMeuble = file;
      
      if (this.selectedMeubleDoc) {
        this.selectedMeubleDoc.fileName = file.name;
      } else if (this.tableRowMeubleMeublant) {
        this.tableRowMeubleMeublant.fileName = file.name;
      }
      
      this.messageService.add({
        severity: 'success',
        summary: 'Fichier prêt',
        detail: `${file.name} est prêt à être uploadé`,
        life: 3000
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Format non supporté',
        detail: 'Seuls les fichiers PDF, DOC, DOCX, JPG, JPEG, PNG sont acceptés',
        life: 5000
      });
    }
  }
}

showUploadDialogMeuble(meuble: any): void {
  this.selectedMeubleDoc = meuble;
  this.displayUploadDialogMeuble = true;
  this.resetFileInputMeuble();
}

uploadFileMeuble(): void {
  if (!this.selectedFileMeuble || !this.selectedMeubleDoc) return;

  this.uploadDocumentMeuble(this.selectedMeubleDoc, this.selectedFileMeuble);
  this.displayUploadDialogMeuble = false;
  this.selectedFileMeuble = null;
}

cancelUploadMeuble(): void {
  this.displayUploadDialogMeuble = false;
  this.selectedFileMeuble = null;
  this.selectedMeubleDoc = null;
}

removeSelectedFileMeuble(): void {
  this.newMeuble.file = null;
  this.newMeuble.fileName = null;
  this.newMeuble.fileType = null;
}

filterByDesignation(): void {
  if (!this.selectedDesignation) {
    this.meublesMeublantTemp = [...this.meublesMeublant];
    return;
  }
  
  this.meublesMeublantTemp = this.meublesMeublant.filter(
    m => m.designation?.id === this.selectedDesignation.id
  );
}

cancelAddMeuble(): void {
  this.displayAddDialogMeuble = false;
  this.newMeuble = this.resetMeuble();
  this.submitted = false;
}

confirmAddMeuble(): void {
  this.submitted = true;
  
  if (!this.newMeuble.designation || 
      !this.newMeuble.anneeAcquisition ||
      this.newMeuble.valeurAcquisition === null ||
      !this.newMeuble.etatGeneral) {
    this.showError('Veuillez remplir tous les champs obligatoires');
    return;
  }

  this.confirmationService.confirm({
    message: 'Êtes-vous sûr de vouloir ajouter ce meuble meublant ?',
    header: 'Confirmation d\'ajout',
    accept: () => {
      this.addMeuble(this.newMeuble);
      this.displayAddDialogMeuble = false;
    },
    reject: () => {
    }
  });
}

addMeuble(meuble: any) {
  const meubleForApi = this.prepareMeubleForApi(meuble);
  
  this.declarationService.createMeubleMeublant(meubleForApi).subscribe({
    next: (response) => {
      const newMeuble = { 
        ...meuble, 
        id: response.id,
        hasDocument: false
      };
      
      if (meuble.file) {
        this.uploadDocumentForNewMeuble(response.id, meuble.file, newMeuble);
      } else {
        this.meublesMeublant.push(newMeuble);
        this.meublesMeublantTemp = [...this.meublesMeublant];
        this.newMeuble = this.resetMeuble();
        this.showSuccess('Meuble meublant ajouté avec succès!');
      }
    },
    error: (err) => this.showError('Erreur lors de l\'ajout du meuble meublant')
  });
}

confirmSaveUpdatedMeuble(meuble: any): void {
  if (!this.validateMeuble(meuble)) {
    this.showError('Veuillez remplir tous les champs obligatoires');
    return;
  }
  
  this.confirmationService.confirm({
    message: 'Êtes-vous sûr de vouloir enregistrer les modifications ?',
    header: 'Confirmation de modification',
    accept: () => {
      this.saveEditedMeuble(meuble);
    }
  });
}

startEditMeuble(meuble: any): void {
  meuble._backup = JSON.parse(JSON.stringify(meuble));
  meuble.editing = true;
  this.showUploadForMeubleId = meuble.id;
}

uploadDocumentForNewMeuble(meubleId: number, file: File, newMeuble: any) {
  this.declarationService.uploadMeubleDocument(meubleId, file)
    .subscribe({
      next: (response) => {
        if (response) {
          newMeuble.hasDocument = true;
          newMeuble.fileName = response.fileName;
          newMeuble.fileType = response.fileType;
          newMeuble.fileDownloadUri = response.fileDownloadUri;
        }
        
        this.meublesMeublant.push(newMeuble);
        this.meublesMeublantTemp = [...this.meublesMeublant];
        this.cancelTableRowMeuble();
        this.showSuccess('Meuble meublant ajouté avec succès!');
      },
      error: (err) => {
        this.meublesMeublant.push(newMeuble);
        this.meublesMeublantTemp = [...this.meublesMeublant];
        this.cancelTableRowMeuble();
        this.showWarning('Meuble ajouté, mais erreur lors du téléchargement du document');
      }
    });
}

saveEditedMeuble(meuble: any) {
  if (!this.validateMeuble(meuble)) {
    this.showError('Veuillez remplir tous les champs obligatoires');
    return;
  }

  const meubleForApi = this.prepareMeubleForApi(meuble);
  
  this.declarationService.updateMeubleMeublant(meuble.id, meubleForApi)
    .subscribe({
      next: () => {
        meuble.editing = false;
        delete meuble._backup;
        this.showUploadForMeubleId = null;
        this.showSuccess('Meuble meublant mis à jour avec succès!');
      },
      error: (err) => {
        this.showError('Erreur lors de la mise à jour du meuble meublant');
        this.cancelEditMeuble(meuble);
      }
    });
}

cancelEditMeuble(meuble: any) {
  if (meuble._backup) {
    Object.assign(meuble, meuble._backup);
    delete meuble._backup;
  }
  meuble.editing = false;
  this.showUploadForMeubleId = null;
}

confirmDeleteSelectedMeubles() {
  if (!this.selectedMeublesMeublant?.length) return;
  
  this.confirmationService.confirm({
    message: `Êtes-vous sûr de vouloir supprimer les ${this.selectedMeublesMeublant.length} meubles sélectionnés ?`,
    header: 'Confirmation de suppression',
    accept: () => {
      this.deleteSelectedMeubles();
    }
  });
}

deleteSelectedMeubles() {
  const deletePromises = this.selectedMeublesMeublant
    .filter(meuble => meuble.id > 0)
    .map(meuble => this.declarationService.deleteMeubleMeublant(meuble.id).toPromise());
  
  this.meublesMeublant = this.meublesMeublant.filter(
    m => !this.selectedMeublesMeublant.includes(m)
  );
  this.meublesMeublantTemp = [...this.meublesMeublant];
  
  Promise.all(deletePromises)
    .then(() => {
      this.showSuccess('Suppression effectuée avec succès');
      this.selectedMeublesMeublant = [];
    })
    .catch(() => {
      this.showError('Erreur lors de la suppression des éléments');
      this.loadMeublesMeublants();
    });
}

// Formatage de l'année
formatAnnee(annee: any): Date {
  if (typeof annee === 'number') {
    return new Date(annee, 0, 1);
  } else if (typeof annee === 'string' && /^\d+$/.test(annee)) {
    return new Date(parseInt(annee), 0, 1);
  }
  return annee;
}

// Préparation pour l'API
prepareMeubleForApi(meuble: any) {
  const annee = meuble.anneeAcquisition instanceof Date ? 
               meuble.anneeAcquisition.getFullYear() : meuble.anneeAcquisition;
  
  return {
    id: meuble.id > 0 ? meuble.id : null,
    designation: meuble.designation ? { id: meuble.designation.id || meuble.designation } : null,
    anneeAcquisition: annee,
    valeurAcquisition: meuble.valeurAcquisition,
    etatGeneral: meuble.etatGeneral ? { id: meuble.etatGeneral.id || meuble.etatGeneral } : null,
    dateCreation: meuble.dateCreation || new Date().toISOString().split('T')[0],
    idDeclaration: { id: this.declarationData.id },
    fileName: meuble.fileName,
    fileType: meuble.fileType,
    fileDownloadUri: meuble.fileDownloadUri
  };
}

private resetFileInputMeuble() {
  if (this.fileUploadMeubleElement?.nativeElement) {
    this.fileUploadMeubleElement.nativeElement.value = '';
  }
}




appareilsElectromenager: any[] = [];
selectedAppareilsElectromenager: any[] = [];
appareilsElectromenagerTemp: any[] = [];
displayAddDialogAppareil = false;
newAppareil: any = this.resetAppareil();
tableRowAppareil: any = {};

@ViewChild('fileUploadAppareil') fileUploadAppareilElement: ElementRef;
uploadedFilesAppareil: any[] = [];
isUploadingAppareil = false;
selectedAppareilDoc: any = null;
showUploadForAppareilId: number | null = null;
selectedDesignationA: any = null;

resetAppareilFilter() {
  this.selectedDesignationA = null;
}

// Méthode d'ouverture spécifique
showAddFormDialogAppareil() {
  this.newAppareil = this.resetAppareil();
  this.displayAddDialogAppareil = true;
  this.submitted = false;
}
validateAppareil(appareil: any): boolean {
  return !!appareil.designation?.id && 
         !!appareil.anneeAcquisition && 
         (appareil.valeurAcquisition !== null && appareil.valeurAcquisition >= 0) && 
         !!appareil.etatGeneral?.id;
}
// Gestion des documents
showUploadDialogForNewAppareil() {
  this.selectedAppareilDoc = this.newAppareil;
  this.resetFileInputAppareil();
  this.fileUploadAppareilElement?.nativeElement?.click();
}

onFileSelectAppareil(event: any) {
  if (!event.target.files || event.target.files.length === 0) {
    this.showError('Aucun fichier sélectionné');
    return;
  }

  const file = event.target.files[0];
  
  if (this.selectedAppareilDoc) {
    this.selectedAppareilDoc.file = file;
    this.selectedAppareilDoc.fileName = file.name;
    this.selectedAppareilDoc.fileType = file.type;
    this.showSuccess('Document prêt à être uploadé avec l\'appareil');
  }
}
uploadDocumentAppareil(appareil: any, file: File) {
  this.isUploadingAppareil = true;
  
  this.declarationService.uploadAppareilDocument(appareil.id, file)
    .subscribe({
      next: (response) => {
        if (response) {
          const index = this.appareilsElectromenagerTemp.findIndex(a => a.id === appareil.id);
          if (index !== -1) {
            this.appareilsElectromenagerTemp[index] = {
              ...this.appareilsElectromenagerTemp[index],
              fileName: response.fileName,
              fileType: response.fileType,
              fileDownloadUri: response.fileDownloadUri,
              hasDocument: true
            };
          }
          
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Document téléchargé avec succès'
          });
        }
        this.selectedAppareilDoc = null;
        this.isUploadingAppareil = false;
        this.resetFileInputAppareil();
      },
      error: (err) => {
        console.error('Erreur lors du téléchargement du document', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: err.error?.message || 'Impossible de télécharger le document'
        });
        this.isUploadingAppareil = false;
      }
    });
}
downloadDocumentAppareil(appareil: any) {
  if (!appareil || !appareil.hasDocument) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Attention',
      detail: 'Aucun document disponible pour cet appareil'
    });
    return;
  }
  
  this.messageService.add({
    severity: 'info',
    summary: 'Téléchargement',
    detail: 'Téléchargement en cours...'
  });
  
  this.declarationService.downloadAppareilDocument(appareil.id)
    .subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = appareil.fileName || 'document';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Téléchargement terminé'
        });
      },
      error: (err) => {
        console.error('Erreur lors du téléchargement du document', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de télécharger le document'
        });
      }
    });
}
// Filtrer par désignation
filterByDesignationAp(): void {
  if (!this.selectedDesignationA) {
    this.appareilsElectromenagerTemp = [...this.appareilsElectromenager];
    return;
  }
  
  // Vérifiez si la propriété est bien 'designationappareil' ou 'designation'
  this.appareilsElectromenagerTemp = this.appareilsElectromenager.filter(
    a => a.designation?.id === this.selectedDesignationA.id
    // ou a.designationappareil?.id si c'est le bon nom de propriété
  );
}
// CRUD Operations
addTableRowAppareilToTable() {
  if (!this.validateAppareil(this.tableRowAppareil)) {
    this.showError('Veuillez remplir tous les champs obligatoires');
    return;
  }

  const appareilForApi = this.prepareAppareilForApi(this.tableRowAppareil);
  
  this.declarationService.createAppareil(appareilForApi).subscribe({
    next: (response) => {
      const newAppareil = { 
        ...this.tableRowAppareil, 
        id: response.id,
        isNew: false,
        hasDocument: false
      };
      
      if (this.tableRowAppareil.file) {
        this.uploadDocumentForNewAppareil(response.id, this.tableRowAppareil.file, newAppareil);
      } else {
        this.appareilsElectromenager.push(newAppareil);
        this.appareilsElectromenagerTemp = [...this.appareilsElectromenager];
        this.cancelTableRowAppareil();
        this.showSuccess('Appareil ajouté avec succès!');
      }
    },
    error: (err) => this.showError('Erreur lors de l\'ajout de l\'appareil')
  });
}

cancelTableRowAppareil() {
  this.isAddingTableRow = false;
  this.tableRowAppareil = {};
}

displayUploadDialogAppareil = false;
selectedFileAppareil: File | null = null;

handleFileDropAppareil(event: DragEvent): void {
  event.preventDefault();
  event.stopPropagation();

  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    const file = event.dataTransfer.files[0];
    const validExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (validExtensions.includes(fileExtension)) {
      this.selectedFileAppareil = file;
      
      if (this.selectedAppareilDoc) {
        this.selectedAppareilDoc.fileName = file.name;
      } else if (this.tableRowAppareil) {
        this.tableRowAppareil.fileName = file.name;
      }
      
      this.messageService.add({
        severity: 'success',
        summary: 'Fichier prêt',
        detail: `${file.name} est prêt à être uploadé`,
        life: 3000
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Format non supporté',
        detail: 'Seuls les fichiers PDF, DOC, DOCX, JPG, JPEG, PNG sont acceptés',
        life: 5000
      });
    }
  }
}

showUploadDialogAppareil(appareil: any): void {
  this.selectedAppareilDoc = appareil;
  this.displayUploadDialogAppareil = true;
  this.resetFileInputAppareil();
}

uploadFileAppareil(): void {
  if (!this.selectedFileAppareil || !this.selectedAppareilDoc) return;

  this.uploadDocumentAppareil(this.selectedAppareilDoc, this.selectedFileAppareil);
  this.displayUploadDialogAppareil = false;
  this.selectedFileAppareil = null;
}

cancelUploadAppareil(): void {
  this.displayUploadDialogAppareil = false;
  this.selectedFileAppareil = null;
  this.selectedAppareilDoc = null;
}

removeSelectedFileAppareil(): void {
  this.newAppareil.file = null;
  this.newAppareil.fileName = null;
  this.newAppareil.fileType = null;
}

cancelAddAppareil(): void {
  this.displayAddDialogAppareil = false;
  this.newAppareil = this.resetAppareil();
  this.submitted = false;
}

confirmAddAppareil(): void {
  this.submitted = true;
  
  if (!this.newAppareil.designation || 
      !this.newAppareil.anneeAcquisition ||
      this.newAppareil.valeurAcquisition === null ||
      !this.newAppareil.etatGeneral) {
    this.showError('Veuillez remplir tous les champs obligatoires');
    return;
  }

  this.confirmationService.confirm({
    message: 'Êtes-vous sûr de vouloir ajouter cet appareil ?',
    header: 'Confirmation d\'ajout',
    accept: () => {
      this.addAppareil(this.newAppareil);
      this.displayAddDialogAppareil = false;
    },
    reject: () => {
    }
  });
}

addAppareil(appareil: any) {
  const appareilForApi = this.prepareAppareilForApi(appareil);
  
  this.declarationService.createAppareil(appareilForApi).subscribe({
    next: (response) => {
      const newAppareil = { 
        ...appareil, 
        id: response.id,
        hasDocument: false
      };
      
      if (appareil.file) {
        this.uploadDocumentForNewAppareil(response.id, appareil.file, newAppareil);
      } else {
        this.appareilsElectromenager.push(newAppareil);
        this.appareilsElectromenagerTemp = [...this.appareilsElectromenager];
        this.newAppareil = this.resetAppareil();
        this.showSuccess('Appareil ajouté avec succès!');
      }
    },
    error: (err) => this.showError('Erreur lors de l\'ajout de l\'appareil')
  });
}

confirmSaveUpdatedAppareil(appareil: any): void {
  if (!this.validateAppareil(appareil)) {
    this.showError('Veuillez remplir tous les champs obligatoires');
    return;
  }
  
  this.confirmationService.confirm({
    message: 'Êtes-vous sûr de vouloir enregistrer les modifications ?',
    header: 'Confirmation de modification',
    accept: () => {
      this.saveEditedAppareil(appareil);
    }
  });
}

startEditAppareil(appareil: any): void {
  appareil._backup = JSON.parse(JSON.stringify(appareil));
  appareil.editing = true;
  this.showUploadForAppareilId = appareil.id;
}

uploadDocumentForNewAppareil(appareilId: number, file: File, newAppareil: any) {
  this.declarationService.uploadAppareilDocument(appareilId, file)
    .subscribe({
      next: (response) => {
        if (response) {
          newAppareil.hasDocument = true;
          newAppareil.fileName = response.fileName;
          newAppareil.fileType = response.fileType;
          newAppareil.fileDownloadUri = response.fileDownloadUri;
        }
        
        this.appareilsElectromenager.push(newAppareil);
        this.appareilsElectromenagerTemp = [...this.appareilsElectromenager];
        this.cancelTableRowAppareil();
        this.showSuccess('Appareil ajouté avec succès!');
      },
      error: (err) => {
        this.appareilsElectromenager.push(newAppareil);
        this.appareilsElectromenagerTemp = [...this.appareilsElectromenager];
        this.cancelTableRowAppareil();
        this.showWarning('Appareil ajouté, mais erreur lors du téléchargement du document');
      }
    });
}

cancelEditAppareil(appareil: any) {
  if (appareil._backup) {
    Object.assign(appareil, appareil._backup);
    delete appareil._backup;
  }
  appareil.editing = false;
  this.showUploadForAppareilId = null;
}

confirmDeleteSelectedAppareils() {
  if (!this.selectedAppareilsElectromenager?.length) return;
  
  this.confirmationService.confirm({
    message: `Êtes-vous sûr de vouloir supprimer les ${this.selectedAppareilsElectromenager.length} appareils sélectionnés ?`,
    header: 'Confirmation de suppression',
    accept: () => {
      this.deleteSelectedAppareils();
    }
  });
}

deleteSelectedAppareils() {
  const deletePromises = this.selectedAppareilsElectromenager
    .filter(appareil => appareil.id > 0)
    .map(appareil => this.declarationService.deleteAppareil(appareil.id).toPromise());
  
  this.appareilsElectromenager = this.appareilsElectromenager.filter(
    a => !this.selectedAppareilsElectromenager.includes(a)
  );
  this.appareilsElectromenagerTemp = [...this.appareilsElectromenager];
  
  Promise.all(deletePromises)
    .then(() => {
      this.showSuccess('Suppression effectuée avec succès');
      this.selectedAppareilsElectromenager = [];
    })
    .catch(() => {
      this.showError('Erreur lors de la suppression des éléments');
      this.loadAppareilsFromDeclaration();
    });
}
saveEditedAppareil(appareil: any) {
  if (!this.validateAppareil(appareil)) {
    this.showError('Veuillez remplir tous les champs obligatoires');
    return;
  }

  const appareilForApi = this.prepareAppareilForApi(appareil);
  
  this.declarationService.updateAppareil(appareil.id, appareilForApi)
    .subscribe({
      next: (updatedAppareil) => {
        // Mise à jour des données locales avec la réponse du serveur
        const index = this.appareilsElectromenager.findIndex(a => a.id === appareil.id);
        if (index !== -1) {
          this.appareilsElectromenager[index] = {
            ...updatedAppareil,
            anneeAcquisition: new Date(updatedAppareil.anneeAcquisition, 0, 1),
            editing: false
          };
          this.appareilsElectromenagerTemp = [...this.appareilsElectromenager];
        }
        
        delete appareil._backup;
        this.showUploadForAppareilId = null;
        this.showSuccess('Appareil mis à jour avec succès!');
      },
      error: (err) => {
        console.error('Erreur de mise à jour', err);
        this.showError('Erreur lors de la mise à jour');
        this.cancelEditAppareil(appareil);
      }
    });
}
resetAppareil(): any {
  return {
    designation: null,
    anneeAcquisition: null, // Sera transformé en number par prepareAppareilForApi
    valeurAcquisition: null,
    etatGeneral: null,
    hasDocument: false,
    file: null,
    fileName: null,
    fileType: null
  };
}
loadAppareilsFromDeclaration() {
  if (!this.declarationData?.id) {
    console.error('ID de déclaration non disponible');
    return;
  }

  this.loading = true;
  
  this.declarationService.getAppareilsByDeclaration(this.declarationData.id).subscribe({
    next: (data) => {
      this.appareilsElectromenager = data.map(item => ({
        ...item,
        // Convertir l'année en Date (1er janvier de l'année)
        anneeAcquisition: item.anneeAcquisition ? new Date(item.anneeAcquisition, 0, 1) : null,
        valeurAcquisition: item.valeurAcquisition || 0,
        editing: false,
        hasDocument: !!item.fileName
      }));
      
      this.appareilsElectromenagerTemp = [...this.appareilsElectromenager];
      this.loading = false;
    },
    error: (err) => {
      console.error('Erreur de chargement', err);
      this.loading = false;
    }
  });
}
prepareAppareilForApi(appareil: any) {

  let annee: number;
  if (appareil.anneeAcquisition instanceof Date) {
    annee = appareil.anneeAcquisition.getFullYear();
  } else if (typeof appareil.anneeAcquisition === 'string') {
    // Si c'est une string au format ISO, extraire l'année
    const date = new Date(appareil.anneeAcquisition);
    annee = isNaN(date.getTime()) ? new Date().getFullYear() : date.getFullYear();
  } else if (typeof appareil.anneeAcquisition === 'number') {
    annee = appareil.anneeAcquisition;
  } else {
    annee = new Date().getFullYear(); // Valeur par défaut
  }

  return {

    id: appareil.id > 0 ? appareil.id : null,
    designation: appareil.designation ? { id: appareil.designation.id || appareil.designation } : null,
    anneeAcquisition: annee, // Doit être un nombre entier
    valeurAcquisition: appareil.valeurAcquisition,
    etatGeneral: appareil.etatGeneral ? { id: appareil.etatGeneral.id || appareil.etatGeneral } : null,
    dateCreation: appareil.dateCreation || new Date().toISOString().split('T')[0],
    idDeclaration: { id: this.declarationData.id },
    fileName: appareil.fileName,
    fileType: appareil.fileType,
    fileDownloadUri: appareil.fileDownloadUri
  };
}
private resetFileInputAppareil() {
  if (this.fileUploadAppareilElement?.nativeElement) {
    this.fileUploadAppareilElement.nativeElement.value = '';
 
  }
}








// Variables for animals
animaux: any[] = [];
selectedAnimaux: any = null;

displayUploadDialogAnimaux = false;

newAnimal: any = {
  especes: '',
  nombreTetes: null,
  modeAcquisition: null,
  anneeAcquisition: null,
  valeurAcquisition: null,
  localite: null,
  fichierAttache: null,
  uploadedFiles: [],
  isEdit: false
};
selectedAnimals: any[] = [];
isAddingTableRowAnimal = false;
tableRowAnimal: any = {};
isEditModeAnimal = false;

// File upload variables
@ViewChild('fileInputAnimal') fileInputAnimal: ElementRef;
uploadedFilesAnimal: any[] = [];
isUploadingAnimal = false;
selectedAnimalDoc: any = null;
showUploadForAnimalId: number | null = null;
selectedEspece: any = null;
displayAddDialogAnimal = false;
animauxTemp: any[] = [];



private resetFileInputAnimal(): void {
  if (this.fileInputAnimal?.nativeElement) {
    this.fileInputAnimal.nativeElement.value = '';
  }
}

// Méthode de sélection de fichier
onFileSelectAnimal(event: any): void {
  if (!event.target.files || event.target.files.length === 0) {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Aucun fichier sélectionné',
      life: 3000
    });
    return;
  }

  const file = event.target.files[0];
  
  if (this.selectedAnimalDoc) {
    // Mise à jour immédiate de l'interface
    this.selectedAnimalDoc.file = file;
    this.selectedAnimalDoc.fileName = file.name;
    this.selectedAnimalDoc.fileType = file.type;
    
    // Upload vers le serveur
    this.uploadDocumentAnimal(this.selectedAnimalDoc, file);
  }
  
  this.messageService.add({
    severity: 'success',
    summary: 'Fichier sélectionné',
    detail: `${file.name} est en cours d'upload`,
    life: 3000
  });
}

// Méthode d'upload améliorée
uploadDocumentAnimal(animal: any, file: File): void {
  this.isUploadingAnimal = true;

  this.declarationService.uploadAnimalDocument(animal.id, file).subscribe({
    next: (response) => {
      // Mise à jour des propriétés avec la réponse du serveur
      animal.fileName = response.fileName;
      animal.fileType = response.fileType;
      animal.fileDownloadUri = response.fileDownloadUri;
      animal.hasDocument = true;
      
      // Mise à jour dans le tableau
      const index = this.animaux.findIndex(a => a.id === animal.id);
      if (index !== -1) {
        this.animaux[index] = animal;
      }
      
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Document uploadé avec succès',
        life: 3000
      });
    },
   
    complete: () => {
      this.isUploadingAnimal = false;
      this.selectedAnimalDoc = null;
    }
  });
}

// Helper pour les messages d'erreur
private getErrorMessage(err: any, action: string): string {
  if (err.error?.message) {
    return `Échec de ${action} le document: ${err.error.message}`;
  }
  return `Erreur lors de ${action} le document`;
}

// Méthode pour déclencher l'upload
triggerAnimalFileUpload(animal: any): void {
  this.selectedAnimalDoc = animal;
  this.fileInputAnimal.nativeElement.click();
}

resetAnimal(): any {
  return {
    especes: '',
    nombreTetes: null,
    modeAcquisition: null,
    localiteanimalex: null,
    anneeAcquisition: null,
    valeurAcquisition: null,
    fileName: null,
    fileType: null
  };
}
validateAnimal(animal: any): boolean {
  return !!animal.especes && 
         animal.nombreTetes !== null && animal.nombreTetes !== undefined && 
         animal.valeurAcquisition !== null && animal.valeurAcquisition !== undefined &&
         !!animal.modeAcquisition?.id &&
         !!animal.localiteanimalex?.id &&
         animal.anneeAcquisition instanceof Date;
}prepareAnimalForApi(animal: any) {
  const annee = animal.anneeAcquisition instanceof Date ? 
               animal.anneeAcquisition.getFullYear() : animal.anneeAcquisition;
  
  return {
    id: animal.id > 0 ? animal.id : null,
    especes: animal.especes,
    nombreTetes: animal.nombreTetes,
    modeAcquisition: animal.modeAcquisition ? { id: animal.modeAcquisition.id } : null,
    localite: animal.localiteanimalex ? { id: animal.localiteanimalex.id } : null,
    anneeAcquisition: annee,
    valeurAcquisition: animal.valeurAcquisition,
    dateCreation: animal.dateCreation || new Date().toISOString().split('T')[0],
    idDeclaration: { id: this.declarationData.id },
    fileName: animal.fileName,
    fileType: animal.fileType,
    fileDownloadUri: animal.fileDownloadUri
  };
}

filterByEspeceText(searchText: string): void {
  if (!searchText) {
    this.animauxTemp = [...this.animaux];
    return;
  }
  
  searchText = searchText.toLowerCase();
  this.animauxTemp = this.animaux.filter(
    a => a.espece?.toLowerCase().includes(searchText)
  );
}
resetAnimalFilter() {
  this.selectedEspece = null;
}

// Method to show add form dialog
showAddFormDialogAnimal() {
  this.newAnimal = this.resetAnimal();
  this.displayAddDialogAnimal = true;
  this.submitted = false;
}
loadAnimaux() {
  if (!this.declarationData?.id) {
    console.error('ID de déclaration non disponible');
    return;
  }

  this.declarationService.getAnimauxByDeclaration(this.declarationData.id)
    .subscribe({
      next: (data) => {
        this.animaux = data.map(animal => this.formatAnimalData(animal));
        this.animauxTemp = [...this.animaux];
        this.isDataModified = false;
        
        console.log('Animaux chargés:', this.animaux); // Pour débogage
      },
      error: (err) => this.handleLoadError(err)
    });
}

// Méthode helper pour formater les données animales
private formatAnimalData(animal: any): any {
  return {
    id: animal.id,
    especes: animal.especes || animal.espece, // Compatibilité API
    nombreTetes: animal.nombreTetes || 0,
    modeAcquisition: animal.modeAcquisition || null,
    anneeAcquisition: this.formatAnnee(animal.anneeAcquisition),
    valeurAcquisition: animal.valeurAcquisition || 0,
    localiteanimalex: animal.localite || animal.localiteanimalex || null,
    fileName: animal.fileName || animal.nomFichier || '', // Priorité à fileName
    fileType: animal.fileType || '',
    fileDownloadUri: animal.fileDownloadUri || animal.cheminFichier || '', // Priorité à fileDownloadUri
    hasDocument: !!(animal.fileName || animal.nomFichier),
    editing: false,
    _backup: null,
    file: null
  };
}

// Gestion centralisée des erreurs
private handleLoadError(err: any): void {
  console.error('Erreur de chargement des animaux:', err);
  this.messageService.add({
    severity: 'error',
    summary: 'Erreur',
    detail: 'Échec du chargement des animaux',
    life: 5000
  });
}



confirmDeleteSelectedAnimaux() {
  if (!this.selectedAnimaux?.length) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Attention',
      detail: 'Aucun animal sélectionné'
    });
    return;
  }
  
  this.confirmationService.confirm({
    message: `Êtes-vous sûr de vouloir supprimer les ${this.selectedAnimaux.length} animaux sélectionnés ?`,
    header: 'Confirmation de suppression',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      this.deleteSelectedAnimaux();
    },
    reject: () => {
      this.messageService.add({
        severity: 'info',
        summary: 'Annulé',
        detail: 'Suppression annulée'
      });
    }
  });
}

/**
 * Supprime les animaux sélectionnés après confirmation
 */
deleteSelectedAnimaux() {
  if (!this.selectedAnimaux?.length) return;

  // Création d'un tableau de promesses pour la suppression
  const deletePromises = this.selectedAnimaux
    .filter(animal => animal.id)
    .map(animal => 
      this.declarationService.deleteAnimal(animal.id).toPromise()
        .catch(error => {
          console.error(`Erreur lors de la suppression de l'animal ${animal.espece}:`, error);
          throw error; // Propager l'erreur pour le traitement global
        })
    );
  
  // Mise à jour optimiste de l'interface utilisateur
  this.animaux = this.animaux.filter(
    a => !this.selectedAnimaux.includes(a)
  );
  this.animauxTemp = [...this.animaux];
  
  // Exécution des suppressions sur le serveur
  Promise.all(deletePromises)
    .then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: `${this.selectedAnimaux.length} animaux supprimés avec succès`
      });
      this.selectedAnimaux = [];
    })
    .catch(error => {
      // En cas d'erreur, recharger les données
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Une erreur est survenue lors de la suppression des animaux'
      });
      this.loadAnimaux(); // Recharger les données pour rétablir l'état cohérent
    });
}
// Document management
showUploadDialogForNewAnimal() {
  this.selectedAnimalDoc = this.newAnimal;
  this.resetFileInputAnimal();
  this.fileInputAnimal?.nativeElement?.click();
}

// In your component class, update these methods:

// Change the showUploadDialogAnimal method to:
showUploadDialogAnimal(animal: any): void {
  this.selectedAnimalDoc = animal;
  this.displayUploadDialogAnimal = true;
  this.resetFileInputAnimal();
}
searchAnimaux(searchText: string) {
  if (!searchText || searchText.trim() === '') {
    this.animauxTemp = [...this.animaux]; // Réinitialise si vide
    return;
  }

  searchText = searchText.toLowerCase();
  this.animauxTemp = this.animaux.filter((animal) =>
    animal.especes?.toLowerCase().includes(searchText)
  );
}

uploadFileAnimal(): void {
  if (!this.selectedFileAnimal || !this.selectedAnimalDoc) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Attention',
      detail: 'Aucun fichier sélectionné'
    });
    return;
  }

  this.uploadDocumentAnimal(this.selectedAnimalDoc, this.selectedFileAnimal);
  this.displayUploadDialogAnimal = false;
  this.selectedFileAnimal = null;
}

downloadDocumentAnimal(animal: any) {
  if (!animal || !animal.hasDocument) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Attention',
      detail: 'Aucun document disponible pour cet animal'
    });
    return;
  }
  
  this.messageService.add({
    severity: 'info',
    summary: 'Téléchargement',
    detail: 'Téléchargement en cours...'
  });
  
  this.declarationService.downloadAnimalDocument(animal.id)
    .subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = animal.nomFichier || 'document';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Téléchargement terminé'
        });
      },
      error: (err) => {
        console.error('Erreur lors du téléchargement du document', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de télécharger le document'
        });
      }
    });
}

// CRUD Operations
addTableRowAnimalToTable() {
  if (!this.validateAnimal(this.tableRowAnimal)) {
    this.showError('Veuillez remplir tous les champs obligatoires');
    return;
  }

  const animalForApi = this.prepareAnimalForApi(this.tableRowAnimal);
  
  this.declarationService.createAnimal(animalForApi).subscribe({
    next: (response) => {
      const newAnimal = { 
        ...this.tableRowAnimal, 
        id: response.id,
        isNew: false,
        hasDocument: false
      };
      
      if (this.tableRowAnimal.file) {
        this.uploadDocumentForNewAnimal(response.id, this.tableRowAnimal.file, newAnimal);
      } else {
        this.animaux.push(newAnimal);
        this.animauxTemp = [...this.animaux];
        this.cancelTableRowAnimal();
        this.showSuccess('Animal ajouté avec succès!');
      }
    },
    error: (err) => this.showError('Erreur lors de l\'ajout de l\'animal')
  });
}

cancelTableRowAnimal() {
  this.isAddingTableRowAnimal = false;
  this.tableRowAnimal = {};
}

displayUploadDialogAnimal = false;
selectedFileAnimal: File | null = null;

handleFileDropAnimal(event: DragEvent): void {
  event.preventDefault();
  event.stopPropagation();

  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    const file = event.dataTransfer.files[0];
    const validExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (validExtensions.includes(fileExtension)) {
      this.selectedFileAnimal = file;
      
      if (this.selectedAnimalDoc) {
        this.selectedAnimalDoc.nomFichier = file.name;
      } else if (this.tableRowAnimal) {
        this.tableRowAnimal.nomFichier = file.name;
      }
      
      this.messageService.add({
        severity: 'success',
        summary: 'Fichier prêt',
        detail: `${file.name} est prêt à être uploadé`,
        life: 3000
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Format non supporté',
        detail: 'Seuls les fichiers PDF, DOC, DOCX, JPG, JPEG, PNG sont acceptés',
        life: 5000
      });
    }
  }
}

cancelUploadAnimal(): void {
  this.displayUploadDialogAnimal = false;
  this.selectedFileAnimal = null;
  this.selectedAnimalDoc = null;
}


 removeSelectedFileAnimal(): void {
  // 1. Pour l'animal en cours d'édition dans le tableau
  if (this.tableRowAnimal) {
    this.tableRowAnimal.file = null;
    this.tableRowAnimal.fileName = null; // ou nomFichier si c'est le nom dans votre modèle
    this.tableRowAnimal.fileType = null;
    this.tableRowAnimal.fileDownloadUri = null;
  }
  
  // 2. Pour l'animal sélectionné
  if (this.selectedAnimalDoc) { // ou selectedAnimal selon votre variable
    this.selectedAnimalDoc.file = null;
    this.selectedAnimalDoc.fileName = null;
    this.selectedAnimalDoc.fileType = null;
    this.selectedAnimalDoc.fileDownloadUri = null;
  }
  
  // 3. Nettoyage du fichier sélectionné et de l'input
  this.selectedFileAnimal = null;
  this.resetFileInputAnimal();
}

filterByEspece(): void {
  if (!this.selectedEspece) {
    this.animauxTemp = [...this.animaux];
    return;
  }
  
  this.animauxTemp = this.animaux.filter(
    a => a.especes?.id === this.selectedEspece.id
  );
}

cancelAddAnimal(): void {
  this.displayAddDialogAnimal = false;
  this.newAnimal = this.resetAnimal();
  this.submitted = false;
}
confirmAddAnimal(): void {
  this.submitted = true;
  
  if (!this.validateAnimal(this.newAnimal)) {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Veuillez remplir correctement tous les champs obligatoires',
      life: 5000
    });
    return;
  }

  this.confirmationService.confirm({
    message: 'Êtes-vous sûr de vouloir ajouter cet animal ?',
    header: 'Confirmation d\'ajout',
    accept: () => {
      this.addAnimal(this.newAnimal);
      this.displayAddDialogAnimal = false;
    }
  });
}



triggerFileUploadAnimal(animal: any) {
  this.selectedAnimalDoc = animal;
  this.resetFileInputAnimal();
  setTimeout(() => {
    this.fileInputAnimal?.nativeElement?.click();
  });
}
private resetFileInputani(): void {
  if (this.fileInputAnimal?.nativeElement) {
    this.fileInputAnimal.nativeElement.value = '';
  }
}

addAnimal(animal: any): void {
  const animalForApi = this.prepareAnimalForApi(animal);
  
  this.declarationService.createAnimal(animalForApi).subscribe({
    next: (response) => {
      const newAnimal = { 
        ...animal,
        id: response.id,
        hasDocument: false
      };
      
      if (animal.file) {
        this.uploadDocumentForNewAnimal(response.id, animal.file, newAnimal);
      } else {
        this.animaux.push(newAnimal);
        this.animauxTemp = [...this.animaux];
        this.showSuccess('Animal ajouté avec succès!');
      }
    },
    error: (err) => this.showError('Erreur lors de l\'ajout')
  });
}

uploadDocumentForNewAnimal(animalId: number, file: File, newAnimal: any): void {
  this.declarationService.uploadAnimalDocument(animalId, file).subscribe({
    next: (response) => {
      newAnimal.fileName = response.fileName;
      newAnimal.fileDownloadUri = response.fileDownloadUri;
      newAnimal.hasDocument = true;
      
      this.animaux.push(newAnimal);
      this.animauxTemp = [...this.animaux];
      this.showSuccess('Animal et document ajoutés avec succès!');
    },
    error: (err) => {
      this.animaux.push(newAnimal);
      this.animauxTemp = [...this.animaux];
      this.showWarning('Animal ajouté, mais document non uploadé');
    }
  });
}
confirmSaveUpdatedAnimal(animal: any): void {
  if (!this.validateAnimal(animal)) {
    this.showError('Veuillez remplir tous les champs obligatoires');
    return;
  }
  
  this.confirmationService.confirm({
    message: 'Êtes-vous sûr de vouloir enregistrer les modifications ?',
    header: 'Confirmation de modification',
    accept: () => {
      this.saveEditedAnimal(animal);
    }
  });
}

startEditAnimal(animal: any): void {
  animal._backup = JSON.parse(JSON.stringify(animal));
  animal.editing = true;
  this.showUploadForAnimalId = animal.id;
}


saveEditedAnimal(animal: any) {
  if (!this.validateAnimal(animal)) {
    this.showError('Veuillez remplir tous les champs obligatoires');
    return;
  }

  const animalForApi = this.prepareAnimalForApi(animal);
  
  this.declarationService.updateAnimal(animal.id, animalForApi)
    .subscribe({
      next: () => {
        animal.editing = false;
        delete animal._backup;
        this.showUploadForAnimalId = null;
        this.showSuccess('Animal mis à jour avec succès!');
      },
      error: (err) => {
        this.showError('Erreur lors de la mise à jour de l\'animal');
        this.cancelEditAnimal(animal);
      }
    });
}

cancelEditAnimal(animal: any) {
  if (animal._backup) {
    Object.assign(animal, animal._backup);
    delete animal._backup;
  }
  animal.editing = false;
  this.showUploadForAnimalId = null;
}

confirmDeleteSelectedAnimals() {
  if (!this.selectedAnimals?.length) return;
  
  this.confirmationService.confirm({
    message: `Êtes-vous sûr de vouloir supprimer les ${this.selectedAnimals.length} animaux sélectionnés ?`,
    header: 'Confirmation de suppression',
    accept: () => {
      this.deleteSelectedAnimals();
    }
  });
}

deleteSelectedAnimals() {
  const deletePromises = this.selectedAnimals
    .filter(animal => animal.id > 0)
    .map(animal => this.declarationService.deleteAnimal(animal.id).toPromise());
  
  this.animaux = this.animaux.filter(
    a => !this.selectedAnimals.includes(a)
  );
  this.animauxTemp = [...this.animaux];
  
  Promise.all(deletePromises)
    .then(() => {
      this.showSuccess('Suppression effectuée avec succès');
      this.selectedAnimals = [];
    })
    .catch(() => {
      this.showError('Erreur lors de la suppression des éléments');
      this.loadAnimaux();
    });
}



// Variables for loans
emprunts: any[] = [];
selectedEmprunts: any[] = [];
empruntsTemp: any[] = [];
displayAddDialogEmprunt = false;
newEmprunt: any = this.resetEmprunt();
tableRowEmprunt: any = {};

@ViewChild('fileUploadEmprunt') fileUploadEmpruntElement: ElementRef;
uploadedFilesEmprunt: any[] = [];
isUploadingEmprunt = false;
selectedEmpruntDoc: any = null;
showUploadForEmpruntId: number | null = null;
selectedInstitution: any = null;
resetEmpruntFilter() {
  this.selectedInstitution = null;
}
// Specific opening method
showAddFormDialogEmprunt() {
  this.newEmprunt = this.resetEmprunt();
  this.displayAddDialogEmprunt = true;
  this.submitted = false;
}

loadEmprunts() {
  if (!this.declarationData?.id) {
    console.error('ID de déclaration non disponible pour les emprunts');
    return;
  }
 
  this.declarationService.getEmpruntsByDeclaration(this.declarationData.id)
    .subscribe({
      next: (data) => {
        this.emprunts = data.map(item => ({
          ...item,
          institutionFinanciere: item.institutionsFinancieres,
          numeroCompte: item.numeroCompte,
          typeEmprunt: item.typeEmprunt,
          montantEmprunt: item.montantEmprunt,
          editing: false,
          hasDocument: !!item.fileName
        }));
        this.empruntsTemp = [...this.emprunts];
        this.isDataModified = false;
      },
      error: (err) => console.error('Erreur lors du chargement des emprunts', err)
    });
}

resetEmprunt(): any {
  return {
    institutionFinanciere: null,
    numeroCompte: null,
    typeEmprunt: null,
    montantEmprunt: null,
    hasDocument: false
  };
}

validateEmprunt(emprunt: any): boolean {
  return !!emprunt.institutionFinanciere && 
         !!emprunt.numeroCompte && 
         !!emprunt.typeEmprunt && 
         (emprunt.montantEmprunt > 0);
}

// Document management
showUploadDialogForNewEmprunt() {
  this.selectedEmpruntDoc = this.newEmprunt;
  this.resetFileInputEmprunt();
  this.fileUploadEmpruntElement?.nativeElement?.click();
}

onFileSelectEmprunt(event: any) {
  if (!event.target.files || event.target.files.length === 0) {
    this.showError('Aucun fichier sélectionné');
    return;
  }

  const file = event.target.files[0];
  
  if (this.selectedEmpruntDoc) {
    this.selectedEmpruntDoc.file = file;
    this.selectedEmpruntDoc.fileName = file.name;
    this.selectedEmpruntDoc.fileType = file.type;
    this.showSuccess('Document prêt à être uploadé avec l\'emprunt');
  }
}
uploadDocumentEmprunt(emprunt: any, file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    this.isUploadingEmprunt = true;
    
    this.declarationService.uploadEmpruntDocument(emprunt.id, file)
      .subscribe({
        next: (response) => {
          // Mise à jour de l'emprunt dans le tableau
          const index = this.empruntsTemp.findIndex(e => e.id === emprunt.id);
          if (index !== -1) {
            this.empruntsTemp[index] = {
              ...this.empruntsTemp[index],
              fileName: response.fileName,
              fileType: response.fileType,
              fileDownloadUri: response.fileDownloadUri,
              hasDocument: true
            };
          }
          
          // Mise à jour de l'emprunt sélectionné
          if (this.selectedEmpruntDoc?.id === emprunt.id) {
            this.selectedEmpruntDoc = {
              ...this.selectedEmpruntDoc,
              fileName: response.fileName,
              hasDocument: true
            };
          }
          
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Document téléchargé avec succès'
          });
          resolve(response);
          this.isUploadingEmprunt = false;
        },
        error: (err) => {
          console.error('Erreur upload document', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Échec du téléchargement du document'
          });
          reject(err);
          this.isUploadingEmprunt = false;
        }
      });
  });
}

downloadDocumentEmprunt(emprunt: any) {
  if (!emprunt || !emprunt.hasDocument) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Attention',
      detail: 'Aucun document disponible pour cet emprunt'
    });
    return;
  }
  
  this.messageService.add({
    severity: 'info',
    summary: 'Téléchargement',
    detail: 'Téléchargement en cours...'
  });
  
  this.declarationService.downloadEmpruntNonBatiDocument(emprunt.id)
    .subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = emprunt.fileName || 'document';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Téléchargement terminé'
        });
      },
      error: (err) => {
        console.error('Erreur lors du téléchargement du document', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de télécharger le document'
        });
      }
    });
}

// CRUD Operations
addTableRowEmpruntToTable() {
  if (!this.validateEmprunt(this.tableRowEmprunt)) {
    this.showError('Veuillez remplir tous les champs obligatoires');
    return;
  }

  const empruntForApi = this.prepareEmpruntForApi(this.tableRowEmprunt);
  
  this.declarationService.createEmprunt(empruntForApi).subscribe({
    next: (response) => {
      const newEmprunt = { 
        ...this.tableRowEmprunt, 
        id: response.id,
        isNew: false,
        hasDocument: false
      };
      
      if (this.tableRowEmprunt.file) {
        this.uploadDocumentForNewEmprunt(response.id, this.tableRowEmprunt.file, newEmprunt);
      } else {
        this.emprunts.push(newEmprunt);
        this.empruntsTemp = [...this.emprunts];
        this.cancelTableRowEmprunt();
        this.showSuccess('Emprunt ajouté avec succès!');
      }
    },
    error: (err) => this.showError('Erreur lors de l\'ajout de l\'emprunt')
  });
}

cancelTableRowEmprunt() {
  this.isAddingTableRow = false;
  this.tableRowEmprunt = {};
}

displayUploadDialogEmprunt = false;
selectedFileEmprunt: File | null = null;

handleFileDropEmprunt(event: DragEvent): void {
  event.preventDefault();
  event.stopPropagation();

  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    const file = event.dataTransfer.files[0];
    const validExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (validExtensions.includes(fileExtension)) {
      this.selectedFileEmprunt = file;
      
      if (this.selectedEmpruntDoc) {
        this.selectedEmpruntDoc.fileName = file.name;
      } else if (this.tableRowEmprunt) {
        this.tableRowEmprunt.fileName = file.name;
      }
      
      this.messageService.add({
        severity: 'success',
        summary: 'Fichier prêt',
        detail: `${file.name} est prêt à être uploadé`,
        life: 3000
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Format non supporté',
        detail: 'Seuls les fichiers PDF, DOC, DOCX, JPG, JPEG, PNG sont acceptés',
        life: 5000
      });
    }
  }
}

showUploadDialogEmprunt(emprunt: any): void {
  this.selectedEmpruntDoc = emprunt;
  this.displayUploadDialogEmprunt = true;
  this.resetFileInputEmprunt();
}
triggerFileUploadEmprunt(emprunt: any): void {
  this.selectedEmpruntDoc = emprunt;
  this.resetFileInputEmprunt();
  setTimeout(() => {
    this.fileUploadEmpruntElement?.nativeElement?.click();
  });
}
uploadFileEmprunt(): void {
  if (!this.selectedFileEmprunt || !this.selectedEmpruntDoc) return;

  this.uploadDocumentEmprunt(this.selectedEmpruntDoc, this.selectedFileEmprunt);
  this.displayUploadDialogEmprunt = false;
  this.selectedFileEmprunt = null;
}

cancelUploadEmprunt(): void {
  this.displayUploadDialogEmprunt = false;
  this.selectedFileEmprunt = null;
  this.selectedEmpruntDoc = null;
}

removeSelectedFileEmprunt(): void {
  this.newEmprunt.file = null;
  this.newEmprunt.fileName = null;
  this.newEmprunt.fileType = null;
}

filterByInstitution(): void {
  if (!this.selectedInstitution) {
    this.empruntsTemp = [...this.emprunts];
    return;
  }
  
  this.empruntsTemp = this.emprunts.filter(
    e => e.institutionFinanciere?.id === this.selectedInstitution.id
  );
}

cancelAddEmprunt(): void {
  this.displayAddDialogEmprunt = false;
  this.newEmprunt = this.resetEmprunt();
  this.submitted = false;
}

confirmAddEmprunt(): void {
  this.submitted = true;
  
  if (!this.newEmprunt.institutionFinanciere || 
      !this.newEmprunt.numeroCompte ||
      !this.newEmprunt.typeEmprunt ||
      this.newEmprunt.montantEmprunt === null) {
    this.showError('Veuillez remplir tous les champs obligatoires');
    return;
  }

  this.confirmationService.confirm({
    message: 'Êtes-vous sûr de vouloir ajouter cet emprunt ?',
    header: 'Confirmation d\'ajout',
    accept: () => {
      this.addEmprunt(this.newEmprunt);
      this.displayAddDialogEmprunt = false;
    },
    reject: () => {
    }
  });
}

addEmprunt(emprunt: any) {
  const empruntForApi = this.prepareEmpruntForApi(emprunt);
  
  this.declarationService.createEmprunt(empruntForApi).subscribe({
    next: (response) => {
      const newEmprunt = { 
        ...emprunt, 
        id: response.id,
        hasDocument: false
      };
      
      if (emprunt.file) {
        this.uploadDocumentForNewEmprunt(response.id, emprunt.file, newEmprunt);
      } else {
        this.emprunts.push(newEmprunt);
        this.empruntsTemp = [...this.emprunts];
        this.newEmprunt = this.resetEmprunt();
        this.showSuccess('Emprunt ajouté avec succès!');
      }
    },
    error: (err) => this.showError('Erreur lors de l\'ajout de l\'emprunt')
  });
}

confirmSaveUpdatedEmprunt(emprunt: any): void {
  if (!this.validateEmprunt(emprunt)) {
    this.showError('Veuillez remplir tous les champs obligatoires');
    return;
  }
  
  this.confirmationService.confirm({
    message: 'Êtes-vous sûr de vouloir enregistrer les modifications ?',
    header: 'Confirmation de modification',
    accept: () => {
      this.saveEditedEmprunt(emprunt);
    }
  });
}

startEditEmprunt(emprunt: any): void {
  emprunt._backup = {...emprunt};
  emprunt.editing = true;
  this.showUploadForEmpruntId = emprunt.id;
  this.selectedEmpruntDoc = emprunt; // Important pour la gestion des fichiers
}

uploadDocumentForNewEmprunt(empruntId: number, file: File, newEmprunt: any) {
  this.declarationService.uploadEmpruntDocument(empruntId, file)
    .subscribe({
      next: (response) => {
        if (response) {
          newEmprunt.hasDocument = true;
          newEmprunt.fileName = response.fileName;
          newEmprunt.fileType = response.fileType;
          newEmprunt.fileDownloadUri = response.fileDownloadUri;
        }
        
        this.emprunts.push(newEmprunt);
        this.empruntsTemp = [...this.emprunts];
        this.cancelTableRowEmprunt();
        this.showSuccess('Emprunt ajouté avec succès!');
      },
      error: (err) => {
        this.emprunts.push(newEmprunt);
        this.empruntsTemp = [...this.emprunts];
        this.cancelTableRowEmprunt();
        this.showWarning('Emprunt ajouté, mais erreur lors du téléchargement du document');
      }
    });
}

saveEditedEmprunt(emprunt: any) {
  if (!this.validateEmprunt(emprunt)) {
    this.showError('Veuillez remplir tous les champs obligatoires');
    return;
  }

  const empruntForApi = this.prepareEmpruntForApi(emprunt);
  
  this.declarationService.updateEmprunt(emprunt.id, empruntForApi)
    .subscribe({
      next: () => {
        emprunt.editing = false;
        delete emprunt._backup;
        this.showUploadForEmpruntId = null;
        this.showSuccess('Emprunt mis à jour avec succès!');
      },
      error: (err) => {
        this.showError('Erreur lors de la mise à jour de l\'emprunt');
        this.cancelEditEmprunt(emprunt);
      }
    });
}

cancelEditEmprunt(emprunt: any) {
  if (emprunt._backup) {
    Object.assign(emprunt, emprunt._backup);
    delete emprunt._backup;
  }
  emprunt.editing = false;
  this.showUploadForEmpruntId = null;
}

confirmDeleteSelectedEmprunts() {
  if (!this.selectedEmprunts?.length) return;
  
  this.confirmationService.confirm({
    message: `Êtes-vous sûr de vouloir supprimer les ${this.selectedEmprunts.length} emprunts sélectionnés ?`,
    header: 'Confirmation de suppression',
    accept: () => {
      this.deleteSelectedEmprunts();
    }
  });
}

deleteSelectedEmprunts() {
  const deletePromises = this.selectedEmprunts
    .filter(emprunt => emprunt.id > 0)
    .map(emprunt => this.declarationService.deleteEmprunt(emprunt.id).toPromise());
  
  this.emprunts = this.emprunts.filter(
    e => !this.selectedEmprunts.includes(e)
  );
  this.empruntsTemp = [...this.emprunts];
  
  Promise.all(deletePromises)
    .then(() => {
      this.showSuccess('Suppression effectuée avec succès');
      this.selectedEmprunts = [];
    })
    .catch(() => {
      this.showError('Erreur lors de la suppression des éléments');
      this.loadEmprunts();
    });
}

// Prepare for API
prepareEmpruntForApi(emprunt: any) {
  return {
    id: emprunt.id > 0 ? emprunt.id : null,
    institutionsFinancieres: emprunt.institutionFinanciere ? 
      { id: emprunt.institutionFinanciere.id || emprunt.institutionFinanciere } : null,
    numeroCompte: emprunt.numeroCompte,
    typeEmprunt: emprunt.typeEmprunt ? 
      { id: emprunt.typeEmprunt.id || emprunt.typeEmprunt } : null,
    montantEmprunt: emprunt.montantEmprunt,
    dateCreation: emprunt.dateCreation || new Date().toISOString().split('T')[0],
    idDeclaration: { id: this.declarationData.id },
    fileName: emprunt.fileName,
    fileType: emprunt.fileType,
    fileDownloadUri: emprunt.fileDownloadUri
  };
}

private resetFileInputEmprunt() {
  if (this.fileUploadEmpruntElement?.nativeElement) {
    this.fileUploadEmpruntElement.nativeElement.value = '';
  }
  
}





// Variables de base pour les espèces
especes: any[] = [];
selectedEspeces: any[] = [];
especeTemp: any[] = [];
isAddingEspece = false;
newEspece: any = this.resetEspece();
tableRowEspece: any = {};

// Variables pour l'affichage des dialogues
displayAddDialogEspece = false;

// Variables pour la gestion des fichiers
@ViewChild('fileUploadEspece') fileUploadEspeceElement: ElementRef;
uploadedFilesEspece: any[] = [];
isUploadingEspece = false;
selectedEspeceDoc: any = null;
showUploadForEspeceId: number | null = null;
displayUploadDialogEspece = false;
selectedFileEspece: File | null = null;

// Méthode d'ouverture du dialogue d'ajout
showAddFormDialogEspece() {
  this.newEspece = this.resetEspece();
  this.displayAddDialogEspece = true;
  this.submitted = false;
}

// Chargement des espèces depuis l'API
loadEspeces() {
  if (!this.declarationData?.id) {
    console.error('ID de déclaration non disponible pour les espèces');
    return;
  }
 
  this.declarationService.getEspecesByDeclaration(this.declarationData.id)
    .subscribe({
      next: (data) => {
        this.especes = data.map(item => ({
          ...item,
          isEdit: false,
          hasDocument: !!item.fileName
        }));
        this.especeTemp = [...this.especes];
        this.isDataModified = false;
      },
      error: (err) => console.error('Erreur lors du chargement des espèces', err)
    });
}



// Réinitialisation d'une espèce
resetEspece(): any {
  return {
    devise: null,
    monnaie: null,
    tauxChange: null,
    montantFCFA: 0,
    dateEspece: null,
    hasDocument: false,
    fileName: null,
    file: null
  };
}
validateEspece(espece: any): boolean {
  // Debug: Affiche les valeurs en console
  console.log('Validation des champs:', {
    devise: espece.devise,
    monnaie: espece.monnaie,
    tauxChange: espece.tauxChange,
    dateEspece: espece.dateEspece,
    types: {
      devise: typeof espece.devise,
      monnaie: typeof espece.monnaie,
      tauxChange: typeof espece.tauxChange,
      date: typeof espece.dateEspece
    }
  });

  // Validation robuste
  const isDeviseValid = !!espece.devise && 
                       espece.devise !== 'null' && 
                       espece.devise !== 'undefined';
  
  const isMonnaieValid = !isNaN(Number(espece.monnaie)) && 
                         Number(espece.monnaie) > 0;
  
  const isTauxValid = !isNaN(Number(espece.tauxChange)) && 
                      Number(espece.tauxChange) > 0;
  
  const isDateValid = !!espece.dateEspece;

  if (!isDeviseValid) console.error('Devise invalide');
  if (!isMonnaieValid) console.error('Monnaie invalide');
  if (!isTauxValid) console.error('Taux invalide');
  if (!isDateValid) console.error('Date invalide');

  return isDeviseValid && isMonnaieValid && isTauxValid && isDateValid;
}
// Calcul du montant FCFA
calculateFCFA(espece: any): number {
  if (espece.monnaie && espece.tauxChange) {
    espece.montantFCFA = espece.monnaie * espece.tauxChange;
    return espece.montantFCFA;
  }
  return 0;
}

// Formatage de la date
formatDate(date: any): string {
  return date instanceof Date ? date.toISOString().split('T')[0] : date;
}
// Update the showUploadDialogForNewEspece method
showUploadDialogForNewEspece() {
  this.selectedEspeceDoc = this.newEspece; // Changed from tableRowEspece to newEspece
  this.resetFileInputEspece();
  setTimeout(() => {
    this.fileUploadEspeceElement?.nativeElement?.click();
  });
}
uploadDocumentEspece(espece: any, file: File): Observable<any> {
  this.isUploadingEspece = true;
  
  return this.declarationService.uploadEspecesDocument(espece.id, file).pipe(
    tap((response) => {
      if (response) {
        espece.fileName = response.fileName;
        espece.fileType = response.fileType;
        espece.fileDownloadUri = response.fileDownloadUri;
        espece.hasDocument = true;
        espece.file = null; // Reset le fichier après upload
        
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Document téléchargé avec succès'
        });
      }
    }),
    finalize(() => {
      this.isUploadingEspece = false;
    })
  );
}

downloadDocumentEspece(espece: any) {
  if (!espece || !espece.hasDocument) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Attention',
      detail: 'Aucun document disponible pour cette espèce'
    });
    return;
  }
  
  this.messageService.add({
    severity: 'info',
    summary: 'Téléchargement',
    detail: 'Téléchargement en cours...'
  });
  
  this.declarationService.downloadEspecesDocument(espece.id)
    .subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = espece.fileName || 'document';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Téléchargement terminé'
        });
      },
      error: (err) => {
        console.error('Erreur lors du téléchargement du document', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de télécharger le document'
        });
      }
    });
}

// CRUD Operations - Ajout en tableau
addTableRowEspece() {
  if (!this.validateEspece(this.tableRowEspece)) {
    this.showError('Veuillez remplir tous les champs obligatoires');
    return;
  }

  // Conversion en nombre
  this.tableRowEspece.monnaie = Number(this.tableRowEspece.monnaie);
  this.tableRowEspece.tauxChange = Number(this.tableRowEspece.tauxChange);
  this.calculateFCFA(this.tableRowEspece);

  const especeForApi = this.prepareEspeceForApi(this.tableRowEspece);
  
  this.declarationService.createEspece(especeForApi).subscribe({
    next: (response) => {
      const newEspece = { 
        ...this.tableRowEspece, 
        id: response.id,
        isNew: false,
        hasDocument: false
      };
      
      if (this.tableRowEspece.file) {
        this.uploadDocumentForNewEspece(response.id, this.tableRowEspece.file, newEspece);
      } else {
        this.especes.push(newEspece);
        this.especeTemp = [...this.especes];
        this.cancelTableRowEspece();
        this.showSuccess('Espèce ajoutée avec succès!');
      }
    },
    error: (err) => this.showError('Erreur lors de l\'ajout de l\'espèce')
  });
}

cancelTableRowEspece() {
  this.isAddingEspece = false;
  this.tableRowEspece = {};
}

// Gestion des fichiers par Drag & Drop
handleFileDropEspece(event: DragEvent): void {
  event.preventDefault();
  event.stopPropagation();

  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    const file = event.dataTransfer.files[0];
    const validExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (validExtensions.includes(fileExtension)) {
      this.selectedFileEspece = file;
      
      if (this.selectedEspeceDoc) {
        this.selectedEspeceDoc.fileName = file.name;
      } else if (this.tableRowEspece) {
        this.tableRowEspece.fileName = file.name;
      }
      
      this.messageService.add({
        severity: 'success',
        summary: 'Fichier prêt',
        detail: `${file.name} est prêt à être uploadé`,
        life: 3000
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Format non supporté',
        detail: 'Seuls les fichiers PDF, DOC, DOCX, JPG, JPEG, PNG sont acceptés',
        life: 5000
      });
    }
  }
}

// Déclarez cette variable dans votre composant
@ViewChild('fileUploadEspece') fileUploadEspece: any;

// Méthode pour déclencher l'upload
triggerFileUploadESS(espece: any): void {
  this.selectedEspeceDoc = espece;
  this.showUploadForEspeceId = espece.id;
  
  // Reset et déclenchement du file input
  this.resetFileInputEspece();
  setTimeout(() => {
    this.fileUploadEspece.nativeElement.click();
  });
}
onFileSelectEspece(event: any) {
  try {
    // Vérification du fichier
    if (!event.target.files || event.target.files.length === 0) {
      this.showError('Aucun fichier sélectionné');
      return;
    }

    const file = event.target.files[0];
    
    // Vérification de la taille du fichier (exemple: 5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      this.showError('Le fichier est trop volumineux (max 5MB)');
      return;
    }

    // Vérification du type de fichier
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      this.showError('Type de fichier non supporté (PDF, JPEG, PNG uniquement)');
      return;
    }

    // Gestion selon le contexte (édition existante ou nouvelle espèce)
    if (this.selectedEspeceDoc) {
      // Pour une espèce existante
      this.selectedEspeceDoc.file = file;
      this.selectedEspeceDoc.fileName = file.name;
      this.selectedEspeceDoc.fileType = file.type;
      this.selectedEspeceDoc.hasDocument = true; // Mise à jour du statut

      this.showSuccess('Document prêt à être uploadé avec l\'espèce');
      
      // Upload immédiat pour les espèces existantes
      if (this.selectedEspeceDoc.id) {
        this.uploadDocumentEspece(this.selectedEspeceDoc, file).subscribe({
          error: (err) => {
            console.error('Erreur upload:', err);
            this.selectedEspeceDoc.hasDocument = false;
            this.showError('Échec de l\'upload du document');
          }
        });
      }
    } else if (this.newEspece) {
      // Pour une nouvelle espèce
      this.newEspece.file = file;
      this.newEspece.fileName = file.name;
      this.newEspece.fileType = file.type;
      this.newEspece.hasDocument = true;
      this.showSuccess('Document associé à la nouvelle espèce');
    }

    // Réinitialisation du champ file pour permettre la sélection du même fichier
    event.target.value = '';

  } catch (error) {
    console.error('Erreur dans onFileSelectEspece:', error);
    this.showError('Une erreur est survenue lors de la sélection du fichier');
  }
}
uploadFileEspece(): void {
  if (!this.selectedFileEspece || !this.selectedEspeceDoc) return;

  this.uploadDocumentEspece(this.selectedEspeceDoc, this.selectedFileEspece);
  this.displayUploadDialogEspece = false;
  this.selectedFileEspece = null;
}

cancelUploadEspece(): void {
  this.displayUploadDialogEspece = false;
  this.selectedFileEspece = null;
  this.selectedEspeceDoc = null;
}

removeSelectedFileEspece(): void {
  this.newEspece.file = null;
  this.newEspece.fileName = null;
  this.newEspece.fileType = null;
  // Important: garder hasDocument à true si un fichier existait déjà
  // this.newEspece.hasDocument = false; // Ne pas faire ça
}
// Filtres et recherches
devises: any[] = [];
selectedDevise: any = null;

resetDeviseFilter(): void {
  this.selectedDevise = null;
  this.especeTemp = [...this.especes];
}

filterByDevise(): void {
  if (!this.selectedDevise) {
    this.especeTemp = [...this.especes];
    return;
  }
  
  this.especeTemp = this.especes.filter(
    e => e.devise === this.selectedDevise
  );
}
// Méthodes de dialogue et confirmation
cancelAddEspece(): void {
  this.displayAddDialogEspece = false;
  this.tableRowEspece = {};
  this.submitted = false;
}
confirmAddEspece(): void {
  this.submitted = true;
  
  // Validation des champs obligatoires
  if (!this.validateEspece(this.newEspece)) {
    this.showError('Veuillez remplir tous les champs obligatoires');
    return;
  }

  // Préparation des données
  const especeForApi = this.prepareEspeceForApi(this.newEspece);
  
  this.declarationService.createEspece(especeForApi).subscribe({
    next: (response) => {
      const newEspece = { 
        ...this.newEspece,
        id: response.id,
        hasDocument: false
      };
      
      // Upload du document seulement si un fichier est sélectionné
      if (this.newEspece.file) {
        this.uploadDocumentForNewEspece(response.id, this.newEspece.file, newEspece);
      } else {
        // Ajout sans document
        this.especes.push(newEspece);
        this.especeTemp = [...this.especes];
        this.showSuccess('Espèce ajoutée avec succès (sans document)!');
      }
      
      this.displayAddDialogEspece = false;
      this.newEspece = this.resetEspece();
    },
    error: (err) => {
      this.showError('Erreur lors de l\'ajout de l\'espèce');
      console.error(err);
    }
  });
}
addEspece(espece: any) {
  const especeForApi = this.prepareEspeceForApi(espece);
  
  this.declarationService.createEspece(especeForApi).subscribe({
    next: (response) => {
      const newEspece = { 
        ...espece, 
        id: response.id,
        hasDocument: false
      };
      
      if (espece.file) {
        this.uploadDocumentForNewEspece(response.id, espece.file, newEspece);
      } else {
        this.especes.push(newEspece);
        this.especeTemp = [...this.especes];
        this.newEspece = this.resetEspece();
        this.showSuccess('Espèce ajoutée avec succès!');
      }
    },
    error: (err) => this.showError('Erreur lors de l\'ajout de l\'espèce')
  });
}

// Édition d'une espèce
confirmSaveUpdatedEspece(espece: any): void {
  if (!this.validateEspece(espece)) {
    this.showError('Veuillez remplir tous les champs obligatoires');
    return;
  }
  
  this.confirmationService.confirm({
    message: 'Êtes-vous sûr de vouloir enregistrer les modifications ?',
    header: 'Confirmation de modification',
    accept: () => {
      this.saveEditedEspece(espece);
    }
  });
}
// Update the startEditEspece method
startEditEspece(espece: any): void {
  // Create a deep copy for backup
  espece._backup = JSON.parse(JSON.stringify(espece));
  espece.isEdit = true;
  this.showUploadForEspeceId = espece.id;
}


uploadDocumentForNewEspece(especeId: number, file: File, newEspece: any) {
  this.declarationService.uploadEspecesDocument(especeId, file)
    .subscribe({
      next: (response) => {
        if (response) {
          newEspece.hasDocument = true;
          newEspece.fileName = response.fileName;
          newEspece.fileType = response.fileType;
          newEspece.fileDownloadUri = response.fileDownloadUri;
        }
        
        this.especes.push(newEspece);
        this.especeTemp = [...this.especes];
        this.cancelTableRowEspece();
        this.showSuccess('Espèce ajoutée avec succès!');
      },
      error: (err) => {
        this.especes.push(newEspece);
        this.especeTemp = [...this.especes];
        this.cancelTableRowEspece();
        this.showWarning('Espèce ajoutée, mais erreur lors du téléchargement du document');
      }
    });
}saveEditedEspece(espece: any) {
  // Conversion explicite
  espece.monnaie = this.convertToNumber(espece.monnaie);
  espece.tauxChange = this.convertToNumber(espece.tauxChange);
  
  // Formatage de la date si nécessaire
  if (espece.dateEspece instanceof Date) {
    espece.dateEspece = this.formatDate(espece.dateEspece);
  }

  // Debug avant validation
  console.log('Données avant validation:', espece);

  if (!this.validateEspece(espece)) {
    this.showError('Champs obligatoires manquants ou invalides - voir console');
    return;
  }

  const especeForApi = this.prepareEspeceForApi(espece);
  
  this.declarationService.updateEspece(espece.id, especeForApi).subscribe({
    next: () => {
      if (espece.file) {
        this.uploadDocumentEspece(espece, espece.file).subscribe({
          next: () => this.finalizeEditSuccess(espece),
          error: () => this.finalizeEditWithWarning(espece)
        });
      } else {
        this.finalizeEditSuccess(espece);
      }
    },
    error: (err) => {
      console.error('Erreur update:', err);
      this.showError('Erreur technique lors de la mise à jour');
      this.cancelEditEspece(espece);
    }
  });
}

private convertToNumber(value: any): number {
  if (typeof value === 'string') {
    // Gère les formats français (virgules) et supprime les espaces
    return parseFloat(value.replace(/\s/g, '').replace(',', '.'));
  }
  return Number(value);
}
private finalizeEditSuccess(espece: any) {
  espece.isEdit = false;
  delete espece._backup;
  this.showSuccess('Modification enregistrée avec succès');
  this.loadEspeces(); // Rafraîchit les données
}

private finalizeEditWithWarning(espece: any) {
  espece.isEdit = false;
  this.showWarning('Données enregistrées mais problème avec le document');
  this.loadEspeces(); // Rafraîchit les données
}
private finalizeEdit(espece: any, withWarning = false) {
  espece.isEdit = false;
  delete espece._backup;
  this.showUploadForEspeceId = null;
  
  if (withWarning) {
    this.showWarning('Espèce mise à jour mais problème avec le document');
  } else {
    this.showSuccess('Espèce mise à jour avec succès!');
  }
  
  // Recharger les données
  this.loadEspeces();
}
cancelEditEspece(espece: any) {
  if (espece._backup) {
    Object.assign(espece, espece._backup);
    delete espece._backup;
  }
  espece.isEdit = false;
  this.showUploadForEspeceId = null;
}

// Suppression des espèces
archiveSelectedEspeces() {
  if (!this.selectedEspeces?.length) return;
  
  this.confirmationService.confirm({
    message: 'Êtes-vous sûr de vouloir supprimer les espèces sélectionnées ?',
    header: 'Confirmation de suppression',
    accept: () => {
      this.deleteSelectedEspeces();
    }
  });
}

deleteSelectedEspeces() {
  const deletePromises = this.selectedEspeces
    .filter(espece => espece.id > 0)
    .map(espece => 
      this.declarationService.deleteEspece(espece.id).pipe(
        catchError(err => {
          console.error(`Erreur lors de la suppression de l'espèce ${espece.id}`, err);
          return of(null);
        })
      ).toPromise()
    );
  
  this.especes = this.especes.filter(
    e => !this.selectedEspeces.includes(e)
  );
  this.especeTemp = [...this.especes];
  
  Promise.all(deletePromises)
    .then(() => {
      this.showSuccess('Suppression effectuée avec succès');
      this.selectedEspeces = [];
    })
    .catch(() => {
      this.showError('Erreur lors de la suppression des éléments');
      this.loadEspeces();
    });
}

// Préparation des données pour l'API
prepareEspeceForApi(espece: any) {
  return {
    id: espece.id > 0 ? espece.id : null,
    devise: espece.deviseDetails?.id || espece.devise, // Prend soit l'ID de deviseDetails soit la valeur directe
    monnaie: espece.monnaie,
    tauxChange: espece.tauxChange,
    montantFCFA: espece.montantFCFA,
    dateEspece: espece.dateEspece instanceof Date
      ? espece.dateEspece.toISOString().split('T')[0]
      : espece.dateEspece,
    dateCreation: espece.dateCreation || new Date().toISOString().split('T')[0],
    idDeclaration: { id: this.declarationData.id },
    fileName: espece.fileName,
    fileType: espece.fileType,
    fileDownloadUri: espece.fileDownloadUri
  };
}

// Réinitialisation de l'entrée de fichier
private resetFileInputEspece() {
  if (this.fileUploadEspeceElement?.nativeElement) {
    this.fileUploadEspeceElement.nativeElement.value = '';
  }
}
confirmDeleteSelectedespece() {
  if (!this.selectedEspeces?.length) {
    this.showError('Veuillez sélectionner au moins une espèce à supprimer');
    return;
  }

  this.confirmationService.confirm({
    message: `Êtes-vous sûr de vouloir supprimer les ${this.selectedEspeces.length} espèces sélectionnées ?`,
    header: 'Confirmation de suppression',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      this.deleteSelectedEspeces();
    }
  });
}


@ViewChild('fileUploadTitres') fileUploadTitresElement: ElementRef;
titresTemp: any[] = [];
selectedTitres: any[] = [];
tableRowTitre: any = this.resetTitre();
selectedTitre: any = null;
showUploadForTitreId: number | null = null;
originalTitresData: any[] = [];
selectedTitrestDoc: any = null;
displayUploadDialogtitres = false;

// Méthodes d'affichage des dialogues
showUploadDialogtitres(titre: any): void {
  this.selectedTitrestDoc = titre;
  this.displayUploadDialogtitres = true;
  this.resetFileInputTitres();
}

showUploadDialogForNewTitre(): void {
  this.selectedTitrestDoc = this.titresTemp; // Utilisez newTitre ou tableRowTitre selon votre structure
  this.resetFileInputTitres();
  setTimeout(() => {
    this.fileUploadTitresElement?.nativeElement?.click();
  });
}
// Méthodes de chargement et filtrage
loadTitresForDeclaration() {
  if (!this.declarationData?.id) {
    console.error('ID de déclaration non disponible pour les titres');
    return;
  }

  this.loading = true;
  this.declarationService.getTitresByDeclaration(this.declarationData.id).subscribe({
    next: (data) => {
      this.titresTemp = data.map(item => ({
        ...item,
        designationNatureAction: item.designationNatureActions,
        valeurEmplacement: item.valeurEmplacement,
        emplacement: item.emplacement,
        autrePrecision: item.autrePrecisions,
        dateAcquisition: item.dateAcquisition,
        provenance: item.provenance,
        hasDocument: !!item.fileName,
        isEdit: false
      }));
      
      this.originalTitresData = [...this.titresTemp];
      this.isDataModified = false;
      this.loading = false;
    },
    error: (err) => {
      console.error('Erreur lors du chargement des titres', err);
      this.error = 'Impossible de charger les titres existants';
      this.loading = false;
    }
  });
}
filterByDesignationtitres() {
  if (!this.selectedDesignation) {
    this.titresTemp = [...this.originalTitresData];
    return;
  }

  this.titresTemp = this.originalTitresData.filter(
    t => t.designationNatureAction?.id === this.selectedDesignation.id
  );
  
  // Alternative si le filtrage doit se faire côté serveur :
  // this.loading = true;
  // this.declarationService.getTitresByDesignation(this.selectedDesignation.id)
  //   .subscribe({
  //     next: (data) => {
  //       this.titresTemp = data;
  //       this.loading = false;
  //     }
  //   });
}

resetDesignationFilter(): void {
  this.selectedDesignation = null;
  
  // Réinitialiser avec les données originales si disponibles
  if (this.originalTitresData?.length > 0) {
    this.titresTemp = [...this.originalTitresData];
    //return;
  }
  
  // Sinon recharger depuis le serveur
  this.loadTitresForDeclaration();
}
// Méthodes de gestion des fichiers
triggerFileUploadtitres(titre: any) {
  this.selectedTitre = titre;
  this.fileUploadTitresElement.nativeElement.click();
}

downloadDocumenttitres(titre: any) {
  if (!titre?.hasDocument) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Attention',
      detail: 'Aucun document disponible pour ce titre'
    });
    return;
  }
  
  this.messageService.add({
    severity: 'info',
    summary: 'Téléchargement',
    detail: 'Téléchargement en cours...'
  });
  
  this.declarationService.downloadTitresDocument(titre.id).subscribe({
    next: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = titre.fileName || 'document';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Téléchargement terminé'
      });
    },
    error: (err) => {
      console.error('Erreur lors du téléchargement', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de télécharger le document'
      });
    }
  });
}uploadDocumentTitre(titre: any, file: File): Observable<any> {
  this.isUploading = true;
  
  return this.declarationService.uploadTitresDocument(titre.id, file).pipe(
    tap((response) => {
      // Mise à jour des propriétés du titre
      titre.fileName = response.fileName;
      titre.fileType = response.fileType;
      titre.fileDownloadUri = response.fileDownloadUri;
      titre.hasDocument = true;
      
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Document téléchargé avec succès',
        life: 3000
      });
    }),
    catchError((error) => {
      console.error('Erreur détaillée:', error);
      
      const errorMessage = error.message.includes('Erreur:') 
        ? error.message 
        : `Échec de l'upload: ${error.message}`;
      
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: errorMessage,
        life: 5000
      });
      
      return throwError(() => new Error(errorMessage));
    }),
    finalize(() => {
      this.isUploading = false;
      this.selectedTitre = null;
    })
  );
}
onFileSelecttitres(event: any) {
  try {
    if (!event.target.files || event.target.files.length === 0) {
      this.showError('Aucun fichier sélectionné');
      return;
    }

    const file = event.target.files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (file.size > maxSize) {
      this.showError('Le fichier est trop volumineux (max 5MB)');
      return;
    }

    if (!this.isValidFileType(file)) {
      this.showError('Type de fichier non supporté (PDF, JPEG, PNG uniquement)');
      return;
    }

    if (this.selectedTitre) {
      // Pour les titres existants (modification)
      this.uploadDocumentTitre(this.selectedTitre, file).subscribe({
        next: () => {
          this.selectedTitre.fileName = file.name;
          this.selectedTitre.fileType = file.type;
          this.selectedTitre.hasDocument = true;
          this.showSuccess('Document mis à jour avec succès');
        },
        error: (err) => {
          console.error('Erreur upload:', err);
          this.showError('Échec de l\'upload du document');
        }
      });
    } else if (this.tableRowTitre) {
      // Pour les nouveaux titres
      this.tableRowTitre.file = file;
      this.tableRowTitre.fileName = file.name;
      this.tableRowTitre.fileType = file.type;
      this.showSuccess('Document prêt à être associé au titre');
    }

    event.target.value = '';
  } catch (error) {
    console.error('Erreur dans onFileSelect:', error);
    this.showError('Erreur lors de la sélection du fichier');
  }
}

// Méthodes CRUD
resetTitre(): any {
  return {
    designationNatureAction: null,
    valeurEmplacement: 0,
    emplacement: null,
    autrePrecision: null,
    hasDocument: false
  };
}

prepareTitreForApi(titre: any) {
  return {
    id: titre.id > 0 ? titre.id : null,
    designationNatureActions: { id: titre.designationNatureAction.id },
    valeurEmplacement: titre.valeurEmplacement,
    emplacement: { id: titre.emplacement.id },
    autrePrecisions: titre.autrePrecision ? { id: titre.autrePrecision.id } : null,
    dateCreation: titre.dateCreation || new Date().toISOString().split('T')[0],
    idDeclaration: { id: this.declarationData.id },
    fileName: titre.fileName,
    fileType: titre.fileType,
    fileDownloadUri: titre.fileDownloadUri
  };
}

validateTitre(titre: any): boolean {
  if (!titre.designationNatureAction) {
    this.error = 'Veuillez sélectionner la nature du titre';
    return false;
  }
  if (!titre.valeurEmplacement) {
    this.error = 'Veuillez renseigner la valeur de l\'emplacement';
    return false;
  }
  if (!titre.emplacement) {
    this.error = 'Veuillez sélectionner l\'emplacement';
    return false;
  }
  this.error = '';
  return true;
}

showAddFormDialogtitres() {
  this.tableRowTitre = this.resetTitre();
  this.displayUploadDialogtitres = true;
}

cancelAddTitre() {
  this.displayUploadDialogtitres = false;
  this.tableRowTitre = this.resetTitre();
}

confirmAddTitre() {
  if (!this.validateTitre(this.tableRowTitre)) return;

  this.confirmationService.confirm({
    message: 'Êtes-vous sûr de vouloir ajouter ce titre ?',
    header: 'Confirmation d\'ajout',
    accept: () => this.addTitreToTable()
  });
}

addTitreToTable() {
  const titreForApi = this.prepareTitreForApi(this.tableRowTitre);
  
  this.loading = true;
  this.declarationService.createTitres(titreForApi).subscribe({
    next: (response) => {
      const newTitre = { 
        ...this.tableRowTitre, 
        id: response.id,
        isNew: false,
        hasDocument: false
      };
      
      if (this.tableRowTitre.file) {
        this.uploadNewTitreDocument(response.id, this.tableRowTitre.file, newTitre);
      } else {
        this.titresTemp.push(newTitre);
        this.displayUploadDialogtitres = false; // Fermer le dialogue ici
        this.tableRowTitre = this.resetTitre();
        this.showSuccess('Titre ajouté avec succès');
        this.loading = false;
      }
    },
    error: (err) => {
      console.error('Erreur lors de l\'ajout', err);
      this.showError('Impossible d\'ajouter le titre');
      this.loading = false;
    }
  });
}
uploadNewTitreDocument(titreID: number, file: File, newTitre: any) {
  this.declarationService.uploadTitresDocument(titreID, file).subscribe({
    next: (response) => {
      newTitre.hasDocument = true;
      newTitre.fileName = response.fileName;
      this.titresTemp.push(newTitre);
      this.titresTemp = [...this.titresTemp]; // Force refresh
      this.displayUploadDialogtitres = false; // Fermer le dialogue ici
      this.tableRowTitre = this.resetTitre();
      this.showSuccess('Titre et document ajoutés');
      this.loading = false;
    },
    error: (err) => {
      this.titresTemp.push(newTitre);
      this.displayUploadDialogtitres = false; // Fermer le dialogue même en cas d'erreur
      this.tableRowTitre = this.resetTitre();
      this.showWarning('Titre ajouté mais document non uploadé');
      this.loading = false;
    }
  });
}
startEditTitre(titre: any) {
  titre._backup = JSON.parse(JSON.stringify(titre));
  titre.isEdit = true;
  this.showUploadForTitreId = titre.id;
}

cancelEditTitre(titre: any) {
  if (titre._backup) {
    Object.assign(titre, titre._backup);
    delete titre._backup;
  }
  titre.isEdit = false;
  this.showUploadForTitreId = null;
}

confirmSaveTitre(titre: any) {
  if (!this.validateTitre(titre)) return;

  this.confirmationService.confirm({
    message: 'Êtes-vous sûr de vouloir enregistrer les modifications ?',
    header: 'Confirmation de modification',
    accept: () => this.saveEditedTitre(titre)
  });
}

saveEditedTitre(titre: any) {
  const titreForApi = this.prepareTitreForApi(titre);
  
  this.loading = true;
  this.declarationService.updateTitres(titre.id, titreForApi).subscribe({
    next: () => {
      titre.isEdit = false;
      delete titre._backup;
      this.showUploadForTitreId = null;
      this.loading = false;
      this.showSuccess('Titre mis à jour avec succès');
    },
    error: (err) => {
      console.error('Erreur mise à jour:', err);
      this.showError('Erreur lors de la mise à jour');
      this.cancelEditTitre(titre);
      this.loading = false;
    }
  });
}

// Méthodes de suppression
confirmDeleteSelectedTitres() {
  if (!this.selectedTitres?.length) return;
  
  this.confirmationService.confirm({
    message: `Êtes-vous sûr de vouloir supprimer les ${this.selectedTitres.length} titres sélectionnés ?`,
    header: 'Confirmation de suppression',
    accept: () => this.deleteSelectedTitres()
  });
}

confirmDeleteSingleTitre(titre: any) {
  this.confirmationService.confirm({
    message: 'Êtes-vous sûr de vouloir supprimer ce titre ?',
    header: 'Confirmation de suppression',
    accept: () => {
      this.selectedTitres = [titre];
      this.deleteSelectedTitres();
    }
  });
}

confirmDeleteAllTitres() {
  if (this.titresTemp.length === 0) return;
  
  this.confirmationService.confirm({
    message: `Êtes-vous sûr de vouloir supprimer tous les ${this.titresTemp.length} titres ?`,
    header: 'Confirmation de suppression totale',
    accept: () => this.deleteAllTitres()
  });
}

deleteSelectedTitres() {
  if (!this.selectedTitres?.length) return;
  
  const deletePromises = this.selectedTitres
    .filter(titre => titre.id > 0)
    .map(titre => this.declarationService.deleteTitres(titre.id).toPromise());
  
  this.titresTemp = this.titresTemp.filter(t => !this.selectedTitres.includes(t));
  
  this.loading = true;
  Promise.all(deletePromises).then(() => {
    this.showSuccess('Suppression effectuée avec succès');
    this.selectedTitres = [];
    this.loading = false;
  }).catch(() => {
    this.showError('Erreur lors de la suppression');
    this.loadTitresForDeclaration();
    this.loading = false;
  });
}

deleteAllTitres() {
  if (this.titresTemp.length === 0) return;
  
  const deletePromises = this.titresTemp
    .filter(titre => titre.id > 0)
    .map(titre => this.declarationService.deleteTitres(titre.id).toPromise());
  
  Promise.all(deletePromises).then(() => {
    this.titresTemp = [];
    this.showSuccess('Tous les titres ont été supprimés');
  }).catch((err) => {
    console.error('Erreur suppression:', err);
    this.showError('Impossible de supprimer tous les titres');
    this.loadTitresForDeclaration();
  });
}

// Méthodes utilitaires
private resetFileInputTitres() {
  if (this.fileUploadTitresElement?.nativeElement) {
    this.fileUploadTitresElement.nativeElement.value = '';
  }
}

@ViewChild('fileUploadCreanceInput') fileUploadCreanceInput: ElementRef;
@ViewChild('creanceFileUpload') creanceFileUploadElement: ElementRef;
creancesTemp: any[] = [];
selectedCreances: any[] = [];
tableRowCreance: any = {};
isCreanceDataModified = false;
displayAddCreanceDialog = false;
isAddingCreanceTableRow = false;

creanceUploadedFiles: any[] = [];
isCreanceUploading = false;
selectedCreance: any = null;
triggerCreanceFileUpload(creance: any) {
  this.selectedCreance = creance;
  
  // Cast to HTMLInputElement to ensure click() method is available
  (this.creanceFileUploadElement.nativeElement as HTMLInputElement).click();
}
confirmSaveUpdatedCreance = (creance: any) => {  // Fonction fléchée pour garder le contexte
  console.log('confirmSaveUpdatedCreance called', creance); // Debug
  
  if (!this.validateCreance(creance)) {
    console.log('Validation failed for creance:', creance); // Debug
    this.messageService.add({
      severity: 'warn',
      summary: 'Attention',
      detail: 'Veuillez remplir tous les champs obligatoires'
    });
    return;
  }

  console.log('Showing confirmation dialog'); // Debug
  
  this.confirmationService.confirm({
    message: 'Êtes-vous sûr de vouloir enregistrer les modifications ?',
    header: 'Confirmation de modification',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      console.log('User accepted, updating creance...'); // Debug
      const creanceForApi = this.prepareCreanceForApi(creance);
      
      // Si un nouveau fichier a été sélectionné
      if (creance.file) {
        console.log('Creance has file to upload'); // Debug
        this.declarationService.updateCreance(creance.id, creanceForApi).pipe(
          switchMap(() => this.uploadDocumentCreance(creance, creance.file))
        ).subscribe({
          next: () => {
            console.log('Update and upload successful'); // Debug
            this.handleSuccessfulUpdate(creance);
          },
          error: (err) => {
            console.error('Erreur lors de la mise à jour', err);
            this.handleUpdateError(creance);
          }
        });
      } else {
        console.log('Updating creance without file'); // Debug
        // Pas de nouveau fichier, juste mettre à jour les données
        this.declarationService.updateCreance(creance.id, creanceForApi).subscribe({
          next: () => {
            console.log('Update successful'); // Debug
            this.handleSuccessfulUpdate(creance);
          },
          error: (err) => {
            console.error('Erreur lors de la mise à jour', err);
            this.handleUpdateError(creance);
          }
        });
      }
    },
    reject: () => {
      console.log('User rejected the update'); // Debug
    }
  });
}
private handleSuccessfulUpdate(creance: any) {
  creance.editing = false;
  creance.isModified = false;
  delete creance._backup;
  delete creance.file; // Supprimer la référence au fichier après upload
  
  this.messageService.add({
    severity: 'success',
    summary: 'Succès',
    detail: 'Créance mise à jour avec succès'
  });
  
  // Recharger les données si nécessaire
  this.loadCreancesByDeclaration();
}

private handleUpdateError(creance: any) {
  this.cancelEditCreance(creance);
  this.messageService.add({
    severity: 'error',
    summary: 'Erreur',
    detail: 'Échec de la mise à jour de la créance'
  });
}
showUploadDialogForNewCreance() {
  this.selectedCreance = this.tableRowCreance;
  if (this.creanceFileUploadElement?.nativeElement) {
    this.creanceFileUploadElement.nativeElement.value = '';
  }
  this.creanceFileUploadElement?.nativeElement?.click();
}

showUploadForCreanceId: number | null = null;

modifyCreanceDocument(creance: any, file: File) {
  if (!file) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Attention',
      detail: 'Veuillez sélectionner un fichier'
    });
    return;
  }

  this.isCreanceUploading = true;
  
  this.declarationService.uploadCreanceDocument(creance.id, file)
    .pipe(
      finalize(() => {
        this.isCreanceUploading = false;
        this.resetCreanceFileInput();
      })
    )
    .subscribe({
      next: (response) => {
        creance.fileName = response.fileName;
        creance.fileType = response.fileType;
        creance.fileDownloadUri = response.fileDownloadUri;
        creance.hasDocument = true;
        
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Document mis à jour avec succès'
        });
        
        this.selectedCreance = null;
      },
      error: (err) => {
        console.error('Erreur modification document:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Échec de la modification du document: ' + 
                (err.message || 'Erreur serveur')
        });
      }
    });
}



downloadCreanceDocument(creance: any) {
  if (!creance || !creance.hasDocument) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Attention',
      detail: 'Aucun document disponible pour cette créance'
    });
    return;
  }
  
  this.messageService.add({
    severity: 'info',
    summary: 'Téléchargement',
    detail: 'Téléchargement en cours...'
  });
  
  this.declarationService.downloadCreanceDocument(creance.id)
    .subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = creance.fileName || 'document';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Téléchargement terminé'
        });
      },
      error: (err) => {
        console.error('Erreur lors du téléchargement du document', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de télécharger le document: ' + 
                (err.error?.message || err.message || 'Erreur inconnue')
        });
      }
    });
}

private showCreanceError(detail: string) {
  this.messageService.add({
    severity: 'error',
    summary: 'Erreur',
    detail: detail,
    life: 5000,
    closable: true
  });
}

private showCreanceSuccess(detail: string) {
  this.messageService.add({
    severity: 'success',
    summary: 'Succès',
    detail: detail,
    life: 3000
  });
}

private resetCreanceFileInput() {
  if (this.creanceFileUploadElement?.nativeElement) {
    this.creanceFileUploadElement.nativeElement.value = '';
  }
}

showCreanceUploadDialog(creance: any) {
  this.selectedCreance = creance;
  this.creanceFileUploadElement.nativeElement.click();
}

uploadDocumentCreance(creance: any, file: File): Observable<any> {
  this.isCreanceUploading = true;
  
  return this.declarationService.uploadCreanceDocument(creance.id, file).pipe(
    tap((response) => {
      if (response) {
        creance.fileName = response.fileName;
        creance.fileType = response.fileType;
        creance.fileDownloadUri = response.fileDownloadUri;
        creance.hasDocument = true;
        
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Document téléchargé avec succès'
        });
      }
    }),
    catchError(err => {
      console.error('Upload error:', err);
      creance.hasDocument = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Échec de l\'upload: ' + (err.error?.message || err.message)
      });
      return throwError(err);
    }),
    finalize(() => {
      this.isCreanceUploading = false;
      this.selectedCreance = null;
    })
  );
}
resetCreanceFilter() {
  this.selectedDebiteur = null;
  this.creancesTemp = [...this.originalCreanceData];
}

creanceSubmitted: boolean = false;
selectedCreanceFile: File = null;
currentCreanceForUpload: any = null;

handleDeleteCreanceAction() {
  if (this.selectedCreances.length > 0) {
    this.confirmDeleteSelectedCreances();
  } else {
    this.confirmDeleteAllCreances();
  }
}

handleCreanceFileDrop(event: DragEvent): void {
  event.preventDefault();
  event.stopPropagation();

  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    const file = event.dataTransfer.files[0];
    const validExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (validExtensions.includes(fileExtension)) {
      this.selectedCreanceFile = file;
      
      if (this.currentCreanceForUpload) {
        this.currentCreanceForUpload.fileName = file.name;
      } else if (this.tableRowCreance) {
        this.tableRowCreance.fileName = file.name;
      }
      
      this.messageService.add({
        severity: 'success',
        summary: 'Fichier prêt',
        detail: `${file.name} est prêt à être uploadé`,
        life: 3000
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Format non supporté',
        detail: 'Seuls les fichiers PDF, DOC, DOCX, JPG, JPEG, PNG sont acceptés',
        life: 5000
      });
    }
  }
}

selectedDebiteur: any = null;
originalCreanceData: any[] = [];

loadCreancesByDeclaration() {
  if (!this.declarationData?.id) {
    console.error('ID de déclaration non disponible');
    return;
  }
  
  this.declarationService.getCreancesByDeclaration(this.declarationData.id)
    .subscribe({
      next: (data) => {
        this.creancesTemp = data.map(item => ({
          ...item,
          debiteur: item.debiteurs,
          autresPrecision: item.autresPrecisions,
          editing: false,
          hasDocument: !!item.fileName
        }));
        
        this.originalCreanceData = [...this.creancesTemp];
        this.isCreanceDataModified = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des créances', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les créances'
        });
      }
    });
}

prepareCreanceForApi(creance: any) {
  return {
    id: creance.id > 0 ? creance.id : null,
    debiteurs: creance.debiteur ? { id: creance.debiteur.id || creance.debiteur } : null,
    montant: creance.montant,
    autresPrecisions: creance.autresPrecision ? { id: creance.autresPrecision.id || creance.autresPrecision } : null,
    dateCreation: creance.dateCreation || new Date().toISOString().split('T')[0],
    idDeclaration: { id: this.declarationData.id },
    fileName: creance.fileName,
    fileType: creance.fileType,
    fileDownloadUri: creance.fileDownloadUri
  };
}

filterByDebiteur() {
  if (!this.selectedDebiteur) {
    this.creancesTemp = [...this.originalCreanceData];
    return;
  }

  this.creancesTemp = this.originalCreanceData.filter(creance => 
    creance.debiteur && creance.debiteur.id === this.selectedDebiteur.id
  );
}

resetDebiteurFilter() {
  this.selectedDebiteur = null;
}

showAddCreanceFormDialog() {
  this.tableRowCreance = {};
  this.displayAddCreanceDialog = true;
}

cancelAddCreance() {
  this.displayAddCreanceDialog = false;
  this.tableRowCreance = {};
}

confirmAddCreance() {
  if (!this.validateCreance(this.tableRowCreance)) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Attention',
      detail: 'Veuillez remplir tous les champs obligatoires'
    });
    return;
  }
  
  this.confirmationService.confirm({
    message: 'Êtes-vous sûr de vouloir ajouter cette créance ?',
    header: 'Confirmation d\'ajout',
    accept: () => {
      this.addCreance();
    }
  });
}
addCreance() {
  this.creanceSubmitted = true;
  
  if (!this.validateCreance(this.tableRowCreance)) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Attention',
      detail: 'Veuillez remplir tous les champs obligatoires'
    });
    return;
  }

  const creanceForApi = this.prepareCreanceForApi(this.tableRowCreance);
  
  this.declarationService.createCreance(creanceForApi).subscribe({
    next: (response) => {
      const newCreance = {
        ...this.tableRowCreance,
        id: response.id,
        isNew: false,
        hasDocument: !!this.tableRowCreance.file
      };
      
      // Si un fichier a été joint
      if (this.tableRowCreance.file) {
        this.uploadNewCreanceDocument(response.id, this.tableRowCreance.file, newCreance);
      } else {
        this.creancesTemp.push(newCreance);
        this.displayAddCreanceDialog = false;
        this.tableRowCreance = {};
        this.creanceSubmitted = false;
        
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Créance ajoutée avec succès'
        });
        
        this.loadCreancesByDeclaration(); // Recharger les données
      }
    },
    error: (err) => {
      console.error('Erreur lors de la création de la créance', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de créer la créance: ' + 
              (err.error?.message || err.message || 'Erreur inconnue')
      });
    }
  });
}

uploadNewCreanceDocument(creanceID: number, file: File, newCreance: any) {
  this.isCreanceUploading = true;
  
  this.declarationService.uploadCreanceDocument(creanceID, file)
    .subscribe({
      next: (response) => {
        newCreance.hasDocument = true;
        newCreance.fileName = response.fileName;
        newCreance.fileType = response.fileType;
        newCreance.fileDownloadUri = response.fileDownloadUri;
        
        this.creancesTemp.push(newCreance);
        this.displayAddCreanceDialog = false;
        this.tableRowCreance = {};
        this.creanceSubmitted = false;
        this.isCreanceUploading = false;
        
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Créance et document ajoutés avec succès'
        });
        
        this.loadCreancesByDeclaration(); // Recharger les données
      },
      error: (err) => {
        console.error('Erreur lors du téléchargement du document', err);
        this.isCreanceUploading = false;
        
        // Ajouter quand même la créance sans document
        this.creancesTemp.push(newCreance);
        this.displayAddCreanceDialog = false;
        this.tableRowCreance = {};
        this.creanceSubmitted = false;
        
        this.messageService.add({
          severity: 'warning',
          summary: 'Attention',
          detail: 'Créance ajoutée, mais erreur lors du téléchargement du document'
        });
        
        this.loadCreancesByDeclaration(); // Recharger les données
      }
    });
}
confirmDeleteSelectedCreances() {
  if (!this.selectedCreances || this.selectedCreances.length === 0) return;
  
  this.confirmationService.confirm({
    message: `Êtes-vous sûr de vouloir supprimer les ${this.selectedCreances.length} créances sélectionnées ?`,
    header: 'Confirmation de suppression',
    accept: () => {
      this.archiveSelectedCreances();
    }
  });
}

confirmDeleteSingleCreance(creance: any) {
  this.confirmationService.confirm({
    message: 'Êtes-vous sûr de vouloir supprimer cette créance ?',
    header: 'Confirmation de suppression',
    accept: () => {
      this.selectedCreances = [creance];
      this.archiveSelectedCreances();
    }
  });
}

confirmDeleteAllCreances() {
  if (this.creancesTemp.length === 0) return;
  
  this.confirmationService.confirm({
    message: `Êtes-vous sûr de vouloir supprimer toutes les ${this.creancesTemp.length} créances ?`,
    header: 'Confirmation de suppression totale',
    accept: () => {
      this.deleteAllCreances();
    }
  });
}

deleteAllCreances() {
  if (this.creancesTemp.length === 0) return;
  
  const deletePromises = this.creancesTemp
    .filter(creance => creance.id > 0)
    .map(creance => this.declarationService.deleteCreance(creance.id).toPromise());
  
  Promise.all(deletePromises)
    .then(() => {
      this.creancesTemp = [];
      this.selectedCreances = [];
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Toutes les créances ont été supprimées'
      });
    })
    .catch((err) => {
      console.error('Erreur lors de la suppression de toutes les créances', err);
      this.loadCreancesByDeclaration();
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de supprimer toutes les créances'
      });
    });
}

archiveSelectedCreances() {
  if (this.selectedCreances?.length > 0) {
    const deletePromises = this.selectedCreances
      .filter(creance => creance.id > 0)
      .map(creance => this.declarationService.deleteCreance(creance.id).toPromise());
    
    this.selectedCreances.forEach(creance => {
      const index = this.creancesTemp.findIndex(c => c === creance || c.id === creance.id);
      if (index !== -1) this.creancesTemp.splice(index, 1);
    });
    
    Promise.all(deletePromises)
      .then(() => {
        this.selectedCreances = [];
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Créances supprimées avec succès'
        });
      })
      .catch(() => {
        this.loadCreancesByDeclaration();
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de supprimer toutes les créances'
        });
      });
  }
}

startEditCreance(creance: any) {
  this.creancesTemp.forEach(item => item.editing = false);
  creance.editing = true;
  creance._backup = { ...creance };
  this.showUploadForCreanceId = creance.id;
}
showUploadCreanceDialog(creance: any) {
  this.selectedCreance = creance;
  // Réinitialiser l'input file pour permettre la sélection du même fichier
  if (this.fileUploadCreanceInput?.nativeElement) {
    this.fileUploadCreanceInput.nativeElement.value = '';
  }
  this.fileUploadCreanceInput.nativeElement.click();
}

onCreanceFileSelect(event: any) {
  try {
    if (!event.target.files || event.target.files.length === 0) {
      this.showCreanceError('Aucun fichier sélectionné');
      return;
    }

    const file = event.target.files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (file.size > maxSize) {
      this.showCreanceError('Le fichier est trop volumineux (max 5MB)');
      return;
    }

    if (!this.isValidCreanceFileType(file)) {
      this.showCreanceError('Type de fichier non supporté (PDF, JPEG, PNG uniquement)');
      return;
    }

    if (this.selectedCreance) {
      // Si on est en mode édition
      if (this.selectedCreance.editing) {
        this.selectedCreance.file = file;
        this.selectedCreance.fileName = file.name;
        this.selectedCreance.fileType = file.type;
        this.showCreanceSuccess('Document prêt à être uploadé avec la modification');
      } 
      // Si on ajoute un document à une créance existante
      else {
        this.uploadDocumentCreance(this.selectedCreance, file).subscribe({
          next: () => {
            this.selectedCreance.hasDocument = true;
            this.selectedCreance.fileName = file.name;
            this.loadCreancesByDeclaration(); // Recharger les données
          },
          error: (err) => {
            console.error('Erreur upload:', err);
            this.showCreanceError('Échec de l\'upload du document');
          }
        });
      }
    } 
    // Si on est en mode ajout d'une nouvelle créance
    else if (this.tableRowCreance) {
      this.tableRowCreance.file = file;
      this.tableRowCreance.fileName = file.name;
      this.tableRowCreance.fileType = file.type;
      this.showCreanceSuccess('Document prêt à être associé à la créance');
    }

    event.target.value = '';
  } catch (error) {
    console.error('Erreur dans onCreanceFileSelect:', error);
    this.showCreanceError('Erreur lors de la sélection du fichier');
  }
}
cancelEditCreance(creance: any) {
  if (creance._backup) {
    Object.assign(creance, creance._backup);
    delete creance._backup;
  }
  creance.editing = false;
  this.showUploadForCreanceId = null;
}

saveUpdatedCreance(creance: any) {
  if (!this.validateCreance(creance)) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Attention',
      detail: 'Veuillez remplir tous les champs obligatoires'
    });
    return;
  }
  
  this.confirmationService.confirm({
    message: 'Êtes-vous sûr de vouloir enregistrer les modifications ?',
    header: 'Confirmation de modification',
    accept: () => {
      const creanceForApi = this.prepareCreanceForApi(creance);
      
      this.declarationService.updateCreance(creance.id, creanceForApi)
        .subscribe({
          next: () => {
            creance.editing = false;
            creance.isModified = false;
            delete creance._backup;
            this.showUploadForCreanceId = null;
            
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Créance mise à jour avec succès'
            });
          },
          error: (err) => {
            this.cancelEditCreance(creance);
          }
        });
    }
  });
}

validateCreance(creance: any): boolean {
  return creance.debiteur && creance.montant;
}

private isValidCreanceFileType(file: File): boolean {
  const validTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
  return validTypes.includes(file.type) || 
         ['pdf', 'jpeg', 'jpg', 'png', 'doc', 'docx'].includes(fileExtension || '');
}


@ViewChild('fileUploadRevenu') fileUploadRevenuElement: ElementRef;
revenusTemp: any[] = [];
selectedRevenus: any[] = [];
tableRowRevenu: any = {};
isDataModifiedRevenu = false;
displayAddDialogRevenu = false;
isAddingTableRowRevenu = false;

uploadedFilesRevenu: any[] = [];
isUploadingRevenu = false;
selectedRevenu: any = null;
selectedRevenuType: any = null;
  newRevenu: any = this.resetRevenu();

removeSelectedFileRevenu(): void {
  // 1. Pour un revenu en cours d'ajout (nouveau revenu)
  if (this.tableRowRevenu) {
    this.tableRowRevenu.file = null;
    this.tableRowRevenu.fileName = null;
    this.tableRowRevenu.fileType = null;
    this.tableRowRevenu.fileDownloadUri = null;
    this.tableRowRevenu.hasDocument = false;
  }

  // 2. Pour un revenu existant en cours d'édition
  if (this.selectedRevenu) {
    this.selectedRevenu.file = null;
    this.selectedRevenu.fileName = null;
    this.selectedRevenu.fileType = null;
    this.selectedRevenu.fileDownloadUri = null;
    this.selectedRevenu.hasDocument = false;
  }

  // 3. Pour le dialogue d'ajout de revenu
  if (this.displayAddDialogRevenu && this.newRevenu) {
    this.newRevenu.file = null;
    this.newRevenu.fileName = null;
    this.newRevenu.fileType = null;
    this.newRevenu.fileDownloadUri = null;
    this.newRevenu.hasDocument = false;
  }

  // Réinitialiser le fichier sélectionné et l'input file
  this.uploadedFilesRevenu = [];
  this.resetFileInputRevenu();

  // Notification utilisateur
  this.messageService.add({
    severity: 'success',
    summary: 'Succès',
    detail: 'Document supprimé avec succès',
    life: 3000
  });
}


filterByRevenuType(revenuType: any) {
  this.selectedRevenuType = revenuType;
  
  if (revenuType) {
    // Filtrer par type de revenu sélectionné
    this.revenusTemp = this.revenusTemp.filter(r => 
      r.autresRevenus && r.autresRevenus.id === revenuType.id
    );
  } else {
    // Réinitialiser le filtre si aucun type n'est sélectionné
    this.revenusTemp = [...this.revenusTemp];
    this.loadRevenusByDeclaration();
  }
}
showUploadDialogForNewRevenu() {
  this.selectedRevenu = this.tableRowRevenu;
  if (this.fileUploadRevenuElement?.nativeElement) {
    this.fileUploadRevenuElement.nativeElement.value = '';
  }
  this.fileUploadRevenuElement?.nativeElement?.click();
}

showUploadForRevenuId: number | null = null;

// Méthodes pour les documents
modifyDocumentRevenu(revenu: any, file: File) {
  if (!file) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Attention',
      detail: 'Veuillez sélectionner un fichier'
    });
    return;
  }

  this.isUploadingRevenu = true;
  
  this.declarationService.uploadRevenusDocument(revenu.id, file)
    .pipe(
      finalize(() => {
        this.isUploadingRevenu = false;
        this.resetFileInputRevenu();
      })
    )
    .subscribe({
      next: (response) => {
        revenu.fileName = response.fileName;
        revenu.fileType = response.fileType;
        revenu.fileDownloadUri = response.fileDownloadUri;
        revenu.hasDocument = true;
        
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Document mis à jour avec succès'
        });
        
        this.selectedRevenu = null;
      },
      error: (err) => {
        console.error('Erreur modification document revenu:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Échec de la modification du document: ' + 
                (err.message || 'Erreur serveur')
        });
      }
    });
}

triggerFileUploadRevenu(revenu: any) {
  this.selectedRevenu = revenu;
  this.fileUploadRevenuElement.nativeElement.click();
}

downloadDocumentRevenu(revenu: any) {
  if (!revenu || !revenu.hasDocument) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Attention',
      detail: 'Aucun document disponible pour ce revenu'
    });
    return;
  }
  
  this.messageService.add({
    severity: 'info',
    summary: 'Téléchargement',
    detail: 'Téléchargement en cours...'
  });
  
  this.declarationService.downloadRevenusDocument(revenu.id)
    .subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = revenu.fileName || 'document';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Téléchargement terminé'
        });
      },
      error: (err) => {
        console.error('Erreur lors du téléchargement du document revenu', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de télécharger le document: ' + 
                 (err.error?.message || err.message || 'Erreur inconnue')
        });
      }
    });
}

private resetFileInputRevenu() {
  if (this.fileUploadRevenuElement?.nativeElement) {
    this.fileUploadRevenuElement.nativeElement.value = '';
  }
}

showUploadDialogRevenu(revenu: any) {
  this.selectedRevenu = revenu;
  this.fileUploadRevenuElement.nativeElement.click();
}

uploadDocumentRevenu(revenu: any, file: File): Observable<any> {
  this.isUploadingRevenu = true;
  
  return this.declarationService.uploadRevenusDocument(revenu.id, file).pipe(
    tap((response) => {
      if (response) {
        revenu.fileName = response.fileName;
        revenu.fileType = response.fileType;
        revenu.fileDownloadUri = response.fileDownloadUri;
        revenu.hasDocument = true;
        
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Document téléchargé avec succès'
        });
      }
    }),
   
    finalize(() => {
      this.isUploadingRevenu = false;
      this.selectedRevenu = null;
    })
  );
}

onFileSelectRevenu(event: any) {
  try {
    if (!event.target.files || event.target.files.length === 0) {
      this.showError('Aucun fichier sélectionné');
      return;
    }

    const file = event.target.files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (file.size > maxSize) {
      this.showError('Le fichier est trop volumineux (max 5MB)');
      return;
    }

    if (!this.isValidFileType(file)) {
      this.showError('Type de fichier non supporté (PDF, JPEG, PNG uniquement)');
      return;
    }

    if (this.selectedRevenu) {
      this.selectedRevenu.file = file;
      this.selectedRevenu.fileName = file.name;
      this.selectedRevenu.fileType = file.type;
      this.showSuccess('Document prêt à être uploadé avec le revenu');
      
      this.uploadDocumentRevenu(this.selectedRevenu, file).subscribe({
        error: (err) => {
          console.error('Erreur upload revenu:', err);
          //this.showError('Échec de l\'upload du document');
        }
      });
    } else if (this.tableRowRevenu) {
      this.tableRowRevenu.file = file;
      this.tableRowRevenu.fileName = file.name;
      this.tableRowRevenu.fileType = file.type;
      this.showSuccess('Document prêt à être associé au revenu');
    }

    event.target.value = '';
  } catch (error) {
    console.error('Erreur dans onFileSelectRevenu:', error);
    this.showError('Erreur lors de la sélection du fichier');
  }
}

// Chargement des revenus
originalRevenuData: any[] = [];

loadRevenusByDeclaration() {
  if (!this.declarationData?.id) {
    console.error('ID de déclaration non disponible');
    return;
  }
  
  this.declarationService.getRevenusByDeclaration(this.declarationData.id)
    .subscribe({
      next: (data) => {
        this.revenusTemp = data.map(item => ({
          ...item,
          autresRevenus: item.autresRevenus,
          salaireMensuelNet: item.salaireMensuelNet,
          editing: false,
          hasDocument: !!item.fileName
        }));
        
        this.originalRevenuData = [...this.revenusTemp];
        this.isDataModifiedRevenu = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des revenus', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les revenus'
        });
      }
    });
}

prepareRevenuForApi(revenu: any) {
  return {
    id: revenu.id > 0 ? revenu.id : null,
    autresRevenus: revenu.autresRevenus ? { id: revenu.autresRevenus.id || revenu.autresRevenus } : null,
    salaireMensuelNet: revenu.salaireMensuelNet,
    dateCreation: revenu.dateCreation || new Date().toISOString().split('T')[0],
    idDeclaration: { id: this.declarationData.id },
    fileName: revenu.fileName,
    fileType: revenu.fileType,
    fileDownloadUri: revenu.fileDownloadUri
  };
}

// Gestion des formulaires
showAddFormDialogRevenu() {
  this.tableRowRevenu = {};
  this.displayAddDialogRevenu = true;
}

cancelAddRevenu() {
  this.displayAddDialogRevenu = false;
  this.tableRowRevenu = {};
}

confirmAddRevenu() {
  if (!this.validateRevenu(this.tableRowRevenu)) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Attention',
      detail: 'Veuillez remplir tous les champs obligatoires'
    });
    return;
  }
  
  this.confirmationService.confirm({
    message: 'Êtes-vous sûr de vouloir ajouter ce revenu ?',
    header: 'Confirmation d\'ajout',
    accept: () => {
      this.addRevenu();
    }
  });
}

addRevenu() {
  const revenuForApi = this.prepareRevenuForApi(this.tableRowRevenu);
  
  this.declarationService.createRevenu(revenuForApi)
    .subscribe({
      next: (response) => {
        const newRevenu = {
          ...this.tableRowRevenu,
          id: response.id,
          isNew: false,
          hasDocument: false
        };
        
        if (this.tableRowRevenu.file) {
          this.uploadNewRevenuDocument(response.id, this.tableRowRevenu.file, newRevenu);
        } else {
          this.revenusTemp.push(newRevenu);
          this.displayAddDialogRevenu = false;
          this.tableRowRevenu = {};
          
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Revenu ajouté avec succès'
          });
        }
      },
      error: (err) => {
        console.error('Erreur lors de la création du revenu', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de créer le revenu: ' + 
                (err.error?.message || err.message || 'Erreur inconnue')
        });
      }
    });
}

uploadNewRevenuDocument(revenuID: number, file: File, newRevenu: any) {
  this.declarationService.uploadRevenusDocument(revenuID, file)
    .subscribe({
      next: (response) => {
        if (response) {
          newRevenu.hasDocument = true;
          newRevenu.fileName = response.fileName;
          newRevenu.fileType = response.fileType;
          newRevenu.fileDownloadUri = response.fileDownloadUri;
        }
        
        this.revenusTemp.push(newRevenu);
        this.displayAddDialogRevenu = false;
        this.tableRowRevenu = {};
        
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Revenu ajouté avec succès'
        });
      },
      error: (err) => {
        console.error('Erreur lors du téléchargement du document', err);
        this.revenusTemp.push(newRevenu);
        this.displayAddDialogRevenu = false;
        this.tableRowRevenu = {};
        
        this.messageService.add({
          severity: 'warning',
          summary: 'Attention',
          detail: 'Revenu ajouté, mais erreur lors du téléchargement du document'
        });
      }
    });
}

// Gestion des suppressions
handleDeleteActionRevenu() {
  if (this.selectedRevenus.length > 0) {
    this.confirmDeleteSelectedRevenus();
  } else {
    this.confirmDeleteAllRevenus();
  }
}

confirmDeleteSelectedRevenus() {
  if (!this.selectedRevenus || this.selectedRevenus.length === 0) return;
  
  this.confirmationService.confirm({
    message: `Êtes-vous sûr de vouloir supprimer les ${this.selectedRevenus.length} revenus sélectionnés ?`,
    header: 'Confirmation de suppression',
    accept: () => {
      this.archiveSelectedRevenus();
    }
  });
}

confirmDeleteSingleRevenu(revenu: any) {
  this.confirmationService.confirm({
    message: 'Êtes-vous sûr de vouloir supprimer ce revenu ?',
    header: 'Confirmation de suppression',
    accept: () => {
      this.selectedRevenus = [revenu];
      this.archiveSelectedRevenus();
    }
  });
}

confirmDeleteAllRevenus() {
  if (this.revenusTemp.length === 0) return;
  
  this.confirmationService.confirm({
    message: `Êtes-vous sûr de vouloir supprimer tous les ${this.revenusTemp.length} revenus ?`,
    header: 'Confirmation de suppression totale',
    accept: () => {
      this.deleteAllRevenus();
    }
  });
}

deleteAllRevenus() {
  if (this.revenusTemp.length === 0) return;
  
  const deletePromises = this.revenusTemp
    .filter(revenu => revenu.id > 0)
    .map(revenu => this.declarationService.deleteRevenu(revenu.id).toPromise());
  
  Promise.all(deletePromises)
    .then(() => {
      this.revenusTemp = [];
      this.selectedRevenus = [];
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Tous les revenus ont été supprimés'
      });
    })
    .catch((err) => {
      console.error('Erreur lors de la suppression de tous les revenus', err);
      this.loadRevenusByDeclaration();
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de supprimer tous les revenus'
      });
    });
}

archiveSelectedRevenus() {
  if (this.selectedRevenus?.length > 0) {
    const deletePromises = this.selectedRevenus
      .filter(revenu => revenu.id > 0)
      .map(revenu => this.declarationService.deleteRevenu(revenu.id).toPromise());
    
    this.selectedRevenus.forEach(revenu => {
      const index = this.revenusTemp.findIndex(r => r === revenu || r.id === revenu.id);
      if (index !== -1) this.revenusTemp.splice(index, 1);
    });
    
    Promise.all(deletePromises)
      .then(() => {
        this.selectedRevenus = [];
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Revenus supprimés avec succès'
        });
      })
      .catch(() => {
        this.loadRevenusByDeclaration();
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de supprimer tous les revenus'
        });
      });
  }
}

// Gestion de l'édition
startEditRevenu(revenu: any) {
  this.revenusTemp.forEach(item => item.editing = false);
  revenu.editing = true;
  revenu._backup = { ...revenu };
  this.showUploadForRevenuId = revenu.id;
}

cancelEditRevenu(revenu: any) {
  if (revenu._backup) {
    Object.assign(revenu, revenu._backup);
    delete revenu._backup;
  }
  revenu.editing = false;
  this.showUploadForRevenuId = null;
}

confirmSaveUpdatedRevenu(revenu: any) {
  if (!this.validateRevenu(revenu)) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Attention',
      detail: 'Veuillez remplir tous les champs obligatoires'
    });
    return;
  }
  
  this.confirmationService.confirm({
    message: 'Êtes-vous sûr de vouloir enregistrer les modifications ?',
    header: 'Confirmation de modification',
    accept: () => {
      this.saveUpdatedRevenu(revenu);
    }
  });
}

saveUpdatedRevenu(revenu: any) {
  const revenuForApi = this.prepareRevenuForApi(revenu);
  
  this.declarationService.updateRevenu(revenu.id, revenuForApi)
    .subscribe({
      next: () => {
        revenu.editing = false;
        revenu.isModified = false;
        delete revenu._backup;
        this.showUploadForRevenuId = null;
        
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Revenu mis à jour avec succès'
        });
      },
      error: (err) => {
        this.cancelEditRevenu(revenu);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de mettre à jour le revenu'
        });
      }
    });
}

validateRevenu(revenu: any): boolean {
  return !!revenu.autresRevenus && !!revenu.salaireMensuelNet;
}



  
// Component properties
@ViewChild('filevehiculeUpload') filevehiculeUploadElement: ElementRef;
vehiculesTemp: any[] = [];
originalVehiculeData: any[] = []; // For storing original data
selectedVehicules: any[] = [];
tableRowVehicule: any = {};
displayAddDialog = false;
  displayUploadDialogvv= false;

selectedVehicule: any = null;
showUploadForVehiculeId: number | null = null;

currentVehiculeForUpload: any = null;

// Fields for dropdown options
designationsVehicule: Vocabulaire[] = [];
marquesVehicule: Vocabulaire[] = [];
etatsVehicule: Vocabulaire[] = [];
transmissionsVehicule: Vocabulaire[] = []; // New field for transmission types
// 1. Fix for document upload issue - Update the uploadNewVehiculeDocument method
uploadNewVehiculeDocument(vehiculeID: number, file: File, newVehicule: any) {
  this.declarationService.uploadVehiculesDocument(vehiculeID, file)
    .subscribe({
      next: (response) => {
        // Update document properties before adding to array
        if (response) {
          newVehicule.hasDocument = true;
          newVehicule.fileName = response.fileName;
          newVehicule.fileType = response.fileType;
          newVehicule.fileDownloadUri = response.fileDownloadUri;
          
          // Add the updated vehicule to arrays
          this.vehiculesTemp.push(newVehicule);
          this.originalVehiculeData.push({...newVehicule});
          this.displayAddDialog = false;
          this.tableRowVehicule = this.resetVehicule();
          
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Véhicule et document ajoutés avec succès'
          });
        } else {
          // Handle case where response is empty but no error
          newVehicule.hasDocument = false;
          this.vehiculesTemp.push(newVehicule);
          this.originalVehiculeData.push({...newVehicule});
          this.displayAddDialog = false;
          this.tableRowVehicule = this.resetVehicule();
          
          this.messageService.add({
            severity: 'warning',
            summary: 'Attention',
            detail: 'Véhicule ajouté, mais problème avec le document'
          });
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du téléchargement du document', err);
        // Still add the vehicule even if document upload fails
        newVehicule.hasDocument = false;
        this.vehiculesTemp.push(newVehicule);
        this.originalVehiculeData.push({...newVehicule});
        this.displayAddDialog = false;
        this.tableRowVehicule = this.resetVehicule();
        
        this.messageService.add({
          severity: 'warning',
          summary: 'Attention',
          detail: 'Véhicule ajouté, mais erreur lors du téléchargement du document'
        });
        this.loading = false;
      }
    });
}

// 2. Fix for the uploadDocumentVehicule method to correctly update UI
uploadDocumentVehicule(vehicule: any, file: File): Observable<any> {
  this.isUploading = true;
  
  return this.declarationService.uploadVehiculesDocument(vehicule.id, file).pipe(
    tap((response) => {
      if (response) {
        // Update the vehicule properties directly
        vehicule.fileName = response.fileName;
        vehicule.fileType = response.fileType;
        vehicule.fileDownloadUri = response.fileDownloadUri;
        vehicule.hasDocument = true;
        
        // Find and update in the arrays to ensure consistency
        const vehIndex = this.vehiculesTemp.findIndex(v => v.id === vehicule.id);
        if (vehIndex >= 0) {
          this.vehiculesTemp[vehIndex].hasDocument = true;
          this.vehiculesTemp[vehIndex].fileName = response.fileName;
          this.vehiculesTemp[vehIndex].fileType = response.fileType;
          this.vehiculesTemp[vehIndex].fileDownloadUri = response.fileDownloadUri;
        }
        
        const origIndex = this.originalVehiculeData.findIndex(v => v.id === vehicule.id);
        if (origIndex >= 0) {
          this.originalVehiculeData[origIndex].hasDocument = true;
          this.originalVehiculeData[origIndex].fileName = response.fileName;
          this.originalVehiculeData[origIndex].fileType = response.fileType;
          this.originalVehiculeData[origIndex].fileDownloadUri = response.fileDownloadUri;
        }
        
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Document téléchargé avec succès'
        });
      }
    }),
    catchError(err => {
      console.error('Upload error:', err);
      vehicule.hasDocument = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Échec de l\'upload: ' + (err.error?.message || err.message)
      });
      return throwError(() => err);
    }),
    finalize(() => {
      this.isUploading = false;
      this.selectedVehicule = null;
    })
  );
}

// 3. Fix for modifyDocumentvv to correctly update UI
modifyDocumentvv(vehicule: any, file: File) {
  if (!file) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Attention',
      detail: 'Veuillez sélectionner un fichier'
    });
    return;
  }

  this.isUploading = true;
  
  this.declarationService.uploadVehiculesDocument(vehicule.id, file)
    .pipe(
      finalize(() => {
        this.isUploading = false;
        this.resetFileInput();
      })
    )
    .subscribe({
      next: (response) => {
        // Update the current vehicule
        vehicule.fileName = response.fileName;
        vehicule.fileType = response.fileType;
        vehicule.fileDownloadUri = response.fileDownloadUri;
        vehicule.hasDocument = true;
        
        // Update in vehiculesTemp array
        const vehIndex = this.vehiculesTemp.findIndex(v => v.id === vehicule.id);
        if (vehIndex >= 0) {
          this.vehiculesTemp[vehIndex].hasDocument = true;
          this.vehiculesTemp[vehIndex].fileName = response.fileName;
          this.vehiculesTemp[vehIndex].fileType = response.fileType;
          this.vehiculesTemp[vehIndex].fileDownloadUri = response.fileDownloadUri;
        }
        
        // Update in originalVehiculeData array
        const origIndex = this.originalVehiculeData.findIndex(v => v.id === vehicule.id);
        if (origIndex >= 0) {
          this.originalVehiculeData[origIndex].hasDocument = true;
          this.originalVehiculeData[origIndex].fileName = response.fileName;
          this.originalVehiculeData[origIndex].fileType = response.fileType;
          this.originalVehiculeData[origIndex].fileDownloadUri = response.fileDownloadUri;
        }
        
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Document mis à jour avec succès'
        });
        
        this.selectedVehicule = null;
      },
      error: (err) => {
        console.error('Erreur modification document:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Échec de la modification du document: ' + 
                (err.message || 'Erreur serveur')
        });
      }
    });
}

// 4. Add the missing filterByMarque function for filtering
selectedMarque: any = null;

filterByMarque() {
  if (!this.selectedMarque) {
    // If no marque is selected, reset to show all vehicles
    this.vehiculesTemp = [...this.originalVehiculeData];
    return;
  }
  
  // Filter vehicles by selected marque
  this.vehiculesTemp = this.originalVehiculeData.filter(vehicule => {
    if (!vehicule.marque) return false;
    
    // Handle both object and id scenarios
    const marqueId = typeof vehicule.marque === 'object' ? vehicule.marque.id : vehicule.marque;
    const selectedMarqueId = typeof this.selectedMarque === 'object' ? this.selectedMarque.id : this.selectedMarque;
    
    return marqueId === selectedMarqueId;
  });
  
  // Update table
  this.selectedVehicules = [];
}

// 5. Helper function to reset file input
resetFileInputvv() {
  if (this.filevehiculeUploadElement?.nativeElement) {
    this.filevehiculeUploadElement.nativeElement.value = '';
  }
}

// 6. Function to remove selected file when adding a new vehicle
removeSelectedFilevv() {
  if (this.tableRowVehicule) {
    this.tableRowVehicule.file = null;
    this.tableRowVehicule.fileName = null;
    this.tableRowVehicule.fileType = null;
  }
}

// 7. Add missing method for cancel upload
cancelUploadvv() {
  this.selectedFile = null;
  this.displayUploadDialog = false;
  this.currentVehiculeForUpload = null;
}

// 8. Fix for uploadFilevv method which seems to be using foncier properties instead of vehicule
uploadFilevv(): void {
  if (!this.selectedFile) {
    this.showError('Aucun fichier sélectionné');
    return;
  }
  
  if (this.currentVehiculeForUpload) {
    this.uploadDocumentVehicule(this.currentVehiculeForUpload, this.selectedFile)
      .subscribe({
        next: () => {
          this.showSuccess('Document uploadé avec succès');
          this.displayUploadDialogvv = false;
          this.selectedFile = null;
          this.currentVehiculeForUpload = null;
        },
        error: (err) => {
          console.error('Erreur upload:', err);
          this.showError('Échec de l\'upload du document');
        }
      });
  } else {
    this.showError('Aucun véhicule sélectionné pour l\'upload');
  }
}


loadVehiculesByDeclaration() {
  if (!this.declarationData?.id) {
    console.error('ID de déclaration non disponible pour les véhicules');
    return;
  }

  this.loading = true;
  this.declarationService.getVehiculesByDeclaration(this.declarationData.id).subscribe({
    next: (data) => {
      this.vehiculesTemp = data.map(item => ({
        ...item,
        anneeAcquisition: this.formatAnneeAcquisition(item.anneeAcquisition),
        editing: false,
        hasDocument: !!item.fileName,
        isEdit: false
      }));
      
      this.originalVehiculeData = [...this.vehiculesTemp]; // Save original data
      this.isDataModified = false;
      this.loading = false;
    },
    error: (err) => {
      console.error('Erreur lors du chargement des véhicules', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de charger les véhicules existants'
      });
      this.loading = false;
    }
  });
}

formatAnneeAcquisition(annee: any): Date {
  if (typeof annee === 'number') {
    return new Date(annee, 0, 1);
  } else if (typeof annee === 'string' && /^\d+$/.test(annee)) {
    return new Date(parseInt(annee), 0, 1);
  }
  return annee;
}



showAddFormDialogvv() {
  this.tableRowVehicule = this.resetVehicule();
  this.displayAddDialog = true;
}

cancelAddVehicule() {
  this.displayAddDialog = false;
  this.tableRowVehicule = this.resetVehicule();
}
addVehicule() {
  const vehiculeForApi = this.prepareVehiculeForApi(this.tableRowVehicule);
  
  this.loading = true;
  this.declarationService.createVehicule(vehiculeForApi).subscribe({
    next: (response) => {
      const newVehicule = {
        ...this.tableRowVehicule,
        id: response.id,
        isNew: false,
        hasDocument: false,
        editing: false
      };
      
      if (this.tableRowVehicule.file) {
        this.uploadNewVehiculeDocument(response.id, this.tableRowVehicule.file, newVehicule);
      } else {
        this.vehiculesTemp.push(newVehicule);
        this.originalVehiculeData.push({...newVehicule});
        this.displayAddDialog = false;
        this.tableRowVehicule = this.resetVehicule();
        
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Véhicule ajouté avec succès'
        });
        this.loading = false;
      }
    },
    error: (err) => {
      console.error('Erreur lors de l\'ajout du véhicule', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible d\'ajouter le véhicule: ' + 
              (err.error?.message || err.message || 'Erreur inconnue')
      });
      this.loading = false;
    }
  });
}
showUploadDialogvv(vehicule: any) {
  this.selectedVehicule = vehicule;
  this.filevehiculeUploadElement.nativeElement.click();
}
showUploadDialogForNewVehicule() {
  this.selectedVehicule = this.tableRowVehicule;
  if (this.filevehiculeUploadElement?.nativeElement) {
    this.filevehiculeUploadElement.nativeElement.value = ''; // Réinitialiser
  }
  this.filevehiculeUploadElement?.nativeElement?.click();
}
triggerFileUploadvv(vehicule: any) {
  this.selectedVehicule = vehicule;
  this.filevehiculeUploadElement.nativeElement.click();
}

downloadDocumentvv(vehicule: any) {
  if (!vehicule || !vehicule.hasDocument) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Attention',
      detail: 'Aucun document disponible pour ce véhicule'
    });
    return;
  }
  
  this.messageService.add({
    severity: 'info',
    summary: 'Téléchargement',
    detail: 'Téléchargement en cours...'
  });
  
  this.declarationService.downloadVehiculesDocument(vehicule.id)
    .subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = vehicule.fileName || 'document';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Téléchargement terminé'
        });
      },
      error: (err) => {
        console.error('Erreur lors du téléchargement du document', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de télécharger le document: ' + 
                 (err.error?.message || err.message || 'Erreur inconnue')
        });
      }
    });
}
// Méthode pour confirmer la suppression
confirmDeleteSelectedvv() {
  if (!this.selectedVehicules || this.selectedVehicules.length === 0) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Attention',
      detail: 'Veuillez sélectionner au moins un véhicule à supprimer'
    });
    return;
  }

  this.confirmationService.confirm({
    message: `Êtes-vous sûr de vouloir supprimer les ${this.selectedVehicules.length} véhicules sélectionnés ?`,
    header: 'Confirmation de suppression',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      this.deleteSelectedVehicules();
    }
  });
}

// Méthode pour effectuer la suppression
deleteSelectedVehicules() {
  this.loading = true;
  
  // Créer un tableau de promesses pour toutes les suppressions
  const deletePromises = this.selectedVehicules.map(vehicule => 
    this.declarationService.deleteVehicule(vehicule.id).toPromise()
  );

  // Exécuter toutes les suppressions en parallèle
  Promise.all(deletePromises)
    .then(() => {
      // Filtrer le tableau pour ne garder que les véhicules non supprimés
      this.vehiculesTemp = this.vehiculesTemp.filter(
        v => !this.selectedVehicules.some(sv => sv.id === v.id)
      );
      this.originalVehiculeData = this.originalVehiculeData.filter(
        v => !this.selectedVehicules.some(sv => sv.id === v.id)
      );
      
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: `${this.selectedVehicules.length} véhicule(s) supprimé(s) avec succès`
      });
      
      this.selectedVehicules = [];
      this.loading = false;
    })
    .catch(err => {
      console.error('Erreur lors de la suppression:', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Une erreur est survenue lors de la suppression'
      });
      this.loading = false;
    });
}
onFileSelectvv(event: any) {
  try {
    if (!event.target.files || event.target.files.length === 0) {
      this.showError('Aucun fichier sélectionné');
      return;
    }

    const file = event.target.files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (file.size > maxSize) {
      this.showError('Le fichier est trop volumineux (max 5MB)');
      return;
    }

    if (!this.isValidFileType(file)) {
      this.showError('Type de fichier non supporté (PDF, JPEG, PNG uniquement)');
      return;
    }

    if (this.selectedVehicule && this.selectedVehicule.id) {
      this.selectedVehicule.file = file;
      this.selectedVehicule.fileName = file.name;
      this.selectedVehicule.fileType = file.type;
      
      // Upload immediately for existing vehicles
      this.uploadDocumentVehicule(this.selectedVehicule, file).subscribe({
        error: (err) => {
          console.error('Erreur upload:', err);
          this.showError('Échec de l\'upload du document');
        }
      });
    } else if (this.tableRowVehicule) {
      this.tableRowVehicule.file = file;
      this.tableRowVehicule.fileName = file.name;
      this.tableRowVehicule.fileType = file.type;
      this.showSuccess('Document prêt à être associé au véhicule');
    }

    event.target.value = '';
  } catch (error) {
    console.error('Erreur dans onFileSelect:', error);
    this.showError('Erreur lors de la sélection du fichier');
  }
}

handleFileDropvv(event: DragEvent): void {
  event.preventDefault();
  event.stopPropagation();

  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    const file = event.dataTransfer.files[0];
    const validExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (validExtensions.includes(fileExtension)) {
      this.selectedFile = file;
      
      if (this.currentVehiculeForUpload) {
        this.currentVehiculeForUpload.fileName = file.name;
      } else if (this.tableRowVehicule) {
        this.tableRowVehicule.fileName = file.name;
      }
      
      this.messageService.add({
        severity: 'success',
        summary: 'Fichier prêt',
        detail: `${file.name} est prêt à être uploadé`,
        life: 3000
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Format non supporté',
        detail: 'Seuls les fichiers PDF, DOC, DOCX, JPG, JPEG, PNG sont acceptés',
        life: 5000
      });
    }
  }
}

startEditVehicule(vehicule: any) {
  this.vehiculesTemp.forEach(item => item.editing = false);
  vehicule.editing = true;
  vehicule._backup = { ...vehicule };
  this.showUploadForVehiculeId = vehicule.id;
}

cancelEditVehicule(vehicule: any) {
  if (vehicule._backup) {
    Object.assign(vehicule, vehicule._backup);
    delete vehicule._backup;
  }
  vehicule.editing = false;
  this.showUploadForVehiculeId = null;
}

confirmSaveUpdatedVehicule(vehicule: any) {
  if (!this.validateVehicule(vehicule)) {
    return;
  }
  
  this.confirmationService.confirm({
    message: 'Êtes-vous sûr de vouloir enregistrer les modifications ?',
    header: 'Confirmation de modification',
    accept: () => {
      this.saveUpdatedVehicule(vehicule);
    }
  });
}

saveUpdatedVehicule(vehicule: any) {
  const originalYear = vehicule.anneeAcquisition;
  const vehiculeForApi = this.prepareVehiculeForApi(vehicule);
  
  this.loading = true;
  this.declarationService.updateVehicule(vehicule.id, vehiculeForApi)
    .subscribe({
      next: () => {
        vehicule.editing = false;
        vehicule.isModified = false;
        delete vehicule._backup;
        vehicule.anneeAcquisition = originalYear;
        this.showUploadForVehiculeId = null;
        
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Véhicule mis à jour avec succès'
        });
        this.loading = false;
      },
      error: (err) => {
        this.cancelEditVehicule(vehicule);
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de mettre à jour le véhicule: ' + 
                 (err.error?.message || err.message || 'Erreur inconnue')
        });
      }
    });
}
// 1. First, ensure carburant is properly initialized in the vehicle object
resetVehicule(): any {
  return {
    designation: null,
    marque: null,
    immatriculation: null,
    anneeAcquisition: null,
    valeurAcquisition: null,
    etatGeneral: null,
    kilometrage: 0,
    carburant: null, // Will be validated during submission
    transmission: null,
    fileName: null,
    fileType: null,
    file: null
  };
}

// 2. Improve the validation function to check specifically for carburant
validateVehicule(vehicule: any): boolean {
  // Check all required fields including carburant
  const isValid = vehicule.designation && vehicule.marque && vehicule.immatriculation && 
                 vehicule.anneeAcquisition && vehicule.valeurAcquisition && vehicule.etatGeneral &&
                 vehicule.carburant; // Carburant must be present
  
  if (!isValid) {
    let errorMsg = '';
    if (!vehicule.designation) {
      errorMsg = 'Veuillez sélectionner la désignation';
    } else if (!vehicule.marque) {
      errorMsg = 'Veuillez sélectionner la marque';
    } else if (!vehicule.immatriculation) {
      errorMsg = 'Veuillez renseigner l\'immatriculation';
    } else if (!vehicule.anneeAcquisition) {
      errorMsg = 'Veuillez sélectionner l\'année d\'acquisition';
    } else if (!vehicule.valeurAcquisition) {
      errorMsg = 'Veuillez renseigner la valeur d\'acquisition';
    } else if (!vehicule.etatGeneral) {
      errorMsg = 'Veuillez sélectionner l\'état général';
    } else if (!vehicule.carburant) {
      errorMsg = 'Veuillez sélectionner le type de carburant'; // Specific error for carburant
    }
    
    if (errorMsg) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: errorMsg
      });
    }
  }
  
  return isValid;
}

// 3. Enhance the prepareVehiculeForApi function to handle carburant properly
prepareVehiculeForApi(vehicule: any) {
  // Ensure the date format is consistent
  const anneeAcquisition = vehicule.anneeAcquisition instanceof Date 
                         ? vehicule.anneeAcquisition.getFullYear()
                         : vehicule.anneeAcquisition;

  // Prepare vehicle object for API request
  return {
    id: vehicule.id > 0 ? vehicule.id : null,
    designation: vehicule.designation ? { id: vehicule.designation.id || vehicule.designation } : null,
    marque: vehicule.marque ? { id: vehicule.marque.id || vehicule.marque } : null,
    immatriculation: vehicule.immatriculation,
    anneeAcquisition: anneeAcquisition,
    valeurAcquisition: vehicule.valeurAcquisition,
    etatGeneral: vehicule.etatGeneral ? { id: vehicule.etatGeneral.id || vehicule.etatGeneral } : null,
    kilometrage: vehicule.kilometrage || 0,
    // Ensure carburant is properly formatted and never null
    carburant: vehicule.carburant ? { id: vehicule.carburant.id || vehicule.carburant } : null,
    transmission: vehicule.transmission ? { id: vehicule.transmission.id || vehicule.transmission } : null,
    dateCreation: vehicule.dateCreation || new Date().toISOString().split('T')[0],
    isSynthese: vehicule.isSynthese || false,
    idDeclaration: { id: this.declarationData.id },
    fileName: vehicule.fileName,
    fileType: vehicule.fileType,
    fileDownloadUri: vehicule.fileDownloadUri
  };
}

// 4. Make sure carburant is included in confirmAddVehicule validation
confirmAddVehicule() {
  this.submitted = true;

  if (!this.validateVehicule(this.tableRowVehicule)) {
    return;
  }
  
  // Extra check for carburant since it's a common issue
  if (!this.tableRowVehicule.carburant) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Attention',
      detail: 'Le type de carburant est obligatoire'
    });
    return;
  }
  
  this.confirmationService.confirm({
    message: 'Êtes-vous sûr de vouloir ajouter ce véhicule ?',
    header: 'Confirmation d\'ajout',
    accept: () => {
      this.addVehicule();
    }
  });
}
resetRevenu(): any {
  return {
    autresRevenus: null,
    salaireMensuelNet: null,
    file: null,
    fileName: null,
    fileType: null,
    fileDownloadUri: null,
    hasDocument: false,
    dateCreation: new Date().toISOString().split('T')[0]
  };
}



@ViewChild('fileUploadAutreBien') fileUploadAutreBienElement: ElementRef;
autresBiensTemp: any[] = [];
selectedAutresBiens: any[] = [];
tableRowAutreBien: any = {};
isDataModifiedAutreBien = false;
displayAddDialogAutreBien = false;
isAddingTableRowAutreBien = false;

uploadedFilesAutreBien: any[] = [];
isUploadingAutreBien = false;
selectedAutreBien: any = null;
showUploadDialogForNewAutreBien() {
  this.selectedAutreBien = this.tableRowAutreBien;
  if (this.fileUploadAutreBienElement?.nativeElement) {
    this.fileUploadAutreBienElement.nativeElement.value = '';
  }
  this.fileUploadAutreBienElement?.nativeElement?.click();
}
showUploadForAutreBienId: number | null = null;

modifyDocumentAutreBien(bien: any, file: File) {
  if (!file) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Attention',
      detail: 'Veuillez sélectionner un fichier'
    });
    return;
  }

  this.isUploadingAutreBien = true;
  
  this.declarationService.uploadAutresBiensDeValeurDocument(bien.id, file)
    .pipe(
      finalize(() => {
        this.isUploadingAutreBien = false;
        this.resetFileInputAutreBien();
      })
    )
    .subscribe({
      next: (response) => {
        bien.fileName = response.fileName;
        bien.fileType = response.fileType;
        bien.fileDownloadUri = response.fileDownloadUri;
        bien.hasDocument = true;
        
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Document mis à jour avec succès'
        });
        
        this.selectedAutreBien = null;
      },
      error: (err) => {
        console.error('Erreur modification document:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Échec de la modification du document: ' + 
                (err.message || 'Erreur serveur')
        });
      }
    });
}

triggerFileUploadAutreBien(bien: any) {
  this.selectedAutreBien = bien;
  this.fileUploadAutreBienElement.nativeElement.click();
}

downloadDocumentAutreBien(bien: any) {
  if (!bien || !bien.hasDocument) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Attention',
      detail: 'Aucun document disponible pour ce bien'
    });
    return;
  }
  
  this.messageService.add({
    severity: 'info',
    summary: 'Téléchargement',
    detail: 'Téléchargement en cours...'
  });
  
  this.declarationService.downloadAutresBiensDeValeurDocument(bien.id)
    .subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = bien.fileName || 'document';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Téléchargement terminé'
        });
      },
      error: (err) => {
        console.error('Erreur lors du téléchargement du document', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de télécharger le document: ' + 
                 (err.error?.message || err.message || 'Erreur inconnue')
        });
      }
    });
}

private resetFileInputAutreBien() {
  if (this.fileUploadAutreBienElement?.nativeElement) {
    this.fileUploadAutreBienElement.nativeElement.value = '';
  }
}

showUploadDialogAutreBien(bien: any) {
  this.selectedAutreBien = bien;
  this.fileUploadAutreBienElement.nativeElement.click();
}

uploadDocumentAutreBien(bien: any, file: File): Observable<any> {
  this.isUploadingAutreBien = true;
  
  return this.declarationService.uploadAutresBiensDeValeurDocument(bien.id, file).pipe(
    tap((response) => {
      if (response) {
        bien.fileName = response.fileName;
        bien.fileType = response.fileType;
        bien.fileDownloadUri = response.fileDownloadUri;
        bien.hasDocument = true;
        
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Document téléchargé avec succès'
        });
      }
    }),
    catchError(err => {
      console.error('Upload error:', err);
      bien.hasDocument = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Échec de l\'upload: ' + (err.error?.message || err.message)
      });
      return throwError(err);
    }),
    finalize(() => {
      this.isUploadingAutreBien = false;
      this.selectedAutreBien = null;
    })
  );
}

onFileSelectAutreBien(event: any) {
  try {
    if (!event.target.files || event.target.files.length === 0) {
      this.showError('Aucun fichier sélectionné');
      return;
    }

    const file = event.target.files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (file.size > maxSize) {
      this.showError('Le fichier est trop volumineux (max 5MB)');
      return;
    }

    if (!this.isValidFileType(file)) {
      this.showError('Type de fichier non supporté (PDF, JPEG, PNG uniquement)');
      return;
    }

    if (this.selectedAutreBien) {
      this.selectedAutreBien.file = file;
      this.selectedAutreBien.fileName = file.name;
      this.selectedAutreBien.fileType = file.type;
      this.showSuccess('Document prêt à être uploadé avec le bien');
      
      this.uploadDocumentAutreBien(this.selectedAutreBien, file).subscribe({
        error: (err) => {
          console.error('Erreur upload:', err);
          this.showError('Échec de l\'upload du document');
        }
      });
    } else if (this.tableRowAutreBien) {
      this.tableRowAutreBien.file = file;
      this.tableRowAutreBien.fileName = file.name;
      this.tableRowAutreBien.fileType = file.type;
      this.showSuccess('Document prêt à être associé au bien');
    }

    event.target.value = '';
  } catch (error) {
    console.error('Erreur dans onFileSelectAutreBien:', error);
    this.showError('Erreur lors de la sélection du fichier');
  }
}

selectedFileAutreBien: File = null;
currentAutreBienForUpload: any = null;

handleDeleteActionAutreBien() {
  if (this.selectedAutresBiens.length > 0) {
    this.confirmDeleteSelectedAutresBiens();
  } else {
    this.confirmDeleteAllAutresBiens();
  }
}

selectedNatureAutreBien: any = null;
originalAutresBiensData: any[] = [];

loadAutresBiensByDeclaration() {
  if (!this.declarationData?.id) {
    console.error('ID de déclaration non disponible');
    return;
  }
  
  this.declarationService.getAutresBiensDeValeurByDeclaration(this.declarationData.id)
    .subscribe({
      next: (data) => {
        this.autresBiensTemp = data.map(item => ({
          ...item,
          localisation: item.localite,
          anneeAcquis: this.formatAnneeConstruction(item.anneeAcquis),
          autresPrecision: item.autrePrecisions || item.autre_precisions || null,
          editing: false,
          hasDocument: !!item.fileName
        }));
        
        this.originalAutresBiensData = [...this.autresBiensTemp];
        this.isDataModifiedAutreBien = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des autres biens', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les autres biens'
        });
      }
    });
}

prepareAutreBienForApi(bien: any) {
  const annee = bien.anneeAcquis instanceof Date ? 
               bien.anneeAcquis.getFullYear() : bien.anneeAcquis;
  
  return {
    id: bien.id > 0 ? bien.id : null,
    type: bien.type ? { id: bien.type.id || bien.type } : null,
    designation: bien.designation ? { id: bien.designation.id || bien.designation } : null,
    localite: bien.localite ? { id: bien.localite.id || bien.localite } : null,
    anneeAcquis: annee,
    valeurAcquisition: bien.valeurAcquisition,
    autrePrecisions: bien.autresPrecision ? { id: bien.autresPrecision.id || bien.autresPrecision } : null,
    dateCreation: bien.dateCreation || new Date().toISOString().split('T')[0],
    idDeclaration: { id: this.declarationData.id },
    fileName: bien.fileName,
    fileType: bien.fileType,
    fileDownloadUri: bien.fileDownloadUri
  };
}

filterByNatureAutreBien() {
  if (!this.selectedNatureAutreBien) {
    this.autresBiensTemp = [...this.originalAutresBiensData];
    return;
  }

  this.autresBiensTemp = this.originalAutresBiensData.filter(bien => 
    bien.type && bien.type.id === this.selectedNatureAutreBien.id
  );
}

resetNatureFilterAutreBien() {
  this.selectedNatureAutreBien = null;
}

showAddFormDialogAutreBien() {
  this.tableRowAutreBien = {};
  this.displayAddDialogAutreBien = true;
}

cancelAddAutreBien() {
  this.displayAddDialogAutreBien = false;
  this.tableRowAutreBien = {};
}

confirmAddAutreBien() {
  if (!this.validateAutreBien(this.tableRowAutreBien)) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Attention',
      detail: 'Veuillez remplir tous les champs obligatoires'
    });
    return;
  }
  
  this.confirmationService.confirm({
    message: 'Êtes-vous sûr de vouloir ajouter ce bien ?',
    header: 'Confirmation d\'ajout',
    accept: () => {
      this.addAutreBien();
    }
  });
}

addAutreBien() {
  const bienForApi = this.prepareAutreBienForApi(this.tableRowAutreBien);
  
  this.declarationService.createAutreBienDeValeur(bienForApi)
    .subscribe({
      next: (response) => {
        const newBien = {
          ...this.tableRowAutreBien,
          id: response.id,
          isNew: false,
          hasDocument: false
        };
        
        if (this.tableRowAutreBien.file) {
          this.uploadNewAutreBienDocument(response.id, this.tableRowAutreBien.file, newBien);
        } else {
          this.autresBiensTemp.push(newBien);
          this.displayAddDialogAutreBien = false;
          this.tableRowAutreBien = {};
          
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Bien ajouté avec succès'
          });
        }
      },
      error: (err) => {
        console.error('Erreur lors de la création du bien', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de créer le bien: ' + 
                (err.error?.message || err.message || 'Erreur inconnue')
        });
      }
    });
}

uploadNewAutreBienDocument(bienID: number, file: File, newBien: any) {
  this.declarationService.uploadAutresBiensDeValeurDocument(bienID, file)
    .subscribe({
      next: (response) => {
        if (response) {
          newBien.hasDocument = true;
          newBien.fileName = response.fileName;
          newBien.fileType = response.fileType;
          newBien.fileDownloadUri = response.fileDownloadUri;
        }
        
        this.autresBiensTemp.push(newBien);
        this.displayAddDialogAutreBien = false;
        this.tableRowAutreBien = {};
        
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Bien ajouté avec succès'
        });
      },
      error: (err) => {
        console.error('Erreur lors du téléchargement du document', err);
        this.autresBiensTemp.push(newBien);
        this.displayAddDialogAutreBien = false;
        this.tableRowAutreBien = {};
        
        this.messageService.add({
          severity: 'warning',
          summary: 'Attention',
          detail: 'Bien ajouté, mais erreur lors du téléchargement du document'
        });
      }
    });
}

confirmDeleteSelectedAutresBiens() {
  if (!this.selectedAutresBiens || this.selectedAutresBiens.length === 0) return;
  
  this.confirmationService.confirm({
    message: `Êtes-vous sûr de vouloir supprimer les ${this.selectedAutresBiens.length} biens sélectionnés ?`,
    header: 'Confirmation de suppression',
    accept: () => {
      this.archiveSelectedAutresBiens();
    }
  });
}

confirmDeleteSingleAutreBien(bien: any) {
  this.confirmationService.confirm({
    message: 'Êtes-vous sûr de vouloir supprimer ce bien ?',
    header: 'Confirmation de suppression',
    accept: () => {
      this.selectedAutresBiens = [bien];
      this.archiveSelectedAutresBiens();
    }
  });
}

confirmDeleteAllAutresBiens() {
  if (this.autresBiensTemp.length === 0) return;
  
  this.confirmationService.confirm({
    message: `Êtes-vous sûr de vouloir supprimer tous les ${this.autresBiensTemp.length} biens ?`,
    header: 'Confirmation de suppression totale',
    accept: () => {
      this.deleteAllAutresBiens();
    }
  });
}

deleteAllAutresBiens() {
  if (this.autresBiensTemp.length === 0) return;
  
  const deletePromises = this.autresBiensTemp
    .filter(bien => bien.id > 0)
    .map(bien => this.declarationService.deleteAutreBienDeValeur(bien.id).toPromise());
  
  Promise.all(deletePromises)
    .then(() => {
      this.autresBiensTemp = [];
      this.selectedAutresBiens = [];
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Tous les biens ont été supprimés'
      });
    })
    .catch((err) => {
      console.error('Erreur lors de la suppression de tous les biens', err);
      this.loadAutresBiensByDeclaration();
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de supprimer tous les biens'
      });
    });
}

archiveSelectedAutresBiens() {
  if (this.selectedAutresBiens?.length > 0) {
    const deletePromises = this.selectedAutresBiens
      .filter(bien => bien.id > 0)
      .map(bien => this.declarationService.deleteAutreBienDeValeur(bien.id).toPromise());
    
    this.selectedAutresBiens.forEach(bien => {
      const index = this.autresBiensTemp.findIndex(b => b === bien || b.id === bien.id);
      if (index !== -1) this.autresBiensTemp.splice(index, 1);
    });
    
    Promise.all(deletePromises)
      .then(() => {
        this.selectedAutresBiens = [];
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Biens supprimés avec succès'
        });
      })
      .catch(() => {
        this.loadAutresBiensByDeclaration();
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de supprimer tous les biens'
        });
      });
  }
}

startEditAutreBien(bien: any) {
  this.autresBiensTemp.forEach(item => item.editing = false);
  bien.editing = true;
  bien._backup = { ...bien };
  this.showUploadForAutreBienId = bien.id;
}

cancelEditAutreBien(bien: any) {
  if (bien._backup) {
    Object.assign(bien, bien._backup);
    delete bien._backup;
  }
  bien.editing = false;
  this.showUploadForAutreBienId = null;
}

saveUpdatedAutreBien(bien: any) {
  if (!this.validateAutreBien(bien)) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Attention',
      detail: 'Veuillez remplir tous les champs obligatoires'
    });
    return;
  }

  this.confirmationService.confirm({
    message: 'Êtes-vous sûr de vouloir enregistrer les modifications ?',
    header: 'Confirmation de modification',
    accept: () => {
      this.saveUpdatedAutreBienConfirmed(bien);
    }
  });
}

saveUpdatedAutreBienConfirmed(bien: any) {
  const originalYear = bien.anneeAcquis;
  const bienForApi = this.prepareAutreBienForApi(bien);
  
  this.declarationService.updateAutreBienDeValeur(bien.id, bienForApi)
    .subscribe({
      next: () => {
        bien.editing = false;
        bien.isModified = false;
        delete bien._backup;
        bien.anneeAcquis = originalYear;
        this.showUploadForAutreBienId = null;
        
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Bien mis à jour avec succès'
        });
      },
      error: (err) => {
        this.cancelEditAutreBien(bien);
      }
    });
}

validateAutreBien(bien: any): boolean {
  return bien.type && bien.designation && bien.localite && 
         bien.anneeAcquis && bien.valeurAcquisition;
}


 autresDettesTemp: any[] = []; // Liste locale temporaire
selectedAutresDettes: any[] = []; // Éléments sélectionnés
tableRowAutreDette: any = {}; // Nouvelle dette en cours d'ajout


creanciers: Vocabulaire[] = [];
justificatifs: Vocabulaire[] = [];

@ViewChild('filedetteUpload') filedetteUploadElement: ElementRef;

selectedDette: any = null;
showUploadForDetteId: number | null = null;
  displayUploadDialogdette= false;

// Fonction de réinitialisation
resetAutreDette(): any {
  return {
    creancier: null,
    montant: null,
    pathJustificatif: null,
    autresPrecisions: null,
    file: null,
    fileName: null,
    fileType: null,
    fileDownloadUri: null,
    hasDocument: false
  };
}

// Chargement des dettes
loadAutresDettes() {
  if (!this.declarationData?.id) {
    console.error('ID de déclaration non disponible pour les dettes');
    return;
  }

  this.loading = true;
  this.declarationService.getByDeclaration(this.declarationData.id).subscribe({
    next: (data) => {
      this.autresDettesTemp = data.map(item => ({
        ...item,
        creancier: item.creanciers,
        pathJustificatif: item.justificatifs,
        isEdit: false,
        hasDocument: !!item.fileName
      }));
      this.isDataModified = false;
      this.loading = false;
    },
    error: (err) => {
      console.error('Erreur lors du chargement des dettes', err);
      this.error = 'Impossible de charger les dettes existantes';
      this.loading = false;
    }
  });
}

// Validation
validateAutreDette(dette: any): boolean {
  const isValid = dette.creancier && dette.montant && dette.pathJustificatif;
  
  if (!isValid) {
    if (!dette.creancier) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez sélectionner le créancier'
      });
    } else if (!dette.montant) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez renseigner le montant'
      });
    } else if (!dette.pathJustificatif) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez sélectionner le justificatif'
      });
    }
  }
  
  return isValid;
}

// Préparation pour l'API
prepareDetteForApi(dette: any) {
  return {
    ...(dette.id ? { id: dette.id } : {}),
    creanciers: { id: dette.creancier.id },
    montant: dette.montant,
    justificatifs: { id: dette.pathJustificatif.id },
    autresPrecisions: dette.autresPrecisions && dette.autresPrecisions.id > 0 
      ? { id: dette.autresPrecisions.id }
      : null,
    dateCreation: dette.dateCreation || new Date().toISOString().split('T')[0],
    idDeclaration: { id: this.declarationData.id },
    fileName: dette.fileName,
    fileType: dette.fileType,
    fileDownloadUri: dette.fileDownloadUri
  };
}

// Gestion des documents
showUploadDialogForNewDette() {
  this.selectedDette = this.tableRowAutreDette;
  if (this.filedetteUploadElement?.nativeElement) {
    this.filedetteUploadElement.nativeElement.value = '';
  }
  this.filedetteUploadElement?.nativeElement?.click();
}

triggerFileUploaddette(dette: any) {
  this.selectedDette = dette;
  this.selectedFile = null;
  this.displayUploadDialogdette = true;
}

downloadDocumentdette(dette: any) {
  if (!dette || !dette.hasDocument) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Attention',
      detail: 'Aucun document disponible pour cette dette'
    });
    return;
  }
  
  this.messageService.add({
    severity: 'info',
    summary: 'Téléchargement',
    detail: 'Téléchargement en cours...'
  });
  
  this.declarationService.downloadAutresDettesDocument(dette.id)
    .subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = dette.fileName || 'document';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Téléchargement terminé'
        });
      },
      error: (err) => {
        console.error('Erreur lors du téléchargement du document', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de télécharger le document: ' + 
                 (err.error?.message || err.message || 'Erreur inconnue')
        });
      }
    });
}

uploadDocumentDette(dette: any, file: File): Observable<any> {
  this.isUploading = true;
  
  return this.declarationService.uploadAutresDettesDocument(dette.id, file).pipe(
    tap((response) => {
      if (response) {
        dette.fileName = response.fileName;
        dette.fileType = response.fileType;
        dette.fileDownloadUri = response.fileDownloadUri;
        dette.hasDocument = true;
        
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Document téléchargé avec succès'
        });
      }
    }),
    catchError(err => {
      console.error('Upload error:', err);
      dette.hasDocument = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Échec de l\'upload: ' + (err.error?.message || err.message)
      });
      return throwError(err);
    }),
    finalize(() => {
      this.isUploading = false;
      this.selectedDette = null;
    })
  );
}
onFileSelectdette(event: any) {
  try {
    if (!event.target.files || event.target.files.length === 0) {
      this.showError('Aucun fichier sélectionné');
      return;
    }

    this.selectedFile = event.target.files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    
    if (this.selectedFile.size > maxSize) {
      this.showError('Le fichier est trop volumineux (max 5MB)');
      this.selectedFile = null;
      return;
    }

    if (!validTypes.includes(this.selectedFile.type)) {
      this.showError('Type de fichier non supporté (PDF, JPEG, PNG uniquement)');
      this.selectedFile = null;
      return;
    }

    if (this.selectedDette) {
      // Pour une dette existante
      this.uploadDocumentDette(this.selectedDette, this.selectedFile).subscribe({
        next: () => {
          this.showSuccess('Document téléchargé avec succès');
          this.displayUploadDialogdette = false;
          this.selectedFile = null;
        },
        error: (err) => {
          console.error('Erreur upload:', err);
          this.showError('Échec de l\'upload du document');
          this.selectedFile = null;
        }
      });
    } else if (this.tableRowAutreDette) {
      // Pour une nouvelle dette
      this.tableRowAutreDette.file = this.selectedFile;
      this.tableRowAutreDette.fileName = this.selectedFile.name;
      this.tableRowAutreDette.fileType = this.selectedFile.type;
      this.showSuccess('Document prêt à être associé à la dette');
      this.displayUploadDialogdette = false;
      this.selectedFile = null;
    }

    event.target.value = '';
  } catch (error) {
    console.error('Erreur dans onFileSelect:', error);
    this.showError('Erreur lors de la sélection du fichier');
    this.selectedFile = null;
  }
}





// Gestion des actions
showAddFormDialogdette() {
  this.tableRowAutreDette = this.resetAutreDette();
  this.displayAddDialog = true;
}

cancelAddDette() {
  this.displayAddDialog = false;
  this.tableRowAutreDette = this.resetAutreDette();
}

confirmAddDette() {
  if (!this.validateAutreDette(this.tableRowAutreDette)) {
    return;
  }
  
  this.confirmationService.confirm({
    message: 'Êtes-vous sûr de vouloir ajouter cette dette ?',
    header: 'Confirmation d\'ajout',
    accept: () => {
      this.addDette();
    }
  });
}

addDette() {
  const detteForApi = this.prepareDetteForApi(this.tableRowAutreDette);
  
  this.declarationService.createAutreDette(detteForApi)
    .subscribe({
      next: (response) => {
        const newDette = {
          ...this.tableRowAutreDette,
          id: response.id,
          isNew: false,
          hasDocument: false
        };
        
        if (this.tableRowAutreDette.file) {
          this.uploadNewDetteDocument(response.id, this.tableRowAutreDette.file, newDette);
        } else {
          this.autresDettesTemp.push(newDette);
          this.displayAddDialog = false;
          this.tableRowAutreDette = this.resetAutreDette();
          
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Dette ajoutée avec succès'
          });
        }
      },
      error: (err) => {
        console.error('Erreur lors de la création de la dette', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de créer la dette: ' + 
                (err.error?.message || err.message || 'Erreur inconnue')
        });
      }
    });
}
uploadNewDetteDocument(detteID: number, file: File, newDette: any) {
  this.declarationService.uploadAutresDettesDocument(detteID, file)
    .subscribe({
      next: (response) => {
        newDette.hasDocument = true;
        newDette.fileName = response.fileName;
        newDette.fileType = response.fileType;
        newDette.fileDownloadUri = response.fileDownloadUri;
        
        this.autresDettesTemp.push(newDette);
        this.displayAddDialog = false;
        this.tableRowAutreDette = this.resetAutreDette();
        
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Dette et document ajoutés avec succès'
        });
      },
      error: (err) => {
        console.error('Erreur lors du téléchargement du document', err);
        // On ajoute quand même la dette sans le document
        newDette.hasDocument = false;
        this.autresDettesTemp.push(newDette);
        this.displayAddDialog = false;
        this.tableRowAutreDette = this.resetAutreDette();
        
        this.messageService.add({
          severity: 'warning',
          summary: 'Attention',
          detail: 'Dette ajoutée, mais erreur lors du téléchargement du document'
        });
      }
    });
}
removeSelectedFiledette() {
  if (this.tableRowAutreDette) {
    this.tableRowAutreDette.file = null;
    this.tableRowAutreDette.fileName = null;
    this.tableRowAutreDette.fileType = null;
    this.tableRowAutreDette.fileDownloadUri = null;
    this.tableRowAutreDette.hasDocument = false;
  }
}

handleFileDropdette(event: DragEvent) {
  event.preventDefault();
  if (event.dataTransfer?.files) {
    const file = event.dataTransfer.files[0];
    this.onFileSelectdette({ target: { files: [file] } });
  }
}

cancelUploaddette() {
  this.selectedFile = null;
  this.displayUploadDialogdette = false;
}

uploadFiledette() {
  if (!this.selectedFile) return;

  if (this.selectedDette) {
    this.uploadDocumentDette(this.selectedDette, this.selectedFile).subscribe({
      next: () => {
        this.displayUploadDialogdette = false;
        this.selectedFile = null;
      }
    });
  } else if (this.tableRowAutreDette) {
    this.tableRowAutreDette.file = this.selectedFile;
    this.tableRowAutreDette.fileName = this.selectedFile.name;
    this.tableRowAutreDette.fileType = this.selectedFile.type;
    this.displayUploadDialogdette = false;
    this.selectedFile = null;
    this.showSuccess('Document prêt à être associé à la dette');
  }
}
// Gestion des modifications
startEditDette(dette: any) {
  dette._backup = JSON.parse(JSON.stringify(dette));
  dette.isEdit = true;
  this.showUploadForDetteId = dette.id;
}

cancelEditDette(dette: any) {
  if (dette._backup) {
    Object.assign(dette, dette._backup);
    delete dette._backup;
  }
  dette.isEdit = false;
  this.showUploadForDetteId = null;
}

confirmSaveUpdatedDette(dette: any) {
  if (!this.validateAutreDette(dette)) {
    return;
  }

  this.confirmationService.confirm({
    message: 'Êtes-vous sûr de vouloir enregistrer les modifications ?',
    header: 'Confirmation de modification',
    accept: () => {
      this.saveUpdatedDette(dette);
    }
  });
}

saveUpdatedDette(dette: any) {
  const detteForApi = this.prepareDetteForApi(dette);
  
  this.loading = true;
  this.declarationService.updateAutreDette(dette.id, detteForApi).subscribe({
    next: () => {
      dette.isEdit = false;
      delete dette._backup;
      this.loading = false;
      this.showUploadForDetteId = null;
      
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Dette mise à jour avec succès!'
      });
    },
    error: (err) => {
      let errorMessage = 'Erreur lors de la mise à jour de la dette';
      if (err.error?.message) errorMessage += ': ' + err.error.message;
      else if (err.message) errorMessage += ': ' + err.message;
      
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: errorMessage
      });
      this.cancelEditDette(dette);
      this.loading = false;
    }
  });
}

// Gestion des suppressions
confirmDeleteSelecteddette() {
  if (!this.selectedAutresDettes || this.selectedAutresDettes.length === 0) return;
  
  this.confirmationService.confirm({
    message: `Êtes-vous sûr de vouloir supprimer les ${this.selectedAutresDettes.length} dettes sélectionnées ?`,
    header: 'Confirmation de suppression',
    accept: () => {
      this.archiveSelectedDettes();
    }
  });
}

confirmDeleteSingledette(dette: any) {
  this.confirmationService.confirm({
    message: 'Êtes-vous sûr de vouloir supprimer cette dette ?',
    header: 'Confirmation de suppression',
    accept: () => {
      this.selectedAutresDettes = [dette];
      this.archiveSelectedDettes();
    }
  });
}

confirmDeleteAlldette() {
  if (this.autresDettesTemp.length === 0) return;
  
  this.confirmationService.confirm({
    message: `Êtes-vous sûr de vouloir supprimer toutes les ${this.autresDettesTemp.length} dettes ?`,
    header: 'Confirmation de suppression totale',
    accept: () => {
      this.deleteAllDettes();
    }
  });
}

deleteAllDettes() {
  if (this.autresDettesTemp.length === 0) return;
  
  const deletePromises = this.autresDettesTemp
    .filter(dette => dette.id > 0)
    .map(dette => this.declarationService.deleteAutreDette(dette.id).toPromise());
  
  Promise.all(deletePromises)
    .then(() => {
      this.autresDettesTemp = [];
      this.selectedAutresDettes = [];
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Toutes les dettes ont été supprimées'
      });
    })
    .catch((err) => {
      console.error('Erreur lors de la suppression de toutes les dettes', err);
      this.loadAutresDettes();
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de supprimer toutes les dettes'
      });
    });
}

archiveSelectedDettes() {
  if (this.selectedAutresDettes?.length > 0) {
    const deletePromises = this.selectedAutresDettes
      .filter(dette => dette.id > 0)
      .map(dette => this.declarationService.deleteAutreDette(dette.id).toPromise());
    
    this.selectedAutresDettes.forEach(dette => {
      const index = this.autresDettesTemp.findIndex(d => d === dette || d.id === dette.id);
      if (index !== -1) this.autresDettesTemp.splice(index, 1);
    });
    
    Promise.all(deletePromises)
      .then(() => {
        this.selectedAutresDettes = [];
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Dettes supprimées avec succès'
        });
      })
      .catch(() => {
        this.loadAutresDettes();
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de supprimer toutes les dettes'
        });
      });
  }
}











// Correct methods for the Disponibilités en Banque component

// PROPERTIES
@ViewChild('filedispoUpload') filedispoUploadElement: ElementRef;
disponibilitesTemp: any[] = []; // Liste locale temporaire
selectedDisponibilites: any[] = []; // Éléments sélectionnés
tableRowDisponibilite: any = {}; // Nouvelle disponibilité en cours d'ajout
banques: Vocabulaire[] = [];
typesCompte: Vocabulaire[] = [];
displayAddDialogDispo = false;
displayUploadDialogDispo = false;
selectedDisponibilite: any = null;
selectedBanque: any = null;

showUploadForDispoId: number | null = null;
currentDisponibiliteForUpload: any = null;
originalDisponibiliteData: any[] = []; // Pour stocker les données originales

resetBanqueFilter(): void {
  this.selectedBanque = null;
  
  // Réinitialiser avec les données originales si disponibles
  if (this.originalDisponibiliteData?.length > 0) {
    this.disponibilitesTemp = [...this.originalDisponibiliteData];
    //return;
  }
  
  // Sinon recharger depuis le serveur
  this.loadDisponibilites();
}


// Fonction de réinitialisation
resetDisponibilite(): any {
  return {
    banque: null,
    numeroCompte: null,
    typeCompte: null,
    soldeFCFA: null,
    dateSolde: null,
    fileName: null,
    fileType: null,
    fileDownloadUri: null,
    hasDocument: false
  };
}

loadDisponibilites() {
  if (!this.declarationData?.id) {
    console.error('ID de déclaration non disponible pour les disponibilités');
    return;
  }

  this.loading = true;
  this.declarationService.getDisponibilitesByDeclaration(this.declarationData.id).subscribe({
    next: (data) => {
      this.disponibilitesTemp = data.map(item => ({
        ...item,
        banque: item.banque || { id: item.banque_id },
        typeCompte: item.typeCompte || { id: item.type_compte_id },
        dateSolde: item.dateSolde || item.date_solde ? new Date(item.dateSolde || item.date_solde) : null,
        soldeFCFA: item.soldeFCFA || item.solde_fcfa,
        numeroCompte: item.numeroCompte || item.numero_compte,
        editing: false,
        hasDocument: !!item.fileName
      }));
      
      this.originalDisponibiliteData = [...this.disponibilitesTemp]; // Sauvegarde des données originales
      this.isDataModified = false;
      this.loading = false;
    },
    error: (err) => {
      console.error('Erreur lors du chargement des disponibilités', err);
      this.error = 'Impossible de charger les disponibilités existantes';
      this.loading = false;
    }
  });
}

// Validation
validateDisponibilite(disponibilite: any): boolean {
  this.submitted = true;
  const isValid = disponibilite.banque && disponibilite.numeroCompte && 
                disponibilite.typeCompte && disponibilite.soldeFCFA && disponibilite.dateSolde;
  
  if (!isValid) {
    if (!disponibilite.banque) {
      this.error = 'Veuillez sélectionner la banque';
    } else if (!disponibilite.numeroCompte) {
      this.error = 'Veuillez renseigner le numéro de compte';
    } else if (!disponibilite.typeCompte) {
      this.error = 'Veuillez sélectionner le type de compte';
    } else if (!disponibilite.soldeFCFA) {
      this.error = 'Veuillez renseigner le solde';
    } else if (!disponibilite.dateSolde) {
      this.error = 'Veuillez sélectionner la date du solde';
    }
  } else {
    this.error = '';
  }
  
  return isValid;
}

// Préparation pour l'API
prepareDisponibiliteForApi(disponibilite: any) {
  return {
    id: disponibilite.id > 0 ? disponibilite.id : null,
    banque: { id: disponibilite.banque.id },
    numeroCompte: disponibilite.numeroCompte,
    typeCompte: { id: disponibilite.typeCompte.id },
    soldeFCFA: disponibilite.soldeFCFA,
    dateSolde: disponibilite.dateSolde instanceof Date 
             ? disponibilite.dateSolde.toISOString().split('T')[0] 
             : disponibilite.dateSolde,
    dateCreation: disponibilite.dateCreation || new Date().toISOString().split('T')[0],
    idDeclaration: { id: this.declarationData.id },
    fileName: disponibilite.fileName,
    fileType: disponibilite.fileType,
    fileDownloadUri: disponibilite.fileDownloadUri
  };
}

// GESTION DES DOCUMENTS
triggerFileUploaddispo(disponibilite: any) {
  this.currentDisponibiliteForUpload = disponibilite;
  if (this.filedispoUploadElement?.nativeElement) {
    this.filedispoUploadElement.nativeElement.click();
  }
}

downloadDocumentdispo(disponibilite: any) {
  if (!disponibilite || !disponibilite.hasDocument) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Attention',
      detail: 'Aucun document disponible pour cette disponibilité'
    });
    return;
  }
  
  this.messageService.add({
    severity: 'info',
    summary: 'Téléchargement',
    detail: 'Téléchargement en cours...'
  });
  
  this.declarationService.downloadDisponibiliteDocument(disponibilite.id)
    .subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = disponibilite.fileName || 'document';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Téléchargement terminé'
        });
      },
      error: (err) => {
        console.error('Erreur lors du téléchargement du document', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de télécharger le document: ' + 
                 (err.error?.message || err.message || 'Erreur inconnue')
        });
      }
    });
}


uploadDocumentDisponibilite(disponibilite: any, file: File): Observable<any> {
  this.isUploading = true;
  
  return this.declarationService.uploadDisponibiliteDocument(disponibilite.id, file).pipe(
    tap((response) => {
      if (response) {
        disponibilite.fileName = response.fileName;
        disponibilite.fileType = response.fileType;
        disponibilite.fileDownloadUri = response.fileDownloadUri;
        disponibilite.hasDocument = true;
        
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Document téléchargé avec succès'
        });
      }
    }),
    catchError(err => {
      console.error('Upload error:', err);
      disponibilite.hasDocument = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Échec de l\'upload: ' + (err.error?.message || err.message)
      });
      return throwError(err);
    }),
    finalize(() => {
      this.isUploading = false;
      this.currentDisponibiliteForUpload = null;
    })
  );
}

onFileSelectdispo(event: any) {
  try {
    if (!event.target.files || event.target.files.length === 0) {
      this.showError('Aucun fichier sélectionné');
      return;
    }

    const file = event.target.files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (file.size > maxSize) {
      this.showError('Le fichier est trop volumineux (max 5MB)');
      return;
    }

    if (!this.isValidFileType(file)) {
      this.showError('Type de fichier non supporté (PDF, DOC, DOCX, JPEG, PNG uniquement)');
      return;
    }

    this.selectedFile = file;

    if (this.currentDisponibiliteForUpload) {
      this.currentDisponibiliteForUpload.file = file;
      this.currentDisponibiliteForUpload.fileName = file.name;
      this.currentDisponibiliteForUpload.fileType = file.type;
      this.showSuccess('Document prêt à être uploadé avec la disponibilité');
      
      // Upload immédiat pour les disponibilités existantes
      if (this.currentDisponibiliteForUpload.id) {
        this.uploadDocumentDisponibilite(this.currentDisponibiliteForUpload, file).subscribe({
          error: (err) => {
            console.error('Erreur upload:', err);
            this.showError('Échec de l\'upload du document');
          }
        });
      }
    } else if (this.tableRowDisponibilite) {
      this.tableRowDisponibilite.file = file;
      this.tableRowDisponibilite.fileName = file.name;
      this.tableRowDisponibilite.fileType = file.type;
      this.showSuccess('Document prêt à être associé à la disponibilité');
    }

    event.target.value = '';
  } catch (error) {
    console.error('Erreur dans onFileSelect:', error);
    this.showError('Erreur lors de la sélection du fichier');
  }
}

handleFileDropdispo(event: DragEvent): void {
  event.preventDefault();
  event.stopPropagation();

  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    const file = event.dataTransfer.files[0];
    const validExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (validExtensions.includes(fileExtension)) {
      this.selectedFile = file;
      
      if (this.currentDisponibiliteForUpload) {
        this.currentDisponibiliteForUpload.fileName = file.name;
      } else if (this.tableRowDisponibilite) {
        this.tableRowDisponibilite.fileName = file.name;
      }
      
      this.messageService.add({
        severity: 'success',
        summary: 'Fichier prêt',
        detail: `${file.name} est prêt à être uploadé`,
        life: 3000
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Format non supporté',
        detail: 'Seuls les fichiers PDF, DOC, DOCX, JPG, JPEG, PNG sont acceptés',
        life: 5000
      });
    }
  }
}


// CRUD Operations
showAddFormDialogdispo() {
  this.tableRowDisponibilite = this.resetDisponibilite();
  this.submitted = false;
  this.displayAddDialogDispo = true;
}

cancelAddDispo() {
  this.displayAddDialogDispo = false;
  this.tableRowDisponibilite = this.resetDisponibilite();
  this.submitted = false;
}

confirmAddDispo() {
  if (!this.validateDisponibilite(this.tableRowDisponibilite)) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Attention',
      detail: 'Veuillez remplir tous les champs obligatoires'
    });
    return;
  }
  
  this.confirmationService.confirm({
    message: 'Êtes-vous sûr de vouloir ajouter cette disponibilité ?',
    header: 'Confirmation d\'ajout',
    accept: () => {
      this.addDisponibilite();
    }
  });
}

addDisponibilite() {
  const disponibiliteForApi = this.prepareDisponibiliteForApi(this.tableRowDisponibilite);
  
  this.declarationService.createDisponibilite(disponibiliteForApi)
    .subscribe({
      next: (response) => {
        const newDisponibilite = {
          ...this.tableRowDisponibilite,
          id: response.id,
          isNew: false,
          hasDocument: false
        };
        
        if (this.tableRowDisponibilite.file) {
          this.uploadNewDisponibiliteDocument(response.id, this.tableRowDisponibilite.file, newDisponibilite);
        } else {
          this.disponibilitesTemp.push(newDisponibilite);
          this.displayAddDialogDispo = false;
          this.tableRowDisponibilite = this.resetDisponibilite();
          this.submitted = false;
          
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Disponibilité ajoutée avec succès'
          });
        }
      },
      error: (err) => {
        console.error('Erreur lors de la création de la disponibilité', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de créer la disponibilité: ' + 
                (err.error?.message || err.message || 'Erreur inconnue')
        });
      }
    });
}

uploadNewDisponibiliteDocument(disponibiliteID: number, file: File, newDisponibilite: any) {
  this.declarationService.uploadDisponibiliteDocument(disponibiliteID, file)
    .subscribe({
      next: (response) => {
        if (response) {
          newDisponibilite.hasDocument = true;
          newDisponibilite.fileName = response.fileName;
          newDisponibilite.fileType = response.fileType;
          newDisponibilite.fileDownloadUri = response.fileDownloadUri;
        }
        
        this.disponibilitesTemp.push(newDisponibilite);
        this.displayAddDialogDispo = false;
        this.tableRowDisponibilite = this.resetDisponibilite();
        this.submitted = false;
        
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Disponibilité ajoutée avec succès'
        });
      },
      error: (err) => {
        console.error('Erreur lors du téléchargement du document', err);
        this.disponibilitesTemp.push(newDisponibilite);
        this.displayAddDialogDispo = false;
        this.tableRowDisponibilite = this.resetDisponibilite();
        this.submitted = false;
        
        this.messageService.add({
          severity: 'warning',
          summary: 'Attention',
          detail: 'Disponibilité ajoutée, mais erreur lors du téléchargement du document'
        });
      }
    });
}

// Delete operations
confirmDeleteSelecteddispo() {
  if (!this.selectedDisponibilites || this.selectedDisponibilites.length === 0) return;
  
  this.confirmationService.confirm({
    message: `Êtes-vous sûr de vouloir supprimer les ${this.selectedDisponibilites.length} disponibilités sélectionnées ?`,
    header: 'Confirmation de suppression',
    accept: () => {
      this.archiveSelectedDisponibilites();
    }
  });
}

confirmDeleteSingledispo(disponibilite: any) {
  this.confirmationService.confirm({
    message: 'Êtes-vous sûr de vouloir supprimer cette disponibilité ?',
    header: 'Confirmation de suppression',
    accept: () => {
      this.selectedDisponibilites = [disponibilite];
      this.archiveSelectedDisponibilites();
    }
  });
}

archiveSelectedDisponibilites() {
  if (this.selectedDisponibilites?.length > 0) {
    const deletePromises = this.selectedDisponibilites
      .filter(disponibilite => disponibilite.id > 0)
      .map(disponibilite => this.declarationService.deleteDisponibilite(disponibilite.id).toPromise());
    
    this.selectedDisponibilites.forEach(disponibilite => {
      const index = this.disponibilitesTemp.findIndex(d => d === disponibilite || d.id === disponibilite.id);
      if (index !== -1) this.disponibilitesTemp.splice(index, 1);
    });
    
    Promise.all(deletePromises)
      .then(() => {
        this.selectedDisponibilites = [];
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Disponibilités supprimées avec succès'
        });
      })
      .catch(() => {
        this.loadDisponibilites();
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de supprimer les disponibilités sélectionnées'
        });
      });
  }
}

// Edit operations
startEditDisponibilite(disponibilite: any) {
  this.disponibilitesTemp.forEach(item => item.editing = false);
  disponibilite.editing = true;
  disponibilite._backup = { ...disponibilite };
  this.showUploadForDispoId = disponibilite.id;
}

cancelEditDisponibilite(disponibilite: any) {
  if (disponibilite._backup) {
    Object.assign(disponibilite, disponibilite._backup);
    delete disponibilite._backup;
  }
  disponibilite.editing = false;
  this.showUploadForDispoId = null;
}

confirmSaveUpdatedDisponibilite(disponibilite: any) {
  if (!this.validateDisponibilite(disponibilite)) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Attention',
      detail: 'Veuillez remplir tous les champs obligatoires'
    });
    return;
  }
  
  this.confirmationService.confirm({
    message: 'Êtes-vous sûr de vouloir enregistrer les modifications ?',
    header: 'Confirmation de modification',
    accept: () => {
      this.saveUpdatedDisponibilite(disponibilite);
    }
  });
}

saveUpdatedDisponibilite(disponibilite: any) {
  const disponibiliteForApi = this.prepareDisponibiliteForApi(disponibilite);
  
  this.declarationService.updateDisponibilite(disponibilite.id, disponibiliteForApi)
    .subscribe({
      next: () => {
        disponibilite.editing = false;
        disponibilite.isModified = false;
        delete disponibilite._backup;
        this.showUploadForDispoId = null;
        
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Disponibilité mise à jour avec succès'
        });
      },
      error: (err) => {
        this.cancelEditDisponibilite(disponibilite);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Échec de la mise à jour: ' + (err.error?.message || err.message)
        });
      }
    });
}

// Filter operations
filterByBanque() {
  if (this.selectedBanque) {
    this.disponibilitesTemp = this.originalDisponibiliteData.filter(
      item => item.banque?.id === this.selectedBanque.id
    );
  } else {
    this.disponibilitesTemp = [...this.originalDisponibiliteData];
  }
}

// Document upload utilities
showUploadDialogdispo(disponibilite: any) {
  this.currentDisponibiliteForUpload = disponibilite;
  this.selectedFile = null;
  this.displayUploadDialogDispo = true;
}

uploadFiledispo() {
  if (!this.selectedFile || !this.currentDisponibiliteForUpload) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Attention',
      detail: 'Veuillez sélectionner un fichier'
    });
    return;
  }

  this.uploadDocumentDisponibilite(this.currentDisponibiliteForUpload, this.selectedFile)
    .subscribe({
      next: () => {
        this.displayUploadDialogDispo = false;
        this.selectedFile = null;
      },
      error: () => {
        this.selectedFile = null;
      }
    });
}

cancelUploaddispo() {
  this.displayUploadDialogDispo = false;
  this.selectedFile = null;
}

removeSelectedFileDispo() {
  if (this.tableRowDisponibilite) {
    this.tableRowDisponibilite.file = null;
    this.tableRowDisponibilite.fileName = null;
    this.tableRowDisponibilite.fileType = null;
    this.tableRowDisponibilite.hasDocument = false;
  }
  this.selectedFile = null;
}




}