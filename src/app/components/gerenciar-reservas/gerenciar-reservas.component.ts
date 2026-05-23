import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

interface ReservaItem {
  id: number;
  productId: number;
  productNome: string;
  productImagemUrl: string;
  quantidade: number;
  valorUnitario: number;
  subtotal: number;
}

interface Reserva {
  id: number;
  numeroReserva: string;
  status: 'PENDENTE' | 'CONFIRMADO' | 'CANCELADO' | 'FINALIZADO';
  dataEvento: string;
  horarioMontagem: string;
  horarioDesmontagem: string;
  rua: string;
  bairro: string;
  cidade: string;
  estado: string;
  numero: string;
  complemento?: string;
  referencia?: string;
  total: number;
  items: ReservaItem[];
  itens?: ReservaItem[];
  reservationItems?: ReservaItem[];
  reservaItems?: ReservaItem[];
  produtos?: ReservaItem[];
  products?: ReservaItem[];
  clienteNome: string;
  clienteEmail: string;
}

@Component({
  selector: 'app-gerenciar-reservas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gerenciar-reservas.component.html',
  styleUrl: './gerenciar-reservas.component.css'
})
export class GerenciarReservasComponent implements OnInit {
  reservas: Reserva[] = [];
  carregando = false;
  mensagem = '';
  erro = '';
  processandoId: number | null = null;

  private readonly apiUrl = 'http://localhost:8080/api/reservations';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.carregarReservas();
  }

  carregarReservas(): void {
    this.carregando = true;
    this.erro = '';

    this.http.get<{ message: string; data: Reserva[] }>(`${this.apiUrl}/all`, this.getHeaders())
      .subscribe({
        next: (res) => {
          this.reservas = this.normalizarReservas(res.data ?? []);
          this.carregando = false;
        },
        error: (err) => {
          console.error(err);
          this.erro = 'Nao foi possivel carregar as reservas cadastradas no banco de dados.';
          this.carregando = false;
        }
      });
  }

  confirmarReserva(reserva: Reserva): void {
    this.atualizarStatus(reserva, 'CONFIRMADO', 'Reserva confirmada com sucesso.');
  }

  finalizarReserva(reserva: Reserva): void {
    this.atualizarStatus(reserva, 'FINALIZADO', 'Reserva finalizada!');
  }

  cancelarReserva(reserva: Reserva): void {
    const confirmou = confirm(`Deseja cancelar a ${this.formatarNumeroReserva(reserva)}?`);
    if (!confirmou) return;

    this.processandoId = reserva.id;
    this.mensagem = '';
    this.erro = '';

    this.http.put<{ message: string; data: Reserva }>(`${this.apiUrl}/${reserva.id}/cancel`, {}, this.getHeaders())
      .subscribe({
        next: (res) => this.aplicarReservaAtualizada(res.data, 'Reserva cancelada com sucesso.'),
        error: (err) => this.tratarErro(err, 'Nao foi possivel cancelar a reserva.')
      });
  }

  atualizarImagem(event: Event): void {
    const imagem = event.target as HTMLImageElement;
    imagem.src = 'assets/images/castelo.png';
  }

  imagemProduto(item: ReservaItem): string {
    const imagem = item.productImagemUrl;
    if (!imagem) return 'assets/images/castelo.png';
    if (imagem.startsWith('http') || imagem.startsWith('assets/')) return imagem;
    return `assets/images/${imagem}`;
  }

  enderecoCompleto(reserva: Reserva): string {
    return [
      reserva.rua,
      reserva.numero,
      reserva.bairro,
      reserva.cidade,
      reserva.estado
    ].filter(Boolean).join(' - ');
  }

  formatarNumeroReserva(reserva: Reserva): string {
    return reserva.numeroReserva || `#${reserva.id.toString().padStart(5, '0')}`;
  }

  podeConfirmar(reserva: Reserva): boolean {
    return reserva.status !== 'CONFIRMADO' && reserva.status !== 'CANCELADO' && reserva.status !== 'FINALIZADO';
  }

  podeFinalizar(reserva: Reserva): boolean {
    return reserva.status === 'CONFIRMADO';
  }

  podeCancelar(reserva: Reserva): boolean {
    return reserva.status !== 'CANCELADO' && reserva.status !== 'FINALIZADO';
  }

  private atualizarStatus(reserva: Reserva, status: Reserva['status'], mensagem: string): void {
    this.processandoId = reserva.id;
    this.mensagem = '';
    this.erro = '';

    this.http.put<{ message: string; data: Reserva }>(
      `${this.apiUrl}/${reserva.id}/status`,
      { status },
      this.getHeaders()
    ).subscribe({
      next: (res) => this.aplicarReservaAtualizada(res.data, mensagem),
      error: (err) => this.tratarErro(err, 'Nao foi possivel atualizar o status da reserva.')
    });
  }

  private aplicarReservaAtualizada(reservaAtualizada: Reserva, mensagem: string): void {
    const reservaNormalizada = this.normalizarReserva(reservaAtualizada);

    this.reservas = this.reservas.map((reserva) =>
      reserva.id === reservaNormalizada.id ? reservaNormalizada : reserva
    );

    this.mensagem = mensagem;
    this.processandoId = null;
  }

  private tratarErro(err: unknown, mensagem: string): void {
    console.error(err);
    this.erro = mensagem;
    this.processandoId = null;
  }

  private normalizarReservas(reservas: Reserva[]): Reserva[] {
    const reservasPorId = new Map<number, Reserva>();

    for (const reserva of reservas) {
      const reservaExistente = reservasPorId.get(reserva.id);
      const reservaNormalizada = this.normalizarReserva(reserva);

      if (!reservaExistente) {
        reservasPorId.set(reserva.id, reservaNormalizada);
        continue;
      }

      reservaExistente.items = this.mesclarItems(reservaExistente.items, reservaNormalizada.items);
    }

    return Array.from(reservasPorId.values());
  }

  private normalizarReserva(reserva: Reserva): Reserva {
    return {
      ...reserva,
      items: this.normalizarItems(reserva)
    };
  }

  private normalizarItems(reserva: Reserva): ReservaItem[] {
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
      .map((item) => this.normalizarItem(item));

    if (itemsNormalizados.length > 0) return itemsNormalizados;

    const itemAvulso = this.normalizarItem(reserva as unknown as ReservaItem);
    return itemAvulso.productId || itemAvulso.productNome ? [itemAvulso] : [];
  }

  private normalizarItem(item: any): ReservaItem {
    const product = item.product || item.produto || {};
    const quantidade = Number(item.quantidade ?? item.quantity ?? 1);
    const valorUnitario = Number(item.valorUnitario ?? item.precoUnitario ?? product.preco ?? item.preco ?? 0);
    const subtotal = Number(item.subtotal ?? item.totalItem ?? valorUnitario * quantidade);

    return {
      ...item,
      id: Number(item.id ?? item.itemId ?? item.productId ?? item.produtoId ?? product.id ?? 0),
      productId: Number(item.productId ?? item.produtoId ?? product.id ?? 0),
      productNome: item.productNome ?? item.produtoNome ?? product.nome ?? item.nome ?? '',
      productImagemUrl: item.productImagemUrl ?? item.produtoImagemUrl ?? item.imagemUrl ?? product.imagemUrl ?? '',
      quantidade,
      valorUnitario,
      subtotal
    };
  }

  private mesclarItems(itemsAtuais: ReservaItem[], novosItems: ReservaItem[]): ReservaItem[] {
    const itemsPorChave = new Map<string, ReservaItem>();

    for (const item of [...itemsAtuais, ...novosItems]) {
      const chave = String(item.id || item.productId || item.productNome);
      if (chave && !itemsPorChave.has(chave)) {
        itemsPorChave.set(chave, item);
      }
    }

    return Array.from(itemsPorChave.values());
  }

  private getHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  }
}
