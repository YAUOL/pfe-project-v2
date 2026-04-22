import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string, jobId?: string) => void;
  isLoggedIn: boolean;
  userRole: string | null;
}

export function Footer({ onNavigate, isLoggedIn, userRole }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const go = (page: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onNavigate(page);
  };

  const isCandidate = userRole === 'CANDIDAT';
  const isRecruiter = userRole === 'RECRUTEUR';
  const recruiterLocked = isLoggedIn && isCandidate;
  const candidateLocked = isLoggedIn && isRecruiter;

  const active = "text-sm text-left text-secondary hover:text-primary transition-colors";
  const locked = "text-sm text-left text-secondary/30 cursor-not-allowed select-none";

  return (
    <footer className="bg-surface border-t border-color mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand */}
          <div>
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold">JB</span>
              </div>
              <span className="text-xl font-bold text-primary">JobBoard</span>
            </div>
            <p className="text-secondary mb-4">
              Find your dream job or hire the best talent.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com" target="_blank" rel="noreferrer" className="text-secondary hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://www.twitter.com" target="_blank" rel="noreferrer" className="text-secondary hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" className="text-secondary hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noreferrer" className="text-secondary hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* For Job Seekers */}
          <div>
            <h3 className={`font-semibold mb-4 ${candidateLocked ? 'opacity-30' : ''}`}>For Job Seekers</h3>
            <ul className="space-y-2">
              <li>
                <button type="button" disabled={candidateLocked} onClick={() => !candidateLocked && go('job-listings')} className={candidateLocked ? locked : active}>
                  Browse Jobs
                </button>
              </li>
              <li>
                <button type="button" disabled={candidateLocked} onClick={() => !candidateLocked && go('home')} className={candidateLocked ? locked : active}>
                  Career Advice
                </button>
              </li>
              <li>
                <button type="button" disabled={candidateLocked} onClick={() => !candidateLocked && go(isCandidate ? 'profile' : 'login')} className={candidateLocked ? locked : active}>
                  Resume Tips
                </button>
              </li>
              <li>
                <button type="button" disabled={candidateLocked} onClick={() => !candidateLocked && go(isCandidate ? 'saved-jobs' : 'login')} className={candidateLocked ? locked : active}>
                  Saved Jobs
                </button>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h3 className={`font-semibold mb-4 ${recruiterLocked ? 'opacity-30' : ''}`}>For Employers</h3>
            <ul className="space-y-2">
              <li>
                <button type="button" disabled={recruiterLocked} onClick={() => !recruiterLocked && go(isRecruiter ? 'post-job' : 'login')} className={recruiterLocked ? locked : active}>
                  Post a Job
                </button>
              </li>
              <li>
                <button type="button" disabled={recruiterLocked} onClick={() => !recruiterLocked && go(isRecruiter ? 'employer-dashboard' : 'login')} className={recruiterLocked ? locked : active}>
                  Browse Candidates
                </button>
              </li>
              <li>
                <button type="button" disabled={recruiterLocked} onClick={() => !recruiterLocked && go('home')} className={recruiterLocked ? locked : active}>
                  Pricing Plans
                </button>
              </li>
              <li>
                <button type="button" disabled={recruiterLocked} onClick={() => !recruiterLocked && go(isRecruiter ? 'employer-dashboard' : 'login')} className={recruiterLocked ? locked : active}>
                  Company Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Mail className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0" />
                <a href="mailto:support@jobboard.com" className="text-secondary hover:text-primary transition-colors">
                  support@jobboard.com
                </a>
              </li>
              <li className="flex items-start">
                <Phone className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0" />
                <a href="tel:+15551234567" className="text-secondary hover:text-primary transition-colors">
                  73325001
                </a>
              </li>
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0" />
                <a href="https://maps.app.goo.gl/2BywoChTq4ivh1Ct6" target="_blank" rel="noreferrer" className="text-secondary hover:text-primary transition-colors">
                  2nd floor B1, El Hamd Residence, Rue d'Algérie, Sousse 4011
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-color mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-secondary text-sm">© {currentYear} JobBoard. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <button type="button" onClick={() => go('home')} className="text-secondary hover:text-primary text-sm transition-colors">Privacy Policy</button>
            <button type="button" onClick={() => go('home')} className="text-secondary hover:text-primary text-sm transition-colors">Terms of Service</button>
            <button type="button" onClick={() => go('home')} className="text-secondary hover:text-primary text-sm transition-colors">Cookie Policy</button>
          </div>
        </div>
      </div>
    </footer>
  );
}