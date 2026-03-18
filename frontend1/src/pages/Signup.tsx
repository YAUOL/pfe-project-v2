import { Mail, Lock, User, ArrowRight, Briefcase, UserCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { useState } from 'react';
import { registerCandidate } from '../api';

interface SignupProps {
  onNavigate: (page: string) => void;
}

export function Signup({ onNavigate }: SignupProps) {
  const [userType, setUserType] = useState<'candidate' | 'employer' | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!userType) {
      setError('Please select an account type');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.agreeToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    try {
      setSubmitting(true);

      // Détermine le rôle selon le type sélectionné
      const role = userType === 'employer' ? 'RECRUTEUR' : 'CANDIDAT';

      // Envoie au backend avec le bon rôle
      await registerCandidate(formData.fullName, formData.email, formData.password, role);

      alert('Account created successfully! You can now log in.');
      onNavigate('login');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to sign up. Please try again.';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full">
        {/* Back to Landing Page (top-left) */}
        <div className="mb-4 flex justify-start">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="text-sm text-secondary hover:text-primary transition-colors underline-offset-4 hover:underline"
          >
            ← Back to landing page
          </button>
        </div>
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="Recrutement AI logo"
            className="w-20 h-20 mx-auto mb-4 object-contain"
          />
          <h1 className="mb-2">Create Your Account</h1>
          <p className="text-secondary">Join thousands of professionals on JobBoard</p>
        </div>

        {/* Account Type Selection */}
        {!userType ? (
          <div className="bg-white rounded-2xl shadow-custom-lg border border-color p-8">
            <h2 className="text-center mb-6">I want to...</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => setUserType('candidate')}
                className="p-8 border-2 border-color rounded-xl hover:border-primary hover:bg-primary-light/30 transition-all group"
              >
                <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <UserCircle className="h-10 w-10 text-primary" />
                </div>
                <h3 className="mb-2 text-primary">Find a Job</h3>
                <p className="text-secondary text-sm">
                  Create a candidate profile and apply for jobs
                </p>
              </button>

              <button
                onClick={() => setUserType('employer')}
                className="p-8 border-2 border-color rounded-xl hover:border-primary hover:bg-primary-light/30 transition-all group"
              >
                <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Briefcase className="h-10 w-10 text-primary" />
                </div>
                <h3 className="mb-2 text-primary">Hire Talent</h3>
                <p className="text-secondary text-sm">
                  Create an employer account and post job openings
                </p>
              </button>
            </div>

            <p className="text-center mt-8 text-secondary">
              Already have an account?{' '}
              <button
                onClick={() => onNavigate('login')}
                className="text-primary hover:text-primary-hover font-medium transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-custom-lg border border-color p-8">
            {/* Rest of the form... */}
            <button
              onClick={() => setUserType(null)}
              className="text-secondary hover:text-primary mb-6 text-sm transition-colors"
            >
              ← Change account type
            </button>

            <div className="flex items-center justify-center mb-6 p-3 bg-primary-light rounded-lg">
              {userType === 'candidate' ? (
                <UserCircle className="h-5 w-5 text-primary mr-2" />
              ) : (
                <Briefcase className="h-5 w-5 text-primary mr-2" />
              )}
              <span className="font-medium text-primary">
                {userType === 'candidate' ? 'Job Seeker Account' : 'Employer Account'}
              </span>
            </div>

            {/* Form continues... (rest unchanged) */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div>
                <Label htmlFor="fullName" className="mb-2 block">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="John Doe"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="pl-10 h-12 border-color rounded-lg"
                  />
                </div>
              </div>

              {/* Email */}
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

              {/* Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div>
                  <Label htmlFor="confirmPassword" className="mb-2 block">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="pl-10 h-12 border-color rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="bg-surface rounded-lg p-4">
                <p className="text-sm font-medium mb-2">Password must contain:</p>
                <ul className="text-sm text-secondary space-y-1">
                  <li>• At least 8 characters</li>
                  <li>• One uppercase letter</li>
                  <li>• One lowercase letter</li>
                  <li>• One number</li>
                </ul>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start">
                <Checkbox 
                  id="agreeToTerms"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, agreeToTerms: checked as boolean })
                  }
                  className="mt-1"
                />
                <Label 
                  htmlFor="agreeToTerms" 
                  className="ml-3 cursor-pointer text-sm text-secondary"
                >
                  I agree to the{' '}
                  <a href="#" className="text-primary hover:underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                </Label>
              </div>

              {/* Sign Up Button */}
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary hover:bg-primary-hover text-white rounded-lg h-12"
              >
                {submitting ? 'Creating Account...' : 'Create Account'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              {error && (
                <p className="text-sm text-red-600 mt-2 text-center">
                  {error}
                </p>
              )}

              {/* Sign In Link */}
              <p className="text-center mt-6 text-secondary">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="text-primary hover:text-primary-hover font-medium transition-colors"
                >
                  Sign in
                </button>
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}