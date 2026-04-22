import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function formatMessage(text: string): string {
  return text
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #e5e9eb;margin:10px 0"/>')
    .replace(/🏢 (.+)/g, '<div style="font-weight:700;font-size:14px;color:#1a73e8;margin-top:8px">🏢 $1</div>')
    .replace(/🏛️ (.+)/g, '<div style="font-size:12px;color:#6b7280;margin-top:2px">🏛️ $1</div>')
    .replace(/📍 (.+)/g, '<div style="font-size:12px;color:#6b7280;margin-top:2px">📍 $1</div>')
    .replace(/💰 (.+)/g, '<div style="font-size:12px;font-weight:600;color:#16a34a;margin-top:2px">💰 $1</div>')
    .replace(/🛠️ (.+)/g, '<div style="font-size:12px;color:#6b7280;margin-top:2px">🛠️ $1</div>')
    .replace(/📋 (.+)/g, '<div style="font-size:12px;color:#6b7280;margin-top:2px">📋 $1</div>')
    .replace(/💡 (.+)/g, '<div style="margin-top:10px;padding:8px 10px;background:#e8f1fc;border-radius:8px;font-size:12px;color:#1a73e8;font-weight:500">💡 $1</div>')
    .replace(/\n/g, '<br/>');
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm the JobBoard assistant. Ask me about available jobs, how to apply, or CV tips!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const history = updatedMessages.slice(0, -1).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('http://localhost:8001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage.content, history }),
      });

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I am currently unavailable. Please try again later.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 99999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>

      {isOpen && (
        <div style={{
          width: '380px', height: '560px',
          backgroundColor: '#ffffff',
          border: '1px solid #e5e9eb',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>

          {/* Header */}
          <div style={{ backgroundColor: '#1a73e8', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot style={{ width: '16px', height: '16px', color: '#ffffff' }} />
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', margin: 0 }}>JobBoard Assistant</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4ade80', display: 'inline-block' }} />
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>Online</p>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.8)' }}
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#f8fafb' }}>
            <style>{`
              @keyframes bounce {
                0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
                40% { transform: translateY(-6px); opacity: 1; }
              }
            `}</style>

            {messages.map((msg, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  backgroundColor: msg.role === 'assistant' ? '#1a73e8' : '#e5e9eb',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  {msg.role === 'assistant'
                    ? <Bot style={{ width: '14px', height: '14px', color: '#ffffff' }} />
                    : <User style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                  }
                </div>
                <div
                  style={{
                    maxWidth: '82%',
                    padding: '10px 14px',
                    borderRadius: msg.role === 'assistant' ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                    backgroundColor: msg.role === 'assistant' ? '#ffffff' : '#1a73e8',
                    color: msg.role === 'assistant' ? '#1f2937' : '#ffffff',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    border: msg.role === 'assistant' ? '1px solid #e5e9eb' : 'none'
                  }}
                  dangerouslySetInnerHTML={
                    msg.role === 'assistant'
                      ? { __html: formatMessage(msg.content) }
                      : undefined
                  }
                >
                  {msg.role === 'user' ? msg.content : undefined}
                </div>
              </div>
            ))}

            {/* Bouncing dots loader */}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#1a73e8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot style={{ width: '14px', height: '14px', color: '#ffffff' }} />
                </div>
                <div style={{ padding: '12px 16px', borderRadius: '4px 16px 16px 16px', backgroundColor: '#ffffff', border: '1px solid #e5e9eb', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#1a73e8', display: 'inline-block', animation: 'bounce 1.2s infinite', animationDelay: '0s' }} />
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#1a73e8', display: 'inline-block', animation: 'bounce 1.2s infinite', animationDelay: '0.2s' }} />
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#1a73e8', display: 'inline-block', animation: 'bounce 1.2s infinite', animationDelay: '0.4s' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px', borderTop: '1px solid #e5e9eb', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f8fafb', border: '1px solid #e5e9eb', borderRadius: '12px', padding: '8px 12px' }}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask something..."
                style={{ flex: 1, backgroundColor: 'transparent', border: 'none', outline: 'none', fontSize: '13px', color: '#1f2937' }}
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                style={{
                  width: '30px', height: '30px', borderRadius: '8px',
                  backgroundColor: !input.trim() || loading ? '#e5e9eb' : '#1a73e8',
                  border: 'none', cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'background-color 0.15s'
                }}
              >
                <Send style={{ width: '14px', height: '14px', color: !input.trim() || loading ? '#9ca3af' : '#ffffff' }} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '56px', height: '56px', borderRadius: '50%',
          backgroundColor: '#1a73e8', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(26,115,232,0.4)',
          transition: 'transform 0.15s, background-color 0.15s',
          color: '#ffffff'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1557b0')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1a73e8')}
      >
        {isOpen ? <X style={{ width: '24px', height: '24px' }} /> : <MessageCircle style={{ width: '24px', height: '24px' }} />}
      </button>
    </div>
  );
}