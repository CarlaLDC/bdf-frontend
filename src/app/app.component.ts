import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { HomeComponent } from './components/home/home.component';
import { FilterComponent } from './components/filter/filter.component';
import { FooterComponent } from './components/footer/footer.component';
import { ProdutosComponent } from './components/produtos/produtos.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    HomeComponent,
    FilterComponent,
    FooterComponent,
    ProdutosComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'bdf-frontend';

  publicoSelecionado: string | null = null;
  tipoSelecionado: string | null = null;
  nomeBusca: string = '';

  onPublicoChange(publico: string | null) {
    this.publicoSelecionado = publico;
  }

  onTipoChange(tipo: string | null) {
    this.tipoSelecionado = tipo;
  }

  onBuscarChange(nome: string) {
    this.nomeBusca = nome;
  }

  onLimpar() {
    this.publicoSelecionado = null;
    this.tipoSelecionado = null;
    this.nomeBusca = '';
  }
}
