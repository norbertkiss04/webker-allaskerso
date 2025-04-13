import { Routes } from '@angular/router';
import { JobsComponent } from './jobs/jobs.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { BookmarksComponent } from './bookmarks/bookmarks.component';

export const routes: Routes = [
  { path: 'jobs', component: JobsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'bookmarks', component: BookmarksComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
