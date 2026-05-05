import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ChevronRight, ChevronLeft, MapPin, Star, TrendingUp } from 'lucide-react';
import { placesData } from '../data/places-full';

interface QuizAnswer {
  budget?: 'budget' | 'mid-range' | 'luxury';
  interests?: string[];
  season?: string;
  duration?: string;
  groupType?: string;
  pace?: string;
}

export function TravelAdvisor() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer>({});
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  const questions = [
    {
      id: 'budget',
      question: 'What\'s your budget range per person?',
      options: [
        { value: 'budget', label: 'Budget Friendly', desc: 'Under ₹5,000/day', icon: '💰' },
        { value: 'mid-range', label: 'Mid-Range', desc: '₹5,000-15,000/day', icon: '💳' },
        { value: 'luxury', label: 'Luxury', desc: 'Above ₹15,000/day', icon: '💎' },
      ],
    },
    {
      id: 'interests',
      question: 'What interests you most? (Select multiple)',
      multiple: true,
      options: [
        { value: 'nature', label: 'Nature & Wildlife', icon: '🌿' },
        { value: 'heritage', label: 'Heritage & History', icon: '🏛️' },
        { value: 'adventure', label: 'Adventure Sports', icon: '⛰️' },
        { value: 'culture', label: 'Culture & Arts', icon: '🎭' },
        { value: 'food', label: 'Food & Cuisine', icon: '🍽️' },
        { value: 'spiritual', label: 'Spiritual & Temples', icon: '🕉️' },
      ],
    },
    {
      id: 'season',
      question: 'When are you planning to visit?',
      options: [
        { value: 'summer', label: 'Summer (Mar-Jun)', icon: '☀️' },
        { value: 'monsoon', label: 'Monsoon (Jul-Sep)', icon: '🌧️' },
        { value: 'autumn', label: 'Autumn (Oct-Nov)', icon: '🍂' },
        { value: 'winter', label: 'Winter (Dec-Feb)', icon: '❄️' },
      ],
    },
    {
      id: 'duration',
      question: 'How long is your trip?',
      options: [
        { value: 'weekend', label: 'Weekend Getaway', desc: '2-3 days', icon: '⚡' },
        { value: 'week', label: 'Week Long', desc: '4-7 days', icon: '📅' },
        { value: 'extended', label: 'Extended Trip', desc: '8+ days', icon: '🗓️' },
      ],
    },
    {
      id: 'groupType',
      question: 'Who are you traveling with?',
      options: [
        { value: 'solo', label: 'Solo Adventure', icon: '🎒' },
        { value: 'couple', label: 'Couple/Romance', icon: '💑' },
        { value: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
        { value: 'friends', label: 'Friends Group', icon: '👥' },
      ],
    },
    {
      id: 'pace',
      question: 'What\'s your travel pace?',
      options: [
        { value: 'relaxed', label: 'Relaxed & Leisurely', icon: '🧘' },
        { value: 'moderate', label: 'Balanced Mix', icon: '⚖️' },
        { value: 'packed', label: 'Action Packed', icon: '🚀' },
      ],
    },
  ];

  const handleAnswer = (questionId: string, value: string, multiple?: boolean) => {
    if (multiple) {
      const current = (answers[questionId as keyof QuizAnswer] as string[]) || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      setAnswers({ ...answers, [questionId]: updated });
    } else {
      setAnswers({ ...answers, [questionId]: value });
    }
  };

  const canProceed = () => {
    const currentQ = questions[step];
    const answer = answers[currentQ.id as keyof QuizAnswer];
    if (currentQ.multiple) {
      return Array.isArray(answer) && answer.length > 0;
    }
    return !!answer;
  };

  const calculateRecommendations = () => {
    let scored = placesData.map(place => {
      let score = 0;
      let reasons: string[] = [];

      // Budget matching
      if (answers.budget === 'budget' && place.category === 'Heritage') {
        score += 20;
        reasons.push('Budget-friendly heritage site');
      }
      if (answers.budget === 'luxury' && (place.category === 'Hill Station' || place.category === 'Beach')) {
        score += 20;
        reasons.push('Premium destination with luxury options');
      }

      // Interest matching
      const interests = answers.interests || [];
      if (interests.includes('nature') && (place.category === 'Wildlife' || place.category === 'Nature')) {
        score += 30;
        reasons.push('Perfect for nature lovers');
      }
      if (interests.includes('heritage') && place.category === 'Heritage') {
        score += 30;
        reasons.push('Rich historical significance');
      }
      if (interests.includes('adventure') && (place.category === 'Hill Station' || place.category === 'Adventure')) {
        score += 30;
        reasons.push('Great adventure opportunities');
      }
      if (interests.includes('spiritual') && place.category === 'Pilgrimage') {
        score += 30;
        reasons.push('Spiritual experience');
      }

      // Season matching
      if (answers.season === 'summer' && place.region === 'North Bengal') {
        score += 25;
        reasons.push('Cool weather escape');
      }
      if (answers.season === 'winter' && place.region === 'South Bengal') {
        score += 25;
        reasons.push('Pleasant winter weather');
      }

      // Duration matching
      if (answers.duration === 'weekend' && place.duration?.includes('2-3')) {
        score += 15;
        reasons.push('Perfect for weekend trip');
      }

      // Group type
      if (answers.groupType === 'family' && place.category === 'Beach') {
        score += 15;
        reasons.push('Family-friendly destination');
      }
      if (answers.groupType === 'couple' && place.category === 'Hill Station') {
        score += 15;
        reasons.push('Romantic getaway');
      }

      // Add rating boost
      if (place.rating) {
        score += place.rating * 2;
      }

      return {
        ...place,
        score,
        reasons: reasons.slice(0, 3),
      };
    });

    // Sort by score and get top 5
    scored.sort((a, b) => b.score - a.score);
    setRecommendations(scored.slice(0, 5));
    setShowResults(true);
  };

  const resetQuiz = () => {
    setStep(0);
    setAnswers({});
    setShowResults(false);
    setRecommendations([]);
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 pt-32 pb-20">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-orange-600 text-white rounded-full mb-6">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">Your Personalized Recommendations</span>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Perfect Matches for You!</h1>
            <p className="text-xl text-gray-600">
              Based on your preferences, here are your top 5 destinations
            </p>
          </motion.div>

          <div className="space-y-6 mb-12">
            {recommendations.map((place, index) => (
              <motion.a
                key={place.slug}
                href={`#/place/${place.slug}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="block bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all group"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Rank Badge */}
                  <div className="absolute top-4 left-4 z-10 w-12 h-12 bg-gradient-to-br from-purple-600 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    #{index + 1}
                  </div>

                  {/* Image */}
                  <div className="relative w-full md:w-1/3 h-64 md:h-auto">
                    <img
                      src={place.heroImage.url}
                      alt={place.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-400 text-gray-900 rounded-full text-sm font-semibold flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      {place.rating || 4.5}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-8">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                          {place.title}
                        </h3>
                        <div className="flex items-center gap-4 text-gray-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {place.district}
                          </span>
                          <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm font-semibold">
                            {place.category}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-purple-600">{place.score}%</div>
                        <div className="text-sm text-gray-600">Match Score</div>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">{place.description}</p>

                    {/* Reasons */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Why we recommend this:</h4>
                      <div className="flex flex-wrap gap-2">
                        {place.reasons.map((reason: string, idx: number) => (
                          <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {reason}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                      <span>⏱️ {place.duration}</span>
                      <span>🌤️ {place.bestTime}</span>
                      {place.priceFrom && <span>💰 From {place.priceFrom}</span>}
                    </div>

                    <div className="flex items-center text-purple-600 font-semibold">
                      <span>View Full Details</span>
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={resetQuiz}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-orange-600 text-white rounded-full font-semibold hover:shadow-lg transition-all"
            >
              Take Quiz Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[step];
  const progress = ((step + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-purple-100 text-purple-600 rounded-full mb-6">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">Smart Travel Advisor</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Find Your Perfect Destination</h1>
          <p className="text-xl text-gray-600">
            Answer a few questions and get personalized recommendations
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">
              Question {step + 1} of {questions.length}
            </span>
            <span className="text-sm font-semibold text-purple-600">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-600 to-orange-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-3xl p-8 shadow-2xl mb-8"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8">{currentQuestion.question}</h2>

            <div className={`grid ${currentQuestion.multiple ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
              {currentQuestion.options.map((option) => {
                const isSelected = currentQuestion.multiple
                  ? (answers[currentQuestion.id as keyof QuizAnswer] as string[] || []).includes(option.value)
                  : answers[currentQuestion.id as keyof QuizAnswer] === option.value;

                return (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(currentQuestion.id, option.value, currentQuestion.multiple)}
                    className={`p-6 rounded-2xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-4xl mb-3">{option.icon}</div>
                    <div className="font-bold text-gray-900 mb-1">{option.label}</div>
                    {option.desc && <div className="text-sm text-gray-600">{option.desc}</div>}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
              step === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          {step < questions.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
                canProceed()
                  ? 'bg-gradient-to-r from-purple-600 to-orange-600 text-white hover:shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={calculateRecommendations}
              disabled={!canProceed()}
              className={`flex items-center gap-2 px-8 py-3 rounded-full font-semibold transition-all ${
                canProceed()
                  ? 'bg-gradient-to-r from-purple-600 to-orange-600 text-white hover:shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              Get My Recommendations
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
