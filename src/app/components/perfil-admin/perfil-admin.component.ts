import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-perfil-admin',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './perfil-admin.component.html',
  styleUrl: './perfil-admin.component.css',
})
export class PerfilAdmin implements OnInit {

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
}

export { PerfilAdmin as PerfilAdminComponent };
