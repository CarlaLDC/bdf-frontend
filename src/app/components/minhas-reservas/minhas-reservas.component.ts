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
          this.reservas = res.data || [];
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
}
