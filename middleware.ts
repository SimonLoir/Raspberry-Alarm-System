import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

export async function middleware(request: NextRequest) {
    if (request.url.includes('/api') && !request.url.includes('auth')) {
        const auth = request.headers.get('Authorization');
        if (!auth) throw new Error('Unauthorized');
        const [type, token] = auth.split(' ');
        if (type !== 'Bearer') throw new Error('Unauthorized');

        try {
            const { payload } = await jwtVerify(
                token,
                new TextEncoder().encode(process.env.JWT_SECRET)
            );
        } catch (error) {
            throw new Error('Unauthorized');
        }
    }
    return NextResponse.next();
}
