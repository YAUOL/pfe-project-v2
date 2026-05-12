import { useState, useRef, useEffect } from 'react';
import { AlertCircle, X, Send, Loader2, Plus, ChevronLeft, Lock } from 'lucide-react';
import {
  createTicket, getMyTickets, getTicketMessages,
  sendTicketMessage, TicketDTO, TicketMessageDTO
} from '../api';

interface MessagingButtonProps {
  isOpen: boolean;
  onToggle: (v: boolean) => void;
}

export function MessagingButton({ isOpen, onToggle }: MessagingButtonProps) {
  const [tickets, setTickets] = useState<TicketDTO[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketDTO | null>(null);
  const [messages, setMessages] = useState<TicketMessageDTO[]>([]);
  const [input, setInput] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [creating, setCreating] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const myId = parseInt(localStorage.getItem('authId') || '0');

  useEffect(() => {
    if (isOpen) loadTickets();
  }, [isOpen]);

  useEffect(() => {
    if (selectedTicket) {
      loadMessages(selectedTicket.id);
      const interval = setInterval(() => loadMessages(selectedTicket.id), 10000);
      return () => clearInterval(interval);
    }
  }, [selectedTicket]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await getMyTickets();
      setTickets(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (ticketId: number) => {
    try {
      const data = await getTicketMessages(ticketId);
      setMessages(data);
    } catch {
      // silent
    }
  };

  const handleCreateTicket = async () => {
    if (!newSubject.trim() || creating) return;
    setCreating(true);
    try {
      const ticket = await createTicket(newSubject.trim());
      setTickets(prev => [ticket, ...prev]);
      setSelectedTicket(ticket);
      setMessages([]);
      setNewSubject('');
      setShowNewTicket(false);
    } catch {
      // silent
    } finally {
      setCreating(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || sending || !selectedTicket) return;
    if (selectedTicket.status === 'CLOSED') return;
    setSending(true);
    try {
      const msg = await sendTicketMessage(selectedTicket.id, input.trim());
      setMessages(prev => [...prev, msg]);
      setInput('');
      setTimeout(() => {
        if (messagesRef.current) {
          messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
        }
      }, 50);
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  };

  const formatTime = (sentAt: string) =>
    new Date(sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formatDate = (sentAt: string) =>
    new Date(sentAt).toLocaleDateString([], { day: 'numeric', month: 'short' });

  const openTickets = tickets.filter(t => t.status === 'OPEN');
  const closedTickets = tickets.filter(t => t.status === 'CLOSED');

  return (
    <div style={{ position: 'fixed', bottom: '96px', right: '24px', zIndex: 100000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>

      {isOpen && (
        <div style={{ width: '360px', height: '540px', backgroundColor: '#ffffff', border: '1px solid #e5e9eb', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Header */}
          <div style={{ backgroundColor: '#f97316', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {selectedTicket && (
                <button type="button" onClick={() => { setSelectedTicket(null); setMessages([]); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ffffff', display: 'flex', alignItems: 'center', padding: 0 }}>
                  <ChevronLeft style={{ width: '18px', height: '18px' }} />
                </button>
              )}
              <AlertCircle style={{ width: '18px', height: '18px', color: '#ffffff' }} />
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', margin: 0 }}>
                  {selectedTicket ? selectedTicket.subject : 'Support Tickets'}
                </p>
                {selectedTicket && (
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                    {selectedTicket.status === 'CLOSED' ? '🔒 Closed' : '🟢 Open'}
                  </p>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {!selectedTicket && !showNewTicket && (
                <button type="button" onClick={() => setShowNewTicket(true)}
                  style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus style={{ width: '16px', height: '16px', color: '#ffffff' }} />
                </button>
              )}
              <button type="button" onClick={() => onToggle(false)}
                style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.8)' }} />
              </button>
            </div>
          </div>

          {/* New Ticket Form */}
          {showNewTicket && !selectedTicket && (
            <div style={{ padding: '16px', borderBottom: '1px solid #e5e9eb', backgroundColor: '#fff9f5' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#1f2937', marginBottom: '8px' }}>New Ticket</p>
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateTicket()}
                placeholder="Describe your issue briefly..."
                autoFocus
                style={{ width: '100%', padding: '8px 12px', fontSize: '13px', color: '#1f2937', border: '1px solid #e5e9eb', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', marginBottom: '8px' }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#f97316')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e9eb')}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={() => { setShowNewTicket(false); setNewSubject(''); }}
                  style={{ flex: 1, padding: '8px', fontSize: '13px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#6b7280' }}>
                  Cancel
                </button>
                <button type="button" onClick={handleCreateTicket} disabled={!newSubject.trim() || creating}
                  style={{ flex: 1, padding: '8px', fontSize: '13px', backgroundColor: !newSubject.trim() || creating ? '#e5e9eb' : '#f97316', border: 'none', borderRadius: '8px', cursor: !newSubject.trim() || creating ? 'not-allowed' : 'pointer', color: '#ffffff', fontWeight: 600 }}>
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          )}

          {/* Ticket List */}
          {!selectedTicket && (
            <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f8fafb' }}>
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Loader2 style={{ width: '24px', height: '24px', color: '#f97316' }} className="animate-spin" />
                </div>
              ) : tickets.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '8px', padding: '24px' }}>
                  <AlertCircle style={{ width: '40px', height: '40px', color: '#e5e9eb' }} />
                  <p style={{ fontSize: '13px', color: '#9ca3af', textAlign: 'center' }}>
                    No tickets yet.<br />Click <strong>+</strong> to report a problem.
                  </p>
                </div>
              ) : (
                <>
                  {openTickets.length > 0 && (
                    <div style={{ padding: '8px 16px', backgroundColor: '#ffffff', borderBottom: '1px solid #f3f4f6' }}>
                      <p style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Open</p>
                    </div>
                  )}
                  {openTickets.map((ticket) => (
                    <button key={ticket.id} type="button"
                      onClick={() => { setSelectedTicket(ticket); setMessages([]); }}
                      style={{ width: '100%', padding: '12px 16px', backgroundColor: '#ffffff', border: 'none', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fff9f5')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                    >
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', flexShrink: 0, display: 'inline-block' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#1f2937', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ticket.subject}
                        </p>
                        <p style={{ fontSize: '11px', color: '#9ca3af', margin: '2px 0 0' }}>
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '999px', backgroundColor: '#dcfce7', color: '#16a34a', flexShrink: 0 }}>
                        OPEN
                      </span>
                    </button>
                  ))}
                  {closedTickets.length > 0 && (
                    <div style={{ padding: '8px 16px', backgroundColor: '#ffffff', borderBottom: '1px solid #f3f4f6', borderTop: openTickets.length > 0 ? '4px solid #f3f4f6' : 'none' }}>
                      <p style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Closed</p>
                    </div>
                  )}
                  {closedTickets.map((ticket) => (
                    <button key={ticket.id} type="button"
                      onClick={() => { setSelectedTicket(ticket); setMessages([]); }}
                      style={{ width: '100%', padding: '12px 16px', backgroundColor: '#ffffff', border: 'none', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                    >
                      <Lock style={{ width: '12px', height: '12px', color: '#9ca3af', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '13px', fontWeight: 500, color: '#6b7280', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ticket.subject}
                        </p>
                        <p style={{ fontSize: '11px', color: '#9ca3af', margin: '2px 0 0' }}>
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '999px', backgroundColor: '#f3f4f6', color: '#6b7280', flexShrink: 0 }}>
                        CLOSED
                      </span>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}

          {/* Ticket Chat */}
          {selectedTicket && (
            <>
              {selectedTicket.status === 'CLOSED' && (
                <div style={{ padding: '8px 16px', backgroundColor: '#fef2f2', borderBottom: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lock style={{ width: '14px', height: '14px', color: '#ef4444', flexShrink: 0 }} />
                  <p style={{ fontSize: '12px', color: '#ef4444', margin: 0 }}>This ticket has been closed by the admin.</p>
                </div>
              )}

              <div ref={messagesRef} style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#f8fafb' }}>
                {messages.length === 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <p style={{ fontSize: '13px', color: '#9ca3af' }}>No messages yet. Start the conversation.</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMe = msg.senderId === myId;
                    const showDate = index === 0 ||
                      formatDate(messages[index - 1].sentAt) !== formatDate(msg.sentAt);
                    return (
                      <div key={msg.id}>
                        {showDate && (
                          <div style={{ textAlign: 'center', fontSize: '11px', color: '#9ca3af', margin: '4px 0 8px' }}>
                            {formatDate(msg.sentAt)}
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                          <div style={{ maxWidth: '78%', display: 'flex', flexDirection: 'column', gap: '2px', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                            {!isMe && (
                              <p style={{ fontSize: '10px', color: '#9ca3af', margin: '0 4px' }}>
                                {msg.senderPrenom} {msg.senderNom}
                              </p>
                            )}
                            <div style={{
                              padding: '8px 12px',
                              borderRadius: isMe ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                              backgroundColor: isMe ? '#f97316' : '#ffffff',
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

              <div style={{ padding: '12px', borderTop: '1px solid #e5e9eb', backgroundColor: '#ffffff' }}>
                {selectedTicket.status === 'CLOSED' ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', backgroundColor: '#f3f4f6', borderRadius: '10px' }}>
                    <Lock style={{ width: '14px', height: '14px', color: '#9ca3af' }} />
                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>Ticket is closed</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f8fafb', border: '1px solid #e5e9eb', borderRadius: '12px', padding: '8px 12px' }}>
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Type a message..."
                      style={{ flex: 1, backgroundColor: 'transparent', border: 'none', outline: 'none', fontSize: '13px', color: '#1f2937' }}
                    />
                    <button type="button" onClick={handleSend} disabled={!input.trim() || sending}
                      style={{
                        width: '30px', height: '30px', borderRadius: '8px',
                        backgroundColor: !input.trim() || sending ? '#e5e9eb' : '#f97316',
                        border: 'none', cursor: !input.trim() || sending ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                      {sending
                        ? <Loader2 style={{ width: '14px', height: '14px', color: '#9ca3af' }} className="animate-spin" />
                        : <Send style={{ width: '14px', height: '14px', color: !input.trim() ? '#9ca3af' : '#ffffff' }} />
                      }
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating Button */}
      <button type="button" onClick={() => onToggle(!isOpen)}
        style={{
          width: '56px', height: '56px', borderRadius: '50%',
          backgroundColor: '#f97316', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(249,115,22,0.4)',
          transition: 'background-color 0.15s', color: '#ffffff', position: 'relative',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ea6a0a')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f97316')}
      >
        {isOpen ? <X style={{ width: '24px', height: '24px' }} /> : <AlertCircle style={{ width: '24px', height: '24px' }} />}
        {!isOpen && openTickets.length > 0 && (
          <div style={{
            position: 'absolute', top: '-4px', right: '-4px',
            width: '20px', height: '20px', borderRadius: '50%',
            backgroundColor: '#ef4444', color: '#ffffff',
            fontSize: '11px', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid #ffffff',
          }}>
            {openTickets.length > 9 ? '9+' : openTickets.length}
          </div>
        )}
      </button>
    </div>
  );
}