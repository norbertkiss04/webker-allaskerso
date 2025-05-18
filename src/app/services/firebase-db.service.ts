import { Injectable } from '@angular/core';
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';
import { Observable, from, map, switchMap, forkJoin, of } from 'rxjs';
import { Job } from '../../shared/model';
import { FirebaseAuthService } from './firebase-auth.service';

@Injectable({
  providedIn: 'root',
})
export class FirebaseDbService {
  private db = getFirestore();
  private jobsCollection = collection(this.db, 'jobs');
  private bookmarksCollection = collection(this.db, 'bookmarks');

  constructor(private authService: FirebaseAuthService) {}

  // Jobs CRUD operations

  // Create a new job
  createJob(job: Omit<Job, 'id'>): Observable<Job> {
    const jobWithDate = {
      ...job,
      createdDate: Timestamp.now(),
    };

    return from(addDoc(this.jobsCollection, jobWithDate)).pipe(
      map((docRef) => {
        return {
          ...job,
          id: docRef.id,
          createdDate: new Date(),
        } as Job;
      })
    );
  }

  // Get all jobs
  getJobs(): Observable<Job[]> {
    return from(getDocs(this.jobsCollection)).pipe(
      map((snapshot) => {
        return snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            createdDate: data['createdDate']?.toDate() || new Date(),
          } as Job;
        });
      })
    );
  }

  // Get a single job by ID
  getJobById(id: string): Observable<Job | undefined> {
    const jobRef = doc(this.jobsCollection, id);

    return from(getDoc(jobRef)).pipe(
      map((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          return {
            ...data,
            id: docSnap.id,
            createdDate: data['createdDate']?.toDate() || new Date(),
          } as Job;
        }
        return undefined;
      })
    );
  }

  // Update a job
  updateJob(job: Job): Observable<Job> {
    const jobRef = doc(this.jobsCollection, job.id);

    // Create a copy without the id field for Firestore
    const { id, ...jobData } = job;

    return from(updateDoc(jobRef, jobData)).pipe(map(() => job));
  }

  // Delete a job
  deleteJob(id: string): Observable<boolean> {
    const jobRef = doc(this.jobsCollection, id);

    return from(deleteDoc(jobRef)).pipe(map(() => true));
  }

  // Bookmarks operations

  // Add a bookmark
  addBookmark(userId: string, jobId: string): Observable<boolean> {
    return from(
      addDoc(this.bookmarksCollection, {
        userId,
        jobId,
        createdAt: Timestamp.now(),
      })
    ).pipe(map(() => true));
  }

  // Remove a bookmark
  removeBookmark(userId: string, jobId: string): Observable<boolean> {
    const bookmarkQuery = query(
      this.bookmarksCollection,
      where('userId', '==', userId),
      where('jobId', '==', jobId)
    );

    return from(getDocs(bookmarkQuery)).pipe(
      map((snapshot) => {
        snapshot.forEach((doc) => {
          deleteDoc(doc.ref);
        });
        return true;
      })
    );
  }

  // Get user's bookmarked jobs
  getBookmarkedJobs(userId: string): Observable<Job[]> {
    const bookmarkQuery = query(
      this.bookmarksCollection,
      where('userId', '==', userId)
    );

    return from(getDocs(bookmarkQuery)).pipe(
      // Extract job IDs from bookmarks
      map((snapshot) =>
        snapshot.docs.map((doc) => doc.data()['jobId'] as string)
      ),
      // If no bookmarks, return empty array
      switchMap((jobIds) => {
        if (jobIds.length === 0) {
          return of([]);
        }

        // Create an observable for each job
        const jobObservables = jobIds.map((jobId) =>
          from(getDoc(doc(this.jobsCollection, jobId))).pipe(
            map((docSnap) => {
              if (docSnap.exists()) {
                const data = docSnap.data();
                return {
                  ...data,
                  id: docSnap.id,
                  createdDate: data['createdDate']?.toDate() || new Date(),
                } as Job;
              }
              return null;
            })
          )
        );

        // Combine all job observables and filter out nulls
        return forkJoin(jobObservables).pipe(
          map((jobs) => jobs.filter((job): job is Job => job !== null))
        );
      })
    );
  }

  // Check if a job is bookmarked by the user
  isJobBookmarked(userId: string, jobId: string): Observable<boolean> {
    const bookmarkQuery = query(
      this.bookmarksCollection,
      where('userId', '==', userId),
      where('jobId', '==', jobId)
    );

    return from(getDocs(bookmarkQuery)).pipe(
      map((snapshot) => !snapshot.empty)
    );
  }
}
