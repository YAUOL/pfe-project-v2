import { DashboardSidebar } from '../components/DashboardSidebar';
import {
  Briefcase,
  Users,
  Eye,
  TrendingUp,
  MoreVertical,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { useState, useEffect } from 'react';
import {
  getMesOffres,
  getCVsByOffre,
  deleteOffre,
  OffreDTO,
  CVDTO
} from '../api';

interface RecruiterDashboardProps {
  onNavigate: (page: string, offerId?: string) => void;
}

interface OfferWithApplications extends OffreDTO {
  applicationsCount: number;
}

export function RecruiterDashboard({ onNavigate }: RecruiterDashboardProps) {
  const [offres, setOffres] = useState<OfferWithApplications[]>([]);
  const [recentApplications, setRecentApplications] = useState<CVDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const offresData = await getMesOffres();
      let allCVs: CVDTO[] = [];

      const offresWithApplications: OfferWithApplications[] = await Promise.all(
        offresData.map(async (offre) => {
          try {
            const cvs = await getCVsByOffre(offre.id);
            allCVs = [...allCVs, ...cvs];

            return {
              ...offre,
              applicationsCount: cvs.length,
            };
          } catch (err) {
            console.error(`Erreur lors du chargement des CVs pour l'offre ${offre.id}:`, err);
            return {
              ...offre,
              applicationsCount: 0,
            };
          }
        })
      );

      allCVs.sort(
        (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );

      setOffres(offresWithApplications);
      setRecentApplications(allCVs.slice(0, 4));
    } catch (err) {
      console.error('❌ Failed to load recruiter dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOffre = async (offreId: number) => {
    const confirmed = window.confirm('Are you sure you want to delete this offer?');
    if (!confirmed) return;

    try {
      setDeletingId(offreId);
      await deleteOffre(offreId);
      await loadData();
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete offer');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'Active'
      ? 'bg-green-100 text-green-700'
      : 'bg-gray-100 text-gray-700';
  };

  const getApplicationStatusColor = (status: string) => {
    if (status === 'ACCEPTE') return 'bg-green-100 text-green-700';
    if (status === 'REFUSE') return 'bg-red-100 text-red-700';
    return 'bg-blue-100 text-blue-700';
  };

  const getApplicationStatusLabel = (status: string) => {
    if (status === 'ACCEPTE') return 'Accepted';
    if (status === 'REFUSE') return 'Rejected';
    return 'New';
  };

  const totalJobs = offres.length;
  const totalApplications = offres.reduce((sum, offre) => sum + offre.applicationsCount, 0);
  const activeJobs = offres.filter((offre) => offre.active).length;
  const totalViews = totalApplications * 5;

  if (loading) {
    return (
      <div className="flex">
        <DashboardSidebar
          userType="Recruteur"
          activePage="employer-dashboard"
          onNavigate={onNavigate}
          onLogout={() => onNavigate('home')}
        />
        <main className="flex-1 bg-surface min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-secondary">Loading dashboard...</p>
          </div>
        </main>
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
            <h1 className="mb-2">Employer Dashboard</h1>
            <p className="text-secondary">Manage your job postings and track applications</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-color p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <h3 className="text-3xl font-bold mb-1">{totalJobs}</h3>
              <p className="text-secondary text-sm">Total Jobs Posted</p>
            </div>

            <div className="bg-white rounded-xl border border-color p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <h3 className="text-3xl font-bold mb-1">{totalApplications}</h3>
              <p className="text-secondary text-sm">Applications Received</p>
            </div>

            <div className="bg-white rounded-xl border border-color p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Eye className="h-6 w-6 text-purple-600" />
                </div>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <h3 className="text-3xl font-bold mb-1">{totalViews}</h3>
              <p className="text-secondary text-sm">Total Views</p>
            </div>

            <div className="bg-white rounded-xl border border-color p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-green-600">Active</span>
              </div>
              <h3 className="text-3xl font-bold mb-1">{activeJobs}</h3>
              <p className="text-secondary text-sm">Active Job Posts</p>
            </div>
          </div>

          {/* Posted Jobs Table */}
          <div className="bg-white rounded-xl border border-color p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="mb-1">Posted Jobs</h2>
                <p className="text-secondary text-sm">Manage and track your job postings</p>
              </div>
              <Button
                onClick={() => onNavigate('post-job')}
                className="bg-primary hover:bg-primary-hover text-white rounded-lg"
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Create New Job Post
              </Button>
            </div>

            {offres.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-muted mx-auto mb-4" />
                <p className="text-secondary mb-4">You haven't posted any jobs yet</p>
                <Button
                  className="bg-primary hover:bg-primary-hover text-white rounded-lg"
                  onClick={() => onNavigate('post-job')}
                >
                  Post Your First Job
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Applications</TableHead>
                      <TableHead className="text-center">Views</TableHead>
                      <TableHead>Posted Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {offres.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">{job.titre}</TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(job.active ? 'Active' : 'Closed')} border-0`}>
                            {job.active ? 'Active' : 'Closed'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-semibold text-primary">{job.applicationsCount}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-secondary">{job.applicationsCount * 5}</span>
                        </TableCell>
                        <TableCell className="text-secondary">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                {deletingId === job.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <MoreVertical className="h-4 w-4" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onNavigate('offer-candidates', job.id.toString())}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onNavigate('post-job', job.id.toString())}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Job
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteOffre(job.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Job
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Recent Applications */}
          <div className="bg-white rounded-xl border border-color p-6 mt-8">
            <h2 className="mb-6">Recent Applications</h2>

            {recentApplications.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted mx-auto mb-4" />
                <p className="text-secondary">No applications yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentApplications.map((application) => (
                  <div
                    key={application.id}
                    className="flex items-center justify-between p-4 bg-surface rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
                        <span className="font-semibold text-primary">
                          {application.candidat.prenom?.[0]}
                          {application.candidat.nom?.[0]}
                        </span>
                      </div>
                      <div>
                        <h4 className="mb-1">
                          {application.candidat.prenom} {application.candidat.nom}
                        </h4>
                        <p className="text-sm text-secondary">{application.offre.titre}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={`${getApplicationStatusColor(application.statut)} border-0`}>
                        {getApplicationStatusLabel(application.statut)}
                      </Badge>
                      <span className="text-sm text-secondary">
                        {new Date(application.uploadedAt).toLocaleDateString()}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        onClick={() => onNavigate('offer-candidates', application.offre.id.toString())}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}