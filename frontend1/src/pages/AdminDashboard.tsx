import { useEffect, useState, useRef } from 'react';
import { DashboardSidebar } from '../components/DashboardSidebar';
import {
  Users, Briefcase, ShieldCheck, TrendingUp,
  MoreVertical, Trash2, Mail, MapPin,
  MessageSquare, Send, Loader2, ChevronLeft, Search, Power, Lock, X
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  getAdminUsers, deleteAdminUser, getAdminOffres, adminDeactivateOffre,
  getAdminStats, getAllTickets, getTicketMessages, sendTicketMessage, closeTicket,
  AdminUser, OffreDTO, AdminStats, TicketDTO, TicketMessageDTO,
} from '../api';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [offres, setOffres] = useState<OffreDTO[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [candidateSearch, setCandidateSearch] = useState('');
  const [recruiterSearch, setRecruiterSearch] = useState('');

  const [tickets, setTickets] = useState<TicketDTO[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketDTO | null>(null);
  const [ticketMessages, setTicketMessages] = useState<TicketMessageDTO[]>([]);
  const [replyInput, setReplyInput] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [closingTicket, setClosingTicket] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const myId = parseInt(localStorage.getItem('authId') || '0');

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersData, offresData, statsData] = await Promise.all([
        getAdminUsers(),
        getAdminOffres(),
        getAdminStats(),
      ]);
      setUsers(usersData);
      setOffres(offresData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadTickets = async () => {
    try {
      const data = await getAllTickets();
      setTickets(data);
    } catch {
      // silent
    }
  };

  const loadTicketMessages = async (ticketId: number) => {
    try {
      setLoadingMessages(true);
      const data = await getTicketMessages(ticketId);
      setTicketMessages(data);
      setTimeout(() => {
        if (messagesRef.current) {
          messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
        }
      }, 50);
    } catch {
      // silent
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => { loadAdminData(); }, []);

  useEffect(() => {
    loadTickets();
    const interval = setInterval(loadTickets, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      loadTicketMessages(selectedTicket.id);
      const interval = setInterval(() => loadTicketMessages(selectedTicket.id), 10000);
      return () => clearInterval(interval);
    }
  }, [selectedTicket]);

  const handleSendReply = async () => {
    if (!replyInput.trim() || sendingReply || !selectedTicket) return;
    if (selectedTicket.status === 'CLOSED') return;
    setSendingReply(true);
    try {
      const msg = await sendTicketMessage(selectedTicket.id, replyInput.trim());
      setTicketMessages(prev => [...prev, msg]);
      setReplyInput('');
      setTimeout(() => {
        if (messagesRef.current) {
          messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
        }
      }, 50);
    } catch {
      // silent
    } finally {
      setSendingReply(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!selectedTicket || closingTicket) return;
    if (!window.confirm('Close this ticket? The recruiter will not be able to send more messages.')) return;
    setClosingTicket(true);
    try {
      const updated = await closeTicket(selectedTicket.id);
      setSelectedTicket(updated);
      setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
    } catch {
      // silent
    } finally {
      setClosingTicket(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteAdminUser(id);
      await loadAdminData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const handleDeactivateOffre = async (id: number) => {
    if (!window.confirm('Deactivate this offer? The recruiter will not be able to reactivate it.')) return;
    try {
      await adminDeactivateOffre(id);
      await loadAdminData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to deactivate offer');
    }
  };

  const formatTime = (sentAt: string) =>
    new Date(sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formatDate = (sentAt: string) =>
    new Date(sentAt).toLocaleDateString([], { day: 'numeric', month: 'short' });

  const openTickets = tickets.filter(t => t.status === 'OPEN');
  const closedTickets = tickets.filter(t => t.status === 'CLOSED');

  const candidates = users
    .filter(u => u.role === 'CANDIDAT')
    .filter(u =>
      `${u.prenom} ${u.nom}`.toLowerCase().includes(candidateSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(candidateSearch.toLowerCase())
    );

  const recruiters = users
    .filter(u => u.role === 'RECRUTEUR')
    .filter(u =>
      `${u.prenom} ${u.nom}`.toLowerCase().includes(recruiterSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(recruiterSearch.toLowerCase())
    );

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar userType="admin" activePage="admin-dashboard" onNavigate={onNavigate} />
        <main className="flex-1 bg-surface h-screen overflow-y-auto p-4 lg:p-8 flex items-center justify-center">
          <p className="text-secondary">Loading admin dashboard...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar userType="admin" activePage="admin-dashboard" onNavigate={onNavigate} />
        <main className="flex-1 bg-surface h-screen overflow-y-auto p-4 lg:p-8 flex items-center justify-center">
          <div className="bg-white rounded-xl border border-color p-8 text-center max-w-md w-full">
            <h2 className="mb-3">Admin Dashboard Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadAdminData} className="bg-primary hover:bg-primary-hover text-white rounded-lg">
              Retry
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar userType="admin" activePage="admin-dashboard" onNavigate={onNavigate} />

      <main id="admin-main" className="flex-1 bg-surface h-screen overflow-y-auto p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">

          {/* Overview */}
          <section id="admin-dashboard-overview" className="mb-8 scroll-mt-6">
            <div className="mb-8">
              <h1 className="mb-2">Admin Dashboard</h1>
              <p className="text-secondary">Manage users, supervise job offers, and monitor platform activity</p>
            </div>
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">
                <div className="bg-white rounded-xl border border-color p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <h3 className="text-3xl font-bold mb-1">{stats.totalUsers}</h3>
                  <p className="text-secondary text-sm">Total Users</p>
                </div>
                <div className="bg-white rounded-xl border border-color p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <h3 className="text-3xl font-bold mb-1">{stats.totalCandidates}</h3>
                  <p className="text-secondary text-sm">Candidates</p>
                </div>
                <div className="bg-white rounded-xl border border-color p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Briefcase className="h-6 w-6 text-orange-600" />
                    </div>
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <h3 className="text-3xl font-bold mb-1">{stats.totalRecruiters}</h3>
                  <p className="text-secondary text-sm">Recruiters</p>
                </div>
                <div className="bg-white rounded-xl border border-color p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <ShieldCheck className="h-6 w-6 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-purple-600">Secure</span>
                  </div>
                  <h3 className="text-3xl font-bold mb-1">{stats.totalAdmins}</h3>
                  <p className="text-secondary text-sm">Admins</p>
                </div>
                <div className="bg-white rounded-xl border border-color p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Briefcase className="h-6 w-6 text-indigo-600" />
                    </div>
                    <span className="text-sm font-medium text-indigo-600">Published</span>
                  </div>
                  <h3 className="text-3xl font-bold mb-1">{stats.totalOffres}</h3>
                  <p className="text-secondary text-sm">Total Offers</p>
                </div>
              </div>
            )}
          </section>

          {/* Tickets Section */}
          <section id="messages-section" className="bg-white rounded-xl border border-color mb-8 overflow-hidden scroll-mt-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-color">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="mb-0">Support Tickets</h2>
                  <p className="text-secondary text-sm">Recruiter problem reports</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {openTickets.length > 0 && (
                  <Badge className="bg-orange-100 text-orange-700 border-0">{openTickets.length} Open</Badge>
                )}
                {closedTickets.length > 0 && (
                  <Badge className="bg-gray-100 text-gray-600 border-0">{closedTickets.length} Closed</Badge>
                )}
              </div>
            </div>

            <div className="flex" style={{ height: '480px' }}>
              {/* Ticket list — always visible on desktop, hidden when ticket open on mobile */}
              <div
                className={`border-r border-color overflow-y-auto ${selectedTicket ? 'hidden md:block' : 'block'}`}
                style={{ width: '280px', minWidth: '280px' }}
              >
                {tickets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 p-6">
                    <MessageSquare className="h-10 w-10 text-muted" />
                    <p className="text-secondary text-sm text-center">No tickets yet</p>
                  </div>
                ) : (
                  <>
                    {openTickets.length > 0 && (
                      <div className="px-4 py-2 bg-surface border-b border-color">
                        <p className="text-xs font-semibold text-secondary uppercase tracking-wide">Open</p>
                      </div>
                    )}
                    {openTickets.map((ticket) => (
                      <button key={ticket.id} type="button"
                        onClick={() => { setSelectedTicket(ticket); setTicketMessages([]); }}
                        className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-surface transition-colors text-left border-b border-color ${selectedTicket?.id === ticket.id ? 'bg-orange-50' : ''}`}
                      >
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', flexShrink: 0, marginTop: '5px', display: 'inline-block' }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate text-gray-800">{ticket.subject}</p>
                          <p className="text-xs text-secondary truncate">{ticket.recruiterPrenom} {ticket.recruiterNom}</p>
                          <p className="text-xs text-muted">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                        </div>
                      </button>
                    ))}
                    {closedTickets.length > 0 && (
                      <div className="px-4 py-2 bg-surface border-b border-color">
                        <p className="text-xs font-semibold text-secondary uppercase tracking-wide">Closed</p>
                      </div>
                    )}
                    {closedTickets.map((ticket) => (
                      <button key={ticket.id} type="button"
                        onClick={() => { setSelectedTicket(ticket); setTicketMessages([]); }}
                        className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-surface transition-colors text-left border-b border-color ${selectedTicket?.id === ticket.id ? 'bg-gray-50' : ''}`}
                      >
                        <Lock style={{ width: '12px', height: '12px', color: '#9ca3af', flexShrink: 0, marginTop: '4px' }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-gray-500">{ticket.subject}</p>
                          <p className="text-xs text-secondary truncate">{ticket.recruiterPrenom} {ticket.recruiterNom}</p>
                          <p className="text-xs text-muted">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                        </div>
                      </button>
                    ))}
                  </>
                )}
              </div>

              {/* Ticket conversation */}
              <div className={`flex-1 flex flex-col ${selectedTicket ? 'flex' : 'hidden md:flex'}`}>
                {!selectedTicket ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <MessageSquare className="h-12 w-12 text-muted" />
                    <p className="text-secondary text-sm">Select a ticket to view</p>
                  </div>
                ) : (
                  <>
                    {/* Ticket header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-color">
                      <div className="flex items-center gap-3">
                        {/* Back button — always visible */}
                        <button
                          type="button"
                          onClick={() => { setSelectedTicket(null); setTicketMessages([]); }}
                          className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface transition-colors"
                        >
                          <ChevronLeft className="h-4 w-4 text-secondary" />
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-800">{selectedTicket.subject}</p>
                            <span style={{
                              fontSize: '11px', padding: '2px 8px', borderRadius: '999px',
                              backgroundColor: selectedTicket.status === 'OPEN' ? '#dcfce7' : '#f3f4f6',
                              color: selectedTicket.status === 'OPEN' ? '#16a34a' : '#6b7280',
                            }}>
                              {selectedTicket.status}
                            </span>
                          </div>
                          <p className="text-xs text-secondary">
                            {selectedTicket.recruiterPrenom} {selectedTicket.recruiterNom} · {selectedTicket.recruiterEmail}
                          </p>
                        </div>
                      </div>
                      {selectedTicket.status === 'OPEN' && (
                        <button type="button" onClick={handleCloseTicket} disabled={closingTicket}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                            backgroundColor: '#fef2f2', color: '#ef4444',
                            border: '1px solid #fecaca', cursor: closingTicket ? 'not-allowed' : 'pointer',
                          }}>
                          {closingTicket
                            ? <Loader2 style={{ width: '12px', height: '12px' }} className="animate-spin" />
                            : <X style={{ width: '12px', height: '12px' }} />
                          }
                          Close Ticket
                        </button>
                      )}
                      {selectedTicket.status === 'CLOSED' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#9ca3af' }}>
                          <Lock style={{ width: '12px', height: '12px' }} />
                          Closed {selectedTicket.closedAt ? new Date(selectedTicket.closedAt).toLocaleDateString() : ''}
                        </div>
                      )}
                    </div>

                    {/* Closed banner */}
                    {selectedTicket.status === 'CLOSED' && (
                      <div style={{ padding: '8px 16px', backgroundColor: '#fef2f2', borderBottom: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Lock style={{ width: '14px', height: '14px', color: '#ef4444', flexShrink: 0 }} />
                        <p style={{ fontSize: '12px', color: '#ef4444', margin: 0 }}>This ticket is closed. No more replies can be sent.</p>
                      </div>
                    )}

                    {/* Messages */}
                    <div ref={messagesRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-2" style={{ backgroundColor: '#f8fafb' }}>
                      {loadingMessages && ticketMessages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                          <Loader2 className="h-6 w-6 text-primary animate-spin" />
                        </div>
                      ) : ticketMessages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-secondary text-sm">No messages yet</p>
                        </div>
                      ) : (
                        ticketMessages.map((msg, index) => {
                          const isMe = msg.senderId === myId;
                          const showDate = index === 0 ||
                            formatDate(ticketMessages[index - 1].sentAt) !== formatDate(msg.sentAt);
                          return (
                            <div key={msg.id}>
                              {showDate && (
                                <div className="text-center text-xs text-secondary my-2">{formatDate(msg.sentAt)}</div>
                              )}
                              <div style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                                <div style={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', gap: '2px' }}>
                                  {!isMe && (
                                    <p style={{ fontSize: '10px', color: '#9ca3af', margin: '0 4px' }}>
                                      {msg.senderPrenom} {msg.senderNom}
                                    </p>
                                  )}
                                  <div style={{
                                    padding: '8px 12px',
                                    borderRadius: isMe ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                                    backgroundColor: isMe ? '#1a73e8' : '#ffffff',
                                    color: isMe ? '#ffffff' : '#1f2937',
                                    fontSize: '13px', lineHeight: '1.5',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                                    border: isMe ? 'none' : '1px solid #e5e9eb',
                                  }}>
                                    {msg.content}
                                  </div>
                                  <span style={{ fontSize: '10px', color: '#9ca3af', padding: '0 4px' }}>
                                    {formatTime(msg.sentAt)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Reply input */}
                    <div className="px-4 py-3 border-t border-color bg-white">
                      {selectedTicket.status === 'CLOSED' ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', backgroundColor: '#f3f4f6', borderRadius: '10px' }}>
                          <Lock style={{ width: '14px', height: '14px', color: '#9ca3af' }} />
                          <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>Ticket is closed</p>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f8fafb', border: '1px solid #e5e9eb', borderRadius: '12px', padding: '8px 12px' }}>
                          <input
                            type="text"
                            value={replyInput}
                            onChange={(e) => setReplyInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                            placeholder="Reply to ticket..."
                            style={{ flex: 1, backgroundColor: 'transparent', border: 'none', outline: 'none', fontSize: '13px', color: '#1f2937' }}
                          />
                          <button type="button" onClick={handleSendReply} disabled={!replyInput.trim() || sendingReply}
                            style={{
                              width: '30px', height: '30px', borderRadius: '8px',
                              backgroundColor: !replyInput.trim() || sendingReply ? '#e5e9eb' : '#1a73e8',
                              border: 'none', cursor: !replyInput.trim() || sendingReply ? 'not-allowed' : 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                            {sendingReply
                              ? <Loader2 style={{ width: '14px', height: '14px', color: '#9ca3af' }} className="animate-spin" />
                              : <Send style={{ width: '14px', height: '14px', color: !replyInput.trim() ? '#9ca3af' : '#ffffff' }} />
                            }
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Candidates */}
          <section id="candidates-section" className="bg-white rounded-xl border border-color p-6 mb-8 scroll-mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h2 className="mb-0">Candidates</h2>
                  <p className="text-secondary text-sm">Manage registered candidates</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-700 border-0">{candidates.length} Candidates</Badge>
            </div>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#9ca3af' }} />
              <input type="text" placeholder="Search by name or email..." value={candidateSearch}
                onChange={(e) => setCandidateSearch(e.target.value)}
                style={{ width: '100%', paddingLeft: '36px', paddingRight: '16px', paddingTop: '10px', paddingBottom: '10px', fontSize: '14px', color: '#1f2937', backgroundColor: '#ffffff', border: '1px solid #e5e9eb', borderRadius: '10px', outline: 'none' }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#1a73e8')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e9eb')}
              />
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium text-secondary">{user.id}</TableCell>
                      <TableCell className="font-medium">{user.prenom} {user.nom}</TableCell>
                      <TableCell><div className="flex items-center gap-2 text-secondary"><Mail className="h-4 w-4" />{user.email}</div></TableCell>
                      <TableCell className="text-secondary">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteUser(user.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {candidates.length === 0 && (
                <p className="text-center text-secondary py-6">
                  {candidateSearch ? 'No candidates match your search.' : 'No candidates found.'}
                </p>
              )}
            </div>
          </section>

          {/* Recruiters */}
          <section id="recruiters-section" className="bg-white rounded-xl border border-color p-6 mb-8 scroll-mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="mb-0">Recruiters</h2>
                  <p className="text-secondary text-sm">Manage registered recruiters</p>
                </div>
              </div>
              <Badge className="bg-blue-100 text-blue-700 border-0">{recruiters.length} Recruiters</Badge>
            </div>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#9ca3af' }} />
              <input type="text" placeholder="Search by name or email..." value={recruiterSearch}
                onChange={(e) => setRecruiterSearch(e.target.value)}
                style={{ width: '100%', paddingLeft: '36px', paddingRight: '16px', paddingTop: '10px', paddingBottom: '10px', fontSize: '14px', color: '#1f2937', backgroundColor: '#ffffff', border: '1px solid #e5e9eb', borderRadius: '10px', outline: 'none' }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#1a73e8')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e9eb')}
              />
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recruiters.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium text-secondary">{user.id}</TableCell>
                      <TableCell className="font-medium">{user.prenom} {user.nom}</TableCell>
                      <TableCell><div className="flex items-center gap-2 text-secondary"><Mail className="h-4 w-4" />{user.email}</div></TableCell>
                      <TableCell className="text-secondary">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteUser(user.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {recruiters.length === 0 && (
                <p className="text-center text-secondary py-6">
                  {recruiterSearch ? 'No recruiters match your search.' : 'No recruiters found.'}
                </p>
              )}
            </div>
          </section>

          {/* Offers Management */}
          <section id="offers-management" className="bg-white rounded-xl border border-color p-6 scroll-mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="mb-1">Offers Management</h2>
                  <p className="text-secondary text-sm">View and moderate published offers</p>
                </div>
              </div>
              <Badge className="bg-primary-light text-primary border-0">{offres.length} Offers</Badge>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offres.map((offre) => (
                    <TableRow key={offre.id}>
                      <TableCell className="font-medium text-secondary">{offre.id}</TableCell>
                      <TableCell>{offre.titre}</TableCell>
                      <TableCell>{offre.company}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-secondary">
                          <MapPin className="h-4 w-4" />{offre.localisation}
                        </div>
                      </TableCell>
                      <TableCell>
                        {offre.disabledByAdmin ? (
                          <Badge className="bg-red-100 text-red-700 border-0">Disabled by Admin</Badge>
                        ) : offre.active ? (
                          <Badge className="bg-green-100 text-green-700 border-0">Active</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-700 border-0">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-secondary">
                        {offre.createdAt ? new Date(offre.createdAt).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {offre.disabledByAdmin ? (
                              <DropdownMenuItem disabled className="text-gray-400 cursor-not-allowed">
                                <Power className="h-4 w-4 mr-2" />Already Disabled
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem className="text-orange-600" onClick={() => handleDeactivateOffre(offre.id)}>
                                <Power className="h-4 w-4 mr-2" />Deactivate Offer
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {offres.length === 0 && (
                <p className="text-center text-secondary py-6">No offers found.</p>
              )}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}