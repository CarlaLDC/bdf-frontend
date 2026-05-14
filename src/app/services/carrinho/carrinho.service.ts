import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ItemCarrinho {
  id: number;
  nome: string;
  preco: number;
  quantidade: number;
  imagemUrl: string;
}

@Injectable({ providedIn: 'root' })
export class CarrinhoService {
  private itens = new BehaviorSubject<ItemCarrinho[]>([]); 
  itens$ = this.itens.asObservable();

  private carrinhoAberto = new BehaviorSubject<boolean>(false);
  carrinhoAberto$ = this.carrinhoAberto.asObservable();

  private getItensIniciais(): ItemCarrinho[] {
    const salvo = localStorage.getItem('carrinho');
    return salvo ? JSON.parse(salvo) : [];
  }

  private salvar() {
    localStorage.setItem('carrinho', JSON.stringify(this.itens.value));
  }

  adicionar(produto: any, qtd: number) {
    const atuais = this.itens.value;
    const index = atuais.findIndex(i => i.id === produto.id);

    if (index > -1) {
      atuais[index].quantidade += qtd;
      this.itens.next([...atuais]);
    } else {
      const novoItem: ItemCarrinho = {
        id: produto.id,
        nome: produto.nome,
        preco: produto.preco,
        quantidade: qtd,
        imagemUrl: produto.imagemUrl || 'assets/images/castelo.png'
      };
      this.itens.next([...atuais, novoItem]);
      this.salvar();
    }
    this.abrir(); 
  }

  remover(id: number) {
    const filtrados = this.itens.value.filter(i => i.id !== id);
    this.itens.next(filtrados);
  }

  toggle() { this.carrinhoAberto.next(!this.carrinhoAberto.value); }
  abrir() { this.carrinhoAberto.next(true); }
  fechar() { this.carrinhoAberto.next(false); }

  get total(): number {
    return this.itens.value.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
  }

  aumentarQuantidade(id: number) {
    const atuais = this.itens.value;
    const item = atuais.find(i => i.id === id);
    if (item) {
      item.quantidade++;
      this.itens.next([...atuais]);
    }
  }

  diminuirQuantidade(id: number) {
    const atuais = this.itens.value;
    const item = atuais.find(i => i.id === id);
    if (item && item.quantidade > 1) {
      item.quantidade--;
      this.itens.next([...atuais]);
    } else {
      this.remover(id);
    }
    this.salvar();
  }
}