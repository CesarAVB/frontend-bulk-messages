import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router'; // Importar ActivatedRoute e Router
import { RelatoriosService, RelatorioEnvio, ItemEnvio } from '../../../core/services/relatorios';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalhe-relatorio.html',
  styleUrls: ['./detalhe-relatorio.scss']
})
export class DetalheRelatorioComponent implements OnInit {
  relatorio = signal<RelatorioEnvio | null>(null);
  itens = signal<ItemEnvio[]>([]);

  constructor(
    private route: ActivatedRoute, // Para pegar o ID da URL
    private router: Router, // Para voltar
    private relatoriosService: RelatoriosService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const relatorioId = params.get('id');
      if (relatorioId) {
        // Buscar o relatório específico
        this.relatoriosService.obterRelatorioPorId(relatorioId).subscribe(
          (relatorioData) => {
            this.relatorio.set(relatorioData);
            // Se o relatório foi encontrado, buscar os itens
            if (relatorioData?.id) {
              this.relatoriosService.itensDoEnvio(relatorioData.id).subscribe(
                (itensData) => {
                  this.itens.set(itensData);
                },
                (error) => {
                  console.error('Erro ao carregar itens do envio:', error);
                }
              );
            }
          },
          (error) => {
            console.error('Erro ao carregar relatório:', error);
            // Tratar erro, talvez redirecionar ou exibir mensagem
            this.router.navigate(['/relatorios']); // Volta para a lista se o relatório não for encontrado
          }
        );
      } else {
        this.router.navigate(['/relatorios']); // Volta para a lista se não tiver ID
      }
    });
  }

  itensSucesso() {
    return this.itens().filter(i => i.status === 'SUCESSO');
  }

  itensErro() {
    return this.itens().filter(i => i.status === 'ERRO');
  }

  voltar(): void {
    this.router.navigate(['/relatorios']); // Volta para a lista de relatórios
  }
}
