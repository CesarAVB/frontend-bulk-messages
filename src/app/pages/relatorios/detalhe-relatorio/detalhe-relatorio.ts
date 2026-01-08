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
    const mensagemFormatada = this.formatarMensagemErro(mensagem);
    if (this.erroAberto() === mensagemFormatada) {
      this.erroAberto.set(null);
    } else {
      this.erroAberto.set(mensagemFormatada);
    }
  }

  formatarMensagemErro(mensagem: string): string {
    // Substitui \n por quebras de linha reais
    let formatted = mensagem.replace(/\\n/g, '\n');
    
    // Destaca linhas que começam com # (cabeçalhos) e formata JSON
    const lines = formatted.split('\n');
    const htmlLines: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.trim().startsWith('#')) {
        // Separa o cabeçalho do conteúdo
        const match = line.match(/^(#\s*[^:]+:)(.*)$/);
        if (match) {
          const header = match[1];
          let content = match[2].trim();
          const isCompleteMessage = header.toLowerCase().includes('complete message');
          const isTimestamp = header.toLowerCase().includes('timestamp');
          
          // Formata timestamp se detectado
          if (isTimestamp && content) {
            try {
              const date = new Date(content);
              if (!isNaN(date.getTime())) {
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const seconds = String(date.getSeconds()).padStart(2, '0');
                content = `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;
              }
            } catch (e) {
              // Se falhar, mantém o conteúdo original
            }
          }
          
          // Se não há conteúdo na mesma linha, verifica a próxima linha
          if (!content && i + 1 < lines.length) {
            content = lines[i + 1].trim();
            if (content && (content.startsWith('[') || content.startsWith('{'))) {
              try {
                const jsonObj = JSON.parse(content);
                const formattedJson = JSON.stringify(jsonObj, null, 2);
                
                // JSON detectado - sempre quebra linha
                htmlLines.push(`<strong class="erro-header">${header}</strong>`);
                htmlLines.push(formattedJson);
                
                i++; // Pula a próxima linha pois já foi processada
                continue;
              } catch (e) {
                // Se falhar o parse, continua normalmente
              }
            }
            // Se não é JSON mas tem conteúdo na próxima linha, adiciona inline
            if (content) {
              htmlLines.push(`<strong class="erro-header">${header}</strong> ${content}`);
              i++; // Pula a próxima linha
              continue;
            }
          } else if (content && (content.startsWith('[') || content.startsWith('{'))) {
            // JSON na mesma linha do cabeçalho
            try {
              const jsonObj = JSON.parse(content);
              const formattedJson = JSON.stringify(jsonObj, null, 2);
              
              // JSON detectado - sempre quebra linha
              htmlLines.push(`<strong class="erro-header">${header}</strong>`);
              htmlLines.push(formattedJson);
              continue;
            } catch (e) {
              // Se falhar o parse, mantém o conteúdo original inline
            }
          }
          
          // Adiciona inline se houver conteúdo simples
          if (content) {
            htmlLines.push(`<strong class="erro-header">${header}</strong> ${content}`);
          } else {
            htmlLines.push(`<strong class="erro-header">${header}</strong>`);
          }
          continue;
        }
        htmlLines.push(`<strong class="erro-header">${line}</strong>`);
      } else {
        htmlLines.push(line);
      }
    }
    
    return htmlLines.join('\n');
  }

  fecharPopover(): void {
    this.erroAberto.set(null);
  }
}
