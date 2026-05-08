import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { PatientService } from '../../shared/services/patient.service';
import { PatientStatus } from '../../models/patient.model';

type FormField = 'firstName' | 'lastName' | 'email' | 'dateOfBirth' | 'status';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, SpinnerComponent],
  templateUrl: './patient-form.component.html',
  styleUrl: './patient-form.component.css'
})
export class PatientFormComponent {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly patientService = inject(PatientService);
  private readonly router = inject(Router);

  readonly isSaving = signal(false);
  readonly submitted = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly statuses: PatientStatus[] = ['pending', 'active', 'inactive'];

  readonly form = this.formBuilder.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    dateOfBirth: ['', [Validators.required, notFutureDateValidator]],
    status: this.formBuilder.control<PatientStatus>('pending', [Validators.required])
  });

  submit(): void {
    this.submitted.set(true);
    this.errorMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);

    this.patientService.createPatient(this.form.getRawValue()).subscribe({
      next: () => {
        this.isSaving.set(false);
        void this.router.navigate(['/dashboard'], {
          state: { successMessage: 'Patient added successfully.' }
        });
      },
      error: () => {
        this.errorMessage.set('Failed to add patient. Please check the details and try again.');
        this.isSaving.set(false);
      }
    });
  }

  dismissError(): void {
    this.errorMessage.set(null);
  }

  showError(field: FormField): boolean {
    const control = this.form.controls[field];

    return this.submitted() && control.invalid;
  }

  fieldError(field: FormField): string {
    const control = this.form.controls[field];

    if (control.hasError('required')) {
      return 'This field is required.';
    }

    if (control.hasError('email')) {
      return 'Enter a valid email address.';
    }

    if (control.hasError('futureDate')) {
      return 'Date of birth cannot be in the future.';
    }

    if (control.hasError('invalidDate')) {
      return 'Use a valid date.';
    }

    return 'Invalid value.';
  }
}

const notFutureDateValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const value = control.value;

  if (typeof value !== 'string' || !value) {
    return null;
  }

  const selectedDate = new Date(`${value}T00:00:00`);

  if (Number.isNaN(selectedDate.getTime())) {
    return { invalidDate: true };
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  return selectedDate > today ? { futureDate: true } : null;
};
