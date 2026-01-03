import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstanciasService, InstanciaWhatsapp } from '../../core/services/instancias';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './instancias.html',
  styleUrls: ['./instancias.scss']
})
export class InstanciasComponent {
  instancias = signal<InstanciaWhatsapp[]>([]);
  carregando = signal(true);

  constructor(private service: InstanciasService) {
    this.carregar();
  }

  carregar() {
    this.carregando.set(true);
    this.service.listar().subscribe({
      next: (data) => {
        console.log(
          'INSTANCIAS RECEBIDAS NO COMPONENTE >>> length =',
          data.length,
          data
        );
        data.forEach(inst => {
          console.log(`Instância ${inst.instancia_nome} - status_online: ${inst.status_online} (tipo: ${typeof inst.status_online})`);
        });
        this.instancias.set(data);
        this.carregando.set(false);
      },
      error: (err) => {
        console.error('ERRO AO CARREGAR INSTANCIAS', err);
        this.instancias.set([]);
        this.carregando.set(false);
      }
    });
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
}
