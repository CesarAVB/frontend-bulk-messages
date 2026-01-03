// src/app/pages/relatorios/relatorios.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RelatoriosService, RelatorioEnvio } from '../../core/services/relatorios';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './relatorios.html',
  styleUrls: ['./relatorios.scss']
})
export class RelatoriosComponent implements OnInit {

  // sinais exigidos pelo HTML
  carregando = signal(true);
  erro = signal<string | null>(null);
  envios = signal<RelatorioEnvio[]>([]);

  constructor(private relatoriosService: RelatoriosService) {}

  ngOnInit(): void {
    this.carregarRelatorios();
  }

  carregarRelatorios(): void {
    this.carregando.set(true);
    this.erro.set(null);

    this.relatoriosService.listarRelatorios().subscribe({
      next: (lista) => {
        this.envios.set(lista);
      },
      error: (err) => {
        console.error('Erro ao carregar relatórios:', err);
        this.erro.set('Não foi possível carregar os relatórios.');
        this.envios.set([]);
      },
      complete: () => this.carregando.set(false)
    });
  }

  // Método usado no HTML
  getStatusClass(status: string): string {
    switch (status) {
      case 'CONCLUIDO':
        return 'status-success';
      case 'CONCLUIDO_COM_ERROS':
        return 'status-warning';
      case 'FALHA':
        return 'status-error';
      default:
        return 'status-processing';
    }
  }
}
