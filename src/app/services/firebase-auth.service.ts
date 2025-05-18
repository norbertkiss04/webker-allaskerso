import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { auth } from '../../app/app.config';

@Injectable({
  providedIn: 'root',
})
export class FirebaseAuthService {
  private currentUserSubject = new BehaviorSubject<FirebaseUser | null>(null);
  public currentUser$: Observable<FirebaseUser | null> = this.currentUserSubject.asObservable();
  private adminEmails: string[] = ['admin@example.com'];

  constructor(private router: Router) {
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error('Error setting persistence:', error);
    });

    onAuthStateChanged(auth, (user) => {
      this.currentUserSubject.next(user);
    });
  }

  register(email: string, password: string, name: string): Observable<any> {
    return from(
      createUserWithEmailAndPassword(auth, email, password).then(async (userCredential) => {
        return userCredential.user;
      }),
    );
  }

  login(email: string, password: string): Observable<any> {
    return from(
      signInWithEmailAndPassword(auth, email, password).then((userCredential) => {
        return userCredential.user;
      }),
    );
  }

  logout(): Observable<void> {
    return from(
      signOut(auth).then(() => {
        this.router.navigate(['/login']);
      }),
    );
  }

  isLoggedIn(): Observable<boolean> {
    return this.currentUser$.pipe(map((user) => !!user));
  }

  isAdmin(): Observable<boolean> {
    return this.currentUser$.pipe(
      map((user) => {
        if (!user) return false;
        return this.adminEmails.includes(user.email || '');
      }),
    );
  }

  getCurrentUser(): FirebaseUser | null {
    return this.currentUserSubject.value;
  }
}
