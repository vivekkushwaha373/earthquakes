import { NextRequest, NextResponse } from 'next/server';
import { fetchEarthquakes, EarthquakeQueryParams } from '@/lib/earthquakeApi';
import { getFromCache, setCache } from '@/lib/redis';
import { rateLimiter } from '@/lib/rateLimit';

export async function GET(request: NextRequest) {
    // Apply rate limiting
    const rateLimitResponse = await rateLimiter(request);
    if (!rateLimitResponse.ok) {
        return rateLimitResponse;
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;

    // Convert to object for easier handling
    const params: EarthquakeQueryParams = {
        starttime: searchParams.get('starttime') || undefined,
        endtime: searchParams.get('endtime') || undefined,
        minmagnitude: searchParams.get('minmagnitude') ? parseFloat(searchParams.get('minmagnitude')!) : undefined,
        maxmagnitude: searchParams.get('maxmagnitude') ? parseFloat(searchParams.get('maxmagnitude')!) : undefined,
        limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50,
        orderby: (searchParams.get('orderby') as EarthquakeQueryParams['orderby']) || 'time',
    };

    // Generate cache key based on query parameters
    const cacheKey = `earthquakes:${new URLSearchParams(
        Object.entries(params).filter(([_, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
    ).toString()}`;

    try {
        // Try to get data from cache first
        const cachedData = await getFromCache(cacheKey);

        if (cachedData) {
            return NextResponse.json({
                data: cachedData,
                source: 'cache',
            });
        }

        // If not in cache, fetch from USGS API
        const earthquakeData = await fetchEarthquakes(params);

        // Cache the result (5 minutes)
        await setCache(cacheKey, earthquakeData, 300);

        return NextResponse.json({
            data: earthquakeData,
            source: 'api',
        });
    } catch (error) {
        console.error('Error in earthquakes endpoint:', error);
        return NextResponse.json(
            { error: 'Failed to fetch earthquake data' },
            { status: 500 }
        );
    }
}