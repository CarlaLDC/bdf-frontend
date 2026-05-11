import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-perfil-admin',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './perfil-admin.component.html',
  styleUrl: './perfil-admin.component.css',
})
export class PerfilAdmin {
  usuario = this.carregarUsuario();

  get nome(): string {
    const nomeCompleto = [this.usuario?.nome, this.usuario?.sobrenome].filter(Boolean).join(' ');
    return nomeCompleto || this.usuario?.name || 'Administrador';
  }

  get cpf(): string {
    return this.usuario?.cpf || '000.000.000-00';
  }

  get email(): string {
    return this.usuario?.email || 'tmarangoni@admbau.com';
  }

  private carregarUsuario(): any {
    const usuario = localStorage.getItem('usuario');
    if (!usuario) return null;

    try {
      return JSON.parse(usuario);
    } catch {
      return null;
    }
  }
}

export { PerfilAdmin as PerfilAdminComponent };
