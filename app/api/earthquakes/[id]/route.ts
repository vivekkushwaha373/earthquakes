import { NextRequest, NextResponse } from 'next/server';
import { fetchEarthquakeById } from '@/lib/earthquakeApi';
import { getFromCache, setCache } from '@/lib/redis';
import { rateLimiter } from '@/lib/rateLimit';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    // Apply rate limiting
    const rateLimitResponse = await rateLimiter(request);
    const id = params.id;
    
    if (!rateLimitResponse.ok) {
        return rateLimitResponse;
    }

    const cacheKey = `earthquake:${id}`;

    try {
        // Try to get from cache first
        const cachedData = await getFromCache(cacheKey);

        if (cachedData) {
            return NextResponse.json({
                data: cachedData,
                source: 'cache',
            });
        }

        // If not in cache, fetch from API
        const earthquakeData = await fetchEarthquakeById(id);

        if (!earthquakeData) {
            return NextResponse.json(
                { error: 'Earthquake not found' },
                { status: 404 }
            );
        }

        // Cache the result (10 minutes)
        await setCache(cacheKey, earthquakeData, 600);

        return NextResponse.json({
            data: earthquakeData,
            source: 'api',
        });
    } catch (error) {
        console.error('Error in earthquake ID endpoint:', error);
        return NextResponse.json(
            { error: 'Failed to fetch earthquake data' },
            { status: 500 }
        );
    }
}