import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, Check, Mountain, Sparkles, Users, MapPin, Heart, Camera, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useAuth } from '../contexts/AuthContext';

// West Bengal destination images for animated background
const destinationImages = {
  hillStation: [
    'https://images.unsplash.com/photo-1754737843080-310c677de7f2?w=300&h=400&fit=crop',
    'https://images.unsplash.com/photo-1702781577240-170f5b107ffd?w=300&h=400&fit=crop',
    'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=300&h=400&fit=crop',
    'https://images.unsplash.com/photo-1609373066983-cee8662ea93f?w=300&h=400&fit=crop',
  ],
  beaches: [
    'https://images.unsplash.com/photo-1647436956263-301747dace33?w=300&h=400&fit=crop',
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=300&h=400&fit=crop',
    'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=300&h=400&fit=crop',
    'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=300&h=400&fit=crop',
  ],
  wildlife: [
    'https://images.unsplash.com/photo-1688998030272-b4da8ff17ef0?w=300&h=400&fit=crop',
    'https://images.unsplash.com/photo-1602320763174-e34d84feae55?w=300&h=400&fit=crop',
    'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=300&h=400&fit=crop',
    'https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?w=300&h=400&fit=crop',
  ],
  heritage: [
    'https://images.unsplash.com/photo-1697817665440-f988c6d5080f?w=300&h=400&fit=crop',
    'https://images.unsplash.com/photo-1691426792144-5efa484ce7d0?w=300&h=400&fit=crop',
    'https://images.unsplash.com/photo-1677307816181-1446ab18913e?w=300&h=400&fit=crop',
    'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=300&h=400&fit=crop',
  ],
  teaTrails: [
    'https://images.unsplash.com/photo-1710704824628-69640d6160ef?w=300&h=400&fit=crop',
    'https://images.unsplash.com/photo-1602020277972-99978250c8bd?w=300&h=400&fit=crop',
    'https://images.unsplash.com/photo-1624395149011-470cf6f6ec02?w=300&h=400&fit=crop',
    'https://images.unsplash.com/photo-1563789031959-4c02bcb41319?w=300&h=400&fit=crop',
  ],
  temple: [
    'https://images.unsplash.com/photo-1642661720955-13ee9063cdee?w=300&h=400&fit=crop',
    'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=300&h=400&fit=crop',
    'https://images.unsplash.com/photo-1548013146-72479768bada?w=300&h=400&fit=crop',
    'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=300&h=400&fit=crop',
  ],
  festivals: [
    'https://images.unsplash.com/photo-1699027611141-bd57b5f0c88e?w=300&h=400&fit=crop',
    'https://images.unsplash.com/photo-1590906424086-3dbc808fd54b?w=300&h=400&fit=crop',
    'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=300&h=400&fit=crop',
    'https://images.unsplash.com/photo-1600298882525-5a0e0dacb8ad?w=300&h=400&fit=crop',
  ],
  food: [
    'https://images.unsplash.com/photo-1654863404432-cac67587e25d?w=300&h=400&fit=crop',
    'https://images.unsplash.com/photo-1667849521403-d8723972f0a0?w=300&h=400&fit=crop',
    'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=300&h=400&fit=crop',
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300&h=400&fit=crop',
  ],
};

interface VerticalColumnProps {
  images: string[];
  speed: number;
}

function VerticalColumn({ images, speed }: VerticalColumnProps) {
  // Triple the images for seamless loop
  const duplicatedImages = [...images, ...images, ...images];

  return (
    <div className="relative h-full overflow-hidden">
      <motion.div
        className="flex flex-col gap-4"
        animate={{
          y: ['0%', '-33.33%'],
        }}
        transition={{
          y: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: speed,
            ease: 'linear',
          },
        }}
      >
        {duplicatedImages.map((image, index) => (
          <motion.div
            key={index}
            className="flex-shrink-0 w-32 h-40 md:w-40 md:h-52 rounded-2xl overflow-hidden shadow-xl"
            whileHover={{ scale: 1.05, rotate: 2 }}
            transition={{ duration: 0.3 }}
          >
            <ImageWithFallback
              src={image}
              alt={`West Bengal destination ${index}`}
              className="w-full h-full object-cover"
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export function SignInPage() {
  const { user, signIn, signUp, signInWithGoogle, signInWithFacebook } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [signupStep, setSignupStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Surface OAuth errors when redirected back from a failed/cancelled flow
  // (e.g. /#/signin?error=oauth_cancelled)
  useEffect(() => {
    const hash = window.location.hash || '';
    const queryStart = hash.indexOf('?');
    if (queryStart === -1) return;
    const params = new URLSearchParams(hash.slice(queryStart + 1));
    const errorCode = params.get('error');
    if (!errorCode) return;
    const messages: Record<string, string> = {
      oauth_cancelled: 'Sign-in cancelled. You can try again any time.',
      google_oauth_not_configured: 'Google sign-in is not available right now. Please use email/password.',
      facebook_oauth_not_configured: 'Facebook sign-in is not available right now. Please use email/password.',
      email_not_provided: 'Your social account didn\'t share an email. Please grant email access or use email/password sign-up.',
      token_exchange_failed: 'Sign-in failed. Please try again.',
      oauth_callback_failed: 'Sign-in completed but we couldn\'t verify your session. Try again.',
      oauth_failed: 'Something went wrong with social sign-in. Please try again.',
    };
    const message = messages[errorCode] || `Sign-in error: ${errorCode}`;
    setApiError(message);
    try { toast.error(message); } catch { /* toast not available */ }
    // Clean the URL so refresh doesn't re-show the error
    window.history.replaceState(null, '', '#/signin');
  }, []);

  // Form states
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [signupForm, setSignupForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    wantRecommendations: false,
    interests: [] as string[],
    budget: '',
    tripType: '',
    country: '',
    city: '',
  });

  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });

  // Create columns of images - each column represents different West Bengal experiences
  const columns = [
    destinationImages.hillStation,    // Column 1: Hill Stations
    destinationImages.heritage,       // Column 2: Heritage
    destinationImages.teaTrails,      // Column 3: Tea Trails
    destinationImages.wildlife,       // Column 4: Wildlife
    destinationImages.festivals,      // Column 5: Festivals
    destinationImages.temple,         // Column 6: Temples
    destinationImages.food,           // Column 7: Food & Culture
    destinationImages.beaches,        // Column 8: Beaches
  ];

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    const errors = { email: '', password: '', confirmPassword: '', fullName: '' };

    if (!validateEmail(loginForm.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (loginForm.password.length === 0) {
      errors.password = 'Password is required';
    }

    setFormErrors(errors);

    if (!errors.email && !errors.password) {
      setLoading(true);
      const result = await signIn(loginForm.email, loginForm.password);
      setLoading(false);
      
      if (result.success) {
        // Redirect admins to admin panel, regular users to home
        if (result.user?.role === 'admin') {
          window.location.hash = '#/admin';
        } else {
          window.location.hash = '#/';
        }
      } else {
        setApiError(result.error || 'Login failed');
      }
    }
  };

  const handleSignupStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    const errors = { email: '', password: '', confirmPassword: '', fullName: '' };

    if (!signupForm.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    if (!validateEmail(signupForm.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!validatePassword(signupForm.password)) {
      errors.password = 'Password must be 8+ characters with at least 1 letter and 1 number';
    }
    if (signupForm.password !== signupForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);

    if (!errors.fullName && !errors.email && !errors.password && !errors.confirmPassword) {
      setSignupStep(2);
    }
  };

  const handleSignupStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    setLoading(true);
    
    const result = await signUp(signupForm.email, signupForm.password, signupForm.fullName, {
      acceptedTerms: signupForm.agreeToTerms,
      acceptedPrivacy: signupForm.agreeToTerms,
      marketingOptIn: !!signupForm.wantRecommendations,
    });
    setLoading(false);
    
    if (result.success) {
      console.log('Sign up complete:', signupForm);
      setShowSuccessOverlay(true);

      setTimeout(() => {
        window.location.hash = '#/signin';
        setShowSuccessOverlay(false);
        setActiveTab('login');
        setSignupStep(1);
      }, 3000);
    } else {
      setApiError(result.error || 'Signup failed');
      setSignupStep(1);
    }
  };

  const toggleInterest = (interest: string) => {
    setSignupForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const interestChips = [
    { label: 'Hills & Tea', icon: Mountain },
    { label: 'Heritage & History', icon: Camera },
    { label: 'Festivals & Culture', icon: Sparkles },
    { label: 'Beaches & Seasides', icon: MapPin },
    { label: 'Wildlife & Nature', icon: Heart },
    { label: 'City & Nightlife', icon: Users },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#FFF9F2]">
      {/* Animated Vertical Columns Background */}
      <div className="absolute inset-0 flex gap-4 md:gap-6 pointer-events-none px-4">
        {columns.map((columnImages, index) => (
          <div key={index} className="flex-1">
            <VerticalColumn images={columnImages} speed={25 + index * 3} />
          </div>
        ))}
      </div>

      {/* Gradient Overlay at Top to hide cards as they reach navbar */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#FFF9F2] to-transparent z-[5] pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-6xl mx-auto">
          {/* Heading Section */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
            className="text-center mb-12 relative"
          >
            {/* Backdrop for better text visibility */}
            <div className="absolute inset-0 -mx-8 -my-6 bg-white/40 backdrop-blur-sm rounded-3xl -z-10" />
            
            <motion.h1
              className="mb-4 text-4xl md:text-5xl lg:text-6xl font-bold"
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #7c3aed 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 2px 20px rgba(147, 51, 234, 0.3)',
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.43, 0.13, 0.23, 0.96] }}
            >
              Start Your Journey of West Bengal
            </motion.h1>
            <motion.p
              className="text-gray-700 font-medium text-lg md:text-xl max-w-2xl mx-auto px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Discover the vibrant culture, breathtaking landscapes, and rich heritage
            </motion.p>
          </motion.div>

          {/* Auth Card - Centered */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.43, 0.13, 0.23, 0.96] }}
            className="max-w-md mx-auto"
          >
            {/* Glassmorphic Card */}
            <motion.div
              className="relative bg-white/95 backdrop-blur-2xl rounded-3xl p-8 md:p-10 border border-purple-100 shadow-2xl shadow-purple-500/10"
              whileHover={{ 
                boxShadow: '0 25px 50px -12px rgba(147, 51, 234, 0.15)',
              }}
              transition={{ duration: 0.4, ease: [0.43, 0.13, 0.23, 0.96] }}
            >
              {/* Gradient Border Effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-400/20 via-transparent to-purple-600/20 -z-10 blur-xl" />

              {/* Tabs */}
              <div className="flex gap-2 mb-8 bg-purple-50 rounded-2xl p-1.5">
                <button
                  onClick={() => {
                    setActiveTab('login');
                    setSignupStep(1);
                  }}
                  className={`flex-1 py-3 rounded-xl transition-all duration-300 ${
                    activeTab === 'login'
                      ? 'bg-white text-purple-700 shadow-md shadow-purple-200'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setActiveTab('signup');
                    setSignupStep(1);
                  }}
                  className={`flex-1 py-3 rounded-xl transition-all duration-300 ${
                    activeTab === 'signup'
                      ? 'bg-white text-purple-700 shadow-md shadow-purple-200'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              <AnimatePresence mode="wait">
                {activeTab === 'login' && (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.4, ease: [0.43, 0.13, 0.23, 0.96] }}
                  >
                    <div className="mb-6">
                      <h3 className="text-gray-900 mb-2">Welcome back, explorer</h3>
                      <p className="text-gray-600 text-sm">
                        Continue your journey through West Bengal
                      </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                      {/* Email */}
                      <div>
                        <label className="text-gray-700 text-sm mb-2 block">
                          Email address
                        </label>
                        <input
                          type="email"
                          placeholder="you@example.com"
                          value={loginForm.email}
                          onChange={(e) => {
                            setLoginForm({ ...loginForm, email: e.target.value });
                            setFormErrors({ ...formErrors, email: '' });
                          }}
                          className="w-full px-4 py-3.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                        />
                        {formErrors.email && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-xs mt-1.5"
                          >
                            {formErrors.email}
                          </motion.p>
                        )}
                      </div>

                      {/* Password */}
                      <div>
                        <label className="text-gray-700 text-sm mb-2 block">Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={loginForm.password}
                            onChange={(e) => {
                              setLoginForm({ ...loginForm, password: e.target.value });
                              setFormErrors({ ...formErrors, password: '' });
                            }}
                            className="w-full px-4 py-3.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {formErrors.password && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-xs mt-1.5"
                          >
                            {formErrors.password}
                          </motion.p>
                        )}
                      </div>

                      {/* Remember me & Forgot password */}
                      <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 text-gray-600 cursor-pointer hover:text-gray-900 transition-colors">
                          <input
                            type="checkbox"
                            checked={loginForm.rememberMe}
                            onChange={(e) =>
                              setLoginForm({ ...loginForm, rememberMe: e.target.checked })
                            }
                            className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          Remember me
                        </label>
                        <button
                          type="button"
                          onClick={() => window.location.hash = '#/forgot-password'}
                          className="text-purple-600 hover:text-purple-700 transition-colors"
                        >
                          Forgot password?
                        </button>
                      </div>

                      {/* API Error Display */}
                      {apiError && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl"
                        >
                          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                          <p className="text-sm text-red-700">{apiError}</p>
                        </motion.div>
                      )}

                      {/* Login Button */}
                      <motion.button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium shadow-lg shadow-purple-500/40 hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Log in'}
                      </motion.button>

                      {/* Divider */}
                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-4 bg-white text-gray-500">Or continue with</span>
                        </div>
                      </div>

                      {/* Social Login Buttons */}
                      <div className="grid grid-cols-2 gap-3">
                        <motion.button
                          type="button"
                          onClick={async () => {
                            setLoading(true);
                            await signInWithGoogle();
                            setLoading(false);
                          }}
                          disabled={loading}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          <span className="text-sm">Google</span>
                        </motion.button>

                        <motion.button
                          type="button"
                          onClick={async () => {
                            setLoading(true);
                            await signInWithFacebook();
                            setLoading(false);
                          }}
                          disabled={loading}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                          <span className="text-sm">Facebook</span>
                        </motion.button>
                      </div>

                      {/* Guest Login */}
                      <button
                        type="button"
                        onClick={() => window.location.hash = '#/'}
                        className="w-full py-2.5 text-gray-600 hover:text-gray-900 text-sm transition-colors"
                      >
                        Continue as guest
                      </button>

                      {/* Sign up link */}
                      <p className="text-center text-gray-600 text-sm pt-2">
                        New here?{' '}
                        <button
                          type="button"
                          onClick={() => setActiveTab('signup')}
                          className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
                        >
                          Sign up to save trips →
                        </button>
                      </p>
                    </form>
                  </motion.div>
                )}

                {activeTab === 'signup' && signupStep === 1 && (
                  <motion.div
                    key="signup-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.4, ease: [0.43, 0.13, 0.23, 0.96] }}
                  >
                    <div className="mb-6">
                      <h3 className="text-gray-900 mb-2">Create your travel account</h3>
                      <p className="text-gray-600 text-sm">
                        Save favourite places, wishlists and trips across West Bengal
                      </p>
                    </div>

                    <form onSubmit={handleSignupStep1} className="space-y-4">
                      {/* Full Name */}
                      <div>
                        <label className="text-gray-700 text-sm mb-2 block">Full name</label>
                        <input
                          type="text"
                          placeholder="Enter your full name"
                          value={signupForm.fullName}
                          onChange={(e) => {
                            setSignupForm({ ...signupForm, fullName: e.target.value });
                            setFormErrors({ ...formErrors, fullName: '' });
                          }}
                          className="w-full px-4 py-3.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                        />
                        {formErrors.fullName && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-xs mt-1.5"
                          >
                            {formErrors.fullName}
                          </motion.p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="text-gray-700 text-sm mb-2 block">
                          Email address
                        </label>
                        <input
                          type="email"
                          placeholder="you@example.com"
                          value={signupForm.email}
                          onChange={(e) => {
                            setSignupForm({ ...signupForm, email: e.target.value });
                            setFormErrors({ ...formErrors, email: '' });
                          }}
                          className="w-full px-4 py-3.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                        />
                        {formErrors.email && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-xs mt-1.5"
                          >
                            {formErrors.email}
                          </motion.p>
                        )}
                      </div>

                      {/* Password */}
                      <div>
                        <label className="text-gray-700 text-sm mb-2 block">
                          Create password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={signupForm.password}
                            onChange={(e) => {
                              setSignupForm({ ...signupForm, password: e.target.value });
                              setFormErrors({ ...formErrors, password: '' });
                            }}
                            className="w-full px-4 py-3.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        <p className="text-gray-500 text-xs mt-1.5">
                          8+ characters, at least 1 letter & 1 number
                        </p>
                        {formErrors.password && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-xs mt-1"
                          >
                            {formErrors.password}
                          </motion.p>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="text-gray-700 text-sm mb-2 block">
                          Confirm password
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={signupForm.confirmPassword}
                            onChange={(e) => {
                              setSignupForm({ ...signupForm, confirmPassword: e.target.value });
                              setFormErrors({ ...formErrors, confirmPassword: '' });
                            }}
                            className="w-full px-4 py-3.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                        {formErrors.confirmPassword && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-xs mt-1.5"
                          >
                            {formErrors.confirmPassword}
                          </motion.p>
                        )}
                      </div>

                      {/* Checkboxes */}
                      <div className="space-y-3 pt-2">
                        <label className="flex items-start gap-2.5 text-gray-700 cursor-pointer text-sm group">
                          <input
                            type="checkbox"
                            checked={signupForm.wantRecommendations}
                            onChange={(e) =>
                              setSignupForm({
                                ...signupForm,
                                wantRecommendations: e.target.checked,
                              })
                            }
                            className="w-4 h-4 mt-0.5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="group-hover:text-gray-900 transition-colors">
                            I want personalized trip recommendations
                          </span>
                        </label>
                        <label className="flex items-start gap-2.5 text-gray-700 cursor-pointer text-sm group">
                          <input
                            type="checkbox"
                            checked={signupForm.agreeToTerms}
                            onChange={(e) =>
                              setSignupForm({ ...signupForm, agreeToTerms: e.target.checked })
                            }
                            className="w-4 h-4 mt-0.5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="group-hover:text-gray-900 transition-colors">
                            I agree to the{' '}
                            <span className="text-purple-600 hover:text-purple-700">
                              Terms & Privacy Policy
                            </span>
                          </span>
                        </label>
                      </div>

                      {/* Continue Button */}
                      <motion.button
                        type="submit"
                        disabled={!signupForm.agreeToTerms}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium shadow-lg shadow-purple-500/40 hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none mt-6"
                        whileHover={{ scale: signupForm.agreeToTerms ? 1.02 : 1, y: signupForm.agreeToTerms ? -2 : 0 }}
                        whileTap={{ scale: signupForm.agreeToTerms ? 0.98 : 1 }}
                      >
                        Continue to travel profile
                      </motion.button>

                      {/* Divider */}
                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-4 bg-white text-gray-500">Or sign up with</span>
                        </div>
                      </div>

                      {/* Social Signup Buttons */}
                      <div className="grid grid-cols-2 gap-3">
                        <motion.button
                          type="button"
                          onClick={async () => {
                            setLoading(true);
                            await signInWithGoogle();
                            setLoading(false);
                          }}
                          disabled={loading}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          <span className="text-sm">Google</span>
                        </motion.button>

                        <motion.button
                          type="button"
                          onClick={async () => {
                            setLoading(true);
                            await signInWithFacebook();
                            setLoading(false);
                          }}
                          disabled={loading}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                          <span className="text-sm">Facebook</span>
                        </motion.button>
                      </div>

                      {/* Login link */}
                      <p className="text-center text-gray-600 text-sm pt-4">
                        Already have an account?{' '}
                        <button
                          type="button"
                          onClick={() => setActiveTab('login')}
                          className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
                        >
                          Log in
                        </button>
                      </p>
                    </form>
                  </motion.div>
                )}

                {activeTab === 'signup' && signupStep === 2 && (
                  <motion.div
                    key="signup-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.4, ease: [0.43, 0.13, 0.23, 0.96] }}
                    className="max-h-[600px] overflow-y-auto scrollbar-hide pr-1"
                  >
                    <div className="mb-6">
                      <h3 className="text-gray-900 mb-2">Tell us how you like to travel</h3>
                      <p className="text-gray-600 text-sm">
                        We'll tailor West Bengal destinations just for you
                      </p>
                    </div>

                    <form onSubmit={handleSignupStep2} className="space-y-6">
                      {/* Travel Interests */}
                      <div>
                        <label className="text-gray-700 text-sm mb-3 block">
                          What are you most interested in?
                        </label>
                        <div className="grid grid-cols-2 gap-2.5">
                          {interestChips.map((chip) => {
                            const Icon = chip.icon;
                            const isSelected = signupForm.interests.includes(chip.label);
                            return (
                              <motion.button
                                key={chip.label}
                                type="button"
                                onClick={() => toggleInterest(chip.label)}
                                className={`p-3 rounded-xl border transition-all duration-300 ${
                                  isSelected
                                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 border-purple-500 text-white shadow-md shadow-purple-500/30'
                                    : 'bg-white border-gray-200 text-gray-700 hover:border-purple-300 hover:shadow-sm'
                                }`}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                              >
                                <div className="flex items-center gap-2">
                                  <Icon className="w-4 h-4" />
                                  <span className="text-sm">{chip.label}</span>
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Budget Preference */}
                      <div>
                        <label className="text-gray-700 text-sm mb-3 block">
                          Your trip budget preference
                        </label>
                        <div className="grid grid-cols-3 gap-2 bg-purple-50 p-1.5 rounded-xl">
                          {['Budget', 'Mid-range', 'Premium'].map((budget) => (
                            <button
                              key={budget}
                              type="button"
                              onClick={() => setSignupForm({ ...signupForm, budget })}
                              className={`py-2.5 rounded-lg text-sm transition-all duration-300 ${
                                signupForm.budget === budget
                                  ? 'bg-white text-purple-700 shadow-md'
                                  : 'text-gray-600 hover:text-gray-900'
                              }`}
                            >
                              {budget}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Trip Type */}
                      <div>
                        <label className="text-gray-700 text-sm mb-3 block">
                          Who do you usually travel with?
                        </label>
                        <div className="grid grid-cols-2 gap-2.5">
                          {['Solo', 'Family', 'Friends', 'Couple'].map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setSignupForm({ ...signupForm, tripType: type })}
                              className={`py-3 px-4 rounded-xl border text-sm transition-all duration-300 ${
                                signupForm.tripType === type
                                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 border-purple-500 text-white shadow-md shadow-purple-500/30'
                                  : 'bg-white border-gray-200 text-gray-700 hover:border-purple-300 hover:shadow-sm'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Location */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-gray-700 text-sm mb-2 block">Country</label>
                          <input
                            type="text"
                            placeholder="India"
                            value={signupForm.country}
                            onChange={(e) =>
                              setSignupForm({ ...signupForm, country: e.target.value })
                            }
                            className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                          />
                        </div>
                        <div>
                          <label className="text-gray-700 text-sm mb-2 block">City</label>
                          <input
                            type="text"
                            placeholder="Kolkata"
                            value={signupForm.city}
                            onChange={(e) =>
                              setSignupForm({ ...signupForm, city: e.target.value })
                            }
                            className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                          />
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setSignupStep(1)}
                          className="px-5 py-3 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-300 flex items-center gap-2"
                        >
                          <ArrowLeft className="w-4 h-4" /> 
                          <span>Back</span>
                        </button>
                        <motion.button
                          type="submit"
                          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium shadow-lg shadow-purple-500/40 hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300"
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Finish & explore West Bengal
                        </motion.button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Terms & Privacy */}
              <p className="text-center text-gray-500 text-xs mt-6">
                By {activeTab === 'login' ? 'logging in' : 'signing up'}, you agree to our{' '}
                <button className="text-purple-600 hover:text-purple-700 transition-colors">
                  Terms
                </button>{' '}
                &{' '}
                <button className="text-purple-600 hover:text-purple-700 transition-colors">
                  Privacy Policy
                </button>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccessOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.6, bounce: 0.3 }}
              className="bg-white rounded-3xl p-12 text-center max-w-md mx-4 shadow-2xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                className="w-20 h-20 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Check className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-gray-900 mb-3">Check Your Email! 📧</h2>
              <p className="text-gray-600 mb-6">
                We've sent a verification email to <strong>{signupForm.email}</strong>. Please verify your email to activate your account.
              </p>
              <motion.div
                className="flex gap-2 items-center justify-center text-purple-600"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="w-2 h-2 bg-purple-600 rounded-full" />
                <div className="w-2 h-2 bg-purple-600 rounded-full" />
                <div className="w-2 h-2 bg-purple-600 rounded-full" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
}