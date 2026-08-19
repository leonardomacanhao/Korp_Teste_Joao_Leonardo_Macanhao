import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { BillingService } from '../../../core/services/billing.service';
import { Invoice } from '../../../shared/models/invoice.model';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatProgressBarModule, MatSnackBarModule, RouterLink
  ],
  templateUrl: './invoice-list.component.html',
  styleUrl: './invoice-list.component.scss'
})
export class InvoiceListComponent implements OnInit {
  private billingService = inject(BillingService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  dataSource = new MatTableDataSource<Invoice>();
  displayedColumns = ['number', 'createdAt', 'status', 'actions'];
  loading = false;
  error: string | null = null;

  ngOnInit(): void { this.loadInvoices(); }

  loadInvoices(): void {
    this.loading = true;
    this.error = null;
    this.billingService.getInvoices().subscribe({
      next: (data: Invoice[]) => { this.dataSource.data = data; this.loading = false; },
      error: (err) => { 
        this.error = 'Não foi possível carregar as notas fiscais.';
        this.snackBar.open(this.error, 'Fechar', { duration: 3000 }); 
        this.loading = false; 
      }
    });
  }

  printInvoice(invoice: Invoice): void {
    if (invoice.status === 'Fechada') {
      this.snackBar.open('Esta nota já foi impressa/fechada.', 'Fechar', { duration: 3000 });
      return;
    }

    this.snackBar.open('Processando impressão e baixa no estoque...', 'Aguarde', { duration: 4000 });

    this.billingService.printInvoice(invoice.id).subscribe({
      next: (res) => {
        this.snackBar.open(res.message || '✅ Nota impressa com sucesso!', 'Fechar', { duration: 3000 });
        this.loadInvoices();
      },
      error: (err) => {
        this.snackBar.open(err.message, 'Fechar', { duration: 5000, panelClass: 'error-snack' });
      }
    });
  }

  deleteInvoice(invoice: Invoice): void {
    if (invoice.status === 'Fechada') {
      this.snackBar.open('Não é possível excluir uma nota já fechada.', 'Fechar', { duration: 3000 });
      return;
    }

    if (confirm(`Tem certeza que deseja excluir a NF ${invoice.number}?`)) {
      this.billingService.deleteInvoice(invoice.id).subscribe({
        next: () => {
          this.snackBar.open('Nota excluída com sucesso.', 'Fechar', { duration: 2500 });
          this.loadInvoices();
        },
        error: (err) => {
          this.snackBar.open(err.message || 'Erro ao excluir nota.', 'Fechar', { duration: 4000 });
        }
      });
    }
  }

  

  goToCreate(): void { this.router.navigate(['/invoices/new']); }
}