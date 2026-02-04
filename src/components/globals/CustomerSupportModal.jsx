import React, { useState } from 'react';

export default function CustomerSupportModal({ onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "Hello! 👋 Welcome to Notepaper AI support. How can we help you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const quickReplies = [
    'Pricing & Plans',
    'Technical Issue',
    'Account Help',
    'Feature Request',
    'Other',
  ];

  const handleQuickReply = (reply) => {
    addMessage(reply, 'user');
    setIsLoading(true);
    // Simulate bot response
    setTimeout(() => {
      addMessage(getBotResponse(reply), 'bot');
      setIsLoading(false);
    }, 500);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    addMessage(inputMessage, 'user');
    setInputMessage('');
    setIsLoading(true);

    // Simulate bot response
    setTimeout(() => {
      addMessage(
        "Thanks for your message! Our team will get back to you shortly. In the meantime, check our help center for common questions.",
        'bot'
      );
      setIsLoading(false);
    }, 800);
  };

  const addMessage = (text, type) => {
    const newMessage = {
      id: messages.length + 1,
      type,
      text,
      timestamp: new Date(),
    };
    setMessages([...messages, newMessage]);
  };

  const getBotResponse = (query) => {
    const responses = {
      'Pricing & Plans':
        'Our plans start at $9/month for students and go up to $49/month for professionals. Each plan includes AI note-taking, handwriting recognition, and cloud sync. Want to compare features?',
      'Technical Issue':
        'Sorry to hear you\'re experiencing issues! Can you tell us more about what\'s happening? Our team is here to help.',
      'Account Help':
        'We can help with account, authentication, billing, and more. What specific issue are you facing?',
      'Feature Request':
        'We love feedback! Let us know what features you\'d like to see. Our product team reviews all suggestions.',
      Other: 'Feel free to tell us more about how we can help. We\'re here for you!',
    };
    return responses[query] || "Thanks for reaching out! How else can we help?";
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed bottom-24 right-8 w-full max-w-sm z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[550px]">
          {/* Header */}
          <div className="bg-primary text-white p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">
                  support_agent
                </span>
              </div>
              <div>
                <h3 className="font-bold text-lg">Notepaper Support</h3>
                <p className="text-sm text-white/80">Usually replies in minutes</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.type === 'user' ? 'justify-end' : 'justify-start'
                } animate-in fade-in slide-in-from-bottom-2 duration-200`}
              >
                <div
                  className={`max-w-xs px-4 py-3 rounded-2xl ${
                    msg.type === 'user'
                      ? 'bg-primary text-white rounded-br-none'
                      : 'bg-white text-slate-900 rounded-bl-none border border-slate-200 shadow-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <span
                    className={`text-xs mt-1 block ${
                      msg.type === 'user'
                        ? 'text-white/70'
                        : 'text-slate-500'
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-slate-900 px-4 py-3 rounded-2xl rounded-bl-none border border-slate-200 shadow-sm">
                  <div className="flex gap-1 items-center">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Replies */}
          {messages.length === 1 && !isLoading && (
            <div className="px-6 py-4 bg-white border-t border-slate-200 space-y-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Quick Help Topics
              </p>
              <div className="space-y-1">
                {quickReplies.map((reply) => (
                  <button
                    key={reply}
                    onClick={() => handleQuickReply(reply)}
                    className="w-full text-left px-1.5 py-1 text-[11.5px] font-normal text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors border border-primary/20"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-slate-200 p-4 bg-white">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border border-slate-200 rounded-full focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm placeholder-slate-400"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="p-3 bg-primary text-white rounded-full hover:bg-purple-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <span className="material-symbols-outlined text-lg">send</span>
              </button>
            </form>
           
          </div>
        </div>
      </div>
    </>
  );
}