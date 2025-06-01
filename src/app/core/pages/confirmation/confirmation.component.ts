import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-confirmation',
  template: `
    <div class="confirmation-container">
      <div class="confirmation-content">
        <div class="success-icon">
          <i class="pi pi-check-circle" style="font-size: 4rem; color: #28a745;"></i>
        </div>
        
        <h1 class="title">Merci pour votre déclaration</h1>
        
        <div class="message-section">
          <div class="success-message">
            <p class="main-text">Votre déclaration a bien été enregistrée.</p>
            
            <div class="details">
              <div class="detail-item">
                <i class="pi pi-envelope"></i>
                <span>Un email de confirmation avec votre PDF a été envoyé à votre adresse email.</span>
              </div>
              
              <div class="detail-item">
                <i class="pi pi-file-pdf"></i>
                <span>Votre déclaration PDF est disponible en pièce jointe dans l'email.</span>
              </div>
              
              <div class="detail-item">
                <i class="pi pi-info-circle"></i>
                <span>État de votre déclaration : <strong>En cours</strong></span>
              </div>
            </div>
          </div>
          
          <div class="warning-section">
            <div class="warning-box">
              <i class="pi pi-exclamation-triangle"></i>
              <p><strong>Important :</strong> Votre lien d'accès a maintenant expiré. 
              Vous ne pourrez plus accéder au formulaire de déclaration.</p>
            </div>
          </div>
        </div>
        
        
        
        <div class="additional-info" *ngIf="declarationDetails">
          <hr>
          <div class="info-grid">
            <div class="info-item">
              <label>ID Déclaration:</label>
              <span>{{ declarationDetails.declarationId }}</span>
            </div>
            <div class="info-item" *ngIf="declarationDetails.pdfGenerated">
              <label>PDF généré:</label>
              <span class="success-text">
                <i class="pi pi-check"></i> Oui
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .confirmation-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #e8f5e8 0%, #f0fff0 100%);
      padding: 20px;
    }
    
    .confirmation-content {
      background: white;
      border-radius: 16px;
      padding: 40px;
      text-align: center;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
      max-width: 600px;
      width: 100%;
      border: 2px solid #d4edda;
    }
    
    .success-icon {
      margin-bottom: 20px;
      animation: bounceIn 1s ease-in-out;
    }
    
    @keyframes bounceIn {
      0% { transform: scale(0); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
    
    .title {
      color: #155724;
      font-size: 2.2rem;
      font-weight: 700;
      margin-bottom: 25px;
      font-family: 'Arial', sans-serif;
    }
    
    .message-section {
      margin-bottom: 30px;
    }
    
    .success-message {
      margin-bottom: 25px;
    }
    
    .main-text {
      font-size: 1.3rem;
      color: #28a745;
      font-weight: 600;
      margin-bottom: 20px;
    }
    
    .details {
      text-align: left;
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    
    .detail-item {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      padding: 8px;
      border-radius: 4px;
      transition: background-color 0.3s ease;
    }
    
    .detail-item:hover {
      background-color: #e9ecef;
    }
    
    .detail-item:last-child {
      margin-bottom: 0;
    }
    
    .detail-item i {
      color: #28a745;
      margin-right: 12px;
      font-size: 1.1rem;
      min-width: 20px;
    }
    
    .detail-item span {
      color: #495057;
      font-size: 0.95rem;
      line-height: 1.4;
    }
    
    .warning-section {
      margin-top: 25px;
    }
    
    .warning-box {
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 8px;
      padding: 15px;
      display: flex;
      align-items: flex-start;
      gap: 10px;
    }
    
    .warning-box i {
      color: #856404;
      font-size: 1.2rem;
      margin-top: 2px;
    }
    
    .warning-box p {
      color: #856404;
      margin: 0;
      font-size: 0.9rem;
      text-align: left;
    }
    
    .actions {
      margin-top: 30px;
    }
    
    .p-button-success {
      background-color: #28a745;
      border-color: #28a745;
      padding: 12px 30px;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 8px;
      transition: all 0.3s ease;
    }
    
    .p-button-success:hover {
      background-color: #218838;
      border-color: #1e7e34;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
    }
    
    .additional-info {
      margin-top: 25px;
      text-align: left;
    }
    
    .additional-info hr {
      border: none;
      height: 1px;
      background: #e9ecef;
      margin: 20px 0;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }
    
    .info-item {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    
    .info-item label {
      font-weight: 600;
      color: #495057;
      font-size: 0.9rem;
    }
    
    .info-item span {
      color: #6c757d;
      font-size: 0.95rem;
    }
    
    .success-text {
      color: #28a745 !important;
      font-weight: 600;
    }
    
    .success-text i {
      margin-right: 5px;
    }
    
    @media (max-width: 768px) {
      .confirmation-content {
        padding: 30px 20px;
      }
      
      .title {
        font-size: 1.8rem;
      }
      
      .info-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ConfirmationComponent implements OnInit {
  declarationDetails: any = null;

  constructor(private router: Router) {
    // Récupérer les détails passés via la navigation
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.declarationDetails = navigation.extras.state;
    }
  }

  ngOnInit() {
    // Nettoyer le token du sessionStorage si présent
    sessionStorage.removeItem('declarationToken');
  }

}