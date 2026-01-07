// src/app/pages/relatorios/relatorios.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RelatoriosService, RelatorioEnvio } from '../../core/services/relatorios';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './relatorios.html',
  styleUrls: ['./relatorios.scss']
})
export class RelatoriosComponent implements OnInit {

  // sinais exigidos pelo HTML
  carregando = signal(true);
  erro = signal<string | null>(null);
  envios = signal<RelatorioEnvio[]>([]);

  pageSize = 5;
  currentPage = 1;

  constructor(
    private relatoriosService: RelatoriosService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarRelatorios();
  }

  carregarRelatorios(): void {
    this.carregando.set(true);
    this.erro.set(null);

    // Delay de 2 segundos antes de carregar
    setTimeout(() => {
      this.relatoriosService.listarRelatorios().subscribe({
        next: (lista) => {
          // Garante que lista seja um array válido
          if (Array.isArray(lista)) {
            this.envios.set(lista);
          } else if (lista === null || lista === undefined) {
            this.envios.set([]);
          } else {
            this.envios.set([]);
          }

          // sempre volta para a primeira página ao recarregar
          this.currentPage = 1;
        },
        error: (err) => {
          this.erro.set('Não foi possível carregar os relatórios.');
          this.envios.set([]);
        },
        complete: () => this.carregando.set(false)
      });
    }, 2000);
  }

  get totalPages(): number {
    const total = this.envios().length;
    return total > 0 ? Math.ceil(total / this.pageSize) : 1;
  }

  get paginatedEnvios(): RelatorioEnvio[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.envios().slice(startIndex, startIndex + this.pageSize);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
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

  irParaDetalhe(id: string): void {
    if (id) {
      this.router.navigate(['/relatorios', id]);
    }
  }

  // Calcula o tempo de processamento entre dataCriacao e dataAtualizacao
  calcularTempoProcessamento(relatorio: RelatorioEnvio): string {
    if (!relatorio.dataCriacao || !relatorio.dataAtualizacao) {
      return '-';
    }

    const dataInicio = new Date(relatorio.dataCriacao);
    const dataFim = new Date(relatorio.dataAtualizacao);
    const diffMs = dataFim.getTime() - dataInicio.getTime();

    // Converte para segundos, minutos, horas
    const diffSegundos = Math.floor(diffMs / 1000);
    const diffMinutos = Math.floor(diffSegundos / 60);
    const diffHoras = Math.floor(diffMinutos / 60);

    if (diffHoras > 0) {
      return `${diffHoras}h ${diffMinutos % 60}m`;
    } else if (diffMinutos > 0) {
      return `${diffMinutos}m ${diffSegundos % 60}s`;
    } else {
      return `${diffSegundos}s`;
    }
  }

  // Calcula a taxa de sucesso em porcentagem
  calcularTaxaSucesso(relatorio: RelatorioEnvio): number {
    const total = relatorio.totalSucesso + relatorio.totalErro;
    
    if (total === 0) {
      return 0;
    }

    return Math.round((relatorio.totalSucesso / total) * 100);
  }

  // Retorna o texto amigável do status
  obterTextoStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PROCESSANDO': 'Processando',
      'CONCLUIDO': 'Concluído',
      'CONCLUIDO_COM_ERROS': 'Concluído com Erros',
      'FALHA': 'Falha'
    };
    return statusMap[status] || status;
  }

  // Retorna a classe CSS para a cor da barra de progresso baseada no percentual
  obterClasseBarraProgresso(percentual: number): string {
    if (percentual >= 80) {
      return 'progresso-barra__preenchimento--success';
    } else if (percentual >= 50) {
      return 'progresso-barra__preenchimento--warning';
    } else {
      return 'progresso-barra__preenchimento--error';
    }
  }
}
