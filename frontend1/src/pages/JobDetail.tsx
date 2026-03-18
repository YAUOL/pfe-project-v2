import { MapPin, DollarSign, Briefcase, Clock, Building2, Share2, Bookmark, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useState, useEffect } from 'react';
import { getAllOffres, OffreDTO } from '../api';

interface JobDetailProps {
  jobId: string;
  onNavigate: (page: string, jobId?: string) => void;
}

export function JobDetail({ jobId, onNavigate }: JobDetailProps) {
  const [job, setJob] = useState<OffreDTO | null>(null);
  const [relatedJobs, setRelatedJobs] = useState<OffreDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobData();
  }, [jobId]);

  const loadJobData = async () => {
    try {
      setLoading(true);
      const offres = await getAllOffres();
      
      // Trouver l'offre actuelle
      const currentJob = offres.find(o => o.id.toString() === jobId);
      setJob(currentJob || null);

      // Trouver les offres similaires (même type de contrat)
      if (currentJob) {
        const similar = offres
          .filter(o => o.id !== currentJob.id && o.typeContrat === currentJob.typeContrat)
          .slice(0, 3);
        setRelatedJobs(similar);
      }
    } catch (err) {
      console.error('Failed to load job:', err);
    } finally {
      setLoading(false);
    }
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
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => onNavigate('job-listings')}
          className="mb-6 text-secondary hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to All Jobs
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <div className="bg-white rounded-xl border border-color p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="mb-3">{job.titre}</h1>
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="h-5 w-5 text-primary" />
                    <span className="text-lg font-medium">Company Name</span>
                  </div>
                </div>
                {job.active && (
                  <Badge className="bg-green-100 text-green-700 border-0">
                    Active
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-secondary">
                  <MapPin className="h-5 w-5 mr-2 text-primary" />
                  {job.localisation}
                </div>
                <div className="flex items-center text-secondary">
                  <Briefcase className="h-5 w-5 mr-2 text-primary" />
                  {job.typeContrat}
                </div>
                <div className="flex items-center text-secondary">
                  <Clock className="h-5 w-5 mr-2 text-primary" />
                  Posted {new Date(job.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => onNavigate('job-application', jobId)}
                  className="flex-1 bg-primary hover:bg-primary-hover text-white rounded-lg py-6"
                >
                  Apply Now
                </Button>
                <Button 
                  variant="outline"
                  className="rounded-lg border-color hover:bg-primary-light hover:border-primary"
                >
                  <Bookmark className="h-5 w-5 mr-2" />
                  Save Job
                </Button>
                <Button 
                  variant="outline"
                  className="rounded-lg border-color hover:bg-primary-light hover:border-primary"
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-xl border border-color p-8">
              <h2 className="mb-4">Job Description</h2>
              <div className="text-secondary space-y-4">
                <p className="whitespace-pre-wrap">{job.description}</p>
              </div>
            </div>

            {/* Skills Required */}
            <div className="bg-white rounded-xl border border-color p-8">
              <h2 className="mb-4">Skills Required</h2>
              <div className="flex flex-wrap gap-3">
                {job.competencesRequises.split(',').map((skill, index) => (
                  <Badge 
                    key={index}
                    className="bg-primary-light text-primary border-0 px-4 py-2 rounded-lg"
                  >
                    {skill.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Company Info */}
            <div className="bg-white rounded-xl border border-color p-6">
              <h3 className="mb-4">About Company</h3>
              <div className="w-20 h-20 bg-primary-light rounded-lg flex items-center justify-center mb-4">
                <Building2 className="h-10 w-10 text-primary" />
              </div>
              <h4 className="mb-2">Company Name</h4>
              <p className="text-secondary text-sm mb-4">
                A leading company committed to innovation and excellence. We're building the future with talented professionals.
              </p>
              <div className="space-y-2 text-sm text-secondary">
                <div className="flex justify-between">
                  <span>Industry:</span>
                  <span className="font-medium text-primary">Technology</span>
                </div>
                <div className="flex justify-between">
                  <span>Company Size:</span>
                  <span className="font-medium text-primary">500-1000</span>
                </div>
                <div className="flex justify-between">
                  <span>Founded:</span>
                  <span className="font-medium text-primary">2010</span>
                </div>
              </div>
            </div>

            {/* Job Overview */}
            <div className="bg-white rounded-xl border border-color p-6">
              <h3 className="mb-4">Job Overview</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-secondary mb-1">Job Type</p>
                  <p className="font-medium">{job.typeContrat}</p>
                </div>
                <div>
                  <p className="text-sm text-secondary mb-1">Location</p>
                  <p className="font-medium">{job.localisation}</p>
                </div>
                <div>
                  <p className="text-sm text-secondary mb-1">Posted Date</p>
                  <p className="font-medium">{new Date(job.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Jobs */}
        {relatedJobs.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-6">Related Jobs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedJobs.map((relatedJob) => (
                <div
                  key={relatedJob.id}
                  className="bg-white rounded-xl border border-color p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => onNavigate('job-detail', relatedJob.id.toString())}
                >
                  <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center mb-4">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2">{relatedJob.titre}</h3>
                  <p className="text-sm text-secondary mb-2">{relatedJob.localisation}</p>
                  <p className="text-sm text-muted">{relatedJob.typeContrat}</p>
                  <Button 
                    className="w-full mt-4 bg-primary hover:bg-primary-hover text-white rounded-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('job-application', relatedJob.id.toString());
                    }}
                  >
                    Apply Now
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}