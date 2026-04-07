import { Search, MapPin, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { JobCard, JobCardData } from '../components/JobCard';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { Slider } from '../components/ui/slider';
import { useState, useEffect } from 'react';
import { getAllOffres, OffreDTO } from '../api';

interface JobListingsProps {
  onNavigate: (page: string, jobId?: string) => void;
}

export function JobListings({ onNavigate }: JobListingsProps) {
  const [jobs, setJobs] = useState<OffreDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  const [salaryRange, setSalaryRange] = useState([0]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const offres = await getAllOffres();
      setJobs(offres.filter(job => job.active));
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const handleExperienceChange = (level: string) => {
    setSelectedExperience(prev =>
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedCategories([]);
    setSelectedExperience([]);
    setSalaryRange([0]);
    setSearchKeyword('');
    setSearchLocation('');
  };

  const jobTypes = ['CDI', 'CDD', 'Stage', 'Freelance'];
  const jobCategories = ['Tech', 'Design', 'Marketing', 'Management'];
  const experienceLevels = ['Junior', 'Mid-Level', 'Senior'];

  const filteredJobs = jobs.filter(job => {
    if (
      searchKeyword &&
      !job.titre.toLowerCase().includes(searchKeyword.toLowerCase()) &&
      !job.description.toLowerCase().includes(searchKeyword.toLowerCase()) &&
      !job.company.toLowerCase().includes(searchKeyword.toLowerCase()) &&
      !job.competencesRequises.toLowerCase().includes(searchKeyword.toLowerCase())
    ) {
      return false;
    }

    if (
      searchLocation &&
      !job.localisation.toLowerCase().includes(searchLocation.toLowerCase())
    ) {
      return false;
    }

    if (selectedTypes.length > 0 && !selectedTypes.includes(job.typeContrat)) {
      return false;
    }

    if (selectedCategories.length > 0 && !selectedCategories.includes(job.category)) {
      return false;
    }

    if (selectedExperience.length > 0 && !selectedExperience.includes(job.experienceLevel)) {
      return false;
    }

    if (salaryRange[0] > 0 && job.salaryMax < salaryRange[0]) {
      return false;
    }

    return true;
  });

  const adaptedJobs: JobCardData[] = filteredJobs.map(job => ({
    id: job.id.toString(),
    title: job.titre,
    company: job.company,
    location: job.localisation,
    salaryRange: `$${job.salaryMin}k - $${job.salaryMax}k`,
    type:
      job.typeContrat === 'CDI'
        ? 'Full-time'
        : job.typeContrat === 'CDD'
        ? 'Contract'
        : job.typeContrat === 'Stage'
        ? 'Internship'
        : job.typeContrat,
    postedDate: new Date(job.createdAt).toLocaleDateString(),
    description: job.description,
    skills: job.competencesRequises
      .split(',')
      .map(skill => skill.trim())
      .filter(Boolean),
    category: job.category,
    experienceLevel: job.experienceLevel,
    featured: job.active,
  }));

  const FilterSidebar = () => (
    <div className="bg-white rounded-xl border border-color p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="flex items-center">
          <SlidersHorizontal className="h-5 w-5 mr-2 text-primary" />
          Filters
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-primary hover:text-primary-hover"
        >
          Clear All
        </Button>
      </div>

      <div className="mb-6">
        <h4 className="mb-3">Job Type</h4>
        <div className="space-y-3">
          {jobTypes.map((type) => (
            <div key={type} className="flex items-center">
              <Checkbox
                id={`type-${type}`}
                checked={selectedTypes.includes(type)}
                onCheckedChange={() => handleTypeChange(type)}
              />
              <Label htmlFor={`type-${type}`} className="ml-3 cursor-pointer text-secondary">
                {type === 'CDI'
                  ? 'Full-time'
                  : type === 'CDD'
                  ? 'Contract'
                  : type === 'Stage'
                  ? 'Internship'
                  : type}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h4 className="mb-3">Category</h4>
        <div className="space-y-3">
          {jobCategories.map((category) => (
            <div key={category} className="flex items-center">
              <Checkbox
                id={`category-${category}`}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => handleCategoryChange(category)}
              />
              <Label htmlFor={`category-${category}`} className="ml-3 cursor-pointer text-secondary">
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h4 className="mb-3">Experience Level</h4>
        <div className="space-y-3">
          {experienceLevels.map((level) => (
            <div key={level} className="flex items-center">
              <Checkbox
                id={`experience-${level}`}
                checked={selectedExperience.includes(level)}
                onCheckedChange={() => handleExperienceChange(level)}
              />
              <Label htmlFor={`experience-${level}`} className="ml-3 cursor-pointer text-secondary">
                {level}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h4 className="mb-3">Salary Range</h4>
        <div className="px-2">
          <Slider
            value={salaryRange}
            onValueChange={setSalaryRange}
            max={200}
            step={10}
            className="mb-2"
          />
          <div className="flex justify-between text-sm text-secondary">
            <span>$0k</span>
            <span>${salaryRange[0]}k+</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading jobs...</p>
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-custom-md p-6 mb-8">
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
            <Button className="h-12 px-8 bg-primary hover:bg-primary-hover text-white rounded-lg">
              Search
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:hidden">
            <Button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              variant="outline"
              className="w-full border-color rounded-lg"
            >
              <SlidersHorizontal className="h-5 w-5 mr-2" />
              {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>

          <aside className="hidden lg:block w-80 flex-shrink-0">
            <FilterSidebar />
          </aside>

          {showMobileFilters && (
            <div
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
              onClick={() => setShowMobileFilters(false)}
            >
              <div
                className="absolute right-0 top-0 bottom-0 w-80 bg-surface p-4 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3>Filters</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowMobileFilters(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <FilterSidebar />
              </div>
            </div>
          )}

          <main className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-secondary">
                Showing <span className="font-semibold text-primary">{adaptedJobs.length}</span> jobs
              </p>
            </div>

            <div className="space-y-6">
              {adaptedJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onViewDetails={(jobId) => onNavigate('job-detail', jobId)}
                />
              ))}
            </div>

            {adaptedJobs.length === 0 && (
              <div className="text-center py-16">
                <p className="text-secondary text-lg">No jobs found matching your criteria</p>
                <Button
                  onClick={clearFilters}
                  className="mt-4 bg-primary hover:bg-primary-hover text-white rounded-lg"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}