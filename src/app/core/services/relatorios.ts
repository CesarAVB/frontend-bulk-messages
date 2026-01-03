  // src/app/core/services/relatorios.ts
  import { Injectable, inject } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { environment } from '../../../environments/environment';
  import { Observable, map } from 'rxjs';

  @Injectable({ providedIn: 'root' })
  export class RelatoriosService {

    private http = inject(HttpClient);

    private readonly baseUrl = `${environment.apiUrl}/relatorios`;
    private readonly envioUrl = `${environment.apiUrl}/envios`;

    // ==========================================
    // LISTAR TODOS OS RELATÓRIOS
    // ==========================================
    listarRelatorios(): Observable<RelatorioEnvio[]> {
      return this.http.get<any[]>(this.baseUrl).pipe(
        map(lista => lista.map(item => this.mapRelatorio(item)))
      );
    }

    // ==========================================
    // OBTER DETALHE DE UM RELATÓRIO
    // ==========================================
    obterRelatorioPorId(id: string): Observable<RelatorioEnvio> {
      return this.http.get<any>(`https://n8nwebhook.redelognet.com.br/webhook/925455d1-d0d5-44da-9217-a27a76b90d2e/message-api/relatorios/${id}`).pipe(
        map(item => this.mapRelatorio(item))
      );
    }

    // ==========================================
    // LISTAR ITENS DO ENVIO (SUCESSO / ERRO)
    // ==========================================
    itensDoEnvio(id: string): Observable<ItemEnvio[]> {
      return this.http.get<any[]>(`https://n8nwebhook.redelognet.com.br/webhook/925455d1-d0d5-44da-9217-a27a76b90d2e/message-api/relatorios/${id}/itens`).pipe(
        map(lista => lista.map(item => this.mapItem(item)))
      );
    }

    // ==========================================
    // INICIAR NOVO ENVIO
    // ==========================================
    iniciarEnvio(
      idModeloMensagem: string,
      nomeArquivo: string,
      nomeModeloMensagem: string,
      conteudoMensagem: string,
      contatos: any[]
    ) {
      const payload = {
        idModeloMensagem,
        nomeArquivo,
        nomeModeloMensagem,
        conteudoMensagem,
        contatos
      };

      return this.http.post(this.envioUrl, payload);
    }


    
    // ==========================================
    // MAPEAMENTO snake_case → camelCase
    // ==========================================
    private mapRelatorio(raw: any): RelatorioEnvio {
      return {
        id: raw.id,
        nomeArquivo: raw.nome_arquivo,
        nomeModelo: raw.nome_modelo,
        dataEnvio: raw.data_envio,
        totalContatos: raw.total_contatos,
        totalSucesso: raw.total_sucesso,
        totalErro: raw.total_erro,
        status: raw.status
      };
    }

    private mapItem(raw: any): ItemEnvio {
      return {
        id: raw.id,
        nome: raw.nome,
        telefone: raw.telefone,
        tipoTelefone: raw.tipo_telefone,
        status: raw.status,
        mensagemErro: raw.mensagem_erro,
        dataEnvio: raw.data_envio
      };
    }
  }

  // ==========================================
  // INTERFACES DO FRONT-END
  // ==========================================

  export interface RelatorioEnvio {
    id: string;
    nomeArquivo: string;
    nomeModelo: string;
    dataEnvio: string;

    totalContatos: number;
    totalSucesso: number;
    totalErro: number;

    status: 'PROCESSANDO' | 'CONCLUIDO' | 'CONCLUIDO_COM_ERROS' | 'FALHA';
  }

  export interface ItemEnvio {
    id: string;
    nome: string;
    telefone: string;
    tipoTelefone: 'PRIMARIO' | 'SECUNDARIO' | 'TERCIARIO';
    status: 'PENDENTE' | 'SUCESSO' | 'ERRO';
    mensagemErro?: string;
    dataEnvio: string;
  }
