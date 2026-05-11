import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProdutoPayload {
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  status: string;
  tipo: string;
  publico: string;
  imagem?: string;
  imagemUrl?: string;
  areaNecessaria?: string;
  dimensoes?: string;
  requisitosEnergia?: string;
  faixaEtaria?: string;
  publicoAlvo?: string;
  itensInclusos?: string;
}
 
@Injectable({
  providedIn: 'root'  // Disponível em toda a aplicação
})
export class ProdutoServices {
  private apiUrl = 'http://localhost:8080/api/products';
 
  constructor(private http: HttpClient) {}
 
  // ===== MÉTODOS (o que tem dentro) =====
 
  // 1️⃣ Listar produtos com filtros
  getProducts(publico?: string, tipo?: string, nome?: string): Observable<any> {
    let params = new URLSearchParams();
    if (publico) params.append('publico', publico);
    if (tipo) params.append('tipo', tipo);
    if (nome) params.append('nome', nome);
    
    const url = params.toString() ? `${this.apiUrl}?${params}` : this.apiUrl;
    return this.http.get(url);  // ← Chamada HTTP GET
  }
 
  // 2️⃣ Buscar produto por ID
  getProductById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);  // ← GET /api/products/1
  }

  // 3️⃣ Criar produto
  createProduct(produto: ProdutoPayload): Observable<any> {
    return this.http.post(this.apiUrl, produto, this.getHeaders());
  }

  // 4️⃣ Atualizar produto
  updateProduct(id: number, produto: ProdutoPayload): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, produto, this.getHeaders());
  }

  private getHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return {
      headers: new HttpHeaders(headers)
    };
  }
}
 
