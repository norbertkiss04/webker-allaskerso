import { Component, OnInit } from '@angular/core';
import { TruncatePipe } from '../../shared/truncate.pipe';
import { Job } from '../../shared/model';
import { MatDialog } from '@angular/material/dialog';
import { JobDialogComponent } from './job-dialog/job-dialog.component';
import { ConfirmationDialogComponent } from '../shared/confirmation-dialog/confirmation-dialog.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth.service';
import { BookmarkService } from '../bookmark.service';
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
export class JobsComponent {
  searchTerm = '';
  showDetails: { [key: number]: boolean } = {};
  bookmarks: number[] = [];

  constructor(
    public authService: AuthService,
    private bookmarkService: BookmarkService,
    private dialog: MatDialog
  ) {
    const savedJobs = localStorage.getItem('jobs');
    if (savedJobs) {
      this.jobs = JSON.parse(savedJobs);
    }
  }

  jobs: Job[] = [
    {
      id: 1,
      title: 'Frontend Fejlesztő (Senior)',
      company: 'Tech Corp International',
      location: 'Budapest, Magyarország',
      salary: 1200000,
      description:
        'Szenior Angular fejlesztői pozíció, amely Angular 15+, RxJS és NgRx állapotkezelés mély ismeretét követeli meg. Szükséges vállalati szintű alkalmazások fejlesztésének bizonyított tapasztalata.',
      longDescription:
        'Csatlakozz csapatunkhoz, ahol legújabb Angular alkalmazásokon dolgozhatsz. Együttműködés UX tervezőkkel és backend csapatokkal kiváló minőségű webalkalmazások létrehozásában.',
      requirements: ['Angular', 'TypeScript', 'HTML/CSS'],
      contactInfo: {
        email: 'careers@techcorp.hu',
        phone: '+36 123 4567',
      },
      createdDate: new Date(),
    },
    {
      id: 2,
      title: 'Backend Fejlesztő',
      company: 'Code Masters',
      location: 'Távoli',
      salary: 900000,
      description: 'Node.js backend fejlesztés',
      longDescription:
        'Skálázható mikroszolgáltatás architektúra fejlesztése Node.js és TypeScript használatával. Nagy forgalmú, elosztott rendszereken alapuló alkalmazások fejlesztése.',
      requirements: ['Node.js', 'PostgreSQL', 'REST API'],
      contactInfo: {
        email: 'hr@codemasters.com',
      },
      createdDate: new Date(),
    },
    {
      id: 3,
      title: 'UX Designer',
      company: 'Design Hub',
      location: 'Szeged',
      salary: 700000,
      description: 'Felhasználói élmény tervezés',
      longDescription:
        'Intuitív felhasználói felületek tervezése és felhasználói kutatások végrehajtása. Szoros együttműködés termékcsapatokkal prototípusok készítéséhez és teszteléséhez.',
      requirements: ['Figma', 'UI/UX', 'Prototípus készítés'],
      contactInfo: {
        email: 'design-jobs@designhub.hu',
        phone: '+36 987 6543',
      },
      createdDate: new Date(),
    },
  ];

  get filteredJobs() {
    return this.jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  toggleDetails(jobId: number): void {
    this.showDetails[jobId] = !this.showDetails[jobId];
  }

  toggleBookmark(job: Job): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.bookmarkService.toggleBookmark(user.id.toString(), job);
    }
  }

  isBookmarked(jobId: number): boolean {
    const user = this.authService.getCurrentUser();
    return user
      ? this.bookmarkService.isBookmarked(user.id.toString(), jobId)
      : false;
  }

  deleteJob(jobId: number): void {
    const confirmDialog = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Állás törlése',
        message: 'Biztosan törölni szeretnéd ezt az állást?',
      },
    });

    confirmDialog.afterClosed().subscribe((result) => {
      if (result) {
        this.jobs = this.jobs.filter((job) => job.id !== jobId);
        localStorage.setItem('jobs', JSON.stringify(this.jobs));
        this.bookmarkService.removeBookmarksForJob(jobId.toString());
      }
    });
  }

  openJobDialog(): void {
    const dialogRef = this.dialog.open(JobDialogComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        result.id = Math.max(...this.jobs.map((j) => j.id)) + 1;
        this.jobs.push(result);
        localStorage.setItem('jobs', JSON.stringify(this.jobs));
      }
    });
  }
}
