import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Job } from '../../shared/model';

@Injectable({
  providedIn: 'root',
})
export class JobService {
  private readonly STORAGE_KEY = 'jobs';

  constructor() {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      const defaultJobs: Job[] = [
        {
          id: '1',
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
          id: '2',
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
          id: '3',
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
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(defaultJobs));
    }
  }

  createJob(job: Omit<Job, 'id'>): Observable<Job> {
    try {
      const jobs = this.getJobsFromStorage();
      const nextNumericId =
        jobs.length > 0 ? Math.max(...jobs.map((j) => parseInt(j.id, 10))) + 1 : 1;
      const newJob: Job = { ...job, id: nextNumericId.toString() };

      jobs.push(newJob);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(jobs));

      return of(newJob);
    } catch (error) {
      return throwError(() => new Error('Failed to create job'));
    }
  }

  getJobs(): Observable<Job[]> {
    try {
      const jobs = this.getJobsFromStorage();
      return of(jobs);
    } catch (error) {
      return throwError(() => new Error('Failed to get jobs'));
    }
  }

  getJobById(id: string): Observable<Job | undefined> {
    try {
      const jobs = this.getJobsFromStorage();
      const job = jobs.find((j) => j.id === id);
      return of(job);
    } catch (error) {
      return throwError(() => new Error(`Failed to get job with id ${id}`));
    }
  }

  // UPDATE
  updateJob(updatedJob: Job): Observable<Job> {
    try {
      const jobs = this.getJobsFromStorage();
      const index = jobs.findIndex((j) => j.id === updatedJob.id);

      if (index === -1) {
        return throwError(() => new Error(`Job with id ${updatedJob.id} not found`));
      }

      jobs[index] = updatedJob;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(jobs));

      return of(updatedJob);
    } catch (error) {
      return throwError(() => new Error('Failed to update job'));
    }
  }

  // DELETE
  deleteJob(id: string): Observable<boolean> {
    try {
      const jobs = this.getJobsFromStorage();
      const filteredJobs = jobs.filter((j) => j.id !== id);

      if (filteredJobs.length === jobs.length) {
        return throwError(() => new Error(`Job with id ${id} not found`));
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredJobs));

      return of(true);
    } catch (error) {
      return throwError(() => new Error('Failed to delete job'));
    }
  }

  // Helper method to get jobs from localStorage
  private getJobsFromStorage(): Job[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }
}
