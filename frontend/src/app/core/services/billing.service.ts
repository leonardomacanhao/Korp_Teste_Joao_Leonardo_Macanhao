import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BillingService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5002/api/invoices';

  getInvoices(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      catchError(err => throwError(() => new Error('Falha ao carregar notas fiscais')))
    );
  }

  createInvoice(items: any[]): Observable<any> {
    return this.http.post<any>(this.apiUrl, items).pipe(
      catchError(err => throwError(() => new Error('Erro ao criar nota fiscal')))
    );
  }

deleteInvoice(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
    catchError((err: any) => {
      console.error('❌ Erro ao excluir NF:', err);
      const msg = err.error?.message || 'Erro ao excluir nota fiscal';
      return throwError(() => new Error(msg));
    })
  );
}

  printInvoice(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/print`, {}).pipe(
      catchError(err => {
        const msg = err.status === 502 
          ? '❌ Falha na integração com estoque. Verifique se o Stock Service está rodando.' 
          : 'Erro ao imprimir nota.';
        return throwError(() => new Error(msg));
      })
    );
  }
}