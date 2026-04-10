import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
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
