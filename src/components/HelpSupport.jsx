import { useState } from 'react';
import { Link } from 'react-router-dom';

// Header Component
export const HelpHeader = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="max-w-6xl mx-auto text-center mb-10">
      <h1 className="text-4xl font-serif font-bold text-slate-900 mb-8">How can we help you?</h1>
      <div className="relative max-w-2xl mx-auto group">
        <div className="absolute inset-0 bg-slate-200 translate-x-1 translate-y-1 rounded-xl -z-10"></div>
        <div className="relative flex items-center bg-white border-2 border-slate-900 rounded-2xl px-3 py-2 shadow-sm group-hover:-translate-y-1 group-hover:-translate-x-1 transition-all">
          <span className="material-symbols-outlined text-3xl text-slate-400 mr-4" style={{ fontVariationSettings: "'wght' 200" }}>
            search
          </span>
          <input
            type="text"
            className="w-full bg-transparent border-none focus:ring-0 text-[16px] font-normal placeholder:text-slate-300 placeholder:italic"
            placeholder="Search through the archives..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute -right-4 -top-8 rotate-12 hidden md:block">
            <span className="font-handwriting text-primary text-lg">Looking for something?</span>
            <svg className="w-10 h-10 text-primary -scale-x-100 -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              ></path>
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
};

// Category Card Component - Reusable
export const CategoryCard = ({ icon, title, description, shape, bgColor, onClick }) => {
  const shapeClasses = {
    pentagon: 'pentagon-shape-h',
    circle: 'rounded-full',
    blob: 'blob-shape-h',
  };

  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-center p-4 transition-transform hover:-translate-y-2 w-full"
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

// Help Categories Section
export const HelpCategories = () => {
  const handleCategoryClick = (category) => {
    console.log('Category clicked:', category);
  };

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
      description: 'Master our smart transcription & generation.',
      shape: 'blob',
      bgColor: 'bg-purple-500',
    },
  ];

  return (
    <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
      {categories.map((category, index) => (
        <CategoryCard
          key={index}
          icon={category.icon}
          title={category.title}
          description={category.description}
          shape={category.shape}
          bgColor={category.bgColor}
          onClick={() => handleCategoryClick(category.title)}
        />
      ))}
    </section>
  );
};

// FAQ Item Component - Reusable
export const FAQItem = ({ question, answer, isOpen, onToggle }) => {
  return (
    <div
      className="group flex items-start space-x-2 py-2 cursor-pointer hover:bg-slate-50 transition-colors"
      onClick={onToggle}
    >
      <span className="material-symbols-outlined text-primary text-[16px] rotate-180 flex-shrink-0 mt-2">
        trending_flat
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-medium text-[14px] text-slate-900">{question}</span>
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

// Top Questions Section with Functional Accordion
export const TopQuestionsSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'How do I export my notes to PDF?',
      answer: 'You can export your notes to PDF by clicking the export button in your note settings. Select "PDF Format" and choose your destination folder. Your notes will be formatted beautifully with all your handwriting styles preserved.',
    },
    {
      question: 'Can I use Notepaper AI offline?',
      answer: 'Yes! Notepaper AI has offline functionality. Download the desktop app and your notes will sync when you reconnect to the internet. Your AI features like transcription will work with cached data.',
    },
    {
      question: 'Setting up smart reminders for quizzes',
      answer: 'To set up quiz reminders, go to your quiz settings and enable notifications. You can customize reminder times - we recommend 15 minutes before to give yourself time to prepare.',
    },
    {
      question: 'Privacy: How is my voice data stored?',
      answer: 'Your voice data is encrypted end-to-end and stored securely on our servers. We never sell or share your data. You can request deletion of your voice files anytime in your privacy settings.',
    },
    {
      question: 'Troubleshooting sync issues on desktop',
      answer: 'If you\'re experiencing sync issues, try: 1) Restart the app, 2) Check your internet connection, 3) Verify your login credentials, 4) Clear the cache in settings. If problems persist, contact our support team.',
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
          <h2 className="text-2xl font-serif font-semibold text-slate-900">Top Questions</h2>
          <span className="font-handwriting text-slate-400">Helpful Docs</span>
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

// Support Ticket Card
export const SupportTicketCard = () => {
  const handleOpenTicket = () => {
    console.log('Opening support ticket');
  };

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-indigo-100 rounded-2xl stack-layer-2-h border border-slate-200"></div>
      <div className="absolute inset-0 bg-white rounded-3xl stack-layer-1-h border border-slate-200"></div>
      <div className="relative bg-white border-2 border-slate-900 rounded-3xl p-8 flex flex-col items-center text-center paper-shadow-h">
        <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 mb-6">
          <span className="material-symbols-outlined text-4xl">support_agent</span>
        </div>
        <h3 className="text-xxl font-semibold mb-2">Still stuck?</h3>
        <p className="text-slate-500 mb-4 text-[15px]">
          If you couldn't find what you were looking for, our team is ready to help you manually.
        </p>
        <Link
        to={`/lockedin/tickets/new`}
          className="w-full py-2 bg-slate-900 text-white rounded-xl font-medium hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center space-x-2"
        >
          <span className="material-symbols-outlined">confirmation_number</span>
          <span>Open a Ticket</span>
        </Link>

        {/* Decorative Arrow */}
        <div className="mt-8 relative w-full">
          <div className="absolute -top-12 -left-4">
            <svg className="w-12 h-12 text-purple-500 rotate-[160deg]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              ></path>
            </svg>
          </div>
          <p className="font-handwriting text-2xl text-purple-500 transform -rotate-2">
            Our team of humans is here!
          </p>
        </div>
      </div>

      {/* Decorative element */}
      <div className="absolute -top-4 right-8 w-6 h-12 border-2 border-slate-400 rounded-full opacity-40 rotate-12"></div>
    </div>
  );
};

// Main Help Section
export const HelpMainSection = () => {
  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 w-full">
      <TopQuestionsSection />
      <SupportTicketCard />
    </div>
  );
};

// Floating Action Buttons
export const HelpFloatingButtons = () => {
  return (
    <>
      <button className="fixed bottom-8 right-8 w-16 h-16 bg-purple-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-30">
        <span className="material-symbols-outlined text-3xl">psychology</span>
      </button>
    </>
  );
};

// Main Help & Support Page
export const HelpSupport = () => {
  return (
    <main className="flex-1 p-6 relative z-10">
      {/* Decorative background elements */}
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
      <HelpFloatingButtons />
    </main>
  );
};

