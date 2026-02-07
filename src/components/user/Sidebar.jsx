import { Link } from "react-router-dom";
import { logo } from "../../assets/assets";
import { useState } from "react";

export const Sidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-background-light border-b border-slate-200 z-30 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Notepaper AI" className="w-8"/>
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
        w-64 bg-background-light flex flex-col fixed h-full z-50 transition-transform duration-300
        lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo - Desktop Only */}
        <div className="p-6 hidden lg:block">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Notepaper AI" className="w-10"/>
            <span className="text-xl font-bold tracking-tight font-serif-elegant text-ink-black">
              Notepaper<span className="text-primary">.ai</span>
            </span>
          </Link>
        </div>

        {/* Mobile Spacer */}
        <div className="h-4 lg:hidden" />

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-4 mt-4 overflow-visible">
          
           <Link className="relative group flex items-center space-x-3 px-6 py-3 text-white nav-active-blob transition-all"
            to={'/lockedin'}
            onClick={() => setIsMobileMenuOpen(false)}
            >
            <span className="material-icons-round relative z-10">grid_view</span>
            <span className="font-semibold relative z-10">Dashboard</span>
          </Link>

          
             <Link className="group flex items-center space-x-3 px-6 py-3 text-slate-500 dark:text-slate-400 hover:text-purple-500 transition-all"
            to={'/lockedin/notes'}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="material-icons-round">description</span>
            <span>My Notes</span>
          </Link>

          
            <Link  className="group flex items-center space-x-3 px-6 py-3 text-slate-500 dark:text-slate-400 hover:text-purple-500 transition-all"
             to={'/lockedin/recordings'}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="material-icons-round">mic</span>
            <span>Recordings</span>
          </Link>

          
           <Link  className="group flex items-center space-x-3 px-6 py-3 text-slate-500 dark:text-slate-400 hover:text-purple-500 transition-all"
             to={'/lockedin/study-plan'}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="material-icons-round">event_note</span>
            <span>Study Plan</span>
          </Link>

          
            <Link className="group flex items-center space-x-3 px-6 py-3 text-slate-500 dark:text-slate-400 hover:text-purple-500 transition-all"
             to={'/lockedin/quizzes'}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="material-icons-round">quiz</span>
            <span>Quizzes</span>
          </Link>

          
            <Link className="group flex items-center space-x-3 px-6 py-3 text-slate-500 dark:text-slate-400 hover:text-purple-500 transition-all"
            to={'/lockedin/settings'}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="material-icons-round">settings</span>
            <span>Settings</span>
          </Link>
        </nav>

        {/* Pro Plan Card */}
        <div className="p-6">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl p-4 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-xs font-medium opacity-80 mb-1">PRO PLAN</p>
              <p className="font-bold mb-3 leading-tight">Unlock AI Insights</p>
              <Link to={'/lockedin/upgrade'} className="bg-white/20 hover:bg-white/30 text-white text-sm py-2 px-4 rounded-xl transition-all">
                Upgrade
              </Link>
            </div>
            <span className="material-icons-round absolute -right-4 -bottom-4 text-white/10 text-8xl group-hover:scale-110 transition-transform">
              bolt
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};