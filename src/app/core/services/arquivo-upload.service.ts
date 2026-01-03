// src/app/core/services/arquivo-upload.service.ts
import { Injectable, signal } from '@angular/core';

export interface ArquivoImportado {
  file: File;
  fileName: string;
  fileSize: number;
  fileType: string;
}

@Injectable({
  providedIn: 'root'
})
export class ArquivoUploadService {
  // Garante que o signal comece explicitamente como null
  private _arquivoAtual = signal<ArquivoImportado | null>(null);

  constructor() {
    // Não há necessidade de lógica de inicialização aqui que possa definir um arquivo vazio.
  }

  setArquivo(file: File): void {
    // Adiciona uma verificação para garantir que o 'file' seja um objeto File válido
    if (file instanceof File && file.size > 0) { // Verifica se é um File e se tem tamanho > 0
      const arquivoImportado: ArquivoImportado = {
        file: file,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      };
      this._arquivoAtual.set(arquivoImportado);
      console.log('Arquivo definido no serviço:', arquivoImportado.fileName);
    } else {
      // Se o arquivo não for válido, limpa o estado
      this.clearArquivo();
      console.warn('Tentativa de definir um arquivo inválido ou vazio no serviço.');
    }
  }

  get arquivoAtual() {
    return this._arquivoAtual.asReadonly();
  }

  clearArquivo(): void {
    this._arquivoAtual.set(null);
    console.log('Arquivo limpo do serviço.');
  }

  hasArquivo(): boolean {
    // Verifica se o arquivo existe E se tem um tamanho maior que zero
    return this._arquivoAtual() !== null && this._arquivoAtual()!.fileSize > 0;
  }
}
