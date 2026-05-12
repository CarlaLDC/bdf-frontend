import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

export interface ReservaItem {
  produtoNome: string;
  quantidade: number;
  precoUnitario: number;
  imagemUrl: string;
}

export interface ReservaResponse {
  id: number;
  dataEvento: string;
  enderecoEvento: string;
  horarioMontagem: string;
  horarioRetirada: string;
  status: string;
  itens: ReservaItem[];
}

@Component({
  selector: 'app-minhas-reservas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './minhas-reservas.component.html',
  styleUrls: ['./minhas-reservas.component.css']
})
export class MinhasReservasComponent implements OnInit {
  reservas: ReservaResponse[] = [];
  erro: string = '';

  private apiUrl = 'http://localhost:8080/api/reservations';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.carregarReservas();
  }

  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  carregarReservas(): void {
    this.http.get<{message: string, data: ReservaResponse[]}>(`${this.apiUrl}/my`, { headers: this.getHeaders() })
      .subscribe({
        next: (res) => {
          this.reservas = res.data;
        },
        error: (err) => {
          console.error(err);
          this.erro = 'Não foi possível carregar suas reservas.';
          
          
          this.reservas = [{
            id: 1,
            dataEvento: '15/10/2026',
            enderecoEvento: 'Rua Brado Folder, 18000 - Jardim Guller',
            horarioMontagem: '12:00H',
            horarioRetirada: '15:00H',
            status: 'CONFIRMADO',
            itens: [
              { produtoNome: 'Castelinho', quantidade: 1, precoUnitario: 200, imagemUrl: 'assets/castelinho.jpg' },
              { produtoNome: 'Touro Mecânico', quantidade: 2, precoUnitario: 1000, imagemUrl: 'assets/touro.jpg' }
            ]
          }];
        }
      });
  }

  cancelarReserva(id: number): void {
    const confirmar = confirm('Tem certeza que deseja cancelar esta reserva? Em caso de cancelamento com menos de 3 dias, poderá haver multa.');
    if (!confirmar) return;

    this.http.put<{message: string, data: ReservaResponse}>(`${this.apiUrl}/${id}/cancel`, {}, { headers: this.getHeaders() })
      .subscribe({
        next: (res) => {
          alert('Reserva cancelada com sucesso.');
          this.carregarReservas(); // Recarrega a lista
        },
        error: (err) => {
          console.error(err);
          alert('Erro ao cancelar a reserva.');
        }
      });
  }
}