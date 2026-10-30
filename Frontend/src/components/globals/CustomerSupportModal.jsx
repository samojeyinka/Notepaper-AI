import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { isAIOverloadedError } from '../../utils/aiErrors';
import { apiClient } from '../../api/apiClient';

const TICKET_URL     = '/lockedin/support-tickets/new';

// All navigable pages — injected into the system prompt and used for link rendering
const ROUTES_MAP = {
  '/':                              'Home',
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
  '/lockedin/study-plan':           'Study Plan',
  '/lockedin/profile-settings':     'Profile Settings',
  '/lockedin/change-password':      'Change Password',
  '/lockedin/notifications':        'Notifications',
  '/lockedin/support-tickets':      'My Support Tickets',
  '/lockedin/support-tickets/new':  'Create a Support Ticket',
  '/lockedin/voice-to-speech':      'Voice to Speech',
  '/lockedin/generate':             'AI Generate',
  '/lockedin/generate?tab=diagrams':      'AI Diagram Generator',
  '/lockedin/generate?tab=flashcards':    'Generate Flashcards',
  '/lockedin/generate?tab=quizzes':       'Generate Quizzes',
  '/lockedin/generate?tab=presentations': 'Generate Presentations',
  '/lockedin/notes/new':            'Create a Note',
  '/lockedin/papers/new':           'Create a Paper',
  '/lockedin/flashcards/new':       'Create a Flashcard Deck',
  '/lockedin/sprints':              'Study Sprints',
  '/lockedin/sprints/create':       'Create a Study Sprint',
  '/lockedin/quizzes':              'Quizzes',
  '/lockedin/quizzes/new':          'Create a Quiz',
};

const ROUTES_CONTEXT = Object.entries(ROUTES_MAP)
  .map(([path, label]) => `  ${path}  →  ${label}`)
  .join('\n');

const SYSTEM_PROMPT = `You are a friendly AI support bot for Notepaper AI — an AI-powered productivity app for notes, papers, folders, flashcards, presentations, quizzes, study sprints, and AI-generated diagrams.

Always be concise (2–4 sentences max). Be warm but professional.

You can help with:
- How to use features: notes, papers, folders, flashcards, presentations, quizzes, study sprints, voice to speech
- AI Generate hub: flashcards, quizzes, presentations, and diagrams (flowcharts, mind maps, sequence/ER/class/state diagrams, Gantt charts) generated from the user's notes or papers
- Study Sprints: timed, AI-generated study roadmaps made of bite-sized challenges
- Quizzes: create AI quizzes from study material, play them, and share them publicly
- Account and profile settings
- AI provider setup (connecting a Gemini or DeepSeek API key)
- Common technical issues and troubleshooting

You CANNOT help with:
- Password resets that require identity verification
- Anything requiring access to the user's private data
- Billing matters — NotepaperAI does not charge; users pay their AI provider directly

When the user needs human support or asks something you cannot resolve, tell them clearly that you're an AI bot and direct them to: ${TICKET_URL}

NAVIGATION: When it would help the user take action, include the exact path from this list in your reply — it will automatically become a clickable link:
${ROUTES_CONTEXT}

Only use a path when genuinely relevant. Write it exactly as listed. Do not invent paths.
Do not use excessive markdown. Keep responses plain and readable in a chat bubble.`;

// Render bot text — detect any known route and render it as a <Link>
const ROUTE_REGEX = /(\/[\w&-]+(?:\/[\w&-]+)*(?:\?[\w=&-]+)?)/g;

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
      <Link key={match.index} to={path} className="underline font-medium text-[#45666c] hover:text-[#355358]">
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
  text: "Hi there. I can help you use NotepaperAI or guide you to human support. What would you like to know?",
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

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const quickReplies = [
    'How do I create a note?',
    'How do flashcards work?',
    'I have a technical issue',
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

    const res = await apiClient('/public/support/chatbot', {
      method: 'POST',
      body: {
        message: userText,
        history,
        system: SYSTEM_PROMPT,
      },
    });

    return res?.data?.reply ?? "Sorry, I couldn't generate a response.";
  };

  const send = async (text) => {
    if (!text.trim() || isLoading) return;
    setInputMessage('');
    setIsLoading(true);
    const userMessage = { id: Date.now(), type: 'user', text, timestamp: new Date() };
    const updated = [...messages, userMessage];
    setMessages(updated);

    try {
      const botText = await askGemini(text, updated);
      setMessages((prev) => [...prev, { id: Date.now() + 1, type: 'bot', text: botText, timestamp: new Date() }]);
    } catch (err) {
      const fallbackText = isAIOverloadedError(err)
        ? `This bot runs on Gemini's free tier, which is under heavy demand right now. Please try again in a few minutes, or create a support ticket at ${TICKET_URL}`
        : `Sorry, something went wrong. If you need help please create a support ticket at ${TICKET_URL}`;
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, type: 'bot', text: fallbackText, timestamp: new Date() },
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
      <div className="fixed inset-0 bg-[#1b2827]/25 z-40 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />

      {/* Modal */}
      <div className="fixed bottom-24 right-4 left-4 sm:left-auto sm:w-[390px] z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div id="customer-support-dialog" role="dialog" aria-modal="true" aria-label="NotepaperAI support" style={{ height: 'min(650px, calc(100dvh - 8rem))' }} className="bg-[#fffdfa] shadow-[0_24px_80px_-24px_rgba(20,33,31,.38)] overflow-hidden flex flex-col min-h-[360px] rounded-[20px] ring-1 ring-[#354d49]/10">

          {/* Header */}
          <div className="bg-[#edf3ef] border-b border-[#dfe8e2] px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
            
              <div>
                <h3 className="font-display font-semibold text-[15px] leading-tight text-stone-900">Support</h3>
                <p className="text-[11px] text-stone-500 mt-0.5">A little help for your notebook</p>
              </div>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-full text-stone-600 hover:bg-white transition-colors flex items-center justify-center" aria-label="Close support">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#f8f6f1]">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-200`}>
                <div
                  className={`max-w-[82%] px-4 py-2.5  ${
                    msg.type === 'user'
                      ? 'bg-[#587a7d] text-white rounded-2xl rounded-br-md'
                      : 'bg-white text-stone-800 rounded-2xl rounded-bl-md border border-stone-200/80 shadow-sm'
                  }`}
                >
                  <p className="text-[13px] leading-relaxed">
                    {msg.type === 'bot' ? <BotText text={msg.text} /> : msg.text}
                  </p>
                  <span className={`text-[10px] mt-1.5 block ${msg.type === 'user' ? 'text-white/70' : 'text-stone-400'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md border border-stone-200/80 shadow-sm">
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-stone-400  animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-stone-400  animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <span className="w-1.5 h-1.5 bg-stone-400  animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies shown before the first message */}
          {messages.length === 1 && !isLoading && (
            <div className="px-4 sm:px-5 pt-3 pb-3 bg-[#fffdfa] border-t border-stone-100">
              <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-[0.12em] mb-2.5">
                Try one of these
              </p>
              <div className="grid grid-cols-2 gap-2">
                {quickReplies.map((reply) => (
                  <button
                    key={reply}
                    onClick={() => send(reply)}
                    className="w-full min-h-10 text-left px-3 py-2 text-[11px] leading-snug text-[#45666c] bg-white hover:bg-[#edf3ef] rounded-xl transition-colors border border-[#dce5df]"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-stone-100 p-3 bg-[#fffdfa]">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask a question"
                disabled={isLoading}
                className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl border text-[13px] text-stone-900 border-stone-200 focus:outline-none focus:border-[#668489] focus:ring-2 focus:ring-[#eaf0ee] placeholder:text-stone-400 disabled:opacity-50 transition-colors"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="w-11 h-11 rounded-xl bg-[#45666c] text-white hover:bg-[#355358] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Send"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </form>
            <p className="text-center text-[10px] text-stone-400 mt-2">
              Need a person?{' '}
              <Link to={TICKET_URL} className="text-[#45666c] font-medium hover:text-[#355358] underline underline-offset-2">
                Open a ticket
              </Link>
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
