import {
  LayoutDashboard,
  Briefcase,
  FileText,
  User,
  LogOut,
  PlusCircle,
  Bookmark,
  Menu,
  X,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';

interface DashboardSidebarProps {
  userType: 'Recruteur' | 'candidate' | 'admin';
  activePage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function DashboardSidebar({
  userType,
  activePage,
  onNavigate,
  onLogout,
}: DashboardSidebarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const employerMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: 'employer-dashboard' },
    { icon: PlusCircle, label: 'Post Job', path: 'post-job' },
    { icon: Briefcase, label: 'Manage Jobs', path: 'manage-jobs' },
    { icon: User, label: 'Profile', path: 'profile' },
  ];

  const candidateMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: 'candidate-dashboard' },
    { icon: User, label: 'Profile', path: 'profile' },
    { icon: FileText, label: 'My Applications', path: 'my-applications' },
    { icon: Bookmark, label: 'Saved Jobs', path: 'saved-jobs' },
  ];

  const adminMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: 'admin-dashboard' },
    { icon: Users, label: 'Users Management', path: 'admin-dashboard' },
    { icon: Briefcase, label: 'Offers Management', path: 'admin-dashboard' },
    { icon: ShieldCheck, label: 'Platform Control', path: 'admin-dashboard' },
  ];

  const menuItems =
    userType === 'Recruteur'
      ? employerMenuItems
      : userType === 'admin'
      ? adminMenuItems
      : candidateMenuItems;

  const portalLabel =
    userType === 'Recruteur'
      ? 'Recruiter Portal'
      : userType === 'admin'
      ? 'Admin Portal'
      : 'Candidate Portal';

  const portalInitials =
    userType === 'admin'
      ? 'AD'
      : userType === 'Recruteur'
      ? 'JB'
      : 'JB';

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
                  onClick={() => {
                    onNavigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-all ${
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

      <div className="p-4 border-t border-color">
        <Button
          variant="ghost"
          className="w-full justify-start text-secondary hover:text-primary hover:bg-surface"
          onClick={onLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <>
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

      <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-color h-screen sticky top-0">
        <SidebarContent />
      </aside>

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