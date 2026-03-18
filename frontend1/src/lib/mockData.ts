// Mock data for the job board application

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salaryRange: string;
  type: string;
  category: string;
  experienceLevel: string;
  description: string;
  skills: string[];
  postedDate: string;
  featured?: boolean;
  companyLogo?: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  appliedDate: string;
  status: 'Applied' | 'Shortlisted' | 'Rejected';
}

export const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'TechCorp Solutions',
    location: 'San Francisco, CA (Remote)',
    salaryRange: '$120k - $160k',
    type: 'Full-time',
    category: 'Tech',
    experienceLevel: 'Senior',
    description: 'We are seeking an experienced Frontend Developer to join our dynamic team. You will be responsible for building responsive web applications using modern frameworks and technologies. The ideal candidate has a strong understanding of React, TypeScript, and modern CSS frameworks.',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'GraphQL'],
    postedDate: '2 days ago',
    featured: true,
  },
  {
    id: '2',
    title: 'UX/UI Designer',
    company: 'Creative Studios Inc',
    location: 'New York, NY',
    salaryRange: '$90k - $120k',
    type: 'Full-time',
    category: 'Design',
    experienceLevel: 'Mid-Level',
    description: 'Join our creative team as a UX/UI Designer. You will work on designing intuitive and beautiful user interfaces for web and mobile applications. We are looking for someone passionate about user experience and visual design.',
    skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research'],
    postedDate: '3 days ago',
    featured: true,
  },
  {
    id: '3',
    title: 'Digital Marketing Manager',
    company: 'Growth Marketing Co',
    location: 'Austin, TX (Hybrid)',
    salaryRange: '$80k - $110k',
    type: 'Full-time',
    category: 'Marketing',
    experienceLevel: 'Mid-Level',
    description: 'We are looking for a Digital Marketing Manager to lead our online marketing campaigns. You will be responsible for SEO, SEM, content marketing, and social media strategies to drive growth and engagement.',
    skills: ['SEO', 'Google Analytics', 'Content Strategy', 'Social Media', 'PPC'],
    postedDate: '5 days ago',
    featured: true,
  },
  {
    id: '4',
    title: 'Full Stack Developer',
    company: 'StartupXYZ',
    location: 'Remote',
    salaryRange: '$100k - $140k',
    type: 'Full-time',
    category: 'Tech',
    experienceLevel: 'Mid-Level',
    description: 'Join our startup as a Full Stack Developer. You will work on both frontend and backend development, building scalable web applications. Experience with React, Node.js, and databases is required.',
    skills: ['React', 'Node.js', 'PostgreSQL', 'AWS', 'Docker'],
    postedDate: '1 week ago',
  },
  {
    id: '5',
    title: 'Product Manager',
    company: 'InnovateTech',
    location: 'Boston, MA',
    salaryRange: '$130k - $170k',
    type: 'Full-time',
    category: 'Management',
    experienceLevel: 'Senior',
    description: 'We are seeking an experienced Product Manager to lead product development initiatives. You will work closely with engineering, design, and business teams to define product strategy and roadmap.',
    skills: ['Product Strategy', 'Agile', 'User Stories', 'Analytics', 'Roadmapping'],
    postedDate: '3 days ago',
  },
  {
    id: '6',
    title: 'Data Scientist',
    company: 'DataCorp Analytics',
    location: 'Seattle, WA',
    salaryRange: '$110k - $150k',
    type: 'Full-time',
    category: 'Tech',
    experienceLevel: 'Mid-Level',
    description: 'Join our data science team to work on machine learning models and data analysis projects. You will analyze large datasets and develop predictive models to drive business decisions.',
    skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow', 'Statistics'],
    postedDate: '4 days ago',
  },
  {
    id: '7',
    title: 'Content Writer',
    company: 'MediaWorks',
    location: 'Remote',
    salaryRange: '$50k - $70k',
    type: 'Part-time',
    category: 'Marketing',
    experienceLevel: 'Entry-Level',
    description: 'We are looking for a talented Content Writer to create engaging content for our blog, website, and social media channels. Strong writing and research skills are essential.',
    skills: ['Copywriting', 'SEO', 'Content Strategy', 'Research', 'Editing'],
    postedDate: '1 week ago',
  },
  {
    id: '8',
    title: 'DevOps Engineer',
    company: 'CloudTech Systems',
    location: 'Denver, CO (Remote)',
    salaryRange: '$115k - $145k',
    type: 'Full-time',
    category: 'Tech',
    experienceLevel: 'Senior',
    description: 'We need a DevOps Engineer to manage our cloud infrastructure and CI/CD pipelines. Experience with AWS, Docker, and Kubernetes is required.',
    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'],
    postedDate: '2 days ago',
  },
];

export const mockApplications: Application[] = [
  {
    id: 'app1',
    jobId: '1',
    jobTitle: 'Senior Frontend Developer',
    company: 'TechCorp Solutions',
    appliedDate: '2025-11-20',
    status: 'Shortlisted',
  },
  {
    id: 'app2',
    jobId: '2',
    jobTitle: 'UX/UI Designer',
    company: 'Creative Studios Inc',
    appliedDate: '2025-11-18',
    status: 'Applied',
  },
  {
    id: 'app3',
    jobId: '4',
    jobTitle: 'Full Stack Developer',
    company: 'StartupXYZ',
    appliedDate: '2025-11-15',
    status: 'Rejected',
  },
];

export const jobCategories = [
  'Tech',
  'Design',
  'Marketing',
  'Management',
  'Sales',
  'Finance',
  'Operations',
  'Other',
];

export const jobTypes = ['Full-time', 'Part-time', 'Remote', 'Contract', 'Internship'];

export const experienceLevels = ['Entry-Level', 'Mid-Level', 'Senior', 'Lead'];
