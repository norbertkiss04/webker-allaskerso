import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Job, Bookmark } from '../shared/model';

@Injectable({
  providedIn: 'root',
})
export class BookmarkService {
  private storageKey = (userId: string) => `bookmarks_${userId}`;

  // READ - Get all bookmarks for a user
  getBookmarks(userId: string): Observable<Job[]> {
    try {
      const data = localStorage.getItem(this.storageKey(userId));
      const bookmarks = data ? JSON.parse(data) : [];
      return of(bookmarks);
    } catch (error) {
      return throwError(() => new Error('Failed to get bookmarks'));
    }
  }

  // DELETE - Remove bookmarks for a specific job
  removeBookmarksForJob(jobId: string): Observable<boolean> {
    try {
      // Remove this job from all users' bookmarks
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('bookmarks_')) {
          const bookmarks = JSON.parse(localStorage.getItem(key) || '[]');
          const filtered = bookmarks.filter(
            (job: Job) => job.id !== Number(jobId)
          );
          localStorage.setItem(key, JSON.stringify(filtered));
        }
      });
      return of(true);
    } catch (error) {
      return throwError(() => new Error('Failed to remove bookmarks for job'));
    }
  }

  // CREATE/DELETE - Toggle bookmark (add or remove)
  toggleBookmark(userId: string, job: Job): Observable<Job[]> {
    try {
      const bookmarksData = localStorage.getItem(this.storageKey(userId));
      const bookmarks = bookmarksData ? JSON.parse(bookmarksData) : [];
      const index = bookmarks.findIndex((b: Job) => b.id === job.id);

      if (index > -1) {
        bookmarks.splice(index, 1);
      } else {
        bookmarks.push(job);
      }

      localStorage.setItem(this.storageKey(userId), JSON.stringify(bookmarks));
      return of(bookmarks);
    } catch (error) {
      return throwError(() => new Error('Failed to toggle bookmark'));
    }
  }

  // READ - Check if a job is bookmarked
  isBookmarked(userId: string, jobId: number): Observable<boolean> {
    try {
      const bookmarksData = localStorage.getItem(this.storageKey(userId));
      const bookmarks = bookmarksData ? JSON.parse(bookmarksData) : [];
      const isBookmarked = bookmarks.some((b: Job) => b.id === jobId);
      return of(isBookmarked);
    } catch (error) {
      return throwError(
        () => new Error('Failed to check if job is bookmarked')
      );
    }
  }
}
