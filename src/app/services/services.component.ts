import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServicesComponent {

  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // ===== AUTENTICAÇÃO =====
  register(dados: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, dados);
  }

  login(email: string, senha: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { email, senha });
  }

  // ===== PRODUTOS =====
  getProducts(publico?: string, tipo?: string, minPrice?: number, maxPrice?: number, nome?: string): Observable<any> {
    let params = '';
    if (publico) params += `?publico=${publico}`;
    if (tipo) params += `${params ? '&' : '?'}tipo=${tipo}`;
    if (minPrice) params += `${params ? '&' : '?'}minPrice=${minPrice}`;
    if (maxPrice) params += `${params ? '&' : '?'}maxPrice=${maxPrice}`;
    if (nome) params += `${params ? '&' : '?'}nome=${nome}`;
    return this.http.get(`${this.apiUrl}/products${params}`, this.getHeaders());
  }

  getProductById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/products/${id}`, this.getHeaders());
  }

  // ===== ENDEREÇO =====
  searchAddress(cep: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/address/cep/${cep}`, this.getHeaders());
  }

  // ===== CARRINHO =====
  getCart(): Observable<any> {
    return this.http.get(`${this.apiUrl}/cart`, this.getHeaders());
  }

  addToCart(productId: number, quantidade: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/cart/items`, { productId, quantidade }, this.getHeaders());
  }

  updateCartItem(itemId: number, quantidade: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/cart/items/${itemId}?quantidade=${quantidade}`, {}, this.getHeaders());
  }

  removeFromCart(itemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cart/items/${itemId}`, this.getHeaders());
  }

  // ===== RESERVAS =====
  checkout(request: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reservations/checkout`, request, this.getHeaders());
  }

  getMyReservations(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reservations/my`, this.getHeaders());
  }

  cancelReservation(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/reservations/${id}/cancel`, {}, this.getHeaders());
  }

  // ===== USUÁRIO =====
  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/me`, this.getHeaders());
  }

  deleteAccount(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/me`, this.getHeaders());
  }

  private getHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  }
}
