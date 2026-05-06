import { Schema, model, type HydratedDocument } from 'mongoose';

export type PatientStatus = 'active' | 'pending' | 'inactive';

export interface IPatient {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  status: PatientStatus;
  registeredDate: string;
}

export type PatientDocument = HydratedDocument<IPatient>;

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

const PatientSchema = new Schema<IPatient>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    dateOfBirth: { type: String, required: true },
    status: { type: String, enum: ['active', 'pending', 'inactive'], default: 'pending' },
    registeredDate: { type: String, default: () => new Date().toISOString() }
  },
  {
    versionKey: false
  }
);

export const Patient = model<IPatient>('Patient', PatientSchema);
