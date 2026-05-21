import { motion } from 'motion/react';
import { Shield, Lock, Terminal } from 'lucide-react';
import { Button } from './ui/button';

/**
 * AdminSetupPage — informational only.
 *
 * The first admin account is provisioned by the database migration using the
 * FIRST_ADMIN_EMAIL / FIRST_ADMIN_PASSWORD environment variables (see
 * backend/src/db/migrate.js). The old self-service "create first admin" flow was
 * removed for security — all /api/admin routes require an existing admin, so a
 * public creation endpoint would have been a privilege-escalation hole.
 *
 * This page therefore no longer calls any API; it just explains how admin access
 * works and links to the admin sign-in page.
 */
export function AdminSetupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8"
      >
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Access</h1>
          <p className="text-gray-600">
            The admin account is created automatically when the backend is deployed.
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
            <p className="text-sm font-semibold text-purple-900 flex items-center gap-2 mb-1">
              <Terminal className="w-4 h-4" /> How it works
            </p>
            <p className="text-sm text-purple-900/80">
              Set <code className="font-mono text-xs bg-white px-1 py-0.5 rounded">FIRST_ADMIN_EMAIL</code> and{' '}
              <code className="font-mono text-xs bg-white px-1 py-0.5 rounded">FIRST_ADMIN_PASSWORD</code> in your
              hosting dashboard, then run the database migration. The admin user is created on first run.
            </p>
          </div>

          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <p className="text-sm text-gray-700 flex items-start gap-2">
              <Lock className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500" />
              <span>
                For security, admins can no longer be created from the browser. New admins are promoted by an
                existing admin from the <strong>Users</strong> tab in the dashboard.
              </span>
            </p>
          </div>

          <Button
            onClick={() => { window.location.hash = '#/admin-login'; }}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <Shield className="w-5 h-5 mr-2" />
            Go to Admin Sign In
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
