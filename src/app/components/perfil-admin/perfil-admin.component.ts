import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-perfil-admin',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './perfil-admin.component.html',
  styleUrl: './perfil-admin.component.css',
})
export class PerfilAdmin {}