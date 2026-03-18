import { DashboardSidebar } from '../components/DashboardSidebar';
import { FileText, Bookmark, CheckCircle, XCircle, Clock, Mail, Phone, MapPin } from 'lucide-react';
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

  // Charger les données au montage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Récupérer l'email de l'utilisateur
      const email = localStorage.getItem('authEmail') || '';
      setUserEmail(email);

      // Charger mes candidatures
      const mesCVs = await getMesCVs();
      console.log('📋 Mes CVs:', mesCVs);
      setApplications(mesCVs);

      // Charger toutes les offres disponibles
      const offres = await getAllOffres();
      console.log('💼 Offres disponibles:', offres);
      console.log('💼 Nombre d\'offres:', offres.length);
      setAvailableJobs(offres.slice(0, 4)); // Limiter à 4

    } catch (err) {
      console.error('❌ Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Shortlisted':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'Rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Shortlisted':
        return 'bg-green-100 text-green-700';
      case 'Rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  // Extraire les initiales pour l'avatar
  const getInitials = (email: string) => {
    if (!email) return 'U';
    const parts = email.split('@')[0].split('.');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email[0].toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading dashboard...</p>
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
            <p className="text-secondary">Track your applications and manage your profile</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-color p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-3xl font-bold mb-1">{applications.length}</h3>
                  <p className="text-secondary text-sm">Applications</p>
                </div>

                <div className="bg-white rounded-xl border border-color p-6">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-3xl font-bold mb-1">{applications.length}</h3>
                  <p className="text-secondary text-sm">Under Review</p>
                </div>

                <div className="bg-white rounded-xl border border-color p-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <Bookmark className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-3xl font-bold mb-1">{availableJobs.length}</h3>
                  <p className="text-secondary text-sm">Available Jobs</p>
                </div>
              </div>

              {/* Application Status */}
              <div className="bg-white rounded-xl border border-color p-6">
                <h2 className="mb-6">My Applications</h2>
                {applications.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted mx-auto mb-4" />
                    <p className="text-secondary mb-4">You haven't applied to any jobs yet</p>
                    <Button 
                      className="bg-primary hover:bg-primary-hover text-white rounded-lg"
                      onClick={() => onNavigate('job-listings')}
                    >
                      Browse Jobs
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((application) => (
                      <div 
                        key={application.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-surface rounded-lg gap-4"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center flex-shrink-0">
                            {getStatusIcon('Under Review')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="mb-1">{application.offre.titre}</h4>
                            <p className="text-sm text-secondary mb-2">
                              CV: {application.nomFichier}
                            </p>
                            <p className="text-xs text-muted">
                              Applied on {new Date(application.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                          <Badge className={`${getStatusColor('Under Review')} border-0`}>
                            Under Review
                          </Badge>
                          <Button 
                            variant="outline"
                            size="sm"
                            className="rounded-lg border-color"
                            onClick={() => onNavigate('job-detail', application.offre.id.toString())}
                          >
                            View Job
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Available Jobs */}
              <div className="bg-white rounded-xl border border-color p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2>Available Jobs</h2>
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => onNavigate('job-listings')}
                    className="text-primary hover:text-primary-hover"
                  >
                    View All
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
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-surface rounded-lg gap-4 hover:bg-primary-light/50 transition-colors cursor-pointer"
                        onClick={() => onNavigate('job-detail', job.id.toString())}
                      >
                        <div className="flex-1">
                          <h4 className="mb-1">{job.titre}</h4>
                          <p className="text-sm text-secondary mb-2">{job.localisation}</p>
                          <div className="flex flex-wrap gap-2 text-xs text-muted">
                            <span>{job.localisation}</span>
                            <span>•</span>
                            <span>{job.typeContrat}</span>
                          </div>
                        </div>
                        <Button 
                          className="bg-primary hover:bg-primary-hover text-white rounded-lg whitespace-nowrap"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate('job-application', job.id.toString());
                          }}
                        >
                          Apply Now
                        </Button>
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
                  <h3 className="mb-1">{userEmail.split('@')[0]}</h3>
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
                    <FileText className="h-4 w-4 mr-2" />
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

              {/* Tips */}
              <div className="bg-primary-light rounded-xl p-6">
                <h3 className="mb-3 text-primary">Application Tips</h3>
                <ul className="space-y-2 text-sm text-secondary">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                    Tailor your CV to each position
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                    Write compelling cover letters
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                    Follow up on your applications
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