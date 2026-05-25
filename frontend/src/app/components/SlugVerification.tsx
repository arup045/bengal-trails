import { placesData } from '../data/places-full';

export function SlugVerification() {
  // Circular cards from FavoritePlaces
  const circularCards = [
    { name: 'Darjeeling', slug: 'darjeeling' },
    { name: 'Victoria Memorial', slug: 'victoria-memorial-kolkata' },
    { name: 'Sundarbans', slug: 'sundarbans-national-park' },
    { name: 'Kalimpong', slug: 'kalimpong' },
    { name: 'Digha', slug: 'digha' },
  ];

  // Grid cards from ExploreWorld
  const gridCards = [
    { name: 'Darjeeling', slug: 'darjeeling' },
    { name: 'Victoria Memorial', slug: 'victoria-memorial-kolkata' },
    { name: 'Sundarbans', slug: 'sundarbans-national-park' },
    { name: 'Kalimpong', slug: 'kalimpong' },
    { name: 'Digha Beach', slug: 'digha' },
    { name: 'Mandarmani', slug: 'mandarmani' },
    { name: 'Shantiniketan', slug: 'shantiniketan' },
    { name: 'Howrah Bridge', slug: 'howrah-bridge-viewpoint' },
    { name: 'Dooars', slug: 'gorumara-national-park' },
    { name: 'Bishnupur', slug: 'bishnupur' },
    { name: 'Sandakphu Trek', slug: 'darjeeling' },
    { name: 'Bakkhali Beach', slug: 'bakkhali-fraserganj' },
    { name: 'Buddhist Monastery', slug: 'kalimpong' },
    { name: 'Cooch Behar Palace', slug: 'cooch-behar' },
    { name: 'Mirik Lake', slug: 'mirik' },
    { name: 'Botanical Gardens', slug: 'botanical-gardens-shibpur' },
    { name: 'Science City', slug: 'science-city-kolkata' },
    { name: 'Gorumara National Park', slug: 'gorumara-national-park' },
    { name: 'Lava & Lolegaon', slug: 'darjeeling' },
    { name: 'Marble Palace', slug: 'marble-palace-kolkata' },
    { name: 'Jhargram Raj Palace', slug: 'purulia' },
    { name: 'Jaldapara Wildlife', slug: 'jaldapara-national-park' },
    { name: 'Shankarpur Beach', slug: 'digha' },
    { name: 'Kurseong', slug: 'kurseong' },
    { name: 'Hazarduari Palace', slug: 'hazarduari-palace' },
  ];

  const checkSlug = (slug: string, name: string) => {
    const found = placesData.find(p => p.slug === slug);
    return {
      slug,
      name,
      exists: !!found,
      foundTitle: found?.title || 'NOT FOUND'
    };
  };

  const circularResults = circularCards.map(card => checkSlug(card.slug, card.name));
  const gridResults = gridCards.map(card => checkSlug(card.slug, card.name));

  const circularFailed = circularResults.filter(r => !r.exists);
  const gridFailed = gridResults.filter(r => !r.exists);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h1 className="text-4xl mb-4 text-purple-600">Slug Verification Report</h1>
          <p className="text-gray-600 mb-6">Checking if all homepage card slugs match database entries</p>
          <a href="/" className="text-purple-600 hover:underline">← Back to Home</a>
        </div>

        {/* Summary */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className={`bg-white rounded-xl shadow p-6 ${circularFailed.length === 0 ? 'border-2 border-green-500' : 'border-2 border-red-500'}`}>
            <h2 className="text-2xl mb-2">Circular Cards</h2>
            <div className="text-3xl mb-2">{circularResults.length - circularFailed.length}/{circularResults.length}</div>
            <div className={circularFailed.length === 0 ? 'text-green-600' : 'text-red-600'}>
              {circularFailed.length === 0 ? '✅ All slugs valid' : `❌ ${circularFailed.length} invalid`}
            </div>
          </div>

          <div className={`bg-white rounded-xl shadow p-6 ${gridFailed.length === 0 ? 'border-2 border-green-500' : 'border-2 border-red-500'}`}>
            <h2 className="text-2xl mb-2">Grid Cards</h2>
            <div className="text-3xl mb-2">{gridResults.length - gridFailed.length}/{gridResults.length}</div>
            <div className={gridFailed.length === 0 ? 'text-green-600' : 'text-red-600'}>
              {gridFailed.length === 0 ? '✅ All slugs valid' : `❌ ${gridFailed.length} invalid`}
            </div>
          </div>
        </div>

        {/* Circular Cards Detail */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl mb-4">Circular Cards (FavoritePlaces)</h2>
          <div className="space-y-2">
            {circularResults.map((result, idx) => (
              <div key={idx} className={`p-3 rounded-lg ${result.exists ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold">{result.name}</div>
                    <div className="text-sm text-gray-600">Slug: {result.slug}</div>
                  </div>
                  <div className={`text-sm ${result.exists ? 'text-green-600' : 'text-red-600'}`}>
                    {result.exists ? `✅ Found: ${result.foundTitle}` : '❌ NOT FOUND'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grid Cards Detail */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl mb-4">Grid Cards (ExploreWorld)</h2>
          <div className="space-y-2">
            {gridResults.map((result, idx) => (
              <div key={idx} className={`p-3 rounded-lg ${result.exists ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold">{result.name}</div>
                    <div className="text-sm text-gray-600">Slug: {result.slug}</div>
                  </div>
                  <div className={`text-sm ${result.exists ? 'text-green-600' : 'text-red-600'}`}>
                    {result.exists ? `✅ Found: ${result.foundTitle}` : '❌ NOT FOUND'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Failed Slugs */}
        {(circularFailed.length > 0 || gridFailed.length > 0) && (
          <div className="bg-red-50 rounded-2xl shadow-lg p-8 mt-6 border-2 border-red-500">
            <h2 className="text-2xl mb-4 text-red-600">⚠️ Failed Slugs - Need Fixing!</h2>
            {circularFailed.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg mb-2">Circular Cards:</h3>
                <ul className="list-disc pl-6 space-y-1">
                  {circularFailed.map((r, idx) => (
                    <li key={idx} className="text-red-600">
                      {r.name} - Slug: <code>{r.slug}</code>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {gridFailed.length > 0 && (
              <div>
                <h3 className="text-lg mb-2">Grid Cards:</h3>
                <ul className="list-disc pl-6 space-y-1">
                  {gridFailed.map((r, idx) => (
                    <li key={idx} className="text-red-600">
                      {r.name} - Slug: <code>{r.slug}</code>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4">
          <a href="/" className="flex-1 bg-purple-600 text-white text-center px-6 py-3 rounded-xl hover:bg-purple-700">
            Go to Homepage
          </a>
          <a href="/explore" className="flex-1 bg-orange-600 text-white text-center px-6 py-3 rounded-xl hover:bg-orange-700">
            Go to Explore
          </a>
        </div>
      </div>
    </div>
  );
}
