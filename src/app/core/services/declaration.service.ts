import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

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
    // Extract token from query parameters with hash-based routing
    let token: string | null = null;
    
    // First try the URL query params (for direct links)
    token = new URLSearchParams(window.location.search).get("token");
    
    // If not found, try to get it from the route params/queryParams (for hash-based routing)
    if (!token) {
      // Get the full URL after the hash
      const hashFragment = window.location.hash;
      const queryIndex = hashFragment.indexOf('?');
      
      if (queryIndex !== -1) {
        // Extract the query string from the hash fragment
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

  // Méthode pour récupérer les détails de la déclaration par ID
  getDeclarationDetails(declarationId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/declarations/${declarationId}`);
  }
}