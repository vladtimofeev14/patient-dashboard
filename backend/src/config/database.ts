import mongoose from 'mongoose';

export async function connectDatabase(mongodbUri: string): Promise<void> {
  if (!mongodbUri.trim()) {
    throw new Error('MONGODB_URI is required');
  }

  await mongoose.connect(mongodbUri);
}
