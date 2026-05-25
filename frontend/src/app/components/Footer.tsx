import { API_BASE, getToken} from '../utils/api';
import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Send,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Heart
} from 'lucide-react';
import { toast } from 'sonner';

export function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trap, setTrap] = useState(''); // honeypot — bots fill this

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (trap) {
      // Silently succeed for bots — don't reveal we detected them
      setNewsletterEmail('');
      return;
    }

    if (!newsletterEmail) {
      toast.error('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newsletterEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${API_BASE}/newsletter/subscribe`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken() || ''}`,
          },
          body: JSON.stringify({ email: newsletterEmail }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success('🎉 Successfully subscribed to newsletter!');
        setNewsletterEmail('');
      } else {
        toast.error(data.error || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast.error('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const footerLinks = {
    destinations: [
      { name: 'Darjeeling', href: '/explore/darjeeling' },
      { name: 'Sundarbans', href: '/explore/sundarbans-national-park' },
      { name: 'Victoria Memorial', href: '/explore/victoria-memorial-kolkata' },
      { name: 'All Destinations', href: '/explore' },
    ],
    tools: [
      { name: 'Itinerary Builder', href: '/itinerary' },
      { name: 'Compare Destinations', href: '/compare' },
      { name: 'Budget Estimator', href: '/budget' },
      { name: 'Festival Calendar', href: '/festivals' },
    ],
    support: [
      { name: 'Interactive Map', href: '/map' },
      { name: 'Bengali Phrasebook', href: '/phrasebook' },
      { name: 'Food Guide', href: '/food' },
      { name: 'Trip Planner', href: '/planner' },
    ],
  };

  return (
    <footer className="relative bg-gradient-to-b from-[#7d1f2e] to-[#5a1621] text-white overflow-hidden">
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-16">
        {/* Top Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                  <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Ripple circles */}
                    <circle cx="32" cy="16" r="10" stroke="#FFA500" strokeWidth="0.8" opacity="0.5" fill="none"/>
                    <circle cx="32" cy="16" r="12" stroke="#FFA500" strokeWidth="0.6" opacity="0.4" fill="none"/>
                    <circle cx="32" cy="16" r="14" stroke="#FFA500" strokeWidth="0.4" opacity="0.3" fill="none"/>
                    
                    <circle cx="16" cy="32" r="10" stroke="#FFA500" strokeWidth="0.8" opacity="0.5" fill="none"/>
                    <circle cx="16" cy="32" r="12" stroke="#FFA500" strokeWidth="0.6" opacity="0.4" fill="none"/>
                    <circle cx="16" cy="32" r="14" stroke="#FFA500" strokeWidth="0.4" opacity="0.3" fill="none"/>
                    
                    {/* Main abstract Bengal Trails logo shape */}
                    <path 
                      d="M 32 11 C 28 11 25 14 25 18 C 25 22 28 25 32 25 C 36 25 39 22 39 18 C 39 14 36 11 32 11 Z M 32 14 C 34 14 36 16 36 18 C 36 20 34 22 32 22 C 30 22 28 20 28 18 C 28 16 30 14 32 14 Z"
                      fill="white"
                    />
                    
                    <path 
                      d="M 22 20 C 20 22 18 24 16 26 C 14 28 12 30 11 32 C 10 34 10 36 11 37 C 12 39 14 40 17 40 C 20 40 22 39 24 37 L 26 35 C 26 35 25 34 24 33 C 23 32 22 31 22 30 C 22 29 23 28 24 27 L 28 23 C 29 22 30 21 30 20 C 30 19 29 18 28 18 C 27 17 26 17 25 18 L 22 20 Z M 16 30 C 18 30 20 32 20 34 C 20 36 18 38 16 38 C 14 38 12 36 12 34 C 12 32 14 30 16 30 Z"
                      fill="white"
                    />
                  </svg>
                </div>
                <span className="text-3xl" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800 }}>Bengal Trails</span>
              </div>
              <p className="text-orange-100 mb-6 leading-relaxed">
                Discover the soul of West Bengal. Experience authentic culture, breathtaking landscapes, and unforgettable memories with Bengal's most trusted travel companion.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-orange-100">
                  <MapPin className="w-4 h-4 text-orange-400" />
                  <span className="text-sm">Kolkata, West Bengal, India</span>
                </div>
                <a href="/contact" className="flex items-center gap-3 text-orange-100 hover:text-white transition-colors">
                  <Mail className="w-4 h-4 text-orange-400" />
                  <span className="text-sm">hello@bengaltrails.com</span>
                </a>
                <a href="/contact" className="flex items-center gap-3 text-orange-100 hover:text-white transition-colors">
                  <Phone className="w-4 h-4 text-orange-400" />
                  <span className="text-sm">Contact us</span>
                </a>
              </div>
            </motion.div>
          </div>

          {/* Destinations Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="text-lg mb-6 text-orange-200">Top Destinations</h4>
            <ul className="space-y-3">
              {footerLinks.destinations.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-orange-100 hover:text-white hover:translate-x-1 inline-block transition-all duration-200 group"
                  >
                    <span className="relative">
                      {link.name}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-400 group-hover:w-full transition-all duration-300" />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Tools Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="text-lg mb-6 text-orange-200">Tools</h4>
            <ul className="space-y-3">
              {footerLinks.tools.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-orange-100 hover:text-white hover:translate-x-1 inline-block transition-all duration-200 group"
                  >
                    <span className="relative">
                      {link.name}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-400 group-hover:w-full transition-all duration-300" />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="text-lg mb-6 text-orange-200">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-orange-100 hover:text-white hover:translate-x-1 inline-block transition-all duration-200 group"
                  >
                    <span className="relative">
                      {link.name}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-400 group-hover:w-full transition-all duration-300" />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Helpful Links Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <div>
              <h3 className="text-lg mb-4">Helpful Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/planner" className="hover:text-white transition-colors">Trip Planner</a></li>
                <li><a href="/food" className="hover:text-white transition-colors">Food Guide</a></li>
                <li><a href="/map" className="hover:text-white transition-colors">Interactive Map</a></li>
                <li><a href="/phrasebook" className="hover:text-white transition-colors">Bengali Phrasebook</a></li>
                <li><a href="/emergency" className="hover:text-white transition-colors">Emergency Info</a></li>
                <li><a href="/partners" className="hover:text-white transition-colors">Our Partners</a></li>
                <li><a href="/vendor-onboarding" className="hover:text-white transition-colors">Become a Partner</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-orange-800/40 to-red-800/40 backdrop-blur-sm rounded-2xl p-8 mb-12 border border-orange-500/20"
        >
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl md:text-3xl mb-3">Stay Updated with Bengal Adventures</h3>
            <p className="text-orange-100 mb-6">
              Get exclusive travel tips, special offers, and destination guides delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 px-5 py-3.5 rounded-full bg-white/10 border border-orange-300/30 focus:outline-none focus:border-orange-400 focus:bg-white/15 transition-all placeholder:text-orange-200/60 text-white backdrop-blur-sm"
              />
              {/* Honeypot — hidden from humans, bots will fill it */}
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={trap}
                onChange={(e) => setTrap(e.target.value)}
                style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
                name="company"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 px-8 py-3.5 rounded-full hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                onClick={handleNewsletterSubmit}
                disabled={isSubmitting}
              >
                <span>Subscribe</span>
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <div className="border-t border-orange-500/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-orange-200 text-center md:text-left flex items-center gap-2"
            >
              © 2025 Bengal Trails. Made with <Heart className="w-4 h-4 fill-orange-400 text-orange-400" /> in West Bengal
            </motion.p>
            
            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex gap-3"
            >
              {[
                { icon: Facebook, label: 'Facebook', href: 'https://facebook.com' },
                { icon: Instagram, label: 'Instagram', href: 'https://instagram.com' },
                { icon: Twitter, label: 'Twitter', href: 'https://twitter.com' },
                { icon: Youtube, label: 'YouTube', href: 'https://youtube.com' },
              ].map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-gradient-to-br hover:from-orange-500 hover:to-red-600 transition-all border border-orange-300/20 hover:border-orange-400 group"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 text-orange-200 group-hover:text-white transition-colors" />
                </motion.a>
              ))}
            </motion.div>
          </div>

          {/* Legal Links */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap justify-center gap-6 mt-6 text-sm"
          >
            <a href="/privacy" className="text-orange-200 hover:text-white transition-colors">Privacy Policy</a>
            <span className="text-orange-500/50">•</span>
            <a href="/terms" className="text-orange-200 hover:text-white transition-colors">Terms of Service</a>
            <span className="text-orange-500/50">•</span>
            <a href="/cookies" className="text-orange-200 hover:text-white transition-colors">Cookie Policy</a>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}