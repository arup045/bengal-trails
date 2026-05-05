import { useState, useEffect } from 'react';
import { placesData, categories, regions } from '../data/places-full';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

export function SystemCheck() {
  const [tests, setTests] = useState<TestResult[]>([]);

  useEffect(() => {
    runTests();
  }, []);

  const runTests = () => {
    const results: TestResult[] = [];

    // Test 1: Data integrity
    if (placesData.length === 97) {
      results.push({
        name: 'Total Destinations Count',
        status: 'pass',
        message: `✓ Exactly 97 destinations found`
      });
    } else {
      results.push({
        name: 'Total Destinations Count',
        status: 'fail',
        message: `✗ Expected 97 destinations, found ${placesData.length}`
      });
    }

    // Test 2: Required fields
    const missingFields = placesData.filter(p => 
      !p.title || !p.slug || !p.region || !p.heroImage?.url || !p.excerpt
    );
    if (missingFields.length === 0) {
      results.push({
        name: 'Required Fields',
        status: 'pass',
        message: `✓ All destinations have required fields`
      });
    } else {
      results.push({
        name: 'Required Fields',
        status: 'fail',
        message: `✗ ${missingFields.length} destinations missing required fields`
      });
    }

    // Test 3: Region validation
    const invalidRegions = placesData.filter(p => !regions.includes(p.region));
    if (invalidRegions.length === 0) {
      results.push({
        name: 'Region Validation',
        status: 'pass',
        message: `✓ All regions are valid`
      });
    } else {
      results.push({
        name: 'Region Validation',
        status: 'fail',
        message: `✗ ${invalidRegions.length} destinations have invalid regions`
      });
    }

    // Test 4: Unique slugs
    const slugs = placesData.map(p => p.slug);
    const uniqueSlugs = new Set(slugs);
    if (slugs.length === uniqueSlugs.size) {
      results.push({
        name: 'Unique Slugs',
        status: 'pass',
        message: `✓ All slugs are unique`
      });
    } else {
      results.push({
        name: 'Unique Slugs',
        status: 'fail',
        message: `✗ Duplicate slugs found`
      });
    }

    // Test 5: Images
    const missingImages = placesData.filter(p => !p.heroImage?.url);
    if (missingImages.length === 0) {
      results.push({
        name: 'Hero Images',
        status: 'pass',
        message: `✓ All destinations have hero images`
      });
    } else {
      results.push({
        name: 'Hero Images',
        status: 'fail',
        message: `✗ ${missingImages.length} destinations missing hero images`
      });
    }

    // Test 6: Tags
    const missingTags = placesData.filter(p => !p.tags || p.tags.length === 0);
    if (missingTags.length === 0) {
      results.push({
        name: 'Tags',
        status: 'pass',
        message: `✓ All destinations have tags`
      });
    } else {
      results.push({
        name: 'Tags',
        status: 'warning',
        message: `⚠ ${missingTags.length} destinations have no tags`
      });
    }

    // Test 7: Price data
    const missingPrice = placesData.filter(p => !p.priceFrom);
    if (missingPrice.length === 0) {
      results.push({
        name: 'Pricing Information',
        status: 'pass',
        message: `✓ All destinations have pricing`
      });
    } else {
      results.push({
        name: 'Pricing Information',
        status: 'warning',
        message: `⚠ ${missingPrice.length} destinations missing pricing`
      });
    }

    // Test 8: Hotels data
    const missingHotels = placesData.filter(p => !p.nearbyHotels || p.nearbyHotels.length === 0);
    if (missingHotels.length === 0) {
      results.push({
        name: 'Hotel Information',
        status: 'pass',
        message: `✓ All destinations have hotel listings`
      });
    } else {
      results.push({
        name: 'Hotel Information',
        status: 'warning',
        message: `⚠ ${missingHotels.length} destinations missing hotel info`
      });
    }

    // Test 9: Restaurants data
    const missingRestaurants = placesData.filter(p => !p.nearbyRestaurants || p.nearbyRestaurants.length === 0);
    if (missingRestaurants.length === 0) {
      results.push({
        name: 'Restaurant Information',
        status: 'pass',
        message: `✓ All destinations have restaurant listings`
      });
    } else {
      results.push({
        name: 'Restaurant Information',
        status: 'warning',
        message: `⚠ ${missingRestaurants.length} destinations missing restaurant info`
      });
    }

    // Test 10: Ratings
    const missingRatings = placesData.filter(p => !p.rating);
    if (missingRatings.length === 0) {
      results.push({
        name: 'Ratings',
        status: 'pass',
        message: `✓ All destinations have ratings`
      });
    } else {
      results.push({
        name: 'Ratings',
        status: 'warning',
        message: `⚠ ${missingRatings.length} destinations missing ratings`
      });
    }

    setTests(results);
  };

  const passedTests = tests.filter(t => t.status === 'pass').length;
  const totalTests = tests.length;
  const percentage = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl mb-2 text-purple-600">GOBRO System Check</h1>
              <p className="text-gray-600">Comprehensive website functionality test</p>
            </div>
            <a href="#/" className="text-purple-600 hover:text-purple-700">← Back to Home</a>
          </div>

          {/* Score */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-5xl mb-2">{percentage}%</div>
                <div className="text-lg">System Health Score</div>
              </div>
              <div className="text-right">
                <div className="text-3xl mb-2">{passedTests}/{totalTests}</div>
                <div className="text-sm opacity-90">Tests Passed</div>
              </div>
            </div>
            <div className="mt-4 bg-white/20 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-white h-full transition-all duration-1000"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl mb-6">Test Results</h2>
          <div className="space-y-4">
            {tests.map((test, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  test.status === 'pass' 
                    ? 'bg-green-50 border-green-200' 
                    : test.status === 'fail'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {test.status === 'pass' && <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />}
                  {test.status === 'fail' && <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />}
                  {test.status === 'warning' && <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />}
                  <div className="flex-1">
                    <div className={`mb-1 ${
                      test.status === 'pass' 
                        ? 'text-green-900' 
                        : test.status === 'fail'
                        ? 'text-red-900'
                        : 'text-yellow-900'
                    }`}>
                      {test.name}
                    </div>
                    <div className={`text-sm ${
                      test.status === 'pass' 
                        ? 'text-green-700' 
                        : test.status === 'fail'
                        ? 'text-red-700'
                        : 'text-yellow-700'
                    }`}>
                      {test.message}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-3xl mb-2 text-purple-600">{placesData.length}</div>
            <div className="text-gray-600">Total Destinations</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-3xl mb-2 text-orange-600">{regions.length - 1}</div>
            <div className="text-gray-600">Regions Available</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-3xl mb-2 text-blue-600">{categories.length - 1}</div>
            <div className="text-gray-600">Categories</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4">
          <a 
            href="#/explore" 
            className="flex-1 bg-purple-600 text-white text-center px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors"
          >
            Go to Explore Page
          </a>
          <a 
            href="#/debug" 
            className="flex-1 bg-gray-200 text-gray-800 text-center px-6 py-3 rounded-xl hover:bg-gray-300 transition-colors"
          >
            View Data Debug
          </a>
        </div>
      </div>
    </div>
  );
}
