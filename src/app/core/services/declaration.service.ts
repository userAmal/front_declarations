import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { FoncierBati } from '../models/foncierBati';
import { Vocabulaire } from '../models/vocabulaire';

@Injectable({
  providedIn: 'root'
})
export class DeclarationService {
 private apiUrl = 'http://localhost:8084/api';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}
 getDeclarationByToken(): Observable<any> {
    let token: string | null = null;
    
    // Récupérer le token depuis l'URL
    token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      const hashFragment = window.location.hash;
      const queryIndex = hashFragment.indexOf('?');
      
      if (queryIndex !== -1) {
        const queryString = hashFragment.substring(queryIndex + 1);
        token = new URLSearchParams(queryString).get("token");
      }
    }
    
    console.log("Token récupéré:", token);
    
    if (!token) {
      return throwError(() => new Error("Token introuvable dans l'URL"));
    }
    
    // Stocker le token pour l'utiliser lors de l'enregistrement
    sessionStorage.setItem('declarationToken', token);
    
    return this.http.get(`${this.apiUrl}/assujetti/declaration/access`, {
      params: { token }
    }).pipe(
      catchError(error => {
        console.error('Erreur lors de la vérification du token:', error);
        
        // Rediriger vers la page d'accès refusé selon le type d'erreur
        if (error.status === 401) {
          this.router.navigate(['/access-denied'], {
            queryParams: { 
              message: error.error?.message || 'Votre lien d\'accès a expiré ou est invalide'
            }
          });
        }
        
        return throwError(() => error);
      })
    );
  }

  enregistrerDeclaration(declarationId: string): Observable<any> {
    // Récupérer le token stocké
    const token = sessionStorage.getItem('declarationToken');
    
    if (!token) {
      return throwError(() => new Error("Token manquant"));
    }
    
    // Utiliser le token dans l'URL comme paramètre de requête
    const params = new HttpParams().set('token', token);
    
    return this.http.post(`${this.apiUrl}/declarations/${declarationId}/enregistrer`, {}, {
      params: params
    }).pipe(
      catchError(error => {
        console.error('Erreur lors de l\'enregistrement:', error);
        
        // Ne rediriger automatiquement que pour certaines erreurs spécifiques
        if (error.status === 401 && error.error?.alreadySubmitted) {
          this.router.navigate(['/access-denied'], {
            queryParams: { 
              message: 'Cette déclaration a déjà été soumise',
              alreadySubmitted: 'true'
            }
          });
        } else if (error.status === 401 && error.error?.expired) {
          this.router.navigate(['/access-denied'], {
            queryParams: { 
              message: 'Votre lien d\'accès a expiré',
              expired: 'true'
            }
          });
        }
        
        // Toujours propager l'erreur pour que le composant puisse la gérer
        return throwError(() => error);
      })
    );
  }

  getDeclarationDetails(declarationId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/declarations/${declarationId}`);
  }
getAllTypeVocabulaire(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/type-vocabulaire`);
}

getVocabulaireByType(typeId: number): Observable<Vocabulaire[]> {
  return this.http.get<Vocabulaire[]>(`${this.apiUrl}/vocabulaire/type/${typeId}`);
}


createFoncierBati(foncier: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/foncier-bati`, foncier);
}
getFonciersBatiByDeclaration(declarationId: number): Observable<FoncierBati[]> {
  return this.http.get<FoncierBati[]>(`${this.apiUrl}/foncier-bati/by-declaration/${declarationId}`);
}
updateFoncierBati(id: number, foncier: any): Observable<any> {
  const foncierWithId = { ...foncier, id: id };
  return this.http.put(`${this.apiUrl}/foncier-bati/${id}`, foncierWithId);
}
deleteFoncierBati(id: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/foncier-bati/${id}`);
}
uploadFoncierDocument(foncierId: number, file: File): Observable<any> {
  if (file.size > 10 * 1024 * 1024) {
    return throwError(() => new Error('La taille du fichier ne doit pas dépasser 10MB'));
  }
  
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'].includes(extension || '')) {
    return throwError(() => new Error('Type de fichier non supporté'));
  }
  
  const formData = new FormData();
  formData.append('file', file);
  return this.http.post<any>(
    `${this.apiUrl}/foncier-bati/upload/${foncierId}`,
    formData
  ).pipe(
    catchError(err => {
      return throwError(() => new Error(err.error?.message || 'Erreur lors de l\'upload'));
    })
  );
}

downloadFoncierDocument(foncierId: number): Observable<Blob> {
  return this.http.get(
    `${this.apiUrl}/foncier-bati/download/${foncierId}`,
    { responseType: 'blob' }
  )
}
getByNatureId(natureId: number): Observable<FoncierBati[]> {
  return this.http.get<FoncierBati[]>(`${this.apiUrl}/by-nature/${natureId}`);
}





  createFoncierNonBati(foncier: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/foncier-non-bati`, foncier);
  }
  updateFoncierNonBati(id: number, foncier: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/foncier-non-bati/${id}`, foncier);
  }
  deleteFoncierNonBati(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/foncier-non-bati/${id}`);
  }
  getFonciersNonBatiByDeclaration(declarationId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/foncier-non-bati/by-declaration/${declarationId}`);
  }
  getByNatureIdFND(natureId: number): Observable<FoncierBati[]> {
    return this.http.get<FoncierBati[]>(`${this.apiUrl}/by-natureFNB/${natureId}`);
  }
  uploadFoncierNonbatiDocument(foncierId: number, file: File): Observable<any> {
    if (file.size > 10 * 1024 * 1024) {
      return throwError(() => new Error('La taille du fichier ne doit pas dépasser 10MB'));
    }
        const extension = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'].includes(extension || '')) {
      return throwError(() => new Error('Type de fichier non supporté'));
    }
    
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(
      `${this.apiUrl}/foncier-non-bati/upload/${foncierId}`,
      formData
    ).pipe(
      catchError(err => {
        return throwError(() => new Error(err.error?.message || 'Erreur lors de l\'upload'));
      })
    );
  }
  
  downloadFoncierNonBatiDocument(foncierId: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/foncier-non-bati/download/${foncierId}`,
      { responseType: 'blob' }
    )
  }





  createMeubleMeublant(foncier: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/meubles-meublants`, foncier);
  }

  updateMeubleMeublant(id: number, foncier: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/meubles-meublants/${id}`, foncier);
  }

  deleteMeubleMeublant(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/meubles-meublants/${id}`);
  }

  getMeublesMeublantsByDeclaration(declarationId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/meubles-meublants/by-declaration/${declarationId}`);
  }

  uploadMeubleDocument(foncierId: number, file: File): Observable<any> {
    if (file.size > 10 * 1024 * 1024) {
      return throwError(() => new Error('La taille du fichier ne doit pas dépasser 10MB'));
    }
    
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'].includes(extension || '')) {
      return throwError(() => new Error('Type de fichier non supporté'));
    }
    
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(
      `${this.apiUrl}/meubles-meublants/upload/${foncierId}`,
      formData
    ).pipe(
      catchError(err => {
        return throwError(() => new Error(err.error?.message || 'Erreur lors de l\'upload'));
      })
    );
  }
  
  downloadMeubleDocument(foncierId: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/meubles-meublants/download/${foncierId}`,
      { responseType: 'blob' }
    )
  }
  searchMeublesMeublantsByDesignation(designation: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/meubles-meublants/search`, {
      params: { designation }
    });
  }
  



  createAppareil(appareil: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/appareils-electromenagers`, appareil);
  }
  getAppareilsByDeclaration(declarationId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/appareils-electromenagers/by-declaration/${declarationId}`);
  }
  updateAppareil(id: number, appareil: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/appareils-electromenagers/${id}`, appareil);
  }
  deleteAppareil(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/appareils-electromenagers/${id}`);
  }
  uploadAppareilDocument(appareilId: number, file: File): Observable<any> {
    if (file.size > 10 * 1024 * 1024) {
      return throwError(() => new Error('La taille du fichier ne doit pas dépasser 10MB'));
    }
    
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'].includes(extension || '')) {
      return throwError(() => new Error('Type de fichier non supporté'));
    }
    
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(
      `${this.apiUrl}/appareils-electromenagers/upload/${appareilId}`,
      formData
    ).pipe(
      catchError(err => {
        return throwError(() => new Error(err.error?.message || 'Erreur lors de l\'upload'));
      })
    );
  }
  
  downloadAppareilDocument(appareilId: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/appareils-electromenagers/download/${appareilId}`,
      { responseType: 'blob' }
    )
  }
  searchAppareilsByDesignation(designation: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/appareils-electromenagers/search`, {
      params: { designation }
    });
  }
  



  createAnimal(foncier: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/animaux`, foncier);
  }
  updateAnimal(id: number, animal: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/animaux/${id}`, animal);
  }
  deleteAnimal(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/animaux/${id}`);
  }
  getAnimauxByDeclaration(declarationId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/animaux/by-declaration/${declarationId}`);
  }
  uploadAnimalDocument(AnimalId: number, file: File): Observable<any> {
    if (file.size > 10 * 1024 * 1024) {
      return throwError(() => new Error('La taille du fichier ne doit pas dépasser 10MB'));
    }
    
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'].includes(extension || '')) {
      return throwError(() => new Error('Type de fichier non supporté'));
    }
    
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(
      `${this.apiUrl}/animaux/upload/${AnimalId}`,
      formData
    ).pipe(
      catchError(err => {
        return throwError(() => new Error(err.error?.message || 'Erreur lors de l\'upload'));
      })
    );
  }
  
  downloadAnimalDocument(AnimalId: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/animaux/download/${AnimalId}`,
      { responseType: 'blob' }
    )
  }
  searchAnimaux(keyword: string): Observable<any[]> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<any[]>(`${this.apiUrl}/animaux/search-by-especes`, { params });
  }
  



  createEmprunt(emprunt: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/emprunts`, emprunt);
  }
getEmpruntsByDeclaration(declarationId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/emprunts/by-declaration/${declarationId}`);
}
updateEmprunt(id: number, emprunt: any): Observable<any> {
  return this.http.put(`${this.apiUrl}/emprunts/${id}`, emprunt);
}
deleteEmprunt(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/emprunts/${id}`);
}
getEmpruntsByInstitution(vocabulaireId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/emprunts/by-institution/${vocabulaireId}`);
}
uploadEmpruntDocument(EmpruntId: number, file: File): Observable<any> {
  if (file.size > 10 * 1024 * 1024) {
    return throwError(() => new Error('La taille du fichier ne doit pas dépasser 10MB'));
  }
  
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'].includes(extension || '')) {
    return throwError(() => new Error('Type de fichier non supporté'));
  }
  
  const formData = new FormData();
  formData.append('file', file);
  return this.http.post<any>(
    `${this.apiUrl}/emprunts/upload/${EmpruntId}`,
    formData
  ).pipe(
    catchError(err => {
      return throwError(() => new Error(err.error?.message || 'Erreur lors de l\'upload'));
    })
  );
}

downloadEmpruntNonBatiDocument(EmpruntId: number): Observable<Blob> {
  return this.http.get(
    `${this.apiUrl}/emprunts/download/${EmpruntId}`,
    { responseType: 'blob' }
  )
}



  createEspece(espece: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/especes`, espece);
  }
  getEspecesByDeclaration(declarationId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/especes/by-declaration/${declarationId}`);
  }
  updateEspece(id: number, espece: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/especes/${id}`, espece);
  }
  deleteEspece(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/especes/${id}`);
  }
getEspecesByMonnaie(monnaie: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/especes/by-monnaie/${monnaie}`);
}
  uploadEspecesDocument(id: number, file: File): Observable<any> {
    if (file.size > 10 * 1024 * 1024) {
      return throwError(() => new Error('La taille du fichier ne doit pas dépasser 10MB'));
    }
        const extension = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'].includes(extension || '')) {
      return throwError(() => new Error('Type de fichier non supporté'));
    }
    
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(
      `${this.apiUrl}/especes/upload/${id}`,
      formData
    ).pipe(
      catchError(err => {
        return throwError(() => new Error(err.error?.message || 'Erreur lors de l\'upload'));
      })
    );
  }
  
  downloadEspecesDocument(id: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/especes/download/${id}`,
      { responseType: 'blob' }
    )
  }





  createTitres(id: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/titres`, id);
  }
  updateTitres(id: number, foncier: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/titres/${id}`, foncier);
  }
  deleteTitres(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/titres/${id}`);
  }
  getTitresByDeclaration(declarationId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/titres/by-declaration/${declarationId}`);
  }
getTitresByDesignation(designationId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/titres/by-designation/${designationId}`);
}
  uploadTitresDocument(id: number, file: File): Observable<any> {
    if (file.size > 10 * 1024 * 1024) {
      return throwError(() => new Error('La taille du fichier ne doit pas dépasser 10MB'));
    }
        const extension = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'].includes(extension || '')) {
      return throwError(() => new Error('Type de fichier non supporté'));
    }
    
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(
      `${this.apiUrl}/titres/upload/${id}`,
      formData
    ).pipe(
      catchError(err => {
        return throwError(() => new Error(err.error?.message || 'Erreur lors de l\'upload'));
      })
    );
  }
  
  downloadTitresDocument(id: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/titres/download/${id}`,
      { responseType: 'blob' }
    )
  }




  createCreance(creance: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/les-creances`, creance);
  }
  updateCreance(id: number, creance: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/les-creances/${id}`, creance);
  }
  deleteCreance(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/les-creances/${id}`);
  }
  getCreancesByDeclaration(declarationId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/les-creances/by-declaration/${declarationId}`);
  }
getCreancesByDebiteur(debiteurId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/les-creances/by-debiteur/${debiteurId}`);
}
  uploadCreanceDocument(Id: number, file: File): Observable<any> {
    if (file.size > 10 * 1024 * 1024) {
      return throwError(() => new Error('La taille du fichier ne doit pas dépasser 10MB'));
    }
        const extension = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'].includes(extension || '')) {
      return throwError(() => new Error('Type de fichier non supporté'));
    }
    
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(
      `${this.apiUrl}/les-creances/upload/${Id}`,
      formData
    ).pipe(
      catchError(err => {
        return throwError(() => new Error(err.error?.message || 'Erreur lors de l\'upload'));
      })
    );
  }
  
  downloadCreanceDocument(Id: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/les-creances/download/${Id}`,
      { responseType: 'blob' }
    )
  }




 createRevenu(revenu: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/revenus`, revenu);
}
updateRevenu(id: number, revenu: any): Observable<any> {
  return this.http.put(`${this.apiUrl}/revenus/${id}`, revenu);
}
deleteRevenu(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/revenus/${id}`);
}
getRevenusByDeclaration(declarationId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/revenus/by-declaration/${declarationId}`);
}
getRevenusByAutresRevenus(autresRevenusId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/revenus/by-autres-revenus/${autresRevenusId}`);
}
  uploadRevenusDocument(Id: number, file: File): Observable<any> {
    if (file.size > 10 * 1024 * 1024) {
      return throwError(() => new Error('La taille du fichier ne doit pas dépasser 10MB'));
    }
        const extension = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'].includes(extension || '')) {
      return throwError(() => new Error('Type de fichier non supporté'));
    }
    
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(
      `${this.apiUrl}/revenus/upload/${Id}`,
      formData
    ).pipe(
      catchError(err => {
        return throwError(() => new Error(err.error?.message || 'Erreur lors de l\'upload'));
      })
    );
  }
  
  downloadRevenusDocument(Id: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/foncier-non-bati/download/${Id}`,
      { responseType: 'blob' }
    )
  }






 createVehicule(vehicule: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/vehicules`, vehicule);
}
updateVehicule(id: number, vehicule: any): Observable<any> {
  return this.http.put(`${this.apiUrl}/vehicules/${id}`, vehicule);
}
deleteVehicule(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/vehicules/${id}`);
}
getVehiculesByDeclaration(declarationId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/vehicules/by-declaration/${declarationId}`);
}
getVehiculesByDesignation(designationId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/vehicules/designation/${designationId}`);
}
  uploadVehiculesDocument(Id: number, file: File): Observable<any> {
    if (file.size > 10 * 1024 * 1024) {
      return throwError(() => new Error('La taille du fichier ne doit pas dépasser 10MB'));
    }
        const extension = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'].includes(extension || '')) {
      return throwError(() => new Error('Type de fichier non supporté'));
    }
    
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(
      `${this.apiUrl}/vehicules/upload/${Id}`,
      formData
    ).pipe(
      catchError(err => {
        return throwError(() => new Error(err.error?.message || 'Erreur lors de l\'upload'));
      })
    );
  }
  
  downloadVehiculesDocument(Id: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/vehicules/download/${Id}`,
      { responseType: 'blob' }
    )
  }



 createAutreBienDeValeur(data: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/autres-biens-de-valeur`, data);
}
updateAutreBienDeValeur(id: number, data: any): Observable<any> {
  return this.http.put(`${this.apiUrl}/autres-biens-de-valeur/${id}`, data);
}

deleteAutreBienDeValeur(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/autres-biens-de-valeur/${id}`);
}
getAutresBiensDeValeurByDeclaration(declarationId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/autres-biens-de-valeur/by-declaration/${declarationId}`);
}
getAutresBiensDeValeurByDesignation(designationId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/autres-biens-de-valeur/by-designation/${designationId}`);
}
  uploadAutresBiensDeValeurDocument(Id: number, file: File): Observable<any> {
    if (file.size > 10 * 1024 * 1024) {
      return throwError(() => new Error('La taille du fichier ne doit pas dépasser 10MB'));
    }
        const extension = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'].includes(extension || '')) {
      return throwError(() => new Error('Type de fichier non supporté'));
    }
    
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(
      `${this.apiUrl}/autres-biens-de-valeur/upload/${Id}`,
      formData
    ).pipe(
      catchError(err => {
        return throwError(() => new Error(err.error?.message || 'Erreur lors de l\'upload'));
      })
    );
  }
  
  downloadAutresBiensDeValeurDocument(Id: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/autres-biens-de-valeur/download/${Id}`,
      { responseType: 'blob' }
    )
  }



 
 getByDeclaration(declarationId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/by-declaration/${declarationId}`);
}

createAutreDette(dette: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/autres-dettes`, dette);
}
updateAutreDette(id: number, dette: any): Observable<any> {
  return this.http.put<any>(`${this.apiUrl}/autres-dettes/${id}`, dette);
}
deleteAutreDette(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/autres-dettes/${id}`);
}
getAutresDettesByCreancier(creancierId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/autres-dettes/by-creancier/${creancierId}`);
}
  uploadAutresDettesDocument(Id: number, file: File): Observable<any> {
    if (file.size > 10 * 1024 * 1024) {
      return throwError(() => new Error('La taille du fichier ne doit pas dépasser 10MB'));
    }
        const extension = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'].includes(extension || '')) {
      return throwError(() => new Error('Type de fichier non supporté'));
    }
    
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(
      `${this.apiUrl}/autres-dettes/upload/${Id}`,
      formData
    ).pipe(
      catchError(err => {
        return throwError(() => new Error(err.error?.message || 'Erreur lors de l\'upload'));
      })
    );
  }
  
  downloadAutresDettesDocument(Id: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/autres-dettes/download/${Id}`,
      { responseType: 'blob' }
    )
  }



getDisponibilitesByDeclaration(declarationId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/disponibilites-en-banque/by-declaration/${declarationId}`);
}

getDisponibilitesByBanque(banqueId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/disponibilites-en-banque/by-banque/${banqueId}`);
}

createDisponibilite(disponibilite: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/disponibilites-en-banque`, disponibilite);
}

updateDisponibilite(id: number, disponibilite: any): Observable<any> {
  return this.http.put(`${this.apiUrl}/disponibilites-en-banque/${id}`, disponibilite);
}

deleteDisponibilite(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/disponibilites-en-banque/${id}`);
}
  uploadDisponibiliteDocument(Id: number, file: File): Observable<any> {
    if (file.size > 10 * 1024 * 1024) {
      return throwError(() => new Error('La taille du fichier ne doit pas dépasser 10MB'));
    }
        const extension = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'].includes(extension || '')) {
      return throwError(() => new Error('Type de fichier non supporté'));
    }
    
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(
      `${this.apiUrl}/disponibilites-en-banque/upload/${Id}`,
      formData
    ).pipe(
      catchError(err => {
        return throwError(() => new Error(err.error?.message || 'Erreur lors de l\'upload'));
      })
    );
  }
  
  downloadDisponibiliteDocument(Id: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/disponibilites-en-banque/download/${Id}`,
      { responseType: 'blob' }
    )
  }


}