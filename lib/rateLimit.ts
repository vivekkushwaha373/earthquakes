import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

const redis = new Redis({
    url: process.env.REDIS_URL || '',
    token: process.env.REDIS_TOKEN || '',
});

// Rate limit configuration
const RATE_LIMIT_REQUESTS = 3; // Max requests
const RATE_LIMIT_WINDOW = 60; // Time window in seconds

export async function rateLimiter(request: NextRequest) {
    try {
        
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const key = `rate-limit:${ip}`;

        // Get current count for this IP
        const currentCount = await redis.get<number>(key) || 0;

        // If first request, set expiration
        if (currentCount === 0) {
            await redis.set(key, 1, { ex: RATE_LIMIT_WINDOW });
            return NextResponse.json({ success: true, remaining: RATE_LIMIT_REQUESTS - 1 });
        }

        // If under limit, increment
        if (currentCount < RATE_LIMIT_REQUESTS) {
            await redis.incr(key);
            return NextResponse.json({ success: true, remaining: RATE_LIMIT_REQUESTS - currentCount - 1 });
        }

        // Rate limit exceeded
        return NextResponse.json(
            { success: false, error: 'Rate limit exceeded', remaining: 0 },
            { status: 429 }
        );
    } catch (error) {
        console.error('Rate limit error:', error);
        // If Redis fails, allow the request (fallback)
        return NextResponse.json({ success: true, remaining: 'unknown' });
    }
}