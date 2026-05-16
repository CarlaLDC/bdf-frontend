// src/app/components/header/header.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CarrinhoService } from '../../services/carrinho/carrinho.service'; //

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  termoBusca = '';

  constructor(
    private carrinhoService: CarrinhoService,
    private router: Router
  ) {}

  get usuarioLogado(): boolean {
    return !!localStorage.getItem('token');
  }

  menuCarrinho() {
    // ESTA LINHA É A CHAVE: ela avisa o serviço para mudar o estado
    this.carrinhoService.toggle(); 
  }

  irParaPerfilOuLogin(): void {
    if (!this.usuarioLogado) {
      this.router.navigate(['/login']);
      return;
    }

    const usuario = this.buscarUsuarioSalvo();
    const email = String(usuario?.email || '').toLowerCase();
    const tipo = String(usuario?.tipo || usuario?.role || '').toUpperCase();
    const isAdmin = tipo.includes('ADMIN') || email.endsWith('@admbau.com');

    this.router.navigate([isAdmin ? '/perfil-admin' : '/perfil-cliente']);
  }

  pesquisarProdutos(): void {
    const nome = this.termoBusca.trim();

    this.router.navigate(['/produtos'], {
      queryParams: nome ? { nome } : {}
    });
  }

  private buscarUsuarioSalvo(): any {
    try {
      return JSON.parse(localStorage.getItem('usuario') || '{}');
    } catch {
      return {};
    }
  }
}
