import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPasswordComponent {
  email: string = '';
  mensagemSucesso: string = '';
  mensagemErro: string = '';
  isLoading = false;

  constructor(private http: HttpClient) {}

  enviarLink() {
    this.mensagemSucesso = '';
    this.mensagemErro = '';
    const email = this.email.trim();

    if (!email) {
      this.mensagemErro = 'Informe o e-mail cadastrado.';
      return;
    }

    this.isLoading = true;

    // Envia o JSON no formato esperado pelo ForgotPasswordRequest do Java
    this.http.post<any>('http://localhost:8080/api/auth/forgot-password', { email })
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          // Captura a propriedade 'message' do seu ApiResponse do Back-end
          this.mensagemSucesso = response?.message || 'Link de redefinição enviado para o e-mail informado.';
        },
        error: (err) => {
          this.isLoading = false;
          // Captura o erro tratado pelo seu BusinessException
          this.mensagemErro = err.error?.message || 'Erro ao processar a solicitação.';
        }
      });
  }
}
