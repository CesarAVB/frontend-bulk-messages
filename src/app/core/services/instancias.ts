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

@Injectable({ providedIn: 'root' })
export class InstanciasService {
  private baseUrl = `${environment.apiUrl}/instancias`;

  constructor(private http: HttpClient) {}

  listar() {
    return this.http.get<any>(this.baseUrl).pipe(
      map((resp) => {
        console.log('RESP BRUTO DO BACKEND >>>', resp);

        // Garantir que a resposta é um array
        const lista: any[] = Array.isArray(resp) ? resp : [];

        console.log('LISTA COMO ARRAY >>> length =', lista.length);

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
          console.log(`Instância ${i.instancia_nome}:`, { 
            original: i.status_online, 
            tipo: typeof i.status_online, 
            convertido: statusOnline 
          });
          return instancia;
        });

        console.log(
          'INSTANCIAS CONVERTIDAS >>> length =',
          convertidas.length,
          convertidas
        );

        return convertidas;
      }),
      catchError((err) => {
        console.error('ERRO AO LISTAR INSTANCIAS', err);
        return of<InstanciaWhatsapp[]>([]);
      })
    );
  }

  reconectar(id: string) {
    return this.http.post(`${this.baseUrl}/${id}/reconectar`, {});
  }
}
