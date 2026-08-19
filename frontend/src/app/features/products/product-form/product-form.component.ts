import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { StockService } from '../../../core/services/stock.service';
import { Product } from '../../../shared/models/product.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatIconModule
  ],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss'
})
export class ProductFormComponent implements OnInit {

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private stockService = inject(StockService);

  productForm!: FormGroup;
  loading = false;
  carregandoDados = false;
  erroCarregamento: string | null = null;
  isEdit = false;
  productId: number | null = null;

  get f() { return this.productForm.controls; }

  ngOnInit(): void {
    this.buildForm();
    
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.productId = +idParam;
      this.carregarProdutoParaEdicao(this.productId);
    }
  }

  private buildForm(): void {
    this.productForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      description: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      stockBalance: [0, [Validators.required, Validators.min(0), Validators.max(999999)]]
    });
  }

  private carregarProdutoParaEdicao(id: number): void {
    this.carregandoDados = true;
    
    this.stockService.getProductById(id).subscribe({
      next: (product: Product) => {
        this.productForm.patchValue({
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

  onSubmit(event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();

    if (this.productForm.invalid || this.loading || this.carregandoDados) {
      Object.keys(this.productForm.controls).forEach(key => {
        const control = this.productForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.loading = true;

    const payload = {
      code: this.productForm.value.code!,
      description: this.productForm.value.description!,
      stockBalance: Number(this.productForm.value.stockBalance)
    };

    console.log('📤 Enviando:', payload);

    const request$ = this.isEdit && this.productId
      ? this.stockService.updateProduct(this.productId, payload)
      : this.stockService.createProduct(payload);

    request$.subscribe({
      next: (res) => {
        const msg = this.isEdit ? 'Produto atualizado!' : 'Produto cadastrado!';
        this.snackBar.open(msg, 'Fechar', { duration: 2500, panelClass: 'success-snack' });
        this.router.navigate(['/products']);
      },
      error: (err) => {
        console.error('❌ Erro:', err);
        this.snackBar.open('Erro ao salvar. Verifique o backend.', 'Fechar', { 
          duration: 4000, 
          panelClass: 'error-snack' 
        });
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/products']);
  }

  increaseStock(): void {
    const ctl = this.productForm.get('stockBalance');
    const cur = Number(ctl?.value) || 0;
    const next = Math.min(cur + 1, 999999);
    ctl?.setValue(next);
  }

  decreaseStock(): void {
    const ctl = this.productForm.get('stockBalance');
    const cur = Number(ctl?.value) || 0;
    const next = Math.max(cur - 1, 0);
    ctl?.setValue(next);
  }

  onStockInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    let v = target.value.replace(/[^0-9]/g, '');
    if (v === '') v = '0';
    let n = parseInt(v, 10);
    if (isNaN(n)) n = 0;
    n = Math.max(0, Math.min(999999, n));
    this.productForm.get('stockBalance')?.setValue(n);
  }

  onlyInteger(event: KeyboardEvent): void {
    const allowed = ['Backspace','ArrowLeft','ArrowRight','Tab','Delete','Home','End'];
    if (allowed.includes(event.key)) return;
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }

}

