import { Injectable } from '@angular/core';
import { Job } from '../shared/model';

@Injectable({
  providedIn: 'root',
})
export class BookmarkService {
  private storageKey = (userId: string) => `bookmarks_${userId}`;

  getBookmarks(userId: string): Job[] {
    const data = localStorage.getItem(this.storageKey(userId));
    return data ? JSON.parse(data) : [];
  }

  removeBookmarksForJob(jobId: string): void {
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
  }

  toggleBookmark(userId: string, job: Job): void {
    const bookmarks = this.getBookmarks(userId);
    const index = bookmarks.findIndex((b) => b.id === job.id);

    if (index > -1) {
      bookmarks.splice(index, 1);
    } else {
      bookmarks.push(job);
    }

    localStorage.setItem(this.storageKey(userId), JSON.stringify(bookmarks));
  }

  isBookmarked(userId: string, jobId: number): boolean {
    return this.getBookmarks(userId).some((b) => b.id === jobId);
  }
}
