import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CarrinhoService } from '../../services/carrinho/carrinho.service'; 

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

 
  taxaOperadores = 350.00; 

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
    referencia: ''
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
    public carrinhoService: CarrinhoService 
  ) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }
  }

  
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
    const dataEscolhida = new Date(Number(this.dados.ano), Number(this.dados.mes) - 1, Number(this.dados.dia));
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    if (dataEscolhida < hoje) {
      this.erroMensagem = 'A data escolhida já passou. Selecione uma data futura.';
      return;
    }
    if (!this.dados.horarioMontagem || !this.dados.horarioDesmontagem) {
      this.erroMensagem = 'Informe os horários de montagem e desmontagem.';
      return;
    }
    const [montagemHoras, montagemMinutos] = this.dados.horarioMontagem.split(':').map(Number);
    const [desmontagemHoras, desmontagemMinutos] = this.dados.horarioDesmontagem.split(':').map(Number);
    const tempoMontagem = montagemHoras * 60 + montagemMinutos;
    const tempoDesmontagem = desmontagemHoras * 60 + desmontagemMinutos;
    if (tempoMontagem >= tempoDesmontagem) {
      this.erroMensagem = 'O horário de desmontagem deve ser depois do horário de montagem.';
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
      complemento:  this.dados.complemento,
      referencia:   this.dados.referencia,
      total:        this.totalFinal 
    };

    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    });

    this.carrinhoService.sincronizarComBackend().subscribe({
      next: (sincronizado) => {
        if (!sincronizado) {
          this.carregando = false;
          this.erroMensagem = 'Nao foi possivel sincronizar o carrinho. Tente adicionar o produto novamente.';
          return;
        }

        this.http.post(`${this.apiUrl}/reservations/checkout`, body, { headers }).subscribe({
          next: () => {
            this.carregando = false;
            this.carrinhoService.limpar();
            this.sucessoMensagem = 'Reserva realizada com sucesso!';
            setTimeout(() => this.router.navigate(['/minhas-reservas']), 1500);
          },
          error: (err) => {
            this.carregando = false;
            this.erroMensagem = err.error?.message || 'Erro ao finalizar reserva.';
          }
        });
      },
      error: () => {
        this.carregando = false;
        this.erroMensagem = 'Nao foi possivel sincronizar o carrinho. Tente novamente.';
      }
    });
  }
}
