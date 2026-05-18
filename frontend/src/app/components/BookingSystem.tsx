import { API_BASE, getToken} from '../utils/api';
import React, { useState } from 'react';
import { Calendar, Users, Home, MapPin, CheckCircle, CreditCard, Shield, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';


// Razorpay SDK loader — only loads checkout.js on demand
function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

interface BookingSystemProps {
  destinationSlug: string;
  destinationName: string;
  destinationImage?: string;
  basePrice: number;
}

interface BookingDetails {
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  accommodationType: 'hotel' | 'resort' | 'homestay' | 'tour';
  addOns: string[];
}

export const BookingSystem: React.FC<BookingSystemProps> = ({
  destinationSlug,
  destinationName,
  destinationImage,
  basePrice,
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [step, setStep] = useState<'details' | 'review' | 'payment' | 'success'>('details');
  const [booking, setBooking] = useState<BookingDetails>({
    checkIn: '',
    checkOut: '',
    guests: 2,
    rooms: 1,
    accommodationType: 'hotel',
    addOns: [],
  });
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState('');

  const addOnsOptions = [
    { id: 'breakfast', name: 'Breakfast Included', price: 500 },
    { id: 'transport', name: 'Airport Transfer', price: 1500 },
    { id: 'guide', name: 'Local Guide', price: 2000 },
    { id: 'activities', name: 'Activity Package', price: 3000 },
  ];

  const calculateTotal = () => {
    const days = booking.checkIn && booking.checkOut
      ? Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24))
      : 1;
    const roomTotal = basePrice * booking.rooms * days;
    const addOnsTotal = booking.addOns.reduce((sum, id) => {
      const addOn = addOnsOptions.find((a) => a.id === id);
      return sum + (addOn?.price || 0) * days;
    }, 0);
    const tax = (roomTotal + addOnsTotal) * 0.18; // 18% GST
    return {
      subtotal: roomTotal,
      addOns: addOnsTotal,
      tax,
      total: roomTotal + addOnsTotal + tax,
    };
  };

  // Submit booking with real Razorpay checkout
  // Falls back to dev-mode flow if backend reports Razorpay isn't configured.
  const handleSubmitBooking = async () => {
    if (!user) {
      toast.error('Please sign in to make a booking');
      window.location.hash = '/signin';
      return;
    }

    if (!booking.checkIn || !booking.checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }

    try {
      setLoading(true);

      // Step 1: Create Razorpay order on backend
      const orderRes = await fetch(`${API_BASE}/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken() || ''}`,
        },
        body: JSON.stringify({ amount: Math.round(costs.total) }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        toast.error(orderData.error || 'Could not create payment order');
        setLoading(false);
        return;
      }

      // Step 2: If real Razorpay, open checkout; if dev mode, skip directly to booking
      if (!orderData.order?.dev_mode && orderData.keyId !== 'dev_mode_no_real_payment') {
        const sdkLoaded = await loadRazorpay();
        if (!sdkLoaded) {
          toast.error('Could not load payment gateway. Try again.');
          setLoading(false);
          return;
        }
        const paymentResult: { paymentId: string; orderId: string; signature: string } | null = await new Promise((resolve) => {
          const rzp = new (window as any).Razorpay({
            key: orderData.keyId,
            amount: orderData.order.amount,
            currency: orderData.order.currency || 'INR',
            order_id: orderData.order.id,
            name: 'Bengal Trails',
            description: `Booking for ${destinationName}`,
            prefill: {
              name: user.name || '',
              email: user.email || '',
            },
            theme: { color: '#9333ea' },
            handler: (response: any) => resolve({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
            }),
            modal: { ondismiss: () => resolve(null) },
          });
          rzp.open();
        });

        if (!paymentResult) {
          toast.info('Payment cancelled');
          setLoading(false);
          return;
        }

        // Step 3: Verify payment on backend
        const verifyRes = await fetch(`${API_BASE}/payments/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken() || ''}`,
          },
          body: JSON.stringify(paymentResult),
        });
        if (!verifyRes.ok) {
          toast.error('Payment verification failed');
          setLoading(false);
          return;
        }
      }

      // Step 4: Create booking record (works for both real and dev mode)
      const response = await fetch(
        `${API_BASE}/bookings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken() || ''}`,
          },
          body: JSON.stringify({
            userId: user.id,
            destinationSlug,
            destinationName,
            ...booking,
            total: calculateTotal().total,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBookingId(data.bookingId);
        setStep('success');
        toast.success('Booking confirmed successfully!');
      } else {
        toast.error('Failed to complete booking');
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast.error('Failed to complete booking');
    } finally {
      setLoading(false);
    }
  };

  const toggleAddOn = (id: string) => {
    setBooking({
      ...booking,
      addOns: booking.addOns.includes(id)
        ? booking.addOns.filter((a) => a !== id)
        : [...booking.addOns, id],
    });
  };

  const costs = calculateTotal();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {t('booking.title')}
        </h2>
        <p className="text-gray-600">Secure your perfect West Bengal experience</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8 flex items-center justify-between">
        {['details', 'review', 'payment', 'success'].map((s, index) => (
          <React.Fragment key={s}>
            <div
              className={`flex items-center gap-2 ${
                step === s ? 'text-purple-600' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step === s
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index + 1}
              </div>
              <span className="font-semibold capitalize hidden md:block">{s}</span>
            </div>
            {index < 3 && (
              <div
                className={`flex-1 h-1 mx-2 ${
                  ['details', 'review', 'payment', 'success'].indexOf(step) > index
                    ? 'bg-purple-600'
                    : 'bg-gray-200'
                }`}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Booking Details */}
        {step === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Accommodation Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Accommodation Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['hotel', 'resort', 'homestay', 'tour'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setBooking({ ...booking, accommodationType: type as any })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      booking.accommodationType === type
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <Home className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                    <p className="font-semibold capitalize text-sm">{type}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Dates */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  {t('booking.checkIn')}
                </label>
                <input
                  type="date"
                  value={booking.checkIn}
                  onChange={(e) => setBooking({ ...booking, checkIn: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  {t('booking.checkOut')}
                </label>
                <input
                  type="date"
                  value={booking.checkOut}
                  onChange={(e) => setBooking({ ...booking, checkOut: e.target.value })}
                  min={booking.checkIn || new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Guests & Rooms */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-2" />
                  {t('booking.guests')}
                </label>
                <input
                  type="number"
                  value={booking.guests}
                  onChange={(e) => setBooking({ ...booking, guests: Number(e.target.value) })}
                  min={1}
                  max={10}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Home className="w-4 h-4 inline mr-2" />
                  {t('booking.rooms')}
                </label>
                <input
                  type="number"
                  value={booking.rooms}
                  onChange={(e) => setBooking({ ...booking, rooms: Number(e.target.value) })}
                  min={1}
                  max={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Add-ons */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Add-ons & Extras
              </label>
              <div className="space-y-3">
                {addOnsOptions.map((addOn) => (
                  <label
                    key={addOn.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-purple-300 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={booking.addOns.includes(addOn.id)}
                        onChange={() => toggleAddOn(addOn.id)}
                        className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span className="font-medium">{addOn.name}</span>
                    </div>
                    <span className="font-semibold text-purple-600">₹{addOn.price}/day</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep('review')}
              className="w-full px-6 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold text-lg"
            >
              Continue to Review
            </button>
          </motion.div>
        )}

        {/* Step 2: Review Booking */}
        {step === 'review' && (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Destination Info */}
            <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl">
              {destinationImage && (
                <img
                  src={destinationImage}
                  alt={destinationName}
                  className="w-24 h-24 rounded-lg object-cover"
                />
              )}
              <div>
                <h3 className="text-xl font-bold text-gray-900">{destinationName}</h3>
                <p className="text-gray-600 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  West Bengal, India
                </p>
              </div>
            </div>

            {/* Booking Summary */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Accommodation:</span>
                <span className="font-semibold capitalize">{booking.accommodationType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Check-in:</span>
                <span className="font-semibold">
                  {new Date(booking.checkIn).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Check-out:</span>
                <span className="font-semibold">
                  {new Date(booking.checkOut).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Guests:</span>
                <span className="font-semibold">{booking.guests} guests</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rooms:</span>
                <span className="font-semibold">{booking.rooms} room(s)</span>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="border-t border-gray-200 pt-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Accommodation:</span>
                <span className="font-semibold">₹{costs.subtotal.toLocaleString()}</span>
              </div>
              {costs.addOns > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Add-ons:</span>
                  <span className="font-semibold">₹{costs.addOns.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Taxes (18% GST):</span>
                <span className="font-semibold">₹{costs.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-purple-600 pt-3 border-t border-gray-200">
                <span>{t('booking.total')}:</span>
                <span>₹{Math.round(costs.total).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('details')}
                className="flex-1 px-6 py-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Back
              </button>
              <button
                onClick={() => setStep('payment')}
                className="flex-1 px-6 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                Proceed to Payment
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Payment */}
        {step === 'payment' && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
              <Shield className="w-16 h-16 text-purple-600 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Secure Payment</h3>
              <p className="text-gray-600">Your payment information is encrypted and secure</p>
            </div>

            <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-blue-800 font-semibold mb-2">Payment</p>
              <p className="text-blue-700 text-sm">
                You'll be redirected to Razorpay's secure checkout. If the backend doesn't have Razorpay keys configured yet, the booking will be recorded without a charge (dev mode).
              </p>
            </div>

            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 mb-2">
                Total Amount: ₹{Math.round(costs.total).toLocaleString()}
              </p>
              <p className="text-gray-600">Includes all taxes and fees</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('review')}
                className="flex-1 px-6 py-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Back
              </button>
              <button
                onClick={handleSubmitBooking}
                disabled={loading}
                className="flex-1 px-6 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    {t('booking.confirmBooking')}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Success */}
        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-3">Booking Confirmed!</h3>
            <p className="text-xl text-gray-600 mb-6">
              Your booking ID: <span className="font-bold text-purple-600">{bookingId}</span>
            </p>
            <div className="max-w-md mx-auto space-y-4 text-left bg-purple-50 p-6 rounded-xl mb-8">
              <p className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                <span>Confirmation email sent to your registered email address</span>
              </p>
              <p className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                <span>You'll receive check-in details 24 hours before your arrival</span>
              </p>
              <p className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                <span>Free cancellation up to 48 hours before check-in</span>
              </p>
            </div>
            <div className="flex gap-3 max-w-md mx-auto">
              <button
                onClick={() => (window.location.hash = '/profile')}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                View My Bookings
              </button>
              <button
                onClick={() => (window.location.hash = '/explore')}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Explore More
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
