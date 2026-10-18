import { useState } from 'react';
import { Link } from 'react-router-dom';

// ── Header ────────────────────────────────────────────────────────────────────
export const HelpHeader = () => {
  return (
    <header className="max-w-2xl mx-auto text-center pt-4 md:pt-10">
      <p className="eyebrow text-plum-700 mb-4">Help & support</p>
      <h1 className="font-display-serif text-4xl md:text-6xl font-semibold tracking-tight text-stone-900">
        How can we help?
      </h1>
      <p className="text-stone-600 mt-4 text-base md:text-lg">
        Guides, answers and a real human when you need one.
      </p>
    </header>
  );
};

// ── Category Modal ─────────────────────────────────────────────────────────────
const CATEGORY_CONTENT = {
  'Getting Started': {
    intro: 'Welcome to Notepaper! Here\'s everything you need to get up and running.',
    sections: [
      {
        heading: 'Create your account',
        body: 'Sign up at /signup with your email address. After verifying your email you\'ll land straight on your Dashboard, no setup wizard, no friction.',
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
        body: 'The search bar in the top header searches across all your content types at once, just start typing and results appear as a dropdown instantly.',
      },
      {
        heading: 'Need more help?',
        body: 'If you get stuck at any point, use the Support chat (bottom-right) or open a ticket at /lockedin/support-tickets/new.',
      },
    ],
  },

  'Account & API Keys': {
    intro: 'Manage your account, personal details, and AI provider keys all from your settings.',
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
        heading: 'Connecting an AI API key',
        body: 'Add your Gemini or DeepSeek key at /lockedin/profile-settings. Keys are encrypted at rest and only used to call the provider you choose.',
      },
      {
        heading: 'Deleting your account',
        body: 'If you\'d like to close your account you can do so at /lockedin/delete-account. This action is permanent, export any content you want to keep first.',
      },
    ],
  },

  'AI tools': {
    intro: 'Notepaper has a few smart tools built right into your workflow.',
    sections: [
      {
        heading: 'Content generation',
        body: 'Visit /lockedin/generate to create notes, summaries, outlines, or study guides. Just describe what you need and it drafts it for you.',
      },
      {
        heading: 'Voice to text',
        body: 'At /lockedin/voice-to-speech you can convert spoken audio into written text. This is useful for lecture recordings, voice memos, or any audio you want as a note.',
      },
      {
        heading: 'Formatting flashcards',
        body: 'In the Flashcard editor, bold and italic formatting is applied per side independently, styling the front doesn\'t affect the back.',
      },
      {
        heading: 'Assistance inside the editors',
        body: 'The Note and Paper editors have inline help. Look for the prompt button within the editor toolbar when you want help expanding, rephrasing, or summarising what you\'ve written.',
      },
      {
        heading: 'Support chat',
        body: 'The chat widget (bottom-right corner) can answer questions, guide you to the right page, or direct you to a human agent when needed.',
      },
      {
        heading: 'More coming',
        body: 'We\'re actively adding more capabilities. Feature suggestions are always welcome, use the Support chat or open a ticket to share ideas with our team.',
      },
    ],
  },
};

const CategoryModal = ({ category, onClose }) => {
  const content = CATEGORY_CONTENT[category];
  if (!content) return null;

  return (
    <>
      <div className="fixed inset-0 bg-stone-900/40 z-50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white  shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-200">

          {/* Modal header */}
          <div className="-2xl px-6 py-5 flex items-center justify-between border-b border-stone-100">
            <h2 className="font-display-serif text-xl font-semibold text-stone-900">{category}</h2>
            <button onClick={onClose} className="p-1.5  hover:bg-stone-100 transition-colors">
              <span className="material-symbols-outlined text-stone-500">close</span>
            </button>
          </div>

          {/* Modal body */}
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
            <p className="text-stone-500 text-[14px] leading-relaxed">{content.intro}</p>

            {content.sections.map((s, i) => (
              <div key={i} className="border-l-2 border-plum-100 pl-4">
                <h3 className="font-semibold text-stone-900 text-[13px] mb-1">{s.heading}</h3>
                <p className="text-stone-500 text-[13px] leading-relaxed">
                  <InlineLinks text={s.body} />
                </p>
              </div>
            ))}
          </div>

          {/* Modal footer */}
          <div className="px-6 py-4 border-t border-stone-100 flex justify-between items-center">
            <Link to="/lockedin/support-tickets/new" className="text-[12px] text-plum-700 hover:underline">
              Still stuck? Open a ticket
            </Link>
            <button onClick={onClose} className="px-4 py-2 bg-stone-900 text-white text-[13px]  hover:bg-stone-700 transition-colors">
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
  '/lockedin/model-guide': 'AI Model Guide',
  '/lockedin/profile-settings': 'Profile Settings',
  '/lockedin/change-password': 'Change Password',
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
      <Link key={match.index} to={path} className="text-plum-700 underline underline-offset-2 hover:text-plum-600">
        {ROUTE_LABELS[path]}
      </Link>
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <span>{parts.length ? parts : text}</span>;
}

// ── Category Card ─────────────────────────────────────────────────────────────
export const CategoryCard = ({ title, description, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="group text-left  border border-stone-200 bg-white p-7 hover:border-plum-200 hover:shadow-[0_16px_40px_-24px_rgba(88,61,139,0.35)] transition-all"
    >
    
      <h3 className="text-[17px] font-semibold text-stone-900 mb-1.5">{title}</h3>
      <p className="text-[14px] text-stone-500 leading-relaxed">{description}</p>
    </button>
  );
};

// ── Help Categories ───────────────────────────────────────────────────────────
export const HelpCategories = () => {
  const [activeModal, setActiveModal] = useState(null);

  const categories = [
    {
   
      title: 'Getting Started',
      description: 'New here? Learn the basics of Notepaper.',
    },
    {

      title: 'Account & API Keys',
      description: 'Manage your profile and AI provider keys.',
    },
    {
  
      title: 'AI tools',
      description: 'Guides for generation, voice and editing help.',
    },
  ];

  return (
    <>
      <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 mb-16 md:mb-24">
        {categories.map((category, index) => (
          <CategoryCard
            key={index}
      
            title={category.title}
            description={category.description}
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
    <div className="border-b border-stone-100 last:border-0">
      <button
        className="w-full py-4 flex items-center justify-between text-left gap-4 group"
        onClick={onToggle}
      >
        <span className="text-[15px] font-medium text-stone-900 group-hover:text-plum-700 transition-colors">
          {question}
        </span>
        <span
          className={`material-symbols-outlined text-stone-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-90 text-plum-600' : ''
          }`}
        >
          chevron_right
        </span>
      </button>
      {isOpen && (
        <p className="text-stone-600 text-[14px] md:text-[15px] leading-relaxed pb-5 pr-8">
          {answer}
        </p>
      )}
    </div>
  );
};

// ── Top Questions ─────────────────────────────────────────────────────────────
export const TopQuestionsSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'What is Notepaper?',
      answer: 'Notepaper is a productivity app for students and professionals. You can create and organise Notes, Papers, Folders, Flashcard decks, and Presentations with smart tools to help you generate, summarise, and study content more effectively.',
    },
    {
      question: 'How do I create my first note?',
      answer: 'After signing in, go to your Dashboard and click the create button, or head to the Library and select "New Note". The editor opens immediately, start typing, apply formatting, and your work is saved automatically as you go.',
    },
    {
      question: 'Can I organise my content into folders?',
      answer: 'Yes. From the Library you can create Folders and move notes and papers into them. Folders are a great way to keep a subject, course, or project together in one place.',
    },
    {
      question: 'How do flashcards work?',
      answer: 'Create a flashcard deck from the Dashboard or Library. Each card has a front and a back, you can style them independently with different fonts, colours, and formatting. Flip through cards to study, and bold/italic styling on each side is saved separately.',
    },
    {
      question: 'What does the generation feature do?',
      answer: 'The Generate page lets you describe what you need — a summary, outline, study guide, or draft — and writes it for you. The output can be saved directly as a Note or Paper.',
    },
    {
      question: 'How do I search for my content?',
      answer: 'Use the search bar in the top header of your Dashboard. It searches across notes, papers, folders, flashcards, and presentations at once and shows results in a dropdown as you type, click any result to go straight to it.',
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
      question: 'How do I connect my own AI key?',
      answer: 'Go to Settings → Profile Settings and add a Gemini or DeepSeek API key. Your key is encrypted before it is stored, and it is only ever used to call that provider on your behalf. NotepaperAI does not charge you, you pay the AI provider directly for what you use.',
    },
    {
      question: 'I found a bug or something isn\'t working, what do I do?',
      answer: 'Open a support ticket from /lockedin/support-tickets/new and describe what you\'re seeing. Include what you were doing when the issue occurred and, if possible, any error messages. Our team reviews every ticket.',
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className=" bg-white ring-1 ring-stone-200/80 p-8 md:p-10">
      <div className="flex items-center justify-between mb-2 pb-5 border-b border-stone-100">
        <h2 className="font-display-serif text-xl md:text-2xl font-semibold text-stone-900">
          Top questions
        </h2>
      </div>
      <div>
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
  );
};

// ── Support Ticket Card ───────────────────────────────────────────────────────
export const SupportTicketCard = () => {
  return (
    <div className=" bg-plum-700 text-white p-8 md:p-10 flex flex-col items-center text-center lg:sticky lg:top-28 self-start">
      <div className="w-12 h-12  bg-white/15 flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-[26px]">support_agent</span>
      </div>
      <h3 className="text-2xl font-semibold mb-2">Still stuck?</h3>
      <p className="text-plum-100 text-[14px] md:text-[15px] leading-relaxed mb-7">
        If you couldn&rsquo;t find what you were looking for, our team is ready to
        help you manually.
      </p>
      <Link
        to="/lockedin/support-tickets/new"
        className="w-full py-3  bg-white text-plum-800 font-semibold text-[14px] hover:bg-plum-50 transition-colors flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined text-[18px]">confirmation_number</span>
        Open a ticket
      </Link>
      <p className="text-plum-200 text-[12px] mt-4">
        Real humans, not an autoresponder.
      </p>
    </div>
  );
};

// ── Main Section ──────────────────────────────────────────────────────────────
export const HelpMainSection = () => {
  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 w-full items-start">
      <div className="lg:col-span-2">
        <TopQuestionsSection />
      </div>
      <SupportTicketCard />
    </div>
  );
};

// ── Page Root ─────────────────────────────────────────────────────────────────
export const HelpSupport = () => {
  return (
    <main className="bg-paper pb-24 md:pb-32">
      <HelpHeader />
      <div className="mt-10 md:mt-16 space-y-10">
        <HelpCategories />
        <HelpMainSection />
      </div>
    </main>
  );
};
