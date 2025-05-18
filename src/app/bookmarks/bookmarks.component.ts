import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookmarkService } from '../bookmark.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FirebaseAuthService } from '../services/firebase-auth.service';
import { Job } from '../../shared/model';
import { Subscription, interval, switchMap } from 'rxjs';

@Component({
  selector: 'app-bookmarks',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './bookmarks.component.html',
  styleUrl: './bookmarks.component.scss',
})
export class BookmarksComponent implements OnInit, OnDestroy {
  bookmarks: Job[] = [];
  private subscriptions: Subscription[] = [];
  private lastRefreshTime: Date | null = null;

  constructor(
    private bookmarkService: BookmarkService,
    private authService: FirebaseAuthService,
  ) {}

  ngOnInit(): void {
    console.log('BookmarksComponent initialized');
    this.loadBookmarks();
    const user = this.authService.getCurrentUser();
    if (user) {
      const refreshSubscription = interval(30000)
        .pipe(switchMap(() => this.bookmarkService.getBookmarks(user.uid)))
        .subscribe({
          next: (bookmarks) => {
            this.bookmarks = bookmarks;
            this.lastRefreshTime = new Date();
            console.log(`Bookmarks refreshed at ${this.lastRefreshTime.toLocaleTimeString()}`);
          },
          error: (error) => {
            console.error('Error refreshing bookmarks:', error);
          },
        });
      this.subscriptions.push(refreshSubscription);
    }
  }

  ngOnDestroy(): void {
    console.log('BookmarksComponent destroyed');
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    console.log('All subscriptions unsubscribed');
  }

  private loadBookmarks(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      const subscription = this.bookmarkService.getBookmarks(user.uid).subscribe({
        next: (bookmarks) => {
          this.bookmarks = bookmarks;
          console.log(`Loaded ${bookmarks.length} bookmarks`);
        },
        error: (error) => {
          console.error('Error loading bookmarks:', error);
        },
      });
      this.subscriptions.push(subscription);
    }
  }
}
