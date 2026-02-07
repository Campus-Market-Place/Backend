import jwt, { JwtPayload } from 'jsonwebtoken';
import { config } from '../config.js';

export interface AuthTokenPayload extends JwtPayload {
  sub: string;
  role: string;
  username: string;
}

export function signJwt(payload: AuthTokenPayload) {
  return jwt.sign(payload, config.jwtSecret as string, {
    expiresIn: config.jwtExpiresIn as string | number,
  });
}

export function verifyJwt(token: string) {
  return jwt.verify(token, config.jwtSecret) as AuthTokenPayload;
}
