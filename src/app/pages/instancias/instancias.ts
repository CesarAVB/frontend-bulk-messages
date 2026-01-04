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
}
