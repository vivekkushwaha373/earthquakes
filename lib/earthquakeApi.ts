import { EarthquakeResponse, Earthquake } from '../types/earthquakes';

const USGS_API_BASE_URL = 'https://earthquake.usgs.gov/fdsnws/event/1/';

export interface EarthquakeQueryParams {
    starttime?: string;
    endtime?: string;
    minmagnitude?: number;
    maxmagnitude?: number;
    limit?: number;
    orderby?: 'time' | 'time-asc' | 'magnitude' | 'magnitude-asc';
    [key: string]: string | number | undefined;
}

export async function fetchEarthquakes(params: EarthquakeQueryParams): Promise<EarthquakeResponse> {
    const queryParams = new URLSearchParams();

    // Default format is GeoJSON
    queryParams.append('format', 'geojson');

    // Add all provided parameters
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
            queryParams.append(key, String(value));
        }
    });

    const url = `${USGS_API_BASE_URL}query?${queryParams.toString()}`;

    try {
        const response = await fetch(url, { next: { revalidate: 60 } });

        if (!response.ok) {
            throw new Error(`USGS API error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching earthquake data:', error);
        throw error;
    }
}

// export async function fetchEarthquakeById(id: string): Promise<Earthquake | null> {
//     try {
//         const url = `${USGS_API_BASE_URL}query?format=geojson&eventid=${id}`;
//         const response = await fetch(url, { next: { revalidate: 60 } });

//         if (!response.ok) {
//             if (response.status === 404) {
//                 return null;
//             }
//             throw new Error(`USGS API error: ${response.status} ${response.statusText}`);
//         }

//         const data: EarthquakeResponse = await response.json();

//         // The API returns a collection, but we need just one earthquake
//         if (data.features && data.features.length > 0) {
//             return data.features[0];
//         }

//         return null;
//     } catch (error) {
//         console.error('Error fetching earthquake by ID:', error);
//         throw error;
//     }
// }
export async function fetchEarthquakeById(id: string): Promise<Earthquake | null> {
    try {
        const url = `${USGS_API_BASE_URL}query?format=geojson&eventid=${id}`;
        const response = await fetch(url, { next: { revalidate: 60 } });

        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error(`USGS API error: ${response.status} ${response.statusText}`);
        }

        const data: Earthquake = await response.json();

        return data; // return the single earthquake feature object

    } catch (error) {
        console.error('Error fetching earthquake by ID:', error);
        throw error;
    }
}
