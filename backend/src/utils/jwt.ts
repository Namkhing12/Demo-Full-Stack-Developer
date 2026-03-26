import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload {
    userId: string;
    role: string;
    tenant: string;
}

export const signToken = (payload: TokenPayload, expiresIn: string | number = '15m') => {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn } as SignOptions);
};

export const verifyToken = (token: string): TokenPayload => {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
};
