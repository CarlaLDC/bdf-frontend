import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AdicionarProdutoComponent } from './components/adicionar-produto/adicionar-produto.component';
import { GerenciarProdutoComponent } from './components/gerenciar-produto/gerenciar-produto.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'adicionar-produto', component: AdicionarProdutoComponent },
  { path: 'gerenciar-produto', component: GerenciarProdutoComponent },
  { path: '**', redirectTo: '' }
];
 
