import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-perfil-cliente',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './perfil-cliente.html',
  styleUrl: './perfil-cliente.css',
})
export class PerfilCliente implements OnInit {

  usuario: any = null;
  erro = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get('http://localhost:8080/api/users/me', { headers }).subscribe({
      next: (res: any) => {
        this.usuario = res.data;
      },
      error: () => {
        this.erro = 'Não foi possível carregar o perfil.';
      }
    });
  }

  sair() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.router.navigate(['/']);
  }

  excluirConta() {
    const confirmar = confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.');
    if (!confirmar) return;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.delete('http://localhost:8080/api/users/me', { headers }).subscribe({
      next: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        this.router.navigate(['/']);
      },
      error: () => alert('Erro ao excluir conta. Tente novamente.')
    });
  }
}
