// src/app/components/header/header.component.ts
import { Component } from '@angular/core';
import { CarrinhoService } from '../../services/carrinho/carrinho.service'; //

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  constructor(private carrinhoService: CarrinhoService) {}

  menuCarrinho() {
    // ESTA LINHA É A CHAVE: ela avisa o serviço para mudar o estado
    this.carrinhoService.toggle(); 
  }
}