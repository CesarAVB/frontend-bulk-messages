import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RelatoriosService, RelatorioEnvio, ItemEnvio } from '../../../core/services/relatorios';

@Component({
  selector: 'app-detalhe-relatorio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalhe-relatorio.html',
  styleUrls: ['./detalhe-relatorio.scss']
})
export class DetalheRelatorioComponent implements OnInit {

  relatorio = signal<RelatorioEnvio | null>(null);
  itens = signal<ItemEnvio[]>([]);
  carregando = signal(true);
  erroAberto = signal<string | null>(null);

  // Computed signals para totais
  totalSucesso = computed(() => this.itensSucesso().length);
  totalErro = computed(() => this.itensErro().length);
  totalEnviado = computed(() => this.itens().length);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private relatoriosService: RelatoriosService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      return;
    }

    this.relatoriosService.obterRelatorioPorId(id).subscribe({
      next: (detalhe) => this.relatorio.set(detalhe),
      error: (error) => {}
    });

    this.relatoriosService.itensDoEnvio(id).subscribe({
      next: (lista) => this.itens.set(lista),
      error: (error) => {},
      complete: () => this.carregando.set(false)
    });
  }

  // ===== MÉTODOS QUE O HTML PRECISA =====

  voltar(): void {
    this.router.navigate(['/relatorios']);
  }

  itensSucesso(): ItemEnvio[] {
    return this.itens().filter(i => i.status === 'SUCESSO');
  }

  itensErro(): ItemEnvio[] {
    return this.itens().filter(i => i.status === 'ERRO');
  }

  toggleErroPopover(mensagem: string, event: Event): void {
    event.stopPropagation();
    if (this.erroAberto() === mensagem) {
      this.erroAberto.set(null);
    } else {
      this.erroAberto.set(mensagem);
    }
  }

  fecharPopover(): void {
    this.erroAberto.set(null);
  }
}
