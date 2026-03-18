import { MapPin, DollarSign, Briefcase, Clock, Bookmark } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Job } from '../lib/mockData';

interface JobCardProps {
  job: Job;
  onViewDetails: (jobId: string) => void;
  variant?: 'default' | 'compact';
}

export function JobCard({ job, onViewDetails, variant = 'default' }: JobCardProps) {
  return (
    <div className="bg-white border border-color rounded-xl p-6 hover:shadow-custom-lg transition-all duration-300 cursor-pointer group flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 
                className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors"
                onClick={() => onViewDetails(job.id)}
              >
                {job.title}
              </h3>
              <p className="text-secondary mb-3">{job.company}</p>
            </div>
            {job.featured && (
              <Badge className="bg-primary-light text-primary border-0 ml-4">
                Featured
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex items-center text-secondary text-sm">
              <MapPin className="h-4 w-4 mr-1.5 text-primary" />
              {job.location}
            </div>
            <div className="flex items-center text-secondary text-sm">
              <DollarSign className="h-4 w-4 mr-1.5 text-primary" />
              {job.salaryRange}
            </div>
            <div className="flex items-center text-secondary text-sm">
              <Briefcase className="h-4 w-4 mr-1.5 text-primary" />
              {job.type}
            </div>
            <div className="flex items-center text-secondary text-sm">
              <Clock className="h-4 w-4 mr-1.5 text-primary" />
              {job.postedDate}
            </div>
          </div>

          {variant === 'default' && (
            <div className="flex flex-wrap gap-2 mb-4">
              {job.skills.slice(0, 3).map((skill, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className="bg-surface text-secondary border-0"
                >
                  {skill}
                </Badge>
              ))}
              {job.skills.length > 3 && (
                <Badge 
                  variant="secondary"
                  className="bg-surface text-secondary border-0"
                >
                  +{job.skills.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 mt-auto">
        <Button 
          className="flex-1 bg-primary hover:bg-primary-hover text-white rounded-lg"
          onClick={() => onViewDetails(job.id)}
        >
          View Details
        </Button>
        <Button 
          variant="outline"
          size="icon"
          className="rounded-lg border-color hover:bg-primary-light hover:border-primary"
        >
          <Bookmark className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}