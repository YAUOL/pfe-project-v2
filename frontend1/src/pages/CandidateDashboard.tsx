import { DashboardSidebar } from '../components/DashboardSidebar';
import {
  FileText, Bookmark, CheckCircle, XCircle, Clock,
  Mail, Briefcase, TrendingUp, Eye, AlertTriangle,
  MapPin, DollarSign, Loader2,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useState, useEffect, useRef } from 'react';
import { getMesCVs, getAllOffres, CVDTO, OffreDTO } from '../api';

interface CandidateDashboardProps {
  onNavigate: (page: string, jobId?: string) => void;
  activePage?: string;
}

type OffreStatus = 'ACTIVE' | 'UPDATED' | 'CLOSED' | 'DELETED' | string | undefined;

function getOfferStateInfo(offre?: Partial<OffreDTO>) {
  const status = (offre?.status as OffreStatus) ?? (offre?.active ? 'ACTIVE' : 'CLOSED');
  if (status === 'DELETED') return { label: 'Offer Deleted', cls: 'bg-red-100 text-red-700' };
  if (status === 'UPDATED') return { label: 'Offer Updated', cls: 'bg-orange-100 text-orange-700' };
  if (status === 'CLOSED' || offre?.active === false) return { label: 'Offer Closed', cls: 'bg-gray-100 text-gray-700' };
  return null;
}

export function CandidateDashboard({ onNavigate, activePage = 'candidate-dashboard' }: CandidateDashboardProps) {
  const [applications, setApplications] = useState<CVDTO[]>([]);
  const [availableJobs, setAvailableJobs] = useState<OffreDTO[]>([]);
  const [offresById, setOffresById] = useState<Record<number, OffreDTO>>({});
  const [savedJobs, setSavedJobs] = useState<OffreDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [animatingUnsaveId, setAnimatingUnsaveId] = useState<number | null>(null);

  const myApplicationsRef = useRef<HTMLDivElement>(null);
  const savedJobsRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (loading) return;
    if (activePage === 'my-applications') {
      setTimeout(() => myApplicationsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
    if (activePage === 'saved-jobs') {
      setTimeout(() => savedJobsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, [activePage, loading]);

  const loadData = async () => {
    try {
      setLoading(true);
      const email = localStorage.getItem('authEmail') || '';
      setUserEmail(email);

      const mesCVs = await getMesCVs();
      setApplications(mesCVs);

      const offres = await getAllOffres();
      const byId = Object.fromEntries(offres.map(o => [o.id, o])) as Record<number, OffreDTO>;
      setOffresById(byId);

      const publicOffres = offres.filter(o => o.active && o.status !== 'DELETED').slice(0, 4);
      setAvailableJobs(publicOffres);

      const savedIds: string[] = JSON.parse(localStorage.getItem('savedJobs') || '[]');
      setSavedJobs(offres.filter(o => savedIds.includes(o.id.toString())));
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = (jobId: number) => {
    setAnimatingUnsaveId(jobId);
    setTimeout(() => {
      setAnimatingUnsaveId(null);
      setSavedJobs(prev => prev.filter(j => j.id !== jobId));
    }, 350);

    const saved: string[] = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    localStorage.setItem('savedJobs', JSON.stringify(saved.filter(id => id !== jobId.toString())));
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'ACCEPTED': case 'ACCEPTE':
        return { icon: <CheckCircle className="h-4 w-4 text-green-600" />, color: 'bg-green-100 text-green-700', label: 'Accepted' };
      case 'REJECTED': case 'REFUSE':
        return { icon: <XCircle className="h-4 w-4 text-red-600" />, color: 'bg-red-100 text-red-700', label: 'Rejected' };
      default:
        return { icon: <Clock className="h-4 w-4 text-blue-600" />, color: 'bg-blue-100 text-blue-700', label: 'Under Review' };
    }
  };

  const getInitials = (email: string) => {
    if (!email) return 'U';
    const parts = email.split('@')[0].split('.');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return email[0].toUpperCase();
  };

  const acceptedCount = applications.filter(a => a.statut === 'ACCEPTED' || a.statut === 'ACCEPTE').length;
  const rejectedCount = applications.filter(a => a.statut === 'REJECTED' || a.statut === 'REFUSE').length;
  const pendingCount = applications.filter(a =>
    a.statut !== 'ACCEPTED' && a.statut !== 'ACCEPTE' &&
    a.statut !== 'REJECTED' && a.statut !== 'REFUSE'
  ).length;

  if (loading) {
    return (
      <div className="flex">
        <DashboardSidebar
          userType="candidate"
          activePage={activePage}
          onNavigate={onNavigate}
          onLogout={() => onNavigate('home')}
        />
        <main className="flex-1 bg-surface min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-secondary">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes bm-unsave {
          0%   { transform: scale(1) rotate(0deg); }
          30%  { transform: scale(1.3) rotate(-15deg); }
          60%  { transform: scale(0.5) rotate(10deg); }
          100% { transform: scale(0) rotate(0deg); }
        }
        .bm-unsave-anim { animation: bm-unsave 0.35s ease forwards; }
      `}</style>

      <div className="flex">
        <DashboardSidebar
          userType="candidate"
          activePage={activePage}
          onNavigate={onNavigate}
          onLogout={() => onNavigate('home')}
        />

        <main className="flex-1 bg-surface min-h-screen p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">

            {/* Header */}
            <div className="mb-8">
              <h1 className="mb-2">Candidate Dashboard</h1>
              <p className="text-secondary">Track your applications and discover new opportunities</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl border border-color p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <h3 className="text-3xl font-bold mb-1">{applications.length}</h3>
                <p className="text-secondary text-sm">Total Applications</p>
              </div>

              <div className="bg-white rounded-xl border border-color p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <h3 className="text-3xl font-bold mb-1">{pendingCount}</h3>
                <p className="text-secondary text-sm">Under Review</p>
              </div>

              <div className="bg-white rounded-xl border border-color p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <h3 className="text-3xl font-bold mb-1">{acceptedCount}</h3>
                <p className="text-secondary text-sm">Accepted</p>
              </div>

              <div className="bg-white rounded-xl border border-color p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Bookmark className="h-6 w-6 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-primary">Open</span>
                </div>
                <h3 className="text-3xl font-bold mb-1">{availableJobs.length}</h3>
                <p className="text-secondary text-sm">Available Jobs</p>
              </div>
            </div>

            {/* ── MY APPLICATIONS SECTION ── */}
            <div ref={myApplicationsRef} className="bg-white rounded-xl border border-color p-6 mb-8 scroll-mt-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                  <h2 className="mb-1">My Applications</h2>
                  <p className="text-secondary text-sm">Manage and track your submitted applications</p>
                </div>
                <Button
                  onClick={() => onNavigate('job-listings')}
                  className="bg-primary hover:bg-primary-hover text-white rounded-lg"
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  Browse Jobs
                </Button>
              </div>

              {applications.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted mx-auto mb-4" />
                  <p className="text-secondary mb-4">You haven't applied to any jobs yet</p>
                  <Button
                    className="bg-primary hover:bg-primary-hover text-white rounded-lg"
                    onClick={() => onNavigate('job-listings')}
                  >
                    Explore Opportunities
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-color">
                        <th className="text-left py-3 px-2 text-sm font-medium text-secondary">Job Title</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-secondary">CV File</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-secondary">Status</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-secondary">Applied Date</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-secondary">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((application) => {
                        const status = getStatusInfo(application.statut);
                        const fullOffre = offresById[application.offre.id];
                        const offerState = getOfferStateInfo(fullOffre);
                        return (
                          <tr key={application.id} className="border-b border-color last:border-0">
                            <td className="py-4 px-2 font-medium">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span>{application.offre.titre}</span>
                                {offerState && (
                                  <Badge className={`${offerState.cls} border-0`}>
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    {offerState.label}
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-2 text-secondary">{application.nomFichier}</td>
                            <td className="py-4 px-2">
                              <Badge className={`${status.color} border-0 flex items-center gap-1 w-fit`}>
                                {status.icon}
                                {status.label}
                              </Badge>
                            </td>
                            <td className="py-4 px-2 text-secondary">
                              {new Date(application.uploadedAt).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-2 text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-lg"
                                onClick={() => onNavigate('job-detail', application.offre.id.toString())}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Job
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* ── SAVED JOBS SECTION ── */}
            <div ref={savedJobsRef} className="bg-white rounded-xl border border-color p-6 mb-8 scroll-mt-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                  <h2 className="mb-1">Saved Jobs</h2>
                  <p className="text-secondary text-sm">Jobs you bookmarked for later</p>
                </div>
                <Button
                  variant="outline"
                  className="rounded-lg"
                  onClick={() => onNavigate('job-listings')}
                >
                  Browse More Jobs
                </Button>
              </div>

              {savedJobs.length === 0 ? (
                <div className="text-center py-12">
                  <Bookmark className="h-12 w-12 text-muted mx-auto mb-4" />
                  <p className="text-secondary mb-4">
                    No saved jobs yet. Click <strong>Save Job</strong> on any listing to bookmark it here.
                  </p>
                  <Button
                    className="bg-primary hover:bg-primary-hover text-white rounded-lg"
                    onClick={() => onNavigate('job-listings')}
                  >
                    Browse Jobs
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-surface rounded-lg gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center flex-shrink-0">
                          <Briefcase className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-0.5">{job.titre}</h4>
                          <p className="text-sm text-secondary mb-1">{job.company}</p>
                          <div className="flex items-center gap-3 text-xs text-muted flex-wrap">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />{job.localisation}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />${job.salaryMin}k – ${job.salaryMax}k
                            </span>
                            <span>{job.typeContrat}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap sm:justify-end">
                        <Badge className={`border-0 ${job.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {job.active ? 'Active' : 'Closed'}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg"
                          onClick={() => onNavigate('job-detail', job.id.toString())}
                        >
                          View Job
                        </Button>
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary-hover text-white rounded-lg"
                          disabled={!job.active}
                          onClick={() => onNavigate('job-application', job.id.toString())}
                        >
                          Apply Now
                        </Button>

                        {/* ✅ Animated unsave button */}
                        <Button
                          variant="outline"
                          size="icon"
                          title="Remove from saved"
                          onClick={() => handleUnsave(job.id)}
                          className="rounded-lg bg-primary-light border-primary hover:bg-red-50 hover:border-red-400 transition-all duration-200"
                        >
                          <Bookmark
                            key={animatingUnsaveId === job.id ? 'anim' : 'idle'}
                            className={`h-4 w-4 ${animatingUnsaveId === job.id ? 'bm-unsave-anim' : ''}`}
                            style={{ color: '#2563eb', fill: '#2563eb' }}
                          />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── AVAILABLE JOBS + PROFILE SIDEBAR ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl border border-color p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                      <h2 className="mb-1">Available Jobs</h2>
                      <p className="text-secondary text-sm">Latest opportunities you can apply for</p>
                    </div>
                    <Button variant="outline" className="rounded-lg" onClick={() => onNavigate('job-listings')}>
                      View All Jobs
                    </Button>
                  </div>

                  {availableJobs.length === 0 ? (
                    <div className="text-center py-12">
                      <Bookmark className="h-12 w-12 text-muted mx-auto mb-4" />
                      <p className="text-secondary mb-4">No jobs available at the moment</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {availableJobs.map((job) => {
                        const offerState = getOfferStateInfo(job);
                        return (
                          <div
                            key={job.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-surface rounded-lg gap-4 hover:bg-primary-light/50 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="mb-0">{job.titre}</h4>
                                {offerState?.label === 'Offer Updated' && (
                                  <Badge className={`${offerState.cls} border-0`}>{offerState.label}</Badge>
                                )}
                              </div>
                              <p className="text-sm text-secondary mb-2">{job.description}</p>
                              <div className="flex flex-wrap gap-2 text-xs text-muted">
                                <span>{job.localisation}</span>
                                <span>•</span>
                                <span>{job.typeContrat}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                className="rounded-lg"
                                onClick={() => onNavigate('job-detail', job.id.toString())}
                              >
                                View
                              </Button>
                              <Button
                                className="bg-primary hover:bg-primary-hover text-white rounded-lg"
                                onClick={() => onNavigate('job-application', job.id.toString())}
                              >
                                Apply Now
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-color p-6">
                  <div className="text-center mb-6">
                    <div className="w-24 h-24 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl font-bold text-primary">{getInitials(userEmail)}</span>
                    </div>
                    <h3 className="mb-1">{userEmail.split('@')[0] || 'Candidate'}</h3>
                    <p className="text-secondary text-sm mb-4">Candidate</p>
                    <Badge className="bg-green-100 text-green-700 border-0">Active</Badge>
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-secondary">
                      <Mail className="h-4 w-4 mr-2 text-primary" />{userEmail}
                    </div>
                    <div className="flex items-center text-sm text-secondary">
                      <FileText className="h-4 w-4 mr-2 text-primary" />
                      {applications.length} Application{applications.length !== 1 ? 's' : ''}
                    </div>
                    <div className="flex items-center text-sm text-secondary">
                      <Bookmark className="h-4 w-4 mr-2 text-primary" />
                      {savedJobs.length} Saved Job{savedJobs.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-color rounded-lg"
                    onClick={() => onNavigate('profile')}
                  >
                    Edit Profile
                  </Button>
                </div>

                <div className="bg-primary-light rounded-xl p-6">
                  <h3 className="mb-3 text-primary">Application Summary</h3>
                  <ul className="space-y-2 text-sm text-secondary">
                    <li className="flex items-start">
                      <Clock className="h-4 w-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                      {pendingCount} under review
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                      {acceptedCount} accepted
                    </li>
                    <li className="flex items-start">
                      <XCircle className="h-4 w-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                      {rejectedCount} rejected
                    </li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </>
  );
}