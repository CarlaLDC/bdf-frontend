import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/cadastros/auth.service';

@Component({
  selector: 'app-cadastros',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cadastros.component.html',
  styleUrls: ['./cadastros.component.css']
})
export class CadastrosComponent {

  // Dados do formulário
  cadastroData = {
    nome: '',
    sobrenome: '',
    cpf: '',
    email: '',
    telefone: '',
    celular: '',
    senha: '',
    confirmaSenha: '',
    tipo: 'CLIENTE'
  };

  // Controle da tela
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  // Verifica se o email é de administrador
  get isAdmin(): boolean {
    return this.cadastroData.email.toLowerCase().endsWith('@admbau.com');
  }

  // Atualiza o tipo quando o email muda
  onEmailChange() {
    this.cadastroData.tipo = this.isAdmin ? 'ADMIN' : 'CLIENTE';
  }

  // Envia o formulário
  onSubmit(form: any): void {
    if (form.invalid) return;

    // Verifica se as senhas coincidem
    if (this.cadastroData.senha !== this.cadastroData.confirmaSenha) {
      this.errorMessage = 'As senhas não coincidem!';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Chama o AuthService para enviar ao backend
    this.authService.register(this.cadastroData).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = this.isAdmin
          ? 'Administrador cadastrado com sucesso!'
          : 'Cadastro realizado com sucesso!';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.error?.message) {
          this.errorMessage = err.error.message;
        } else if (err.status === 400) {
          this.errorMessage = 'Dados inválidos. Verifique os campos.';
        } else if (err.status === 0) {
          this.errorMessage = 'Servidor fora do ar. Verifique se o backend está rodando.';
        } else {
          this.errorMessage = 'Erro ao cadastrar. Tente novamente.';
        }
      }
    });
  }
}