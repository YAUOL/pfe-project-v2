import { ArrowLeft, Upload, FileText, User, Mail, Phone, Building2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { useState, useEffect } from 'react';
import { uploadCv, getAllOffres, getMyProfile, OffreDTO } from '../api';

interface JobApplicationProps {
  jobId: string;
  onNavigate: (page: string, jobId?: string) => void;
}

export function JobApplication({ jobId, onNavigate }: JobApplicationProps) {
  const [fileName, setFileName] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [job, setJob] = useState<OffreDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    coverLetter: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger l'offre et le profil au montage
  useEffect(() => {
    loadData();
  }, [jobId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger l'offre
      const offres = await getAllOffres();
      const foundJob = offres.find(o => o.id.toString() === jobId);
      setJob(foundJob || null);

      // Charger le profil de l'utilisateur
      try {
        const profile = await getMyProfile();
        
        // Pré-remplir le formulaire
        setFormData({
          fullName: profile.fullName,
          email: profile.email,
          phone: '',
          coverLetter: '',
        });
      } catch (profileErr) {
        console.log('Could not load profile, user may not be logged in');
      }
      
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFileName(selectedFile.name);
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError('Please upload your CV before submitting.');
      return;
    }

    if (!job) {
      setError('Job not found.');
      return;
    }

    try {
      setSubmitting(true);
      // Envoie le CV avec l'ID de l'offre
      await uploadCv(file, job.id);
      alert('Application submitted successfully! Your CV has been uploaded.');
      onNavigate('candidate-dashboard');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to submit application. Please try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-secondary text-lg">Job not found</p>
        <Button 
          onClick={() => onNavigate('job-listings')}
          className="mt-4 bg-primary hover:bg-primary-hover text-white rounded-lg"
        >
          Back to Job Listings
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => onNavigate('job-detail', jobId)}
          className="mb-6 text-secondary hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Job Details
        </Button>

        {/* Header */}
        <div className="bg-white rounded-xl border border-color p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-primary-light rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="mb-2">{job.titre}</h1>
              <p className="text-secondary mb-2">{job.localisation}</p>
              <div className="flex flex-wrap gap-2 text-sm text-muted">
                <span>{job.localisation}</span>
                <span>•</span>
                <span>{job.typeContrat}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <div className="bg-white rounded-xl border border-color p-8">
          <div className="mb-8">
            <h2 className="mb-2">Apply for this Position</h2>
            <p className="text-secondary">
              Please fill out the form below to submit your application
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div>
              <h3 className="mb-4 pb-2 border-b border-color">Personal Information</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName" className="mb-2 block">
                    Full Name *
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email" className="mb-2 block">
                      Email Address *
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john.doe@email.com"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-10 h-12 border-color rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone" className="mb-2 block">
                      Phone Number *
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="pl-10 h-12 border-color rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resume Upload Section */}
            <div>
              <h3 className="mb-4 pb-2 border-b border-color">Resume / CV</h3>
              
              <div>
                <Label htmlFor="resume" className="mb-2 block">
                  Upload Resume *
                </Label>
                <div className="border-2 border-dashed border-color rounded-lg p-8 text-center hover:border-primary hover:bg-primary-light/30 transition-colors cursor-pointer">
                  <input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                    required
                  />
                  <label htmlFor="resume" className="cursor-pointer">
                    <Upload className="h-12 w-12 text-primary mx-auto mb-4" />
                    <p className="mb-2">
                      {fileName ? (
                        <span className="font-medium text-primary flex items-center justify-center gap-2">
                          <FileText className="h-5 w-5" />
                          {fileName}
                        </span>
                      ) : (
                        <>
                          <span className="font-medium text-primary">Click to upload</span>
                          {' '}or drag and drop
                        </>
                      )}
                    </p>
                    <p className="text-sm text-muted">
                      PDF, DOC, DOCX (max. 5MB)
                    </p>
                  </label>
                </div>
              </div>
            </div>

            {/* Cover Letter Section */}
            <div>
              <h3 className="mb-4 pb-2 border-b border-color">Cover Letter</h3>
              
              <div>
                <Label htmlFor="coverLetter" className="mb-2 block">
                  Cover Letter *
                </Label>
                <Textarea
                  id="coverLetter"
                  name="coverLetter"
                  placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                  rows={8}
                  required
                  value={formData.coverLetter}
                  onChange={handleChange}
                  className="border-color rounded-lg resize-none"
                />
                <p className="text-sm text-muted mt-2">
                  Minimum 100 characters
                </p>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-surface rounded-lg p-4">
              <p className="text-sm text-secondary">
                By submitting this application, you agree to our{' '}
                <a href="#" className="text-primary hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
                Your information will be shared with the employer for this job application.
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-primary hover:bg-primary-hover text-white rounded-lg py-6"
              >
                {submitting ? 'Submitting…' : 'Submit Application'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onNavigate('job-detail', jobId)}
                className="flex-1 border-color rounded-lg py-6"
              >
                Cancel
              </Button>
            </div>
            {error && (
              <p className="text-sm text-red-600 mt-3 text-center">
                {error}
              </p>
            )}
          </form>
        </div>

        {/* Application Tips */}
        <div className="bg-primary-light rounded-xl p-6 mt-8">
          <h3 className="mb-4 text-primary">Application Tips</h3>
          <ul className="space-y-2 text-sm text-secondary">
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              Make sure your resume is up-to-date and tailored to this position
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              Write a compelling cover letter that highlights your relevant experience
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              Double-check your contact information for accuracy
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              Research the company and mention why you want to work there
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}