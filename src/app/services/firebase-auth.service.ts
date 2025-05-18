import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../../shared/model';
import { auth } from '../../app/app.config';

@Injectable({
  providedIn: 'root',
})
export class FirebaseAuthService {
  private currentUserSubject = new BehaviorSubject<FirebaseUser | null>(null);
  public currentUser$: Observable<FirebaseUser | null> =
    this.currentUserSubject.asObservable();

  constructor(private router: Router) {
    // Listen for auth state changes
    onAuthStateChanged(auth, (user) => {
      this.currentUserSubject.next(user);
    });
  }

  // Register a new user
  register(email: string, password: string, name: string): Observable<any> {
    return from(
      createUserWithEmailAndPassword(auth, email, password).then(
        async (userCredential) => {
          // You can store additional user data in Firestore here
          // For now, we'll just return the user
          return userCredential.user;
        }
      )
    );
  }

  // Login a user
  login(email: string, password: string): Observable<any> {
    return from(
      signInWithEmailAndPassword(auth, email, password).then(
        (userCredential) => {
          return userCredential.user;
        }
      )
    );
  }

  // Logout the current user
  logout(): Observable<void> {
    return from(
      signOut(auth).then(() => {
        this.router.navigate(['/login']);
      })
    );
  }

  // Check if user is logged in
  isLoggedIn(): Observable<boolean> {
    return this.currentUser$.pipe(map((user) => !!user));
  }

  // Check if current user is admin (you'll need to implement this with Firestore)
  isAdmin(): Observable<boolean> {
    // For now, we'll return false
    // In a real app, you would check a user's role in Firestore
    return this.currentUser$.pipe(map((user) => false));
  }

  // Get current user synchronously
  getCurrentUser(): FirebaseUser | null {
    return this.currentUserSubject.value;
  }
}
