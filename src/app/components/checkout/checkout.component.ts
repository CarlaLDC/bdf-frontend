import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CarrinhoService } from '../../services/carrinho/carrinho.service'; // Verifique se o caminho está correto

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  // Agora usamos o serviço para os itens e totais
  taxaOperadores = 50.00; // Ajuste o valor da taxa conforme necessário

  dados = {
    ano: new Date().getFullYear().toString(),
    mes: '',
    dia: '',
    horarioMontagem: '',
    horarioDesmontagem: '',
    cep: '',
    rua: '',
    bairro: '',
    cidade: '',
    estado: '',
    numero: '',
    complemento: '',
    referencia: '',
    semComplemento: false
  };

  aceitaMulta = false;
  carregando = false;
  erroMensagem = '';
  sucessoMensagem = '';

  meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
           'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  dias = Array.from({ length: 31 }, (_, i) => i + 1);

  private apiUrl = 'http://localhost:8080/api';

  constructor(
    private http: HttpClient, 
    private router: Router,
    public carrinhoService: CarrinhoService // Injetando o serviço
  ) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }
  }

  // Getters para facilitar o uso no HTML
  get subtotal() {
    return this.carrinhoService.total;
  }

  get totalFinal() {
    return this.subtotal + this.taxaOperadores;
  }

  buscarCep() {
    const cep = this.dados.cep.replace(/\D/g, '');
    if (cep.length !== 8) return;

    this.http.get(`${this.apiUrl}/address/cep/${cep}`).subscribe({
      next: (res: any) => {
        if (res.data) {
          this.dados.rua    = res.data.logradouro || '';
          this.dados.bairro = res.data.bairro     || '';
          this.dados.cidade = res.data.localidade || '';
          this.dados.estado = res.data.uf         || '';
        }
      },
      error: () => {
        this.erroMensagem = 'CEP não encontrado.';
      }
    });
  }

  finalizar() {
    if (this.subtotal === 0) { 
      this.erroMensagem = 'Carrinho vazio. Adicione brinquedos antes de finalizar a reserva.';
      return;
    }
    if (!this.dados.mes || !this.dados.dia) {
      this.erroMensagem = 'Selecione a data da festa.';
      return;
    }
    if (!this.dados.cep || !this.dados.rua || !this.dados.numero) {
      this.erroMensagem = 'Preencha o endereço completo.';
      return;
    }

    this.carregando = true;
    this.erroMensagem = '';

    const dataEvento = `${this.dados.ano}-${String(this.dados.mes).padStart(2,'0')}-${String(this.dados.dia).padStart(2,'0')}`;

    const body = {
      dataEvento,
      horarioMontagem:     this.dados.horarioMontagem,
      horarioDesmontagem: this.dados.horarioDesmontagem,
      cep:          this.dados.cep,
      rua:          this.dados.rua,
      bairro:       this.dados.bairro,
      cidade:       this.dados.cidade,
      estado:       this.dados.estado,
      numero:       this.dados.numero,
      complemento:  this.dados.semComplemento ? '' : this.dados.complemento,
      referencia:   this.dados.referencia,
      total:        this.totalFinal // Enviando o valor total correto para o banco
    };

    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    });

    this.http.post(`${this.apiUrl}/reservations/checkout`, body, { headers }).subscribe({
      next: () => {
        this.carregando = false;
        this.sucessoMensagem = 'Reserva realizada com sucesso!';
        setTimeout(() => this.router.navigate(['/minhas-reservas']), 1500);
      },
      error: (err) => {
        this.carregando = false;
        this.erroMensagem = err.error?.message || 'Erro ao finalizar reserva.';
      }
    });
  }
}