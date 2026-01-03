// src/app/pages/dashboard/dashboard.ts
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContatosService, Contato } from '../../core/services/contatos';
import { InstanciasService, InstanciaWhatsapp } from '../../core/services/instancias';
import { RelatoriosService, RelatorioEnvio } from '../../core/services/relatorios';
import { RouterLink } from '@angular/router'; // Importar RouterLink

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink], // Adicionar RouterLink aqui
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  contatos = signal<Contato[]>([]);
  instancias = signal<InstanciaWhatsapp[]>([]);
  relatorios = signal<RelatorioEnvio[]>([]); // Agora é uma lista de relatórios

  carregando = signal(true);

  constructor(
    private contatosService: ContatosService,
    private instanciasService: InstanciasService,
    private relatoriosService: RelatoriosService
  ) {}

  ngOnInit(): void {
    this.carregando.set(true);

    // Carrega contatos
    this.contatos.set(this.contatosService.contatos());

    // Carrega instâncias
    this.instanciasService.listar().subscribe({
      next: (data) => {
        this.instancias.set(data);
      },
      error: (err) => {
        console.error('Erro ao carregar instâncias', err);
        this.instancias.set([]);
      }
    });

    // Carrega TODOS os relatórios para as métricas e atividade recente
    this.relatoriosService.listarRelatorios().subscribe({
      next: (data) => {
        this.relatorios.set(data);
      },
      error: (err) => {
        console.error('Erro ao carregar relatórios', err);
        this.relatorios.set([]);
      }
    });

    this.carregando.set(false);
  }

  // Métricas
  contatosCount = computed(() => this.contatos()?.length || 0);

  totalEnvios = computed(() => {
    const relatorios = this.relatorios();
    if (!relatorios || relatorios.length === 0) return 0;
    return relatorios.reduce((sum, r) => sum + (r.totalContatos || 0), 0);
  });

  enviosComSucesso = computed(() => {
    const relatorios = this.relatorios();
    if (!relatorios || relatorios.length === 0) return 0;
    return relatorios.reduce((sum, r) => sum + (r.totalSucesso || 0), 0);
  });

  instanciasAtivas = computed(() => {
    const instancias = this.instancias();
    if (!instancias || instancias.length === 0) return 0;
    return instancias.filter(i => i.status_online).length;
  });

  instanciasTotal = computed(() => this.instancias()?.length || 0);

  taxaSucesso = computed(() => {
    const total = this.totalEnvios();
    const sucesso = this.enviosComSucesso();
    if (total === 0) return 0;
    const taxa = Math.round((sucesso / total) * 100);
    return isNaN(taxa) ? 0 : taxa;
  });

  // Atividade Recente (exibe os últimos 5 envios, por exemplo)
  recentEnvios = computed(() => {
    return this.relatorios()
      .sort((a, b) => new Date(b.dataEnvio).getTime() - new Date(a.dataEnvio).getTime())
      .slice(0, 5); // Exibe os 5 mais recentes
  });
}
