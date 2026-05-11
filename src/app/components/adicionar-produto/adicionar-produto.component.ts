import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProdutoPayload, ProdutoServices } from '../../services/produto/produto.component';

@Component({
  selector: 'app-adicionar-produto',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './adicionar-produto.component.html',
  styleUrl: './adicionar-produto.component.css'
})
export class AdicionarProdutoComponent {
  produto = {
    nome: '',
    descricao: '',
    preco: null as number | null,
    estoque: null as number | null,
    status: 'DISPONIVEL',
    tipo: '',
    publico: '',
    imagemUrl: '',
    areaNecessaria: null as number | null,
    dimensaoLargura: null as number | null,
    dimensaoComprimento: null as number | null,
    requisitosEnergia: null as number | null,
    faixaEtaria: null as number | null,
    publicoAlvo: '',
    itensInclusos: ''
  };

  salvando = false;
  mensagem = '';
  erro = '';
  imagemPreview = 'assets/images/castelo.png';
  nomeArquivoImagem = '';
  imagemDataUrl = '';

  constructor(
    private produtoService: ProdutoServices,
    private router: Router
  ) {}

  salvar(form: NgForm): void {
    this.mensagem = '';
    this.erro = '';

    if (form.invalid || !this.produto.preco || !this.produto.estoque) {
      form.control.markAllAsTouched();
      this.erro = 'Preencha os campos obrigatorios para salvar o produto.';
      return;
    }

    const payload = this.montarPayload();
    this.salvando = true;

    this.produtoService.createProduct(payload).subscribe({
      next: () => {
        this.salvando = false;
        this.mensagem = 'Produto cadastrado com sucesso.';
        form.resetForm({
          status: 'DISPONIVEL'
        });
        this.imagemPreview = 'assets/images/castelo.png';
        this.nomeArquivoImagem = '';
        this.imagemDataUrl = '';

        setTimeout(() => this.router.navigate(['/produtos']), 900);
      },
      error: (err) => {
        console.error(err);
        this.salvando = false;
        this.erro = 'Nao foi possivel cadastrar o produto. Confira os dados e tente novamente.';
      }
    });
  }

  atualizarPreviewPorUrl(): void {
    this.imagemDataUrl = '';
    this.nomeArquivoImagem = '';
    this.imagemPreview = this.produto.imagemUrl?.trim() || 'assets/images/castelo.png';
  }

  selecionarImagem(event: Event): void {
    const input = event.target as HTMLInputElement;
    const arquivo = input.files?.[0];

    if (!arquivo) return;

    this.nomeArquivoImagem = arquivo.name;
    this.imagemPreview = URL.createObjectURL(arquivo);

    const leitor = new FileReader();
    leitor.onload = () => {
      this.imagemDataUrl = String(leitor.result || '');
    };
    leitor.readAsDataURL(arquivo);
  }

  corrigirImagem(): void {
    this.imagemPreview = 'assets/images/castelo.png';
  }

  private montarPayload(): ProdutoPayload {
    const dimensoes = this.produto.dimensaoLargura && this.produto.dimensaoComprimento
      ? `${this.produto.dimensaoLargura}m x ${this.produto.dimensaoComprimento}m`
      : '';

    const imagemUrl = this.imagemDataUrl || this.produto.imagemUrl.trim();
    const imagem = imagemUrl.startsWith('assets/images/')
      ? imagemUrl.replace('assets/images/', '')
      : this.nomeArquivoImagem || imagemUrl;

    return {
      nome: this.produto.nome.trim(),
      descricao: this.produto.descricao.trim(),
      preco: Number(this.produto.preco),
      estoque: Number(this.produto.estoque),
      status: this.produto.status,
      tipo: this.produto.tipo,
      publico: this.produto.publico,
      imagem,
      imagemUrl,
      areaNecessaria: this.produto.areaNecessaria ? `${this.produto.areaNecessaria} m2` : '',
      dimensoes,
      requisitosEnergia: this.produto.requisitosEnergia ? `${this.produto.requisitosEnergia} W` : '',
      faixaEtaria: this.produto.faixaEtaria ? `${this.produto.faixaEtaria}+ anos` : '',
      publicoAlvo: this.produto.publicoAlvo.trim(),
      itensInclusos: this.produto.itensInclusos.trim()
    };
  }

}
