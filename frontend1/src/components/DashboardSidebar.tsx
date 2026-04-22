import {
  LayoutDashboard,
  Briefcase,
  FileText,
  User,
  PlusCircle,
  Bookmark,
  Menu,
  X,
  Users,
} from 'lucide-react';
import { useState } from 'react';

interface DashboardSidebarProps {
  userType: 'Recruteur' | 'candidate' | 'admin' | 'RECRUTEUR' | 'CANDIDAT' | 'ADMIN';
  activePage: string;
  onNavigate: (page: string, jobId?: string) => void;
  onLogout?: () => void;
}

export function DashboardSidebar({
  userType,
  activePage,
  onNavigate,
}: DashboardSidebarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = userType === 'admin' || userType === 'ADMIN';
  const isRecruiter = userType === 'Recruteur' || userType === 'RECRUTEUR';

  const employerMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: 'employer-dashboard', sectionId: '' },
    { icon: PlusCircle, label: 'Post Job', path: 'post-job', sectionId: '' },
    { icon: Briefcase, label: 'Manage Jobs', path: 'manage-jobs', sectionId: '' },
    { icon: User, label: 'Profile', path: 'profile', sectionId: '' },
  ];

  const candidateMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: 'candidate-dashboard', sectionId: '' },
    { icon: User, label: 'Profile', path: 'profile', sectionId: '' },
    { icon: FileText, label: 'My Applications', path: 'my-applications', sectionId: '' },
    { icon: Bookmark, label: 'Saved Jobs', path: 'saved-jobs', sectionId: '' },
  ];

  const adminMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: 'admin-dashboard', sectionId: 'admin-dashboard-overview' },
    { icon: Users, label: 'Users Management', path: 'admin-dashboard', sectionId: 'users-management' },
    { icon: Briefcase, label: 'Offers Management', path: 'admin-dashboard', sectionId: 'offers-management' },
  ];

  const menuItems = isRecruiter
    ? employerMenuItems
    : isAdmin
    ? adminMenuItems
    : candidateMenuItems;

  const portalLabel = isAdmin
    ? 'Admin Portal'
    : isRecruiter
    ? 'Recruiter Portal'
    : 'Candidate Portal';

  const portalInitials = isAdmin ? 'AD' : 'JB';

  const handleItemClick = (path: string, sectionId: string) => {
    setMobileMenuOpen(false);
    onNavigate(path);

    // after navigation, scroll to the section
    setTimeout(() => {
      if (sectionId) {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-color">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold">{portalInitials}</span>
          </div>
          <div>
            <h2 className="font-semibold">JobBoard</h2>
            <p className="text-sm text-secondary">{portalLabel}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activePage === item.path;

            return (
              <li key={`${item.path}-${index}`}>
                <button
                  type="button"
                  onClick={() => handleItemClick(item.path, item.sectionId)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-all text-left ${
                    isActive
                      ? 'bg-primary-light text-primary font-medium'
                      : 'text-secondary hover:bg-surface hover:text-primary'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="lg:hidden fixed top-20 left-4 z-50 bg-white border border-color rounded-lg p-2 shadow-custom-md"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? (
          <X className="h-6 w-6 text-secondary" />
        ) : (
          <Menu className="h-6 w-6 text-secondary" />
        )}
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-color h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileMenuOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-color z-50 flex flex-col">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}