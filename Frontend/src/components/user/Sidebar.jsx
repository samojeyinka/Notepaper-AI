import { Link } from "react-router-dom";
import { logo } from "../../assets/assets";
import { useState } from "react";
import { UserProfileCard } from "./UserProfileCard";
import { AiKeyReminder } from "./AiKeyReminder";

const NAV_ITEMS = [
  { path: '/lockedin', label: 'Dashboard' },
  { path: '/lockedin/library', label: 'Library' },
  { path: '/lockedin/generate', label: 'AI Studio' },
  { path: '/lockedin/sprints',  label: 'Sprints' },
  { path: '/lockedin/quizzes', label: 'Quizzes' },
  { path: '/lockedin/support-tickets', label: 'Support Tickets' },
];

const Wordmark = ({ small = false }) => (
  <Link to="/" className="flex items-center gap-2">
    <img src={logo} alt="Notepaper AI" className={small ? "w-8 h-8 object-contain" : "w-9 h-9 object-contain"} />
    <span className="font-display-serif text-[19px] font-bold tracking-tight text-stone-900 leading-none">
      Notepaper
      <span className="text-plum-600 text-[14px] tracking-[0.18em] align-middle ml-0.5">AI</span>
    </span>
  </Link>
);

export const Sidebar = ({ activePage }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-paper/95 backdrop-blur-md border-b border-stone-200/80 z-30 px-4 py-3 flex items-center justify-between">
        <Wordmark small />
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
          className="p-2 -mr-1  hover:bg-stone-200/60 transition-colors"
        >
          <span className="material-icons-round text-stone-700 text-[24px]">
            {isMobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-stone-900/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-64 bg-paper border-r border-stone-200/80 flex flex-col fixed top-0 left-0 h-full z-50 transition-transform duration-300
        lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo — desktop */}
        <div className="px-6 py-6 hidden lg:block border-b border-stone-200/70">
          <Wordmark />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto scrollbar-none min-h-0">
          {NAV_ITEMS.map((item) => {
            const isActive = activePage === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                aria-current={isActive ? 'page' : undefined}
                className={`
                  flex items-center gap-3 -mx-3 px-4 py-2.5 text-[14px] transition-colors
                  ${isActive
                    ? 'bg-stone-900 text-white font-medium shadow-sm border-r-[3px] border-plum-400'
                    : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50 font-medium'
                  }
                `}
              >
              
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <AiKeyReminder />

        <div className="px-3 pt-2 pb-5">
          <UserProfileCard />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
