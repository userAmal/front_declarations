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
import { forkJoin, Observable } from 'rxjs';
import { formatDate } from '@angular/common';
// In main.ts or polyfills.ts
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { HttpEventType } from '@angular/common/http';
import { finalize, switchMap } from 'rxjs/operators';
import { ConfirmationService, MessageService } from 'primeng/api';
import { animate, state, style, transition, trigger } from '@angular/animations';

registerLocaleData(localeFr);
@Component({
  selector: 'app-declaration',
  templateUrl: './declaration.component.html',
  styleUrls: ['./declaration.component.scss'],
  providers: [MessageService] ,
  animations: [

    
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
      ])
    ]),
    trigger('rowAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateX(10px)' }))
      ]),
      state('editing', style({ backgroundColor: 'rgba(33, 150, 243, 0.05)' })),
      transition('* => editing', [
        animate('200ms ease-out', style({ backgroundColor: 'rgba(33, 150, 243, 0.05)' }))
      ]),
      transition('editing => *', [
        animate('200ms ease-in', style({ backgroundColor: 'transparent' }))
      ])
    ]),
    trigger('dialogAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'scale(0.95)' }))
      ])
    ]),
    trigger('toastAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-20px)' }))
      ])
    ])
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
        this.loadAnimauxFromBackend();
this.loadEmprunts();
 this.getEspeces();
 this.loadTitresForDeclaration();

 this.loadCreancesByDeclaration();
 this.loadRevenusByDeclaration();
 this.loadVehiculesByDeclaration();
this.loadAutresBiensByDeclaration();
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
typesRevenu: Vocabulaire[] = [];
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
    this.saveFonciersNonBatiDeclaration();
    //this.saveFonciersBatiDeclaration();
    this.saveMeublesMeublantsDeclaration();
    this.saveAppareilsDeclaration();
    //this.saveAnimauxDeclaration();
    this.saveEmpruntsDeclaration();
    this.saveEspecesDeclaration();
    this.saveTitresDeclaration();
    this.saveCreancesDeclaration();
    this.saveRevenusDeclaration();
    this.saveVehiculesDeclaration();
    this.saveAutresBiensDeclaration();
    this.saveAutresDettes();
   this.saveDisponibilitesDeclaration();
  }

 
    @ViewChild('fileUpload') fileUploadElement: ElementRef;
        
    // Propriétés pour la gestion des fonciers
    foncierBatiTemp: any[] = [];
    selectedFonciers: any[] = [];
    tableRowFoncier: any = {};
    isDataModified = false;
    displayAddDialog = false;
    isAddingTableRow = false;

    // Propriétés pour la gestion des documents
    uploadedFiles: any[] = [];
    isUploading = false;
    selectedFoncier: any = null;
   // Méthode appelée lors de la sélection d'un fichier
   onFileSelect(event: any) {
    if (!event.target.files || event.target.files.length === 0) {
      this.showError('Aucun fichier sélectionné');
      return;
    }
    
    const file = event.target.files[0];
    
    // Vérification du type de fichier
    if (!this.isValidFileType(file)) {
      this.showError('Type de fichier non supporté. Formats acceptés: PDF, JPG, PNG, DOC, DOCX');
      this.resetFileInput();
      return;
    }
  
    // Vérification de la taille (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      this.showError('La taille du fichier ne doit pas dépasser 5MB');
      this.resetFileInput();
      return;
    }
  
    // Suite du traitement...
    if (this.selectedFoncier === this.tableRowFoncier) {
      // Cas d'un nouveau foncier
      this.tableRowFoncier.file = file;
      this.tableRowFoncier.fileName = file.name;
      this.tableRowFoncier.fileType = file.type;
      this.showSuccess('Document sélectionné. Il sera associé au nouveau foncier');
    } else if (this.selectedFoncier.hasDocument) {
      // Cas d'une modification de document
      this.modifyDocument(this.selectedFoncier, file);
    } else {
      // Cas d'un ajout de document sur un foncier existant
      this.uploadDocument(this.selectedFoncier, file);
    }
  
    this.resetFileInput();
  }
   // Méthode pour gérer la modification d'un document existant
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
    
    // Si un document existe déjà, nous devons d'abord le supprimer
    let operation$: Observable<any>;
    
    if (foncier.hasDocument) {
      // Enchaîner suppression puis ajout
      operation$ = this.declarationService.deleteFoncierBati(foncier.id).pipe(
        switchMap(() => this.declarationService.uploadFoncierDocument(foncier.id, file))
      );
    } else {
      // Upload direct
      operation$ = this.declarationService.uploadFoncierDocument(foncier.id, file);
    }
    
    operation$.subscribe({
      next: (response) => {
        if (response) {
          const index = this.foncierBatiTemp.findIndex(f => f.id === foncier.id);
          if (index !== -1) {
            this.foncierBatiTemp[index].fileName = response.fileName;
            this.foncierBatiTemp[index].fileType = response.fileType;
            this.foncierBatiTemp[index].fileDownloadUri = response.fileDownloadUri;
            this.foncierBatiTemp[index].hasDocument = true;
          }
          
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: foncier.hasDocument ? 'Document mis à jour avec succès' : 'Document téléchargé avec succès'
          });
        }
        this.selectedFoncier = null;
        this.isUploading = false;
      },
      error: (err) => {
        console.error('Erreur lors de la modification du document', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de modifier le document: ' + 
                 (err.error?.message || err.message || 'Erreur inconnue')
        });
        this.isUploading = false;
      },
      complete: () => {
        // Réinitialiser l'input file
        this.resetFileInput();
      }
    });
  }
      // Upload d'un document pour un foncier existant
      uploadDocument(foncier: any, file: File) {
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
          .subscribe({
            next: (response) => {
              if (response) {
                const index = this.foncierBatiTemp.findIndex(f => f.id === foncier.id);
                if (index !== -1) {
                  this.foncierBatiTemp[index].fileName = response.fileName;
                  this.foncierBatiTemp[index].fileType = response.fileType;
                  this.foncierBatiTemp[index].fileDownloadUri = response.fileDownloadUri;
                  this.foncierBatiTemp[index].hasDocument = true;
                }
                
                this.messageService.add({
                  severity: 'success',
                  summary: 'Succès',
                  detail: 'Document téléchargé avec succès'
                });
              }
              this.selectedFoncier = null;
              this.isUploading = false;
            },
            error: (err) => {
              console.error('Erreur lors du téléchargement du document', err);
              this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Impossible de télécharger le document: ' + 
                       (err.error?.message || err.message || 'Erreur inconnue')
              });
              this.isUploading = false;
            },
            complete: () => {
              // Réinitialiser l'input file
              this.resetFileInput();
            }
          });
      }
      
      // Méthode de téléchargement améliorée
      downloadDocument(foncier: any) {
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
        
        this.declarationService.downloadFoncierDocument(foncier.id)
          .subscribe({
            next: (blob) => {
              // Créer URL pour le téléchargement
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
                detail: 'Impossible de télécharger le document: ' + 
                       (err.error?.message || err.message || 'Erreur inconnue')
              });
            }
          });
      }
      
      // Méthodes utilitaires
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
     // Pour un nouveau foncier sans ID encore
     showUploadDialogForNewFoncier() {
      this.selectedFoncier = this.tableRowFoncier;
      this.fileUploadElement.nativeElement.click();
    }
    
// Propriétés à ajouter dans votre classe DeclarationComponent
submitted: boolean = false;
selectedFile: File = null;
// In your DeclarationComponent class
currentFoncierForUpload: any = null; // Or use a proper interface/type instead of 'any'
// Méthode pour gérer l'action de suppression
handleDeleteAction() {
  if (this.selectedFonciers.length > 0) {
    this.confirmDeleteSelected();
  } else {
    this.confirmDeleteAll();
  }
}


// Méthode pour le drag and drop (à garder séparée)
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
        // Champs pour le document
        fileName: foncier.fileName,
        fileType: foncier.fileType,
        fileDownloadUri: foncier.fileDownloadUri
      };
    }
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
  
    formatAnneeConstruction(annee: any): Date {
      if (typeof annee === 'number') {
        return new Date(annee, 0, 1);
      } else if (typeof annee === 'string' && /^\d+$/.test(annee)) {
        return new Date(parseInt(annee), 0, 1);
      }
      return annee;
    }
    
   
    
    showAddFormDialog() {
      this.tableRowFoncier = {}; // Réinitialise le formulaire
      this.displayAddDialog = true;
    }
    
    cancelAddFoncier() {
      this.displayAddDialog = false;
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
        .subscribe({
          next: (response) => {
            const newFoncier = {
              ...this.tableRowFoncier,
              id: response.id,
              isNew: false,
              hasDocument: false
            };
            
            // Si un fichier est attaché, l'uploader maintenant
            if (this.tableRowFoncier.file) {
              this.uploadNewFoncierDocument(response.id, this.tableRowFoncier.file, newFoncier);
            } else {
              this.foncierBatiTemp.push(newFoncier);
              this.displayAddDialog = false;
              this.tableRowFoncier = {};
              
              this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: 'Foncier bâti ajouté avec succès'
              });
            }
          },
          error: (err) => {
            console.error('Erreur lors de la création du foncier bâti', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Impossible de créer le foncier bâti: ' + 
                    (err.error?.message || err.message || 'Erreur inconnue')
            });
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
            this.displayAddDialog = false;
            this.tableRowFoncier = {};
            
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Foncier bâti ajouté avec succès'
            });
          },
          error: (err) => {
            console.error('Erreur lors du téléchargement du document', err);
            // On ajoute quand même le foncier même si l'upload a échoué
            this.foncierBatiTemp.push(newFoncier);
            this.displayAddDialog = false;
            this.tableRowFoncier = {};
            
            this.messageService.add({
              severity: 'warning',
              summary: 'Attention',
              detail: 'Foncier ajouté, mais erreur lors du téléchargement du document'
            });
          }
        });
    }
    
    // MÉTHODES DE CONFIRMATION D'ACTIONS
    
    confirmDeleteSelected() {
      if (!this.selectedFonciers || this.selectedFonciers.length === 0) return;
      
      this.confirmationService.confirm({
        message: `Êtes-vous sûr de vouloir supprimer les ${this.selectedFonciers.length} fonciers sélectionnés ?`,
        header: 'Confirmation de suppression',
        accept: () => {
          this.archiveSelectedFoncier();
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
    
    // MÉTHODES EXISTANTES MODIFIÉES
    
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
      // Désactiver l'édition pour tous les autres fonciers
      this.foncierBatiTemp.forEach(item => item.editing = false);
      
      // Activer l'édition pour ce foncier
      foncier.editing = true;
      foncier._backup = { ...foncier };
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
            
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Foncier bâti mis à jour avec succès'
            });
          },
          error: (err) => {
            let errorMessage = 'Erreur lors de la mise à jour du foncier bâti';
            if (err.error?.message) errorMessage += ': ' + err.error.message;
            else if (err.message) errorMessage += ': ' + err.message;
            
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: errorMessage
            });
            
            this.cancelEditFoncier(foncier);
          }
        });
    }
    
    cancelEditFoncier(foncier: any) {
      if (foncier._backup) {
        Object.assign(foncier, foncier._backup);
        delete foncier._backup;
      }
      foncier.editing = false;
    }
    
    validateFoncier(foncier: any): boolean {
      return foncier.nature && foncier.anneeConstruction && 
             foncier.modeAcquisition && foncier.referencesCadastrales;
    }
    
    // GESTION DES DOCUMENTS - MÉTHODES
    
    // Méthode pour vérifier si le type de fichier est valide
    private isValidFileType(file: File): boolean {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 
                        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const validExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
      
      // Vérification par type MIME
      if (validTypes.includes(file.type)) {
        return true;
      }
      
      // Vérification par extension si le type MIME n'est pas reconnu
      const extension = file.name.split('.').pop()?.toLowerCase();
      return extension ? validExtensions.includes(extension) : false;
    }
    

  
fonciersNonBati: any[] = [];
selectedFoncierNonBati: any[] = [];

isAddingFoncierNonBati = false;
newFoncierNonBati: any = this.resetFoncier();

editedFoncierNonBati: any = null;
tableRowFoncierNonBati: any = {};

foncierNonBatiTemp: any[] = [];

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
          isEdit: false
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
    coutInvestissement: 0
  };
}

validateFoncierNonBati(foncier: any): boolean {
  return foncier.nature && 
         foncier.modeAcquisition && 
         foncier.superficie > 0 && 
         foncier.localite &&
         foncier.valeurAcquisFCFA >= 0 &&
         foncier.coutInvestissement >= 0;
}

addTableRowFoncierNonBati() {
  if (!this.validateFoncierNonBati(this.tableRowFoncierNonBati)) {
    alert('Veuillez remplir tous les champs obligatoires');
    return;
  }

  const foncierForApi = this.prepareFoncierNonBatiForApi(this.tableRowFoncierNonBati);
  
  this.declarationService.createFoncierNonBati(foncierForApi).subscribe({
    next: (response) => {
      this.fonciersNonBati.push({ 
        ...this.tableRowFoncierNonBati, 
        id: response.id,
        isNew: false
      });
      this.foncierNonBatiTemp = [...this.fonciersNonBati];
      this.cancelTableRowFoncierNonBati();
      alert('Foncier non bâti ajouté avec succès!');
    },
    error: (err) => alert('Erreur lors de l\'ajout du foncier non bâti')
  });
}

cancelTableRowFoncierNonBati() {
  this.isAddingFoncierNonBati = false;
  this.tableRowFoncierNonBati = {};
}

saveNewFoncierNonBati() {
  if (!this.validateFoncierNonBati(this.newFoncierNonBati)) {
    alert('Veuillez remplir tous les champs obligatoires');
    return;
  }

  const foncierForApi = this.prepareFoncierNonBatiForApi(this.newFoncierNonBati);
  
  this.declarationService.createFoncierNonBati(foncierForApi).subscribe({
    next: (response) => {
      this.fonciersNonBati.push({
        ...this.newFoncierNonBati,
        id: response.id,
        isNew: false
      });
      this.foncierNonBatiTemp = [...this.fonciersNonBati];
      this.cancelNewFoncierNonBati();
      alert('Foncier non bâti ajouté avec succès!');
    },
    error: (err) => alert('Erreur lors de l\'ajout du foncier non bâti')
  });
}

cancelNewFoncierNonBati() {
  this.isAddingFoncierNonBati = false;
  this.newFoncierNonBati = this.resetFoncier();
}

editFoncierNonBati(foncier: any) {
  foncier._backup = JSON.parse(JSON.stringify(foncier));
  foncier.isEdit = true;
}

saveEditedFoncierNonBati(foncier: any) {
  if (!this.validateFoncierNonBati(foncier)) {
    alert('Veuillez remplir tous les champs obligatoires');
    return;
  }

  const foncierForApi = this.prepareFoncierNonBatiForApi(foncier);
  
  this.declarationService.updateFoncierNonBati(foncier.id, foncierForApi)
    .subscribe({
      next: () => {
        foncier.isEdit = false;
        delete foncier._backup;
        alert('Foncier non bâti mis à jour avec succès!');
      },
      error: (err) => {
        let errorMessage = 'Erreur lors de la mise à jour du foncier non bâti';
        if (err.error?.message) errorMessage += ': ' + err.error.message;
        else if (err.message) errorMessage += ': ' + err.message;
        
        alert(errorMessage);
        this.cancelEditFoncierNonBati(foncier);
      }
    });
}

cancelEditFoncierNonBati(foncier: any) {
  if (foncier._backup) {
    Object.assign(foncier, foncier._backup);
    delete foncier._backup;
  }
  foncier.isEdit = false;
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
      alert('Suppression effectuée avec succès');
      this.selectedFoncierNonBati = [];
    })
    .catch(() => {
      alert('Erreur lors de la suppression des éléments');
      this.loadFonciersNonBati();
    });
}

saveFonciersNonBatiDeclaration() {
  if (this.fonciersNonBati.length === 0 && !this.isDataModified) {
    alert('Aucune modification à enregistrer !');
    return;
  }

  const newFonciers = this.fonciersNonBati.filter(f => f.isNew);
  const modifiedFonciers = this.fonciersNonBati.filter(f => f.isModified && !f.isNew);
  const deletedFonciers = this.selectedFoncierNonBati.filter(f => f.isDeleted && f.id > 0);
  
  const requests = [
    ...newFonciers.map(f => this.declarationService.createFoncierNonBati(this.prepareFoncierNonBatiForApi(f))),
    ...modifiedFonciers.map(f => this.declarationService.updateFoncierNonBati(f.id, this.prepareFoncierNonBatiForApi(f))),
    ...deletedFonciers.map(f => this.declarationService.deleteFoncierNonBati(f.id))
  ];
  
  if (requests.length > 0) {
    forkJoin(requests).subscribe({
      next: (responses) => {
        alert(`${responses.length} opérations effectuées avec succès !`);
        this.loadFonciersNonBati();
      },
      error: () => alert('Certaines opérations n\'ont pas pu être effectuées !')
    });
  } else {
    alert('Aucune modification à enregistrer !');
  }
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
    idDeclaration: { id: this.declarationData.id }
  };
}
// Propriétés
meublesMeublant: any[] = [];
selectedMeublesMeublant: any[] = [];
tableRowMeubleMeublant: any = {};

// Chargement des meubles meublants
loadMeublesMeublants() {
  if (!this.declarationData?.id) {
    console.error('ID de déclaration non disponible');
    return;
  }

  this.declarationService.getMeublesMeublantsByDeclaration(this.declarationData.id)
    .subscribe({
      next: (data) => {
        this.meublesMeublant = data.map(item => ({
          ...item,
          anneeAcquisition: this.formatAnnee(item.anneeAcquisition),
          editing: false,
          isModified: false
        }));
        this.isDataModified = false;
      },
      error: (err) => console.error('Erreur lors du chargement des meubles meublants', err)
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

// Validation
validateMeuble(meuble: any): boolean {
  return !!meuble.designation && 
         !!meuble.anneeAcquisition && 
         !!meuble.valeurAcquisition && 
         !!meuble.etatGeneral;
}

// Ajout/Modification
addTableRowMeubleToTable() {
  if (!this.validateMeuble(this.tableRowMeubleMeublant)) {
    alert('Veuillez remplir tous les champs obligatoires');
    return;
  }

  const meubleForApi = this.prepareMeubleForApi(this.tableRowMeubleMeublant);
  
  if (this.tableRowMeubleMeublant.id && this.tableRowMeubleMeublant.id > 0) {
    // Mise à jour
    this.declarationService.updateMeubleMeublant(this.tableRowMeubleMeublant.id, meubleForApi)
      .subscribe({
        next: (response) => {
          const index = this.meublesMeublant.findIndex(m => m.id === this.tableRowMeubleMeublant.id);
          if (index !== -1) {
            this.meublesMeublant[index] = {
              ...response,
              anneeAcquisition: this.formatAnnee(response.anneeAcquisition),
              isModified: false,
              editing: false
            };
          }
          this.cancelTableRowMeuble();
          alert('Meuble meublant mis à jour avec succès!');
        },
        error: (err) => alert('Erreur lors de la mise à jour: ' + (err.message || err))
      });
  } else {
    // Création
    this.declarationService.createMeubleMeublant(meubleForApi)
      .subscribe({
        next: (response) => {
          this.meublesMeublant.push({
            ...response,
            anneeAcquisition: this.formatAnnee(response.anneeAcquisition),
            isNew: false
          });
          this.cancelTableRowMeuble();
          alert('Meuble meublant ajouté avec succès!');
        },
        error: (err) => alert('Erreur lors de l\'ajout: ' + err.message)
      });
  }
}

// Préparation pour l'API
prepareMeubleForApi(meuble: any) {
  const annee = meuble.anneeAcquisition instanceof Date ? 
               meuble.anneeAcquisition.getFullYear() : meuble.anneeAcquisition;
  
  return {
    id: meuble.id > 0 ? meuble.id : null,
    designation: meuble.designation,
    anneeAcquisition: annee,
    valeurAcquisition: meuble.valeurAcquisition,
    etatGeneral: meuble.etatGeneral,
    dateCreation: meuble.dateCreation || new Date().toISOString().split('T')[0],
    idDeclaration: { id: this.declarationData.id }
  };
}

// Annulation
cancelTableRowMeuble() {
  this.isAddingTableRow = false;
  this.tableRowMeubleMeublant = {};
}

startEditMeuble(meuble: any) {
  this.meublesMeublant.forEach(item => {
    item.editing = item === meuble; // Seul l'élément édité a editing=true
  });
  
  // Sauvegarde de l'état original pour annulation
  meuble._backup = {
    designation: {...meuble.designation},
    anneeAcquisition: new Date(meuble.anneeAcquisition),
    valeurAcquisition: meuble.valeurAcquisition,
    etatGeneral: {...meuble.etatGeneral}
  };
}

// Sauvegarde après édition
saveUpdatedMeuble(meuble: any) {
  if (!this.validateMeuble(meuble)) {
    alert('Veuillez remplir tous les champs obligatoires');
    return;
  }
  
  const originalYear = meuble.anneeAcquisition;
  const meubleForApi = this.prepareMeubleForApi(meuble);
  
  this.declarationService.updateMeubleMeublant(meuble.id, meubleForApi)
    .subscribe({
      next: () => {
        meuble.editing = false;
        meuble.isModified = false;
        delete meuble._backup;
        meuble.anneeAcquisition = originalYear;
        
        alert('Meuble meublant mis à jour avec succès!');
      },
      error: (err) => {
        let errorMessage = 'Erreur lors de la mise à jour du meuble meublant';
        if (err.error?.message) errorMessage += ': ' + err.error.message;
        else if (err.message) errorMessage += ': ' + err.message;
        
        alert(errorMessage);
        this.cancelEditMeuble(meuble);
      }
    });
}

// Annulation édition
cancelEditMeuble(meuble: any) {
  if (meuble._backup) {
    Object.assign(meuble, meuble._backup);
    delete meuble._backup;
  }
  meuble.editing = false;
}

// Suppression
deleteSelectedMeubles() {
  if (this.selectedMeublesMeublant.length === 0) return;
  
  if (confirm(`Êtes-vous sûr de vouloir supprimer les ${this.selectedMeublesMeublant.length} meubles sélectionnés ?`)) {
    const deletePromises = this.selectedMeublesMeublant
      .filter(meuble => meuble.id > 0)
      .map(meuble => this.declarationService.deleteMeubleMeublant(meuble.id).toPromise());
    
    this.selectedMeublesMeublant.forEach(meuble => {
      const index = this.meublesMeublant.findIndex(m => m === meuble || m.id === meuble.id);
      if (index !== -1) this.meublesMeublant.splice(index, 1);
    });
    
    Promise.all(deletePromises)
      .then(() => {
        alert('Suppression effectuée avec succès');
        this.selectedMeublesMeublant = [];
      })
      .catch(() => {
        alert('Erreur lors de la suppression des éléments');
        this.loadMeublesMeublants();
      });
  }
}

// Sauvegarde globale
saveMeublesMeublantsDeclaration() {
  if (this.meublesMeublant.length === 0 && !this.isDataModified) {
    alert('Aucune modification à enregistrer !');
    return;
  }

  const newMeubles = this.meublesMeublant.filter(m => !m.id || m.id <= 0);
  const modifiedMeubles = this.meublesMeublant.filter(m => m.isModified && m.id > 0);
  
  const requests = [
    ...newMeubles.map(m => this.declarationService.createMeubleMeublant(this.prepareMeubleForApi(m))),
    ...modifiedMeubles.map(m => this.declarationService.updateMeubleMeublant(m.id, this.prepareMeubleForApi(m)))
  ];
  
  if (requests.length > 0) {
    forkJoin(requests).subscribe({
      next: (responses) => {
        alert(`${responses.length} opérations effectuées avec succès !`);
        this.loadMeublesMeublants();
      },
      error: () => alert('Certaines opérations n\'ont pas pu être effectuées !')
    });
  } else {
    alert('Aucune modification à enregistrer !');
  }
}
appareilsTemp: any[] = []; // Liste locale temporaire
selectedAppareils: any[] = []; // Éléments sélectionnés
newAppareil: any = {}; // Nouvel appareil en cours d'ajout
tableRowAppareil: any = {};

// Fonction de réinitialisation
  resetAppareil(): any {
    return {
      designation: null,
      anneeAcquisition: null,
      valeurAcquisition: null,
      etatGeneral: null
    };
  }

  // Chargement des appareils
  loadAppareilsFromDeclaration() {
    if (!this.declarationData?.id) {
      console.error('ID de déclaration non disponible pour les appareils');
      return;
    }

    this.loading = true;
    this.declarationService.getAppareilsByDeclaration(this.declarationData.id).subscribe({
      next: (data) => {
        this.appareilsTemp = data.map(item => ({
          ...item,
          anneeAcquisition: item.anneeAcquisition ? new Date(item.anneeAcquisition, 0) : null,
          isEdit: false
        }));
        this.isDataModified = false;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des appareils', err);
        this.error = 'Impossible de charger les appareils existants';
        this.loading = false;
      }
    });
  }

  // Validation
  validateAppareil(appareil: any): boolean {
    const isValid = appareil.designation && appareil.anneeAcquisition && 
                   appareil.valeurAcquisition && appareil.etatGeneral;
    
    if (!isValid) {
      if (!appareil.designation) {
        this.error = 'Veuillez sélectionner la désignation';
      } else if (!appareil.anneeAcquisition) {
        this.error = 'Veuillez sélectionner l\'année d\'acquisition';
      } else if (!appareil.valeurAcquisition) {
        this.error = 'Veuillez renseigner la valeur d\'acquisition';
      } else if (!appareil.etatGeneral) {
        this.error = 'Veuillez sélectionner l\'état général';
      }
    } else {
      this.error = '';
    }
    
    return isValid;
  }

  // Préparation pour l'API
  prepareAppareilForApi(appareil: any) {
    const anneeAcquisition = appareil.anneeAcquisition instanceof Date 
                           ? appareil.anneeAcquisition.getFullYear()
                           : parseInt(appareil.anneeAcquisition);

    return {
      id: appareil.id > 0 ? appareil.id : null,
      designation: { id: appareil.designation.id },
      anneeAcquisition: anneeAcquisition,
      valeurAcquisition: appareil.valeurAcquisition,
      etatGeneral: { id: appareil.etatGeneral.id },
      dateCreation: appareil.dateCreation || new Date().toISOString().split('T')[0],
      idDeclaration: { id: this.declarationData.id }
    };
  }

  // Opérations CRUD
  addTableRowAppareilToTable() {
    if (!this.validateAppareil(this.tableRowAppareil)) {
      return;
    }

    const appareilForApi = this.prepareAppareilForApi(this.tableRowAppareil);
    
    this.loading = true;
    this.declarationService.createAppareil(appareilForApi).subscribe({
      next: (response) => {
        this.appareilsTemp.push({ 
          ...this.tableRowAppareil, 
          id: response.id,
          isNew: false
        });
        this.cancelTableRowAppareil();
        this.loading = false;
        alert('Appareil ajouté avec succès!');
      },
      error: (err) => {
        alert('Erreur lors de l\'ajout de l\'appareil');
        this.loading = false;
      }
    });
  }

  cancelTableRowAppareil() {
    this.isAddingTableRow = false;
    this.tableRowAppareil = this.resetAppareil();
  }

  startEditAppareil(appareil: any) {
    appareil._backup = JSON.parse(JSON.stringify(appareil));
    appareil.isEdit = true;
  }

  saveUpdatedAppareil(appareil: any) {
    if (!this.validateAppareil(appareil)) {
      return;
    }

    const appareilForApi = this.prepareAppareilForApi(appareil);
    
    this.loading = true;
    this.declarationService.updateAppareil(appareil.id, appareilForApi).subscribe({
      next: () => {
        appareil.isEdit = false;
        delete appareil._backup;
        this.loading = false;
        alert('Appareil mis à jour avec succès!');
      },
      error: (err) => {
        let errorMessage = 'Erreur lors de la mise à jour de l\'appareil';
        if (err.error?.message) errorMessage += ': ' + err.error.message;
        else if (err.message) errorMessage += ': ' + err.message;
        
        alert(errorMessage);
        this.cancelEditAppareil(appareil);
        this.loading = false;
      }
    });
  }

  cancelEditAppareil(appareil: any) {
    if (appareil._backup) {
      Object.assign(appareil, appareil._backup);
      delete appareil._backup;
    }
    appareil.isEdit = false;
  }

  archiveSelectedAppareils() {
    if (!this.selectedAppareils?.length) return;
    
    if (confirm('Êtes-vous sûr de vouloir archiver les appareils sélectionnés?')) {
      const deletePromises = this.selectedAppareils
        .filter(appareil => appareil.id > 0)
        .map(appareil => this.declarationService.deleteAppareil(appareil.id).toPromise());
      
      this.appareilsTemp = this.appareilsTemp.filter(
        a => !this.selectedAppareils.includes(a)
      );
      
      this.loading = true;
      Promise.all(deletePromises)
        .then(() => {
          alert('Archivage effectué avec succès');
          this.selectedAppareils = [];
          this.loading = false;
        })
        .catch(() => {
          alert('Erreur lors de l\'archivage des éléments');
          this.loadAppareilsFromDeclaration();
          this.loading = false;
        });
    }
  }

  saveAppareilsDeclaration() {
    if (this.appareilsTemp.length === 0 && !this.isDataModified) {
      alert('Aucune modification à enregistrer !');
      return;
    }

    const newAppareils = this.appareilsTemp.filter(a => a.isNew);
    const modifiedAppareils = this.appareilsTemp.filter(a => a._modified && !a.isNew);
    
    const requests = [
      ...newAppareils.map(a => this.declarationService.createAppareil(this.prepareAppareilForApi(a))),
      ...modifiedAppareils.map(a => this.declarationService.updateAppareil(a.id, this.prepareAppareilForApi(a)))
    ];
    
    if (requests.length > 0) {
      this.loading = true;
      forkJoin(requests).subscribe({
        next: (responses) => {
          alert(`${responses.length} opérations effectuées avec succès !`);
          this.loadAppareilsFromDeclaration();
          this.loading = false;
        },
        error: () => {
          alert('Certaines opérations n\'ont pas pu être effectuées !');
          this.loading = false;
        }
      });
    } else {
      alert('Aucune modification à enregistrer !');
    }
  }

// Add these variables to your component class
animaux: any[] = [];
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
isEditMode = false;

// New variables for file upload
@ViewChild('fileInput') fileInput: ElementRef;
//selectedFile: File = null;
selectedAnimal: any = null;
displayUploadDialog = false;
uploadProgress = 0;
loadAnimauxFromBackend() {
  this.declarationService.getAnimauxByDeclaration(this.declarationData.id)
    .subscribe({
      next: (data) => {
        this.animaux = data.map(animal => {
          const modeAcquisition = this.modesAcquisition.find(m => m.id === animal.mode_acquisition_id);
          const localite = this.localiteanimalex.find(l => l.id === animal.localite_id);
          
          let anneeAcquisition = null;
          if (animal.annee_acquisition) {
            const year = typeof animal.annee_acquisition === 'number' 
              ? animal.annee_acquisition 
              : parseInt(animal.annee_acquisition);
            if (!isNaN(year)) {
              anneeAcquisition = new Date(year, 0, 1);
            }
          }
          
          return {
            id: animal.id,
            especes: animal.especes || '',
            nombreTetes: animal.nombreTetes || 0,
            modeAcquisition: modeAcquisition,
            localite: localite,
            anneeAcquisition: anneeAcquisition,
            valeurAcquisition: animal.valeurAcquisition || 0,
            nomFichier: animal.nomFichier,
            cheminFichier: animal.cheminFichier,
            documents: animal.documents || [],
            isEdit: false
          };
        });
      },
      error: (err) => {
        console.error('Erreur lors du chargement des animaux', err);
      }
    });
}

// Variables à ajouter/modifier
selectedFiles: File[] = [];


// Modifiez la méthode closeUploadDialog
closeUploadDialog() {
  this.displayUploadDialog = false;
  this.selectedAnimal = null;
  this.selectedFiles = [];
  this.uploadProgress = 0;
}

// Méthode pour gérer la sélection de fichier depuis l'élément fileInput
onFileSelected(event: any) {
  if (event.target.files.length > 0) {
    this.selectedFile = event.target.files[0];
  }
}


// 1. First, let's ensure consistent property naming in the newAnimal object
initNewAnimal(): void {
  this.newAnimal = {
    especes: '',             // Ensure it's consistently "especes" not "espece"
    nombreTetes: null,
    modeAcquisition: null,
    anneeAcquisition: null,
    valeurAcquisition: null,
    localite: null,
    fichierAttache: null,
    uploadedFiles: [],
    isEdit: false
  };
  this.isAddingTableRowAnimal = true;
}

// 2. Fix the validateAnimal method to properly check object properties
validateAnimal(animal: any): boolean {
  console.log('Validation animal:', animal);
  
  // Check if modeAcquisition and localite have id properties
  const modeAcquisitionValid = animal.modeAcquisition && animal.modeAcquisition.id;
  const localiteValid = animal.localite && animal.localite.id;
  
  const isValid = 
    !!animal.especes && 
    !!animal.nombreTetes && 
    !!animal.valeurAcquisition && 
    localiteValid &&
    modeAcquisitionValid;
  
  console.log('Est valide:', isValid);
  
  if (!isValid) {
    console.log('Champs manquants:',
      !animal.especes ? 'especes ' : '',
      !animal.nombreTetes ? 'nombreTetes ' : '',
      !animal.valeurAcquisition ? 'valeurAcquisition ' : '',
      !localiteValid ? 'localite ' : '',
      !modeAcquisitionValid ? 'modeAcquisition ' : ''
    );
  }
  
  return isValid;
}

// 3. Fix the prepareAnimalPayload method
prepareAnimalPayload(animal: any) {
  // S'assurer que l'année d'acquisition est correctement formatée
  let anneeAcquisition = null;
  if (animal.anneeAcquisition instanceof Date) {
    anneeAcquisition = animal.anneeAcquisition.getFullYear();
  } else if (animal.anneeAcquisition) {
    // Si c'est une chaîne de caractères ou un nombre
    const date = new Date(animal.anneeAcquisition);
    if (!isNaN(date.getTime())) {
      anneeAcquisition = date.getFullYear();
    } else if (typeof animal.anneeAcquisition === 'number') {
      anneeAcquisition = animal.anneeAcquisition;
    }
  }

  // Ensure we're sending the correct format expected by the backend
  const payload = {
    especes: animal.especes,
    nombreTetes: animal.nombreTetes,
    // Only send ID for objects that have an ID property
    modeAcquisition: animal.modeAcquisition?.id ? { id: animal.modeAcquisition.id } : null,
    localite: animal.localite?.id ? { id: animal.localite.id } : null,
    anneeAcquisition: anneeAcquisition,
    valeurAcquisition: animal.valeurAcquisition,
    dateCreation: new Date().toISOString(),
    idDeclaration: { id: this.declarationData.id },
    nomFichier: animal.nomFichier,
    cheminFichier: animal.cheminFichier
  };
  
  console.log('Payload préparé pour le backend:', payload);
  return payload;
}

// 4. Fix the saveAnimal method
saveAnimal() {
  console.log('SaveAnimal - tableRowAnimal:', this.tableRowAnimal);
  console.log('SaveAnimal - isEditMode:', this.isEditMode);
  
  // Make a deep copy to isolate the object we're validating
  const animalToValidate = JSON.parse(JSON.stringify(this.tableRowAnimal));
  
  if (this.validateAnimal(animalToValidate)) {
    const payload = this.prepareAnimalPayload(this.tableRowAnimal);
    
    // Si isEditMode est true, on fait un update, sinon on fait un create
    if (this.isEditMode && this.tableRowAnimal.id) {
      console.log('Mode édition - mise à jour animal ID:', this.tableRowAnimal.id);
      this.declarationService.updateAnimal(this.tableRowAnimal.id, payload).subscribe({
        next: (response) => {
          console.log('Réponse update:', response);
          // Trouver et mettre à jour l'animal dans le tableau
          const index = this.animaux.findIndex(a => a.id === this.tableRowAnimal.id);
          if (index !== -1) {
            // Mettre à jour avec les objets complets, pas juste les IDs
            this.animaux[index] = {
              ...response,
              id: response.id, // Ensure ID is set
              especes: response.especes,
              nombreTetes: response.nombreTetes,
              modeAcquisition: this.modesAcquisition.find(m => m.id === (response.modeAcquisition?.id || 0)),
              localite: this.localiteanimalex.find(l => l.id === (response.localite?.id || 0)),
              anneeAcquisition: response.anneeAcquisition ? new Date(response.anneeAcquisition, 0, 1) : null,
              nomFichier: response.nomFichier,
              cheminFichier: response.cheminFichier,
              isEdit: false
            };
          }
          this.resetAnimalForm();
        },
        error: (err) => {
          console.error('Erreur mise à jour animal', err);
          alert('Erreur lors de la mise à jour de l\'animal');
        }
      });
    } else {
      console.log('Mode création - nouvel animal');
      this.declarationService.createAnimal(payload).subscribe({
        next: (response) => {
          console.log('Réponse création:', response);
          // Ajouter le nouvel animal avec les bonnes références aux objets
          this.animaux.push({
            ...response,
            id: response.id,
            especes: response.especes,
            nombreTetes: response.nombreTetes,
            // S'assurer d'avoir les objets complets, pas juste les IDs
            modeAcquisition: this.modesAcquisition.find(m => m.id === (response.modeAcquisition?.id || 0)),
            localite: this.localiteanimalex.find(l => l.id === (response.localite?.id || 0)),
            anneeAcquisition: response.anneeAcquisition ? new Date(response.anneeAcquisition, 0, 1) : null,
            nomFichier: response.nomFichier,
            cheminFichier: response.cheminFichier,
            isEdit: false
          });
          this.resetAnimalForm();
        },
        error: (err) => {
          console.error('Erreur création animal', err);
          alert('Erreur lors de l\'ajout de l\'animal: ' + (err.message || 'Erreur inconnue'));
        }
      });
    }
  } else {
    alert('Veuillez remplir tous les champs obligatoires');
  }
}

// 5. Fix addTableRowAnimalToTable to add more debugging
addTableRowAnimalToTable() {
  console.log('Adding new animal, table row data:', this.tableRowAnimal);
  
  // Additional validation checks
  if (!this.tableRowAnimal.especes) {
    console.warn('Missing especes field');
  }
  if (!this.tableRowAnimal.nombreTetes) {
    console.warn('Missing nombreTetes field');
  }
  if (!this.tableRowAnimal.valeurAcquisition) {
    console.warn('Missing valeurAcquisition field');
  }
  if (!this.tableRowAnimal.localite || !this.tableRowAnimal.localite.id) {
    console.warn('Missing localite field or its id');
  }
  if (!this.tableRowAnimal.modeAcquisition || !this.tableRowAnimal.modeAcquisition.id) {
    console.warn('Missing modeAcquisition field or its id');
  }
  
  this.isEditMode = false;
  this.saveAnimal();
}

// 6. Improve the editAnimal method
editAnimal(animal: any) {
  console.log('Édition animal:', animal);
  
  // Make a deep clone to avoid reference issues
  this.tableRowAnimal = JSON.parse(JSON.stringify(animal));
  
  // Ensure all required properties exist
  if (!this.tableRowAnimal.especes) this.tableRowAnimal.especes = '';
  if (!this.tableRowAnimal.nombreTetes) this.tableRowAnimal.nombreTetes = null;
  if (!this.tableRowAnimal.valeurAcquisition) this.tableRowAnimal.valeurAcquisition = null;
  
  // Ensure object references are correct
  if (this.tableRowAnimal.modeAcquisition?.id) {
    this.tableRowAnimal.modeAcquisition = this.modesAcquisition.find(
      m => m.id === this.tableRowAnimal.modeAcquisition.id
    ) || null;
  }
  
  if (this.tableRowAnimal.localite?.id) {
    this.tableRowAnimal.localite = this.localiteanimalex.find(
      l => l.id === this.tableRowAnimal.localite.id
    ) || null;
  }
  
  console.log('TableRowAnimal after initialization:', this.tableRowAnimal);
  this.isEditMode = true;
  this.isAddingTableRowAnimal = true;
}


// Réinitialiser le formulaire d'animal
resetAnimalForm() {
  this.isAddingTableRowAnimal = false;
  this.isEditMode = false;
  this.tableRowAnimal = {};
}

cancelTableRowAnimal() {
  this.resetAnimalForm();
}



// Méthode pour sauvegarder un animal en cours d'édition
saveEditedAnimal(animal: any) {
  console.log('Sauvegarde animal édité:', animal);
  if (this.validateAnimal(animal)) {
    const payload = this.prepareAnimalPayload(animal);

    this.declarationService.updateAnimal(animal.id, payload).subscribe({
      next: (response) => {
        console.log('Réponse update dans saveEditedAnimal:', response);
        // Mettre à jour l'animal dans le tableau avec les bonnes références
        const index = this.animaux.findIndex(a => a.id === animal.id);
        if (index !== -1) {
          this.animaux[index] = {
            ...response,
            especes: response.especes,
            modeAcquisition: this.modesAcquisition.find(m => m.id === response.modeAcquisition?.id),
            localite: this.localiteanimalex.find(l => l.id === response.localite?.id),
            anneeAcquisition: response.anneeAcquisition ? new Date(response.anneeAcquisition, 0, 1) : null,
            nomFichier: response.nomFichier,
            cheminFichier: response.cheminFichier,
            isEdit: false
          };
        }
      },
      error: (err) => {
        console.error('Erreur mise à jour animal', err);
        alert('Erreur lors de la mise à jour de l\'animal');
      }
    });
  } else {
    alert('Veuillez remplir les champs obligatoires');
  }
}

// Annuler l'édition d'un animal
cancelEditAnimal(animal: any) {
  if (animal._backup) {
    Object.assign(animal, animal._backup);
    delete animal._backup;
  }
  animal.isEdit = false;
}

// Supprimer les animaux sélectionnés
archiveSelectedAnimal() {
  if (this.selectedAnimals.length) {
    const deleteRequests = this.selectedAnimals.map(animal => {
      return this.declarationService.deleteAnimal(animal.id);
    });

    forkJoin(deleteRequests).subscribe({
      next: () => {
        this.animaux = this.animaux.filter(a => !this.selectedAnimals.includes(a));
        this.selectedAnimals = [];
      },
      error: (err) => {
        console.error('Erreur suppression', err);
        alert('Erreur lors de la suppression des animaux sélectionnés');
      }
    });
  }
}
// Supprimez ces variables si elles existent
// @ViewChild('fileInput') fileInput: ElementRef;
// selectedFile: File = null;



// Modifiez la méthode onUpload
onUpload(event: any) {
  this.isUploading = false;
  this.uploadProgress = 100;
  
  // La réponse du serveur devrait être dans event.originalEvent.body
  const response = event.originalEvent?.body;
  
  if (response) {
    console.log('Document téléchargé avec succès:', response);
    
    // Mettre à jour les informations du fichier dans l'animal sélectionné
    const updatedAnimal = this.animaux.find(a => a.id === this.selectedAnimal.id);
    if (updatedAnimal) {
      updatedAnimal.nomFichier = response.nomFichier;
      updatedAnimal.cheminFichier = response.cheminFichier;
    }
    
    // Fermer la boîte de dialogue
    this.closeUploadDialog();
  }
}

// Modifiez la méthode openFileUpload pour réinitialiser les fichiers
openFileUpload(animal: any) {
  this.selectedAnimal = animal;
  this.uploadedFiles = [];
  this.uploadProgress = 0;
  this.displayUploadDialog = true;
}

// Vous pouvez supprimer ces méthodes car elles ne sont plus nécessaires :
// onFileSelected()
// onFileSelect()
// uploadDocument()
// Variables d'état
isAddingEmprunt = false;
newEmprunt: any = this.resetEmprunt();
editedEmprunt: any = null;
tableRowEmprunt: any = {};
empruntsTemp: any[] = [];
selectedEmprunts: any[] = [];
typesEmprunt: Vocabulaire[] = [];
typesCompte: Vocabulaire[] = [];

// Fonction de réinitialisation
resetEmprunt(): any {
  return {
    institutionFinanciere: '',
    numeroCompte: '',
    typeEmprunt: null,
    montantEmprunt: 0
  };
}

// Chargement des emprunts
loadEmprunts() {
  if (!this.declarationData?.id) {
    console.error('ID de déclaration non disponible pour les emprunts');
    return;
  }

  this.declarationService.getEmpruntsByDeclaration(this.declarationData.id)
    .subscribe({
      next: (data) => {
        this.empruntsTemp = data.map(item => ({
          ...item,
          institutionFinanciere: item.institutionsFinancieres,
           numeroCompte: item.numeroCompte,
          typeEmprunt: item.typeEmprunt,
          montantEmprunt: item.montantEmprunt,
          isEdit: false
        }));
        this.isDataModified = false;
      },
      error: (err) => console.error('Erreur lors du chargement des emprunts', err)
    });
}

// Validation
validateEmprunt(emprunt: any): boolean {
  return emprunt.institutionFinanciere && 
         emprunt.numeroCompte && 
         emprunt.typeEmprunt?.id && 
         emprunt.montantEmprunt > 0;
}

// Préparation pour l'API
prepareEmpruntForApi(emprunt: any) {
  return {
    id: emprunt.id > 0 ? emprunt.id : null,
    institutionsFinancieres: emprunt.institutionFinanciere,
    numeroCompte: emprunt.numeroCompte,
    typeEmprunt: { id: emprunt.typeEmprunt.id || emprunt.typeEmprunt },
    montantEmprunt: emprunt.montantEmprunt,
    dateCreation: emprunt.dateCreation || new Date().toISOString().split('T')[0],
    idDeclaration: { id: this.declarationData.id }
  };
}

// Opérations CRUD

addTableRowEmprunt() {
  if (!this.validateEmprunt(this.tableRowEmprunt)) {
    alert('Veuillez remplir tous les champs obligatoires');
    return;
  }

  const empruntForApi = this.prepareEmpruntForApi(this.tableRowEmprunt);
  
  this.declarationService.createEmprunt(empruntForApi).subscribe({
    next: (response) => {
      this.empruntsTemp.push({ 
        ...this.tableRowEmprunt, 
        id: response.id,
        isNew: false
      });
      this.cancelTableRowEmprunt();
      alert('Emprunt ajouté avec succès!');
    },
    error: (err) => alert('Erreur lors de l\'ajout de l\'emprunt')
  });
}

cancelTableRowEmprunt() {
  this.tableRowEmprunt = {};
}

saveNewEmprunt() {
  if (!this.validateEmprunt(this.newEmprunt)) {
    alert('Veuillez remplir tous les champs obligatoires');
    return;
  }

  const empruntForApi = this.prepareEmpruntForApi(this.newEmprunt);
  
  this.declarationService.createEmprunt(empruntForApi).subscribe({
    next: (response) => {
      this.empruntsTemp.push({
        ...this.newEmprunt,
        id: response.id,
        isNew: false
      });
      this.cancelNewEmprunt();
      alert('Emprunt ajouté avec succès!');
    },
    error: (err) => alert('Erreur lors de l\'ajout de l\'emprunt')
  });
}

cancelNewEmprunt() {
  this.isAddingEmprunt = false;
  this.newEmprunt = this.resetEmprunt();
}

editEmprunt(emprunt: any) {
  emprunt._backup = JSON.parse(JSON.stringify(emprunt));
  emprunt.isEdit = true;
}

saveEditedEmprunt(emprunt: any) {
  if (!this.validateEmprunt(emprunt)) {
    alert('Veuillez remplir tous les champs obligatoires');
    return;
  }

  const empruntForApi = this.prepareEmpruntForApi(emprunt);
  
  this.declarationService.updateEmprunt(emprunt.id, empruntForApi)
    .subscribe({
      next: () => {
        emprunt.isEdit = false;
        delete emprunt._backup;
        alert('Emprunt mis à jour avec succès!');
      },
      error: (err) => {
        let errorMessage = 'Erreur lors de la mise à jour de l\'emprunt';
        if (err.error?.message) errorMessage += ': ' + err.error.message;
        else if (err.message) errorMessage += ': ' + err.message;
        
        alert(errorMessage);
        this.cancelEditEmprunt(emprunt);
      }
    });
}

cancelEditEmprunt(emprunt: any) {
  if (emprunt._backup) {
    Object.assign(emprunt, emprunt._backup);
    delete emprunt._backup;
  }
  emprunt.isEdit = false;
}

deleteSelectedEmprunts() {
  if (!this.selectedEmprunts?.length) return;
  
  const deletePromises = this.selectedEmprunts
    .filter(emprunt => emprunt.id > 0)
    .map(emprunt => this.declarationService.deleteEmprunt(emprunt.id).toPromise());
  
  this.empruntsTemp = this.empruntsTemp.filter(
    e => !this.selectedEmprunts.includes(e)
  );
  
  Promise.all(deletePromises)
    .then(() => {
      alert('Suppression effectuée avec succès');
      this.selectedEmprunts = [];
    })
    .catch(() => {
      alert('Erreur lors de la suppression des éléments');
      this.loadEmprunts();
    });
}

saveEmpruntsDeclaration() {
  if (this.empruntsTemp.length === 0 && !this.isDataModified) {
    alert('Aucune modification à enregistrer !');
    return;
  }

  const newEmprunts = this.empruntsTemp.filter(e => e.isNew);
  const modifiedEmprunts = this.empruntsTemp.filter(e => e.isModified && !e.isNew);
  const deletedEmprunts = this.selectedEmprunts.filter(e => e.isDeleted && e.id > 0);
  
  const requests = [
    ...newEmprunts.map(e => this.declarationService.createEmprunt(this.prepareEmpruntForApi(e))),
    ...modifiedEmprunts.map(e => this.declarationService.updateEmprunt(e.id, this.prepareEmpruntForApi(e))),
    ...deletedEmprunts.map(e => this.declarationService.deleteEmprunt(e.id))
  ];
  
  if (requests.length > 0) {
    forkJoin(requests).subscribe({
      next: (responses) => {
        alert(`${responses.length} opérations effectuées avec succès !`);
        this.loadEmprunts();
      },
      error: () => alert('Certaines opérations n\'ont pas pu être effectuées !')
    });
  } else {
    alert('Aucune modification à enregistrer !');
  }
}

especeTemp: any[] = []; // Liste locale temporaire des espèces
selectedEspeces: any[] = []; // Éléments sélectionnés
tableRowEspece: any = {}; // Espèce en cours d'ajout

// Chargement des espèces depuis l'API
getEspeces() {
  if (!this.declarationData || !this.declarationData.id) {
    console.error('ID de déclaration non disponible');
    return;
  }

  this.declarationService.getEspecesByDeclaration(this.declarationData.id).subscribe({
    next: data => {
      this.especeTemp = data;
      this.isDataModified = false;
    },
    error: err => console.error('Erreur chargement espèces', err)
  });
}

// Calcul du montant FCFA
calculateFCFA(espece: any): number {
  if (espece.monnaie && espece.tauxChange) {
    espece.montantFCFA = espece.monnaie * espece.tauxChange;
    return espece.montantFCFA;
  }
  return 0;
}

// Validation d'une espèce
validateEspece(espece: any): boolean {
  const isMonnaieValid = !isNaN(espece.monnaie);
  const isTauxChangeValid = !isNaN(espece.tauxChange);
  return espece.devise && isMonnaieValid && isTauxChangeValid && espece.dateEspece;
}

// Formatage de la date
formatDate(date: any): string {
  return date instanceof Date ? date.toISOString().split('T')[0] : date;
}

// Ajout d'une nouvelle ligne d'espèce
addTableRowEspeceToTable() {
  this.tableRowEspece.monnaie = Number(this.tableRowEspece.monnaie);
  this.tableRowEspece.tauxChange = Number(this.tableRowEspece.tauxChange);

  if (this.validateEspece(this.tableRowEspece)) {
    this.calculateFCFA(this.tableRowEspece);
    this.especeTemp.push({
      ...this.tableRowEspece,
      id: -Date.now(), // ID temporaire
      isNew: true
    });
    this.isDataModified = true;
    this.cancelTableRowEspece();
  }
}

// Annulation de l'ajout
cancelTableRowEspece() {
  this.isAddingTableRow = false;
  this.tableRowEspece = {};
}

// Début de l'édition
startEditEspece(espece: any) {
  this.especeTemp.forEach(item => item.editing = false);
  espece.editing = true;
  espece._backup = { ...espece };
}

// Sauvegarde en mémoire (édition)
saveUpdatedEspece(espece: any) {
  if (this.validateEspece(espece)) {
    this.calculateFCFA(espece);
    espece.editing = false;
    espece.isModified = !espece.isNew;
    delete espece._backup;
    this.isDataModified = true;
  }
}

// Annulation de l'édition
cancelEditEspece(espece: any) {
  if (espece._backup) {
    Object.assign(espece, espece._backup);
    delete espece._backup;
  }
  espece.editing = false;
}

// Suppression des espèces sélectionnées
archiveSelectedEspeces() {
  if (this.selectedEspeces.length > 0) {
    this.selectedEspeces.forEach(espece => {
      if (espece.id > 0) {
        espece.isDeleted = true;
        this.isDataModified = true;
      } else {
        const index = this.especeTemp.findIndex(e => e === espece);
        if (index !== -1) this.especeTemp.splice(index, 1);
      }
    });

    this.especeTemp = this.especeTemp.filter(e => !e.isDeleted);
    this.selectedEspeces = [];
  }
}

// Préparer les données au format API
prepareEspeceForApi(espece: any): any {
  return {
    devise: espece.devise,
    monnaie: espece.monnaie,
    tauxChange: espece.tauxChange,
    montantFCFA: espece.montantFCFA,
    dateEspece: this.formatDate(espece.dateEspece),
    dateCreation: this.formatDate(new Date()),
    idDeclaration: { id: this.declarationData.id }
  };
}

// Sauvegarde des espèces en base
saveEspecesDeclaration() {
  if (this.especeTemp.length === 0 && !this.isDataModified) {
    alert('Aucune modification à enregistrer !');
    return;
  }

  const newEspeces = this.especeTemp.filter(e => e.isNew);
  const modifiedEspeces = this.especeTemp.filter(e => e.isModified && !e.isNew);
  const deletedEspeces = this.selectedEspeces.filter(e => e.isDeleted && e.id > 0);

  const createRequests = newEspeces.map(e => this.declarationService.createEspece(this.prepareEspeceForApi(e)));
  const updateRequests = modifiedEspeces.map(e => this.declarationService.updateEspece(e.id, this.prepareEspeceForApi(e)));
  const deleteRequests = deletedEspeces.map(e => this.declarationService.deleteEspece(e.id));

  forkJoin([...createRequests, ...updateRequests, ...deleteRequests]).subscribe({
    next: () => {
      this.getEspeces();
      this.especeTemp = [];
      this.selectedEspeces = [];
      this.isDataModified = false;
      alert('Les espèces ont été enregistrées avec succès !');
    },
    error: err => {
      console.error('Erreur enregistrement', err);
      alert('Certaines espèces n\'ont pas pu être enregistrées !');
    }
  });
}

titresTemp: any[] = [];
selectedTitres: any[] = [];
tableRowTitre: any = this.resetTitre();
editedTitre: any = null;
naturesTitres: Vocabulaire[] = [];
emplacementsTitres: Vocabulaire[] = [];
precisionsTitres: Vocabulaire[] = [];

// Fonction de réinitialisation
resetTitre(): any {
  return {
    designationNatureAction: null,
    valeurEmplacement: 0,
    emplacement: null,
    autrePrecision: null
  };
}
loadTitresForDeclaration() {
  if (!this.declarationData?.id) {
    console.error('ID de déclaration non disponible pour les titres');
    return;
  }

  this.loading = true;
  this.declarationService.getTitresByDeclaration(this.declarationData.id).subscribe({
    next: (data) => {
      this.titresTemp = data.map(item => ({
        id: item.id,
        designationNatureAction: item.designationNatureActions, // Mappage de la nature
        valeurEmplacement: item.valeurEmplacement,
        emplacement: item.emplacement,
        autrePrecision: item.autrePrecisions, // Mappage des précisions
        dateAcquisition: item.dateAcquisition, // Autres champs si nécessaire
        provenance: item.provenance,
        isEdit: false
      }));
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
// Validation
validateTitre(titre: any): boolean {
  const isValid = titre.designationNatureAction && titre.valeurEmplacement && titre.emplacement;
  
  if (!isValid) {
    if (!titre.designationNatureAction) {
      this.error = 'Veuillez sélectionner la nature du titre';
    } else if (!titre.valeurEmplacement) {
      this.error = 'Veuillez renseigner la valeur de l\'emplacement';
    } else if (!titre.emplacement) {
      this.error = 'Veuillez sélectionner l\'emplacement';
    }
  } else {
    this.error = '';
  }
  
  return isValid;
}

// Préparation pour l'API
prepareTitreForApi(titre: any) {
  return {
    id: titre.id > 0 ? titre.id : null,
    designationNatureActions: { id: titre.designationNatureAction.id },
    valeurEmplacement: titre.valeurEmplacement,
    emplacement: { id: titre.emplacement.id },
    autrePrecisions: titre.autrePrecision ? { id: titre.autrePrecision.id } : null,
    dateCreation: titre.dateCreation || new Date().toISOString().split('T')[0],
    idDeclaration: { id: this.declarationData.id }
  };
}

// Opérations CRUD
addTitreToTable() {
  if (!this.validateTitre(this.tableRowTitre)) {
    return;
  }

  const titreForApi = this.prepareTitreForApi(this.tableRowTitre);
  
  this.loading = true;
  this.declarationService.createTitres(titreForApi).subscribe({
    next: (response) => {
      this.titresTemp.push({ 
        ...this.tableRowTitre, 
        id: response.id,
        isNew: false
      });
      this.cancelTableRowTitre();
      this.loading = false;
      alert('Titre ajouté avec succès!');
    },
    error: (err) => {
      alert('Erreur lors de l\'ajout du titre');
      this.loading = false;
    }
  });
}

cancelTableRowTitre() {
  this.isAddingTableRow = false;
  this.tableRowTitre = this.resetTitre();
}

editTitre(titre: any) {
  titre._backup = JSON.parse(JSON.stringify(titre));
  titre.isEdit = true;
}

saveEditedTitre(titre: any) {
  if (!this.validateTitre(titre)) {
    return;
  }

  const titreForApi = this.prepareTitreForApi(titre);
  
  this.loading = true;
  this.declarationService.updateTitres(titre.id, titreForApi).subscribe({
    next: () => {
      titre.isEdit = false;
      delete titre._backup;
      this.loading = false;
      alert('Titre mis à jour avec succès!');
    },
    error: (err) => {
      let errorMessage = 'Erreur lors de la mise à jour du titre';
      if (err.error?.message) errorMessage += ': ' + err.error.message;
      else if (err.message) errorMessage += ': ' + err.message;
      
      alert(errorMessage);
      this.cancelEditTitre(titre);
      this.loading = false;
    }
  });
}

cancelEditTitre(titre: any) {
  if (titre._backup) {
    Object.assign(titre, titre._backup);
    delete titre._backup;
  }
  titre.isEdit = false;
}

deleteSelectedTitres() {
  if (!this.selectedTitres?.length) return;
  
  if (confirm('Êtes-vous sûr de vouloir supprimer les titres sélectionnés?')) {
    const deletePromises = this.selectedTitres
      .filter(titre => titre.id > 0)
      .map(titre => this.declarationService.deleteTitres(titre.id).toPromise());
    
    this.titresTemp = this.titresTemp.filter(
      t => !this.selectedTitres.includes(t)
    );
    
    this.loading = true;
    Promise.all(deletePromises)
      .then(() => {
        alert('Suppression effectuée avec succès');
        this.selectedTitres = [];
        this.loading = false;
      })
      .catch(() => {
        alert('Erreur lors de la suppression des éléments');
        this.loadTitresForDeclaration();
        this.loading = false;
      });
  }
}

saveTitresDeclaration() {
  if (this.titresTemp.length === 0 && !this.isDataModified) {
    alert('Aucune modification à enregistrer !');
    return;
  }

  const newTitres = this.titresTemp.filter(t => t.isNew);
  const modifiedTitres = this.titresTemp.filter(t => t._modified && !t.isNew);
  
  const requests = [
    ...newTitres.map(t => this.declarationService.createTitres(this.prepareTitreForApi(t))),
    ...modifiedTitres.map(t => this.declarationService.updateTitres(t.id, this.prepareTitreForApi(t)))
  ];
  
  if (requests.length > 0) {
    this.loading = true;
    forkJoin(requests).subscribe({
      next: (responses) => {
        alert(`${responses.length} opérations effectuées avec succès !`);
        this.loadTitresForDeclaration();
        this.loading = false;
      },
      error: () => {
        alert('Certaines opérations n\'ont pas pu être effectuées !');
        this.loading = false;
      }
    });
  } else {
    alert('Aucune modification à enregistrer !');
  }
}


creances: any[] = [];
creancesTemp: any[] = [];
selectedCreances: any[] = [];
newCreance: any = {};
tableRowCreance: any = {};
debiteursCreances: Vocabulaire[] = [];
autresPrecisionsCreances: Vocabulaire[] = [];

  // Fonction de réinitialisation
  resetCreance(): any {
    return {
      debiteur: null,
      montant: null,
      autresPrecision: null
    };
  }

  // Chargement des créances
  loadCreancesByDeclaration() {
    if (!this.declarationData?.id) {
      console.error('ID de déclaration non disponible pour les créances');
      return;
    }

    this.loading = true;
    this.declarationService.getCreancesByDeclaration(this.declarationData.id).subscribe({
      next: (data) => {
        this.creancesTemp = data.map(item => ({
          ...item,
          debiteur: item.debiteurs,
          autresPrecision: item.autresPrecisions,
          isEdit: false
        }));
        this.isDataModified = false;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des créances', err);
        this.error = 'Impossible de charger les créances existantes';
        this.loading = false;
      }
    });
  }

  // Validation
  validateCreance(creance: any): boolean {
    const isValid = creance.debiteur && creance.montant;
    
    if (!isValid) {
      if (!creance.debiteur) {
        this.error = 'Veuillez sélectionner le débiteur';
      } else if (!creance.montant) {
        this.error = 'Veuillez renseigner le montant';
      }
    } else {
      this.error = '';
    }
    
    return isValid;
  }

  // Préparation pour l'API
  prepareCreanceForApi(creance: any) {
    return {
      id: creance.id > 0 ? creance.id : null,
      debiteurs: { id: creance.debiteur.id },
      montant: creance.montant,
      autresPrecisions: creance.autresPrecision ? { id: creance.autresPrecision.id } : null,
      dateCreation: creance.dateCreation || new Date().toISOString().split('T')[0],
      idDeclaration: { id: this.declarationData.id }
    };
  }

  // Opérations CRUD
  addTableRowCreanceToTable() {
    if (!this.validateCreance(this.tableRowCreance)) {
      return;
    }

    const creanceForApi = this.prepareCreanceForApi(this.tableRowCreance);
    
    this.loading = true;
    this.declarationService.createCreance(creanceForApi).subscribe({
      next: (response) => {
        this.creancesTemp.push({ 
          ...this.tableRowCreance, 
          id: response.id,
          isNew: false
        });
        this.cancelTableRowCreance();
        this.loading = false;
        alert('Créance ajoutée avec succès!');
      },
      error: (err) => {
        alert('Erreur lors de l\'ajout de la créance');
        this.loading = false;
      }
    });
  }

  cancelTableRowCreance() {
    this.isAddingTableRow = false;
    this.tableRowCreance = this.resetCreance();
  }

  startEditCreance(creance: any) {
    creance._backup = JSON.parse(JSON.stringify(creance));
    creance.isEdit = true;
  }

  saveUpdatedCreance(creance: any) {
    if (!this.validateCreance(creance)) {
      return;
    }

    const creanceForApi = this.prepareCreanceForApi(creance);
    
    this.loading = true;
    this.declarationService.updateCreance(creance.id, creanceForApi).subscribe({
      next: () => {
        creance.isEdit = false;
        delete creance._backup;
        this.loading = false;
        alert('Créance mise à jour avec succès!');
      },
      error: (err) => {
        let errorMessage = 'Erreur lors de la mise à jour de la créance';
        if (err.error?.message) errorMessage += ': ' + err.error.message;
        else if (err.message) errorMessage += ': ' + err.message;
        
        alert(errorMessage);
        this.cancelEditCreance(creance);
        this.loading = false;
      }
    });
  }

  cancelEditCreance(creance: any) {
    if (creance._backup) {
      Object.assign(creance, creance._backup);
      delete creance._backup;
    }
    creance.isEdit = false;
  }

  archiveSelectedCreances() {
    if (!this.selectedCreances?.length) return;
    
    if (confirm('Êtes-vous sûr de vouloir archiver les créances sélectionnées?')) {
      const deletePromises = this.selectedCreances
        .filter(creance => creance.id > 0)
        .map(creance => this.declarationService.deleteCreance(creance.id).toPromise());
      
      this.creancesTemp = this.creancesTemp.filter(
        c => !this.selectedCreances.includes(c)
      );
      
      this.loading = true;
      Promise.all(deletePromises)
        .then(() => {
          alert('Archivage effectué avec succès');
          this.selectedCreances = [];
          this.loading = false;
        })
        .catch(() => {
          alert('Erreur lors de l\'archivage des éléments');
          this.loadCreancesByDeclaration();
          this.loading = false;
        });
    }
  }

  saveCreancesDeclaration() {
    if (this.creancesTemp.length === 0 && !this.isDataModified) {
      alert('Aucune modification à enregistrer !');
      return;
    }

    const newCreances = this.creancesTemp.filter(c => c.isNew);
    const modifiedCreances = this.creancesTemp.filter(c => c._modified && !c.isNew);
    
    const requests = [
      ...newCreances.map(c => this.declarationService.createCreance(this.prepareCreanceForApi(c))),
      ...modifiedCreances.map(c => this.declarationService.updateCreance(c.id, this.prepareCreanceForApi(c)))
    ];
    
    if (requests.length > 0) {
      this.loading = true;
      forkJoin(requests).subscribe({
        next: (responses) => {
          alert(`${responses.length} opérations effectuées avec succès !`);
          this.loadCreancesByDeclaration();
          this.loading = false;
        },
        error: () => {
          alert('Certaines opérations n\'ont pas pu être effectuées !');
          this.loading = false;
        }
      });
    } else {
      alert('Aucune modification à enregistrer !');
    }
  }



  revenus: any[] = [];
  selectedRevenus: any[] = [];
  newRevenu: any = {};
  tableRowRevenu: any = {};
  autresRevenus: Vocabulaire[] = [];
  entites: Vocabulaire[] = [];


  loadRevenusByDeclaration() {
    if (!this.declarationData || !this.declarationData.id) {
      console.error('ID de déclaration non disponible');
      return;
    }
    
    this.declarationService.getRevenusByDeclaration(this.declarationData.id)
      .subscribe({
        next: (data) => {
          console.log('Revenus chargés:', data);
          this.revenus = data.map(item => ({
            ...item,
            // Ajouter tout mapping spécifique ici si nécessaire
            editing: false
          }));
        },
        error: (err) => {
          console.error('Erreur lors du chargement des revenus', err);
        }
      });
  }


  validateRevenu(revenu: any): boolean {
    return !!revenu.autresRevenus && !!revenu.salaireMensuelNet;
  }

  addRevenuToTable() {
    if (this.validateRevenu(this.newRevenu)) {
      // Génération d'un ID temporaire négatif pour identifier les nouveaux éléments
      this.revenus.push({
        ...this.newRevenu,
        id: -Date.now(), // ID négatif pour les éléments non sauvegardés
        isNew: true // Marqueur pour les nouveaux éléments
      });
      this.isDataModified = true;
      
      // Réinitialiser le formulaire
      this.newRevenu = {};
      
      // Sauvegarder immédiatement après l'ajout
      this.saveRevenusDeclaration();
    }
  }

  cancelNewRevenu() {
    this.newRevenu = {};
  }

  addTableRowRevenuToTable() {
    if (this.validateRevenu(this.tableRowRevenu)) {
      this.revenus.push({
        ...this.tableRowRevenu,
        id: Date.now() // Ajout d'un ID temporaire
      });
      this.cancelTableRowRevenu();
    }
  }

  cancelTableRowRevenu() {
    this.isAddingTableRow = false;
    this.tableRowRevenu = {};
  }

  startEditRevenu(revenu: any) {
    this.revenus.forEach(item => {
      if (item !== revenu) {
        item.editing = false;
      }
    });
    revenu.editing = true;
    revenu._backup = { ...revenu };
  }

  saveUpdatedRevenu(revenu: any) {
    if (this.validateRevenu(revenu)) {
      revenu.editing = false;
      delete revenu._backup;
      
      const index = this.revenus.findIndex(r => r.id === revenu.id);
      if (index > -1) {
        this.revenus[index] = { ...revenu };
      }
    }
  }

  cancelEditRevenu(revenu: any) {
    if (revenu._backup) {
      Object.assign(revenu, revenu._backup);
      delete revenu._backup;
    }
    revenu.editing = false;
  }

  deleteSelectedRevenus() {
    if (this.selectedRevenus && this.selectedRevenus.length > 0) {
      this.revenus = this.revenus.filter(r =>
        !this.selectedRevenus.includes(r)
      );
      this.selectedRevenus = [];
    }
  }

  saveRevenusDeclaration() {
    if (this.revenus.length === 0) {
      alert('Aucun revenu à enregistrer !');
      return;
    }

    const saveRequests = this.revenus.map(revenu => {
      const revenuApiFormat = {
        salaireMensuelNet: revenu.salaireMensuelNet,
        autresRevenus: { id: revenu.autresRevenus.id },
        dateCreation: revenu.dateCreation || new Date().toISOString().split('T')[0],
        idDeclaration: { id: this.declarationData.id }
      };
      
      return this.declarationService.createRevenu(revenuApiFormat);
    });
  
    forkJoin(saveRequests).subscribe({
      next: (responses) => {
        this.revenus = [];
        this.newRevenu = {};
        this.tableRowRevenu = {};
        this.selectedRevenus = [];
        
        alert(`${responses.length} revenus enregistrés avec succès !`);
        // Recharger les revenus après l'enregistrement
        this.loadRevenusByDeclaration();
      },
      error: (err) => {
        console.error('Erreur enregistrement', err);
        alert('Certains revenus n\'ont pas pu être enregistrés !');
      }
    });
  }

  // Fonction pour mettre à jour un revenu existant
  updateExistingRevenu(revenu: any) {
    if (this.validateRevenu(revenu)) {
      const revenuApiFormat = {
        salaireMensuelNet: revenu.salaireMensuelNet,
        autresRevenus: { id: revenu.autresRevenus.id },
        idDeclaration: { id: this.declarationData.id }
      };

      this.declarationService.updateRevenu(revenu.id, revenuApiFormat).subscribe({
        next: (response) => {
          const index = this.revenus.findIndex(r => r.id === revenu.id);
          if (index > -1) {
            this.revenus[index] = response;
          }
          alert('Revenu mis à jour avec succès !');
        },
        error: (err) => {
          console.error('Erreur mise à jour', err);
          alert('Le revenu n\'a pas pu être mis à jour !');
        }
      });
    }
  }

  // Fonction pour supprimer un revenu
  deleteExistingRevenu(revenuId: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce revenu ?')) {
      this.declarationService.deleteRevenu(revenuId).subscribe({
        next: () => {
          this.revenus = this.revenus.filter(r => r.id !== revenuId);
          alert('Revenu supprimé avec succès !');
        },
        error: (err) => {
          console.error('Erreur suppression', err);
          alert('Le revenu n\'a pas pu être supprimé !');
        }
      });
    }
  }

  vehiculesTemp: any[] = [];
  vehicules: any[] = []; // Pour stocker les véhicules chargés depuis la base de données
  selectedVehicules: any[] = [];
  newVehicule: any = {};
  tableRowVehicule: any = {};
  designationsVehicule: Vocabulaire[] = [];
  marquesVehicule: Vocabulaire[] = [];
  etatsVehicule: Vocabulaire[] = [];
    // Fonction de réinitialisation
    resetVehicule(): any {
      return {
        designation: null,
        marque: null,
        immatriculation: null,
        anneeAcquisition: null,
        valeurAcquisition: null,
        etatGeneral: null
      };
    }
  
    // Chargement des véhicules
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
            anneeAcquisition: item.anneeAcquisition ? new Date(item.anneeAcquisition, 0) : null,
            isEdit: false
          }));
          this.isDataModified = false;
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des véhicules', err);
          this.error = 'Impossible de charger les véhicules existants';
          this.loading = false;
        }
      });
    }
  
    // Validation
    validateVehicule(vehicule: any): boolean {
      const isValid = vehicule.designation && vehicule.marque && vehicule.immatriculation && 
                     vehicule.anneeAcquisition && vehicule.valeurAcquisition && vehicule.etatGeneral;
      
      if (!isValid) {
        if (!vehicule.designation) {
          this.error = 'Veuillez sélectionner la désignation';
        } else if (!vehicule.marque) {
          this.error = 'Veuillez sélectionner la marque';
        } else if (!vehicule.immatriculation) {
          this.error = 'Veuillez renseigner l\'immatriculation';
        } else if (!vehicule.anneeAcquisition) {
          this.error = 'Veuillez sélectionner l\'année d\'acquisition';
        } else if (!vehicule.valeurAcquisition) {
          this.error = 'Veuillez renseigner la valeur d\'acquisition';
        } else if (!vehicule.etatGeneral) {
          this.error = 'Veuillez sélectionner l\'état général';
        }
      } else {
        this.error = '';
      }
      
      return isValid;
    }
  
    // Préparation pour l'API
    prepareVehiculeForApi(vehicule: any) {
      const anneeAcquisition = vehicule.anneeAcquisition instanceof Date 
                             ? vehicule.anneeAcquisition.getFullYear()
                             : parseInt(vehicule.anneeAcquisition);
  
      return {
        id: vehicule.id > 0 ? vehicule.id : null,
        designation: { id: vehicule.designation.id },
        marque: { id: vehicule.marque.id },
        immatriculation: vehicule.immatriculation,
        anneeAcquisition: anneeAcquisition,
        valeurAcquisition: vehicule.valeurAcquisition,
        etatGeneral: { id: vehicule.etatGeneral.id },
        dateCreation: vehicule.dateCreation || new Date().toISOString().split('T')[0],
        idDeclaration: { id: this.declarationData.id }
      };
    }
  
    // Opérations CRUD
    addTableRowVehiculeToTable() {
      if (!this.validateVehicule(this.tableRowVehicule)) {
        return;
      }
  
      const vehiculeForApi = this.prepareVehiculeForApi(this.tableRowVehicule);
      
      this.loading = true;
      this.declarationService.createVehicule(vehiculeForApi).subscribe({
        next: (response) => {
          this.vehiculesTemp.push({ 
            ...this.tableRowVehicule, 
            id: response.id,
            isNew: false
          });
          this.cancelTableRowVehicule();
          this.loading = false;
          alert('Véhicule ajouté avec succès!');
        },
        error: (err) => {
          alert('Erreur lors de l\'ajout du véhicule');
          this.loading = false;
        }
      });
    }
  
    cancelTableRowVehicule() {
      this.isAddingTableRow = false;
      this.tableRowVehicule = this.resetVehicule();
    }
  
    startEditVehicule(vehicule: any) {
      vehicule._backup = JSON.parse(JSON.stringify(vehicule));
      vehicule.isEdit = true;
    }
  
    saveUpdatedVehicule(vehicule: any) {
      if (!this.validateVehicule(vehicule)) {
        return;
      }
  
      const vehiculeForApi = this.prepareVehiculeForApi(vehicule);
      
      this.loading = true;
      this.declarationService.updateVehicule(vehicule.id, vehiculeForApi).subscribe({
        next: () => {
          vehicule.isEdit = false;
          delete vehicule._backup;
          this.loading = false;
          alert('Véhicule mis à jour avec succès!');
        },
        error: (err) => {
          let errorMessage = 'Erreur lors de la mise à jour du véhicule';
          if (err.error?.message) errorMessage += ': ' + err.error.message;
          else if (err.message) errorMessage += ': ' + err.message;
          
          alert(errorMessage);
          this.cancelEditVehicule(vehicule);
          this.loading = false;
        }
      });
    }
  
    cancelEditVehicule(vehicule: any) {
      if (vehicule._backup) {
        Object.assign(vehicule, vehicule._backup);
        delete vehicule._backup;
      }
      vehicule.isEdit = false;
    }
  
    archiveSelectedVehicules() {
      if (!this.selectedVehicules?.length) return;
      
      if (confirm('Êtes-vous sûr de vouloir archiver les véhicules sélectionnés?')) {
        const deletePromises = this.selectedVehicules
          .filter(vehicule => vehicule.id > 0)
          .map(vehicule => this.declarationService.deleteVehicule(vehicule.id).toPromise());
        
        this.vehiculesTemp = this.vehiculesTemp.filter(
          v => !this.selectedVehicules.includes(v)
        );
        
        this.loading = true;
        Promise.all(deletePromises)
          .then(() => {
            alert('Archivage effectué avec succès');
            this.selectedVehicules = [];
            this.loading = false;
          })
          .catch(() => {
            alert('Erreur lors de l\'archivage des éléments');
            this.loadVehiculesByDeclaration();
            this.loading = false;
          });
      }
    }
  
    saveVehiculesDeclaration() {
      if (this.vehiculesTemp.length === 0 && !this.isDataModified) {
        alert('Aucune modification à enregistrer !');
        return;
      }
  
      const newVehicules = this.vehiculesTemp.filter(v => v.isNew);
      const modifiedVehicules = this.vehiculesTemp.filter(v => v._modified && !v.isNew);
      
      const requests = [
        ...newVehicules.map(v => this.declarationService.createVehicule(this.prepareVehiculeForApi(v))),
        ...modifiedVehicules.map(v => this.declarationService.updateVehicule(v.id, this.prepareVehiculeForApi(v)))
      ];
      
      if (requests.length > 0) {
        this.loading = true;
        forkJoin(requests).subscribe({
          next: (responses) => {
            alert(`${responses.length} opérations effectuées avec succès !`);
            this.loadVehiculesByDeclaration();
            this.loading = false;
          },
          error: () => {
            alert('Certaines opérations n\'ont pas pu être effectuées !');
            this.loading = false;
          }
        });
      } else {
        alert('Aucune modification à enregistrer !');
      }
    }
  
   // Propriétés de classe
   autresBiensTemp: any[] = [];
autresBiensFromDB: any[] = []; 
selectedAutresBiens: any[] = [];
newAutreBien: any = {};
tableRowAutreBien: any = {};



      // Fonction de réinitialisation
      resetAutreBien(): any {
        return {
          type: null,
          designation: null,
          localite: null,
          anneeAcquis: null,
          valeurAcquisition: null,
          autresPrecision: null
        };
      }
    
      loadAutresBiensByDeclaration() {
        if (!this.declarationData?.id) {
          console.error('ID de déclaration non disponible pour les autres biens');
          return;
        }
      
        this.loading = true;
        this.declarationService.getAutresBiensDeValeurByDeclaration(this.declarationData.id).subscribe({
          next: (data) => {
            this.autresBiensTemp = data.map(item => ({
              ...item,
              anneeAcquis: item.anneeAcquis ? new Date(item.anneeAcquis, 0) : null,
              // Vérifiez que autrePrecisions est correctement mappé à autresPrecision
              autresPrecision: item.autrePrecisions || item.autre_precisions || null,
              isEdit: false
            }));
            this.isDataModified = false;
            this.loading = false;
          },
          error: (err) => {
            console.error('Erreur lors du chargement des autres biens', err);
            this.error = 'Impossible de charger les autres biens existants';
            this.loading = false;
          }
        });
      }
      // Validation
      validateAutreBien(bien: any): boolean {
        const isValid = bien.type && bien.designation && bien.localite && 
                       bien.anneeAcquis && bien.valeurAcquisition;
        
        if (!isValid) {
          if (!bien.type) {
            this.error = 'Veuillez sélectionner le type de bien';
          } else if (!bien.designation) {
            this.error = 'Veuillez sélectionner la désignation';
          } else if (!bien.localite) {
            this.error = 'Veuillez sélectionner la localité';
          } else if (!bien.anneeAcquis) {
            this.error = 'Veuillez sélectionner l\'année d\'acquisition';
          } else if (!bien.valeurAcquisition) {
            this.error = 'Veuillez renseigner la valeur d\'acquisition';
          }
        } else {
          this.error = '';
        }
        
        return isValid;
      }
    
      // Préparation pour l'API
      prepareAutreBienForApi(bien: any) {
        const anneeAcquis = bien.anneeAcquis instanceof Date 
                           ? bien.anneeAcquis.getFullYear()
                           : parseInt(bien.anneeAcquis);
    
        return {
          id: bien.id > 0 ? bien.id : null,
          type: { id: bien.type.id },
          designation: { id: bien.designation.id },
          localite: { id: bien.localite.id },
          anneeAcquis: anneeAcquis,
          valeurAcquisition: bien.valeurAcquisition,
          autrePrecisions: bien.autresPrecision ? { id: bien.autresPrecision.id } : null,
          dateCreation: bien.dateCreation || new Date().toISOString().split('T')[0],
          idDeclaration: { id: this.declarationData.id }
        };
      }
    
      // Opérations CRUD
      addTableRowAutreBienToTable() {
        if (!this.validateAutreBien(this.tableRowAutreBien)) {
          return;
        }
    
        const bienForApi = this.prepareAutreBienForApi(this.tableRowAutreBien);
        
        this.loading = true;
        this.declarationService.createAutreBienDeValeur(bienForApi).subscribe({
          next: (response) => {
            this.autresBiensTemp.push({ 
              ...this.tableRowAutreBien, 
              id: response.id,
              isNew: false
            });
            this.cancelTableRowAutreBien();
            this.loading = false;
            alert('Bien ajouté avec succès!');
          },
          error: (err) => {
            alert('Erreur lors de l\'ajout du bien');
            this.loading = false;
          }
        });
      }
    
      cancelTableRowAutreBien() {
        this.isAddingTableRow = false;
        this.tableRowAutreBien = this.resetAutreBien();
      }
    
      startEditAutreBien(bien: any) {
        bien._backup = JSON.parse(JSON.stringify(bien));
        bien.isEdit = true;
      }
    
      saveUpdatedAutreBien(bien: any) {
        if (!this.validateAutreBien(bien)) {
          return;
        }
    
        const bienForApi = this.prepareAutreBienForApi(bien);
        
        this.loading = true;
        this.declarationService.updateAutreBienDeValeur(bien.id, bienForApi).subscribe({
          next: () => {
            bien.isEdit = false;
            delete bien._backup;
            this.loading = false;
            alert('Bien mis à jour avec succès!');
          },
          error: (err) => {
            let errorMessage = 'Erreur lors de la mise à jour du bien';
            if (err.error?.message) errorMessage += ': ' + err.error.message;
            else if (err.message) errorMessage += ': ' + err.message;
            
            alert(errorMessage);
            this.cancelEditAutreBien(bien);
            this.loading = false;
          }
        });
      }
    
      cancelEditAutreBien(bien: any) {
        if (bien._backup) {
          Object.assign(bien, bien._backup);
          delete bien._backup;
        }
        bien.isEdit = false;
      }
    
      deleteSelectedAutresBiens() {
        if (!this.selectedAutresBiens?.length) return;
        
        if (confirm('Êtes-vous sûr de vouloir supprimer les biens sélectionnés?')) {
          const deletePromises = this.selectedAutresBiens
            .filter(bien => bien.id > 0)
            .map(bien => this.declarationService.deleteAutreBienDeValeur(bien.id).toPromise());
          
          this.autresBiensTemp = this.autresBiensTemp.filter(
            b => !this.selectedAutresBiens.includes(b)
          );
          
          this.loading = true;
          Promise.all(deletePromises)
            .then(() => {
              alert('Suppression effectuée avec succès');
              this.selectedAutresBiens = [];
              this.loading = false;
            })
            .catch(() => {
              alert('Erreur lors de la suppression des éléments');
              this.loadAutresBiensByDeclaration();
              this.loading = false;
            });
        }
      }
    
      saveAutresBiensDeclaration() {
        if (this.autresBiensTemp.length === 0 && !this.isDataModified) {
          alert('Aucune modification à enregistrer !');
          return;
        }
    
        const newBiens = this.autresBiensTemp.filter(b => b.isNew);
        const modifiedBiens = this.autresBiensTemp.filter(b => b._modified && !b.isNew);
        
        const requests = [
          ...newBiens.map(b => this.declarationService.createAutreBienDeValeur(this.prepareAutreBienForApi(b))),
          ...modifiedBiens.map(b => this.declarationService.updateAutreBienDeValeur(b.id, this.prepareAutreBienForApi(b)))
        ];
        
        if (requests.length > 0) {
          this.loading = true;
          forkJoin(requests).subscribe({
            next: (responses) => {
              alert(`${responses.length} opérations effectuées avec succès !`);
              this.loadAutresBiensByDeclaration();
              this.loading = false;
            },
            error: () => {
              alert('Certaines opérations n\'ont pas pu être effectuées !');
              this.loading = false;
            }
          });
        } else {
          alert('Aucune modification à enregistrer !');
        }
      }
    
      autresDettesTemp: any[] = []; // Liste locale temporaire
      selectedAutresDettes: any[] = []; // Éléments sélectionnés
      tableRowAutreDette: any = {}; // Nouvelle dette en cours d'ajout
      
      creanciers: Vocabulaire[] = [];
      justificatifs: Vocabulaire[] = [];
      
        // Fonction de réinitialisation
        resetAutreDette(): any {
          return {
            creancier: null,
            montant: null,
            pathJustificatif: null,
            autresPrecisions: null  // Make sure this matches the backend
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
                isEdit: false
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
              this.error = 'Veuillez sélectionner le créancier';
            } else if (!dette.montant) {
              this.error = 'Veuillez renseigner le montant';
            } else if (!dette.pathJustificatif) {
              this.error = 'Veuillez sélectionner le justificatif';
            }
          } else {
            this.error = '';
          }
          
          return isValid;
        }
      
        // Préparation pour l'API
        prepareDetteForApi(dette: any) {
          return {
            // ne pas inclure id si undefined ou null
            ...(dette.id ? { id: dette.id } : {}),
            creanciers: { id: dette.creancier.id },
            montant: dette.montant,
            justificatifs: { id: dette.pathJustificatif.id },
            autresPrecisions: dette.autresPrecisions && dette.autresPrecisions.id > 0 
            ? { id: dette.autresPrecisions.id }
            : null,
            dateCreation: dette.dateCreation || new Date().toISOString().split('T')[0],
            idDeclaration: { id: this.declarationData.id }
          };
        }
        
        
      
        addTableRowAutreDetteToTable() {
          if (!this.validateAutreDette(this.tableRowAutreDette)) {
            return;
          }
        
          const detteForApi = this.prepareDetteForApi(this.tableRowAutreDette);
        
          // Affiche dans la console les données préparées pour l'API
          console.log("Données envoyées au backend:", detteForApi);
        
          this.loading = true;
          this.declarationService.createAutreDette(detteForApi).subscribe({
            next: (response) => {
              this.autresDettesTemp.push({ 
                ...this.tableRowAutreDette, 
                id: response.id,
                isNew: false
              });
              this.cancelTableRowAutreDette();
              this.loading = false;
              alert('Dette ajoutée avec succès!');
            },
            error: (err) => {
              alert('Erreur lors de l\'ajout de la dette');
              this.loading = false;
            }
          });
        }
        
      
        cancelTableRowAutreDette() {
          this.isAddingTableRow = false;
          this.tableRowAutreDette = this.resetAutreDette();
        }
      
        startEditAutreDette(dette: any) {
          dette._backup = JSON.parse(JSON.stringify(dette));
          dette.isEdit = true;
        }
      
        saveUpdatedAutreDette(dette: any) {
          if (!this.validateAutreDette(dette)) {
            return;
          }
      
          const detteForApi = this.prepareDetteForApi(dette);
          
          this.loading = true;
          this.declarationService.updateAutreDette(dette.id, detteForApi).subscribe({
            next: () => {
              dette.isEdit = false;
              delete dette._backup;
              this.loading = false;
              alert('Dette mise à jour avec succès!');
            },
            error: (err) => {
              let errorMessage = 'Erreur lors de la mise à jour de la dette';
              if (err.error?.message) errorMessage += ': ' + err.error.message;
              else if (err.message) errorMessage += ': ' + err.message;
              
              alert(errorMessage);
              this.cancelEditAutreDette(dette);
              this.loading = false;
            }
          });
        }
      
        cancelEditAutreDette(dette: any) {
          if (dette._backup) {
            Object.assign(dette, dette._backup);
            delete dette._backup;
          }
          dette.isEdit = false;
        }
      
        archiveSelectedAutresDettes() {
          if (!this.selectedAutresDettes?.length) return;
          
          if (confirm('Êtes-vous sûr de vouloir archiver les dettes sélectionnées?')) {
            const deletePromises = this.selectedAutresDettes
              .filter(dette => dette.id > 0)
              .map(dette => this.declarationService.deleteAutreDette(dette.id).toPromise());
            
            this.autresDettesTemp = this.autresDettesTemp.filter(
              d => !this.selectedAutresDettes.includes(d)
            );
            
            this.loading = true;
            Promise.all(deletePromises)
              .then(() => {
                alert('Archivage effectué avec succès');
                this.selectedAutresDettes = [];
                this.loading = false;
              })
              .catch(() => {
                alert('Erreur lors de l\'archivage des éléments');
                this.loadAutresDettes();
                this.loading = false;
              });
          }
        }
      
        saveAutresDettes() {
          if (this.autresDettesTemp.length === 0 && !this.isDataModified) {
            alert('Aucune modification à enregistrer !');
            return;
          }
      
          const newDettes = this.autresDettesTemp.filter(d => d.isNew);
          const modifiedDettes = this.autresDettesTemp.filter(d => d._modified && !d.isNew);
          
          const requests = [
            ...newDettes.map(d => this.declarationService.createAutreDette(this.prepareDetteForApi(d))),
            ...modifiedDettes.map(d => this.declarationService.updateAutreDette(d.id, this.prepareDetteForApi(d)))
          ];
          
          if (requests.length > 0) {
            this.loading = true;
            forkJoin(requests).subscribe({
              next: (responses) => {
                alert(`${responses.length} opérations effectuées avec succès !`);
                this.loadAutresDettes();
                this.loading = false;
              },
              error: () => {
                alert('Certaines opérations n\'ont pas pu être effectuées !');
                this.loading = false;
              }
            });
          } else {
            alert('Aucune modification à enregistrer !');
          }
        }
      

        disponibilitesTemp: any[] = []; // Liste locale temporaire
        selectedDisponibilites: any[] = []; // Éléments sélectionnés
        tableRowDisponibilite: any = {}; // Nouvelle disponibilité en cours d'ajout
        banques: Vocabulaire[] = [];


  // Fonction de réinitialisation
  resetDisponibilite(): any {
    return {
      banque: null,
      numeroCompte: null,
      typeCompte: null,
      soldeFCFA: null,
      dateSolde: null
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
          // Assurer la conversion correcte des champs
          banque: item.banque || { id: item.banque_id },
          typeCompte: item.typeCompte || { id: item.type_compte_id },
          dateSolde: item.dateSolde || item.date_solde ? new Date(item.dateSolde || item.date_solde) : null,
          soldeFCFA: item.soldeFCFA || item.solde_fcfa,
          numeroCompte: item.numeroCompte || item.numero_compte,
          isEdit: false
        }));
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
      idDeclaration: { id: this.declarationData.id }
    };
  }

  // Opérations CRUD
  addTableRowDisponibiliteToTable() {
    if (!this.validateDisponibilite(this.tableRowDisponibilite)) {
      return;
    }

    const disponibiliteForApi = this.prepareDisponibiliteForApi(this.tableRowDisponibilite);
    
    this.loading = true;
    this.declarationService.createDisponibilite(disponibiliteForApi).subscribe({
      next: (response) => {
        this.disponibilitesTemp.push({ 
          ...this.tableRowDisponibilite, 
          id: response.id,
          isNew: false
        });
        this.cancelTableRowDisponibilite();
        this.loading = false;
        alert('Disponibilité ajoutée avec succès!');
      },
      error: (err) => {
        alert('Erreur lors de l\'ajout de la disponibilité');
        this.loading = false;
      }
    });
  }

  cancelTableRowDisponibilite() {
    this.isAddingTableRow = false;
    this.tableRowDisponibilite = this.resetDisponibilite();
  }

  startEditDisponibilite(disponibilite: any) {
    disponibilite._backup = JSON.parse(JSON.stringify(disponibilite));
    disponibilite.isEdit = true;
  }

  saveUpdatedDisponibilite(disponibilite: any) {
    if (!this.validateDisponibilite(disponibilite)) {
      return;
    }

    const disponibiliteForApi = this.prepareDisponibiliteForApi(disponibilite);
    
    this.loading = true;
    this.declarationService.updateDisponibilite(disponibilite.id, disponibiliteForApi).subscribe({
      next: () => {
        disponibilite.isEdit = false;
        delete disponibilite._backup;
        this.loading = false;
        alert('Disponibilité mise à jour avec succès!');
      },
      error: (err) => {
        let errorMessage = 'Erreur lors de la mise à jour de la disponibilité';
        if (err.error?.message) errorMessage += ': ' + err.error.message;
        else if (err.message) errorMessage += ': ' + err.message;
        
        alert(errorMessage);
        this.cancelEditDisponibilite(disponibilite);
        this.loading = false;
      }
    });
  }

  cancelEditDisponibilite(disponibilite: any) {
    if (disponibilite._backup) {
      Object.assign(disponibilite, disponibilite._backup);
      delete disponibilite._backup;
    }
    disponibilite.isEdit = false;
  }

  archiveSelectedDisponibilites() {
    if (!this.selectedDisponibilites?.length) return;
    
    if (confirm('Êtes-vous sûr de vouloir archiver les disponibilités sélectionnées?')) {
      const deletePromises = this.selectedDisponibilites
        .filter(disponibilite => disponibilite.id > 0)
        .map(disponibilite => this.declarationService.deleteDisponibilite(disponibilite.id).toPromise());
      
      this.disponibilitesTemp = this.disponibilitesTemp.filter(
        d => !this.selectedDisponibilites.includes(d)
      );
      
      this.loading = true;
      Promise.all(deletePromises)
        .then(() => {
          alert('Archivage effectué avec succès');
          this.selectedDisponibilites = [];
          this.loading = false;
        })
        .catch(() => {
          alert('Erreur lors de l\'archivage des éléments');
          this.loadDisponibilites();
          this.loading = false;
        });
    }
  }

  saveDisponibilitesDeclaration() {
    if (this.disponibilitesTemp.length === 0 && !this.isDataModified) {
      alert('Aucune modification à enregistrer !');
      return;
    }

    const newDisponibilites = this.disponibilitesTemp.filter(d => d.isNew);
    const modifiedDisponibilites = this.disponibilitesTemp.filter(d => d._modified && !d.isNew);
    
    const requests = [
      ...newDisponibilites.map(d => this.declarationService.createDisponibilite(this.prepareDisponibiliteForApi(d))),
      ...modifiedDisponibilites.map(d => this.declarationService.updateDisponibilite(d.id, this.prepareDisponibiliteForApi(d)))
    ];
    
    if (requests.length > 0) {
      this.loading = true;
      forkJoin(requests).subscribe({
        next: (responses) => {
          alert(`${responses.length} opérations effectuées avec succès !`);
          this.loadDisponibilites();
          this.loading = false;
        },
        error: () => {
          alert('Certaines opérations n\'ont pas pu être effectuées !');
          this.loading = false;
        }
      });
    } else {
      alert('Aucune modification à enregistrer !');
    }
  }


}