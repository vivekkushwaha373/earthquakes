import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = new Redis({
    url: process.env.REDIS_URL || '',
    token: process.env.REDIS_TOKEN || '',
});

export async function getFromCache<T>(key: string): Promise<T | null> {
    try {
        const data = await redis.get(key);
        return data as T;
    } catch (error) {
        console.error('Redis get error:', error);
        return null;
    }
}

export async function setCache<T>(key: string, data: T, expirationInSeconds: number = 300): Promise<void> {
    try {
        await redis.set(key, data, { ex: expirationInSeconds });
    } catch (error) {
        console.error('Redis set error:', error);
    }
}