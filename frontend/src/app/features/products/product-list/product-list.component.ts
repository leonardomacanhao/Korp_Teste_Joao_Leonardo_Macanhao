import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { EMPTY, catchError, finalize } from 'rxjs';

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
  private stockService = inject(StockService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  dataSource = new MatTableDataSource<Product>();
  loading = false;
  error: string | null = null;

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;

    this.stockService.getProducts().pipe(
      catchError(() => {
        this.error = 'Não foi possível carregar os produtos.';
        this.snackBar.open(this.error, 'Fechar', { duration: 5000 });
        return EMPTY;
      }),
      finalize(() => { this.loading = false; })
    ).subscribe({
      next: (products) => {
        this.dataSource.data = products.filter(p => p.isActive !== false);
      }
    });
  }

  goToCreate(): void {
    this.router.navigate(['/products/new']);
  }

  confirmDelete(product: Product): void {
    if (confirm(`Deseja realmente inativar "${product.description}"?`)) {
      this.stockService.deleteProduct(product.id).subscribe({
        next: () => {
          this.snackBar.open('Produto inativado.', 'Fechar', { duration: 2500 });
          this.loadProducts();
        },
        error: () => {
          this.snackBar.open('Erro ao inativar produto.', 'Fechar', { duration: 4000 });
        }
      });
    }
  }
}
