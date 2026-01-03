// src/app/core/services/relatorios.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Contato } from './contatos'; // Assumindo que você tem essa interface

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
  telefone: string;
  status: 'PENDENTE' | 'SUCESSO' | 'ERRO';
  mensagemErro?: string;
  dataEnvio: string;
}

@Injectable({ providedIn: 'root' })
export class RelatoriosService {
  private baseUrl = `${environment.apiUrl}/relatorios`;

  // CORREÇÃO AQUI: Remove a duplicação de '/message-api'
  // Se environment.apiUrl é 'https://n8nwebhook.redelognet.com.br/webhook/message-api'
  // Então envioUrl será 'https://n8nwebhook.redelognet.com.br/webhook/message-api/envios'
  private envioUrl = `${environment.apiUrl}/envios`;

  constructor(private http: HttpClient) {}

  listarRelatorios(): Observable<RelatorioEnvio[]> {
    return this.http.get<RelatorioEnvio[]>(this.baseUrl);
  }

  obterRelatorioPorId(id: string): Observable<RelatorioEnvio> {
    return this.http.get<RelatorioEnvio>(`${this.baseUrl}/${id}`);
  }

  itensDoEnvio(relatorioId: string): Observable<ItemEnvio[]> {
    return this.http.get<ItemEnvio[]>(`${this.baseUrl}/${relatorioId}/itens`);
  }

  // O método iniciarEnvio é o que você estava procurando para o POST!
  // Ele está aqui no RelatoriosService.
  iniciarEnvio(
    idModeloMensagem: string,
    nomeArquivo: string,
    nomeModeloMensagem: string,
    conteudoMensagem: string,
    contatos: Contato[]
  ): Observable<any> {
    const payload = {
      idModeloMensagem,
      nomeArquivo,
      nomeModeloMensagem,
      conteudoMensagem,
      contatos
    };
    console.log('Enviando payload para o backend:', payload);
    // Usa o envioUrl corrigido
    return this.http.post(this.envioUrl, payload);
  }

  ultimoEnvio(): Observable<RelatorioEnvio> {
    return this.http.get<RelatorioEnvio>(`${this.baseUrl}/ultimo`);
  }
}
