import { useState } from 'react';
import { Link } from 'react-router-dom';

// ── Header ────────────────────────────────────────────────────────────────────
export const HelpHeader = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="max-w-6xl mx-auto text-center mb-10">
      <h1 className="text-xl md:text-4xl font-serif font-bold text-slate-900 mb-8">How can we help you?</h1>
      
    </header>
  );
};

// ── Category Modal ─────────────────────────────────────────────────────────────
const CATEGORY_CONTENT = {
  'Getting Started': {
    icon: 'rocket_launch',
    color: 'text-yellow-500',
    bg: 'bg-yellow-50',
    intro: 'Welcome to Notepaper AI! Here\'s everything you need to get up and running.',
    sections: [
      {
        heading: 'Create your account',
        body: 'Sign up at /signup with your email address. After verifying your email you\'ll land straight on your Dashboard — no setup wizard, no friction.',
      },
      {
        heading: 'Your Dashboard (Creative Hub)',
        body: 'The Dashboard at /lockedin is your home base. From here you can jump into recent content, create something new, or search across everything you\'ve made.',
      },
      {
        heading: 'Creating content',
        body: 'Use the + buttons on the Dashboard or head to /lockedin/library to create Notes, Papers, Folders, Flashcard decks, or Presentations. Each content type has its own editor.',
      },
      {
        heading: 'Organising with Folders',
        body: 'Group related notes and papers into folders from the Library. Folders make it easy to keep a subject, project, or semester in one place.',
      },
      {
        heading: 'Search everything',
        body: 'The search bar in the top header searches across all your content types at once — just start typing and results appear as a dropdown instantly.',
      },
      {
        heading: 'Need more help?',
        body: 'If you get stuck at any point, use the Support Bot (bottom-right) or open a ticket at /lockedin/support-tickets/new.',
      },
    ],
  },

  'Account & Billing': {
    icon: 'payments',
    color: 'text-green-600',
    bg: 'bg-green-50',
    intro: 'Manage your account, subscription, and personal details all from your settings.',
    sections: [
      {
        heading: 'Updating your profile',
        body: 'Change your name, avatar, or other personal details from /lockedin/profile-settings. Updates take effect immediately.',
      },
      {
        heading: 'Changing your password',
        body: 'Head to /lockedin/change-password. You\'ll need to enter your current password before setting a new one. If you\'ve forgotten it, use the Forgot Password flow instead.',
      },
      {
        heading: 'Viewing invoices',
        body: 'All past invoices and billing history are available at /lockedin/invoices-&-billing. You can download individual invoices from that page.',
      },
      {
        heading: 'Upgrading or changing your plan',
        body: 'Go to /lockedin/upgrade to see available plans and switch. Changes to a higher plan take effect immediately; downgrades apply at the end of your current billing period.',
      },
      {
        heading: 'Application preferences',
        body: 'Theme, notification preferences, and other app-level settings live at /lockedin/application-settings.',
      },
      {
        heading: 'Deleting your account',
        body: 'If you\'d like to close your account you can do so at /lockedin/delete-account. This action is permanent — export any content you want to keep first.',
      },
    ],
  },

  'AI Features': {
    icon: 'auto_awesome',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    intro: 'Notepaper AI has several AI-powered tools built right into your workflow.',
    sections: [
      {
        heading: 'AI Content Generation',
        body: 'Visit /lockedin/generate to create notes, summaries, outlines, or study guides using AI. Just describe what you need and the AI drafts it for you.',
      },
      {
        heading: 'Voice to Speech',
        body: 'At /lockedin/voice-to-speech you can convert spoken audio into written text. This is useful for lecture recordings, voice memos, or any audio you want as a note.',
      },
      {
        heading: 'Bold & Italic formatting per card side',
        body: 'In the Flashcard editor, bold and italic formatting is applied per side independently — styling the front doesn\'t affect the back.',
      },
      {
        heading: 'AI inside the editors',
        body: 'The Note and Paper editors have inline AI assistance. Look for the AI prompt button within the editor toolbar when you want help expanding, rephrasing, or summarising what you\'ve written.',
      },
      {
        heading: 'Support Bot',
        body: 'The chat widget (bottom-right corner) is powered by Gemini AI. It can answer questions, guide you to the right page, or direct you to a human agent when needed.',
      },
      {
        heading: 'More features coming',
        body: 'We\'re actively adding more AI capabilities. Feature suggestions are always welcome — use the Support Bot or open a ticket to share ideas with our team.',
      },
    ],
  },
};

const CategoryModal = ({ category, onClose }) => {
  const content = CATEGORY_CONTENT[category];
  if (!content) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-200">

          {/* Modal header */}
          <div className={`${content.bg} rounded-t-2xl px-6 py-5 flex items-center justify-between border-b border-slate-100`}>
            <div className="flex items-center gap-3">
              
              <h2 className="font-bold text-slate-900 text-lg">{category}</h2>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-black/5 transition-colors">
              <span className="material-symbols-outlined text-slate-500">close</span>
            </button>
          </div>

          {/* Modal body */}
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
            <p className="text-slate-500 text-[14px] leading-relaxed">{content.intro}</p>

            {content.sections.map((s, i) => (
              <div key={i} className="border-l-2 border-slate-100 pl-4">
                <h3 className="font-semibold text-slate-900 text-[13px] mb-1">{s.heading}</h3>
                <p className="text-slate-500 text-[13px] leading-relaxed">
                  <InlineLinks text={s.body} />
                </p>
              </div>
            ))}
          </div>

          {/* Modal footer */}
          <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center">
            <Link to="/lockedin/support-tickets/new" className="text-[12px] text-primary hover:underline">
              Still stuck? Open a ticket
            </Link>
            <button onClick={onClose} className="px-4 py-2 bg-slate-900 text-white text-[13px] rounded-lg hover:bg-slate-700 transition-colors">
              Got it
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// Turn inline route paths into <Link> elements
const ROUTE_LABELS = {
  '/signup': 'Sign Up',
  '/signin': 'Sign In',
  '/forgot-password': 'Forgot Password',
  '/lockedin': 'Dashboard',
  '/lockedin/library': 'Library',
  '/lockedin/upgrade': 'Upgrade Plan',
  '/lockedin/invoices-&-billing': 'Invoices & Billing',
  '/lockedin/profile-settings': 'Profile Settings',
  '/lockedin/change-password': 'Change Password',
  '/lockedin/application-settings': 'Application Settings',
  '/lockedin/delete-account': 'Delete Account',
  '/lockedin/support-tickets/new': 'Create a Support Ticket',
  '/lockedin/generate': 'AI Generate',
  '/lockedin/voice-to-speech': 'Voice to Speech',
};

function InlineLinks({ text }) {
  const re = /(\/[\w&-]+(?:\/[\w&-]+)*)/g;
  const parts = [];
  let last = 0, match;
  while ((match = re.exec(text)) !== null) {
    const path = match[1];
    if (!ROUTE_LABELS[path]) continue;
    if (match.index > last) parts.push(text.slice(last, match.index));
    parts.push(
      <Link key={match.index} to={path} className="text-primary underline underline-offset-2 hover:text-primary/80">
        {ROUTE_LABELS[path]}
      </Link>
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <span>{parts.length ? parts : text}</span>;
}

// ── Category Card ─────────────────────────────────────────────────────────────
export const CategoryCard = ({ icon, title, description, shape, bgColor, onClick }) => {
  const shapeClasses = {
    pentagon: 'pentagon-shape-h',
    circle: 'rounded-full',
    blob: 'blob-shape-h',
  };

  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-center p-2 md:p-4 transition-transform hover:-translate-y-2 w-full"
    >
      <div className="absolute inset-0 bg-slate-900/5 rounded-[1rem] translate-y-3 rotate-1 scale-95"></div>
      <div className="relative w-full aspect-square bg-white rounded-[1rem] border-2 border-slate-900 p-4 flex flex-col items-center justify-center paper-shadow-h">
        <div className={`${shapeClasses[shape]} ${bgColor} w-16 h-16 flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
        <h3 className="font-bold text-[16px] text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500 mt-2 text-center">{description}</p>
      </div>
    </button>
  );
};

// ── Help Categories ───────────────────────────────────────────────────────────
export const HelpCategories = () => {
  const [activeModal, setActiveModal] = useState(null);

  const categories = [
    {
      icon: 'rocket_launch',
      title: 'Getting Started',
      description: 'New here? Learn the basics of Notepaper AI.',
      shape: 'pentagon',
      bgColor: 'bg-yellow-400',
    },
    {
      icon: 'payments',
      title: 'Account & Billing',
      description: 'Manage your subscription and profile.',
      shape: 'circle',
      bgColor: 'bg-green-500',
    },
    {
      icon: 'auto_awesome',
      title: 'AI Features',
      description: 'Master our smart AI tools and generation.',
      shape: 'blob',
      bgColor: 'bg-purple-500',
    },
  ];

  return (
    <>
      <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
        {categories.map((category, index) => (
          <CategoryCard
            key={index}
            icon={category.icon}
            title={category.title}
            description={category.description}
            shape={category.shape}
            bgColor={category.bgColor}
            onClick={() => setActiveModal(category.title)}
          />
        ))}
      </section>

      {activeModal && <CategoryModal category={activeModal} onClose={() => setActiveModal(null)} />}
    </>
  );
};

// ── FAQ Item ──────────────────────────────────────────────────────────────────
export const FAQItem = ({ question, answer, isOpen, onToggle }) => {
  return (
    <div
      className="group flex items-start space-x-2 py-.5 md:py-2 cursor-pointer hover:bg-slate-50 transition-colors"
      onClick={onToggle}
    >
      <span className="material-symbols-outlined text-primary text-[12px] md:text-[16px] rotate-180 flex-shrink-0 mt-2">
        trending_flat
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-normal md:font-medium text-[12px] md:text-[14px] text-slate-900">{question}</span>
          <span className={`material-symbols-outlined text-slate-300 group-hover:translate-x-2 transition-transform flex-shrink-0 ${isOpen ? 'rotate-90' : ''}`}>
            chevron_right
          </span>
        </div>
        {isOpen && (
          <p className="text-slate-600 mt-3 leading-relaxed text-[14px]">{answer}</p>
        )}
      </div>
    </div>
  );
};

// ── Top Questions ─────────────────────────────────────────────────────────────
export const TopQuestionsSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'What is Notepaper AI?',
      answer: 'Notepaper AI is a productivity app for students and professionals. You can create and organise Notes, Papers, Folders, Flashcard decks, and Presentations — with AI tools to help you generate, summarise, and study content more effectively.',
    },
    {
      question: 'How do I create my first note?',
      answer: 'After signing in, go to your Dashboard and click the create button, or head to the Library and select "New Note". The editor opens immediately — start typing, apply formatting, and your work is saved automatically as you go.',
    },
    {
      question: 'Can I organise my content into folders?',
      answer: 'Yes. From the Library you can create Folders and move notes and papers into them. Folders are a great way to keep a subject, course, or project together in one place.',
    },
    {
      question: 'How do flashcards work?',
      answer: 'Create a flashcard deck from the Dashboard or Library. Each card has a front and a back — you can style them independently with different fonts, colours, and formatting. Flip through cards to study, and bold/italic styling on each side is saved separately.',
    },
    {
      question: 'What does the AI generation feature do?',
      answer: 'The AI Generate page lets you describe what you need — a summary, outline, study guide, or draft — and the AI writes it for you. The output can be saved directly as a Note or Paper.',
    },
    {
      question: 'How do I search for my content?',
      answer: 'Use the search bar in the top header of your Dashboard. It searches across notes, papers, folders, flashcards, and presentations at once and shows results in a dropdown as you type — click any result to go straight to it.',
    },
    {
      question: 'Is my data private and secure?',
      answer: 'Your content is stored securely and is only accessible to you when signed in. We do not sell or share your personal data. For full details, read our Privacy Policy.',
    },
    {
      question: 'How do I change my password?',
      answer: 'Go to Settings → Change Password from your profile, or navigate directly to /lockedin/change-password. You\'ll need to confirm your current password first. If you\'ve forgotten it, use the Forgot Password link on the sign-in page.',
    },
    {
      question: 'How do I upgrade my plan?',
      answer: 'Visit the Upgrade page at /lockedin/upgrade to see available plans. Upgrading takes effect immediately. If you have questions about billing, your invoice history is at /lockedin/invoices-&-billing.',
    },
    {
      question: 'I found a bug or something isn\'t working — what do I do?',
      answer: 'Open a support ticket from /lockedin/support-tickets/new and describe what you\'re seeing. Include what you were doing when the issue occurred and, if possible, any error messages. Our team reviews every ticket.',
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="lg:col-span-2 relative">
      <div className="absolute inset-0 bg-slate-200 rounded-lg rotate-1 translate-y-2 translate-x-1"></div>
      <div className="relative bg-white p-10 pb-8 rounded-sm shadow-xl border border-slate-100">
        <div className="flex items-center justify-between mb-8 border-b-2 border-red-200 pb-4">
          <h2 className="text-[15px] md:text-2xl font-serif font-semibold text-slate-900">Top Questions</h2>
          <span className="text-[13px] md:text-base font-handwriting text-slate-400">Helpful Docs</span>
        </div>
        <div className="ruled-page-h space-y-0">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() => toggleFAQ(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Support Ticket Card ───────────────────────────────────────────────────────
export const SupportTicketCard = () => {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-indigo-100 rounded-2xl stack-layer-2-h border border-slate-200"></div>
      <div className="absolute inset-0 bg-white rounded-3xl stack-layer-1-h border border-slate-200"></div>
      <div className="relative bg-white border-2 border-slate-900 rounded-3xl p-8 flex flex-col items-center text-center paper-shadow-h">
        <div className="w-10 h-10 md:w-16 md:h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 mb-6">
          <span className="material-symbols-outlined text-4xl">support_agent</span>
        </div>
        <h3 className="text-xxl font-semibold mb-2">Still stuck?</h3>
        <p className="text-slate-500 mb-4 text-[13px] md:text-[15px]">
          If you couldn't find what you were looking for, our team is ready to help you manually.
        </p>
        <Link
          to="/lockedin/support-tickets/new"
          className="w-full py-1 md:py-2 bg-slate-900 text-white rounded-xl font-normal md:font-medium hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center space-x-2"
        >
          <span className="material-symbols-outlined">confirmation_number</span>
          <span>Open a Ticket</span>
        </Link>

        <div className="mt-8 relative w-full">
          <div className="absolute -top-12 -left-2 md:-left-4">
            <svg className="w-8 h-8 md:w-12 md:h-12 text-purple-500 rotate-[160deg]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
          </div>
          <p className="font-handwriting text-[15px] md:text-2xl text-purple-500 transform -rotate-2">
            Our team of humans is here!
          </p>
        </div>
      </div>
      <div className="absolute -top-4 right-8 w-6 h-12 border-2 border-slate-400 rounded-full opacity-40 rotate-12"></div>
    </div>
  );
};

// ── Main Section ──────────────────────────────────────────────────────────────
export const HelpMainSection = () => {
  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 w-full">
      <TopQuestionsSection />
      <SupportTicketCard />
    </div>
  );
};

// ── Page Root ─────────────────────────────────────────────────────────────────
export const HelpSupport = () => {
  return (
    <main className="flex-1 p-6 relative z-10">
      <svg className="absolute top-10 right-10 w-32 h-32 opacity-10 pointer-events-none" viewBox="0 0 100 100">
        <path d="M20,20 Q40,10 60,20 T100,20" fill="none" stroke="currentColor" strokeWidth="1"></path>
        <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeDasharray="2,2" strokeWidth="0.5"></circle>
      </svg>
      <svg className="absolute bottom-20 left-72 w-48 h-48 opacity-10 pointer-events-none" viewBox="0 0 100 100">
        <rect x="10" y="10" width="40" height="60" rx="2" fill="none" stroke="currentColor" strokeWidth="0.8" transform="rotate(-15)"></rect>
        <path d="M70,80 L90,60" stroke="currentColor" strokeLinecap="round" strokeWidth="1"></path>
        <path d="M75,85 L95,65" stroke="currentColor" strokeLinecap="round" strokeWidth="1"></path>
      </svg>

      <HelpHeader />
      <HelpCategories />
      <HelpMainSection />
    </main>
  );
};
