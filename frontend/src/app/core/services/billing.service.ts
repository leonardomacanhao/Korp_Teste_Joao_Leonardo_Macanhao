import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Invoice } from '../../shared/models/invoice.model';

interface PrintInvoiceResponse {
  message: string;
  invoice: Invoice;
}

@Injectable({ providedIn: 'root' })
export class BillingService {
  private http = inject(HttpClient);
  private apiUrl = environment.api.billing;

  getInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.apiUrl).pipe(
      catchError(() => throwError(() => new Error('Falha ao carregar notas fiscais')))
    );
  }

  createInvoice(items: Array<{ productId: number; quantity: number }>): Observable<Invoice> {
    return this.http.post<Invoice>(this.apiUrl, items).pipe(
      catchError(() => throwError(() => new Error('Erro ao criar nota fiscal')))
    );
  }

deleteInvoice(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
    catchError((err: HttpErrorResponse) => {
      const msg = err.error?.message || 'Erro ao excluir nota fiscal';
      return throwError(() => new Error(msg));
    })
  );
}

  printInvoice(id: number): Observable<PrintInvoiceResponse> {
    return this.http.post<PrintInvoiceResponse>(`${this.apiUrl}/${id}/print`, {}).pipe(
      catchError((err: HttpErrorResponse) => {
        const msg = err.status === 502 
          ? '❌ Falha na integração com estoque. Verifique se o Stock Service está rodando.' 
          : 'Erro ao imprimir nota.';
        return throwError(() => new Error(msg));
      })
    );
  }
}
