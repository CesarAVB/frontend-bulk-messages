// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter, Routes, withComponentInputBinding } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { ConfirmarEnvioComponent } from './pages/confirmar-envio/confirmar-envio';
import { MainLayoutComponent } from './layout/main-layout/main-layout';
import { ImportarContatosComponent } from './pages/importar-contatos/importar-contatos';
import { EnviarMensagensComponent } from './pages/enviar-mensagens/enviar-mensagens';
import { InstanciasComponent } from './pages/instancias/instancias';
import { RelatoriosComponent } from './pages/relatorios/relatorios';
import { DetalheRelatorioComponent } from './pages/relatorios/detalhe-relatorio/detalhe-relatorio';
import { EnvioConcluıdoComponent } from './pages/envio-concluido/envio-concluido';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'importar-contatos', component: ImportarContatosComponent },
      { path: 'confirmar-envio', component: ConfirmarEnvioComponent },
      { path: 'envio-concluido', component: EnvioConcluıdoComponent },
      { path: 'enviar-mensagens', component: EnviarMensagensComponent },
      { path: 'instancias', component: InstanciasComponent },
      { path: 'relatorios', component: RelatoriosComponent },
      { path: 'relatorios/:id', component: DetalheRelatorioComponent }
    ]
  }
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(),
    importProvidersFrom(BrowserAnimationsModule),
  ],
};
