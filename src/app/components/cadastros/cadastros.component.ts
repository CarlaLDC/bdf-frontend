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

  constructor(private authService: AuthService, private router: Router) {}

  // Verificador
  get isAdmin(): boolean {
    return this.cadastroData.email.toLowerCase().endsWith('@admbau.com');
  }

   
  onEmailChange() {
    this.cadastroData.tipo = this.isAdmin ? 'ADMIN' : 'CLIENTE';
  }

  formatarCPF(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    this.cadastroData.cpf = value;
  }

  
  onSubmit(form: any): void {
    if (form.invalid) return;

    
    const apenasNumeros = this.cadastroData.cpf.replace(/\D/g, '');

    if (apenasNumeros.length !== 11) {
      this.errorMessage = 'O CPF deve ter exatamente 11 números.';
     
      window.scrollTo(0, 0); 
      return;
    }

    
    if (this.cadastroData.senha !== this.cadastroData.confirmaSenha) {
      this.errorMessage = 'As senhas não coincidem!';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    
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
  }}