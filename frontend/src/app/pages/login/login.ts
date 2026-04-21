import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  message: string = '';
  error: string = '';
  isLoading: boolean = false;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.message = '';
    this.error = '';

    if (!this.username || !this.password) {
      this.error = 'Username and password are required.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }

    this.isLoading = true;

    this.apiService.login({
      username: this.username,
      password: this.password
    }).subscribe({
      next: (response) => {
        this.isLoading = false;

        const token = response.token || response.access || response.access_token;

        if (token) {
          this.authService.setToken(token);
          this.message = 'Login successful!';
          this.router.navigate(['/home']);
        } else {
          this.error = 'Token was not returned by the server.';
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Login error:', error);
        this.error = 'Login failed. Please check your credentials.';
      }
    });
  }
}