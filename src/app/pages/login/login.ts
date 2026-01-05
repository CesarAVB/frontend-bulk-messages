import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  showPassword: boolean = false;
  errorMessage: string = '';

  // Credenciais válidas
  private readonly VALID_EMAIL = 'cobranca@lognet.com.br';
  private readonly VALID_PASSWORD = 'lognet2019';

  constructor(private router: Router) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.errorMessage = '';

    // Validar credenciais
    if (this.email === this.VALID_EMAIL && this.password === this.VALID_PASSWORD) {
      // Salvar estado de autenticação
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', this.email);
      
      if (this.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      // Redirecionar para o dashboard
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage = 'E-mail ou senha incorretos';
    }
  }

  onCreateAccount(): void {
    console.log('Create account clicked');
  }
}