import { Router, type Request, type Response } from 'express';
import { Patient, type DashboardStats } from '../models/patient.model.js';

interface ErrorResponse {
  error: string;
}

export const statsRouter = Router();

statsRouter.get(
  '/',
  async (
    _request: Request,
    response: Response<DashboardStats | ErrorResponse>
  ): Promise<void> => {
    try {
      const [total, active, pending, inactive] = await Promise.all([
        Patient.countDocuments().exec(),
        Patient.countDocuments({ status: 'active' }).exec(),
        Patient.countDocuments({ status: 'pending' }).exec(),
        Patient.countDocuments({ status: 'inactive' }).exec()
      ]);

      response.status(200).json({
        total,
        active,
        pending,
        inactive
      });
    } catch {
      response.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
  }
);
