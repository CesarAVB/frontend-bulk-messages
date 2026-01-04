// src/app/pages/dashboard/dashboard.ts
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContatosService, Contato } from '../../core/services/contatos';
import { InstanciasService, InstanciaWhatsapp } from '../../core/services/instancias';
import { RelatoriosService, RelatorioEnvio } from '../../core/services/relatorios';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {

  contatos = signal<Contato[]>([]);
  instancias = signal<InstanciaWhatsapp[]>([]);
  relatorios = signal<RelatorioEnvio[]>([]);  // <- CORRIGIDO

  carregando = signal(true);

  constructor(
    private contatosService: ContatosService,
    private instanciasService: InstanciasService,
    private relatoriosService: RelatoriosService
  ) {}

  ngOnInit(): void {
    this.carregando.set(true);

    // Contatos
    this.contatos.set(this.contatosService.contatos());

    // Instâncias
    this.instanciasService.listar().subscribe({
      next: (data) => this.instancias.set(data),
      error: (error) => {
        this.instancias.set([]);
      }
    });

    // Relatórios (atividade recente + métricas)
    this.relatoriosService.listarRelatorios().subscribe({
      next: (data) => this.relatorios.set(data),
      error: (error) => {
        this.relatorios.set([]);
      }
    });

    this.carregando.set(false);
  }

  // -------- MÉTRICAS --------

  contatosCount = computed(() =>
    this.contatos()?.length || 0
  );

  totalEnvios = computed(() => {
    const rel = this.relatorios();
    if (!rel || rel.length === 0) return 0;
    return rel.reduce((s, r) => s + (r.totalContatos || 0), 0);
  });

  enviosComSucesso = computed(() => {
    const rel = this.relatorios();
    if (!rel || rel.length === 0) return 0;
    return rel.reduce((s, r) => s + (r.totalSucesso || 0), 0);
  });

  instanciasAtivas = computed(() =>
    this.instancias()?.filter(i => i.status_online).length || 0
  );

  instanciasTotal = computed(() =>
    this.instancias()?.length || 0
  );

  taxaSucesso = computed(() => {
    const total = this.totalEnvios();
    const sucesso = this.enviosComSucesso();
    if (total === 0) return 0;
    return Math.round((sucesso / total) * 100);
  });

  // -------- ATIVIDADE RECENTE --------

  recentEnvios = computed(() => {
    const rel = this.relatorios();
    if (!rel || rel.length === 0) return [];

    return rel
      .sort((a, b) =>
        new Date(b.dataEnvio).getTime() -
        new Date(a.dataEnvio).getTime()
      )
      .slice(0, 5);
  });
}
