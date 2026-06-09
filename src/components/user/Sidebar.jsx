import { Link } from "react-router-dom";
import { logo } from "../../assets/assets";
import { useState } from "react";
import UserProfileCard from "./UserProfileCard";
import { SidebarPlanCard } from "./SidebarPlanCard";

export const Sidebar = ({ activePage }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/lockedin', icon: 'grid_view', label: 'Dashboard' },
    { path: '/lockedin/library', icon: 'folder', label: 'Library' },
    { path: '/lockedin/scholar', icon: 'memory', label: 'Scholar' },
    { path: '/lockedin/generate', icon: 'psychology', label: 'AI Studio' },
    { path: '/lockedin/quizzes',    icon: 'quiz',       label: 'Quizzes'    },
    { path: '/lockedin/sprints',    icon: 'bolt',       label: 'Sprints'    },
    // { path: '/lockedin/study-plan', icon: 'event_note', label: 'Study Plan' },
    { path: '/lockedin/support-tickets', icon: 'chat', label: 'Support Tickets' },
    // { path: '/lockedin/application-settings', icon: 'settings', label: 'Settings' }
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-background-light border-b border-slate-200 z-30 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Notepaper AI" className="w-8" />
          <span className="text-lg font-bold tracking-tight font-serif-elegant text-ink-black">
            Notepaper<span className="text-primary">.ai</span>
          </span>
        </Link>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <span className="material-icons-round text-slate-700">
            {isMobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-64 bg-background-light flex flex-col fixed top-0 left-0 h-full z-50 transition-transform duration-300
        lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo - Desktop Only */}
        <div className="p-4 hidden lg:block">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Notepaper AI" className="w-10" />
            <span className="text-xl font-bold tracking-tight font-serif-elegant text-ink-black">
              Notepaper<span className="text-primary">.ai</span>
            </span>
          </Link>
        </div>

        {/* Mobile Spacer */}
        <div className="h-4 lg:hidden" />

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-4 mt-4 overflow-visible">
          {navItems.map((item) => {
            const isActive = activePage === item.path;
            return (
              <Link
                key={item.path}
                className={`
                   flex items-center space-x-3 px-4 md:px-6 py-2 md:py-3 transition-all
                  ${isActive
                    ? 'relative group text-white nav-active-blob'
                    : 'group text-slate-500 dark:text-slate-400 hover:text-purple-500'
                  }
                `}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className={`text-[14px] md:text-base material-icons-round ${isActive ? 'relative z-10' : ''}`}>
                  {item.icon}
                </span>
                <span className={`text-[14px] md:text-base ${isActive ? 'font-medium relative z-10' : ''}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>




        <SidebarPlanCard />

        <UserProfileCard />
      </aside>
    </>
  );
};