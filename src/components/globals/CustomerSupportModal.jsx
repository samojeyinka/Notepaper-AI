import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL   = 'gemini-2.5-flash-lite';
const TICKET_URL     = '/lockedin/support-tickets/new';

// All navigable pages — injected into the system prompt and used for link rendering
const ROUTES_MAP = {
  '/':                              'Home',
  '/pricing':                       'Pricing & Plans',
  '/about-us':                      'About Us',
  '/features':                      'Features overview',
  '/contact-us':                    'Contact Us',
  '/how-it-works':                  'How It Works',
  '/our-story':                     'Our Story',
  '/privacy':                       'Privacy Policy',
  '/help-&-support':                'Help & Support',
  '/signup':                        'Sign Up',
  '/signin':                        'Sign In',
  '/forgot-password':               'Forgot Password',
  '/lockedin':                      'Dashboard',
  '/lockedin/library':              'Library',
  '/lockedin/upgrade':              'Upgrade Plan',
  '/lockedin/study-plan':           'Study Plan',
  '/lockedin/invoices-&-billing':   'Invoices & Billing',
  '/lockedin/profile-settings':     'Profile Settings',
  '/lockedin/change-password':      'Change Password',
  '/lockedin/application-settings': 'Application Settings',
  '/lockedin/notifications':        'Notifications',
  '/lockedin/support-tickets':      'My Support Tickets',
  '/lockedin/support-tickets/new':  'Create a Support Ticket',
  '/lockedin/voice-to-speech':      'Voice to Speech',
  '/lockedin/generate':             'AI Generate',
  '/lockedin/notes/new':            'Create a Note',
  '/lockedin/papers/new':           'Create a Paper',
  '/lockedin/flashcards/new':       'Create a Flashcard Deck',
};

const ROUTES_CONTEXT = Object.entries(ROUTES_MAP)
  .map(([path, label]) => `  ${path}  →  ${label}`)
  .join('\n');

const SYSTEM_PROMPT = `You are a friendly AI support bot for Notepaper AI — an AI-powered productivity app for notes, papers, folders, flashcards, and presentations.

Always be concise (2–4 sentences max). Be warm but professional.

You can help with:
- How to use features (notes, papers, folders, flashcards, presentations)
- Account and profile settings
- Pricing and plan questions
- Common technical issues and troubleshooting

You CANNOT help with:
- Account-specific billing disputes
- Password resets that require identity verification
- Anything requiring access to the user's private data

When the user needs human support or asks something you cannot resolve, tell them clearly that you're an AI bot and direct them to: ${TICKET_URL}

NAVIGATION: When it would help the user take action, include the exact path from this list in your reply — it will automatically become a clickable link:
${ROUTES_CONTEXT}

Only use a path when genuinely relevant. Write it exactly as listed. Do not invent paths.
Do not use excessive markdown. Keep responses plain and readable in a chat bubble.`;

// Render bot text — detect any known route and render it as a <Link>
const ROUTE_REGEX = /(\/[\w&-]+(?:\/[\w&-]+)*)/g;

function BotText({ text }) {
  const parts = [];
  let last = 0;
  let match;

  const re = new RegExp(ROUTE_REGEX.source, 'g');
  while ((match = re.exec(text)) !== null) {
    const path = match[1];
    if (!ROUTES_MAP[path]) continue;
    if (match.index > last) parts.push(text.slice(last, match.index));
    parts.push(
      <Link key={match.index} to={path} className="underline font-medium text-primary hover:text-primary/80">
        {ROUTES_MAP[path]}
      </Link>
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));

  return <span>{parts.length ? parts : text}</span>;
}

const INITIAL_MESSAGE = {
  id: 1,
  type: 'bot',
  text: "Hi there! I'm Notepaper AI's support bot. I can answer questions about features, plans, and common issues. What can I help you with?",
  timestamp: new Date(),
};

export default function CustomerSupportModal({ onClose }) {
  const [messages,     setMessages]     = useState([INITIAL_MESSAGE]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading,    setIsLoading]    = useState(false);
  const bottomRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const quickReplies = [
    'How do I create a note?',
    'What plans are available?',
    'I have a technical issue',
    'How do flashcards work?',
    'I need human support',
  ];

  // Build history array for Gemini (excludes the initial bot message)
  const buildHistory = (msgs) =>
    msgs
      .slice(1) // skip initial greeting — it's not from the model turn
      .map((m) => ({
        role: m.type === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

  const askGemini = async (userText, currentMessages) => {
    const history  = buildHistory(currentMessages);
    const contents = [
      ...history,
      { role: 'user', parts: [{ text: userText }] },
    ];

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
        }),
      }
    );

    if (!res.ok) throw new Error('Gemini request failed');
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "Sorry, I couldn't generate a response.";
  };

  const send = async (text) => {
    if (!text.trim() || isLoading) return;
    setInputMessage('');
    setIsLoading(true);

    let updated;
    setMessages((prev) => {
      updated = [...prev, { id: Date.now(), type: 'user', text, timestamp: new Date() }];
      return updated;
    });

    try {
      // small delay so state flushes before we read it
      await new Promise((r) => setTimeout(r, 0));
      const botText = await askGemini(text, updated ?? []);
      setMessages((prev) => [...prev, { id: Date.now() + 1, type: 'bot', text: botText, timestamp: new Date() }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, type: 'bot', text: `Sorry, something went wrong. If you need help please create a support ticket at ${TICKET_URL}`, timestamp: new Date() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    send(inputMessage);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="fixed bottom-24 right-4 w-[90%] max-w-sm z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[550px]">

          {/* Header */}
          <div className="bg-primary text-white p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">smart_toy</span>
              </div>
              <div>
                <h3 className="font-semibold text-[15px] md:font-bold md:text-lg">Support Bot</h3>
                <p className="text-[11px] md:text-xs text-white/80">AI · Replies instantly</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors" aria-label="Close">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-200`}>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${msg.type === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-white text-slate-900 rounded-bl-none border border-slate-200 shadow-sm'}`}>
                  <p className="text-[12px] md:text-[13px] leading-relaxed">
                    {msg.type === 'bot' ? <BotText text={msg.text} /> : msg.text}
                  </p>
                  <span className={`text-[10px] mt-1 block ${msg.type === 'user' ? 'text-white/70' : 'text-slate-400'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none border border-slate-200 shadow-sm">
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Replies — only shown before user sends first message */}
          {messages.length === 1 && !isLoading && (
            <div className="px-4 py-3 bg-white border-t border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Quick topics</p>
              <div className="flex flex-col gap-1">
                {quickReplies.map((reply) => (
                  <button
                    key={reply}
                    onClick={() => send(reply)}
                    className="w-full text-left px-2 py-1 text-[11px] text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors border border-primary/20"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-slate-200 p-3 bg-white">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask anything…"
                disabled={isLoading}
                className="flex-1 px-3 py-2 border text-[12px] md:text-sm border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder-slate-400 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="p-2 bg-primary text-white rounded-xl hover:bg-purple-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send"
              >
                <span className="material-symbols-outlined text-lg">send</span>
              </button>
            </form>
            <p className="text-center text-[10px] text-slate-300 mt-2">AI bot · For complex issues, <Link to={TICKET_URL} className="text-primary/60 hover:text-primary underline">create a ticket</Link></p>
          </div>

        </div>
      </div>
    </>
  );
}