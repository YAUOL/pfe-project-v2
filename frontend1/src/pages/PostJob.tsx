import { ArrowLeft, Briefcase, MapPin, FileText, Building2, DollarSign } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { useState } from 'react';
import { createOffre } from '../api';

interface PostJobProps {
  onNavigate: (page: string) => void;
}

export function PostJob({ onNavigate }: PostJobProps) {
  const [formData, setFormData] = useState({
    titre: '',
    company: '',
    localisation: '',
    typeContrat: 'CDI',
    category: '',
    experienceLevel: '',
    salaryMin: 0,
    salaryMax: 0,
    competencesRequises: '',
    description: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: name === 'salaryMin' || name === 'salaryMax' ? Number(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (
      !formData.titre ||
      !formData.company ||
      !formData.localisation ||
      !formData.description ||
      !formData.category ||
      !formData.experienceLevel ||
      !formData.competencesRequises ||
      formData.salaryMin <= 0 ||
      formData.salaryMax <= 0
    ) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.salaryMin > formData.salaryMax) {
      setError('Minimum salary cannot be greater than maximum salary');
      return;
    }

    try {
      setSubmitting(true);
      await createOffre(formData);
      alert('Job posted successfully!');
      onNavigate('employer-dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to post job. Please try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-surface min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => onNavigate('employer-dashboard')}
          className="mb-6 text-secondary hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="bg-white rounded-xl border border-color p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-primary-light rounded-lg flex items-center justify-center flex-shrink-0">
              <Briefcase className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="mb-2">Post a New Job</h1>
              <p className="text-secondary">
                Fill in the details below to create a new job posting
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-color p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="titre" className="mb-2 block">
                Job Title *
              </Label>
              <Input
                id="titre"
                name="titre"
                type="text"
                placeholder="e.g. Senior Software Engineer"
                required
                value={formData.titre}
                onChange={handleChange}
                className="h-12 border-color rounded-lg"
              />
            </div>

            <div>
              <Label htmlFor="company" className="mb-2 block">
                Company *
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
                <Input
                  id="company"
                  name="company"
                  type="text"
                  placeholder="e.g. TechCorp Solutions"
                  required
                  value={formData.company}
                  onChange={handleChange}
                  className="pl-10 h-12 border-color rounded-lg"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="localisation" className="mb-2 block">
                Location *
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
                <Input
                  id="localisation"
                  name="localisation"
                  type="text"
                  placeholder="e.g. San Francisco, CA"
                  required
                  value={formData.localisation}
                  onChange={handleChange}
                  className="pl-10 h-12 border-color rounded-lg"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="typeContrat" className="mb-2 block">
                Contract Type *
              </Label>
              <select
                id="typeContrat"
                name="typeContrat"
                required
                value={formData.typeContrat}
                onChange={handleChange}
                className="w-full h-12 px-3 border border-color rounded-lg bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="CDI">Full-time (CDI)</option>
                <option value="CDD">Contract (CDD)</option>
                <option value="Stage">Internship</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>

            <div>
              <Label htmlFor="category" className="mb-2 block">
                Category *
              </Label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full h-12 px-3 border border-color rounded-lg bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select category</option>
                <option value="Tech">Tech</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Management">Management</option>
              </select>
            </div>

            <div>
              <Label htmlFor="experienceLevel" className="mb-2 block">
                Experience Level *
              </Label>
              <select
                id="experienceLevel"
                name="experienceLevel"
                required
                value={formData.experienceLevel}
                onChange={handleChange}
                className="w-full h-12 px-3 border border-color rounded-lg bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select experience level</option>
                <option value="Junior">Junior</option>
                <option value="Mid-Level">Mid-Level</option>
                <option value="Senior">Senior</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="salaryMin" className="mb-2 block">
                  Minimum Salary (k) *
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
                  <Input
                    id="salaryMin"
                    name="salaryMin"
                    type="number"
                    required
                    min="0"
                    value={formData.salaryMin || ''}
                    onChange={handleChange}
                    className="pl-10 h-12 border-color rounded-lg"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="salaryMax" className="mb-2 block">
                  Maximum Salary (k) *
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
                  <Input
                    id="salaryMax"
                    name="salaryMax"
                    type="number"
                    required
                    min="0"
                    value={formData.salaryMax || ''}
                    onChange={handleChange}
                    className="pl-10 h-12 border-color rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="competencesRequises" className="mb-2 block">
                Required Skills *
              </Label>
              <Input
                id="competencesRequises"
                name="competencesRequises"
                type="text"
                placeholder="e.g. JavaScript, React, Node.js"
                required
                value={formData.competencesRequises}
                onChange={handleChange}
                className="h-12 border-color rounded-lg"
              />
              <p className="text-sm text-muted mt-2">
                Enter skills separated by commas
              </p>
            </div>

            <div>
              <Label htmlFor="description" className="mb-2 block">
                Job Description *
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe the role, responsibilities, requirements, and benefits..."
                rows={10}
                required
                value={formData.description}
                onChange={handleChange}
                className="border-color rounded-lg resize-none"
              />
            </div>

            <div className="bg-surface rounded-lg p-6">
              <h3 className="mb-3 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                Preview
              </h3>
              <div className="space-y-2 text-sm text-secondary">
                <p><strong>Title:</strong> {formData.titre || 'Not specified'}</p>
                <p><strong>Company:</strong> {formData.company || 'Not specified'}</p>
                <p><strong>Location:</strong> {formData.localisation || 'Not specified'}</p>
                <p><strong>Type:</strong> {formData.typeContrat}</p>
                <p><strong>Category:</strong> {formData.category || 'Not specified'}</p>
                <p><strong>Experience:</strong> {formData.experienceLevel || 'Not specified'}</p>
                <p>
                  <strong>Salary:</strong>{' '}
                  {formData.salaryMin && formData.salaryMax
                    ? `$${formData.salaryMin}k - $${formData.salaryMax}k`
                    : 'Not specified'}
                </p>
                <p><strong>Skills:</strong> {formData.competencesRequises || 'Not specified'}</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-primary hover:bg-primary-hover text-white rounded-lg py-6"
              >
                {submitting ? 'Posting...' : 'Post Job'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onNavigate('employer-dashboard')}
                className="flex-1 border-color rounded-lg py-6"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>

        <div className="bg-primary-light rounded-xl p-6 mt-8">
          <h3 className="mb-4 text-primary">Tips for Writing a Great Job Posting</h3>
          <ul className="space-y-2 text-sm text-secondary">
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              Use a clear and specific job title
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              Highlight the most important requirements first
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              Include details about your company culture
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              Be transparent about salary and benefits
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}