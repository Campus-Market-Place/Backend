import { JwtPayload } from 'jsonwebtoken';
export interface AuthTokenPayload extends JwtPayload {
    sub: string;
    role: string;
    username: string;
}
export declare function signJwt(payload: AuthTokenPayload): string;
export declare function verifyJwt(token: string): AuthTokenPayload;
//# sourceMappingURL=jwt.d.ts.map