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
  status: 'PENDENTE' | 'CONFIRMADO' | 'CANCELADO';
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
  clienteNome: string;
  clienteEmail: string;
}

@Component({
  selector: 'app-gerenciar-reservas',
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
          this.reservas = res.data ?? [];
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
    this.atualizarStatus(reserva, 'CONFIRMADO', 'Reserva finalizada. O backend atual registra este fluxo como CONFIRMADO.');
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
    return reserva.status !== 'CONFIRMADO' && reserva.status !== 'CANCELADO';
  }

  podeFinalizar(reserva: Reserva): boolean {
    return reserva.status === 'CONFIRMADO';
  }

  podeCancelar(reserva: Reserva): boolean {
    return reserva.status !== 'CANCELADO';
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
    this.reservas = this.reservas.map((reserva) =>
      reserva.id === reservaAtualizada.id ? reservaAtualizada : reserva
    );
    this.mensagem = mensagem;
    this.processandoId = null;
  }

  private tratarErro(err: unknown, mensagem: string): void {
    console.error(err);
    this.erro = mensagem;
    this.processandoId = null;
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
