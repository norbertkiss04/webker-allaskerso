import {
  Component,
  OnInit,
  OnChanges,
  AfterViewInit,
  SimpleChanges,
  Input,
  ViewChild,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { TruncatePipe } from '../../shared/truncate.pipe';
import { Job } from '../../shared/model';
import { MatDialog } from '@angular/material/dialog';
import { JobDialogComponent } from './job-dialog/job-dialog.component';
import { ConfirmationDialogComponent } from '../shared/confirmation-dialog/confirmation-dialog.component';
import { CommonModule } from '@angular/common';
import { FirebaseAuthService } from '../services/firebase-auth.service';
import { BookmarkService } from '../bookmark.service';
import { JobService } from './job.service';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    TruncatePipe,
  ],
  templateUrl: './jobs.component.html',
  styleUrl: './jobs.component.scss',
})
export class JobsComponent
  implements OnInit, OnChanges, AfterViewInit, OnDestroy
{
  @Input() initialSearchTerm: string = '';
  @ViewChild('searchInput') searchInputElement!: ElementRef;

  lastSearchTime: Date | null = null;
  jobsLoaded: boolean = false;
  searchTerm = '';
  showDetails: { [key: string]: boolean } = {};
  bookmarks: string[] = [];
  jobs: Job[] = [];
  private subscriptions: Subscription[] = [];
  private bookmarkedJobs: { [key: string]: boolean } = {};

  constructor(
    public authService: FirebaseAuthService,
    private bookmarkService: BookmarkService,
    private jobService: JobService,
    private dialog: MatDialog
  ) {
    console.log('JobsComponent constructor called');
  }

  ngOnInit(): void {
    console.log('JobsComponent initialized');
    // Load jobs using the service
    this.loadJobs();

    // Apply initial search term if provided
    if (this.initialSearchTerm) {
      this.searchTerm = this.initialSearchTerm;
      console.log(`Initial search term applied: ${this.initialSearchTerm}`);
    }

    // Load bookmark status for current user
    this.loadBookmarkStatus();
  }

  private loadJobs(): void {
    const subscription = this.jobService.getJobs().subscribe({
      next: (jobs) => {
        this.jobs = jobs;
        this.jobsLoaded = true;
        console.log(`Loaded ${this.jobs.length} jobs from service`);
      },
      error: (error) => {
        console.error('Error loading jobs:', error);
      },
    });
    this.subscriptions.push(subscription);
  }

  private loadBookmarkStatus(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      const subscription = this.bookmarkService
        .getBookmarks(user.uid)
        .subscribe({
          next: (bookmarkedJobs) => {
            bookmarkedJobs.forEach((job) => {
              this.bookmarkedJobs[job.id] = true;
            });
          },
          error: (error) => {
            console.error('Error loading bookmarks:', error);
          },
        });
      this.subscriptions.push(subscription);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('JobsComponent input properties changed', changes);

    // React to changes in the initialSearchTerm input property
    if (
      changes['initialSearchTerm'] &&
      !changes['initialSearchTerm'].firstChange
    ) {
      const currentValue = changes['initialSearchTerm'].currentValue;
      const previousValue = changes['initialSearchTerm'].previousValue;

      console.log(
        `Search term changed from "${previousValue}" to "${currentValue}"`
      );

      // Update the search term and log the number of matching jobs
      this.searchTerm = currentValue;
      this.lastSearchTime = new Date();
      console.log(
        `Found ${
          this.filteredJobs.length
        } matching jobs at ${this.lastSearchTime.toLocaleTimeString()}`
      );
    }
  }

  ngAfterViewInit(): void {
    console.log('JobsComponent view initialized');

    // Focus on the search input if available
    if (this.searchInputElement) {
      // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
      setTimeout(() => {
        this.searchInputElement.nativeElement.focus();
        console.log('Search input focused');
      }, 0);
    }

    // Log the rendered job cards
    console.log(`Rendered ${this.filteredJobs.length} job cards in the view`);
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  get filteredJobs() {
    return this.jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  toggleDetails(jobId: string): void {
    this.showDetails[jobId] = !this.showDetails[jobId];
  }

  toggleBookmark(job: Job): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      const subscription = this.bookmarkService
        .toggleBookmark(user.uid, job)
        .subscribe({
          next: (updatedBookmarks) => {
            // Update local bookmarked status
            this.bookmarkedJobs[job.id] = !this.bookmarkedJobs[job.id];
          },
          error: (error) => {
            console.error('Error toggling bookmark:', error);
          },
        });
      this.subscriptions.push(subscription);
    }
  }

  isBookmarked(jobId: string): boolean {
    return this.bookmarkedJobs[jobId] || false;
  }

  deleteJob(jobId: string): void {
    const confirmDialog = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Állás törlése',
        message: 'Biztosan törölni szeretnéd ezt az állást?',
      },
    });

    confirmDialog.afterClosed().subscribe((result) => {
      if (result) {
        // Delete job using service
        const deleteSubscription = this.jobService.deleteJob(jobId).subscribe({
          next: (success) => {
            if (success) {
              // Remove from local array
              this.jobs = this.jobs.filter((job) => job.id !== jobId);

              // Remove bookmarks for this job
              const bookmarkSubscription = this.bookmarkService
                .removeBookmarksForJob(jobId)
                .subscribe({
                  error: (error) => {
                    console.error('Error removing bookmarks:', error);
                  },
                });
              this.subscriptions.push(bookmarkSubscription);
            }
          },
          error: (error) => {
            console.error('Error deleting job:', error);
          },
        });
        this.subscriptions.push(deleteSubscription);
      }
    });
  }

  openJobDialog(): void {
    const dialogRef = this.dialog.open(JobDialogComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Create job using service
        const subscription = this.jobService.createJob(result).subscribe({
          next: (newJob) => {
            // Add to local array
            this.jobs.push(newJob);
          },
          error: (error) => {
            console.error('Error creating job:', error);
          },
        });
        this.subscriptions.push(subscription);
      }
    });
  }
}
