import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookmarkService } from '../bookmark.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../auth/auth.service';
import { Job } from '../../shared/model';

@Component({
  selector: 'app-bookmarks',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './bookmarks.component.html',
  styleUrl: './bookmarks.component.scss',
})
export class BookmarksComponent {
  bookmarks: Job[] = [];

  constructor(
    private bookmarkService: BookmarkService,
    private authService: AuthService
  ) {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.bookmarks = this.bookmarkService.getBookmarks(user.id.toString());
    }
  }
}
