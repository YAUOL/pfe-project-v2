import { DashboardSidebar } from '../components/DashboardSidebar';
import {
  FileText,
  Bookmark,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Briefcase,
  TrendingUp,
  Eye
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useState, useEffect } from 'react';
import { getMesCVs, getAllOffres, CVDTO, OffreDTO } from '../api';

interface CandidateDashboardProps {
  onNavigate: (page: string, jobId?: string) => void;
}

export function CandidateDashboard({ onNavigate }: CandidateDashboardProps) {
  const [applications, setApplications] = useState<CVDTO[]>([]);
  const [availableJobs, setAvailableJobs] = useState<OffreDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const email = localStorage.getItem('authEmail') || '';
      setUserEmail(email);

      const mesCVs = await getMesCVs();
      console.log('📋 Mes CVs:', mesCVs);
      setApplications(mesCVs);

      const offres = await getAllOffres();
      console.log('💼 Offres disponibles:', offres);
      setAvailableJobs(offres.slice(0, 4));
    } catch (err) {
      console.error('❌ Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'ACCEPTE':
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-600" />,
          color: 'bg-green-100 text-green-700',
          label: 'Accepted',
        };
      case 'REFUSE':
        return {
          icon: <XCircle className="h-4 w-4 text-red-600" />,
          color: 'bg-red-100 text-red-700',
          label: 'Rejected',
        };
      default:
        return {
          icon: <Clock className="h-4 w-4 text-blue-600" />,
          color: 'bg-blue-100 text-blue-700',
          label: 'Under Review',
        };
    }
  };

  const getInitials = (email: string) => {
    if (!email) return 'U';
    const parts = email.split('@')[0].split('.');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email[0].toUpperCase();
  };

  const acceptedCount = applications.filter(app => app.statut === 'ACCEPTE').length;
  const rejectedCount = applications.filter(app => app.statut === 'REFUSE').length;
  const pendingCount = applications.filter(
    app => app.statut !== 'ACCEPTE' && app.statut !== 'REFUSE'
  ).length;

  if (loading) {
    return (
      <div className="flex">
        <DashboardSidebar
          userType="candidate"
          activePage="candidate-dashboard"
          onNavigate={onNavigate}
          onLogout={() => onNavigate('home')}
        />
        <main className="flex-1 bg-surface min-h-screen flex items-center justify-center">
          <p>Loading dashboard...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex">
      <DashboardSidebar
        userType="candidate"
        activePage="candidate-dashboard"
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

          {/* Stats Cards */}
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

          {/* My Applications */}
          <div className="bg-white rounded-xl border border-color p-6 mb-8">
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

                      return (
                        <tr key={application.id} className="border-b border-color last:border-0">
                          <td className="py-4 px-2 font-medium">{application.offre.titre}</td>
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

          {/* Available Jobs + Profile/Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Available Jobs */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-color p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <div>
                    <h2 className="mb-1">Available Jobs</h2>
                    <p className="text-secondary text-sm">Latest opportunities you can apply for</p>
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-lg"
                    onClick={() => onNavigate('job-listings')}
                  >
                    View All Jobs
                  </Button>
                </div>

                {availableJobs.length === 0 ? (
                  <div className="text-center py-12">
                    <Bookmark className="h-12 w-12 text-muted mx-auto mb-4" />
                    <p className="text-secondary mb-4">No jobs available at the moment</p>
                    <Button
                      className="bg-primary hover:bg-primary-hover text-white rounded-lg"
                      onClick={() => onNavigate('job-listings')}
                    >
                      Refresh Jobs
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {availableJobs.map((job) => (
                      <div
                        key={job.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-surface rounded-lg gap-4 hover:bg-primary-light/50 transition-colors"
                      >
                        <div className="flex-1">
                          <h4 className="mb-1">{job.titre}</h4>
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
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="bg-white rounded-xl border border-color p-6">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold text-primary">
                      {getInitials(userEmail)}
                    </span>
                  </div>
                  <h3 className="mb-1">{userEmail.split('@')[0] || 'Candidate'}</h3>
                  <p className="text-secondary text-sm mb-4">Candidate</p>
                  <Badge className="bg-green-100 text-green-700 border-0">
                    Active
                  </Badge>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-secondary">
                    <Mail className="h-4 w-4 mr-2 text-primary" />
                    {userEmail}
                  </div>
                  <div className="flex items-center text-sm text-secondary">
                    <FileText className="h-4 w-4 mr-2 text-primary" />
                    {applications.length} Application{applications.length !== 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center text-sm text-secondary">
                    <Bookmark className="h-4 w-4 mr-2 text-primary" />
                    {availableJobs.length} Available Job{availableJobs.length !== 1 ? 's' : ''}
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

              {/* Quick Actions */}
              <div className="bg-white rounded-xl border border-color p-6">
                <h3 className="mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-color rounded-lg hover:bg-primary-light hover:border-primary"
                    onClick={() => onNavigate('job-listings')}
                  >
                    <Briefcase className="h-4 w-4 mr-2" />
                    Browse Jobs
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-color rounded-lg hover:bg-primary-light hover:border-primary"
                    onClick={() => onNavigate('my-applications')}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    My Applications
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-color rounded-lg hover:bg-primary-light hover:border-primary"
                    onClick={() => onNavigate('saved-jobs')}
                  >
                    <Bookmark className="h-4 w-4 mr-2" />
                    Saved Jobs
                  </Button>
                </div>
              </div>

              {/* Summary Card */}
              <div className="bg-primary-light rounded-xl p-6">
                <h3 className="mb-3 text-primary">Application Summary</h3>
                <ul className="space-y-2 text-sm text-secondary">
                  <li className="flex items-start">
                    <Clock className="h-4 w-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                    {pendingCount} application{pendingCount !== 1 ? 's' : ''} under review
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                    {acceptedCount} accepted application{acceptedCount !== 1 ? 's' : ''}
                  </li>
                  <li className="flex items-start">
                    <XCircle className="h-4 w-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                    {rejectedCount} rejected application{rejectedCount !== 1 ? 's' : ''}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}