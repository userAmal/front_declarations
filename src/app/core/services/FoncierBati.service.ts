import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FoncierBati } from '../models/foncierBati';

@Injectable({
  providedIn: 'root',
})
export class FoncierBatiService {
  private apiUrl = 'http://localhost:8084/api/foncier-bati'; // Ensure this matches your backend URL

  constructor(private http: HttpClient) {}

  getAll(): Observable<FoncierBati[]> {
    return this.http.get<FoncierBati[]>(this.apiUrl);
  }

  add(foncier: FoncierBati): Observable<FoncierBati> {
    return this.http.post<FoncierBati>(this.apiUrl, {
      id: foncier.id,
      nature: foncier.nature,
      anneeConstruction: foncier.anneeConstruction,
      modeAcquisition: foncier.modeAcquisition,
      referencesCadastrales: foncier.referencesCadastrales,
      superficie: foncier.superficie,
      localis: foncier.localis,
      typeUsage: foncier.typeUsage,
      coutAcquisitionFCFA: foncier.coutAcquisitionFCFA,
      coutInvestissements: foncier.coutInvestissements,
      dateCreation: foncier.dateCreation,
      isSynthese: foncier.isSynthese,
      idDeclaration: foncier.idDeclaration
    });
  }

  update(foncier: FoncierBati): Observable<FoncierBati> {
    return this.http.put<FoncierBati>(`${this.apiUrl}/${foncier.id}`, {
      id: foncier.id,
      nature: foncier.nature,
      anneeConstruction: foncier.anneeConstruction,
      modeAcquisition: foncier.modeAcquisition,
      referencesCadastrales: foncier.referencesCadastrales,
      superficie: foncier.superficie,
      localis: foncier.localis,
      typeUsage: foncier.typeUsage,
      coutAcquisitionFCFA: foncier.coutAcquisitionFCFA,
      coutInvestissements: foncier.coutInvestissements,
      dateCreation: foncier.dateCreation,
      isSynthese: foncier.isSynthese,
      idDeclaration: foncier.idDeclaration
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}