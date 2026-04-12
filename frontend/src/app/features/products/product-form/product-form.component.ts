import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { StockService } from '../../../core/services/stock.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div style="padding:20px; max-width:500px; margin:0 auto;">
      <h2>{{ isEdit ? '✏️ Editar Produto' : '➕ Novo Produto' }}</h2>
      
      <form [formGroup]="form" (ngSubmit)="salvar($event)" style="display:flex; flex-direction:column; gap:15px;">
        
        <!-- Código -->
        <input formControlName="code" placeholder="Código *" 
               style="padding:10px; border:1px solid #ccc; border-radius:4px;">
        <div *ngIf="form.get('code')?.invalid && form.get('code')?.touched" style="color:red; font-size:12px;">
          Código é obrigatório (mín. 3 caracteres)
        </div>

        
        <!-- Descrição -->
        <input formControlName="description" placeholder="Descrição *" 
               style="padding:10px; border:1px solid #ccc; border-radius:4px;">
        <div *ngIf="form.get('description')?.invalid && form.get('description')?.touched" style="color:red; font-size:12px;">
          Descrição é obrigatória (mín. 5 caracteres)
        </div>

        <!-- Saldo -->
        <input formControlName="stockBalance" type="number" placeholder="Saldo *" 
               style="padding:10px; border:1px solid #ccc; border-radius:4px;">
        <div *ngIf="form.get('stockBalance')?.invalid && form.get('stockBalance')?.touched" style="color:red; font-size:12px;">
          Saldo é obrigatório e não pode ser negativo
        </div>

        <!-- Botão Salvar -->
        <button type="submit" [disabled]="form.invalid || loading || carregandoDados" 
                style="padding:12px; background:#2196F3; color:white; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">
          {{ loading ? 'Salvando...' : (isEdit ? '💾 Atualizar' : '💾 Salvar Produto') }}
        </button>
      </form>

      <!-- Botão Voltar -->
      <button (click)="voltar()" style="margin-top:15px; background:none; border:none; color:#666; cursor:pointer;">
        ← Voltar para lista
      </button>
      
      <!-- Mensagens de estado -->
      <div *ngIf="carregandoDados" style="margin-top:10px; color:#666;">Carregando dados...</div>
      <div *ngIf="erroCarregamento" style="margin-top:10px; color:red;">{{ erroCarregamento }}</div>
    </div>
  `
})
export class ProductFormComponent implements OnInit {
  // 💉 Injeção de dependências (Angular 14+)
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private stockService = inject(StockService);

  // 📝 Estado do componente
  loading = false;
  carregandoDados = false;
  erroCarregamento: string | null = null;
  isEdit = false;
  productId: number | null = null;

  // 📋 Formulário reativo com validações
  form = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(5)]],
    stockBalance: [0, [Validators.required, Validators.min(0)]]
  });

  // 🔄 Ciclo de vida: ngOnInit (requisito do teste!)
  // Executado UMA VEZ ao inicializar o componente
  ngOnInit(): void {
    // Verifica se há ID na rota → modo edição
    const idParam = this.route.snapshot.paramMap.get('id');
    
    if (idParam) {
      this.isEdit = true;
      this.productId = +idParam; // converte string para number
      this.carregarProdutoParaEdicao(this.productId);
    }
  }

  // 📥 Carrega dados do produto (modo edição)
  private carregarProdutoParaEdicao(id: number): void {
    this.carregandoDados = true;
    
    this.stockService.getProductById(id).subscribe({
      next: (product) => {
        // Preenche o formulário com os dados recebidos
        this.form.patchValue({
          code: product.code,
          description: product.description,
          stockBalance: product.stockBalance
        });
        this.carregandoDados = false;
      },
      error: (err) => {
        console.error('Erro ao carregar produto:', err);
        this.erroCarregamento = 'Não foi possível carregar os dados do produto.';
        this.carregandoDados = false;
        this.snackBar.open('Erro ao carregar produto', 'Fechar', { duration: 3000 });
      }
    });
  }

  // 💾 Salvar (criar) ou Atualizar (editar)
  salvar(event: Event): void {
    // 🔥 Previne reload da página (comportamento padrão do HTML)
    event.preventDefault();
    event.stopPropagation();

    // Validações
    if (this.form.invalid || this.loading || this.carregandoDados) return;

    this.loading = true;

    // Monta payload garantindo tipos corretos
    const payload = {
      code: this.form.value.code!,
      description: this.form.value.description!,
      stockBalance: Number(this.form.value.stockBalance)
    };

    console.log('📤 Enviando:', payload);

    // Escolhe a operação baseada no modo (edição ou criação)
    const request$: Observable<any> = this.isEdit && this.productId
      ? this.stockService.updateProduct(this.productId, payload)
      : this.stockService.createProduct(payload);

    // ✅ Casting para Observable<any> resolve erro de tipagem do TypeScript
    request$.subscribe({
      next: (res) => {
        console.log('✅ Sucesso:', res);
        const msg = this.isEdit ? 'Produto atualizado!' : 'Produto cadastrado!';
        this.snackBar.open(msg, 'Fechar', { duration: 2500 });
        this.router.navigate(['/products']);
      },
      error: (err) => {
        console.error('❌ Erro:', err);
        this.snackBar.open('Erro ao salvar. Verifique o backend.', 'Fechar', { duration: 4000 });
        this.loading = false; // libera o botão em caso de erro
      }
    });
  }

  // ↩️ Cancelar e voltar para lista
  voltar(): void {
    this.router.navigate(['/products']);
  }
}