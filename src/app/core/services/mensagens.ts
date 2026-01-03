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

@Injectable({ providedIn: 'root' })
export class MensagensService {
  private baseUrl = `${environment.apiUrl}/mensagens`;

  constructor(private http: HttpClient) {}

  listarModelos() {
    return this.http.get<ModeloMensagem[]>(`${this.baseUrl}/modelos`);
  }

  configurarEnvio(config: ConfiguracaoEnvio) {
    return this.http.post(`${this.baseUrl}/configuracao`, config);
  }

  confirmarEnvio(payload: { modeloId: string; quantidade: number }) {
    return this.http.post(`${this.baseUrl}/enviar`, payload);
  }
}
