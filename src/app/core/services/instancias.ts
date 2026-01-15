import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface InstanciaWhatsapp {
  instancia_nome: string;
  perfil_nome: string | null;
  perfil_foto: string | null;
  whatsapp_jid: string;
  status_online: boolean;
  status_original: string;
  data_criacao: string;
  api_origem: string;
}

export interface QRCodeResponse {
  pairingCode: string | null;
  code: string;
  base64: string;
  count: number;
}

@Injectable({ providedIn: 'root' })
export class InstanciasService {
  private baseUrl = `${environment.apiUrl}/message-api/instancias`;

  constructor(private http: HttpClient) {}

  listar() {
    return this.http.get<any>(this.baseUrl).pipe(
      map((resp) => {
        // Garantir que a resposta é um array
        const lista: any[] = Array.isArray(resp) ? resp : [];

        // Mapear os dados para a interface InstanciaWhatsapp
        const convertidas: InstanciaWhatsapp[] = lista.map((i) => {
          // status_online pode vir como boolean, string "true"/"false", ou 0/1
          let statusOnline = false;
          if (typeof i.status_online === 'boolean') {
            statusOnline = i.status_online;
          } else if (typeof i.status_online === 'string') {
            statusOnline = i.status_online.toLowerCase() === 'true' || i.status_online === '1';
          } else if (typeof i.status_online === 'number') {
            statusOnline = i.status_online === 1;
          }

          const instancia: InstanciaWhatsapp = {
            instancia_nome: i.instancia_nome,
            perfil_nome: i.perfil_nome ?? null,
            perfil_foto: i.perfil_foto ?? null,
            whatsapp_jid: i.whatsapp_jid,
            status_online: statusOnline,
            status_original: i.status_original ?? 'close',
            data_criacao: i.data_criacao,
            api_origem: i.api_origem,
          };
          return instancia;
        });

        return convertidas;
      }),
      catchError((err) => {
        return of<InstanciaWhatsapp[]>([]);
      })
    );
  }


  reconectar(instancia: string) {
    return this.http.get<QRCodeResponse[]>(
      `${environment.apiUrl}/925455d1-d0d5-44da-9217-a27a76b90d2e/message-api/instancia/connect/${instancia}`
    ).pipe(
      map(response => {
        // A API retorna um array, pegamos o primeiro elemento
        if (Array.isArray(response) && response.length > 0) {
          return response[0];
        }
        // Fallback caso não seja array
        return response as any as QRCodeResponse;
      })
    );
  }
}
