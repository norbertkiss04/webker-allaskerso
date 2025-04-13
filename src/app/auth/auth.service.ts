import { Injectable } from '@angular/core';
import { User } from '../../shared/model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly USERS_KEY = 'jobportal_users';
  private currentUser: User | null = null;

  constructor() {
    this.initializeAdmin();
    const storedUser = localStorage.getItem('currentUser');
    this.currentUser = storedUser ? JSON.parse(storedUser) : null;
  }

  private initializeAdmin(): void {
    const users = this.getUsers();

    // Ensure admin exists
    const adminExists = users.some((u) => u.email === 'admin@admin.com');
    if (!adminExists) {
      const adminUser: User = {
        id: 1,
        name: 'Admin',
        email: 'admin@admin.com',
        password: 'admin',
        admin: true,
      };
      users.push(adminUser);
    }

    // Add test user if missing
    const testUserExists = users.some((u) => u.email === 'user@test.com');
    if (!testUserExists) {
      const testUser: User = {
        id: 2,
        name: 'Test User',
        email: 'user@test.com',
        password: 'test123',
        admin: false,
      };
      users.push(testUser);
    }

    this.saveUsers(users);
  }

  login(email: string, password: string): User | null {
    const user = this.getUsers().find(
      (u) => u.email === email && u.password === password
    );
    this.currentUser = user || null;
    if (this.currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    }
    return this.currentUser;
  }

  register(user: Omit<User, 'id'>): User {
    const users = this.getUsers();
    const newUser = { ...user, id: this.generateId(users) };
    this.saveUsers([...users, newUser]);
    return newUser;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAdmin(): boolean {
    return this.currentUser?.admin || false;
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
    window.location.href = '/'; // Redirect to root and force refresh
  }

  private getUsers(): User[] {
    const data = localStorage.getItem(this.USERS_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveUsers(users: User[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  private generateId(users: User[]): number {
    return users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;
  }
}
