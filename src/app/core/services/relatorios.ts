// src/app/core/services/relatorios.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RelatoriosService {

  private http = inject(HttpClient);

  private readonly baseUrl = `${environment.apiUrl}/relatorios`;
  private readonly envioUrl = `${environment.apiUrl}/envios`;

  // LISTA TODOS OS RELATÓRIOS
  listarRelatorios(): Observable<RelatorioEnvio[]> {
    return this.http.get<RelatorioEnvio[]>(this.baseUrl);
  }

  // OBTÉM UM RELATÓRIO ESPECÍFICO
  obterRelatorioPorId(id: string): Observable<RelatorioEnvio> {
    return this.http.get<RelatorioEnvio>(`${this.baseUrl}/${id}`);
  }

  // LISTA OS ITENS DO ENVIO (SUCESSO / ERRO)
  itensDoEnvio(id: string): Observable<ItemEnvio[]> {
    return this.http.get<ItemEnvio[]>(`${this.baseUrl}/${id}/itens`);
  }

  // INICIA UM PROCESSAMENTO DE ENVIO
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
}

// =======================
// INTERFACES USADAS
// =======================

export interface RelatorioEnvio {
  id: string;
  nomeArquivo: string;
  nomeModelo: string;
  dataEnvio: string;
  totalContatos: number;
  totalSucesso: number;
  totalErro: number;
  status: string;
}

export interface ItemEnvio {
  id: string;
  telefone: string;
  status: string;
  mensagemErro?: string;
  dataEnvio: string;
}
