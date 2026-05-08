import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard'
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then((component) => component.DashboardComponent)
  },
  {
    path: 'patients/new',
    loadComponent: () =>
      import('./pages/patient-form/patient-form.component').then(
        (component) => component.PatientFormComponent
      )
  },
  {
    path: 'patients/:id',
    loadComponent: () =>
      import('./pages/patient-detail/patient-detail.component').then(
        (component) => component.PatientDetailComponent
      )
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
