import { Component, computed, input } from '@angular/core';
import { PatientStatus } from '../../../models/patient.model';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `
    <span class="status-badge">
      <span class="status-dot" [class]="dotClass()"></span>
      {{ label() }}
    </span>
  `,
  styles: [
    `
      .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        white-space: nowrap;
      }

      .status-dot {
        width: 11px;
        height: 11px;
        border-radius: 50%;
        flex: 0 0 auto;
      }

      .status-dot.active {
        background: #2bdc97;
      }

      .status-dot.pending {
        background: #ffae28;
      }

      .status-dot.inactive {
        background: #a6a6a6;
      }
    `
  ]
})
export class StatusBadgeComponent {
  readonly status = input.required<PatientStatus>();

  readonly label = computed(() => {
    const status = this.status();

    return status.charAt(0).toUpperCase() + status.slice(1);
  });

  readonly dotClass = computed(() => this.status());
}
