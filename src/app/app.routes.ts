import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { EnviarMensagensComponent } from './pages/enviar-mensagens/enviar-mensagens';
import { ConfirmarEnvioComponent } from './pages/confirmar-envio/confirmar-envio';
import { EnvioConcluıdoComponent } from './pages/envio-concluido/envio-concluido';
import { ImportarContatosComponent } from './pages/importar-contatos/importar-contatos';
import { InstanciasComponent } from './pages/instancias/instancias';
import { RelatoriosComponent } from './pages/relatorios/relatorios';
import { DetalheRelatorioComponent } from './pages/relatorios/detalhe-relatorio/detalhe-relatorio';
import { LoginComponent } from './pages/login/login';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'enviar-mensagens', component: EnviarMensagensComponent },
      { path: 'confirmar-envio', component: ConfirmarEnvioComponent },
      { path: 'envio-concluido', component: EnvioConcluıdoComponent },
      { path: 'importar-contatos', component: ImportarContatosComponent },
      { path: 'instancias', component: InstanciasComponent },
      { path: 'relatorios', component: RelatoriosComponent },
      { path: 'relatorios/:id', component: DetalheRelatorioComponent }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
