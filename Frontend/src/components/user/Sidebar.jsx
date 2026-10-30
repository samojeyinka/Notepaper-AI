import { Link } from "react-router-dom";
import { useState } from "react";
import { UserProfileCard } from "./UserProfileCard";
import { AiKeyReminder } from "./AiKeyReminder";

const Wordmark = () => (
  <Link to="/" className="dashboard-wordmark">
    <span className="dashboard-wordmark-name">Notepaper</span>
    <span className="dashboard-wordmark-ai">AI</span>
  </Link>
);

const NAV_ITEMS = [
  { path: '/lockedin', label: 'Dashboard' },
  { path: '/lockedin/library', label: 'Library' },
  { path: '/lockedin/generate', label: 'AI Studio' },
  { path: '/lockedin/sprints',  label: 'Sprints' },
  { path: '/lockedin/quizzes', label: 'Quizzes' },
  { path: '/lockedin/support-tickets', label: 'Support Tickets' },
];

export const Sidebar = ({ activePage }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile header */}
      <div className="dashboard-mobilebar lg:hidden fixed top-0 left-0 right-0 z-30 px-4 py-3 flex items-center justify-between">
        <Wordmark />
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
          className="dashboard-menu-toggle p-2 -mr-1 transition-colors"
        >
          <span className="material-icons-round text-[22px]">
            {isMobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-stone-900/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`dashboard-sidebar w-64 flex flex-col fixed top-0 left-0 h-full z-50 transition-transform duration-300 lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="dashboard-sidebar-brand px-6 py-6 hidden lg:block">
          <Wordmark />
          <p className="dashboard-sidebar-caption">Your personal workspace</p>
        </div>

        <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto scrollbar-none min-h-0">
          <p className="dashboard-nav-label">Workspace</p>
          {NAV_ITEMS.map((item, index) => {
            const isActive = activePage === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                aria-current={isActive ? 'page' : undefined}
                className={`dashboard-nav-link ${isActive ? 'is-active' : ''}`}
              >
                <span className="dashboard-nav-index">{String(index + 1).padStart(2, '0')}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <AiKeyReminder />
        <div className="dashboard-profile-wrap px-3 pt-2 pb-5">
          <UserProfileCard />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
