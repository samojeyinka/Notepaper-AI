import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationsContext";

export const DashboardHeader = () => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <header className="flex justify-between items-center mb-10">
      {/* Title */}
      <div className="hidden md:flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-slate-900 text-nowrap">Creative Hub</h1>
        <p className="text-slate-500 text-[13px] mt-1 text-nowrap">Your artistic space for digital thoughts.</p>
      </div>

      {/* Right Section - Search, Notifications, Profile */}
      <div className="w-full flex items-center space-x-4 justify-between md:justify-end">
        {/* Search Bar */}
        <div className="relative">
          <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            search
          </span>
          <input
            className="pl-10 pr-4 py-2 bg-white border-none rounded-2xl w-64 focus:ring-2 focus:ring-purple-500"
            placeholder="Search notes..."
            type="text"
          />
        </div>

      <div className="flex items-center gap-6 md:gap-10">
        {/* Notifications */}
        <Link to={'/lockedin/notifications'} className="relative w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-600 hover:text-purple-500 transition-colors">
          <span className="material-icons-round">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>

        {/* Profile Picture */}
        <Link to={'/lockedin/profile-settings'} className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-purple-500 flex items-center justify-center">
          {user?.profile_picture ? (
            <img
              alt={user.full_name || 'User Profile'}
              className="w-full h-full object-cover"
              src={user.profile_picture}
            />
          ) : (
            <span className="text-sm font-bold text-slate-600">{initials}</span>
          )}
        </Link>
        </div>
      </div>
    </header>
  );
};