import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register {
  registerData = {
    username: '',
    email: '',
    password: '',
    password2: ''
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

    if (this.registerData.password !== this.registerData.password2) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.isSubmitting = true;

    this.apiService.register(this.registerData).subscribe({
      next: () => {
        this.successMessage = 'Registration successful!';
        this.isSubmitting = false;

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1000);
      },
      error: (error) => {
        console.error('Register error:', error);

        if (error.status === 400) {
          if (error.error?.username) {
            this.errorMessage = Array.isArray(error.error.username)
              ? error.error.username[0]
              : 'This username is already taken.';
          } else if (error.error?.email) {
            this.errorMessage = Array.isArray(error.error.email)
              ? error.error.email[0]
              : 'This email is already in use.';
          } else if (error.error?.password) {
            this.errorMessage = Array.isArray(error.error.password)
              ? error.error.password[0]
              : 'Password is not valid.';
          } else if (error.error?.password2) {
            this.errorMessage = Array.isArray(error.error.password2)
              ? error.error.password2[0]
              : 'Confirm password is not valid.';
          } else {
            this.errorMessage = 'Please check your data and try again.';
          }
        } else if (error.status === 0) {
          this.errorMessage = 'Cannot connect to server.';
        } else {
          this.errorMessage = 'Could not register. Please try again.';
        }

        this.isSubmitting = false;
      }
    });
  }
}