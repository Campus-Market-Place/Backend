import dotenv from 'dotenv';






dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL ?? '',
  jwtSecret: process.env.JWT_SECRET as string?? 'dev-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN as any ?? '7d',
  isdev : process.env.NODE_ENV !== 'production',
  adminUsernames: (process.env.ADMIN_USERNAMES ?? '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean),


};

if (!config.databaseUrl) {
  // eslint-disable-next-line no-console
  console.warn('DATABASE_URL is not set. Set it in your environment.');
}
