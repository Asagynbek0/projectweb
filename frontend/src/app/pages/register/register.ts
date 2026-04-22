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

    this.apiService.register(this.registerData).subscribe({
      next: (response) => {
        console.log('Register success:', response);
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
            this.errorMessage = 'This username is already taken.';
          } else if (error.error?.email) {
            this.errorMessage = 'This email is already in use.';
          } else {
            this.errorMessage = 'Please check your data and try again.';
          }
        } else {
          this.errorMessage = 'Could not register. Please try again.';
        }

        this.isSubmitting = false;
      }
    });
  }
}