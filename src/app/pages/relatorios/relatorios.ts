// src/app/pages/relatorios/relatorios.ts
import { Component, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // Importar DatePipe
import { RelatoriosService, RelatorioEnvio } from '../../core/services/relatorios';
import { interval, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

@Component({
  standalone: true,
  imports: [CommonModule, DatePipe], // Adicionar DatePipe
  templateUrl: './relatorios.html',
  styleUrls: ['./relatorios.scss']
})
export class RelatoriosComponent implements OnInit, OnDestroy {
  envios = signal<RelatorioEnvio[]>([]);
  carregando = signal(true);
  erro = signal<string | null>(null);

  private pollingSubscription: Subscription | undefined;
  private readonly POLLING_INTERVAL_MS = 10000; // Atualiza a cada 10 segundos

  constructor(private relatoriosService: RelatoriosService) {}

  ngOnInit(): void {
    this.iniciarPolling();
  }

  ngOnDestroy(): void {
    this.pararPolling();
  }

  iniciarPolling(): void {
    this.pararPolling(); // Garante que não há múltiplas subscriptions

    this.pollingSubscription = interval(this.POLLING_INTERVAL_MS)
      .pipe(
        startWith(0), // Executa imediatamente na inicialização
        switchMap(() => this.relatoriosService.listarRelatorios())
      )
      .subscribe({
        next: (data) => {
          this.envios.set(data);
          this.carregando.set(false);
          this.erro.set(null);
          console.log('Relatórios atualizados:', data);
        },
        error: (err) => {
          console.error('Erro ao carregar relatórios:', err);
          this.erro.set('Não foi possível carregar os relatórios. Tente novamente mais tarde.');
          this.carregando.set(false);
        }
      });
  }

  pararPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = undefined;
    }
  }

  // Função auxiliar para obter a classe CSS do status
  getStatusClass(status: RelatorioEnvio['status']): string {
    switch (status) {
      case 'PROCESSANDO': return 'status-processing';
      case 'CONCLUIDO': return 'status-success';
      case 'CONCLUIDO_COM_ERROS': return 'status-warning';
      case 'FALHA': return 'status-error';
      default: return 'status-default';
    }
  }
}
