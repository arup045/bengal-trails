import { useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { DollarSign, Users, Calendar, Hotel, UtensilsCrossed, Car, Ticket, ShoppingBag, TrendingUp, Download } from 'lucide-react';

export function BudgetEstimator() {
  const { user, accessToken } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [travelers, setTravelers] = useState(2);
  const [days, setDays] = useState(3);
  const [travelStyle, setTravelStyle] = useState<'budget' | 'mid-range' | 'luxury'>('mid-range');
  const [includeFlights, setIncludeFlights] = useState(false);

  // Cost calculations per day per person
  const costs = {
    budget: {
      accommodation: 500,
      food: 400,
      transport: 200,
      activities: 300,
      shopping: 200,
      flights: 3000,
    },
    'mid-range': {
      accommodation: 1500,
      food: 800,
      transport: 500,
      activities: 800,
      shopping: 500,
      flights: 5000,
    },
    luxury: {
      accommodation: 5000,
      food: 2000,
      transport: 1500,
      activities: 2000,
      shopping: 1500,
      flights: 10000,
    },
  };

  const selectedCosts = costs[travelStyle];

  const calculateTotal = () => {
    const dailyPerPerson = 
      selectedCosts.accommodation +
      selectedCosts.food +
      selectedCosts.transport +
      selectedCosts.activities +
      selectedCosts.shopping;
    
    const totalDailyCosts = dailyPerPerson * days * travelers;
    const flightCosts = includeFlights ? selectedCosts.flights * travelers : 0;
    
    return {
      accommodation: selectedCosts.accommodation * days * travelers,
      food: selectedCosts.food * days * travelers,
      transport: selectedCosts.transport * days * travelers,
      activities: selectedCosts.activities * days * travelers,
      shopping: selectedCosts.shopping * days * travelers,
      flights: flightCosts,
      total: totalDailyCosts + flightCosts,
    };
  };

  const totals = calculateTotal();


  const saveBudget = async () => {
    if (!user || !accessToken) {
      toast.error('Please sign in to save your budget');
      window.location.hash = '#/signin';
      return;
    }
    setIsSaving(true);
    try {
      // Use the `totals` object computed by calculateTotal() above.
      const total = typeof totals?.total === 'number' ? totals.total : 0;
      const res = await fetch(`${API_BASE}/trip-plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: `Budget plan — ${travelers} travelers, ${days} days`,
          description: `${travelStyle} trip for ${travelers} people, ${days} days`,
          totalBudget: total,
          status: 'planning',
          destinations: { travelers, days, travelStyle, breakdown: totals },
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Budget saved to your account!');
      } else {
        toast.error(data.error || 'Failed to save budget');
      }
    } catch {
      toast.error('Network error — please try again');
    } finally {
      setIsSaving(false);
    }
  };

  const exportBudget = () => {
    let content = `West Bengal Trip Budget Estimate\n\n`;
    content += `Trip Details:\n`;
    content += `- Travelers: ${travelers}\n`;
    content += `- Duration: ${days} days\n`;
    content += `- Style: ${travelStyle.charAt(0).toUpperCase() + travelStyle.slice(1)}\n\n`;
    content += `Cost Breakdown:\n`;
    content += `- Accommodation: ₹${totals.accommodation.toLocaleString()}\n`;
    content += `- Food & Dining: ₹${totals.food.toLocaleString()}\n`;
    content += `- Local Transport: ₹${totals.transport.toLocaleString()}\n`;
    content += `- Activities & Sightseeing: ₹${totals.activities.toLocaleString()}\n`;
    content += `- Shopping & Misc: ₹${totals.shopping.toLocaleString()}\n`;
    if (includeFlights) {
      content += `- Flights: ₹${totals.flights.toLocaleString()}\n`;
    }
    content += `\nTotal Estimated Cost: ₹${totals.total.toLocaleString()}\n`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'west-bengal-budget.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Budget Estimator</h1>
          <p className="text-xl text-gray-600">
            Plan your West Bengal trip with an accurate cost breakdown
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl p-8 shadow-lg"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Trip Details</h2>

            {/* Number of Travelers */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-3">
                <Users className="w-5 h-5 text-purple-600" />
                Number of Travelers
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setTravelers(Math.max(1, travelers - 1))}
                  className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200 transition-colors font-bold text-xl"
                >
                  -
                </button>
                <span className="text-4xl font-bold text-purple-600 w-16 text-center">
                  {travelers}
                </span>
                <button
                  onClick={() => setTravelers(travelers + 1)}
                  className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200 transition-colors font-bold text-xl"
                >
                  +
                </button>
              </div>
            </div>

            {/* Number of Days */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-3">
                <Calendar className="w-5 h-5 text-purple-600" />
                Number of Days
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setDays(Math.max(1, days - 1))}
                  className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full hover:bg-orange-200 transition-colors font-bold text-xl"
                >
                  -
                </button>
                <span className="text-4xl font-bold text-orange-600 w-16 text-center">
                  {days}
                </span>
                <button
                  onClick={() => setDays(days + 1)}
                  className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full hover:bg-orange-200 transition-colors font-bold text-xl"
                >
                  +
                </button>
              </div>
            </div>

            {/* Travel Style */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-3">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Travel Style
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(['budget', 'mid-range', 'luxury'] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => setTravelStyle(style)}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                      travelStyle === style
                        ? 'bg-gradient-to-r from-purple-600 to-orange-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {style === 'mid-range' ? 'Mid-Range' : style.charAt(0).toUpperCase() + style.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Include Flights */}
            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeFlights}
                  onChange={(e) => setIncludeFlights(e.target.checked)}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-gray-700 font-medium">Include flight costs</span>
              </label>
            </div>

            {/* Total Display */}
            <div className="bg-gradient-to-r from-purple-600 to-orange-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">Estimated Total</span>
                <DollarSign className="w-6 h-6" />
              </div>
              <div className="text-5xl font-bold">₹{totals.total.toLocaleString()}</div>
              <div className="text-sm mt-2 opacity-90">
                ₹{Math.round(totals.total / (travelers * days)).toLocaleString()} per person per day
              </div>
            </div>
          </motion.div>

          {/* Breakdown Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl p-8 shadow-lg"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Cost Breakdown</h2>

            <div className="space-y-4">
              {/* Accommodation */}
              <div className="bg-purple-50 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                      <Hotel className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Accommodation</div>
                      <div className="text-sm text-gray-600">
                        ₹{selectedCosts.accommodation.toLocaleString()}/day/person
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">
                      ₹{totals.accommodation.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">
                      {((totals.accommodation / totals.total) * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
                <div className="w-full h-2 bg-purple-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600"
                    style={{ width: `${(totals.accommodation / totals.total) * 100}%` }}
                  />
                </div>
              </div>

              {/* Food */}
              <div className="bg-orange-50 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
                      <UtensilsCrossed className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Food & Dining</div>
                      <div className="text-sm text-gray-600">
                        ₹{selectedCosts.food.toLocaleString()}/day/person
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-600">
                      ₹{totals.food.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">
                      {((totals.food / totals.total) * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
                <div className="w-full h-2 bg-orange-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-600"
                    style={{ width: `${(totals.food / totals.total) * 100}%` }}
                  />
                </div>
              </div>

              {/* Transport */}
              <div className="bg-blue-50 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <Car className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Local Transport</div>
                      <div className="text-sm text-gray-600">
                        ₹{selectedCosts.transport.toLocaleString()}/day/person
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      ₹{totals.transport.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">
                      {((totals.transport / totals.total) * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
                <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600"
                    style={{ width: `${(totals.transport / totals.total) * 100}%` }}
                  />
                </div>
              </div>

              {/* Activities */}
              <div className="bg-green-50 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                      <Ticket className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Activities</div>
                      <div className="text-sm text-gray-600">
                        ₹{selectedCosts.activities.toLocaleString()}/day/person
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      ₹{totals.activities.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">
                      {((totals.activities / totals.total) * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
                <div className="w-full h-2 bg-green-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600"
                    style={{ width: `${(totals.activities / totals.total) * 100}%` }}
                  />
                </div>
              </div>

              {/* Shopping */}
              <div className="bg-pink-50 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Shopping & Misc</div>
                      <div className="text-sm text-gray-600">
                        ₹{selectedCosts.shopping.toLocaleString()}/day/person
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-pink-600">
                      ₹{totals.shopping.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">
                      {((totals.shopping / totals.total) * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
                <div className="w-full h-2 bg-pink-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-pink-600"
                    style={{ width: `${(totals.shopping / totals.total) * 100}%` }}
                  />
                </div>
              </div>

              {/* Flights */}
              {includeFlights && (
                <div className="bg-indigo-50 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Flights</div>
                        <div className="text-sm text-gray-600">
                          ₹{selectedCosts.flights.toLocaleString()}/person
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-indigo-600">
                        ₹{totals.flights.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600">
                        {((totals.flights / totals.total) * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-indigo-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600"
                      style={{ width: `${(totals.flights / totals.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Save + Export Buttons */}
            <button
              onClick={saveBudget}
              disabled={isSaving}
              className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-4 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 disabled:opacity-50 transition-all font-semibold"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isSaving ? 'Saving...' : 'Save to My Account'}
            </button>
            <button
              onClick={exportBudget}
              className="w-full mt-3 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-orange-600 text-white rounded-2xl hover:shadow-lg transition-all font-semibold"
            >
              <Download className="w-5 h-5" />
              Export Budget Plan
            </button>
          </motion.div>
        </div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-gradient-to-r from-purple-600 to-orange-600 rounded-3xl p-8 text-white"
        >
          <h3 className="text-2xl font-bold mb-4">💡 Money-Saving Tips</h3>
          <ul className="grid md:grid-cols-2 gap-4">
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Visit during off-season (July-September) for 30-40% cheaper accommodation</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Use local buses and trains instead of taxis to cut transport costs</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Eat at local eateries - delicious food at 1/3rd the price of restaurants</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Book hotels 2-3 weeks in advance for better deals</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Many temples and parks have free or minimal entry fees</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Bargain at markets - initial prices are often 2-3x the final price</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
