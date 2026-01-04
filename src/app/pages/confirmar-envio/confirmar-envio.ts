import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MensagensService } from '../../core/services/mensagens';

@Component({
  selector: 'app-confirmar-envio',
  templateUrl: './confirmar-envio.html',
  styleUrls: ['./confirmar-envio.scss']
})
export class ConfirmarEnvioComponent {
  modeloSelecionado: any;
  contatos: any[] = [];
  arquivo: any;
  enviando = false;

  constructor(
    private router: Router,
    private mensagensService: MensagensService
  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { modelo: any, contatos: any[], arquivo: any };
    this.modeloSelecionado = state?.modelo;
    this.contatos = state?.contatos || [];
    this.arquivo = state?.arquivo;
  }

  voltar() {
    this.router.navigate(['/enviar-mensagens']);
  }

  confirmar() {
    this.enviando = true;
    
    const payload = {
      idModeloMensagem: this.modeloSelecionado?.id,
      nomeArquivo: this.arquivo?.fileName || '',
      nomeModeloMensagem: this.modeloSelecionado?.titulo || this.modeloSelecionado?.nome || '',
      conteudoMensagem: this.modeloSelecionado?.conteudo || '',
      contatos: this.contatos
    };

    this.mensagensService.confirmarEnvio(payload).subscribe({
      next: (response) => {
        this.enviando = false;
        this.router.navigate(['/envio-concluido']);
      },
      error: (error) => {
        this.enviando = false;
        console.error('Erro ao enviar mensagens:', error);
        alert('Erro ao enviar mensagens. Tente novamente.');
      }
    });
  }
}
