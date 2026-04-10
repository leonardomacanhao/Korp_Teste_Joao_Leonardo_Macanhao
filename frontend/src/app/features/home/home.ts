import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule],
  template: `
    <div class="home-container">
      <h1>TESTE DE ROTA FUNCIONANDO</h1>
      <h2>🚀 Bem-vindo ao Sistema Korp</h2>
      <p>Selecione uma opção no menu superior:</p>
      <div class="cards">
        <div class="card">
          <h3>📦 Produtos</h3>
          <p>Gerencie o cadastro de produtos e estoques.</p>
          <a routerLink="/products" mat-button>Ir para Produtos</a>
        </div>
        <div class="card">
          <h3>🧾 Notas Fiscais</h3>
          <p>Crie e imprima notas fiscais com controle de status.</p>
          <a routerLink="/invoices" mat-button>Ir para Notas</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      text-align: center;
      padding: 40px 20px;
    }
    .cards {
      display: flex;
      gap: 24px;
      justify-content: center;
      margin-top: 32px;
      flex-wrap: wrap;
    }
    .card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 24px;
      max-width: 300px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .card h3 {
      margin: 0 0 12px 0;
      color: #1976d2;
    }
    .card p {
      color: #666;
      margin-bottom: 16px;
    }
    a {
      text-decoration: none;
      color: white;
      background: #1976d2;
      padding: 8px 16px;
      border-radius: 4px;
      display: inline-block;
    }
    a:hover {
      background: #1565c0;
    }
  `]
})
/**
 * HomeComponent implementa OnInit para ciclo de vida
 */
export class HomeComponent implements OnInit {
  /**
   * LIFECYCLE HOOK: ngOnInit
   * 
   * Executado UMA VEZ após o componente ser inicializado.
   * Neste ponto, o componente está pronto e podemos:
   * - Carregar dados via HTTP
   * - Configurar subscriptions
   * - Inicializar valores
   * 
   * ⚠️ NÃO usar no constructor porque:
   * - Constructor é apenas para injetar dependências
   * - ngOnInit é para configurar o componente
   */
  ngOnInit(): void {
    console.log('Home carregada');
  }
}