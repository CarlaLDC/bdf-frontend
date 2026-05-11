import { Component, OnInit, OnChanges, SimpleChanges, Input } from '@angular/core';
import { ProdutoServices } from '../../services/produto/produto.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
 
@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './produtos.component.html',
  styleUrls: ['./produtos.component.css']
})
export class ProdutosComponent implements OnInit, OnChanges {
  produtos: any[] = [];
  loading = false;
 
  // Filtros
  @Input() publicoSelecionado: string | null = null;
  @Input() tipoSelecionado: string | null = null;
  @Input() nomeBusca: string = '';
 
  constructor(private ProdutoServices: ProdutoServices) {}
 
  ngOnInit() {
    this.carregarProdutos();
  }

  ngOnChanges(changes: SimpleChanges) {
    // When inputs change, reload products
    if (changes['publicoSelecionado'] || changes['tipoSelecionado'] || changes['nomeBusca']) {
      this.carregarProdutos();
    }
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

  imagemProduto(produto: any): string {
    const imagem = produto?.imagemUrl || produto?.imagem;
    if (!imagem) return 'assets/images/castelo.png';
    if (imagem.startsWith('http') || imagem.startsWith('assets/') || imagem.startsWith('data:')) return imagem;
    return `assets/images/${imagem}`;
  }
}
 
