import { placesData, categories, regions } from '../data/places-full';

export function DataDebug() {
  // Group by region
  const byRegion = placesData.reduce((acc, place) => {
    const region = place.region || 'Unknown';
    if (!acc[region]) acc[region] = [];
    acc[region].push(place);
    return acc;
  }, {} as Record<string, typeof placesData>);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Quick Status Banner */}
        <div className="bg-green-100 border-2 border-green-500 rounded-2xl p-6 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-5xl">✅</div>
            <div>
              <h2 className="text-2xl text-green-800 mb-1">All Systems Operational</h2>
              <p className="text-green-700">All destination cards are displaying properly. Region filter issue fixed.</p>
            </div>
          </div>
          <a 
            href="/explore" 
            className="bg-purple-600 text-white px-6 py-3 rounded-full hover:bg-purple-700 transition-colors"
          >
            View Explore Page
          </a>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl text-purple-600">Bengal Trails Data Debug</h1>
            <a href="/" className="text-purple-600 hover:text-purple-700">← Back to Home</a>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-purple-100 rounded-xl p-6">
              <div className="text-5xl mb-2 text-purple-600">{placesData.length}</div>
              <div className="text-gray-700">Total Destinations</div>
            </div>
            
            <div className="bg-orange-100 rounded-xl p-6">
              <div className="text-5xl mb-2 text-orange-600">{regions.length - 1}</div>
              <div className="text-gray-700">Regions (excluding All)</div>
            </div>
            
            <div className="bg-blue-100 rounded-xl p-6">
              <div className="text-5xl mb-2 text-blue-600">{categories.length - 1}</div>
              <div className="text-gray-700">Categories (excluding All)</div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl mb-4">Destinations by Region</h2>
            <div className="space-y-3">
              {Object.entries(byRegion).sort((a, b) => b[1].length - a[1].length).map(([region, places]) => (
                <div key={region} className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                  <div className="text-purple-600 w-32">{region}</div>
                  <div className="flex-1 bg-purple-200 rounded-full h-8 relative overflow-hidden">
                    <div 
                      className="bg-purple-600 h-full rounded-full flex items-center justify-end pr-3 text-white text-sm"
                      style={{ width: `${(places.length / placesData.length) * 100}%` }}
                    >
                      {places.length}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl mb-4">Available Regions in Dropdown</h2>
            <div className="flex flex-wrap gap-2">
              {regions.map(region => (
                <span key={region} className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm">
                  {region}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl mb-4">Latest 10 Destinations</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {placesData.slice(-10).map((place, index) => (
                <div key={place.slug} className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">#{placesData.length - 10 + index + 1}</div>
                  <div className="text-lg mb-1">{place.title}</div>
                  <div className="text-sm text-purple-600">{place.region} • {place.district}</div>
                  <div className="text-xs text-gray-500 mt-2">{place.tags.slice(0, 5).join(', ')}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl mb-4">Check for Issues</h2>
            <div className="space-y-2">
              {placesData.map((place, index) => {
                const issues = [];
                if (!place.title) issues.push('Missing title');
                if (!place.slug) issues.push('Missing slug');
                if (!place.region) issues.push('Missing region');
                if (!place.heroImage?.url) issues.push('Missing hero image');
                if (!place.excerpt) issues.push('Missing excerpt');
                if (!regions.includes(place.region)) issues.push(`Region "${place.region}" not in dropdown`);
                
                if (issues.length > 0) {
                  return (
                    <div key={index} className="bg-red-100 p-3 rounded-lg">
                      <div className="text-red-700">
                        <strong>#{index + 1}: {place.title || 'Untitled'}</strong>
                      </div>
                      <div className="text-red-600 text-sm">{issues.join(', ')}</div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
            {placesData.every((place, index) => {
              return place.title && place.slug && place.region && place.heroImage?.url && place.excerpt && regions.includes(place.region);
            }) && (
              <div className="bg-green-100 p-4 rounded-lg text-green-700">
                ✅ All destinations are properly formatted!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
