import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../../core/services/login';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  showPassword: boolean = false;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    const remembered = localStorage.getItem('rememberMe') === 'true';
    if (remembered) {
      this.rememberMe = true;
      const savedEmail = localStorage.getItem('userEmail');
      if (savedEmail) {
        this.email = savedEmail;
      }
    } else {
      this.rememberMe = false;
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.isLoading = true;

    // Limpa qualquer token anterior antes de um novo login
    localStorage.removeItem('token');
    localStorage.removeItem('isAuthenticated');

    this.loginService.login(this.email, this.password).subscribe({
      next: (response) => {
        const token = response?.token;

        if (!token) {
          this.isLoading = false;
          this.errorMessage = 'Não foi possível autenticar. Tente novamente.';
          return;
        }

        // Salvar token JWT e estado de autenticação
        localStorage.setItem('token', token);
        localStorage.setItem('isAuthenticated', 'true');

        if (this.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('userEmail', this.email);
        } else {
          localStorage.removeItem('rememberMe');
          localStorage.removeItem('userEmail');
        }

        this.isLoading = false;
        // Redirecionar para o dashboard
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('isAuthenticated');
        this.isLoading = false;
        this.errorMessage = 'E-mail ou senha incorretos';
      }
    });
  }

  onCreateAccount(): void {
    console.log('Create account clicked');
  }
}