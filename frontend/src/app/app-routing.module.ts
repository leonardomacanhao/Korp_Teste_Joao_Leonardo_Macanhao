import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  // 1. Redireciona a raiz para home
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  
  // 2. Rota da Home (seu módulo existente)
  { 
    path: 'home', 
    loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule)
  },
  
  // 3. Rota de Produtos (ADICIONEI ESTE BLOCO AQUI)
  {
    path: 'products',
    loadComponent: () => import('./features/products/product-list/product-list.component')
      .then(m => m.ProductListComponent)
  },

  // 4. Rota Coringa (SEMPRE por último, senão ela bloqueia as outras)
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule] // Isso libera o <router-outlet> para funcionar
})
export class AppRoutingModule {}