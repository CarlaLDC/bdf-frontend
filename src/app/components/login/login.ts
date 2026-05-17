import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/cadastros/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  credentials = {
    email: '',
    senha: ''
  };

  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  entrar(): void {
    this.errorMessage = '';

    if (!this.credentials.email || !this.credentials.senha) {
      this.errorMessage = 'Informe o e-mail e a senha.';
      return;
    }

    this.isLoading = true;

    this.authService.login({
      email: this.credentials.email,
      senha: this.credentials.senha,
      password: this.credentials.senha
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        const token = res?.token || res?.data?.token;
        const usuario = res?.usuario || res?.user || res?.data?.usuario || res?.data?.user || res?.data;

        if (token) {
          this.authService.salvarToken(token);
        }

        if (usuario) {
          localStorage.setItem('usuario', JSON.stringify(usuario));
        }

        const email = String(usuario?.email || this.credentials.email).toLowerCase();
        const tipo = String(usuario?.userType || usuario?.tipoUsuario || usuario?.tipoConta || usuario?.tipo || usuario?.role || '').toUpperCase();
        const isAdmin = tipo.includes('ADMIN') || email.endsWith('@admbau.com');

        this.router.navigate([isAdmin ? '/perfil-admin' : '/perfil-cliente']);
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Nao foi possivel entrar. Confira o e-mail e a senha.';
      }
    });
  }
}
