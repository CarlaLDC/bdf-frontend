import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProdutoPayload, ProdutoServices } from '../../services/produto/produto.component';

@Component({
  selector: 'app-editar-produto',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './editar-produto.component.html',
  styleUrl: './editar-produto.component.css'
})
export class EditarProdutoComponent implements OnInit {
  produtoId: number | null = null;

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

  carregando = true;
  salvando = false;
  mensagem = '';
  erro = '';
  imagemPreview = 'assets/images/castelo.png';
  nomeArquivoImagem = '';
  imagemDataUrl = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private produtoService: ProdutoServices
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.erro = 'Produto invalido para edicao.';
      this.carregando = false;
      return;
    }

    this.produtoId = id;
    this.carregarProduto(id);
  }

  carregarProduto(id: number): void {
    this.carregando = true;
    this.erro = '';

    this.produtoService.getProductById(id).subscribe({
      next: (res) => {
        this.preencherFormulario(res.data ?? res);
        this.carregando = false;
      },
      error: (err) => {
        console.error(err);
        this.erro = 'Nao foi possivel carregar os dados do produto.';
        this.carregando = false;
      }
    });
  }

  salvar(form: NgForm): void {
    this.mensagem = '';
    this.erro = '';

    if (!this.produtoId) {
      this.erro = 'Produto invalido para edicao.';
      return;
    }

    if (form.invalid || !this.produto.preco || !this.produto.estoque) {
      form.control.markAllAsTouched();
      this.erro = 'Preencha os campos obrigatorios para atualizar o produto.';
      return;
    }

    this.salvando = true;

    this.produtoService.updateProduct(this.produtoId, this.montarPayload()).subscribe({
      next: () => {
        this.salvando = false;
        this.mensagem = 'Produto atualizado com sucesso.';
        setTimeout(() => this.router.navigate(['/produto', this.produtoId]), 900);
      },
      error: (err) => {
        console.error(err);
        this.salvando = false;
        this.erro = 'Nao foi possivel atualizar o produto. Confira os dados e tente novamente.';
      }
    });
  }

  atualizarPreviewPorUrl(): void {
    this.imagemDataUrl = '';
    this.nomeArquivoImagem = '';
    this.imagemPreview = this.normalizarImagem(this.produto.imagemUrl);
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

  private preencherFormulario(produto: any): void {
    const dimensoes = this.extrairNumeros(produto?.dimensoes);

    this.produto = {
      nome: produto?.nome ?? '',
      descricao: produto?.descricao ?? '',
      preco: produto?.preco ?? null,
      estoque: produto?.estoque ?? null,
      status: produto?.status ?? 'DISPONIVEL',
      tipo: produto?.tipo ?? '',
      publico: produto?.publico ?? '',
      imagemUrl: produto?.imagemUrl || produto?.imagem || '',
      areaNecessaria: this.primeiroNumero(produto?.areaNecessaria),
      dimensaoLargura: dimensoes[0] ?? null,
      dimensaoComprimento: dimensoes[1] ?? null,
      requisitosEnergia: this.primeiroNumero(produto?.requisitosEnergia),
      faixaEtaria: this.primeiroNumero(produto?.faixaEtaria),
      publicoAlvo: produto?.publicoAlvo ?? '',
      itensInclusos: produto?.itensInclusos ?? ''
    };

    this.imagemPreview = this.normalizarImagem(this.produto.imagemUrl);
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

  private normalizarImagem(imagem: string): string {
    if (!imagem) return 'assets/images/castelo.png';
    if (imagem.startsWith('http') || imagem.startsWith('assets/') || imagem.startsWith('data:')) return imagem;
    return `assets/images/${imagem}`;
  }

  private primeiroNumero(valor: unknown): number | null {
    return this.extrairNumeros(valor)[0] ?? null;
  }

  private extrairNumeros(valor: unknown): number[] {
    if (valor === null || valor === undefined) return [];
    return String(valor)
      .match(/\d+([.,]\d+)?/g)
      ?.map((numero) => Number(numero.replace(',', '.')))
      .filter((numero) => !Number.isNaN(numero)) ?? [];
  }
}
