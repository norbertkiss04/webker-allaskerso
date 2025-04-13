import { Component, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { Job } from '../../../shared/model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-job-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
  ],
  template: `
    <h2 mat-dialog-title>Új állás hozzáadása</h2>
    <mat-dialog-content>
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline">
          <mat-label>Állás megnevezése</mat-label>
          <input matInput formControlName="title" required />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Cég neve</mat-label>
          <input matInput formControlName="company" required />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Helyszín</mat-label>
          <input matInput formControlName="location" required />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Fizetés</mat-label>
          <input matInput type="number" formControlName="salary" required />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Rövid leírás</mat-label>
          <textarea matInput formControlName="description" required></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Részletes leírás</mat-label>
          <textarea
            matInput
            formControlName="longDescription"
            required
          ></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Követelmények (vesszővel elválasztva)</mat-label>
          <input matInput formControlName="requirements" required />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Kapcsolattartó email</mat-label>
          <input
            matInput
            type="email"
            formControlName="contactEmail"
            required
          />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Telefonszám (opcionális)</mat-label>
          <input matInput type="tel" formControlName="contactPhone" />
        </mat-form-field>

        <mat-dialog-actions align="end">
          <button mat-button mat-dialog-close>Mégse</button>
          <button
            mat-raised-button
            color="primary"
            type="submit"
            [disabled]="!form.valid"
          >
            Mentés
          </button>
        </mat-dialog-actions>
      </form>
    </mat-dialog-content>
  `,
})
export class JobDialogComponent {
  form = new FormGroup({
    title: new FormControl('', Validators.required),
    company: new FormControl('', Validators.required),
    location: new FormControl('', Validators.required),
    salary: new FormControl(null, [Validators.required, Validators.min(0)]),
    description: new FormControl('', Validators.required),
    longDescription: new FormControl('', Validators.required),
    requirements: new FormControl('', Validators.required),
    contactEmail: new FormControl('', [Validators.required, Validators.email]),
    contactPhone: new FormControl(''),
  });

  constructor(
    public dialogRef: MatDialogRef<JobDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Job
  ) {}

  onSubmit() {
    if (this.form.valid) {
      const formValue = this.form.value;
      const job: Job = {
        id: 0, // Temporary ID for frontend
        title: formValue.title!,
        company: formValue.company!,
        location: formValue.location!,
        salary: +formValue.salary!, // Ensure numeric conversion
        description: formValue.description!,
        longDescription: formValue.longDescription!,
        requirements: formValue.requirements!.split(',').map((s) => s.trim()),
        contactInfo: {
          email: formValue.contactEmail!,
          phone: formValue.contactPhone?.toString() || undefined,
        },
        createdDate: new Date(),
      };
      this.dialogRef.close(job);
    }
  }
}
