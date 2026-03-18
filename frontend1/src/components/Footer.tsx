import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface border-t border-color mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold">JB</span>
              </div>
              <span className="text-xl font-bold text-primary">JobBoard</span>
            </div>
            <p className="text-secondary mb-4">
              Find your dream job or hire the best talent. Connect employers with job seekers.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-secondary hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-secondary hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-secondary hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-secondary hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* For Job Seekers */}
          <div>
            <h3 className="font-semibold mb-4">For Job Seekers</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-secondary hover:text-primary transition-colors">
                  Browse Jobs
                </a>
              </li>
              <li>
                <a href="#" className="text-secondary hover:text-primary transition-colors">
                  Career Advice
                </a>
              </li>
              <li>
                <a href="#" className="text-secondary hover:text-primary transition-colors">
                  Resume Tips
                </a>
              </li>
              <li>
                <a href="#" className="text-secondary hover:text-primary transition-colors">
                  Saved Jobs
                </a>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h3 className="font-semibold mb-4">For Employers</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-secondary hover:text-primary transition-colors">
                  Post a Job
                </a>
              </li>
              <li>
                <a href="#" className="text-secondary hover:text-primary transition-colors">
                  Browse Candidates
                </a>
              </li>
              <li>
                <a href="#" className="text-secondary hover:text-primary transition-colors">
                  Pricing Plans
                </a>
              </li>
              <li>
                <a href="#" className="text-secondary hover:text-primary transition-colors">
                  Company Dashboard
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Mail className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-secondary">support@jobboard.com</span>
              </li>
              <li className="flex items-start">
                <Phone className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-secondary">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-secondary">123 Business Ave, Suite 100<br />New York, NY 10001</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-color mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-secondary text-sm">
            © {currentYear} JobBoard. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-secondary hover:text-primary text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-secondary hover:text-primary text-sm transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-secondary hover:text-primary text-sm transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
