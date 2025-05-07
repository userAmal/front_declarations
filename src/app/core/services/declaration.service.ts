import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
      throw new Error("Token introuvable dans l'URL");
    }
    
    return this.http.get(`${this.apiUrl}/assujetti/declaration/access`, {
        params: { token }
      });
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
  // S'assurer que l'ID est également dans le corps
  const foncierWithId = { ...foncier, id: id };
  return this.http.put(`${this.apiUrl}/foncier-bati/${id}`, foncierWithId);
}
deleteFoncierBati(id: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/foncier-bati/${id}`);
}
uploadFoncierDocument(foncierId: number, file: File): Observable<any> {
  // Vérification de la taille du fichier côté client aussi
  if (file.size > 10 * 1024 * 1024) {
    return throwError(() => new Error('La taille du fichier ne doit pas dépasser 10MB'));
  }
  
  // Vérification de l'extension
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
      // Traitement des erreurs spécifiques
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
  uploadFoncierNonbatiDocument(foncierId: number, file: File): Observable<any> {
    // Vérification de la taille du fichier côté client aussi
    if (file.size > 10 * 1024 * 1024) {
      return throwError(() => new Error('La taille du fichier ne doit pas dépasser 10MB'));
    }
    
    // Vérification de l'extension
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
        // Traitement des erreurs spécifiques
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

  uploadMeublerDocument(foncierId: number, file: File): Observable<any> {
    // Vérification de la taille du fichier côté client aussi
    if (file.size > 10 * 1024 * 1024) {
      return throwError(() => new Error('La taille du fichier ne doit pas dépasser 10MB'));
    }
    
    // Vérification de l'extension
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
        // Traitement des erreurs spécifiques
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


  createAppareil(appareil: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/appareils-electromenagers`, appareil);
  }
  getAppareilsByDeclaration(declarationId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/by-declaration/${declarationId}`);
  }
  updateAppareil(id: number, appareil: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, appareil);
  }
  deleteAppareil(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
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

// These methods should be added to your declaration.service.ts file

/**
 * Uploads a document for a specific animal
 * @param animalId ID of the animal
 * @param formData FormData containing the file to upload
 * @returns Observable with the upload response
 */
uploadAnimalDocument(animalId: number, formData: FormData): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/animaux/upload/${animalId}`, formData, {
    reportProgress: true,
    observe: 'events'
  });
}

/**
 * Downloads a document for a specific animal
 * @param animalId ID of the animal
 * @returns Observable with the file as Blob
 */
downloadAnimalDocument(animalId: number): Observable<Blob> {
  return this.http.get(`${this.apiUrl}/animaux/download/${animalId}`, {
    responseType: 'blob'
  });
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




  createEspece(espece: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, espece);
  }
  getEspecesByDeclaration(declarationId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/by-declaration/${declarationId}`);
  }
  updateEspece(id: number, espece: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, espece);
  }
  deleteEspece(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }




  createTitres(foncier: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/titres`, foncier);
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



 
 getByDeclaration(declarationId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/by-declaration/${declarationId}`);
}

createAutreDette(dette: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/autres-dettes`, dette);
}
updateAutreDette(id: number, dette: any): Observable<any> {
  return this.http.put<any>(`${this.apiUrl}/${id}`, dette);
}
deleteAutreDette(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/${id}`);
}




  getDisponibilitesByDeclaration(declarationId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/disponibilites-en-banque/by-declaration/${declarationId}`);
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
}