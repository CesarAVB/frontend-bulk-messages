// src/app/core/services/contatos.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs'; // Adicionado 'tap' para o uploadArquivoXlsViaN8n
import * as XLSX from 'xlsx'; // Importar a biblioteca XLSX

export interface Contato {
  nome: string;
  telefonePrimario: string;
  telefoneSecundario?: string;
  telefoneTerciario?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContatosService {
  contatos = signal<Contato[]>([]);
  // private n8nApiUrl = 'SUA_URL_DO_N8N_PARA_PROCESSAR_ARQUIVO'; // Se estiver usando n8n para processar o arquivo
  // private baseUrl = 'SUA_URL_DO_BACKEND_PARA_UPLOAD'; // Se estiver usando um backend Java para upload

  constructor(private http: HttpClient) {}

  // Método para processar o arquivo XLSX localmente (se o n8n não estiver fazendo isso)
  // ESTE É O MÉTODO QUE ESTAVA CAUSANDO O ERRO E FOI CORRIGIDO
  uploadArquivoXls(arquivo: File) {
    // Validação inicial do arquivo
    if (!arquivo || !(arquivo instanceof File) || arquivo.size === 0) {
      this.contatos.set([]); // Limpa os contatos se o arquivo for inválido
      return;
    }

    const reader = new FileReader();

    reader.onload = (e: any) => {
      try {
        const bstr: string = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

        if (!wb.SheetNames.length) {
          this.contatos.set([]);
          return;
        }

        const wsname: string = wb.SheetNames[0];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];

        // Lê os dados sem usar 'header' para obter array de arrays
        // Depois pula a primeira linha (cabeçalho) usando slice(1)
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

        // Filtra linhas undefined/null ou vazias, E pula a primeira linha (cabeçalho)
        const loadedContatos: Contato[] = data
          .slice(1) // Pula a primeira linha (cabeçalho)
          .filter((row: any) => row !== undefined && row !== null && Array.isArray(row) && row.length > 0)
          .map((row: any) => ({
            nome: row[0] || '',
            telefonePrimario: row[1] ? String(row[1]).trim() : '', // Trim para limpar espaços
            telefoneSecundario: row[2] ? String(row[2]).trim() : undefined,
            telefoneTerciario: row[3] ? String(row[3]).trim() : undefined,
          }))
          .filter((c: Contato) => c.nome.trim() && c.telefonePrimario.trim()); // Filtra contatos válidos (nome e telefone primário obrigatórios)


        this.contatos.set(loadedContatos);
      } catch (error) {
        this.contatos.set([]); // Limpa em caso de erro
      }
    };

    reader.onerror = (error) => {
      this.contatos.set([]); // Limpa em caso de erro
    };

    reader.readAsBinaryString(arquivo);
  }

  // Se você estiver usando o n8n ou um backend para processar o arquivo e devolver o JSON,
  // você usaria um método como este (que já havíamos discutido):
  /*
  uploadArquivoXlsViaN8n(file: File): Observable<Contato[]> {
    if (!file || file.size === 0) {
      console.warn('Arquivo vazio ou inválido para upload de contatos via n8n.');
      this.contatos.set([]);
      return of([]);
    }

    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<Contato[]>(this.n8nApiUrl, formData).pipe(
      tap(loadedContatos => {
        this.contatos.set(loadedContatos);
        console.log('Contatos carregados via n8n:', loadedContatos.length);
      })
    );
  }
  */
}
