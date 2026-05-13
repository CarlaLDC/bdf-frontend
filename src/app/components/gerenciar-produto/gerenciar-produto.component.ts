import { Component } from '@angular/core';
import { FilterComponent } from '../filter/filter.component';
import { ProdutosComponent } from '../produtos/produtos.component';

@Component({
  selector: 'app-gerenciar-produto',
  standalone: true,
  imports: [FilterComponent, ProdutosComponent],
  templateUrl: './gerenciar-produto.component.html',
  styleUrl: './gerenciar-produto.component.css'
})
export class GerenciarProdutoComponent {
  publicoSelecionado: string | null = null;
  tipoSelecionado: string | null = null;
  nomeBusca = '';

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
