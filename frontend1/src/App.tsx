import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ChatBot } from './components/ChatBot';
import { Home } from './pages/Home';
import { JobListings } from './pages/JobListings';
import { JobDetail } from './pages/JobDetail';
import { CandidateDashboard } from './pages/CandidateDashboard';
import { RecruiterDashboard } from './pages/RecruiterDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { PostJob } from './pages/PostJob';
import { JobApplication } from './pages/JobApplication';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { OfferCandidates } from './pages/OfferCandidates';
import { ProfileEdit } from './pages/ProfileEdit';

type Page =
  | 'home'
  | 'job-listings'
  | 'job-detail'
  | 'employer-dashboard'
  | 'candidate-dashboard'
  | 'admin-dashboard'
  | 'job-application'
  | 'login'
  | 'signup'
  | 'forgot-password'
  | 'post-job'
  | 'manage-jobs'
  | 'profile'
  | 'recruiter-profile'
  | 'my-applications'
  | 'saved-jobs'
  | 'offer-candidates';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('authRole');
    if (token && role) {
      setIsLoggedIn(true);
      setUserRole(role);
    }
  }, []);

  const handleNavigate = (page: string, jobId?: string) => {
    if (page === 'admin-dashboard' && userRole !== 'ADMIN') {
      setCurrentPage('home');
      return;
    }
    setCurrentPage(page as Page);
    if (jobId) setSelectedJobId(jobId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authEmail');
    localStorage.removeItem('authRole');
    setIsLoggedIn(false);
    setUserRole(null);
    setCurrentPage('home');
  };

  const handleLoginSuccess = () => {
    const role = localStorage.getItem('authRole');
    setIsLoggedIn(true);
    setUserRole(role);
    if (role === 'ADMIN') setCurrentPage('admin-dashboard');
    else if (role === 'RECRUTEUR') setCurrentPage('employer-dashboard');
    else if (role === 'CANDIDAT') setCurrentPage('candidate-dashboard');
    else setCurrentPage('home');
  };

  const showNavbarAndFooter = !['login', 'signup', 'forgot-password'].includes(currentPage);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'job-listings':
        return <JobListings onNavigate={handleNavigate} />;
      case 'job-detail':
        return <JobDetail jobId={selectedJobId} onNavigate={handleNavigate} />;
      case 'employer-dashboard':
        return <RecruiterDashboard onNavigate={handleNavigate} />;
      case 'candidate-dashboard':
        return <CandidateDashboard onNavigate={handleNavigate} />;
      case 'admin-dashboard':
        return userRole === 'ADMIN'
          ? <AdminDashboard onNavigate={handleNavigate} />
          : <Home onNavigate={handleNavigate} />;
      case 'job-application':
        return <JobApplication jobId={selectedJobId} onNavigate={handleNavigate} />;
      case 'login':
        return <Login onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />;
      case 'signup':
        return <Signup onNavigate={handleNavigate} />;
      case 'forgot-password':
        return <ForgotPassword onNavigate={handleNavigate} />;
      case 'post-job':
        return <PostJob onNavigate={handleNavigate} />;
      case 'offer-candidates':
        return <OfferCandidates offerId={selectedJobId} onNavigate={handleNavigate} />;
      case 'profile':
      case 'recruiter-profile':
        return <ProfileEdit onNavigate={handleNavigate} />;
      case 'manage-jobs':
      case 'my-applications':
      case 'saved-jobs':
        return (
          <div className="flex items-center justify-center min-h-screen bg-surface">
            <div className="text-center p-8">
              <h2 className="mb-4">Page Under Construction</h2>
              <p className="text-secondary mb-6">This page is coming soon!</p>
              <button
                onClick={() => handleNavigate('home')}
                className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        );
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {showNavbarAndFooter && (
        <Navbar
          isLoggedIn={isLoggedIn}
          userRole={userRole}
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      )}
      <main className="flex-1">
        {renderPage()}
      </main>
      {showNavbarAndFooter && (
        <Footer
          onNavigate={handleNavigate}
          isLoggedIn={isLoggedIn}
          userRole={userRole}
        />
      )}
      <ChatBot />
    </div>
  );
}