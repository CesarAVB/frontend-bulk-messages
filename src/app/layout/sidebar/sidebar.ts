import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule ],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class SidebarComponent {
  colapsada = signal(false);
  appVersion = '1.1.0';

  constructor(private router: Router) {}

  toggle() {
    this.colapsada.update(v => !v);
  }

  logout() {
    // Limpar dados de autenticação
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('rememberMe');
    
    // Redirecionar para login e forçar reload
    this.router.navigate(['/login']).then(() => {
      window.location.reload();
    });
  }
}
