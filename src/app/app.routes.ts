import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AdicionarProdutoComponent } from './components/adicionar-produto/adicionar-produto.component';
import { GerenciarProdutoComponent } from './components/gerenciar-produto/gerenciar-produto.component';
import { SobreNos } from './components/sobre-nos/sobre-nos';
import { PerfilCliente } from './components/perfil-cliente/perfil-cliente';
import { PerfilAdmin } from './components/perfil-admin/perfil-admin.component';
import { Login } from './components/login/login';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'adicionar-produto', component: AdicionarProdutoComponent },
  { path: 'gerenciar-produto', component: GerenciarProdutoComponent },
  { path: 'sobre-nos', component: SobreNos },
  { path: 'perfil-cliente', component: PerfilCliente },
  { path: 'perfil-admin', component: PerfilAdmin },
  { path: 'login', component: Login },
  { path: '**', redirectTo: '' }
];