import { motion } from 'motion/react';

interface LegalPageProps {
  page: 'privacy' | 'terms' | 'cookies' | 'contact';
}

const SUPPORT_EMAIL = 'hello@bengaltrails.com';

export function LegalPage({ page }: LegalPageProps) {
  const content = {
    privacy: {
      title: 'Privacy Policy',
      sections: [
        {
          heading: '1. Information We Collect',
          body: 'We collect information you provide directly (name, email when signing up or subscribing to our newsletter) and information automatically gathered through analytics (page views, device type, approximate location). We do not sell personal data.',
        },
        {
          heading: '2. How We Use Your Information',
          body: 'To personalize your experience, save your wishlists and itineraries, send the newsletter you subscribed to, and improve the service through aggregated analytics.',
        },
        {
          heading: '3. Data Storage',
          body: 'Account data is stored securely in a PostgreSQL database hosted on Render. Passwords are hashed with bcrypt and never stored in plaintext. Uploaded photos are stored via Cloudinary CDN. We retain data only as long as necessary to provide the service.',
        },
        {
          heading: '4. Cookies',
          body: 'We use a small number of cookies for authentication sessions and analytics. See our Cookie Policy for details.',
        },
        {
          heading: '5. Your Rights',
          body: `You can request access, export, or deletion of your data at any time by contacting ${SUPPORT_EMAIL}.`,
        },
        {
          heading: '6. Changes',
          body: 'We may update this policy. Material changes will be communicated via the site or email.',
        },
      ],
    },
    terms: {
      title: 'Terms of Service',
      sections: [
        {
          heading: '1. Acceptance',
          body: 'By using Bengal Trails, you agree to these terms. If you do not agree, please do not use the service.',
        },
        {
          heading: '2. Use of Service',
          body: 'Bengal Trails provides travel information about West Bengal for personal, non-commercial use. You agree not to misuse the service, attempt to disrupt it, or use it to violate any law.',
        },
        {
          heading: '3. User Content',
          body: 'You retain ownership of content you submit (reviews, photos). By submitting, you grant Bengal Trails a non-exclusive license to display it on the platform.',
        },
        {
          heading: '4. Travel Information',
          body: 'Destination details, prices, and timings are provided for guidance only. Verify with official sources before traveling. Bengal Trails is not liable for inaccuracies or travel outcomes.',
        },
        {
          heading: '5. Account Termination',
          body: 'We may suspend accounts that violate these terms. You may delete your account at any time.',
        },
        {
          heading: '6. Limitation of Liability',
          body: 'The service is provided "as is" without warranties. To the maximum extent permitted by law, Bengal Trails is not liable for indirect or consequential damages.',
        },
      ],
    },
    cookies: {
      title: 'Cookie Policy',
      sections: [
        {
          heading: 'What are cookies?',
          body: 'Cookies are small text files placed on your device when you visit a website. They help the site remember information about your visit.',
        },
        {
          heading: 'Cookies we use',
          body: 'Essential cookies: authentication tokens to keep you signed in. Analytics cookies: anonymous usage measurement (Google Analytics, only if enabled).',
        },
        {
          heading: 'Managing cookies',
          body: 'You can clear or block cookies in your browser settings. Blocking essential cookies will prevent sign-in from working.',
        },
      ],
    },
    contact: {
      title: 'Contact Us',
      sections: [
        {
          heading: 'Email',
          body: `${SUPPORT_EMAIL} — we typically respond within 1–2 business days.`,
        },
        {
          heading: 'Location',
          body: 'Kolkata, West Bengal, India',
        },
        {
          heading: 'Press & Partnerships',
          body: `For press, partnership, or business enquiries, write to ${SUPPORT_EMAIL} with the subject "Partnership".`,
        },
        {
          heading: 'Report an Issue',
          body: 'Found incorrect information about a destination, or a bug on the site? Please email us with the page URL and a short description.',
        },
      ],
    },
  } as const;

  const data = content[page];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-16">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1
            className="text-4xl mb-2 text-[#7d1f2e]"
            style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}
          >
            {data.title}
          </h1>
          <p className="text-sm text-gray-500 mb-10">
            Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="space-y-8">
            {data.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-xl mb-2 text-gray-900" style={{ fontWeight: 600 }}>
                  {section.heading}
                </h2>
                <p className="text-gray-700 leading-relaxed">{section.body}</p>
              </section>
            ))}
          </div>

          {page !== 'contact' && (
            <p className="mt-12 text-sm text-gray-500">
              Questions about this policy? Email{' '}
              <a className="text-[#7d1f2e] underline" href={`mailto:${SUPPORT_EMAIL}`}>
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
