import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPasswordComponent {
  email: string = '';
  mensagemSucesso: string = '';
  mensagemErro: string = '';

  constructor(private http: HttpClient) {}

  enviarLink() {
    this.mensagemSucesso = '';
    this.mensagemErro = '';

    // Envia o JSON no formato esperado pelo ForgotPasswordRequest do Java
    this.http.post<any>('http://localhost:8080/api/auth/forgot-password', { email: this.email })
      .subscribe({
        next: (response) => {
          // Captura a propriedade 'message' do seu ApiResponse do Back-end
          this.mensagemSucesso = response.message;
        },
        error: (err) => {
          // Captura o erro tratado pelo seu BusinessException
          this.mensagemErro = err.error?.message || 'Erro ao processar a solicitação.';
        }
      });
  }
}