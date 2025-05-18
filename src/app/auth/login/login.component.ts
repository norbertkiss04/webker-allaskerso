import { Component, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-login',
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
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnDestroy {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  loading: boolean = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  onSubmit(): void {
    console.log('Login form submitted', this.loginForm.value);
    if (this.loginForm.valid) {
      this.errorMessage = null;
      this.loading = true;
      const { email, password } = this.loginForm.value;

      // Use the Observable-based login method
      const subscription = this.authService.login(email, password).subscribe({
        next: (user) => {
          console.log('Auth service response:', user);
          this.loading = false;

          if (user) {
            this.router.navigate(['/jobs']);
          } else {
            this.errorMessage =
              'Invalid credentials - please check your email and password';
          }
        },
        error: (error) => {
          console.error('Login error:', error);
          this.loading = false;
          this.errorMessage = 'Login failed - please try again later';
        },
      });

      this.subscriptions.push(subscription);
    } else {
      this.errorMessage = 'Please fill in all required fields correctly';
    }
  }
}
