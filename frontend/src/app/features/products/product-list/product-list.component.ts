import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { catchError, finalize, Observable, throwError } from 'rxjs';

// ✅ CAMINHOS CORRIGIDOS (3 níveis para subir até 'app')
import { Product } from '../../../shared/models/product.model';
import { StockService } from '../../../core/services/stock.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule,
    RouterLink
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {
  // 💉 Injeção de dependências
  private stockService = inject(StockService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  // 📊 Dados da tabela
  dataSource = new MatTableDataSource<Product>();
  displayedColumns: string[] = ['code', 'description', 'stockBalance', 'actions'];

  // 🔄 Estado
  loading = false;
  error: string | null = null;

  // 🎯 Ciclo de vida
  ngOnInit(): void {
    this.loadProducts();
  }

  // 📥 Carregar produtos (filtrando inativos)
  loadProducts(): void {
    this.loading = true;
    this.error = null;

    this.stockService.getProducts().pipe(
      catchError((err) => {
        this.error = 'Não foi possível carregar os produtos.';
        this.snackBar.open(this.error, 'Fechar', { duration: 5000 });
        return throwError(() => err);
      }),
      finalize(() => { this.loading = false; })
    ).subscribe({
      next: (products) => {
        // Filtra produtos com código que NÃO começa com [INATIVO]
        this.dataSource.data = products.filter(p => !p.code?.startsWith('[INATIVO]'));
      }
    });
  }

  // 🔍 Helper para o template (evita erro de strict mode no HTML)
  isProdutoInativo(code: string | null | undefined): boolean {
    return code != null && code.includes('[INATIVO]');
  }

  // ➕ Navegar para criação
  goToCreate(): void {
    this.router.navigate(['/products/new']);
  }

  // 🗑️ Soft delete: confirma e inativa
  confirmDelete(product: Product): void {
    if (confirm(`Deseja realmente inativar "${product.description}"?`)) {
      this.stockService.deleteProduct(product.id).subscribe({
        next: () => {
          this.snackBar.open('Produto inativado.', 'Fechar', { duration: 2500 });
          this.loadProducts(); // Recarrega a lista
        },
        error: () => {
          this.snackBar.open('Erro ao inativar produto.', 'Fechar', { duration: 4000 });
        }
      });
    }
  }
}