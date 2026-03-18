import { DashboardSidebar } from '../components/DashboardSidebar';
import { Briefcase, Users, Clock, Plus, Eye, Trash2, FileText, CheckCircle, Bookmark } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useState, useEffect } from 'react';
import { getMesOffres, getCVsByOffre, deleteOffre, getMyProfile, OffreDTO, CVDTO, UserProfile } from '../api';

interface RecruiterDashboardProps {
  onNavigate: (page: string, offerId?: string) => void;
}

export function RecruiterDashboard({ onNavigate }: RecruiterDashboardProps) {
  const [offres, setOffres] = useState<OffreDTO[]>([]);
  const [recentApplications, setRecentApplications] = useState<CVDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalApplications, setTotalApplications] = useState(0);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger le profil
      const userProfile = await getMyProfile();
      console.log('👤 Profil recruteur:', userProfile);
      setProfile(userProfile);
      
      // Charger les offres
      const data = await getMesOffres();
      console.log('💼 Mes offres:', data);
      console.log('💼 Nombre d\'offres:', data.length);
      setOffres(data);

      // Calculer le total de candidatures et récupérer les récentes
      let total = 0;
      let allCVs: CVDTO[] = [];
      
      for (const offre of data) {
        try {
          const cvs = await getCVsByOffre(offre.id);
          total += cvs.length;
          allCVs = [...allCVs, ...cvs];
        } catch (err) {
          console.error(`Erreur lors du chargement des CVs pour l'offre ${offre.id}:`, err);
        }
      }
      
      setTotalApplications(total);
      
      // Trier par date et prendre les 4 plus récents
      allCVs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
      setRecentApplications(allCVs.slice(0, 4));

    } catch (err) {
      console.error('❌ Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOffre = async (offreId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
      return;
    }

    try {
      await deleteOffre(offreId);
      alert('Offre supprimée avec succès');
      loadData();
    } catch (err) {
      alert('Erreur lors de la suppression');
      console.error(err);
    }
  };

  const getStatusColor = (active: boolean) => {
    return active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700';
  };

  const getInitials = (fullName: string) => {
    if (!fullName) return 'R';
    const names = fullName.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
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
        userType="Recruteur"
        activePage="employer-dashboard"
        onNavigate={onNavigate}
        onLogout={() => onNavigate('home')}
      />

      <main className="flex-1 bg-surface min-h-screen p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-2">Recruiter Dashboard</h1>
            <p className="text-secondary">Manage your job offers and review candidates</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-color p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-3xl font-bold mb-1">{offres.length}</h3>
                  <p className="text-secondary text-sm">Active Job Offers</p>
                </div>

                <div className="bg-white rounded-xl border border-color p-6">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-3xl font-bold mb-1">{totalApplications}</h3>
                  <p className="text-secondary text-sm">Total Applications</p>
                </div>

                <div className="bg-white rounded-xl border border-color p-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-3xl font-bold mb-1">{totalApplications}</h3>
                  <p className="text-secondary text-sm">Pending Reviews</p>
                </div>
              </div>

              {/* My Job Offers */}
              <div className="bg-white rounded-xl border border-color p-6">
                <h2 className="mb-6">My Job Offers</h2>
                {offres.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="h-12 w-12 text-muted mx-auto mb-4" />
                    <p className="text-secondary mb-4">You haven't posted any job offers yet</p>
                    <Button 
                      className="bg-primary hover:bg-primary-hover text-white rounded-lg"
                      onClick={() => onNavigate('post-job')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Post Your First Job
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {offres.map((offre) => (
                      <OffreCard 
                        key={offre.id}
                        offre={offre}
                        onNavigate={onNavigate}
                        onDelete={handleDeleteOffre}
                        getStatusColor={getStatusColor}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Applications */}
              <div className="bg-white rounded-xl border border-color p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2>Recent Applications</h2>
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => onNavigate('manage-jobs')}
                    className="text-primary hover:text-primary-hover"
                  >
                    View All
                  </Button>
                </div>
                
                {recentApplications.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted mx-auto mb-4" />
                    <p className="text-secondary mb-4">No applications received yet</p>
                    <Button 
                      className="bg-primary hover:bg-primary-hover text-white rounded-lg"
                      onClick={() => onNavigate('post-job')}
                    >
                      Post a Job
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentApplications.map((cv) => (
                      <div 
                        key={cv.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-surface rounded-lg gap-4"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="mb-1">{cv.candidat.prenom} {cv.candidat.nom}</h4>
                            <p className="text-sm text-secondary mb-2">
                              Applied for: {cv.offre.titre}
                            </p>
                            <p className="text-xs text-muted">
                              Received on {new Date(cv.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                          <Badge className="bg-blue-100 text-blue-700 border-0">
                            New
                          </Badge>
                          <Button 
                            variant="outline"
                            size="sm"
                            className="rounded-lg border-color"
                            onClick={() => onNavigate('offer-candidates', cv.offre.id.toString())}
                          >
                            Review
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
              {profile && (
                <div className="bg-white rounded-xl border border-color p-6">
                  <div className="text-center mb-6">
                    <div className="w-24 h-24 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl font-bold text-primary">
                        {getInitials(profile.fullName)}
                      </span>
                    </div>
                    <h3 className="mb-1">{profile.fullName}</h3>
                    <p className="text-secondary text-sm mb-4">Recruiter</p>
                    <Badge className="bg-green-100 text-green-700 border-0">
                      Active
                    </Badge>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-secondary">
                      <Briefcase className="h-4 w-4 mr-2 text-primary" />
                      {profile.email}
                    </div>
                    <div className="flex items-center text-sm text-secondary">
                      <Users className="h-4 w-4 mr-2 text-primary" />
                      {offres.length} Active Offer{offres.length !== 1 ? 's' : ''}
                    </div>
                  </div>

                  <Button 
                    variant="outline"
                    className="w-full border-color rounded-lg"
                    onClick={() => onNavigate('recruiter-profile')}
                  >
                    Edit Profile
                  </Button>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white rounded-xl border border-color p-6">
                <h3 className="mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button 
                    variant="outline"
                    className="w-full justify-start border-color rounded-lg hover:bg-primary-light hover:border-primary"
                    onClick={() => onNavigate('post-job')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Post New Job
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full justify-start border-color rounded-lg hover:bg-primary-light hover:border-primary"
                    onClick={() => onNavigate('manage-jobs')}
                  >
                    <Briefcase className="h-4 w-4 mr-2" />
                    Manage Jobs
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full justify-start border-color rounded-lg hover:bg-primary-light hover:border-primary"
                    onClick={() => onNavigate('manage-jobs')}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    View All Candidates
                  </Button>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-primary-light rounded-xl p-6">
                <h3 className="mb-3 text-primary">Recruitment Tips</h3>
                <ul className="space-y-2 text-sm text-secondary">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                    Write clear job descriptions
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                    Respond to candidates quickly
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                    Review applications regularly
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

// Composant pour afficher une carte d'offre
function OffreCard({ 
  offre, 
  onNavigate, 
  onDelete, 
  getStatusColor 
}: { 
  offre: OffreDTO;
  onNavigate: (page: string, offerId?: string) => void;
  onDelete: (id: number) => void;
  getStatusColor: (active: boolean) => string;
}) {
  const [applicantsCount, setApplicantsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplicants();
  }, [offre.id]);

  const loadApplicants = async () => {
    try {
      const cvs = await getCVsByOffre(offre.id);
      setApplicantsCount(cvs.length);
    } catch (err) {
      console.error('Failed to load applicants:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-surface rounded-lg gap-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center flex-shrink-0">
          <Briefcase className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="mb-1">{offre.titre}</h4>
          <p className="text-sm text-secondary mb-2">{offre.localisation}</p>
          <div className="flex flex-wrap gap-2 text-xs text-muted">
            <span>{offre.typeContrat}</span>
            <span>•</span>
            <span>{loading ? '...' : applicantsCount} applicant{applicantsCount !== 1 ? 's' : ''}</span>
            <span>•</span>
            <span>Posted {new Date(offre.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 sm:flex-col sm:items-end">
        <Badge className={`${getStatusColor(offre.active)} border-0`}>
          {offre.active ? 'Active' : 'Closed'}
        </Badge>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            size="sm"
            className="rounded-lg border-color"
            onClick={() => onNavigate('offer-candidates', offre.id.toString())}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button 
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => onDelete(offre.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}