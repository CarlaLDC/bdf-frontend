import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-minhas-reservas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './minhas-reservas.component.html',
  styleUrls: ['./minhas-reservas.component.css']
})
export class MinhasReservasComponent implements OnInit {

  reservas: any[] = [];
  carregando = false;
  erro = '';

  private apiUrl = 'http://localhost:8080/api/reservations';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }
    this.carregarReservas();
  }

  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  carregarReservas(): void {
    this.carregando = true;
    this.erro = '';

    this.http.get<any>(`${this.apiUrl}/my`, { headers: this.getHeaders() })
      .subscribe({
        next: (res) => {
          this.reservas = this.normalizarReservas(res.data || []);
          this.carregando = false;
        },
        error: (err) => {
          console.error(err);
          this.erro = 'Não foi possível carregar suas reservas.';
          this.carregando = false;
        }
      });
  }

  cancelarReserva(id: number): void {
    const confirmar = confirm('Tem certeza que deseja cancelar esta reserva? Em caso de cancelamento com menos de 3 dias, poderá haver multa.');
    if (!confirmar) return;

    this.http.put<any>(`${this.apiUrl}/${id}/cancel`, {}, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          alert('Reserva cancelada com sucesso.');
          this.carregarReservas();
        },
        error: (err) => {
          console.error(err);
          alert('Erro ao cancelar a reserva.');
        }
      });
  }

  enderecoCompleto(reserva: any): string {
    return [reserva.rua, reserva.numero, reserva.bairro, reserva.cidade, reserva.estado]
      .filter(Boolean).join(', ');
  }

  imagemProduto(item: any): string {
    const imagem = item.productImagemUrl || item.imagemUrl || item.product?.imagemUrl;
    if (!imagem) return 'assets/images/castelo.png';
    if (imagem.startsWith('http') || imagem.startsWith('assets/')) return imagem;
    return `assets/images/${imagem}`;
  }

  atualizarImagem(event: Event): void {
    const imagem = event.target as HTMLImageElement;
    imagem.src = 'assets/images/castelo.png';
  }

  private normalizarReservas(reservas: any[]): any[] {
    const reservasPorId = new Map<number, any>();

    for (const reserva of reservas) {
      const id = Number(reserva.id);
      const reservaExistente = reservasPorId.get(id);
      const reservaNormalizada = {
        ...reserva,
        items: this.normalizarItems(reserva)
      };

      if (!reservaExistente) {
        reservasPorId.set(id, reservaNormalizada);
        continue;
      }

      reservaExistente.items = this.mesclarItems(reservaExistente.items, reservaNormalizada.items);
    }

    return Array.from(reservasPorId.values());
  }

  private normalizarItems(reserva: any): any[] {
    const items = reserva.items
      || reserva.itens
      || reserva.reservationItems
      || reserva.reservaItems
      || reserva.produtos
      || reserva.products
      || [];

    const listaItems = Array.isArray(items) ? items : [items];
    const itemsNormalizados = listaItems
      .filter(Boolean)
      .map((item: any) => this.normalizarItem(item));

    if (itemsNormalizados.length > 0) return itemsNormalizados;

    const itemAvulso = this.normalizarItem(reserva);
    return itemAvulso.productId || itemAvulso.productNome ? [itemAvulso] : [];
  }

  private normalizarItem(item: any): any {
    const product = item.product || item.produto || {};
    const quantidade = Number(item.quantidade ?? item.quantity ?? 1);
    const valorUnitario = Number(item.valorUnitario ?? item.precoUnitario ?? product.preco ?? item.preco ?? 0);
    const subtotal = Number(item.subtotal ?? item.totalItem ?? valorUnitario * quantidade);

    return {
      ...item,
      productId: Number(item.productId ?? item.produtoId ?? product.id ?? 0),
      productNome: item.productNome ?? item.produtoNome ?? product.nome ?? item.nome ?? '',
      productImagemUrl: item.productImagemUrl ?? item.produtoImagemUrl ?? item.imagemUrl ?? product.imagemUrl ?? '',
      quantidade,
      valorUnitario,
      subtotal
    };
  }

  private mesclarItems(itemsAtuais: any[], novosItems: any[]): any[] {
    const itemsPorChave = new Map<string, any>();

    for (const item of [...itemsAtuais, ...novosItems]) {
      const chave = String(item.id ?? item.productId ?? item.productNome);
      if (chave && !itemsPorChave.has(chave)) {
        itemsPorChave.set(chave, item);
      }
    }

    return Array.from(itemsPorChave.values());
  }
}
