import { Router, type Request, type Response } from 'express';
import { isValidObjectId, type QueryFilter } from 'mongoose';
import {
  Patient,
  type IPatient,
  type PaginatedResponse,
  type PatientDocument,
  type PatientStatus
} from '../models/patient.model.js';

interface ErrorResponse {
  error: string;
}

interface PatientResponse extends IPatient {
  id: string;
}

interface IdParams {
  id: string;
}

interface CreatePatientInput {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  status: PatientStatus;
}

interface UpdatePatientStatusInput {
  status: PatientStatus;
}

type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

const patientStatuses: readonly PatientStatus[] = ['active', 'pending', 'inactive'];
const defaultPage = 1;
const defaultPageSize = 10;
const maxPageSize = 100;

export const patientsRouter = Router();

patientsRouter.get(
  '/',
  async (
    request: Request,
    response: Response<PaginatedResponse<PatientResponse> | ErrorResponse>
  ): Promise<void> => {
    try {
      const search = getQueryString(request.query.search);
      const status = getQueryString(request.query.status);
      const page = parsePositiveInteger(getQueryString(request.query.page), defaultPage);
      const pageSize = parsePageSize(getQueryString(request.query.pageSize));

      if (status !== undefined && !isPatientStatus(status)) {
        response.status(400).json({ error: 'Invalid patient status' });
        return;
      }

      const filter = buildPatientsFilter(search, status);
      const skip = (page - 1) * pageSize;

      const [patients, total] = await Promise.all([
        Patient.find(filter)
          .sort({ registeredDate: -1 })
          .skip(skip)
          .limit(pageSize)
          .exec(),
        Patient.countDocuments(filter).exec()
      ]);

      response.status(200).json({
        data: patients.map(toPatientResponse),
        total,
        page,
        pageSize
      });
    } catch {
      response.status(500).json({ error: 'Failed to fetch patients' });
    }
  }
);

patientsRouter.get(
  '/:id',
  async (
    request: Request<IdParams>,
    response: Response<PatientResponse | ErrorResponse>
  ): Promise<void> => {
    try {
      const { id } = request.params;

      if (!isValidObjectId(id)) {
        response.status(400).json({ error: 'Invalid patient ID' });
        return;
      }

      const patient = await Patient.findById(id).exec();

      if (!patient) {
        response.status(404).json({ error: 'Patient not found' });
        return;
      }

      response.status(200).json(toPatientResponse(patient));
    } catch {
      response.status(500).json({ error: 'Failed to fetch patient' });
    }
  }
);

patientsRouter.post(
  '/',
  async (
    request: Request<Record<string, never>, PatientResponse | ErrorResponse, unknown>,
    response: Response<PatientResponse | ErrorResponse>
  ): Promise<void> => {
    try {
      const parsedBody = parseCreatePatientInput(request.body);

      if (!parsedBody.ok) {
        response.status(400).json({ error: parsedBody.error });
        return;
      }

      const patient = await Patient.create(parsedBody.value);

      response.status(201).json(toPatientResponse(patient));
    } catch (error: unknown) {
      if (isDuplicateKeyError(error)) {
        response.status(400).json({ error: 'A patient with this email already exists' });
        return;
      }

      response.status(500).json({ error: 'Failed to create patient' });
    }
  }
);

patientsRouter.put(
  '/:id',
  async (
    request: Request<IdParams, PatientResponse | ErrorResponse, unknown>,
    response: Response<PatientResponse | ErrorResponse>
  ): Promise<void> => {
    try {
      const { id } = request.params;

      if (!isValidObjectId(id)) {
        response.status(400).json({ error: 'Invalid patient ID' });
        return;
      }

      const parsedBody = parseUpdatePatientStatusInput(request.body);

      if (!parsedBody.ok) {
        response.status(400).json({ error: parsedBody.error });
        return;
      }

      const patient = await Patient.findByIdAndUpdate(
        id,
        { status: parsedBody.value.status },
        { new: true, runValidators: true }
      ).exec();

      if (!patient) {
        response.status(404).json({ error: 'Patient not found' });
        return;
      }

      response.status(200).json(toPatientResponse(patient));
    } catch {
      response.status(500).json({ error: 'Failed to update patient' });
    }
  }
);

function buildPatientsFilter(
  search: string | undefined,
  status: PatientStatus | undefined
): QueryFilter<IPatient> {
  const filter: QueryFilter<IPatient> = {};

  if (status) {
    filter.status = status;
  }

  if (search) {
    const searchExpression = new RegExp(escapeRegex(search), 'i');

    filter.$or = [
      { firstName: searchExpression },
      { lastName: searchExpression },
      { email: searchExpression }
    ];
  }

  return filter;
}

function parseCreatePatientInput(body: unknown): ParseResult<CreatePatientInput> {
  const record = toRecord(body);

  if (!record) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const firstName = parseRequiredString(record.firstName, 'First name');
  const lastName = parseRequiredString(record.lastName, 'Last name');
  const email = parseRequiredString(record.email, 'Email');
  const dateOfBirth = parseRequiredString(record.dateOfBirth, 'Date of birth');
  const status = record.status === undefined ? 'pending' : record.status;

  if (!firstName.ok) {
    return firstName;
  }

  if (!lastName.ok) {
    return lastName;
  }

  if (!email.ok) {
    return email;
  }

  if (!isValidEmail(email.value)) {
    return { ok: false, error: 'Email must be valid' };
  }

  if (!dateOfBirth.ok) {
    return dateOfBirth;
  }

  if (!isValidDateOfBirth(dateOfBirth.value)) {
    return { ok: false, error: 'Date of birth must be a valid past date in YYYY-MM-DD format' };
  }

  if (!isPatientStatus(status)) {
    return { ok: false, error: 'Invalid patient status' };
  }

  return {
    ok: true,
    value: {
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value.toLowerCase(),
      dateOfBirth: dateOfBirth.value,
      status
    }
  };
}

function parseUpdatePatientStatusInput(body: unknown): ParseResult<UpdatePatientStatusInput> {
  const record = toRecord(body);

  if (!record) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  if (!isPatientStatus(record.status)) {
    return { ok: false, error: 'Invalid patient status' };
  }

  return { ok: true, value: { status: record.status } };
}

function parseRequiredString(value: unknown, label: string): ParseResult<string> {
  if (typeof value !== 'string' || !value.trim()) {
    return { ok: false, error: `${label} is required` };
  }

  return { ok: true, value: value.trim() };
}

function toPatientResponse(patient: PatientDocument): PatientResponse {
  return {
    id: patient._id.toString(),
    firstName: patient.firstName,
    lastName: patient.lastName,
    email: patient.email,
    dateOfBirth: patient.dateOfBirth,
    status: patient.status,
    registeredDate: patient.registeredDate
  };
}

function toRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function getQueryString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmedValue = value.trim();

  return trimmedValue ? trimmedValue : undefined;
}

function parsePositiveInteger(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsedValue = Number(value);

  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : fallback;
}

function parsePageSize(value: string | undefined): number {
  const parsedPageSize = parsePositiveInteger(value, defaultPageSize);

  return Math.min(parsedPageSize, maxPageSize);
}

function isPatientStatus(value: unknown): value is PatientStatus {
  return typeof value === 'string' && patientStatuses.includes(value as PatientStatus);
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidDateOfBirth(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value && date <= new Date();
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isDuplicateKeyError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return false;
  }

  return (error as { code: unknown }).code === 11000;
}
