import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import { Patient, type IPatient } from '../models/patient.model.js';

dotenv.config();

const samplePatients: IPatient[] = [
  {
    firstName: 'Olivia',
    lastName: 'Bennett',
    email: 'olivia.bennett@example.com',
    dateOfBirth: '1989-03-14',
    status: 'active',
    registeredDate: '2026-01-08T14:22:00.000Z'
  },
  {
    firstName: 'Liam',
    lastName: 'Carter',
    email: 'liam.carter@example.com',
    dateOfBirth: '1978-11-02',
    status: 'pending',
    registeredDate: '2026-01-11T09:10:00.000Z'
  },
  {
    firstName: 'Emma',
    lastName: 'Rodriguez',
    email: 'emma.rodriguez@example.com',
    dateOfBirth: '1994-07-28',
    status: 'inactive',
    registeredDate: '2026-01-13T16:45:00.000Z'
  },
  {
    firstName: 'Noah',
    lastName: 'Patel',
    email: 'noah.patel@example.com',
    dateOfBirth: '1982-05-19',
    status: 'active',
    registeredDate: '2026-01-17T11:35:00.000Z'
  },
  {
    firstName: 'Ava',
    lastName: 'Thompson',
    email: 'ava.thompson@example.com',
    dateOfBirth: '2000-09-06',
    status: 'pending',
    registeredDate: '2026-01-20T13:12:00.000Z'
  },
  {
    firstName: 'William',
    lastName: 'Nguyen',
    email: 'william.nguyen@example.com',
    dateOfBirth: '1969-12-23',
    status: 'active',
    registeredDate: '2026-01-25T08:25:00.000Z'
  },
  {
    firstName: 'Sophia',
    lastName: 'Mitchell',
    email: 'sophia.mitchell@example.com',
    dateOfBirth: '1991-04-12',
    status: 'inactive',
    registeredDate: '2026-02-01T10:05:00.000Z'
  },
  {
    firstName: 'James',
    lastName: 'Wilson',
    email: 'james.wilson@example.com',
    dateOfBirth: '1985-08-30',
    status: 'active',
    registeredDate: '2026-02-04T15:50:00.000Z'
  },
  {
    firstName: 'Isabella',
    lastName: 'Anderson',
    email: 'isabella.anderson@example.com',
    dateOfBirth: '1976-06-17',
    status: 'pending',
    registeredDate: '2026-02-07T12:18:00.000Z'
  },
  {
    firstName: 'Benjamin',
    lastName: 'Miller',
    email: 'benjamin.miller@example.com',
    dateOfBirth: '1998-10-21',
    status: 'active',
    registeredDate: '2026-02-12T17:04:00.000Z'
  },
  {
    firstName: 'Mia',
    lastName: 'Davis',
    email: 'mia.davis@example.com',
    dateOfBirth: '1988-02-09',
    status: 'inactive',
    registeredDate: '2026-02-16T09:42:00.000Z'
  },
  {
    firstName: 'Lucas',
    lastName: 'Garcia',
    email: 'lucas.garcia@example.com',
    dateOfBirth: '1993-01-31',
    status: 'pending',
    registeredDate: '2026-02-19T14:28:00.000Z'
  },
  {
    firstName: 'Charlotte',
    lastName: 'Martinez',
    email: 'charlotte.martinez@example.com',
    dateOfBirth: '1972-07-15',
    status: 'active',
    registeredDate: '2026-02-23T11:09:00.000Z'
  },
  {
    firstName: 'Henry',
    lastName: 'Brown',
    email: 'henry.brown@example.com',
    dateOfBirth: '1965-03-27',
    status: 'inactive',
    registeredDate: '2026-03-02T16:31:00.000Z'
  },
  {
    firstName: 'Amelia',
    lastName: 'Taylor',
    email: 'amelia.taylor@example.com',
    dateOfBirth: '1996-11-08',
    status: 'active',
    registeredDate: '2026-03-06T08:57:00.000Z'
  },
  {
    firstName: 'Alexander',
    lastName: 'Moore',
    email: 'alexander.moore@example.com',
    dateOfBirth: '1981-05-03',
    status: 'pending',
    registeredDate: '2026-03-10T13:44:00.000Z'
  },
  {
    firstName: 'Harper',
    lastName: 'Jackson',
    email: 'harper.jackson@example.com',
    dateOfBirth: '1999-12-18',
    status: 'active',
    registeredDate: '2026-03-15T10:16:00.000Z'
  },
  {
    firstName: 'Daniel',
    lastName: 'White',
    email: 'daniel.white@example.com',
    dateOfBirth: '1974-09-25',
    status: 'inactive',
    registeredDate: '2026-03-19T15:23:00.000Z'
  },
  {
    firstName: 'Evelyn',
    lastName: 'Harris',
    email: 'evelyn.harris@example.com',
    dateOfBirth: '1987-06-04',
    status: 'pending',
    registeredDate: '2026-03-24T12:37:00.000Z'
  },
  {
    firstName: 'Michael',
    lastName: 'Clark',
    email: 'michael.clark@example.com',
    dateOfBirth: '1990-10-13',
    status: 'active',
    registeredDate: '2026-03-29T09:51:00.000Z'
  }
];

async function seedDatabase(): Promise<void> {
  const mongodbUri = process.env.MONGODB_URI;

  if (!mongodbUri) {
    throw new Error('MONGODB_URI is required');
  }

  await connectDatabase(mongodbUri);
  await Patient.deleteMany({}).exec();
  await Patient.insertMany(samplePatients);
}

seedDatabase()
  .then(() => {
    console.log(`Seeded ${samplePatients.length} patients`);
  })
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Unknown seed error';

    console.error(message);
    process.exitCode = 1;
  })
  .finally(() => {
    void mongoose.disconnect();
  });
