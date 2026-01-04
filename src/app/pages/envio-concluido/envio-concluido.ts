import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-envio-concluido',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './envio-concluido.html',
  styleUrls: ['./envio-concluido.scss']
})
export class EnvioConcluıdoComponent {
  constructor(private router: Router) {}

  verRelatorio() {
    this.router.navigate(['/relatorios']);
  }

  novoEnvio() {
    this.router.navigate(['/enviar-mensagens']);
  }
}
