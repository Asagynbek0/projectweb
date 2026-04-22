import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  loginData = {
    username: '',
    password: ''
  };

  errorMessage = '';
  successMessage = '';
  isSubmitting = false;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  onSubmit(form: NgForm): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    this.apiService.login(this.loginData).subscribe({
      next: (response) => {
        console.log('Login success:', response);
        this.successMessage = 'Login successful!';
        this.isSubmitting = false;

        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 800);
      },
      error: (error) => {
        console.error('Login error:', error);

        if (error.status === 400 || error.status === 401) {
          this.errorMessage = 'Invalid username or password.';
        } else {
          this.errorMessage = 'Could not login. Please try again.';
        }

        this.isSubmitting = false;
      }
    });
  }
}