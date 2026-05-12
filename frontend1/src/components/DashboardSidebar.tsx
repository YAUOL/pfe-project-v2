import {
  LayoutDashboard, Briefcase, FileText, User,
  PlusCircle, Bookmark, Menu, X, Users, MessageSquare,
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
    { icon: MessageSquare, label: 'Messages', path: 'admin-dashboard', sectionId: 'messages-section' },
    { icon: Users, label: 'Candidates', path: 'admin-dashboard', sectionId: 'candidates-section' },
    { icon: Briefcase, label: 'Recruiters', path: 'admin-dashboard', sectionId: 'recruiters-section' },
    { icon: Briefcase, label: 'Offers Management', path: 'admin-dashboard', sectionId: 'offers-management' },
  ];

  const menuItems = isRecruiter
    ? employerMenuItems
    : isAdmin
    ? adminMenuItems
    : candidateMenuItems;

  const portalLabel = isAdmin ? 'Admin Portal' : isRecruiter ? 'Recruiter Portal' : 'Candidate Portal';
  const portalInitials = isAdmin ? 'AD' : 'JB';

  const handleItemClick = (path: string, sectionId: string) => {
    setMobileMenuOpen(false);
    onNavigate(path);
    setTimeout(() => {
      if (sectionId) {
        const el = document.getElementById(sectionId);
        if (el) {
          // Scroll inside the admin main container, not the page
          const container = document.getElementById('admin-main');
          if (container) {
            const offsetTop = el.offsetTop - 24;
            container.scrollTo({ top: offsetTop, behavior: 'smooth' });
          } else {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      } else {
        const container = document.getElementById('admin-main');
        if (container) {
          container.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }, 100);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-color shrink-0">
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

      <nav className="flex-1 p-4 overflow-y-auto">
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
                  <Icon className="h-5 w-5 mr-3 shrink-0" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
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

      {/* Desktop sidebar — fixed height, no overflow on the aside itself */}
      <aside className="hidden lg:block w-64 bg-white border-r border-color shrink-0" style={{ height: '100vh', position: 'sticky', top: 0 }}>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileMenuOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-color z-50">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}