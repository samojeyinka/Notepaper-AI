import { useState } from 'react';
import { Link } from 'react-router-dom';

// Header Component
export const SupportConversationHeader = () => {
  return (
    <header className="flex items-end justify-between mb-14">
      <div>
        <nav className="flex items-center space-x-2 text-sm text-slate-400 mb-2">
          <Link to={`/lockedin/support-tickets`} className="hover:text-primary transition-colors" href="#">
            Support tickets
          </Link>
          <span>/</span>
          <span className="text-slate-600">Ticket #2841</span>
        </nav>
        <h1 className="text-xl font-semibold text-slate-900">Account Sync Issues</h1>
      </div>
      <div className="flex items-center space-x-3">
        <div className="bg-green-500 text-white px-1 py-0.5 rounded-full text-[12px] font-normal shadow-sm flex items-center space-x-2 transform -rotate-1">
          <span className="w-1 h-1 bg-white rounded-full"></span>
          <span>Ticket Active</span>
        </div>
      </div>
    </header>
  );
};

// Message Component - Reusable
export const Message = ({
  author,
  role,
  timestamp,
  content,
  isFromSupport = false,
  initials
}) => {
  const bgColor = isFromSupport ? 'bg-purple-100' : 'bg-white';
  const borderColor = isFromSupport ? 'border-purple-100' : 'border-slate-100';
  const textColor = isFromSupport ? 'text-purple-900' : 'text-slate-700';
  const rotation = isFromSupport ? 'rotate-1' : '-rotate-1';
  const avatarColor = isFromSupport
    ? 'bg-primary text-white flex items-center justify-center'
    : 'bg-slate-200 flex items-center justify-center text-slate-500';

  return (
    <div className="relative max-w-2xl">
      <div className="absolute -inset-1 bg-black/5 rounded-2xl blur-sm" style={{ transform: isFromSupport ? 'rotate(-1deg)' : 'rotate(1deg)' }}></div>
      <div
        className={`relative ${bgColor} p-4 rounded-2xl paper-shadow border ${borderColor} transform ${rotation}`}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center space-x-3">
            <div className={`w-7 h-7 rounded-full ${avatarColor} font-semibold`}>
              {isFromSupport ? (
                <span className="material-symbols-outlined text-[16px]">support_agent</span>
              ) : (
                initials
              )}
            </div>
            <div>
              <p className={`font-medium ${isFromSupport ? 'text-purple-900' : 'text-slate-900'}`}>
                {author}
              </p>
              <p className={`text-[10px] ${isFromSupport ? 'text-purple-400' : 'text-slate-400'}`}>
                {role}
              </p>
            </div>
          </div>
          <div className="ink-stamp text-[12px]">{timestamp}</div>
        </div>
        <p className={`${textColor} leading-relaxed text-[14px]`}>{content}</p>
      </div>

    
    </div>
  );
};

// Message Thread Component
export const MessageThread = () => {
  const messages = [
    {
      id: 1,
      author: 'Jane Doe',
      role: 'Sent from Desktop App',
      timestamp: 'OCT 24, 10:14 AM',
      content:
        'Hi there, I\'ve been trying to sync my notes from my iPad to my Mac, but for some reason, the "AI Features" tab is showing as empty on my desktop. I\'ve already tried logging out and back in. Can you help?',
      isFromSupport: false,
      initials: 'JD',
    },
    {
      id: 2,
      author: 'Alex (Support Agent)',
      role: 'Human Expert',
      timestamp: 'OCT 24, 11:45 AM',
      content:
        'Hello Jane! Thanks for reaching out. I\'ve looked into your account and it seems like there was a minor version mismatch between your iPad and Desktop apps.\n\nCould you please check if you have an update pending in the Mac App Store? That should resolve the visibility of the AI features immediately.',
      isFromSupport: true,
      initials: 'SA',
    },
    {
      id: 3,
      author: 'Jane Doe',
      role: 'Sent from Desktop App',
      timestamp: 'OCT 24, 12:02 PM',
      content: 'That worked! I didn\'t even realize there was a new version. Everything is back now.',
      isFromSupport: false,
      initials: 'JD',
    },
  ];

  return (
    <div className="space-y-12">
      {messages.map((message) => (
        <Message
          key={message.id}
          author={message.author}
          role={message.role}
          timestamp={message.timestamp}
          content={message.content}
          isFromSupport={message.isFromSupport}
          initials={message.initials}
        />
      ))}
    </div>
  );
};

// Reply Textarea Component
export const ReplyTextarea = ({ value, onChange, onSend }) => {
  const [attachments, setAttachments] = useState([]);

  const handleAttach = () => {
    console.log('Attach file');
  };

  const handleEmoji = () => {
    console.log('Open emoji picker');
  };

  const handleSend = () => {
    if (value.trim()) {
      onSend(value);
    }
  };

  return (
    <div className="relative pt-4">
      <div className="absolute inset-0 bg-slate-200/30 rounded-t-xl translate-y-2 translate-x-1"></div>
      <div className="relative bg-white rounded-t-xl border-t border-x border-slate-200 p-8 shadow-2xl">
        <div className="flex items-center space-x-4 mb-3">
          <span className="font-semibold text-[18px]">New Correspondence</span>
          <div className="flex-1 h-px bg-slate-100"></div>
        </div>

        <div className="ruled-lines min-h-[150px] relative">
          <textarea
            className="w-full bg-transparent border-none focus:ring-0 text-slate-700 resize-none font-handwriting text-[15px] leading-[28px] py-0 placeholder:text-slate-300"
            placeholder="Type your reply here..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={5}
          ></textarea>
        </div>

        <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-100">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleAttach}
              className="p-2 text-slate-400 hover:text-primary transition-colors"
              title="Attach file"
            >
              <span className="material-symbols-outlined">attach_file</span>
            </button>
            <button
              onClick={handleEmoji}
              className="p-2 text-slate-400 hover:text-primary transition-colors"
              title="Add emoji"
            >
              <span className="material-symbols-outlined">mood</span>
            </button>
          </div>
          <button
            onClick={handleSend}
            disabled={!value.trim()}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-md font-medium hover:shadow-md transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-sm">send</span>
            <span>Send Message</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Conversation Container
export const SupportConversationContent = () => {
  const [replyText, setReplyText] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      author: 'Jane Doe',
      role: 'Sent from Desktop App',
      timestamp: 'OCT 24, 10:14 AM',
      content:
        'Hi there, I\'ve been trying to sync my notes from my iPad to my Mac, but for some reason, the "AI Features" tab is showing as empty on my desktop. I\'ve already tried logging out and back in. Can you help?',
      isFromSupport: false,
      initials: 'JD',
    },
    {
      id: 2,
      author: 'Alex (Support Agent)',
      role: 'Human Expert',
      timestamp: 'OCT 24, 11:45 AM',
      content:
        'Hello Jane! Thanks for reaching out. I\'ve looked into your account and it seems like there was a minor version mismatch between your iPad and Desktop apps.\n\nCould you please check if you have an update pending in the Mac App Store? That should resolve the visibility of the AI features immediately.',
      isFromSupport: true,
      initials: 'SA',
    },
    {
      id: 3,
      author: 'Jane Doe',
      role: 'Sent from Desktop App',
      timestamp: 'OCT 24, 12:02 PM',
      content: 'That worked! I didn\'t even realize there was a new version. Everything is back now.',
      isFromSupport: false,
      initials: 'JD',
    },
  ]);

  const handleSendMessage = (text) => {
    const newMessage = {
      id: messages.length + 1,
      author: 'You',
      role: 'Sent from Web',
      timestamp: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        meridiem: 'short',
      }),
      content: text,
      isFromSupport: false,
      initials: 'YO',
    };

    setMessages([...messages, newMessage]);
    setReplyText('');
    console.log('Message sent:', text);
  };

  const handleCloseTicket = () => {
    console.log('Close and archive conversation');
  };

  return (
    <div className="relative bg-amber-100 p-1 lg:p-2 rounded-lg shadow-2xl border-2 border-slate-900/10">
      <div className="bg-amber-50 min-h-[70vh] rounded shadow-inner relative overflow-hidden flex">
        {/* Binder Rings */}
        <div className="w-12 binder-rings border-r border-slate-300/30"></div>

        {/* Main Content */}
        <div className="flex-1 p-6 lg:p-10 space-y-12 overflow-y-auto">
          {/* Messages */}
          <div className="space-y-12">
            {messages.map((message) => (
              <Message
                key={message.id}
                author={message.author}
                role={message.role}
                timestamp={message.timestamp}
                content={message.content}
                isFromSupport={message.isFromSupport}
                initials={message.initials}
              />
            ))}
          </div>

          {/* Reply Area */}
          <ReplyTextarea
            value={replyText}
            onChange={setReplyText}
            onSend={handleSendMessage}
          />
        </div>
      </div>

      {/* Folder Tab */}
      <div className="absolute -top-10 left-12 h-10 w-32 bg-amber-100 folder-tab flex items-center justify-center border-t border-x border-slate-900/10">
        <span className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">
          Case: OPEN
        </span>
      </div>
    </div>
  );
};

// Footer Component
export const SupportConversationFooter = ({ onCloseTicket }) => {
  return (
    <footer className="mt-8 flex justify-center">
      <button
        onClick={onCloseTicket}
        className="flex items-center space-x-2 text-slate-400 hover:text-slate-600 transition-all font-medium"
      >
        <span className="material-symbols-outlined">archive</span>
        <span>Close and Archive Conversation</span>
      </button>
    </footer>
  );
};



// Main Support Conversation Page
export const SupportTicket = () => {
  const handleCloseTicket = () => {
    console.log('Closing and archiving ticket #2841');
    // Navigate back or show confirmation
  };

  return (
    <main className="flex-1 lg:ml-64 p-3 lg:p-8 pt-20 lg:pt-8 relative z-10 max-w-5xl mx-auto w-full">
      {/* Decorative background */}
      <svg className="absolute top-20 right-20 w-32 h-32 opacity-10 pointer-events-none" viewBox="0 0 100 100">
        <path d="M10,10 C30,40 70,10 90,40" fill="none" stroke="currentColor" strokeWidth="0.5"></path>
        <text className="font-handwriting text-[10px]" fill="currentColor" x="20" y="60">
          Paperclip here?
        </text>
      </svg>

      <SupportConversationHeader />
      <SupportConversationContent />
      <SupportConversationFooter onCloseTicket={handleCloseTicket} />
    </main>
  );
};

