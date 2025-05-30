import { Injectable } from '@angular/core';
import { User } from '../../shared/model';
import { Observable, of, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly USERS_KEY = 'jobportal_users';
  private readonly CURRENT_USER_KEY = 'currentUser';
  private currentUser: User | null = null;

  constructor() {
    this.initializeAdmin();
    const storedUser = localStorage.getItem(this.CURRENT_USER_KEY);
    this.currentUser = storedUser ? JSON.parse(storedUser) : null;
  }

  private initializeAdmin(): void {
    const users = this.getUsersSync();

    const adminExists = users.some((u) => u.email === 'admin@admin.com');
    if (!adminExists) {
      const adminUser: User = {
        id: '1',
        name: 'Admin',
        email: 'admin@admin.com',
        password: 'admin',
        admin: true,
      };
      users.push(adminUser);
    }
    const testUserExists = users.some((u) => u.email === 'user@test.com');
    if (!testUserExists) {
      const testUser: User = {
        id: '2',
        name: 'Test User',
        email: 'user@test.com',
        password: 'test123',
        admin: false,
      };
      users.push(testUser);
    }

    this.saveUsersSync(users);
  }

  getUsers(): Observable<User[]> {
    try {
      const users = this.getUsersSync();
      return of(users);
    } catch (error) {
      return throwError(() => new Error('Failed to get users'));
    }
  }

  register(user: Omit<User, 'id'>): Observable<User> {
    try {
      const users = this.getUsersSync();

      const emailExists = users.some((u) => u.email === user.email);
      if (emailExists) {
        return throwError(() => new Error('Email already registered'));
      }

      const newUser = { ...user, id: this.generateId(users), admin: false };
      this.saveUsersSync([...users, newUser]);
      return of(newUser);
    } catch (error) {
      return throwError(() => new Error('Failed to register user'));
    }
  }

  login(email: string, password: string): Observable<User | null> {
    try {
      const user = this.getUsersSync().find((u) => u.email === email && u.password === password);

      this.currentUser = user || null;

      if (this.currentUser) {
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(this.currentUser));
      }

      return of(this.currentUser);
    } catch (error) {
      return throwError(() => new Error('Failed to login'));
    }
  }
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAdmin(): boolean {
    return this.currentUser?.admin || false;
  }

  logout(): Observable<boolean> {
    try {
      this.currentUser = null;
      localStorage.removeItem(this.CURRENT_USER_KEY);
      return of(true).pipe(
        tap(() => {
          window.location.href = '/';
        }),
      );
    } catch (error) {
      return throwError(() => new Error('Failed to logout'));
    }
  }

  private getUsersSync(): User[] {
    const data = localStorage.getItem(this.USERS_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveUsersSync(users: User[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  private generateId(users: User[]): string {
    return users.length > 0 ? Math.max(...users.map((u) => parseInt(u.id, 10))) + 1 + '' : '1';
  }
}
