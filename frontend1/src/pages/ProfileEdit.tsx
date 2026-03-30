import { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Save, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { getMyProfile, updateMyProfile, UserProfile } from '../api';

interface ProfileEditProps {
  onNavigate: (page: string) => void;
}

export function ProfileEdit({ onNavigate }: ProfileEditProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getMyProfile();
      setProfile(data);
      setFormData({
        prenom: data.prenom,
        nom: data.nom,
        email: data.email,
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setSuccess(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!formData.prenom.trim() || !formData.nom.trim()) {
      setError('First name and last name are required');
      return;
    }

    try {
      setSaving(true);
      const updated = await updateMyProfile(formData.prenom, formData.nom);
      setProfile(updated);
      setSuccess(true);
      
      // Rediriger après 2 secondes
      setTimeout(() => {
        const role = localStorage.getItem('authRole');
        if (role === 'RECRUTEUR') {
          onNavigate('employer-dashboard');
        } else {
          onNavigate('candidate-dashboard');
        }
      }, 2000);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (fullName: string) => {
    const names = fullName.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  const handleCancel = () => {
    const role = localStorage.getItem('authRole');
    if (role === 'RECRUTEUR') {
      onNavigate('employer-dashboard');
    } else {
      onNavigate('candidate-dashboard');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <p className="text-secondary">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={handleCancel}
          className="mb-6 text-secondary hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2">Edit Profile</h1>
          <p className="text-secondary">Update your personal information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-color p-8">
          {/* Avatar Section */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-color">
            <div className="w-24 h-24 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-3xl font-bold text-primary">
                {getInitials(profile.fullName)}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="mb-2">{profile.fullName}</h3>
              <p className="text-secondary mb-3">{profile.email}</p>
              <Badge className="bg-blue-100 text-blue-700 border-0">
                {profile.role === 'RECRUTEUR' ? 'Recruiter' : 'Candidate'}
              </Badge>
            </div>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Save className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-green-800 font-medium">Profile updated successfully!</p>
                  <p className="text-green-600 text-sm">Redirecting to dashboard...</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Personal Information */}
            <div>
              <h3 className="mb-4 pb-2 border-b border-color">Personal Information</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="prenom" className="mb-2 block">
                      First Name *
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
                      <Input
                        id="prenom"
                        name="prenom"
                        type="text"
                        placeholder="John"
                        required
                        value={formData.prenom}
                        onChange={handleChange}
                        className="pl-10 h-12 border-color rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="nom" className="mb-2 block">
                      Last Name *
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
                      <Input
                        id="nom"
                        name="nom"
                        type="text"
                        placeholder="Doe"
                        required
                        value={formData.nom}
                        onChange={handleChange}
                        className="pl-10 h-12 border-color rounded-lg"
                      />
                    </div>
                  </div>
                </div>

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
                      value={formData.email}
                      disabled
                      className="pl-10 h-12 border-color rounded-lg bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-muted mt-2">
                    Email cannot be changed for security reasons
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-color">
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 bg-primary hover:bg-primary-hover text-white rounded-lg h-12"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
                className="flex-1 border-color rounded-lg h-12"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="bg-primary-light rounded-xl p-6 mt-6">
          <h3 className="mb-3 text-primary">Profile Tips</h3>
          <ul className="space-y-2 text-sm text-secondary">
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              Keep your profile information up to date
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              Use your real name for better recognition
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              Your email is used for login and cannot be changed
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}