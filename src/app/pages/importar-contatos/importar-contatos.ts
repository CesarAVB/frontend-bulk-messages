// src/app/pages/importar-contatos/importar-contatos.ts
import { Component, effect, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ContatosService } from '../../core/services/contatos';
import { ArquivoUploadService, ArquivoImportado } from '../../core/services/arquivo-upload.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './importar-contatos.html',
  styleUrls: ['./importar-contatos.scss']
})
export class ImportarContatosComponent {
  arquivoNoServico;
  contatos$;
  
  paginaAtual = signal(1);
  itensPorPagina = 7;
  Math = Math;
  
  contatosPaginados = computed(() => {
    const todos = this.contatos$();
    const inicio = (this.paginaAtual() - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    return todos.slice(inicio, fim);
  });
  
  totalPaginas = computed(() => {
    return Math.ceil(this.contatos$().length / this.itensPorPagina);
  });

  constructor(
    private contatosService: ContatosService,
    private arquivoUploadService: ArquivoUploadService,
    private router: Router
  ) {
    this.arquivoNoServico = this.arquivoUploadService.arquivoAtual;
    this.contatos$ = this.contatosService.contatos;

    // Effect para reagir quando o arquivo no serviço muda
    effect(() => {
      // Se o arquivo for limpo do serviço (ou nunca foi definido), limpa os contatos
      if (!this.arquivoNoServico()) {
        this.contatosService.contatos.set([]);
        this.paginaAtual.set(1);
      }
    });
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.arquivoUploadService.clearArquivo(); // Limpa o serviço se nenhum arquivo for selecionado
      this.contatosService.contatos.set([]); // Garante que os contatos também sejam limpos
      return;
    }

    const file = input.files[0];
    this.arquivoUploadService.setArquivo(file); // Armazena o arquivo no serviço (com a nova validação interna)

    // Se o arquivo foi definido com sucesso no serviço (ou seja, passou na validação de tamanho > 0)
    if (this.arquivoUploadService.hasArquivo()) {
      this.contatosService.uploadArquivoXls(file); // Processa o arquivo
    } else {
      // Se o arquivo não foi definido no serviço (era vazio ou inválido), limpa os contatos
      this.contatosService.contatos.set([]);
    }
  }

  abrirSeletor(arquivoInput: HTMLInputElement) {
    arquivoInput.click();
  }

  removerArquivo() {
    this.arquivoUploadService.clearArquivo(); // Limpa o arquivo do serviço
    // O effect já deve limpar os contatos, mas podemos chamar explicitamente para garantir
    this.contatosService.contatos.set([]);

    // Resetar o input de arquivo para que o mesmo arquivo possa ser selecionado novamente
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  proximoPasso(): void {
    // O botão "Próximo" deve ser habilitado apenas se houver um arquivo válido E contatos carregados
    if (this.arquivoUploadService.hasArquivo() && this.contatos$().length > 0) {
      console.log('Arquivo e contatos prontos para processamento. Navegando...');
      this.router.navigate(['/enviar-mensagens']);
    } else {
      alert('Por favor, selecione um arquivo válido com contatos antes de prosseguir.');
    }
  }

  proximaPagina(): void {
    if (this.paginaAtual() < this.totalPaginas()) {
      this.paginaAtual.update(p => p + 1);
    }
  }

  paginaAnterior(): void {
    if (this.paginaAtual() > 1) {
      this.paginaAtual.update(p => p - 1);
    }
  }
}
