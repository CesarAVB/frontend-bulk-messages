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
  variaveis: Record<string, string> = {};
  enviando = false;

  get conteudoFormatado(): string {
    // Suporte a variáveis agrupadas em 'variavel' (payload novo) ou direto (payload antigo)
    let variaveisObj: Record<string, string> = {};
    if (this.variaveis && typeof this.variaveis === 'object') {
      // Se vier agrupado (payload novo)
      if ('variavel' in this.variaveis && typeof (this.variaveis as any).variavel === 'object') {
        variaveisObj = (this.variaveis as any).variavel;
      } else {
        variaveisObj = this.variaveis;
      }
    }
    // DEBUG: log para depuração
    console.log('Prévia - modelo:', this.modeloSelecionado?.conteudo);
    console.log('Prévia - variaveisObj:', variaveisObj);
    if (!this.modeloSelecionado?.conteudo) return 'Nenhum modelo selecionado.';
    let conteudo = this.modeloSelecionado.conteudo;
    const variaveisNormalizadas: Record<string, string> = {};
    for (const nome in variaveisObj) {
      if (Object.prototype.hasOwnProperty.call(variaveisObj, nome)) {
        // Se vier como 'variavel.mes', extrai só 'mes'
        let nomeLimpo = nome.trim().toLowerCase();
        if (nomeLimpo.startsWith('variavel.')) {
          nomeLimpo = nomeLimpo.replace(/^variavel\./, '');
        }
        variaveisNormalizadas[nomeLimpo] = variaveisObj[nome];
      }
    }
    conteudo = conteudo.replace(/{{\s*([\wÀ-ÿ_]+)\s*}}/gi, (match: string, p1: string) => {
      const chave = p1.trim().toLowerCase();
      let valor = undefined;
      if (variaveisNormalizadas.hasOwnProperty(chave)) {
        valor = variaveisNormalizadas[chave];
      } else {
        for (const k in variaveisNormalizadas) {
          if (k.toLowerCase() === chave) {
            valor = variaveisNormalizadas[k];
            break;
          }
        }
      }
      // DEBUG: log para depuração
      if (valor === undefined) {
        console.warn('Variável não encontrada para', chave, 'em', variaveisNormalizadas);
      }
      return valor !== undefined ? valor : match;
    });
    return conteudo.replace(/\\n/g, '\n');
  }

  constructor(
    private router: Router,
    private mensagensService: MensagensService
  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { modelo: any, contatos: any[], arquivo: any, variaveis?: Record<string, string> };
    this.modeloSelecionado = state?.modelo;
    this.contatos = state?.contatos || [];
    this.arquivo = state?.arquivo;
    this.variaveis = state?.variaveis || {};
  }

  voltar() {
    this.router.navigate(['/enviar-mensagens']);
  }

  confirmar() {
    this.enviando = true;
    
    // Delay de 2 segundos para demonstrar processamento
    setTimeout(() => {

      // Monta o payload agrupando as variáveis no campo 'variavel' como array de objetos { nome: valor }
      const variavelPayload: Array<{ [key: string]: string }> = [];
      for (const nome in this.variaveis) {
        if (Object.prototype.hasOwnProperty.call(this.variaveis, nome)) {
          let nomeLimpo = nome;
          if (nomeLimpo.startsWith('variavel.')) {
            nomeLimpo = nomeLimpo.replace(/^variavel\./, '');
          }
          const obj: { [key: string]: string } = {};
          obj[nomeLimpo] = this.variaveis[nome];
          variavelPayload.push(obj);
        }
      }
      const payload: any = {
        idModeloMensagem: this.modeloSelecionado?.id,
        nomeArquivo: this.arquivo?.fileName || '',
        nomeModeloMensagem: this.modeloSelecionado?.titulo || this.modeloSelecionado?.nome || '',
        conteudoMensagem: this.modeloSelecionado?.conteudo || '',
        contatos: this.contatos,
        variavel: variavelPayload
      };

      this.mensagensService.confirmarEnvio(payload).subscribe({
        next: (response) => {
          this.enviando = false;
          this.router.navigate(['/envio-concluido']);
        },
        error: (error) => {
          this.enviando = false;
          alert('Erro ao enviar mensagens. Tente novamente.');
        }
      });
    }, 2000);
  }
}
