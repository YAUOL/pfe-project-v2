// //**import { useState } from 'react';
// import {
//     LayoutDashboard,
//     Briefcase,
//     Upload,
//     Brain,
//     Users,
//     LogOut,
//     Menu,
//     X,
//     TrendingUp,
//     Search,
//     ChevronDown,
//     CheckCircle,
//     XCircle,
//     Clock,
//     Star,
//     Eye,
//     Download,
//     MoreVertical,
//     Zap,
//     PlusCircle,
// } from 'lucide-react';
// import { Button } from '../components/ui/button';
// import { Badge } from '../components/ui/badge';
// import {
//     Table,
//     TableBody,
//     TableCell,
//     TableHead,
//     TableHeader,
//     TableRow,
// } from '../components/ui/table';
// import {
//     DropdownMenu,
//     DropdownMenuContent,
//     DropdownMenuItem,
//     DropdownMenuTrigger,
// } from '../components/ui/dropdown-menu';

// interface HireTalentDashboardProps {
//     onNavigate: (page: string) => void;
// }

// // ── Mock Data ──────────────────────────────────────────────────────────────────

// const jobOffers = [
//     { id: 1, title: 'Développeur Full Stack', applications: 14, active: true },
//     { id: 2, title: 'Data Scientist', applications: 9, active: true },
//     { id: 3, title: 'Ingénieur DevOps', applications: 6, active: true },
//     { id: 4, title: 'UX Designer', applications: 11, active: false },
// ];

// const candidatesByJob: Record<
//     number,
//     { name: string; email: string; score: number; skills: string[] }[]
// > = {
//     1: [
//         { name: 'Lucas Petit', email: 'lucas.petit@email.com', score: 91, skills: ['React', 'Node.js', 'TypeScript'] },
//         { name: 'Marie Martin', email: 'marie.martin@email.com', score: 87, skills: ['Vue.js', 'Python', 'Docker'] },
//         { name: 'Thomas Bernard', email: 'thomas.bernard@email.com', score: 72, skills: ['Angular', 'Java', 'SQL'] },
//         { name: 'Sophie Dubois', email: 'sophie.dubois@email.com', score: 65, skills: ['React', 'CSS', 'GraphQL'] },
//         { name: 'Emma Leroy', email: 'emma.leroy@email.com', score: 58, skills: ['HTML', 'CSS', 'JS'] },
//     ],
//     2: [
//         { name: 'Thomas Bernard', email: 'thomas.bernard@email.com', score: 88, skills: ['Python', 'TensorFlow', 'SQL'] },
//         { name: 'Lucas Petit', email: 'lucas.petit@email.com', score: 75, skills: ['Python', 'Pandas', 'Scikit-learn'] },
//         { name: 'Marie Martin', email: 'marie.martin@email.com', score: 70, skills: ['R', 'ML', 'Statistics'] },
//         { name: 'Sophie Dubois', email: 'sophie.dubois@email.com', score: 62, skills: ['Python', 'NumPy', 'Jupyter'] },
//         { name: 'Emma Leroy', email: 'emma.leroy@email.com', score: 45, skills: ['Excel', 'SQL', 'Power BI'] },
//     ],
//     3: [
//         { name: 'Marie Martin', email: 'marie.martin@email.com', score: 94, skills: ['Docker', 'Kubernetes', 'CI/CD'] },
//         { name: 'Sophie Dubois', email: 'sophie.dubois@email.com', score: 80, skills: ['AWS', 'Terraform', 'Linux'] },
//         { name: 'Lucas Petit', email: 'lucas.petit@email.com', score: 68, skills: ['Jenkins', 'Git', 'Ansible'] },
//         { name: 'Thomas Bernard', email: 'thomas.bernard@email.com', score: 55, skills: ['Bash', 'Python', 'Nginx'] },
//         { name: 'Emma Leroy', email: 'emma.leroy@email.com', score: 42, skills: ['Linux', 'Git', 'Docker'] },
//     ],
//     4: [
//         { name: 'Emma Leroy', email: 'emma.leroy@email.com', score: 96, skills: ['Figma', 'UX Research', 'Wireframing'] },
//         { name: 'Sophie Dubois', email: 'sophie.dubois@email.com', score: 83, skills: ['Figma', 'Adobe XD', 'Prototyping'] },
//         { name: 'Marie Martin', email: 'marie.martin@email.com', score: 61, skills: ['Design Systems', 'CSS', 'A11y'] },
//         { name: 'Lucas Petit', email: 'lucas.petit@email.com', score: 47, skills: ['Sketch', 'InVision', 'Zeplin'] },
//         { name: 'Thomas Bernard', email: 'thomas.bernard@email.com', score: 38, skills: ['Photoshop', 'Illustrator'] },
//     ],
// };

// const recentApplications = [
//     { name: 'Lucas Petit', job: 'Développeur Full Stack', time: 'il y a 2h', status: 'Nouveau', score: 91 },
//     { name: 'Marie Martin', job: 'Ingénieur DevOps', time: 'il y a 5h', status: 'Examiné', score: 94 },
//     { name: 'Thomas Bernard', job: 'Data Scientist', time: 'il y a 1j', status: 'Nouveau', score: 88 },
//     { name: 'Emma Leroy', job: 'UX Designer', time: 'il y a 2j', status: 'Sélectionné', score: 96 },
//     { name: 'Sophie Dubois', job: 'Développeur Full Stack', time: 'il y a 3j', status: 'Rejeté', score: 65 },
// ];

// // ── Helpers ────────────────────────────────────────────────────────────────────

// function scoreTextColor(score: number) {
//     if (score >= 85) return 'text-green-600';
//     if (score >= 65) return 'text-blue-600';
//     if (score >= 50) return 'text-orange-500';
//     return 'text-red-500';
// }

// function scoreBarColor(score: number) {
//     if (score >= 85) return 'bg-green-500';
//     if (score >= 65) return 'bg-blue-500';
//     if (score >= 50) return 'bg-orange-400';
//     return 'bg-red-400';
// }

// function scoreBadge(score: number): { label: string; cls: string } {
//     if (score >= 85) return { label: 'Excellent', cls: 'bg-green-100 text-green-700' };
//     if (score >= 65) return { label: 'Bon', cls: 'bg-blue-100 text-blue-700' };
//     if (score >= 50) return { label: 'Moyen', cls: 'bg-orange-100 text-orange-700' };
//     return { label: 'Faible', cls: 'bg-red-100 text-red-700' };
// }

// function statusIcon(status: string) {
//     if (status === 'Sélectionné') return <CheckCircle className="h-4 w-4 text-green-600" />;
//     if (status === 'Rejeté') return <XCircle className="h-4 w-4 text-red-500" />;
//     if (status === 'Examiné') return <Clock className="h-4 w-4 text-yellow-500" />;
//     return <Star className="h-4 w-4 text-blue-500" />;
// }

// function statusBadgeCls(status: string) {
//     if (status === 'Sélectionné') return 'bg-green-100 text-green-700';
//     if (status === 'Rejeté') return 'bg-red-100 text-red-700';
//     if (status === 'Examiné') return 'bg-yellow-100 text-yellow-700';
//     return 'bg-blue-100 text-blue-700';
// }

// function initials(name: string) {
//     return name.split(' ').map(n => n[0]).join('');
// }

// // ── Sidebar menu items ─────────────────────────────────────────────────────────

// const menuItems = [
//     { icon: LayoutDashboard, label: 'Tableau de bord', key: 'dashboard' },
//     { icon: PlusCircle, label: "Publier une offre", key: 'post-job' },
//     { icon: Upload, label: 'Gérer les CVs', key: 'cv-management' },
//     { icon: Brain, label: 'Scores candidats', key: 'candidate-scores' },
// ];

// // ── Component ──────────────────────────────────────────────────────────────────

// export function HireTalentDashboard({ onNavigate }: HireTalentDashboardProps) {
//     const [activePage, setActivePage] = useState('dashboard');
//     const [mobileOpen, setMobileOpen] = useState(false);
//     const [selectedJobId, setSelectedJobId] = useState(1);
//     const [search, setSearch] = useState('');
//     const [dragOver, setDragOver] = useState(false);

//     const candidates = candidatesByJob[selectedJobId] ?? [];
//     const filtered = candidates.filter(
//         c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
//     );

//     const allScores = Object.values(candidatesByJob).flat().map(c => c.score);
//     const avgScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
//     const totalCVs = allScores.length;
//     const uniqueCandidates = new Set(Object.values(candidatesByJob).flat().map(c => c.name)).size;

//     // ── Sidebar ────────────────────────────────────────────────────────────────
//     const SidebarContent = () => (
//         <>
//             {/* Brand */}
//             <div className="p-6 border-b border-color">
//                 <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
//                         <Brain className="h-5 w-5 text-white" />
//                     </div>
//                     <div>
//                         <p className="font-bold text-sm">Hire Talent</p>
//                         <p className="text-xs text-secondary">Portail Recruteur</p>
//                     </div>
//                 </div>
//             </div>

//             {/* Nav */}
//             <nav className="flex-1 p-4">
//                 <ul className="space-y-1">
//                     {menuItems.map(item => {
//                         const Icon = item.icon;
//                         const active = activePage === item.key;
//                         return (
//                             <li key={item.key}>
//                                 <button
//                                     onClick={() => { setActivePage(item.key); setMobileOpen(false); }}
//                                     className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${active
//                                             ? 'bg-primary-light text-primary font-semibold'
//                                             : 'text-secondary hover:bg-surface hover:text-primary'
//                                         }`}
//                                 >
//                                     <Icon className="h-5 w-5 flex-shrink-0" />
//                                     {item.label}
//                                 </button>
//                             </li>
//                         );
//                     })}
//                 </ul>
//             </nav>

//             {/* Footer */}
//             <div className="p-4 border-t border-color">
//                 <Button
//                     variant="ghost"
//                     className="w-full justify-start text-secondary hover:text-primary hover:bg-surface text-sm"
//                     onClick={() => onNavigate('home')}
//                 >
//                     <LogOut className="h-5 w-5 mr-3" />
//                     Quitter
//                 </Button>
//             </div>
//         </>
//     );

//     // ── Main content ───────────────────────────────────────────────────────────
//     return (
//         <div className="flex min-h-screen bg-surface">

//             {/* Mobile toggle */}
//             <button
//                 className="lg:hidden fixed top-4 left-4 z-50 bg-white border border-color rounded-lg p-2 shadow-md"
//                 onClick={() => setMobileOpen(o => !o)}
//             >
//                 {mobileOpen ? <X className="h-5 w-5 text-secondary" /> : <Menu className="h-5 w-5 text-secondary" />}
//             </button>

//             {/* Desktop sidebar */}
//             <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-color h-screen sticky top-0">
//                 <SidebarContent />
//             </aside>

//             {/* Mobile sidebar */}
//             {mobileOpen && (
//                 <>
//                     <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />
//                     <aside className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-color z-50 flex flex-col">
//                         <SidebarContent />
//                     </aside>
//                 </>
//             )}

//             {/* ── Page content ── */}
//             <main className="flex-1 p-4 lg:p-8 overflow-auto">
//                 <div className="max-w-7xl mx-auto">

//                     {/* Header */}
//                     <div className="mb-8">
//                         <h1 className="text-2xl font-bold mb-1">Tableau de bord Recruteur</h1>
//                         <p className="text-secondary text-sm">Matching IA · Analyse sémantique · Classement automatique des candidats</p>
//                     </div>

//                     {/* ── Stat cards ── */}
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//                         <div className="bg-white rounded-xl border border-color p-6">
//                             <div className="flex items-center justify-between mb-4">
//                                 <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
//                                     <Upload className="h-6 w-6 text-primary" />
//                                 </div>
//                                 <TrendingUp className="h-5 w-5 text-green-500" />
//                             </div>
//                             <p className="text-3xl font-bold mb-1">{totalCVs}</p>
//                             <p className="text-secondary text-sm">CVs importés</p>
//                         </div>

//                         <div className="bg-white rounded-xl border border-color p-6">
//                             <div className="flex items-center justify-between mb-4">
//                                 <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
//                                     <Briefcase className="h-6 w-6 text-purple-600" />
//                                 </div>
//                                 <TrendingUp className="h-5 w-5 text-green-500" />
//                             </div>
//                             <p className="text-3xl font-bold mb-1">{jobOffers.length}</p>
//                             <p className="text-secondary text-sm">Offres d'emploi</p>
//                         </div>

//                         <div className="bg-white rounded-xl border border-color p-6">
//                             <div className="flex items-center justify-between mb-4">
//                                 <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
//                                     <Brain className="h-6 w-6 text-green-600" />
//                                 </div>
//                                 <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">IA</span>
//                             </div>
//                             <p className="text-3xl font-bold mb-1">{avgScore}%</p>
//                             <p className="text-secondary text-sm">Score moyen IA</p>
//                         </div>

//                         <div className="bg-white rounded-xl border border-color p-6">
//                             <div className="flex items-center justify-between mb-4">
//                                 <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
//                                     <Users className="h-6 w-6 text-orange-600" />
//                                 </div>
//                                 <TrendingUp className="h-5 w-5 text-green-500" />
//                             </div>
//                             <p className="text-3xl font-bold mb-1">{uniqueCandidates}</p>
//                             <p className="text-secondary text-sm">Candidats classés</p>
//                         </div>
//                     </div>

//                     {/* ── Middle row ── */}
//                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

//                         {/* AI Matching Panel */}
//                         <div className="lg:col-span-2 bg-white rounded-xl border border-color p-6">
//                             <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
//                                 <div className="flex items-center gap-2">
//                                     <Zap className="h-5 w-5 text-primary" />
//                                     <h2 className="text-base font-semibold">Matching IA — Classement candidats</h2>
//                                 </div>

//                                 {/* Job picker */}
//                                 <div className="relative">
//                                     <select
//                                         value={selectedJobId}
//                                         onChange={e => setSelectedJobId(Number(e.target.value))}
//                                         className="appearance-none bg-surface border border-color rounded-lg pl-4 pr-9 py-2 text-sm font-medium text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
//                                     >
//                                         {jobOffers.map(j => (
//                                             <option key={j.id} value={j.id}>{j.title}</option>
//                                         ))}
//                                     </select>
//                                     <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary pointer-events-none" />
//                                 </div>
//                             </div>

//                             {/* Search */}
//                             <div className="relative mb-4">
//                                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary" />
//                                 <input
//                                     type="text"
//                                     placeholder="Rechercher un candidat..."
//                                     value={search}
//                                     onChange={e => setSearch(e.target.value)}
//                                     className="w-full bg-surface border border-color rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
//                                 />
//                             </div>

//                             {/* Ranked list */}
//                             <div className="space-y-3">
//                                 {filtered.map((c, i) => {
//                                     const badge = scoreBadge(c.score);
//                                     return (
//                                         <div key={c.name} className="flex items-center gap-4 p-4 bg-surface rounded-lg hover:bg-primary-light/40 transition-colors">
//                                             {/* Rank */}
//                                             <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
//                                                 <span className="text-xs font-bold text-primary">#{i + 1}</span>
//                                             </div>
//                                             {/* Avatar */}
//                                             <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
//                                                 <span className="text-white text-xs font-bold">{initials(c.name)}</span>
//                                             </div>
//                                             {/* Info */}
//                                             <div className="flex-1 min-w-0">
//                                                 <p className="font-semibold text-sm truncate">{c.name}</p>
//                                                 <p className="text-xs text-secondary truncate">{c.email}</p>
//                                                 <div className="flex flex-wrap gap-1 mt-1">
//                                                     {c.skills.map(s => (
//                                                         <span key={s} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{s}</span>
//                                                     ))}
//                                                 </div>
//                                             </div>
//                                             {/* Score */}
//                                             <div className="flex flex-col items-end gap-1 min-w-[110px]">
//                                                 <div className="flex items-center gap-2">
//                                                     <span className={`text-lg font-bold ${scoreTextColor(c.score)}`}>{c.score}%</span>
//                                                     <Badge className={`${badge.cls} border-0 text-xs`}>{badge.label}</Badge>
//                                                 </div>
//                                                 <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
//                                                     <div className={`h-full rounded-full ${scoreBarColor(c.score)}`} style={{ width: `${c.score}%` }} />
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     );
//                                 })}
//                                 {filtered.length === 0 && (
//                                     <p className="text-center text-secondary py-8 text-sm">Aucun candidat trouvé.</p>
//                                 )}
//                             </div>
//                         </div>

//                         {/* Right column */}
//                         <div className="space-y-6">
//                             {/* CV Upload */}
//                             <div className="bg-white rounded-xl border border-color p-6">
//                                 <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm">
//                                     <Upload className="h-4 w-4 text-primary" />
//                                     Importer un CV
//                                 </h3>
//                                 <div
//                                     onDragOver={e => { e.preventDefault(); setDragOver(true); }}
//                                     onDragLeave={() => setDragOver(false)}
//                                     onDrop={e => { e.preventDefault(); setDragOver(false); }}
//                                     className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${dragOver ? 'border-primary bg-primary-light' : 'border-color hover:border-primary hover:bg-primary-light/30'
//                                         }`}
//                                 >
//                                     <Upload className={`h-8 w-8 mx-auto mb-3 ${dragOver ? 'text-primary' : 'text-secondary'}`} />
//                                     <p className="text-sm font-medium mb-1">Glissez-déposez un CV</p>
//                                     <p className="text-xs text-secondary mb-3">PDF ou texte · max 5 MB</p>
//                                     <Button size="sm" className="bg-primary hover:bg-primary-hover text-white rounded-lg">
//                                         Choisir un fichier
//                                     </Button>
//                                 </div>
//                             </div>

//                             {/* Offres publiées */}
//                             <div className="bg-white rounded-xl border border-color p-6">
//                                 <h3 className="font-semibold mb-4 text-sm flex items-center gap-2">
//                                     <Briefcase className="h-4 w-4 text-primary" />
//                                     Offres actives
//                                 </h3>
//                                 <div className="space-y-3">
//                                     {jobOffers.map(j => (
//                                         <div key={j.id} className="flex items-center justify-between text-sm">
//                                             <span className="text-secondary truncate mr-2">{j.title}</span>
//                                             <div className="flex items-center gap-2 flex-shrink-0">
//                                                 <span className="font-semibold text-primary">{j.applications}</span>
//                                                 <Badge className={`border-0 text-xs ${j.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
//                                                     {j.active ? 'Actif' : 'Fermé'}
//                                                 </Badge>
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>

//                             {/* How AI works */}
//                             <div className="bg-primary-light rounded-xl p-6">
//                                 <h3 className="font-semibold mb-3 text-primary text-sm flex items-center gap-2">
//                                     <Zap className="h-4 w-4" />
//                                     Comment fonctionne l'IA ?
//                                 </h3>
//                                 <ul className="space-y-2 text-xs text-secondary">
//                                     {[
//                                         'Extraction du texte (PDF / texte)',
//                                         'Nettoyage & preprocessing',
//                                         'Embeddings sémantiques IA',
//                                         'Comparaison CV ↔ offre',
//                                         'Score de similarité & classement',
//                                     ].map(step => (
//                                         <li key={step} className="flex items-start gap-2">
//                                             <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
//                                             {step}
//                                         </li>
//                                     ))}
//                                 </ul>
//                             </div>
//                         </div>
//                     </div>

//                     {/* ── Recent applications table ── */}
//                     <div className="bg-white rounded-xl border border-color p-6">
//                         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
//                             <div>
//                                 <h2 className="text-base font-semibold mb-1">Candidatures récentes</h2>
//                                 <p className="text-secondary text-sm">Avec scores de matching IA calculés automatiquement</p>
//                             </div>
//                             <Button variant="outline" size="sm" className="border-color rounded-lg">
//                                 <Eye className="h-4 w-4 mr-2" />
//                                 Voir tout
//                             </Button>
//                         </div>

//                         <div className="overflow-x-auto">
//                             <Table>
//                                 <TableHeader>
//                                     <TableRow>
//                                         <TableHead>Candidat</TableHead>
//                                         <TableHead>Offre</TableHead>
//                                         <TableHead className="text-center">Score IA</TableHead>
//                                         <TableHead>Statut</TableHead>
//                                         <TableHead>Date</TableHead>
//                                         <TableHead className="text-right">Actions</TableHead>
//                                     </TableRow>
//                                 </TableHeader>
//                                 <TableBody>
//                                     {recentApplications.map((app, i) => (
//                                         <TableRow key={i}>
//                                             <TableCell>
//                                                 <div className="flex items-center gap-3">
//                                                     <div className="w-9 h-9 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0">
//                                                         <span className="text-xs font-bold text-primary">{initials(app.name)}</span>
//                                                     </div>
//                                                     <p className="font-medium text-sm">{app.name}</p>
//                                                 </div>
//                                             </TableCell>
//                                             <TableCell className="text-sm text-secondary">{app.job}</TableCell>
//                                             <TableCell className="text-center">
//                                                 <div className="flex flex-col items-center gap-1">
//                                                     <span className={`font-bold text-sm ${scoreTextColor(app.score)}`}>{app.score}%</span>
//                                                     <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
//                                                         <div className={`h-full rounded-full ${scoreBarColor(app.score)}`} style={{ width: `${app.score}%` }} />
//                                                     </div>
//                                                 </div>
//                                             </TableCell>
//                                             <TableCell>
//                                                 <div className="flex items-center gap-2">
//                                                     {statusIcon(app.status)}
//                                                     <Badge className={`${statusBadgeCls(app.status)} border-0 text-xs`}>{app.status}</Badge>
//                                                 </div>
//                                             </TableCell>
//                                             <TableCell className="text-secondary text-sm">{app.time}</TableCell>
//                                             <TableCell className="text-right">
//                                                 <DropdownMenu>
//                                                     <DropdownMenuTrigger asChild>
//                                                         <Button variant="ghost" size="icon">
//                                                             <MoreVertical className="h-4 w-4" />
//                                                         </Button>
//                                                     </DropdownMenuTrigger>
//                                                     <DropdownMenuContent align="end">
//                                                         <DropdownMenuItem>
//                                                             <Eye className="h-4 w-4 mr-2" /> Voir le CV
//                                                         </DropdownMenuItem>
//                                                         <DropdownMenuItem>
//                                                             <Download className="h-4 w-4 mr-2" /> Télécharger
//                                                         </DropdownMenuItem>
//                                                         <DropdownMenuItem>
//                                                             <CheckCircle className="h-4 w-4 mr-2" /> Sélectionner
//                                                         </DropdownMenuItem>
//                                                         <DropdownMenuItem className="text-red-600">
//                                                             <XCircle className="h-4 w-4 mr-2" /> Rejeter
//                                                         </DropdownMenuItem>
//                                                     </DropdownMenuContent>
//                                                 </DropdownMenu>
//                                             </TableCell>
//                                         </TableRow>
//                                     ))}
//                                 </TableBody>
//                             </Table>
//                         </div>
//                     </div>

//                 </div>
//             </main>
//         </div>
//     );
// }
