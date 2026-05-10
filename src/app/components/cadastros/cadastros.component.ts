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

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // Detecta se o email digitado é de admin
  get isAdmin(): boolean {
    return this.cadastroData.email.toLowerCase().endsWith('@admbau.com');
  }

  // Atualiza o tipo automaticamente conforme o email
  onEmailChange() {
    this.cadastroData.tipo = this.isAdmin ? 'ADMIN' : 'CLIENTE';
  }

  onSubmit(form: any): void {
    if (form.invalid) return;

    if (this.cadastroData.senha !== this.cadastroData.confirmaSenha) {
      this.errorMessage = 'As senhas não coincidem!';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register(this.cadastroData).subscribe({
      next: (res: any) => {
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
          this.errorMessage = 'Dados inválidos. Verifique os campos e tente novamente.';
        } else if (err.status === 0) {
          this.errorMessage = 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.';
        } else {
          this.errorMessage = 'Erro ao realizar cadastro. Tente novamente.';
        }
        console.error('Erro no cadastro:', err);
      }
    });
  }
}