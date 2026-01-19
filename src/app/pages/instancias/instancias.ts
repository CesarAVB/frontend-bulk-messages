import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstanciasService, InstanciaWhatsapp, QRCodeResponse } from '../../core/services/instancias';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './instancias.html',
  styleUrls: ['./instancias.scss']
})
export class InstanciasComponent {
  instancias = signal<InstanciaWhatsapp[]>([]);
  carregando = signal(true);
  
  // Modal QR Code
  modalAberto = signal(false);
  qrCodeBase64 = signal<string>('');
  instanciaConectando = signal<string>('');
  private intervalId: any = null;

  constructor(private service: InstanciasService) {
    this.carregar();
  }

  ngOnDestroy() {
    this.limparInterval();
  }

  carregar() {
    this.carregando.set(true);
    
    // Delay de 2 segundos antes de carregar
    setTimeout(() => {
      this.service.listar().subscribe({
        next: (data) => {
          this.instancias.set(data);
          this.carregando.set(false);
        },
        error: (err) => {
          this.instancias.set([]);
          this.carregando.set(false);
        }
      });
    }, 2000);
  }

  conectadas = computed(() =>
    this.instancias().filter(i => i.status_online).length
  );

  desconectadas = computed(() =>
    this.instancias().filter(i => !i.status_online).length
  );

  reconectar(inst: InstanciaWhatsapp) {
    this.service.reconectar(inst.instancia_nome).subscribe(() => this.carregar());
  }

  abrirModalConexao(inst: InstanciaWhatsapp) {
    this.instanciaConectando.set(inst.instancia_nome);
    this.modalAberto.set(true);
    this.carregarQRCode();
    this.iniciarAtualizacaoQRCode();
  }

  fecharModal() {
    this.modalAberto.set(false);
    this.qrCodeBase64.set('');
    this.instanciaConectando.set('');
    this.limparInterval();
  }

  private carregarQRCode() {
    const instancia = this.instanciaConectando();
    if (!instancia) return;

    this.service.reconectar(instancia).subscribe({
      next: (response: QRCodeResponse) => {
        const qrCode = response.base64 || response.qrcode;
        if (qrCode) {
          this.qrCodeBase64.set(qrCode);
        }
      },
      error: (err) => {
        console.error('Erro ao carregar QR Code:', err);
      }
    });
  }

  private iniciarAtualizacaoQRCode() {
    this.limparInterval();
    
    // Atualizar a cada 35 segundos
    this.intervalId = setInterval(() => {
      if (this.modalAberto()) {
        this.carregarQRCode();
      } else {
        this.limparInterval();
      }
    }, 35000);
  }

  private limparInterval() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
