import { alarm } from '../../../core/Core';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

export async function sign(
    payload: any,
    secret: string,
    duration = 30
): Promise<string> {
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + duration * 3600 * 24; // number of days

    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .setExpirationTime(exp)
        .setIssuedAt(iat)
        .setNotBefore(iat)
        .sign(new TextEncoder().encode(secret));
}

export default async function handler(req, res) {
    if (req.query.password?.toString() !== alarm.password) {
        res.status(401).send('Invalid password');
        return;
    }
    res.status(200).json({
        token: await sign(
            { user: 'alarm' },
            process.env.JWT_SECRET,
            req.query.duration ? parseInt(req.query.duration.toString()) : 30
        ),
    });
}
