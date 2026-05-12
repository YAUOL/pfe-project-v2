import {
  MapPin,
  DollarSign,
  Briefcase,
  Clock,
  Building2,
  Share2,
  Bookmark,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useState, useEffect } from 'react';
import { getAllOffres, OffreDTO, getMesCVs, CVDTO } from '../api';

interface JobDetailProps {
  jobId: string;
  onNavigate: (page: string, jobId?: string) => void;
}

export function JobDetail({ jobId, onNavigate }: JobDetailProps) {
  const [job, setJob] = useState<OffreDTO | null>(null);
  const [relatedJobs, setRelatedJobs] = useState<OffreDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [checkingApplication, setCheckingApplication] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    loadJobDataAndCheckApplication();
    const saved = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    setIsSaved(saved.includes(jobId));
  }, [jobId]);

  const loadJobDataAndCheckApplication = async () => {
    try {
      setLoading(true);
      setCheckingApplication(true);
      setHasApplied(false);

      const offres = await getAllOffres();
      const currentJob = offres.find(o => o.id.toString() === jobId);
      setJob(currentJob || null);

      if (currentJob) {
        const similar = offres
          .filter(
            o =>
              o.id !== currentJob.id &&
              (o.category === currentJob.category || o.typeContrat === currentJob.typeContrat)
          )
          .slice(0, 3);
        setRelatedJobs(similar);
      } else {
        setRelatedJobs([]);
      }

      const token = localStorage.getItem('authToken');
      const r = (localStorage.getItem('authRole') || '').toUpperCase();
      const isCandidateRole = r === 'CANDIDAT';

      if (token && isCandidateRole && currentJob) {
        try {
          const mesCVs: CVDTO[] = await getMesCVs();
          const alreadyApplied = mesCVs.some(cv => cv.offre.id.toString() === jobId);
          setHasApplied(alreadyApplied);
        } catch (err) {
          console.error('Failed to check applications:', err);
          setHasApplied(false);
        }
      }
    } catch (err) {
      console.error('Failed to load job:', err);
    } finally {
      setLoading(false);
      setCheckingApplication(false);
    }
  };

  const handleSaveJob = () => {
    const saved: string[] = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    const updated = isSaved
      ? saved.filter(id => id !== jobId)
      : [...saved, jobId];
    localStorage.setItem('savedJobs', JSON.stringify(updated));
    setIsSaved(!isSaved);
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = job?.titre ?? 'Job Offer';
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (_) {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2500);
      } catch (_) {
        alert('Could not copy link. Please copy the URL from your address bar.');
      }
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
          onClick={() => onNavigate('job-listings', '')}
          className="mt-4 bg-primary hover:bg-primary-hover text-white rounded-lg"
        >
          Back to Job Listings
        </Button>
      </div>
    );
  }

  const skills = job.competencesRequises
    ? job.competencesRequises.split(',').map(skill => skill.trim()).filter(Boolean)
    : [];

  // Role and permissions (Option B: only candidates can apply)
  const userRole = (localStorage.getItem('authRole') || '').toUpperCase();
  const isCandidate = userRole === 'CANDIDAT';
  const isAdmin = userRole === 'ADMIN' || userRole === 'ADMINISTRATEUR';
  const isRecruiter = userRole === 'RECRUITER' || userRole === 'RECRUTEUR';
  const canApply = isCandidate; // only candidates can apply
  const isLoggedIn = !!localStorage.getItem('authToken');

  return (
    <div className="bg-surface min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => onNavigate('job-listings', '')}
          className="mb-6 text-secondary hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Job Listings
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-color p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="mb-3">{job.titre}</h1>
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="h-5 w-5 text-primary" />
                    <span className="text-lg font-medium">{job.company}</span>
                  </div>
                </div>
                {job.active && (
                  <Badge className="bg-primary-light text-primary border-0">
                    Featured
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-secondary">
                  <MapPin className="h-5 w-5 mr-2 text-primary" />
                  {job.localisation}
                </div>
                <div className="flex items-center text-secondary">
                  <DollarSign className="h-5 w-5 mr-2 text-primary" />
                  ${job.salaryMin}k - ${job.salaryMax}k
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
                {/* Apply / Recruiter/Admin / Login button */}
                {canApply ? (
                  <Button
                    onClick={() => onNavigate('job-application', jobId)}
                    disabled={hasApplied || checkingApplication}
                    className="flex-1 bg-primary hover:bg-primary-hover text-white rounded-lg py-6 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {checkingApplication
                      ? 'Checking...'
                      : hasApplied
                        ? '✓ Already Applied'
                        : 'Apply Now'}
                  </Button>
                ) : isLoggedIn ? (
                  <Button
                    disabled
                    className="flex-1 bg-primary text-white rounded-lg py-6 opacity-50 cursor-not-allowed"
                  >
                    {isRecruiter
                      ? '🚫 Recruiters cannot apply'
                      : isAdmin
                        ? '🚫 Admins cannot apply'
                        : '🚫 Only candidates can apply'}
                  </Button>
                ) : (
                  <Button
                    onClick={() => onNavigate('login')}
                    className="flex-1 bg-primary hover:bg-primary-hover text-white rounded-lg py-6"
                  >
                    Login to Apply
                  </Button>
                )}

                {/* Save Job */}
                <Button
                  variant="outline"
                  onClick={handleSaveJob}
                  className={`rounded-lg transition-all ${
                    isSaved
                      ? 'bg-primary text-white border-primary hover:bg-primary-hover'
                      : 'border-color hover:bg-primary-light hover:border-primary'
                  }`}
                >
                  <Bookmark
                    className="h-5 w-5 mr-2"
                    fill={isSaved ? 'currentColor' : 'none'}
                  />
                  {isSaved ? 'Saved' : 'Save Job'}
                </Button>

                {/* Share */}
                <div className="relative">
                  <Button
                    variant="outline"
                    onClick={handleShare}
                    className="rounded-lg border-color hover:bg-primary-light hover:border-primary"
                  >
                    {shareCopied ? (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                        <span className="text-green-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="h-5 w-5 mr-2" />
                        Share
                      </>
                    )}
                  </Button>
                  {shareCopied && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                      Link copied to clipboard!
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                    </div>
                  )}
                </div>
              </div>

              {hasApplied && isCandidate && (
                <p className="mt-3 text-sm text-green-600">
                  ✓ You have already applied to this job
                </p>
              )}
            </div>

            <div className="bg-white rounded-xl border border-color p-8">
              <h2 className="mb-4">Job Description</h2>
              <div className="text-secondary space-y-4">
                <p className="whitespace-pre-wrap">{job.description}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-color p-8">
              <h2 className="mb-4">Skills Required</h2>
              <div className="flex flex-wrap gap-3">
                {skills.length > 0 ? (
                  skills.map((skill, index) => (
                    <Badge
                      key={index}
                      className="bg-primary-light text-primary border-0 px-4 py-2 rounded-lg"
                    >
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <p className="text-secondary">No specific skills listed</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-color p-6">
              <h3 className="mb-4">About Company</h3>
              <div className="w-20 h-20 bg-primary-light rounded-lg flex items-center justify-center mb-4">
                <Building2 className="h-10 w-10 text-primary" />
              </div>
              <h4 className="mb-2">{job.company}</h4>
              <p className="text-secondary text-sm mb-4">
                A leading company in the {job.category} industry, committed to innovation and excellence.
              </p>
              <div className="space-y-2 text-sm text-secondary">
                <div className="flex justify-between">
                  <span>Industry:</span>
                  <span className="font-medium text-primary">{job.category}</span>
                </div>
                <div className="flex justify-between">
                  <span>Experience:</span>
                  <span className="font-medium text-primary">{job.experienceLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span>Salary:</span>
                  <span className="font-medium text-primary">${job.salaryMin}k - ${job.salaryMax}k</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-color p-6">
              <h3 className="mb-4">Job Overview</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-secondary mb-1">Job Type</p>
                  <p className="font-medium">{job.typeContrat}</p>
                </div>
                <div>
                  <p className="text-sm text-secondary mb-1">Category</p>
                  <p className="font-medium">{job.category}</p>
                </div>
                <div>
                  <p className="text-sm text-secondary mb-1">Experience</p>
                  <p className="font-medium">{job.experienceLevel}</p>
                </div>
                <div>
                  <p className="text-sm text-secondary mb-1">Salary</p>
                  <p className="font-medium">${job.salaryMin}k - ${job.salaryMax}k</p>
                </div>
                <div>
                  <p className="text-sm text-secondary mb-1">Location</p>
                  <p className="font-medium">{job.localisation}</p>
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
                  <p className="text-sm text-secondary mb-2">{relatedJob.company}</p>
                  <p className="text-sm text-muted mb-1">{relatedJob.localisation}</p>
                  <p className="text-sm text-muted">
                    ${relatedJob.salaryMin}k - ${relatedJob.salaryMax}k
                  </p>
                  <Button
                    className="w-full mt-4 bg-primary hover:bg-primary-hover text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!canApply && isLoggedIn}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isLoggedIn) return onNavigate('login');
                      if (canApply) onNavigate('job-application', relatedJob.id.toString());
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