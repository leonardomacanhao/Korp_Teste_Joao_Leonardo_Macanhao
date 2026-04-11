import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { catchError, finalize, Observable, throwError } from 'rxjs';

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
  // 💡 Injeção de dependências (Angular 14+)
  private stockService = inject(StockService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  // 📊 Dados da tabela
  dataSource = new MatTableDataSource<Product>();
  displayedColumns: string[] = ['code', 'description', 'stockBalance', 'actions'];

  // 🔄 Estados da interface
  loading = false;
  error: string | null = null;

  // 🎯 Ciclo de vida do Angular: ngOnInit
  // Executado UMA VEZ quando o componente é inicializado
  ngOnInit(): void {
    this.loadProducts();
  }

  // 📥 Método para carregar produtos do backend
  loadProducts(): void {
    this.loading = true;
    this.error = null;

    // 💡 RxJS: Observable + pipe + catchError + finalize
    this.stockService.getProducts().pipe(
      // Se der erro, capturamos e transformamos em mensagem amigável
      catchError((err) => {
        this.error = 'Não foi possível carregar os produtos. Verifique se o backend está rodando.';
        this.snackBar.open(this.error, 'Fechar', { duration: 5000, panelClass: 'error-snack' });
        return throwError(() => err);
      }),
      // finalize: executa SEMPRE, seja sucesso ou erro (ótimo para esconder loading)
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: (products) => {
        this.dataSource.data = products;
        this.snackBar.open('Produtos carregados com sucesso!', 'Fechar', { duration: 3000 });
      }
      // O erro já foi tratado no catchError acima
    });
  }

  // ➕ Navegar para tela de cadastro
  goToCreate(): void {
    this.router.navigate(['/products/new']);
  }

  // ✏️ (Opcional) Editar produto - pode implementar depois
  editProduct(product: Product): void {
    this.router.navigate(['/products/edit', product.id]);
  }
}