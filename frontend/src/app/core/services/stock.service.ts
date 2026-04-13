import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Product } from '../../shared/models/product.model';

@Injectable({ providedIn: 'root' })
export class StockService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5083/api/products';

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl).pipe(
      catchError(err => {
        console.error('Erro ao buscar produtos:', err);
        return throwError(() => new Error('Falha na comunicação com o serviço de estoque'));
      })
    );
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`).pipe(
      catchError(err => {
        console.error('Erro ao buscar produto:', err);
        return throwError(() => new Error('Produto não encontrado'));
      })
    );
  }

  createProduct(product: Omit<Product, 'id'>): Observable<any> {
    return this.http.post<any>(this.apiUrl, product).pipe(
      catchError(err => {
        console.error('Erro ao criar produto:', err);
        return throwError(() => new Error('Erro ao criar produto'));
      })
    );
  }

  updateProduct(id: number, product: Partial<Product>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, product).pipe(
      catchError(err => {
        console.error('Erro ao atualizar produto:', err);
        return throwError(() => new Error('Erro ao atualizar produto'));
      })
    );
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(err => {
        console.error('Erro ao excluir produto:', err);
        return throwError(() => new Error('Erro ao excluir produto'));
      })
    );
  }

  deductStock(id: number, quantity: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/deduct`, quantity).pipe(
      catchError(err => {
        console.error('Erro ao debitar estoque:', err);
        return throwError(() => new Error('Erro ao debitar estoque'));
      })
    );
  }
}