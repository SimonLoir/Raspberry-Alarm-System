import { alarm } from '../../../core/Core';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

export async function sign(payload: any, secret: string): Promise<string> {
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 60 * 60; // one hour

    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .setExpirationTime(exp)
        .setIssuedAt(iat)
        .setNotBefore(iat)
        .sign(new TextEncoder().encode(secret));
}

export default async function handler(req, res) {
    res.status(200).json({
        token: await sign({ user: 'test' }, process.env.JWT_SECRET),
    });
}
