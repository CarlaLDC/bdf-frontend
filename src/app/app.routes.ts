import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AdicionarProdutoComponent } from './components/adicionar-produto/adicionar-produto.component';
import { EditarProdutoComponent } from './components/editar-produto/editar-produto.component';
import { GerenciarProdutoComponent } from './components/gerenciar-produto/gerenciar-produto.component';
import { ProdutosComponent } from './components/produtos/produtos.component';
import { ProdutoDetalheComponent } from './components/detalhe-produto/detalhe-produto.component';
import { SobreNos } from './components/sobre-nos/sobre-nos';
import { PerfilCliente } from './components/perfil-cliente/perfil-cliente';
import { PerfilAdmin } from './components/perfil-admin/perfil-admin.component';
import { Login } from './components/login/login';
import { CadastrosComponent } from './components/cadastros/cadastros.component';
import { MinhasReservasComponent } from './components/minhas-reservas/minhas-reservas.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'adicionar-produto', component: AdicionarProdutoComponent },
  { path: 'editar-produto/:id', component: EditarProdutoComponent },
  { path: 'gerenciar-produto', component: GerenciarProdutoComponent },
  { path: 'produtos', component: ProdutosComponent },
  { path: 'produto/:id', component: ProdutoDetalheComponent },
  { path: 'sobre-nos', component: SobreNos },
  { path: 'perfil-cliente', component: PerfilCliente },
  { path: 'perfil-admin', component: PerfilAdmin },
  { path: 'login', component: Login },
  { path: 'cadastros', component: CadastrosComponent },
  { path: 'minhas-reservas', component: MinhasReservasComponent },
  { path: '**', redirectTo: '' }
];
