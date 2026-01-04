// src/app/pages/enviar-mensagens/enviar-mensagens.ts
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ArquivoUploadService, ArquivoImportado } from '../../core/services/arquivo-upload.service';
import { ContatosService, Contato } from '../../core/services/contatos';
import { RelatoriosService } from '../../core/services/relatorios';
import { MensagensService, ModeloMensagem } from '../../core/services/mensagens';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './enviar-mensagens.html',
  styleUrls: ['./enviar-mensagens.scss']
})
export class EnviarMensagensComponent implements OnInit {
  // Signal para armazenar os modelos vindos do serviço
  modelosDisponiveis = signal<ModeloMensagem[]>([]);

  modeloSelecionadoId = signal<string | null>(null);
  carregandoEnvio = signal(false); // Este é o signal de carregamento para o botão de ENVIO FINAL

  // Computed para obter o objeto completo do modelo selecionado
  modeloSelecionado = computed(() => {
    const id = this.modeloSelecionadoId();
    return id ? this.modelosDisponiveis().find(m => m.id === id) : null;
  });

  // Computed para obter o conteúdo com quebras de linha processadas
  conteudoFormatado = computed(() => {
    const modelo = this.modeloSelecionado();
    if (!modelo) return '';
    return modelo.conteudo.replace(/\\n/g, '\n');
  });

  // Computed para verificar se o botão de envio deve estar habilitado
  isEnvioHabilitado = computed(() => {
    return (
      this.arquivoUploadService.hasArquivo() &&
      this.contatosService.contatos().length > 0 &&
      this.modeloSelecionado() !== null &&
      !this.carregandoEnvio()
    );
  });

  constructor(
    private router: Router,
    private http: HttpClient,
    public arquivoUploadService: ArquivoUploadService, // Público para acesso no template
    public contatosService: ContatosService,         // Público para acesso no template
    private relatoriosService: RelatoriosService,
    private mensagensService: MensagensService       // Novo serviço de mensagens
  ) {}

  ngOnInit(): void {
    // Carregar os modelos do serviço
    this.carregarModelos();
  }

  carregarModelos(): void {
    this.mensagensService.listarModelos().subscribe({
      next: (modelos) => {
        this.modelosDisponiveis.set(modelos);
        console.log('Modelos carregados com sucesso:', modelos);
      },
      error: (error) => {
        console.error('Erro ao carregar modelos:', error);
      }
    });
  }

  selecionarModelo(modeloId: string): void {
    this.modeloSelecionadoId.set(modeloId);
  }

  enviarMensagens(): void {
    const arquivoInfo = this.arquivoUploadService.arquivoAtual();
    const contatos = this.contatosService.contatos();
    const modelo = this.modeloSelecionado();

    if (!arquivoInfo || !modelo || contatos.length === 0) {
      console.error('Dados incompletos para o envio. Verifique o arquivo, modelo e contatos.');
      return;
    }

    // Encaminha para a página de confirmação de envio, levando os dados necessários
    this.router.navigate(['/confirmar-envio'], {
      state: {
        modelo,
        contatos,
        arquivo: arquivoInfo
      }
    });
  }
}
