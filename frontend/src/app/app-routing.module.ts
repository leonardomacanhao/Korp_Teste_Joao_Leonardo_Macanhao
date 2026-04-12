import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  // 1. Redireciona a raiz para home
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // 2. Rota da Home (módulo existente)
  { 
    path: 'home', 
    loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule)
  },

  // 3. Rota de Produtos - Lista (standalone component)
  {
    path: 'products',
    loadComponent: () => import('./features/products/product-list/product-list.component')
      .then(m => m.ProductListComponent)
  },

  // 4. Rota de Produtos - Novo (standalone component)
  {
    path: 'products/new',
    loadComponent: () => import('./features/products/product-form/product-form.component')
      .then(m => m.ProductFormComponent)
  },

  // 5. Rota de Produtos - Editar (standalone component)
  {
    path: 'products/edit/:id',
    loadComponent: () => import('./features/products/product-form/product-form.component')
      .then(m => m.ProductFormComponent)
  },

  // 6. Rota Coringa - SEMPRE por último (senão bloqueia todas as outras)
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule] // ← ESSENCIAL: libera <router-outlet> e routerLink
})
export class AppRoutingModule {}