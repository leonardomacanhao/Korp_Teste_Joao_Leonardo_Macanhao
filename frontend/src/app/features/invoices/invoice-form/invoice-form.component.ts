import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { BillingService } from '../../../core/services/billing.service';
import { StockService } from '../../../core/services/stock.service';

import { Product } from '../../../shared/models/product.model';
import { Invoice } from '../../../shared/models/invoice.model';

interface InvoiceItem {
  productId: number;
  quantity: number;
}

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatIconModule
  ],
  templateUrl: './invoice-form.component.html',
  styleUrl: './invoice-form.component.scss'
})
export class InvoiceFormComponent implements OnInit {

  private fb             = inject(FormBuilder);
  private billingService = inject(BillingService);
  private stockService   = inject(StockService);
  private snackBar       = inject(MatSnackBar);
  private router         = inject(Router);

  invoiceForm!: FormGroup;
  products: Product[] = [];
  loading         = false;
  loadingProducts = true;

  get items(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  ngOnInit(): void {
    this.buildForm();
    this.loadProducts();
  }

  private buildForm(): void {
    this.invoiceForm = this.fb.group({
      items: this.fb.array([])
    });
    this.addItem();
  }

  private createItemGroup(): FormGroup {
    return this.fb.group({
      productId: ['', Validators.required],
      quantity:  [1, [Validators.required, Validators.min(1)]]
    });
  }

  addItem(): void {
    this.items.push(this.createItemGroup());
  }

  increaseQty(index: number) {
    const control = this.items.at(index).get('quantity');
    const cur = Math.max(1, Math.floor(Number(control?.value) || 0));
    control?.setValue(cur + 1);
    control?.markAsTouched();
  }

  decreaseQty(index: number) {
    const control = this.items.at(index).get('quantity');
    const cur = Math.max(1, Math.floor(Number(control?.value) || 0));
    control?.setValue(Math.max(1, cur - 1));
    control?.markAsTouched();
  }

  onQuantityInput(event: any, index: number) {
    const raw = event.target.value || '';
    // remove non-digits
    const digits = raw.replace(/[^0-9]/g, '');
    const val = digits === '' ? '' : Math.max(1, parseInt(digits, 10));
    const control = this.items.at(index).get('quantity');
    control?.setValue(val === '' ? '' : val);
  }

  onlyInteger(e: KeyboardEvent) {
    // allow control keys
    const allowed = ['Backspace','ArrowLeft','ArrowRight','Tab','Delete','Home','End'];
    if (allowed.includes(e.key)) return;
    if (!/^[0-9]$/.test(e.key)) e.preventDefault();
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  private loadProducts(): void {
    this.stockService.getProducts().subscribe({
      next: (data: Product[]) => {
        this.products = data.filter((p) => p.isActive !== false);
        this.loadingProducts = false;
      },
      error: () => {
        this.snackBar.open('Erro ao carregar produtos', 'Fechar', { duration: 3000 });
        this.loadingProducts = false;
      }
    });
  }

  onSubmit(): void {
    if (this.invoiceForm.invalid) {
      this.invoiceForm.markAllAsTouched();
      this.snackBar.open('Preencha todos os campos obrigatórios', 'Fechar', { duration: 3000 });
      return;
    }

    const items: InvoiceItem[] = this.items.value;

    const stockError = this.validateStock(items);
    if (stockError) {
      this.snackBar.open(stockError, 'Fechar', {
        duration: 6000,
        panelClass: 'error-snack'
      });
      return;
    }

    this.loading = true;

    const payload = items.map((i) => ({
      productId: +i.productId,
      quantity:  +i.quantity
    }));

    this.billingService.createInvoice(payload).subscribe({
      next: (res: Invoice) => {
        this.snackBar.open(`NF ${res.number} criada com sucesso!`, 'Fechar', { duration: 3000 });
        setTimeout(() => this.router.navigate(['/invoices']), 1500);
      },
      error: (err) => {
        this.snackBar.open(err?.message || 'Erro ao criar nota fiscal', 'Fechar', { duration: 5000 });
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/invoices']);
  }

  private validateStock(items: InvoiceItem[]): string | null {
    const totalByProduct: Record<number, number> = {};

    for (const item of items) {
      totalByProduct[item.productId] =
        (totalByProduct[item.productId] || 0) + +item.quantity;
    }

    for (const [prodId, totalQty] of Object.entries(totalByProduct)) {
      const product = this.products.find((p) => p.id === +prodId);
      if (product && totalQty > product.stockBalance) {
        return (
          `Saldo insuficiente para "${product.description}". ` +
          `Disponível: ${product.stockBalance}, Solicitado: ${totalQty}`
        );
      }
    }

    return null;
  }
}
