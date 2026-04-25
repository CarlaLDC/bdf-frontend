import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { HeaderComponent } from './components/header/header.component';
import { FilterComponent } from './components/filter/filter.component';
import { ProdutosComponent } from './components/produtos/produtos.component';
import { FooterComponent } from './components/footer/footer.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: '', component: HeaderComponent},
    { path: 'filter', component: FilterComponent },
    { path: 'produtos', component: ProdutosComponent },
    { path: '', component: FooterComponent}
];
 