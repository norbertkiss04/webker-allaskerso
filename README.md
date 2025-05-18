# Job Portal Application with Firebase

This Angular application is configured to use Firebase for authentication, database, and hosting.

## Implementation Order

The implementation follows this order:

1. **Firebase Project Setup and Configuration**
2. **Firebase Authentication**
3. **Route Protection with AuthGuard**
4. **Firebase Firestore Database**

## Firebase Setup

### Prerequisites

- Node.js and npm installed
- Angular CLI installed (`npm install -g @angular/cli`)
- Firebase CLI installed (`npm install -g firebase-tools`)

### Step 1: Firebase Project Setup

1. **Login to Firebase CLI**:

   ```bash
   firebase login
   ```

2. **Build the application**:

   ```bash
   ng build
   ```

3. **Deploy to Firebase**:
   ```bash
   firebase deploy
   ```

This will deploy both the hosting and Firestore rules.

## Firebase Authentication

The application uses Firebase Authentication for user management. Key features:

- Email/password authentication
- Protected routes with AuthGuard
- User profile management

### Authentication Flow

1. Users register with email/password
2. Login with credentials
3. AuthGuard protects routes that require authentication

## Route Protection with AuthGuard

Routes are protected using Angular route guards:

- `AuthGuard`: Ensures users are authenticated
- `AdminGuard`: Ensures users have admin privileges

To add protection to a route, update the route configuration in `app.routes.ts`:

```typescript
{
  path: 'protected-route',
  component: ProtectedComponent,
  canActivate: [AuthGuard]
}
```

## Firebase Firestore Database

The application uses Firestore for data storage:

- Jobs collection: Stores job listings
- Bookmarks collection: Stores user bookmarks
- Users collection: Stores additional user data

### Database Security Rules

Firestore security rules are configured in `firestore.rules`:

- Public read access for jobs
- Protected write access for jobs (admin only)
- User-specific access for bookmarks

## Development Workflow

1. **Run locally**:

   ```bash
   ng serve
   ```

2. **Test with Firebase emulators**:

   ```bash
   firebase emulators:start
   ```

3. **Deploy changes**:
   ```bash
   ng build
   firebase deploy
   ```

## Additional Resources

- [Angular Documentation](https://angular.io/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [AngularFire Documentation](https://github.com/angular/angularfire)
