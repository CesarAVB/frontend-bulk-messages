import { CommonModule } from '@angular/common';
import { Component, signal, OnInit, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule ],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class SidebarComponent implements OnInit {
  colapsada = signal(false);
  appVersion = '1.1.0';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.checkWindowSize();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkWindowSize();
  }

  checkWindowSize() {
    if (window.innerWidth <= 800) {
      this.colapsada.set(true);
    } else {
      this.colapsada.set(false);
    }
  }

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
