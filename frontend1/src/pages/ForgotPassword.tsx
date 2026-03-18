import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useState } from 'react';

interface ForgotPasswordProps {
  onNavigate: (page: string) => void;
}

export function ForgotPassword({ onNavigate }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle password reset logic
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">JB</span>
            </div>
          </div>

          {/* Success Message */}
          <div className="bg-white rounded-2xl shadow-custom-lg border border-color p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="mb-4">Check Your Email</h1>
            <p className="text-secondary mb-6">
              We've sent password reset instructions to <strong>{email}</strong>
            </p>
            <p className="text-sm text-secondary mb-8">
              Didn't receive the email? Check your spam folder or try again.
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => onNavigate('login')}
                className="w-full bg-primary hover:bg-primary-hover text-white rounded-lg h-12"
              >
                Back to Login
              </Button>
              <Button
                onClick={() => setIsSubmitted(false)}
                variant="outline"
                className="w-full border-color rounded-lg h-12"
              >
                Resend Email
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">JB</span>
          </div>
          <h1 className="mb-2">Forgot Password?</h1>
          <p className="text-secondary">
            No worries! Enter your email and we'll send you reset instructions.
          </p>
        </div>

        {/* Reset Form */}
        <div className="bg-white rounded-2xl shadow-custom-lg border border-color p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <Label htmlFor="email" className="mb-2 block">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 border-color rounded-lg"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary-hover text-white rounded-lg h-12"
            >
              Send Reset Link
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <button
              onClick={() => onNavigate('login')}
              className="inline-flex items-center text-secondary hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </button>
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-6 text-center">
          <p className="text-sm text-secondary">
            Need help?{' '}
            <a href="#" className="text-primary hover:text-primary-hover font-medium">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
