import { Component, OnInit } from '@angular/core';
import { ProdutoServices } from '../../services/produto/produto.component';
import { CommonModule } from '@angular/common';
 
@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './produtos.component.html',
  styleUrl: './produtos.component.css'
})
export class ProdutosComponent implements OnInit {
  produtos: any[] = [];
  loading = false;
 
  // Filtros
  publicoSelecionado: string | null = null;
  tipoSelecionado: string | null = null;
  nomeBusca: string = '';
 
  constructor(private ProdutoServices: ProdutoServices) {}
 
  ngOnInit() {
    this.carregarProdutos();
  }
 
  carregarProdutos() {
    this.loading = true;
    
    this.ProdutoServices.getProducts(
      this.publicoSelecionado || undefined,
      this.tipoSelecionado || undefined,
      this.nomeBusca || undefined
    ).subscribe({
      next: (response) => {
        this.produtos = response.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar produtos:', error);
        this.loading = false;
      }
    });
  }
 
  filtrarPorPublico(publico: string | null) {
    this.publicoSelecionado = publico;
    this.carregarProdutos();
  }
 
  filtrarPorTipo(tipo: string | null) {
    this.tipoSelecionado = tipo;
    this.carregarProdutos();
  }
 
  buscar(nome: string) {
    this.nomeBusca = nome;
    this.carregarProdutos();
  }
 
  limparFiltros() {
    this.publicoSelecionado = null;
    this.tipoSelecionado = null;
    this.nomeBusca = '';
    this.carregarProdutos();
  }
}
 