import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Product } from '../../shared/models/product.model';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:5001/api/products';

  getProducts(): Observable<Product[]> {
    // RxJS: Observable + catchError
    return this.http.get<Product[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Erro ao buscar produtos:', error);
        return throwError(() => new Error('Falha na comunicação com o serviço de estoque'));
      })
    );
  }

  createProduct(product: Omit<Product, 'id'>): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  updateStock(id: number, newBalance: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, newBalance);
  }
}