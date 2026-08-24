import mongoose from 'mongoose';

const LOCAL_MONGODB_HOSTS = ['127.0.0.1', 'localhost'];

function isLocalMongoUri(uri: string): boolean {
  return LOCAL_MONGODB_HOSTS.some((host) => uri.includes(host));
}

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error(
      'MONGODB_URI is not defined. Set it in Render Environment (e.g. MongoDB Atlas connection string).'
    );
  }

  if (process.env.NODE_ENV === 'production' && isLocalMongoUri(uri)) {
    throw new Error(
      'MONGODB_URI points to localhost. In production, use a hosted MongoDB URL (e.g. MongoDB Atlas).'
    );
  }

  await mongoose.connect(uri);
  console.log('MongoDB connected');
};
