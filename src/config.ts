import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL ?? '',
  jwtSecret: process.env.JWT_SECRET as string ?? 'dev-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN as any ?? '7d',
  isdev: process.env.NODE_ENV !== 'production',
  adminUsernames: (process.env.ADMIN_USERNAMES ?? '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean),
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
};


if (!config.databaseUrl) {
  // eslint-disable-next-line no-console
  console.warn('DATABASE_URL is not set. Set it in your environment.');
}

cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET || '',
});

export { cloudinary };