import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface ModeloMensagem {
  id: string;
  titulo: string;
  descricao: string;
  conteudo: string;
}

export interface ConfiguracaoEnvio {
  modeloId: string;
  quantidade: number;
}

export interface PayloadEnvio {
  idModeloMensagem: string;
  nomeArquivo: string;
  nomeModeloMensagem: string;
  conteudoMensagem: string;
  contatos: any[];
  [key: string]: any; // permite variáveis dinâmicas
}

@Injectable({ providedIn: 'root' })
export class MensagensService {
  private baseUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  listarModelos() {
    return this.http.get<ModeloMensagem[]>(`${this.baseUrl}/message-api/modelos`);
  }

  configurarEnvio(config: ConfiguracaoEnvio) {
    return this.http.post(`${this.baseUrl}/message-api/configuracao`, config);
  }

  confirmarEnvio(payload: PayloadEnvio) {
    return this.http.post(`${this.baseUrl}/message-api/envios`, payload);
  }
}
