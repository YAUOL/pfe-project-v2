// import { DashboardSidebar } from '../components/DashboardSidebar';
// import { Briefcase, Users, Eye, TrendingUp, MoreVertical, Edit, Trash2 } from 'lucide-react';
// import { Button } from '../components/ui/button';
// import { Badge } from '../components/ui/badge';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '../components/ui/table';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from '../components/ui/dropdown-menu';

// interface EmployerDashboardProps {
//   onNavigate: (page: string) => void;
// }

// export function EmployerDashboard({ onNavigate }: EmployerDashboardProps) {
//   const postedJobs = [
//     {
//       id: '1',
//       title: 'Senior Frontend Developer',
//       status: 'Active',
//       applications: 45,
//       views: 230,
//       posted: '2025-11-20',
//     },
//     {
//       id: '2',
//       title: 'Product Designer',
//       status: 'Active',
//       applications: 32,
//       views: 180,
//       posted: '2025-11-18',
//     },
//     {
//       id: '3',
//       title: 'Marketing Manager',
//       status: 'Closed',
//       applications: 58,
//       views: 340,
//       posted: '2025-11-10',
//     },
//     {
//       id: '4',
//       title: 'DevOps Engineer',
//       status: 'Active',
//       applications: 28,
//       views: 150,
//       posted: '2025-11-15',
//     },
//   ];

//   const getStatusColor = (status: string) => {
//     return status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700';
//   };

//   return (
//     <div className="flex">
//       <DashboardSidebar
//         userType="Recruteur"
//         activePage="employer-dashboard"
//         onNavigate={onNavigate}
//         onLogout={() => onNavigate('home')}
//       />

//       <main className="flex-1 bg-surface min-h-screen p-4 lg:p-8">
//         <div className="max-w-7xl mx-auto">
//           {/* Header */}
//           <div className="mb-8">
//             <h1 className="mb-2">Employer Dashboard</h1>
//             <p className="text-secondary">Manage your job postings and track applications</p>
//           </div>

//           {/* Stats Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//             <div className="bg-white rounded-xl border border-color p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
//                   <Briefcase className="h-6 w-6 text-primary" />
//                 </div>
//                 <TrendingUp className="h-5 w-5 text-green-500" />
//               </div>
//               <h3 className="text-3xl font-bold mb-1">12</h3>
//               <p className="text-secondary text-sm">Total Jobs Posted</p>
//             </div>

//             <div className="bg-white rounded-xl border border-color p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
//                   <Users className="h-6 w-6 text-green-600" />
//                 </div>
//                 <TrendingUp className="h-5 w-5 text-green-500" />
//               </div>
//               <h3 className="text-3xl font-bold mb-1">163</h3>
//               <p className="text-secondary text-sm">Applications Received</p>
//             </div>

//             <div className="bg-white rounded-xl border border-color p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
//                   <Eye className="h-6 w-6 text-purple-600" />
//                 </div>
//                 <TrendingUp className="h-5 w-5 text-green-500" />
//               </div>
//               <h3 className="text-3xl font-bold mb-1">900</h3>
//               <p className="text-secondary text-sm">Total Views</p>
//             </div>

//             <div className="bg-white rounded-xl border border-color p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
//                   <Briefcase className="h-6 w-6 text-orange-600" />
//                 </div>
//                 <span className="text-sm font-medium text-green-600">Active</span>
//               </div>
//               <h3 className="text-3xl font-bold mb-1">8</h3>
//               <p className="text-secondary text-sm">Active Job Posts</p>
//             </div>
//           </div>

//           {/* Posted Jobs Table */}
//           <div className="bg-white rounded-xl border border-color p-6">
//             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
//               <div>
//                 <h2 className="mb-1">Posted Jobs</h2>
//                 <p className="text-secondary text-sm">Manage and track your job postings</p>
//               </div>
//               <Button 
//                 onClick={() => onNavigate('post-job')}
//                 className="bg-primary hover:bg-primary-hover text-white rounded-lg"
//               >
//                 <Briefcase className="h-4 w-4 mr-2" />
//                 Create New Job Post
//               </Button>
//             </div>

//             <div className="overflow-x-auto">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Job Title</TableHead>
//                     <TableHead>Status</TableHead>
//                     <TableHead className="text-center">Applications</TableHead>
//                     <TableHead className="text-center">Views</TableHead>
//                     <TableHead>Posted Date</TableHead>
//                     <TableHead className="text-right">Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {postedJobs.map((job) => (
//                     <TableRow key={job.id}>
//                       <TableCell className="font-medium">{job.title}</TableCell>
//                       <TableCell>
//                         <Badge className={`${getStatusColor(job.status)} border-0`}>
//                           {job.status}
//                         </Badge>
//                       </TableCell>
//                       <TableCell className="text-center">
//                         <span className="font-semibold text-primary">{job.applications}</span>
//                       </TableCell>
//                       <TableCell className="text-center">
//                         <span className="text-secondary">{job.views}</span>
//                       </TableCell>
//                       <TableCell className="text-secondary">
//                         {new Date(job.posted).toLocaleDateString()}
//                       </TableCell>
//                       <TableCell className="text-right">
//                         <DropdownMenu>
//                           <DropdownMenuTrigger asChild>
//                             <Button variant="ghost" size="icon">
//                               <MoreVertical className="h-4 w-4" />
//                             </Button>
//                           </DropdownMenuTrigger>
//                           <DropdownMenuContent align="end">
//                             <DropdownMenuItem>
//                               <Eye className="h-4 w-4 mr-2" />
//                               View Details
//                             </DropdownMenuItem>
//                             <DropdownMenuItem>
//                               <Edit className="h-4 w-4 mr-2" />
//                               Edit Job
//                             </DropdownMenuItem>
//                             <DropdownMenuItem className="text-red-600">
//                               <Trash2 className="h-4 w-4 mr-2" />
//                               Delete Job
//                             </DropdownMenuItem>
//                           </DropdownMenuContent>
//                         </DropdownMenu>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </div>
//           </div>

//           {/* Recent Applications */}
//           <div className="bg-white rounded-xl border border-color p-6 mt-8">
//             <h2 className="mb-6">Recent Applications</h2>
//             <div className="space-y-4">
//               {[
//                 { name: 'John Smith', job: 'Senior Frontend Developer', time: '2 hours ago', status: 'New' },
//                 { name: 'Sarah Johnson', job: 'Product Designer', time: '5 hours ago', status: 'Reviewed' },
//                 { name: 'Michael Brown', job: 'DevOps Engineer', time: '1 day ago', status: 'New' },
//                 { name: 'Emily Davis', job: 'Senior Frontend Developer', time: '2 days ago', status: 'Shortlisted' },
//               ].map((application, index) => (
//                 <div key={index} className="flex items-center justify-between p-4 bg-surface rounded-lg">
//                   <div className="flex items-center gap-4">
//                     <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
//                       <span className="font-semibold text-primary">
//                         {application.name.split(' ').map(n => n[0]).join('')}
//                       </span>
//                     </div>
//                     <div>
//                       <h4 className="mb-1">{application.name}</h4>
//                       <p className="text-sm text-secondary">{application.job}</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-4">
//                     <Badge className={`${
//                       application.status === 'New' ? 'bg-blue-100 text-blue-700' :
//                       application.status === 'Reviewed' ? 'bg-yellow-100 text-yellow-700' :
//                       'bg-green-100 text-green-700'
//                     } border-0`}>
//                       {application.status}
//                     </Badge>
//                     <span className="text-sm text-secondary">{application.time}</span>
//                     <Button variant="outline" size="sm" className="rounded-lg">
//                       View
//                     </Button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }
