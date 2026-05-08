import { Component, input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  template: `
    <div class="spinner" [class.compact]="compact()" aria-label="Loading"></div>
  `,
  styles: [
    `
      .spinner {
        width: 42px;
        height: 42px;
        border: 4px solid rgba(105, 107, 255, 0.18);
        border-top-color: #696bff;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      .spinner.compact {
        width: 20px;
        height: 20px;
        border-width: 3px;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `
  ]
})
export class SpinnerComponent {
  readonly compact = input(false);
}
