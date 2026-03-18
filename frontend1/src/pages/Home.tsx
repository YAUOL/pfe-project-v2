import { Search, MapPin, Briefcase, Users, TrendingUp, Award } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { JobCard } from '../components/JobCard';
import { mockJobs } from '../lib/mockData';
import { useState } from 'react';

interface HomeProps {
  onNavigate: (page: string, jobId?: string) => void;
}

export function Home({ onNavigate }: HomeProps) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  const featuredJobs = mockJobs.filter(job => job.featured);

  const handleSearch = () => {
    onNavigate('job-listings');
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-blue-50 py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="mb-6 text-primary">Find Your Dream Job</h1>
          <p className="text-xl text-secondary mb-8 max-w-2xl mx-auto">
            Discover thousands of job opportunities with all the information you need.
            It's your future. Start exploring now.
          </p>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-custom-lg p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
                <Input
                  type="text"
                  placeholder="Job title, keywords, or company"
                  className="pl-10 h-12 border-color rounded-lg"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
                <Input
                  type="text"
                  placeholder="City, state, or remote"
                  className="pl-10 h-12 border-color rounded-lg"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                />
              </div>
              <Button
                onClick={handleSearch}
                className="h-12 px-8 bg-primary hover:bg-primary-hover text-white rounded-lg whitespace-nowrap"
              >
                Search Jobs
              </Button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button
              onClick={() => onNavigate('job-listings')}
              className="bg-primary hover:bg-primary-hover text-white rounded-lg px-8 py-6"
            >
              <Briefcase className="h-5 w-5 mr-2" />
              Browse Jobs
            </Button>
            <Button
              onClick={() => onNavigate('employer-dashboard')}
              variant="outline"
              className="border-primary text-primary hover:bg-primary-light rounded-lg px-8 py-6"
            >
              <Users className="h-5 w-5 mr-2" />
              Post a Job
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-surface">
              <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-3xl font-bold text-primary mb-2">10,000+</h3>
              <p className="text-secondary">Active Jobs</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-surface">
              <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-3xl font-bold text-primary mb-2">50,000+</h3>
              <p className="text-secondary">Registered Users</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-surface">
              <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-3xl font-bold text-primary mb-2">2,000+</h3>
              <p className="text-secondary">Companies</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-16 px-4 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="mb-4">Featured Job Openings</h2>
            <p className="text-secondary text-lg">
              Explore our hand-picked job opportunities from top companies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onViewDetails={(jobId) => onNavigate('job-detail', jobId)}
              />
            ))}
          </div>

          <div className="text-center">
            <Button
              onClick={() => onNavigate('job-listings')}
              variant="outline"
              className="border-primary text-primary hover:bg-primary-light rounded-lg px-8"
            >
              View All Jobs
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="mb-4">How It Works</h2>
            <p className="text-secondary text-lg">
              Get started in just a few simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-primary">1</span>
              </div>
              <h3 className="mb-3">Create Account</h3>
              <p className="text-secondary">
                Sign up for free and create your professional profile
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-primary">2</span>
              </div>
              <h3 className="mb-3">Search &amp; Apply</h3>
              <p className="text-secondary">
                Browse thousands of jobs and apply with one click
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-primary">3</span>
              </div>
              <h3 className="mb-3">Get Hired</h3>
              <p className="text-secondary">
                Connect with employers and land your dream job
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
