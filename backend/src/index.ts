import cors from 'cors';
import dotenv from 'dotenv';
import express, { type Express } from 'express';
import { connectDatabase } from './config/database.js';
import { patientsRouter } from './routes/patients.routes.js';
import { statsRouter } from './routes/stats.routes.js';

dotenv.config();

const app: Express = express();
const port = Number(process.env.PORT ?? 3000);
const mongodbUri = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());
app.use('/api/patients', patientsRouter);
app.use('/api/stats', statsRouter);

app.use((_request, response) => {
  response.status(404).json({ error: 'Route not found' });
});

async function startServer(): Promise<void> {
  if (!mongodbUri) {
    throw new Error('MONGODB_URI is required');
  }

  await connectDatabase(mongodbUri);

  app.listen(port, () => {
    console.log(`Backend API is running on port ${port}`);
  });
}

startServer().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown startup error';

  console.error(message);
  process.exit(1);
});
