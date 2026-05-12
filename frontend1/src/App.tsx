import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ChatBot } from './components/ChatBot';
import { MessagingButton } from './pages/MessagingButton';
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
  const [chatOpen, setChatOpen] = useState(false);
  const [ticketOpen, setTicketOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('authRole');
    if (token && role) {
      setIsLoggedIn(true);
      setUserRole(role);
    }
    window.history.replaceState({ page: 'home' }, '', '/home');
  }, []);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.page) {
        setCurrentPage(event.state.page as Page);
        if (event.state.jobId) setSelectedJobId(event.state.jobId);
      } else {
        setCurrentPage('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (page: string, jobId?: string) => {
    if (page === 'admin-dashboard' && userRole !== 'ADMIN') {
      setCurrentPage('home');
      window.history.pushState({ page: 'home' }, '', '/home');
      return;
    }
    setCurrentPage(page as Page);
    if (jobId !== undefined) setSelectedJobId(jobId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.history.pushState({ page, jobId }, '', `/${page}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authEmail');
    localStorage.removeItem('authRole');
    localStorage.removeItem('authId');
    localStorage.removeItem('authFullName');
    setIsLoggedIn(false);
    setUserRole(null);
    setCurrentPage('home');
    window.history.pushState({ page: 'home' }, '', '/home');
  };

  const handleLoginSuccess = () => {
    const role = localStorage.getItem('authRole');
    setIsLoggedIn(true);
    setUserRole(role);
    if (role === 'ADMIN') {
      setCurrentPage('admin-dashboard');
      window.history.pushState({ page: 'admin-dashboard' }, '', '/admin-dashboard');
    } else if (role === 'RECRUTEUR') {
      setCurrentPage('employer-dashboard');
      window.history.pushState({ page: 'employer-dashboard' }, '', '/employer-dashboard');
    } else if (role === 'CANDIDAT') {
      setCurrentPage('candidate-dashboard');
      window.history.pushState({ page: 'candidate-dashboard' }, '', '/candidate-dashboard');
    } else {
      setCurrentPage('home');
      window.history.pushState({ page: 'home' }, '', '/home');
    }
  };

  const showNavbarAndFooter = !['login', 'signup', 'forgot-password'].includes(currentPage);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} isLoggedIn={isLoggedIn} userRole={userRole} />;
      case 'job-listings':
        return <JobListings onNavigate={handleNavigate} />;
      case 'job-detail':
        return <JobDetail jobId={selectedJobId} onNavigate={handleNavigate} />;
      case 'employer-dashboard':
      case 'manage-jobs':
        return <RecruiterDashboard onNavigate={handleNavigate} activePage={currentPage} />;
      case 'candidate-dashboard':
      case 'my-applications':
      case 'saved-jobs':
        return <CandidateDashboard onNavigate={handleNavigate} activePage={currentPage} />;
      case 'admin-dashboard':
        return userRole === 'ADMIN'
          ? <AdminDashboard onNavigate={handleNavigate} />
          : <Home onNavigate={handleNavigate} isLoggedIn={isLoggedIn} userRole={userRole} />;
      case 'job-application':
        return <JobApplication jobId={selectedJobId} onNavigate={handleNavigate} />;
      case 'login':
        return <Login onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />;
      case 'signup':
        return <Signup onNavigate={handleNavigate} />;
      case 'forgot-password':
        return <ForgotPassword onNavigate={handleNavigate} />;
      case 'post-job':
        return <PostJob onNavigate={handleNavigate} jobId={selectedJobId || undefined} />;
      case 'offer-candidates':
        return <OfferCandidates offerId={selectedJobId} onNavigate={handleNavigate} />;
      case 'profile':
      case 'recruiter-profile':
        return <ProfileEdit onNavigate={handleNavigate} />;
      default:
        return <Home onNavigate={handleNavigate} isLoggedIn={isLoggedIn} userRole={userRole} />;
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
      <main className="flex-1">{renderPage()}</main>
      {showNavbarAndFooter && (
        <Footer
          onNavigate={handleNavigate}
          isLoggedIn={isLoggedIn}
          userRole={userRole}
        />
      )}
      <ChatBot
        isOpen={chatOpen}
        onToggle={(v) => { setChatOpen(v); if (v) setTicketOpen(false); }}
      />
      {isLoggedIn && userRole === 'RECRUTEUR' && (
        <MessagingButton
          isOpen={ticketOpen}
          onToggle={(v) => { setTicketOpen(v); if (v) setChatOpen(false); }}
        />
      )}
    </div>
  );
}