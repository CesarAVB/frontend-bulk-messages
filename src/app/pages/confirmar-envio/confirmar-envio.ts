// src/app/pages/confirmar-envio/confirmar-envio.ts
import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Importar Router
import { ArquivoUploadService } from '../../core/services/arquivo-upload.service'; // Importar serviço de arquivo
import { ContatosService, Contato } from '../../core/services/contatos'; // Importar serviço de contatos
import { RelatoriosService } from '../../core/services/relatorios'; // Importar serviço de relatórios para iniciarEnvio
import { EnviarMensagensComponent } from '../enviar-mensagens/enviar-mensagens'; // Importar o componente para acessar o modelo selecionado (ou um serviço de estado)

// Interface para o modelo de mensagem (pode vir de um serviço de modelos)
interface ModeloMensagem {
  id: string;
  nome: string;
  conteudo: string;
}

@Component({
  standalone: true,
  selector: 'app-confirmar-envio',
  imports: [CommonModule],
  templateUrl: './confirmar-envio.html',
  styleUrls: ['./confirmar-envio.scss'],
})
export class ConfirmarEnvioComponent implements OnInit {
  // Injeção de dependências usando inject()
  private router = inject(Router);
  private arquivoUploadService = inject(ArquivoUploadService);
  contatosService = inject(ContatosService);
  private relatoriosService = inject(RelatoriosService);

  // Dados do arquivo e contatos vêm dos serviços
  arquivoInfo = this.arquivoUploadService.arquivoAtual;
  contatosParaEnvio = this.contatosService.contatos;

  // O modelo selecionado precisa ser passado de alguma forma.
  // Por simplicidade, vamos simular que ele está disponível aqui,
  // mas o ideal seria ter um serviço de estado (ex: NGRX, NgRx Signals, ou um serviço simples)
  // que o EnviarMensagensComponent atualizaria e este componente leria.
  // Por enquanto, vamos usar um signal local e, no ngOnInit, tentar pegar o último modelo selecionado
  // ou um mock se não houver.
  modeloSelecionado = signal<ModeloMensagem | null>(null);

  emEnvio = signal(false);

  ngOnInit(): void {
    // Validação inicial: se não há arquivo ou contatos, redireciona
    if (!this.arquivoUploadService.hasArquivo() || this.contatosService.contatos().length === 0) {
      console.warn('Nenhum arquivo ou contatos encontrados para confirmar. Redirecionando para importação.');
      this.router.navigate(['/importar-contatos']);
      return;
    }

    // --- Lógica para obter o modelo selecionado ---
    // Em um cenário real, o modelo selecionado viria de um serviço de estado
    // que o EnviarMensagensComponent teria atualizado.
    // Como não temos um serviço de estado global para o modelo ainda,
    // vamos simular que o modelo foi "passado" ou que temos uma forma de recuperá-lo.
    // Por enquanto, vamos usar um mock ou uma lógica simplificada.
    // O ideal seria:
    // this.modeloSelecionado.set(this.modeloStateService.getModeloSelecionado());

    // Para fins de demonstração, vamos usar um mock ou o primeiro modelo disponível
    // Se você tiver uma forma de passar o modelo do EnviarMensagensComponent para cá (ex: queryParams, ou um serviço compartilhado), use-a.
    // Caso contrário, o usuário precisaria selecionar novamente ou teríamos um modelo padrão.
    // Por agora, vamos pegar o primeiro modelo disponível como mock.
    const mockModelos: ModeloMensagem[] = [
      { id: '1', nome: 'Boas-vindas', conteudo: 'Olá {nome}! Seja bem-vindo(a)! Estamos muito felizes em tê-lo(a) conosco. Qualquer dúvida, estamos à disposição.' },
      { id: '2', nome: 'Promoção', conteudo: 'Olá {nome}! Temos uma oferta especial para você! Aproveite nossos descontos exclusivos por tempo limitado. Não perca!' },
      { id: '3', nome: 'Lembrete', conteudo: 'Olá {nome}! Este é um lembrete importante. Não esqueça do nosso compromisso. Aguardamos você!' },
    ];
    // Tenta pegar o modelo que foi "selecionado" na tela anterior.
    // Se você tem um serviço de estado, use-o aqui.
    // Caso contrário, o modelo precisa ser passado via Router state ou query params.
    // Por simplicidade, vamos pegar o primeiro modelo mockado para ter algo para exibir.
    this.modeloSelecionado.set(mockModelos[0]); // TODO: Substituir por lógica real de recuperação do modelo

    if (!this.modeloSelecionado()) {
      console.warn('Nenhum modelo de mensagem selecionado. Redirecionando para configuração de envio.');
      this.router.navigate(['/enviar-mensagens']);
    }
  }

  confirmar(): void {
    const arquivo = this.arquivoUploadService.arquivoAtual();
    const contatos = this.contatosService.contatos();
    const modelo = this.modeloSelecionado();

    if (!arquivo || !contatos || contatos.length === 0 || !modelo) {
      console.error('Dados incompletos para confirmar o envio.');
      alert('Não foi possível confirmar o envio. Faltam dados do arquivo, contatos ou modelo.');
      return;
    }

    this.emEnvio.set(true);

    // Chama o serviço de relatórios para iniciar o envio real
    this.relatoriosService.iniciarEnvio(
      modelo.id,
      arquivo.fileName,
      modelo.nome,
      modelo.conteudo,
      contatos.map(c => ({ // Mapeia os contatos para o formato esperado pelo backend
        nome: c.nome,
        telefonePrimario: c.telefonePrimario,
        telefoneSecundario: c.telefoneSecundario,
        telefoneTerciario: c.telefoneTerciario
      }))
    ).subscribe({
      next: (response) => {
        console.log('Envio confirmado e iniciado com sucesso!', response);
        alert('Envio iniciado com sucesso! Você será redirecionado para os relatórios.');
        // Limpa os dados dos serviços após o envio bem-sucedido
        this.arquivoUploadService.clearArquivo();
        this.contatosService.contatos.set([]);
        this.router.navigate(['/relatorios']); // Redireciona para a página de relatórios
      },
      error: (error) => {
        console.error('Erro ao confirmar e iniciar o envio:', error);
        alert('Ocorreu um erro ao iniciar o envio. Por favor, tente novamente.');
      },
      complete: () => {
        this.emEnvio.set(false); // Desativa o estado de carregamento
      }
    });
  }

  voltar(): void {
    this.router.navigate(['/enviar-mensagens']); // Volta para a tela de configuração de envio
  }
}
