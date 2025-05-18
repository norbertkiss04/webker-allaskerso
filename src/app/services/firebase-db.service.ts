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
      }),
    );
  }

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
      }),
    );
  }

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
      }),
    );
  }

  updateJob(job: Job): Observable<Job> {
    const jobRef = doc(this.jobsCollection, job.id);

    const { id, ...jobData } = job;

    return from(updateDoc(jobRef, jobData)).pipe(map(() => job));
  }

  deleteJob(id: string): Observable<boolean> {
    const jobRef = doc(this.jobsCollection, id);

    return from(deleteDoc(jobRef)).pipe(map(() => true));
  }

  addBookmark(userId: string, jobId: string): Observable<boolean> {
    return from(
      addDoc(this.bookmarksCollection, {
        userId,
        jobId,
        createdAt: Timestamp.now(),
      }),
    ).pipe(map(() => true));
  }

  removeBookmark(userId: string, jobId: string): Observable<boolean> {
    const bookmarkQuery = query(
      this.bookmarksCollection,
      where('userId', '==', userId),
      where('jobId', '==', jobId),
    );

    return from(getDocs(bookmarkQuery)).pipe(
      map((snapshot) => {
        snapshot.forEach((doc) => {
          deleteDoc(doc.ref);
        });
        return true;
      }),
    );
  }

  getBookmarkedJobs(userId: string): Observable<Job[]> {
    const bookmarkQuery = query(this.bookmarksCollection, where('userId', '==', userId));

    return from(getDocs(bookmarkQuery)).pipe(
      map((snapshot) => snapshot.docs.map((doc) => doc.data()['jobId'] as string)),
      switchMap((jobIds) => {
        if (jobIds.length === 0) {
          return of([]);
        }

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
            }),
          ),
        );

        return forkJoin(jobObservables).pipe(
          map((jobs) => jobs.filter((job): job is Job => job !== null)),
        );
      }),
    );
  }

  isJobBookmarked(userId: string, jobId: string): Observable<boolean> {
    const bookmarkQuery = query(
      this.bookmarksCollection,
      where('userId', '==', userId),
      where('jobId', '==', jobId),
    );

    return from(getDocs(bookmarkQuery)).pipe(map((snapshot) => !snapshot.empty));
  }
}
