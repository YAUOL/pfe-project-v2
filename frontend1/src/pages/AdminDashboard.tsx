import { useEffect, useState } from 'react';
import { DashboardSidebar } from '../components/DashboardSidebar';
import {
  Users,
  Briefcase,
  ShieldCheck,
  TrendingUp,
  MoreVertical,
  Trash2,
  Mail,
  MapPin,
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
import {
  getAdminUsers,
  deleteAdminUser,
  getAdminOffres,
  deleteAdminOffre,
  getAdminStats,
  AdminUser,
  OffreDTO,
  AdminStats,
} from '../api';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [offres, setOffres] = useState<OffreDTO[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [usersData, offresData, statsData] = await Promise.all([
        getAdminUsers(),
        getAdminOffres(),
        getAdminStats(),
      ]);

      setUsers(usersData);
      setOffres(offresData);
      setStats(statsData);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load admin dashboard';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleDeleteUser = async (id: number) => {
    const confirmed = window.confirm('Are you sure you want to delete this user?');
    if (!confirmed) return;
    try {
      await deleteAdminUser(id);
      await loadAdminData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const handleDeleteOffre = async (id: number) => {
    const confirmed = window.confirm('Are you sure you want to delete this offer?');
    if (!confirmed) return;
    try {
      await deleteAdminOffre(id);
      await loadAdminData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete offer');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-700';
      case 'RECRUTEUR': return 'bg-blue-100 text-blue-700';
      case 'CANDIDAT': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar
          userType="admin"
          activePage="admin-dashboard"
          onNavigate={onNavigate}
        />
        <main
          id="admin-main"
          className="flex-1 bg-surface h-screen overflow-y-auto p-4 lg:p-8 flex items-center justify-center"
        >
          <p className="text-secondary">Loading admin dashboard...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar
          userType="admin"
          activePage="admin-dashboard"
          onNavigate={onNavigate}
        />
        <main
          id="admin-main"
          className="flex-1 bg-surface h-screen overflow-y-auto p-4 lg:p-8 flex items-center justify-center"
        >
          <div className="bg-white rounded-xl border border-color p-8 text-center max-w-md w-full">
            <h2 className="mb-3">Admin Dashboard Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Button
              onClick={loadAdminData}
              className="bg-primary hover:bg-primary-hover text-white rounded-lg"
            >
              Retry
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar
        userType="admin"
        activePage="admin-dashboard"
        onNavigate={onNavigate}
      />

      <main
        id="admin-main"
        className="flex-1 bg-surface h-screen overflow-y-auto p-4 lg:p-8"
      >
        <div className="max-w-7xl mx-auto">

          {/* Overview */}
          <section id="admin-dashboard-overview" className="mb-8 scroll-mt-6">
            <div className="mb-8">
              <h1 className="mb-2">Admin Dashboard</h1>
              <p className="text-secondary">
                Manage users, supervise job offers, and monitor platform activity
              </p>
            </div>

            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">
                <div className="bg-white rounded-xl border border-color p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <h3 className="text-3xl font-bold mb-1">{stats.totalUsers}</h3>
                  <p className="text-secondary text-sm">Total Users</p>
                </div>

                <div className="bg-white rounded-xl border border-color p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <h3 className="text-3xl font-bold mb-1">{stats.totalCandidates}</h3>
                  <p className="text-secondary text-sm">Candidates</p>
                </div>

                <div className="bg-white rounded-xl border border-color p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Briefcase className="h-6 w-6 text-orange-600" />
                    </div>
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <h3 className="text-3xl font-bold mb-1">{stats.totalRecruiters}</h3>
                  <p className="text-secondary text-sm">Recruiters</p>
                </div>

                <div className="bg-white rounded-xl border border-color p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <ShieldCheck className="h-6 w-6 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-purple-600">Secure</span>
                  </div>
                  <h3 className="text-3xl font-bold mb-1">{stats.totalAdmins}</h3>
                  <p className="text-secondary text-sm">Admins</p>
                </div>

                <div className="bg-white rounded-xl border border-color p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Briefcase className="h-6 w-6 text-indigo-600" />
                    </div>
                    <span className="text-sm font-medium text-indigo-600">Published</span>
                  </div>
                  <h3 className="text-3xl font-bold mb-1">{stats.totalOffres}</h3>
                  <p className="text-secondary text-sm">Total Offers</p>
                </div>
              </div>
            )}
          </section>

          {/* Users Management */}
          <section
            id="users-management"
            className="bg-white rounded-xl border border-color p-6 mb-8 scroll-mt-6"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="mb-1">Users Management</h2>
                <p className="text-secondary text-sm">View and manage platform users</p>
              </div>
              <Badge className="bg-primary-light text-primary border-0">
                {users.length} Users
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.id}</TableCell>
                      <TableCell>
                        {user.prenom} {user.nom}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-secondary">
                          <Mail className="h-4 w-4" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getRoleBadgeColor(user.role)} border-0`}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-secondary">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {user.role === 'ADMIN' ? (
                          <Badge className="bg-gray-100 text-gray-700 border-0">
                            Protected
                          </Badge>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {users.length === 0 && (
                <p className="text-center text-secondary py-6">No users found.</p>
              )}
            </div>
          </section>

          {/* Offers Management */}
          <section
            id="offers-management"
            className="bg-white rounded-xl border border-color p-6 scroll-mt-6"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="mb-1">Offers Management</h2>
                <p className="text-secondary text-sm">View and moderate published offers</p>
              </div>
              <Badge className="bg-primary-light text-primary border-0">
                {offres.length} Offers
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offres.map((offre) => (
                    <TableRow key={offre.id}>
                      <TableCell className="font-medium">{offre.id}</TableCell>
                      <TableCell>{offre.titre}</TableCell>
                      <TableCell>{offre.company}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-secondary">
                          <MapPin className="h-4 w-4" />
                          {offre.localisation}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${
                            offre.active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          } border-0`}
                        >
                          {offre.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-secondary">
                        {offre.createdAt
                          ? new Date(offre.createdAt).toLocaleDateString()
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteOffre(offre.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Offer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {offres.length === 0 && (
                <p className="text-center text-secondary py-6">No offers found.</p>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}