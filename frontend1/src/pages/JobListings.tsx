import { Search, MapPin, Filter, Briefcase, Clock, DollarSign, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { JobCard } from '../components/JobCard';
import { useState, useEffect } from 'react';
import { getAllOffres, OffreDTO } from '../api';

interface JobListingsProps {
  onNavigate: (page: string, jobId?: string) => void;
}

export function JobListings({ onNavigate }: JobListingsProps) {
  const [jobs, setJobs] = useState<OffreDTO[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<OffreDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // Charger les offres depuis le backend
  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const offres = await getAllOffres();
      setJobs(offres);
      setFilteredJobs(offres);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Appliquer les filtres
  useEffect(() => {
    let filtered = jobs;

    // Filtre par type de contrat
    if (typeFilter !== 'all') {
      filtered = filtered.filter(job => job.typeContrat === typeFilter);
    }

    // Filtre par recherche (titre ou description)
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par localisation
    if (locationFilter) {
      filtered = filtered.filter(job =>
        job.localisation.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  }, [searchTerm, locationFilter, typeFilter, jobs]);

  const jobTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'CDI', label: 'Full-time (CDI)' },
    { value: 'CDD', label: 'Contract (CDD)' },
    { value: 'Stage', label: 'Internship' },
    { value: 'Freelance', label: 'Freelance' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading jobs...</p>
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => onNavigate('home')}
          className="mb-6 text-secondary hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2">Find Your Dream Job</h1>
          <p className="text-secondary">
            Discover {filteredJobs.length} job opportunities matching your criteria
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-color p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search by keyword */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
              <Input
                type="text"
                placeholder="Job title or keyword"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 border-color rounded-lg"
              />
            </div>

            {/* Location filter */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
              <Input
                type="text"
                placeholder="City or region"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="pl-10 h-12 border-color rounded-lg"
              />
            </div>

            {/* Job type filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full h-12 pl-10 pr-3 border border-color rounded-lg bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
              >
                {jobTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results count and sort */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-secondary">
            Showing <span className="font-medium text-primary">{filteredJobs.length}</span> jobs
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-secondary">Sort by:</span>
            <select className="px-3 py-2 border border-color rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary">
              <option>Most Recent</option>
              <option>Most Relevant</option>
              <option>Salary: High to Low</option>
              <option>Salary: Low to High</option>
            </select>
          </div>
        </div>

        {/* Job Listings */}
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-color p-12 text-center">
            <Briefcase className="h-16 w-16 text-muted mx-auto mb-4" />
            <h3 className="mb-2">No jobs found</h3>
            <p className="text-secondary mb-6">
              Try adjusting your filters or search terms
            </p>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setLocationFilter('');
                setTypeFilter('all');
              }}
              className="bg-primary hover:bg-primary-hover text-white rounded-lg"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-xl border border-color p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onNavigate('job-detail', job.id.toString())}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  {job.active && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      Active
                    </span>
                  )}
                </div>

                <h3 className="mb-2 line-clamp-1">{job.titre}</h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-secondary">
                    <MapPin className="h-4 w-4 mr-2 text-primary" />
                    {job.localisation}
                  </div>
                  <div className="flex items-center text-sm text-secondary">
                    <Briefcase className="h-4 w-4 mr-2 text-primary" />
                    {job.typeContrat}
                  </div>
                  <div className="flex items-center text-sm text-secondary">
                    <Clock className="h-4 w-4 mr-2 text-primary" />
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <p className="text-sm text-secondary mb-4 line-clamp-2">
                  {job.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {job.competencesRequises.split(',').slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary-light text-primary text-xs rounded-lg"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>

                <Button 
                  className="w-full bg-primary hover:bg-primary-hover text-white rounded-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate('job-application', job.id.toString());
                  }}
                >
                  Apply Now
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}