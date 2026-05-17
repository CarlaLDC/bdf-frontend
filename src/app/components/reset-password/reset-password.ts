import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css']
})
export class ResetPasswordComponent implements OnInit {
  token: string | null = '';
  novaSenha: string = '';
  confirmaSenha: string = '';
  mensagemSucesso: string = '';
  mensagemErro: string = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Captura o ?token=XXXX que enviamos lá no link do EmailService do Java
    this.token = this.route.snapshot.queryParamMap.get('token');
    
    if (!this.token) {
      this.mensagemErro = 'Token de recuperação ausente ou inválido! Solicite um novo link.';
    }
  }

  atualizarSenha() {
    this.mensagemSucesso = '';
    this.mensagemErro = '';

    if (this.novaSenha !== this.confirmaSenha) {
      this.mensagemErro = 'As senhas não coincidem.';
      return;
    }

    if (!this.token) {
      this.mensagemErro = 'Não é possível redefinir a senha sem um token válido.';
      return;
    }

    // Monta o payload idêntico ao seu ResetPasswordRequest do Back-end
    const dadosRequest = {
      token: this.token,
      novaSenha: this.novaSenha
    };

    this.http.post<any>('http://localhost:8080/api/auth/reset-password', dadosRequest)
      .subscribe({
        next: (response) => {
          this.mensagemSucesso = response.message;
          
          // Redireciona o cliente para a tela de login após 3 segundos
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        },
        error: (err) => {
          this.mensagemErro = err.error?.message || 'Erro ao redefinir a senha.';
        }
      });
  }
}