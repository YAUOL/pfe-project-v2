import { MapPin, DollarSign, Briefcase, Clock, Bookmark } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useState } from 'react';

export interface JobCardData {
  id: string;
  title: string;
  company: string;
  location: string;
  salaryRange: string;
  type: string;
  postedDate: string;
  description: string;
  skills: string[];
  category: string;
  experienceLevel: string;
  featured?: boolean;
}

interface JobCardProps {
  job: JobCardData;
  onViewDetails: (jobId: string) => void;
  variant?: 'default' | 'compact';
}

export function JobCard({ job, onViewDetails, variant = 'default' }: JobCardProps) {
  const [isSaved, setIsSaved] = useState<boolean>(() => {
    const saved: string[] = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    return saved.includes(job.id);
  });
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 400);
    setIsSaved(prev => {
      const saved: string[] = JSON.parse(localStorage.getItem('savedJobs') || '[]');
      const updated = prev
        ? saved.filter(id => id !== job.id)
        : [...saved, job.id];
      localStorage.setItem('savedJobs', JSON.stringify(updated));
      return !prev;
    });
  };

  return (
    <>
      <style>{`
        @keyframes bm-save {
          0%   { transform: scale(1); }
          35%  { transform: scale(1.55) rotate(-10deg); }
          65%  { transform: scale(0.88) rotate(5deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes bm-unsave {
          0%   { transform: scale(1); }
          40%  { transform: scale(0.55); }
          100% { transform: scale(1); }
        }
        .bm-save-anim   { animation: bm-save   0.4s cubic-bezier(.36,.07,.19,.97) both; }
        .bm-unsave-anim { animation: bm-unsave  0.3s ease both; }
      `}</style>

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
                  <Badge key={index} variant="secondary" className="bg-surface text-secondary border-0">
                    {skill}
                  </Badge>
                ))}
                {job.skills.length > 3 && (
                  <Badge variant="secondary" className="bg-surface text-secondary border-0">
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
            onClick={handleSave}
            title={isSaved ? 'Remove from saved' : 'Save job'}
            className={`rounded-lg border-color transition-all duration-200 ${
              isSaved
                ? 'bg-primary-light border-primary'
                : 'hover:bg-primary-light hover:border-primary'
            }`}
          >
            <Bookmark
              key={isAnimating ? 'anim' : 'idle'}
              className={`h-4 w-4 transition-colors duration-200 ${
                isAnimating
                  ? isSaved ? 'bm-unsave-anim' : 'bm-save-anim'
                  : ''
              }`}
              style={{
                color: isSaved ? '#2563eb' : '#94a3b8',
                fill: isSaved ? '#2563eb' : 'none',
              }}
            />
          </Button>
        </div>
      </div>
    </>
  );
}