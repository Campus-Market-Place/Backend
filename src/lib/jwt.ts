import jwt, { JwtPayload } from 'jsonwebtoken';
import { config } from '../config.js';

export interface AuthTokenPayload extends JwtPayload {
  sub: string;
  role: string;
  username: string;
}

export function signJwt(payload: AuthTokenPayload) {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

export function verifyJwt(token: string) {
  return jwt.verify(token, config.jwtSecret) as AuthTokenPayload;
}
