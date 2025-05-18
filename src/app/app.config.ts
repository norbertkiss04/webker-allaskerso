import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { environment } from '../environments/environment';

// Initialize Firebase and export instances for direct use if needed
export const app = initializeApp(environment.firebase);
export const auth = getAuth(app);
export const firestore = getFirestore(app);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    // We're using the Firebase SDK directly, so we don't need to provide it through Angular DI
  ],
};
