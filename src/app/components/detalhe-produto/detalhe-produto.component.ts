import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProdutoServices } from '../../services/produto/produto.component';
import { CarrinhoService } from '../../services/carrinho/carrinho.service';

@Component({
  selector: 'app-produto-detalhe',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './detalhe-produto.component.html',
  styleUrls: ['./detalhe-produto.component.css']
})
export class ProdutoDetalheComponent implements OnInit {

  produto: any = null;
  quantidade: number = 1;
  loading = true;
  erro = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private produtoService: ProdutoServices,
    private carrinhoService: CarrinhoService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.produtoService.getProductById(Number(id)).subscribe({
        next: (res: any) => {
          this.produto = res.data;
          this.loading = false;
        },
        error: () => {
          this.erro = 'Produto não encontrado.';
          this.loading = false;
        }
      });
    }
  }

  aumentar() {
    if (this.quantidade < this.produto.estoque) {
      this.quantidade++;
    }
  }

  diminuir() {
    if (this.quantidade > 1) {
      this.quantidade--;
    }
  }


adicionarCarrinho() {
  const token = localStorage.getItem('token');
  if (!token) {
    this.router.navigate(['/login']);
    return;
  }

  this.carrinhoService.adicionar(this.produto, this.quantidade);
}

  reservarAgora() {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Você precisa estar logado para reservar!');
      this.router.navigate(['/login']);
      return;
    }
    this.router.navigate(['/checkout']);
  }

  get itensInclusos(): string[] {
    if (!this.produto?.itensInclusos) return [];
    return this.produto.itensInclusos
      .split(/[,\n]/)
      .map((i: string) => i.trim())
      .filter((i: string) => i.length > 0);
  }

  get precoParcelado(): string {
    if (!this.produto?.preco) return '';
    const parcela = (this.produto.preco / 2).toFixed(2).replace('.', ',');
    return `OU 2X por ${parcela} s/ juros`;
  }
}