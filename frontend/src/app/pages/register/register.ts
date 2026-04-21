import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  message: string = '';
  error: string = '';
  isLoading: boolean = false;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  onSubmit() {
    this.message = '';
    this.error = '';

    if (!this.username || !this.email || !this.password || !this.confirmPassword) {
      this.error = 'Please fill in all fields.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }

    this.isLoading = true;

    this.apiService.register({
      username: this.username,
      email: this.email,
      password: this.password
    }).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Register response:', response);
        this.message = 'Registration successful! You can now log in.';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1200);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Register error:', error);
        this.error = 'Registration failed. Please check your data.';
      }
    });
  }
}