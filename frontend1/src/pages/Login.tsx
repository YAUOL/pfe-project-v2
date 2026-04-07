import { Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { useState } from 'react';
import { login } from '../api';

interface LoginProps {
  onNavigate: (page: string) => void;
  onLoginSuccess?: () => void;
}

export function Login({ onNavigate, onLoginSuccess }: LoginProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const result = await login(formData.email, formData.password);

      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        if (result.role === 'ADMIN') {
          onNavigate('admin-dashboard');
        } else if (result.role === 'RECRUTEUR') {
          onNavigate('employer-dashboard');
        } else if (result.role === 'CANDIDAT') {
          onNavigate('candidate-dashboard');
        } else {
          onNavigate('home');
        }
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to login. Please try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full max-h-[90vh]">
        <div className="bg-white rounded-2xl shadow-custom-lg border border-color p-6 sm:p-8 flex flex-col gap-6 h-full">
          <div className="flex items-start justify-between">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="text-sm text-secondary hover:text-primary transition-colors underline-offset-4 hover:underline"
            >
              ← Back
            </button>
            <div className="flex-1 text-center">
              <img
                src="/logo.png"
                alt="Recrutement AI logo"
                className="w-20 h-20 mx-auto mb-3 object-contain"
              />
              <h1 className="mb-1">Welcome Back</h1>
              <p className="text-secondary text-sm">
                Sign in to your account to continue
              </p>
            </div>
            <div className="w-10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 flex-1">
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
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 h-12 border-color rounded-lg"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="mb-2 block">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 h-12 border-color rounded-lg"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Checkbox
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, rememberMe: checked as boolean })
                  }
                />
                <Label
                  htmlFor="rememberMe"
                  className="ml-2 cursor-pointer text-sm text-secondary"
                >
                  Remember me
                </Label>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('forgot-password')}
                className="text-sm text-primary hover:text-primary-hover transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary hover:bg-primary-hover text-white rounded-lg h-12"
            >
              {submitting ? 'Signing In...' : 'Sign In'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            {error && (
              <p className="text-sm text-red-600 mt-2 text-center">
                {error}
              </p>
            )}
          </form>

          <div className="mt-4 border-t border-color pt-4 space-y-3">
            <p className="text-center text-sm text-secondary">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => onNavigate('signup')}
                className="text-primary hover:text-primary-hover font-medium transition-colors"
              >
                Sign up
              </button>
            </p>
            <p className="text-center text-xs text-muted">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}