import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent {
  // Filtros
  publicoSelecionado: string | null = null;
  tipoSelecionado: string | null = null;
  nomeBusca: string = '';

  @Output() publicoChange = new EventEmitter<string | null>();
  @Output() tipoChange = new EventEmitter<string | null>();
  @Output() buscarChange = new EventEmitter<string>();
  @Output() limpar = new EventEmitter<void>();

  filtrarPorPublico(publico: string | null) {
    this.publicoSelecionado = publico;
    this.publicoChange.emit(publico);
  }

  filtrarPorTipo(tipo: string | null) {
    this.tipoSelecionado = tipo;
    this.tipoChange.emit(tipo);
  }

  buscar(nome: string) {
    this.nomeBusca = nome;
    this.buscarChange.emit(nome);
  }

  limparFiltros() {
    this.publicoSelecionado = null;
    this.tipoSelecionado = null;
    this.nomeBusca = '';
    this.limpar.emit();
  }

}
