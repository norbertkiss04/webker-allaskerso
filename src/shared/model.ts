export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: number;
  description: string;
  longDescription: string;
  requirements: string[];
  contactInfo: {
    email: string;
    phone?: string;
  };
  createdDate: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Optional for Firebase users
  admin: boolean;
}

export interface Bookmark {
  id: string;
  userId: string;
  jobId: string;
  createdDate: Date;
}

// Firebase specific interfaces
export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
