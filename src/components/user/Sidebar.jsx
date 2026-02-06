import { Link } from "react-router-dom";
import { logo } from "../../assets/assets";

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-background-light flex flex-col fixed h-full z-20">
      {/* Logo */}
        {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Notepaper AI" className="w-10"/>
            <span className="text-xl font-bold tracking-tight font-serif-elegant hidden sm:block text-ink-black">
              Notepaper<span className="text-primary">.ai</span>
            </span>
          
          </Link>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-4 mt-4 overflow-visible">
        {/* Dashboard - Active */}
        <a
          className="relative group flex items-center space-x-3 px-6 py-3 text-white nav-active-blob transition-all"
          href="#"
        >
          <span className="material-icons-round relative z-10">grid_view</span>
          <span className="font-semibold relative z-10">Dashboard</span>
        </a>

        {/* My Notes */}
        <a
          className="group flex items-center space-x-3 px-6 py-3 text-slate-500 dark:text-slate-400 hover:text-purple-500 transition-all"
          href="#"
        >
          <span className="material-icons-round">description</span>
          <span>My Notes</span>
        </a>

        {/* Recordings */}
        <a
          className="group flex items-center space-x-3 px-6 py-3 text-slate-500 dark:text-slate-400 hover:text-purple-500 transition-all"
          href="#"
        >
          <span className="material-icons-round">mic</span>
          <span>Recordings</span>
        </a>

        {/* Study Plan */}
        <a
          className="group flex items-center space-x-3 px-6 py-3 text-slate-500 dark:text-slate-400 hover:text-purple-500 transition-all"
          href="#"
        >
          <span className="material-icons-round">event_note</span>
          <span>Study Plan</span>
        </a>

        {/* Quizzes */}
        <a
          className="group flex items-center space-x-3 px-6 py-3 text-slate-500 dark:text-slate-400 hover:text-purple-500 transition-all"
          href="#"
        >
          <span className="material-icons-round">quiz</span>
          <span>Quizzes</span>
        </a>

        {/* Settings */}
        <a
          className="group flex items-center space-x-3 px-6 py-3 text-slate-500 dark:text-slate-400 hover:text-purple-500 transition-all"
          href="#"
        >
          <span className="material-icons-round">settings</span>
          <span>Settings</span>
        </a>
      </nav>

      {/* Pro Plan Card */}
      <div className="p-6">
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl p-4 text-white relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-xs font-medium opacity-80 mb-1">PRO PLAN</p>
            <p className="font-bold mb-3 leading-tight">Unlock AI Insights</p>
            <button className="bg-white/20 hover:bg-white/30 text-white text-sm py-2 px-4 rounded-xl transition-all">
              Upgrade
            </button>
          </div>
          <span className="material-icons-round absolute -right-4 -bottom-4 text-white/10 text-8xl group-hover:scale-110 transition-transform">
            bolt
          </span>
        </div>
      </div>
    </aside>
  );
};