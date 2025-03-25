import { Component } from '@angular/core';
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

@Component({
  selector: 'app-declaration',
  templateUrl: './declaration.component.html',
  styleUrls: ['./declaration.component.scss'],
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
      datePriseService: null
    },
    numeroDeclaration: '',
    typeDeclaration: ''
  };
  constructor(
    private declarationService: DeclarationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      // Check if we have a token in the route params
      // This handles the case where the route is accessed directly as /declaration?token=xyz
      if (params['token']) {
        this.processToken();
      } else {
        // Try to process with possible token in URL or hash fragment
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
        console.log("Données reçues de l'API (brut):", JSON.stringify(data)); // Afficher les données en format JSON
        this.declarationData = data;
        console.log("Structure declarationData:", JSON.stringify(this.declarationData)); // Vérifier après assignation
        this.loading = false;
      },
      error => {
        console.error("Erreur lors de la récupération des détails de la déclaration:", error);
        this.error = "Impossible de récupérer les détails de votre déclaration.";
        this.loading = false;
      }
    );
  }
  


  animaux: Animaux[] = [];
  selectedAnimals: Animaux[] = [];
  isSearching = false;
  searchQuery: string = '';
  isAddingAnimal = false;
  isEditingAnimal = false;
  animalToEdit: Animaux | null = null;
  newAnimal: Animaux = new Animaux();
  date: Date = new Date();
// Variables pour Foncier bati
foncierBati: any[] = [];
selectedFonciers: any[] = [];
isAddingFoncier = false;
isEditingFoncier = false;
newFoncier: any = {};
foncierToEdit: any = null;

// Méthodes pour Foncier bati
saveNewFoncier() {
  if (this.validateFoncier(this.newFoncier)) {
    this.foncierBati.push({...this.newFoncier, id: Date.now()});
    this.cancelNewFoncier();
  }
}

cancelNewFoncier() {
  this.isAddingFoncier = false;
  this.newFoncier = {};
}

editFoncier(foncier: any) {
  this.foncierToEdit = {...foncier};
  this.isEditingFoncier = true;
}

saveUpdatedFoncier() {
  if (this.validateFoncier(this.foncierToEdit)) {
    const index = this.foncierBati.findIndex(f => f.id === this.foncierToEdit.id);
    this.foncierBati[index] = {...this.foncierToEdit};
    this.cancelEditFoncier();
  }
}

cancelEditFoncier() {
  this.isEditingFoncier = false;
  this.foncierToEdit = null;
}

archiveSelectedFoncier() {
  this.foncierBati = this.foncierBati.filter(f => !this.selectedFonciers.includes(f));
  this.selectedFonciers = [];
}

validateFoncier(foncier: any): boolean {
  // Implémentez la validation des données ici
  return true;
}
  // Foncier Non Bati
  fonciersNonBati: FoncierNonBati[] = [];
  selectedFoncierNonBati: FoncierNonBati[] = [];
  isAddingFoncierNonBati = false;
  newFoncierNonBati: FoncierNonBati = this.initFoncierNonBati();

  // Foncier Bati
  selectedFoncierBati: any[] = [];

  modesAcquisition = [
    { libelle: 'Achat' },
    { libelle: 'Location' },
    { libelle: 'Donation' },
    { libelle: 'Héritage' },
    { libelle: 'Autre' }
  ];

  // Nature du foncier non bâti
  natures = [
    { libelle: 'Terrain agricole' },
    { libelle: 'Terrain constructible' },
    { libelle: 'Jardin' },
    { libelle: 'Bois/Forêt' },
    { libelle: 'Autre' }
  ];

  roles: string[] = ['Admin', 'Utilisateur'];
  // MeubleMeublant
  meublesMeublant: MeubleMeublant[] = [];
  selectedMeublesMeublant: MeubleMeublant[] = [];
  isAddingMeubleMeublant = false;
  isEditingMeubleMeublant = false;
  meubleMeublantToEdit: MeubleMeublant | null = null;
  newMeubleMeublant: MeubleMeublant = this.initMeubleMeublant();
  
  // États généraux pour les meubles
  etatsGeneraux = [
    { libelle: 'Neuf' },
    { libelle: 'Très bon état' },
    { libelle: 'Bon état' },
    { libelle: 'État moyen' },
    { libelle: 'Mauvais état' }
  ];
  
  // Méthodes pour MeubleMeublant
  initMeubleMeublant(): MeubleMeublant {
    return {
      isSelected: false,
      designation: '',
      anneeAcquisition: null,
      valeurAcquisition: null,
      etatGeneral: null,
      dateCreation: new Date(),
      declaration: null,
      isEdit: false
    };
  }
  toggleSearch() {
    this.isSearching = !this.isSearching;
  }

  onGlobalFilter(dt: any, event: any) {
    dt.filterGlobal(event.target.value, 'contains');
  }

  // Méthodes pour Animaux
  editAnimal(animal: Animaux) {
    this.isEditingAnimal = true;
    this.animalToEdit = { ...animal };
  }

  saveUpdatedAnimal() {
    this.isEditingAnimal = false;
  }

  cancelEditAnimal() {
    this.isEditingAnimal = false;
    this.animalToEdit = null;
  }

  saveNewAnimal() {
    this.isAddingAnimal = false;
    // Logique pour sauvegarder nouvel animal
    this.animaux.push({...this.newAnimal});
    this.newAnimal = new Animaux();
  }

  cancelNewAnimal() {
    this.isAddingAnimal = false;
    this.newAnimal = new Animaux();
  }

  archiveSelectedAnimal() {
    // Logic to archive the selected animals
    this.animaux = this.animaux.filter(animal => !this.selectedAnimals.includes(animal));
    this.selectedAnimals = [];
  }

  // Méthodes pour Foncier Bati
  editFoncierBati(foncierBati: any) {
    console.log(foncierBati);
    // Implement logic for editing the foncierBati
  }

  // Méthodes pour Foncier Non Bati
  initFoncierNonBati(): FoncierNonBati {
    return {
      isSelected: false,
      nature: null,
      modeAcquisition: null,
      ilot: '',
      lotissement: '',
      superficie: null,
      localite: '',
      localisation: '',
      titrePropriete: '',
      dateAquis: null,
      valeurAcquisFCFA: null,
      coutInvestissement: null,
      dateCreation: new Date(),
      declaration: null,
      isEdit: false
    };
  }

  editFoncierNonBati(foncier: FoncierNonBati) {
    // Marquer le foncier comme en cours d'édition
    foncier.isEdit = true;
  }

  saveEditedFoncierNonBati(foncier: FoncierNonBati) {
    // Logique pour sauvegarder les modifications
    foncier.isEdit = false;
  }

  cancelEditFoncierNonBati(foncier: FoncierNonBati) {
    // Annuler les modifications
    foncier.isEdit = false;
    // Recharger les données d'origine (vous devrez implémenter cette logique)
  }

  saveNewFoncierNonBati() {
    // Logique pour sauvegarder un nouveau foncier non bâti
    this.fonciersNonBati.push({...this.newFoncierNonBati});
    this.isAddingFoncierNonBati = false;
    this.newFoncierNonBati = this.initFoncierNonBati();
  }

  cancelNewFoncierNonBati() {
    this.isAddingFoncierNonBati = false;
    this.newFoncierNonBati = this.initFoncierNonBati();
  }

  archiveSelectedFoncierNonBati() {
    // Logique pour supprimer les fonciers non bâtis sélectionnés
    this.fonciersNonBati = this.fonciersNonBati.filter(foncier => !this.selectedFoncierNonBati.includes(foncier));
    this.selectedFoncierNonBati = [];
  }


editMeubleMeublant(meuble: MeubleMeublant) {
  meuble.isEdit = true;
}

saveEditedMeubleMeublant(meuble: MeubleMeublant) {
  meuble.isEdit = false;
}

cancelEditMeubleMeublant(meuble: MeubleMeublant) {
  meuble.isEdit = false;
  // Recharger les données d'origine si nécessaire
}

saveNewMeubleMeublant() {
  this.meublesMeublant.push({...this.newMeubleMeublant});
  this.isAddingMeubleMeublant = false;
  this.newMeubleMeublant = this.initMeubleMeublant();
}

cancelNewMeubleMeublant() {
  this.isAddingMeubleMeublant = false;
  this.newMeubleMeublant = this.initMeubleMeublant();
}

archiveSelectedMeubleMeublant() {
  this.meublesMeublant = this.meublesMeublant.filter(meuble => !this.selectedMeublesMeublant.includes(meuble));
  this.selectedMeublesMeublant = [];
}
// Ajouter ces propriétés
appareils: AppareilElectroMenager[] = [];
selectedAppareils: AppareilElectroMenager[] = [];
isAddingAppareil = false;
newAppareil: AppareilElectroMenager = this.initNewAppareil();

// Initialisation
initNewAppareil(): AppareilElectroMenager {
  return {
    isSelected: false,
    designation: '',
    anneeAcquisition: null,
    valeurAcquisition: null,
    etatGeneral: null,
    dateCreation: new Date().toISOString(),
    isEdit: false
  };
}

// Méthodes
addAppareil() {
  this.isAddingAppareil = true;
}

saveAppareil() {
  this.appareils.push({...this.newAppareil});
  this.isAddingAppareil = false;
  this.newAppareil = this.initNewAppareil();
}

cancelAddAppareil() {
  this.isAddingAppareil = false;
  this.newAppareil = this.initNewAppareil();
}

deleteSelectedAppareils() {
  this.appareils = this.appareils.filter(a => !this.selectedAppareils.includes(a));
  this.selectedAppareils = [];
}

editAppareil(appareil: AppareilElectroMenager) {
  appareil.isEdit = true;
}

saveEditedAppareil(appareil: AppareilElectroMenager) {
  appareil.isEdit = false;
}

cancelEditAppareil(appareil: AppareilElectroMenager) {
  appareil.isEdit = false;
}
// Ajouter ces propriétés
disponibilites: DisponibiliteEnBanque[] = [];
selectedDisponibilites: DisponibiliteEnBanque[] = [];
isAddingDisponibilite = false;
newDisponibilite: DisponibiliteEnBanque = this.initNewDisponibilite();

// Liste des types de compte
typesCompte = [
  { libelle: 'Compte courant' },
  { libelle: 'Compte épargne' },
  { libelle: 'Compte titre' },
  { libelle: 'Compte joint' }
];

// Initialisation
initNewDisponibilite(): DisponibiliteEnBanque {
  return {
    isSelected: false,
    banque: '',
    localite: '',
    numeroCompte: '',
    typeCompte: null,
    soldeFCFA: null,
    dateSolde: new Date(),
    attestationSoldeCompte: '',
    isEdit: false
  };
}

// Méthodes
addDisponibilite() {
  this.isAddingDisponibilite = true;
}

saveDisponibilite() {
  this.disponibilites.push({...this.newDisponibilite});
  this.isAddingDisponibilite = false;
  this.newDisponibilite = this.initNewDisponibilite();
}

cancelAddDisponibilite() {
  this.isAddingDisponibilite = false;
  this.newDisponibilite = this.initNewDisponibilite();
}

deleteSelectedDisponibilites() {
  this.disponibilites = this.disponibilites.filter(d => !this.selectedDisponibilites.includes(d));
  this.selectedDisponibilites = [];
}

editDisponibilite(disponibilite: DisponibiliteEnBanque) {
  disponibilite.isEdit = true;
}

saveEditedDisponibilite(disponibilite: DisponibiliteEnBanque) {
  disponibilite.isEdit = false;
}

cancelEditDisponibilite(disponibilite: DisponibiliteEnBanque) {
  disponibilite.isEdit = false;
}
// Ajouter ces propriétés
emprunts: Emprunt[] = [];
selectedEmprunts: Emprunt[] = [];
isAddingEmprunt = false;
newEmprunt: Emprunt = this.initNewEmprunt();

// Listes de vocabulaire
typesEmprunt = [
  { libelle: 'Prêt immobilier' },
  { libelle: 'Crédit consommation' },
  { libelle: 'Prêt personnel' },
  { libelle: 'Crédit professionnel' }
];


// Initialisation
initNewEmprunt(): Emprunt {
  return {
    isSelected: false,
    institutionFinanciere: '',
    numeroCompte: '',
    typeEmprunt: null,
    montantEmprunt: null,
    typeCompte: null,
    datePremiereEcheance: null,
    montantEnCours: null,
    dateDernierEcheance: null,
    tableauAmortissement: '',
    isEdit: false
  };
}

// Méthodes
addEmprunt() {
  this.isAddingEmprunt = true;
}

saveEmprunt() {
  this.emprunts.push({...this.newEmprunt});
  this.isAddingEmprunt = false;
  this.newEmprunt = this.initNewEmprunt();
}

cancelAddEmprunt() {
  this.isAddingEmprunt = false;
  this.newEmprunt = this.initNewEmprunt();
}

deleteSelectedEmprunts() {
  this.emprunts = this.emprunts.filter(e => !this.selectedEmprunts.includes(e));
  this.selectedEmprunts = [];
}

editEmprunt(emprunt: Emprunt) {
  emprunt.isEdit = true;
}

saveEditedEmprunt(emprunt: Emprunt) {
  emprunt.isEdit = false;
}

cancelEditEmprunt(emprunt: Emprunt) {
  emprunt.isEdit = false;
}
// Ajouter dans la classe DeclarationComponent

// Créances
creances: Creance[] = [];
selectedCreances: Creance[] = [];
isAddingCreance = false;
newCreance: Creance = this.initNewCreance();

// Espèces
especes: Espece[] = [];
selectedEspeces: Espece[] = [];
isAddingEspece = false;
newEspece: Espece = this.initNewEspece();

// Listes de vocabulaire
devises = [
  { libelle: 'USD' },
  { libelle: 'EUR' },
  { libelle: 'GBP' },
  // Ajouter d'autres devises...
];

// Méthodes d'initialisation
initNewCreance(): Creance {
  return {
    isSelected: false,
    debiteur: '',
    montant: null,
    autresPrecision: '',
    isEdit: false
  };
}

initNewEspece(): Espece {
  return {
    isSelected: false,
    monnaie: null,
    devise: null,
    tauxChange: null,
    montantFCFA: null,
    montantTotalFCFA: null,
    dateEspece: new Date(),
    isEdit: false
  };
}

// Méthodes Créances
addCreance() {
  this.isAddingCreance = true;
}

saveCreance() {
  this.creances.push({...this.newCreance});
  this.isAddingCreance = false;
  this.newCreance = this.initNewCreance();
}

cancelAddCreance() {
  this.isAddingCreance = false;
  this.newCreance = this.initNewCreance();
}

deleteSelectedCreances() {
  this.creances = this.creances.filter(c => !this.selectedCreances.includes(c));
  this.selectedCreances = [];
}

editCreance(creance: Creance) {
  creance.isEdit = true;
}

saveEditedCreance(creance: Creance) {
  creance.isEdit = false;
}

cancelEditCreance(creance: Creance) {
  creance.isEdit = false;
}

// Méthodes Espèces
addEspece() {
  this.isAddingEspece = true;
}

saveEspece() {
  this.especes.push({...this.newEspece});
  this.isAddingEspece = false;
  this.newEspece = this.initNewEspece();
}

cancelAddEspece() {
  this.isAddingEspece = false;
  this.newEspece = this.initNewEspece();
}

deleteSelectedEspeces() {
  this.especes = this.especes.filter(e => !this.selectedEspeces.includes(e));
  this.selectedEspeces = [];
}

editEspece(espece: Espece) {
  espece.isEdit = true;
}

saveEditedEspece(espece: Espece) {
  espece.isEdit = false;
}

cancelEditEspece(espece: Espece) {
  espece.isEdit = false;
}
// Ajouter dans la classe DeclarationComponent

// Véhicules
vehicules: Vehicule[] = [];
selectedVehicules: Vehicule[] = [];
isAddingVehicule = false;
newVehicule: Vehicule = this.initNewVehicule();

// Revenus
revenus: Revenu[] = [];
selectedRevenus: Revenu[] = [];
isAddingRevenu = false;
newRevenu: Revenu = this.initNewRevenu();

// Listes de vocabulaire
etatsVehicule = [
  { libelle: 'Neuf' },
  { libelle: 'Bon état' },
  { libelle: 'Usagé' },
  { libelle: 'À réparer' }
];

typesRevenu = [
  { libelle: 'Salaire' },
  { libelle: 'Loyer' },
  { libelle: 'Dividendes' },
  { libelle: 'Autre' }
];

entites = [
  { libelle: 'Entreprise' },
  { libelle: 'Propriété' },
  { libelle: 'Investissement' }
];

marquesVehicule = [
  { libelle: 'Toyota' },
  { libelle: 'Peugeot' },
  { libelle: 'Renault' },
  { libelle: 'Autre' }
];

// Méthodes d'initialisation
initNewVehicule(): Vehicule {
  return {
    designation: null,
    marque: null,
    immatriculation: '',
    anneeAcquisition: new Date().getFullYear(),
    valeurAcquisition: null,
    etatGeneral: null,
    dateCreation: new Date().toISOString(),
    isSynthese: false,
    idDeclaration: null,
    isEdit: false
  };
}

initNewRevenu(): Revenu {
  return {
    typeRevenu: null,
    entite: null,
    valeurRevenu: null,
    dateCreation: new Date(),
    isEdit: false
  };
}

// Méthodes Véhicules
addVehicule() {
  this.isAddingVehicule = true;
}

saveVehicule() {
  this.vehicules.push({...this.newVehicule});
  this.isAddingVehicule = false;
  this.newVehicule = this.initNewVehicule();
}
// Ajouter dans le component TS



cancelAddVehicule() {
  this.isAddingVehicule = false;
  this.newVehicule = this.initNewVehicule();
}

deleteSelectedVehicules() {
  this.vehicules = this.vehicules.filter(v => !this.selectedVehicules.includes(v));
  this.selectedVehicules = [];
}

editVehicule(vehicule: Vehicule) {
  vehicule.isEdit = true;
}

saveEditedVehicule(vehicule: Vehicule) {
  vehicule.isEdit = false;
}

cancelEditVehicule(vehicule: Vehicule) {
  vehicule.isEdit = false;
}

// Méthodes Revenus
addRevenu() {
  this.isAddingRevenu = true;
}

saveRevenu() {
  this.revenus.push({...this.newRevenu});
  this.isAddingRevenu = false;
  this.newRevenu = this.initNewRevenu();
}

cancelAddRevenu() {
  this.isAddingRevenu = false;
  this.newRevenu = this.initNewRevenu();
}

deleteSelectedRevenus() {
  this.revenus = this.revenus.filter(r => !this.selectedRevenus.includes(r));
  this.selectedRevenus = [];
}

editRevenu(revenu: Revenu) {
  revenu.isEdit = true;
}

saveEditedRevenu(revenu: Revenu) {
  revenu.isEdit = false;
}

cancelEditRevenu(revenu: Revenu) {
  revenu.isEdit = false;
}
// Dans le component TS
autresDettes: AutreDette[] = [];
selectedAutresDettes: AutreDette[] = [];
isAddingAutreDette = false;
newAutreDette: AutreDette = this.initNewAutreDette();
deleteSelectedAutresDettes() {
  this.autresDettes = this.autresDettes.filter(a => !this.selectedAutresDettes.includes(a));
  this.selectedAppareils = [];
}
initNewAutreDette(): AutreDette {
  return {
    isSelected: false,
    creancier: '',
    montant: null,
    pathJustificatif: '',
    autresPrecision: '',
    dateCreation: new Date(),
    isEdit: false
  };
}

addAutreDette() { this.isAddingAutreDette = true; }

saveAutreDette() {
  this.autresDettes.push({...this.newAutreDette});
  this.isAddingAutreDette = false;
  this.newAutreDette = this.initNewAutreDette();
}
// Complete the existing cancelAutreDette method
cancelAddAutreDette() {
  this.isAddingAutreDette = false;
  this.newAutreDette = this.initNewAutreDette();
}

// Add these missing methods
editAutreDette(dette: AutreDette) {
  dette.isEdit = true;
}

saveEditedAutreDette(dette: AutreDette) {
  dette.isEdit = false;
}

cancelEditAutreDette(dette: AutreDette) {
  dette.isEdit = false;
  // If needed, reset to original values here
}
// Dans le component TS
autresBiens: AutreBienDeValeur[] = [];
selectedAutresBiens: AutreBienDeValeur[] = [];
isAddingAutreBien = false;
newAutreBien: AutreBienDeValeur = this.initNewAutreBien();

typesBien = [
  { libelle: 'Œuvre d\'art' },
  { libelle: 'Bijoux' },
  { libelle: 'Métaux précieux' }
];

initNewAutreBien(): AutreBienDeValeur {
  return {
    isSelected: false,
    designation: '',
    localite: '',
    anneeAcquis: new Date(),
    valeurAcquisition: null,
    type: null,
    poid: null,
    autresPrecisions: '',
    isEdit: false
  };
}
// Add these properties to your DeclarationComponent class
titres: Titre[] = [];
selectedTitres: Titre[] = [];
isAddingTitre = false;
newTitre: Titre = this.initNewTitre();

// Initialize method
initNewTitre(): Titre {
  return {
    isSelected: false,
    designationNatureAction: '',
    valeurEmplacement: null,
    emplacement: '',
    autrePrecision: '',
    dateCreation: new Date(),
    isEdit: false
  };
}

// CRUD operations for Titre
addTitre() {
  this.isAddingTitre = true;
}

saveTitre() {
  this.titres.push({...this.newTitre});
  this.isAddingTitre = false;
  this.newTitre = this.initNewTitre();
}

cancelAddTitre() {
  this.isAddingTitre = false;
  this.newTitre = this.initNewTitre();
}

deleteSelectedTitres() {
  this.titres = this.titres.filter(t => !this.selectedTitres.includes(t));
  this.selectedTitres = [];
}

editTitre(titre: Titre) {
  titre.isEdit = true;
}

saveEditedTitre(titre: Titre) {
  titre.isEdit = false;
}

cancelEditTitre(titre: Titre) {
  titre.isEdit = false;
  // Reset to original values if needed
}
// Pour AutreBienDeValeur
editAutreBien(bien: AutreBienDeValeur) {
  bien.isEdit = true;
}

saveEditedAutreBien(bien: AutreBienDeValeur) {
  bien.isEdit = false;
}

cancelEditAutreBien(bien: AutreBienDeValeur) {
  bien.isEdit = false;
}

saveAutreBien() {
  this.autresBiens.push({...this.newAutreBien});
  this.isAddingAutreBien = false;
  this.newAutreBien = this.initNewAutreBien();
}

cancelAddAutreBien() {
  this.isAddingAutreBien = false;
  this.newAutreBien = this.initNewAutreBien();
}

deleteSelectedAutresBiens() {
  this.autresBiens = this.autresBiens.filter(b => !this.selectedAutresBiens.includes(b));
  this.selectedAutresBiens = [];
}
}
