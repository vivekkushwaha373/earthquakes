'use client';

import { useState, useEffect } from 'react';

interface EarthquakeData {
    id: string;
    properties: {
        title: string;
        mag: number;
        time: number;
        place: string;
    };
}

interface ApiResponse {
    data: {
        features: EarthquakeData[];
    };
    source: 'cache' | 'api';
}

interface SingleEarthquakeResponse {
    data: EarthquakeData;
    source: 'cache' | 'api';
}

export default function DemoPage() {
    const [loading, setLoading] = useState(false);
    const [earthquakes, setEarthquakes] = useState<EarthquakeData[]>([]);
    const [source, setSource] = useState<'cache' | 'api' | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [singleEarthquake, setSingleEarthquake] = useState<EarthquakeData | null>(null);
    const [singleSource, setSingleSource] = useState<'cache' | 'api' | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        starttime: '',
        endtime: '',
        minmagnitude: '5.0',
        limit: '10',
    });

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Fetch earthquakes list
    const fetchEarthquakes = async () => {
        setLoading(true);
        setError(null);

        try {
            // Build query string from form data
            const params = new URLSearchParams();
            Object.entries(formData).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });

            const response = await fetch(`/api/earthquakes?${params.toString()}`);

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const result: ApiResponse = await response.json();
            setEarthquakes(result.data.features);
            setSource(result.source);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Fetch a single earthquake by ID
    const fetchSingleEarthquake = async (id: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/earthquakes/${id}`);

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const result: SingleEarthquakeResponse = await response.json();
            setSingleEarthquake(result.data);
            setSingleSource(result.source);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchEarthquakes();
    };

    // Handle clicking on an earthquake
    const handleEarthquakeClick = (id: string) => {
        setSelectedId(id);
        fetchSingleEarthquake(id);
    };

    // Format date from timestamp
    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString();
    };

    return (
        <div className="max-w-6xl mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Earthquake API Demo</h1>

            {/* Search Form */}
            <div className="bg-gray-100 p-4 rounded-lg mb-8">
                <h2 className="text-xl font-semibold mb-4">Search Earthquakes</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                        <input
                            type="date"
                            name="starttime"
                            value={formData.starttime}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                        <input
                            type="date"
                            name="endtime"
                            value={formData.endtime}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Min Magnitude</label>
                        <input
                            type="number"
                            name="minmagnitude"
                            value={formData.minmagnitude}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                            step="0.1"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Limit</label>
                        <input
                            type="number"
                            name="limit"
                            value={formData.limit}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div className="md:col-span-2 lg:col-span-4">
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            disabled={loading}
                        >
                            {loading ? 'Loading...' : 'Search'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Results */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Earthquakes List */}
                <div className="md:col-span-2">
                    <div className="bg-white shadow rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Earthquakes</h2>
                            {source && (
                                <span className={`text-sm px-2 py-1 rounded ${source === 'cache' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                    Source: {source}
                                </span>
                            )}
                        </div>

                        {error && (
                            <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                                {error}
                            </div>
                        )}

                        {earthquakes.length > 0 ? (
                            <div className="divide-y">
                                {earthquakes.map((quake) => (
                                    <div
                                        key={quake.id}
                                        className={`py-3 cursor-pointer hover:bg-gray-50 ${selectedId === quake.id ? 'bg-blue-50' : ''}`}
                                        onClick={() => handleEarthquakeClick(quake.id)}
                                    >
                                        <div className="flex items-center">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${quake.properties.mag >= 6 ? 'bg-red-500' :
                                                    quake.properties.mag >= 5 ? 'bg-orange-500' :
                                                        quake.properties.mag >= 4 ? 'bg-yellow-500' : 'bg-green-500'
                                                }`}>
                                                {quake.properties.mag.toFixed(1)}
                                            </div>
                                            <div className="ml-4">
                                                <h3 className="font-medium">{quake.properties.place}</h3>
                                                <p className="text-sm text-gray-600">{formatDate(quake.properties.time)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : !loading && (
                            <p className="text-gray-500 italic">No earthquakes found. Try searching with different criteria.</p>
                        )}

                        {loading && <p className="text-center py-4">Loading...</p>}
                    </div>
                </div>

                {/* Single Earthquake Details */}
                <div className="md:col-span-1">
                    <div className="bg-white shadow rounded-lg p-4 sticky top-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Earthquake Details</h2>
                            {singleSource && (
                                <span className={`text-sm px-2 py-1 rounded ${singleSource === 'cache' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                    Source: {singleSource}
                                </span>
                            )}
                        </div>

                        {singleEarthquake ? (
                            <div>
                                <h3 className="text-lg font-medium mb-2">{singleEarthquake.properties.title}</h3>
                                <div className="space-y-2">
                                    <div>
                                        <span className="text-gray-600">Magnitude:</span>
                                        <span className="font-semibold ml-2">{singleEarthquake.properties.mag}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Location:</span>
                                        <span className="font-semibold ml-2">{singleEarthquake.properties.place}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Time:</span>
                                        <span className="font-semibold ml-2">{formatDate(singleEarthquake.properties.time)}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">ID:</span>
                                        <span className="font-mono text-sm ml-2">{singleEarthquake.id}</span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t">
                                    <h4 className="font-medium mb-2">API Path:</h4>
                                    <code className="bg-gray-100 p-2 rounded block text-sm overflow-x-auto">
                                        /api/earthquakes/{singleEarthquake.id}
                                    </code>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">Select an earthquake from the list to view details.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
// import Image from "next/image";

// export default function Home() {
//   return (
//     <main className="flex min-h-screen flex-col items-center justify-center p-24">
//       <h1 className="text-4xl font-bold mb-6">Earthquake API Service</h1>
//       <div className="max-w-2xl mx-auto">
//         <h2 className="text-2xl font-semibold mt-6 mb-4">Endpoints</h2>
//         <div className="bg-gray-100 p-4 rounded-md mb-6">
//           <h3 className="font-bold">GET /api/earthquakes</h3>
//           <p className="mt-2">Fetch a list of earthquakes with optional parameters:</p>
//           <ul className="list-disc list-inside mt-2 ml-4">
//             <li>starttime (YYYY-MM-DD or ISO8601)</li>
//             <li>endtime (YYYY-MM-DD or ISO8601)</li>
//             <li>minmagnitude (number)</li>
//             <li>maxmagnitude (number)</li>
//             <li>limit (number, default: 50)</li>
//             <li>orderby (time, time-asc, magnitude, magnitude-asc)</li>
//           </ul>
//         </div>

//         <div className="bg-gray-100 p-4 rounded-md">
//           <h3 className="font-bold">GET /api/earthquakes/[id]</h3>
//           <p className="mt-2">Fetch details for a specific earthquake by ID</p>
//         </div>

//         <h2 className="text-2xl font-semibold mt-8 mb-4">Features</h2>
//         <ul className="list-disc list-inside ml-4">
//           <li>Redis caching for faster response times</li>
//           <li>Rate limiting (30 requests per minute)</li>
//           <li>Error handling and data validation</li>
//         </ul>
//       </div>
//     </main>
//   );
// }
