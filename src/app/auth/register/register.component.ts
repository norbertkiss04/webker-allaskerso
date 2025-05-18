import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';

// Custom validator to check if passwords match
export const passwordMatchValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('passwordConfirm');

  return password && confirmPassword && password.value !== confirmPassword.value
    ? { passwordMismatch: true }
    : null;
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnDestroy {
  registerForm: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  loading: boolean = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group(
      {
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        passwordConfirm: ['', Validators.required],
      },
      { validators: passwordMatchValidator }
    );
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;

      // Remove passwordConfirm before sending to service
      const { passwordConfirm, ...userData } = this.registerForm.value;

      const subscription = this.authService.register(userData).subscribe({
        next: (newUser) => {
          this.successMessage = 'Registration successful! Redirecting...';
          this.errorMessage = null;
          this.loading = false;

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1500);
        },
        error: (error) => {
          this.errorMessage =
            error.message === 'Email already registered'
              ? 'This email is already registered. Please use a different email.'
              : 'Registration failed. Please try again.';
          this.successMessage = null;
          this.loading = false;
          console.error('Registration error:', error);
        },
      });

      this.subscriptions.push(subscription);
    }
  }

  // Helper method to check if passwords match
  passwordsMatch(): boolean {
    const password = this.registerForm.get('password')?.value;
    const confirmPassword = this.registerForm.get('passwordConfirm')?.value;
    return password === confirmPassword;
  }
}
