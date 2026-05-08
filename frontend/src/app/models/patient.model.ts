export type PatientStatus = 'active' | 'pending' | 'inactive';

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  status: PatientStatus;
  registeredDate: string;
}

export interface DashboardStats {
  total: number;
  active: number;
  pending: number;
  inactive: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreatePatientRequest {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  status: PatientStatus;
}

export interface UpdatePatientStatusRequest {
  status: PatientStatus;
}
