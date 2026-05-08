import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Patient, PatientStatus } from '../../models/patient.model';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { PatientService } from '../../shared/services/patient.service';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [RouterLink, SpinnerComponent, StatusBadgeComponent],
  templateUrl: './patient-detail.component.html',
  styleUrl: './patient-detail.component.css'
})
export class PatientDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly patientService = inject(PatientService);
  private readonly destroyRef = inject(DestroyRef);

  readonly patient = signal<Patient | null>(null);
  readonly isLoading = signal(false);
  readonly isStatusSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly statuses: PatientStatus[] = ['active', 'pending', 'inactive'];

  constructor() {
    const patientId = this.route.snapshot.paramMap.get('id');

    if (!patientId) {
      this.errorMessage.set('Patient ID is missing.');
      return;
    }

    this.loadPatient(patientId);
  }

  onStatusChange(event: Event): void {
    const patient = this.patient();
    const select = event.target as HTMLSelectElement;
    const status = select.value;

    if (!patient || !isPatientStatus(status) || status === patient.status) {
      return;
    }

    this.isStatusSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.patientService
      .updatePatientStatus(patient.id, { status })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updatedPatient) => {
          this.patient.set(updatedPatient);
          this.successMessage.set('Patient status updated.');
          this.isStatusSaving.set(false);
        },
        error: () => {
          this.errorMessage.set('Failed to update patient status.');
          this.isStatusSaving.set(false);
        }
      });
  }

  dismissError(): void {
    this.errorMessage.set(null);
  }

  dismissSuccess(): void {
    this.successMessage.set(null);
  }

  fullName(patient: Patient): string {
    return `${patient.firstName} ${patient.lastName}`;
  }

  formatDate(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}/${month}/${day}`;
  }

  private loadPatient(patientId: string): void {
    this.isLoading.set(true);

    this.patientService
      .getPatient(patientId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (patient) => {
          this.patient.set(patient);
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMessage.set('Failed to load patient details.');
          this.isLoading.set(false);
        }
      });
  }
}

function isPatientStatus(value: string): value is PatientStatus {
  return value === 'active' || value === 'pending' || value === 'inactive';
}
