import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import type { ChartData, ChartOptions, TooltipItem } from 'chart.js';
import { ChartModule } from 'primeng/chart';
import {
  DashboardStats,
  Patient,
  PatientStatus
} from '../../models/patient.model';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { PatientService } from '../../shared/services/patient.service';

type StatusFilter = PatientStatus | 'all';

interface SummaryMetric {
  label: string;
  value: number;
  status?: PatientStatus;
}

const tableFetchPageSize = 100;
const tableHeaderHeight = 34;
const tableRowHeight = 62;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ChartModule, RouterLink, SpinnerComponent, StatusBadgeComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  private readonly patientService = inject(PatientService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  readonly patients = signal<Patient[]>([]);
  readonly stats = signal<DashboardStats>({
    total: 0,
    active: 0,
    pending: 0,
    inactive: 0
  });
  readonly pageSize = signal(25);
  readonly search = signal('');
  readonly statusFilter = signal<StatusFilter>('all');
  readonly isStatsLoading = signal(false);
  readonly isPatientsLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly isLoading = computed(() => this.isStatsLoading() || this.isPatientsLoading());
  readonly tableMaxHeight = computed(
    () => `${tableHeaderHeight + this.pageSize() * tableRowHeight}px`
  );
  readonly summaryMetrics = computed<SummaryMetric[]>(() => {
    const stats = this.stats();

    return [
      { label: 'Total', value: stats.total },
      { label: 'Active', value: stats.active, status: 'active' },
      { label: 'Pending', value: stats.pending, status: 'pending' },
      { label: 'Inactive', value: stats.inactive, status: 'inactive' }
    ];
  });

  readonly doughnutData = computed<ChartData<'doughnut'>>(() => {
    const stats = this.stats();

    return {
      labels: ['Active', 'Pending', 'Inactive'],
      datasets: [
        {
          data: [stats.active, stats.pending, stats.inactive],
          backgroundColor: ['#2bdc97', '#ffae28', '#a6a6a6'],
          borderColor: '#ffffff',
          borderWidth: 10,
          borderRadius: 14,
          spacing: 4,
          hoverBackgroundColor: ['#2bdc97', '#ffae28', '#a6a6a6']
        }
      ]
    };
  });

  readonly doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '54%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        displayColors: false,
        callbacks: {
          label: (context: TooltipItem<'doughnut'>): string => {
            const label = context.label ?? 'Patients';
            const value =
              typeof context.raw === 'number' ? context.raw : Number(context.raw);
            const patientLabel = value === 1 ? 'patient' : 'patients';

            return `${label}: ${value} ${patientLabel}`;
          }
        }
      }
    }
  };

  readonly pageSizeOptions = [5, 10, 25] as const;

  constructor() {
    const successMessage = this.router.getCurrentNavigation()?.extras.state?.['successMessage'];

    if (typeof successMessage === 'string') {
      this.successMessage.set(successMessage);
    }

    this.loadDashboard();
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.search.set(input.value);
    this.loadPatients();
  }

  onStatusFilterChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;

    this.statusFilter.set(isStatusFilter(value) ? value : 'all');
    this.loadPatients();
  }

  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = Number(select.value);

    if (isPageSize(value)) {
      this.pageSize.set(value);
    }
  }

  dismissError(): void {
    this.errorMessage.set(null);
  }

  dismissSuccess(): void {
    this.successMessage.set(null);
  }

  rowNumber(index: number): number {
    return index + 1;
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

  private loadDashboard(): void {
    this.loadStats();
    this.loadPatients();
  }

  private loadStats(): void {
    this.isStatsLoading.set(true);

    this.patientService
      .getStats()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (stats) => {
          this.stats.set(stats);
          this.isStatsLoading.set(false);
        },
        error: () => {
          this.errorMessage.set('Failed to load dashboard statistics.');
          this.isStatsLoading.set(false);
        }
      });
  }

  private loadPatients(): void {
    this.isPatientsLoading.set(true);
    const selectedStatus = this.statusFilter();
    const patientParams =
      selectedStatus === 'all'
        ? {
            search: this.search(),
            page: 1,
            pageSize: tableFetchPageSize
          }
        : {
            search: this.search(),
            status: selectedStatus,
            page: 1,
            pageSize: tableFetchPageSize
          };

    this.patientService
      .getPatients(patientParams)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.patients.set(response.data);
          this.isPatientsLoading.set(false);
        },
        error: () => {
          this.errorMessage.set('Failed to load patients.');
          this.isPatientsLoading.set(false);
        }
      });
  }
}

function isStatusFilter(value: string): value is StatusFilter {
  return value === 'all' || value === 'active' || value === 'pending' || value === 'inactive';
}

function isPageSize(value: number): value is 5 | 10 | 25 {
  return value === 5 || value === 10 || value === 25;
}
