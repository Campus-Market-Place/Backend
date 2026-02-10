import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { config } from '../config.js';


export interface AuthTokenPayload extends JwtPayload {
  sub: string;
  role: string;
  username: string;
}

export function signJwt(payload: AuthTokenPayload): string {

  const options: SignOptions = {};

  if (config.jwtExpiresIn !== undefined) {
    options.expiresIn = config.jwtExpiresIn;
  }



  // const options: SignOptions = {
  //   expiresIn: config.jwtExpiresIn as SignOptions['expiresIn'],
  // };

  return jwt.sign(payload, config.jwtSecret, options);
}

export function verifyJwt(token: string) {
  return jwt.verify(token, config.jwtSecret as jwt.Secret) as AuthTokenPayload;
}
