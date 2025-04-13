import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
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
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;

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

  onSubmit(): void {
    console.log('Login form submitted', this.loginForm.value);
    if (this.loginForm.valid) {
      this.errorMessage = null;
      const { email, password } = this.loginForm.value;

      // Simulate API call delay
      setTimeout(() => {
        try {
          const user = this.authService.login(email, password);
          console.log('Auth service response:', user);

          if (user) {
            this.router.navigate(['/jobs']);
          } else {
            this.errorMessage =
              'Invalid credentials - please check your email and password';
          }
        } catch (error) {
          console.error('Login error:', error);
          this.errorMessage = 'Login failed - please try again later';
        }
      }, 1000);
    } else {
      this.errorMessage = 'Please fill in all required fields correctly';
    }
  }
}
