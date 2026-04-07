import { Button } from './ui/button';
import { Home, FileText, User, LogOut, Briefcase, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  isLoggedIn: boolean;
  userRole: string | null;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function Navbar({
  isLoggedIn,
  userRole,
  currentPage,
  onNavigate,
  onLogout,
}: NavbarProps) {
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authEmail');
    localStorage.removeItem('authRole');
    onLogout();
  };

  const isActive = (page: string) => {
    return currentPage === page;
  };

  const getDashboardPage = () => {
    if (userRole === 'ADMIN') return 'admin-dashboard';
    if (userRole === 'RECRUTEUR') return 'employer-dashboard';
    return 'candidate-dashboard';
  };

  const getProfilePage = () => {
    if (userRole === 'RECRUTEUR') return 'recruiter-profile';
    return 'profile';
  };

  const getRoleLabel = () => {
    if (userRole === 'ADMIN') return 'Admin';
    if (userRole === 'RECRUTEUR') return 'Recruiter';
    return 'Candidate';
  };

  const isDashboardActive = () => {
    return (
      isActive('admin-dashboard') ||
      isActive('employer-dashboard') ||
      isActive('candidate-dashboard')
    );
  };

  return (
    <nav className="bg-white border-b border-color sticky top-0 z-50 shadow-custom-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onNavigate('home')}
          >
            <img
              src="/logo.png"
              alt="JobBoard logo"
              className="w-12 h-12 mr-3 object-contain"
            />
            <span className="text-xl font-bold text-primary">JobBoard</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink
              icon={<Home className="h-4 w-4" />}
              label="Home"
              onClick={() => onNavigate('home')}
              isActive={isActive('home')}
            />

            <NavLink
              icon={<Briefcase className="h-4 w-4" />}
              label="Jobs"
              onClick={() => onNavigate('job-listings')}
              isActive={isActive('job-listings')}
            />

            {isLoggedIn && (
              <>
                <NavLink
                  icon={
                    userRole === 'ADMIN' ? (
                      <ShieldCheck className="h-4 w-4" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )
                  }
                  label="Dashboard"
                  onClick={() => onNavigate(getDashboardPage())}
                  isActive={isDashboardActive()}
                />

                {userRole === 'RECRUTEUR' && (
                  <NavLink
                    icon={<Briefcase className="h-4 w-4" />}
                    label="Post Job"
                    onClick={() => onNavigate('post-job')}
                    isActive={isActive('post-job')}
                  />
                )}

                {userRole !== 'ADMIN' && (
                  <NavLink
                    icon={<User className="h-4 w-4" />}
                    label="Profile"
                    onClick={() => onNavigate(getProfilePage())}
                    isActive={isActive('recruiter-profile') || isActive('profile')}
                  />
                )}
              </>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <span className="hidden sm:inline text-sm text-secondary">
                  {getRoleLabel()}
                </span>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => onNavigate('login')}
                  variant="ghost"
                  className="rounded-lg"
                >
                  Login
                </Button>
                <Button
                  onClick={() => onNavigate('signup')}
                  className="bg-primary hover:bg-primary-hover text-white rounded-lg"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isLoggedIn && (
          <div className="md:hidden flex items-center gap-2 pb-3 overflow-x-auto">
            <MobileNavLink
              icon={<Home className="h-4 w-4" />}
              label="Home"
              onClick={() => onNavigate('home')}
              isActive={isActive('home')}
            />
            <MobileNavLink
              icon={<Briefcase className="h-4 w-4" />}
              label="Jobs"
              onClick={() => onNavigate('job-listings')}
              isActive={isActive('job-listings')}
            />
            <MobileNavLink
              icon={
                userRole === 'ADMIN' ? (
                  <ShieldCheck className="h-4 w-4" />
                ) : (
                  <FileText className="h-4 w-4" />
                )
              }
              label="Dashboard"
              onClick={() => onNavigate(getDashboardPage())}
              isActive={isDashboardActive()}
            />
            {userRole !== 'ADMIN' && (
              <MobileNavLink
                icon={<User className="h-4 w-4" />}
                label="Profile"
                onClick={() => onNavigate(getProfilePage())}
                isActive={isActive('recruiter-profile') || isActive('profile')}
              />
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

// Desktop Nav Link Component
function NavLink({
  icon,
  label,
  onClick,
  isActive,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isActive: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
        ${isActive
          ? 'bg-primary-light text-primary'
          : 'text-secondary hover:bg-surface hover:text-foreground'
        }
      `}
    >
      {icon}
      {label}
    </button>
  );
}

// Mobile Nav Link Component
function MobileNavLink({
  icon,
  label,
  onClick,
  isActive,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isActive: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors
        ${isActive
          ? 'bg-primary-light text-primary'
          : 'text-secondary hover:bg-surface hover:text-foreground'
        }
      `}
    >
      {icon}
      {label}
    </button>
  );
}