import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Invoice } from '../../shared/models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:5002/api/invoices';

  getInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Erro ao buscar notas:', error);
        return throwError(() => new Error('Falha na comunicação com o serviço de faturamento'));
      })
    );
  }

  createInvoice(productIds: number[]): Observable<Invoice> {
    return this.http.post<Invoice>(this.apiUrl, productIds);
  }

  printInvoice(id: number): Observable<{ message: string; invoice: Invoice }> {
    return this.http.post<{ message: string; invoice: Invoice }>(
      `${this.apiUrl}/${id}/print`, 
      {}
    );
  }
}