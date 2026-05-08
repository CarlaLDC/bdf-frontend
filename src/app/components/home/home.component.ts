import { Component } from '@angular/core';
import { FilterComponent } from '../filter/filter.component';
import { ProdutosComponent } from '../produtos/produtos.component';

@Component({
  selector: 'app-home',
  imports: [
    FilterComponent,
    ProdutosComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
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
