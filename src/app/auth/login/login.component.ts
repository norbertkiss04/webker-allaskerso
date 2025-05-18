import { Component, OnDestroy } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
    MatProgressSpinnerModule,
    RouterModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnDestroy {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  loading: boolean = false;
  returnUrl: string = '/jobs';
  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: FirebaseAuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/jobs';
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  onSubmit(): void {
    console.log('Login form submitted', this.loginForm.value);
    if (this.loginForm.valid) {
      this.errorMessage = null;
      this.loading = true;
      const { email, password } = this.loginForm.value;

      const subscription = this.authService.login(email, password).subscribe({
        next: (user) => {
          console.log('Auth service response:', user);
          this.loading = false;
          this.router.navigateByUrl(this.returnUrl);
        },
        error: (error) => {
          console.error('Login error:', error);
          this.loading = false;
          if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            this.errorMessage = 'Invalid email or password';
          } else if (error.code === 'auth/too-many-requests') {
            this.errorMessage = 'Too many failed login attempts. Please try again later.';
          } else {
            this.errorMessage = 'Login failed - please try again later';
          }
        },
      });

      this.subscriptions.push(subscription);
    } else {
      this.errorMessage = 'Please fill in all required fields correctly';
    }
  }
}
