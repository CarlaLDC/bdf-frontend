import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { forkJoin, Observable, of } from 'rxjs';

export interface ItemCarrinho {
  id: number;
  productId: number;
  nome: string;
  preco: number;
  quantidade: number;
  estoque: number;
  imagemUrl: string;
}

@Injectable({ providedIn: 'root' })
export class CarrinhoService {
  private readonly apiUrl = 'http://localhost:8080/api/cart';

  private itens = new BehaviorSubject<ItemCarrinho[]>(this.getItensIniciais());
  itens$ = this.itens.asObservable();

  private carrinhoAberto = new BehaviorSubject<boolean>(false);
  carrinhoAberto$ = this.carrinhoAberto.asObservable();

  constructor(private http: HttpClient) {}

  private getItensIniciais(): ItemCarrinho[] {
    const salvo = localStorage.getItem('carrinho');
    return salvo ? JSON.parse(salvo) : [];
  }

  private salvar(): void {
    localStorage.setItem('carrinho', JSON.stringify(this.itens.value));
  }

  carregarCarrinho(): void {
    if (!this.temToken()) return;

    this.http.get(this.apiUrl, this.getHeaders()).subscribe({
      next: (res: any) => this.atualizarPorResposta(res),
      error: (err) => console.error('Nao foi possivel carregar o carrinho.', err)
    });
  }

  adicionar(produto: any, qtd: number): boolean {
    const adicionou = this.adicionarLocal(produto, qtd);
    this.abrir();
    return adicionou;
  }

  sincronizarComBackend(): Observable<boolean> {
    if (!this.temToken()) return of(false);

    const itensLocais = this.itens.value.map((item) => ({
      ...item,
      quantidade: item.estoque > 0 ? Math.min(item.quantidade, item.estoque) : item.quantidade
    }));
    this.atualizarItens(itensLocais);

    if (itensLocais.length === 0) return of(false);

    return this.http.get(this.apiUrl, this.getHeaders()).pipe(
      switchMap((res: any) => {
        const itensServidor = this.mapearResposta(res);
        const requests: Observable<any>[] = [];

        for (const itemServidor of itensServidor) {
          const itemLocal = itensLocais.find((item) => item.productId === itemServidor.productId);

          if (!itemLocal) {
            requests.push(this.http.delete(`${this.apiUrl}/items/${itemServidor.id}`, this.getHeaders()));
          } else if (itemLocal.quantidade !== itemServidor.quantidade) {
            requests.push(this.http.put(`${this.apiUrl}/items/${itemServidor.id}?quantidade=${itemLocal.quantidade}`, {}, this.getHeaders()));
          }
        }

        for (const itemLocal of itensLocais) {
          const existeNoServidor = itensServidor.some((item) => item.productId === itemLocal.productId);
          if (!existeNoServidor) {
            requests.push(this.http.post(this.apiUrl + '/items', {
              productId: itemLocal.productId || itemLocal.id,
              quantidade: itemLocal.quantidade
            }, this.getHeaders()));
          }
        }

        const sincronizacao$ = requests.length ? forkJoin(requests) : of([]);

        return sincronizacao$.pipe(
          switchMap(() => this.http.get(this.apiUrl, this.getHeaders())),
          map((carrinhoAtualizado: any) => {
            this.atualizarPorResposta(carrinhoAtualizado);
            return this.itens.value.length > 0;
          })
        );
      }),
      catchError((err) => {
        console.error('Nao foi possivel sincronizar o carrinho.', err);
        return of(false);
      })
    );
  }

  remover(id: number): void {
    this.atualizarItens(this.itens.value.filter(i => i.id !== id));
  }

  toggle() { this.carrinhoAberto.next(!this.carrinhoAberto.value); }
  abrir() { this.carrinhoAberto.next(true); }
  fechar() { this.carrinhoAberto.next(false); }
  limpar() { this.atualizarItens([]); }

  get total(): number {
    return this.itens.value.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
  }

  aumentarQuantidade(id: number): void {
    const item = this.itens.value.find(i => i.id === id);
    if (!item) return;
    if (item.estoque > 0 && item.quantidade >= item.estoque) return;

    this.atualizarQuantidade(id, item.quantidade + 1);
  }

  diminuirQuantidade(id: number): void {
    const item = this.itens.value.find(i => i.id === id);
    if (!item) return;

    if (item.quantidade <= 1) {
      this.remover(id);
      return;
    }

    this.atualizarQuantidade(id, item.quantidade - 1);
  }

  private atualizarQuantidade(id: number, quantidade: number): void {
    const itensAntes = this.itens.value;
    const itensAtualizados = itensAntes.map(item =>
      item.id === id ? { ...item, quantidade } : item
    );
    this.atualizarItens(itensAtualizados);
  }

  private adicionarLocal(produto: any, qtd: number): boolean {
    const atuais = this.itens.value;
    const index = atuais.findIndex(i => i.productId === produto.id || i.id === produto.id);
    const estoque = Number(produto.estoque ?? 0);
    const quantidadeSolicitada = Math.max(1, Number(qtd));

    if (index > -1) {
      const atual = atuais[index];
      const novaQuantidade = atual.quantidade + quantidadeSolicitada;

      if (estoque > 0 && novaQuantidade > estoque) {
        return false;
      }

      atuais[index] = {
        ...atual,
        quantidade: novaQuantidade,
        estoque: estoque || atual.estoque
      };
      this.atualizarItens([...atuais]);
      return true;
    }

    if (estoque > 0 && quantidadeSolicitada > estoque) {
      return false;
    }

    const novoItem: ItemCarrinho = {
      id: produto.id,
      productId: produto.id,
      nome: produto.nome,
      preco: Number(produto.preco),
      quantidade: quantidadeSolicitada,
      estoque,
      imagemUrl: produto.imagemUrl || 'assets/images/castelo.png'
    };

    this.atualizarItens([...atuais, novoItem]);
    return true;
  }

  private atualizarPorResposta(res: any): void {
    this.atualizarItens(this.mapearResposta(res));
  }

  private mapearResposta(res: any): ItemCarrinho[] {
    const carrinho = res?.data ?? res;
    return (carrinho?.items ?? []).map((item: any) => ({
      id: Number(item.id),
      productId: Number(item.product?.id),
      nome: item.product?.nome ?? '',
      preco: Number(item.valorUnitario ?? item.product?.preco ?? 0),
      quantidade: Number(item.quantidade ?? 0),
      estoque: Number(item.product?.estoque ?? 0),
      imagemUrl: item.product?.imagemUrl || 'assets/images/castelo.png'
    }));
  }

  private atualizarItens(itens: ItemCarrinho[]): void {
    this.itens.next(itens);
    this.salvar();
  }

  private temToken(): boolean {
    return !!localStorage.getItem('token');
  }

  private getHeaders(): { headers: HttpHeaders } {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      })
    };
  }
}
