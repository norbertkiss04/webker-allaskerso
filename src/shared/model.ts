export interface Job {
  id: number;
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
  id: number;
  name: string;
  email: string;
  password: string;
  admin: boolean;
}

export interface Bookmark {
  id: number;
  userId: number;
  jobId: number;
  createdDate: Date;
}
