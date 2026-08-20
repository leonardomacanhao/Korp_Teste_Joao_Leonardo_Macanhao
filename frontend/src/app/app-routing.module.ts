import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  {
    path: 'home',
    loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'products',
    loadComponent: () => import('./features/products/product-list/product-list.component')
      .then(m => m.ProductListComponent)
  },

  {
    path: 'products/new',
    loadComponent: () => import('./features/products/product-form/product-form.component')
      .then(m => m.ProductFormComponent)
  },

  {
    path: 'products/edit/:id',
    loadComponent: () => import('./features/products/product-form/product-form.component')
      .then(m => m.ProductFormComponent)
  },

  {
    path: 'invoices',
    loadComponent: () => import('./features/invoices/invoice-list/invoice-list.component')
      .then(m => m.InvoiceListComponent)
  },
  {
    path: 'invoices/new',
    loadComponent: () => import('./features/invoices/invoice-form/invoice-form.component')
      .then(m => m.InvoiceFormComponent)
  },
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
