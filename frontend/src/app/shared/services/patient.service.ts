import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CreatePatientRequest,
  DashboardStats,
  PaginatedResponse,
  Patient,
  PatientStatus,
  UpdatePatientStatusRequest
} from '../../models/patient.model';

export interface PatientListParams {
  search?: string;
  status?: PatientStatus;
  page: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private readonly apiUrl = '/api';

  constructor(private readonly http: HttpClient) {}

  getPatients(params: PatientListParams): Observable<PaginatedResponse<Patient>> {
    let httpParams = new HttpParams()
      .set('page', params.page)
      .set('pageSize', params.pageSize);

    if (params.search?.trim()) {
      httpParams = httpParams.set('search', params.search.trim());
    }

    if (params.status) {
      httpParams = httpParams.set('status', params.status);
    }

    return this.http.get<PaginatedResponse<Patient>>(`${this.apiUrl}/patients`, {
      params: httpParams
    });
  }

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }

  getPatient(id: string): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/patients/${id}`);
  }

  createPatient(request: CreatePatientRequest): Observable<Patient> {
    return this.http.post<Patient>(`${this.apiUrl}/patients`, request);
  }

  updatePatientStatus(id: string, request: UpdatePatientStatusRequest): Observable<Patient> {
    return this.http.put<Patient>(`${this.apiUrl}/patients/${id}`, request);
  }
}
