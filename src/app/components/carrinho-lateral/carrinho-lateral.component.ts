import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CarrinhoService } from '../../services/carrinho//carrinho.service'; 
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-carrinho-lateral',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './carrinho-lateral.component.html',
  styleUrls: ['./carrinho-lateral.component.css']
})

export class CarrinhoLateralComponent implements OnInit {
  constructor(public carrinhoService: CarrinhoService) {}

  itens$!: any;
  estaAberto$!: any;

  // Cria um booleano reativo que indica se há itens
  temItens$!: any;

  ngOnInit() {
    this.itens$ = this.carrinhoService.itens$;
    this.estaAberto$ = this.carrinhoService.carrinhoAberto$;
    this.temItens$ = this.itens$.pipe(
      map((itens: any[]) => !!itens && itens.length > 0)
    );
  }

  remover(id: number) {
    this.carrinhoService.remover(id);
  }

  fechar() {
    this.carrinhoService.fechar();
  }

  aumentar(id: number) {
    this.carrinhoService.aumentarQuantidade(id);
  }

  diminuir(id: number) {
    this.carrinhoService.diminuirQuantidade(id);
  }
}
