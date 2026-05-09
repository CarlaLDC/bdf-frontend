import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
 
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
}
 