import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  template: `
    <div class="access-denied-container">
      <div class="access-denied-content">
        <div class="icon-container">
          <i class="pi pi-ban" style="font-size: 4rem; color: #e74c3c;"></i>
        </div>
        
        <h1 class="title">Accès non autorisé</h1>
        
        <div class="message-container">
          <p class="main-message">L'accès n'est pas autorisé pour ce site</p>
          
          <div class="detailed-message" *ngIf="errorMessage">
            <p>{{ errorMessage }}</p>
          </div>
          
          <div class="info-message">
            <p *ngIf="isExpired">
              <i class="pi pi-clock"></i>
              Votre lien d'accès a expiré ou est invalide.
            </p>
            
            <p *ngIf="isAlreadySubmitted">
              <i class="pi pi-check-circle"></i>
              Cette déclaration a déjà été soumise.
            </p>
            
            <p *ngIf="!isExpired && !isAlreadySubmitted">
              <i class="pi pi-info-circle"></i>
              Veuillez vérifier le lien dans votre email ou contacter l'administrateur.
            </p>
          </div>
        </div>
        
       
      </div>
    </div>
  `,
  styles: [`
    .access-denied-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 20px;
    }
    
    .access-denied-content {
      background: white;
      border-radius: 12px;
      padding: 40px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      max-width: 500px;
      width: 100%;
    }
    
    .icon-container {
      margin-bottom: 20px;
    }
    
    .title {
      color: #2c3e50;
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 20px;
    }
    
    .message-container {
      margin-bottom: 30px;
    }
    
    .main-message {
      font-size: 1.2rem;
      color: #e74c3c;
      font-weight: 500;
      margin-bottom: 15px;
    }
    
    .detailed-message {
      background: #f8f9fa;
      border-left: 4px solid #e74c3c;
      padding: 12px 16px;
      margin: 15px 0;
      border-radius: 4px;
    }
    
    .detailed-message p {
      margin: 0;
      color: #6c757d;
      font-size: 0.95rem;
    }
    
    .info-message {
      margin-top: 20px;
    }
    
    .info-message p {
      color: #6c757d;
      font-size: 0.9rem;
      margin: 8px 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    
    .actions {
      margin-top: 30px;
    }
    
    .p-button-outlined {
      border-color: #007bff;
      color: #007bff;
    }
    
    .p-button-outlined:hover {
      background-color: #007bff;
      color: white;
    }
  `]
})
export class AccessDeniedComponent implements OnInit {
  errorMessage: string = '';
  isExpired: boolean = false;
  isAlreadySubmitted: boolean = false;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.errorMessage = params['message'] || '';
      this.isExpired = params['expired'] === 'true';
      this.isAlreadySubmitted = params['alreadySubmitted'] === 'true';
    });
  }


}