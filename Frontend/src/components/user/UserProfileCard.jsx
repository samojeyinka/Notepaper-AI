import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// User profile button with dropdown menu
export const UserProfileCard = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!user) return null;

  const menuItems = [
    {
      icon: 'person',
      label: 'Profile Settings',
      href: '/lockedin/profile-settings',
      onClick: () => setIsMenuOpen(false),
    },
    {
      icon: 'help',
      label: 'Help & Support',
      href: '/help-&-support',
      onClick: () => setIsMenuOpen(false),
    },
    {
      icon: 'logout',
      label: 'Sign Out',
      onClick: async () => {
        setIsMenuOpen(false);
        await logout();
      },
    },
  ];

  return (
    <div className="relative w-full">
      {/* Profile trigger */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="w-full flex items-center gap-2.5  px-2 py-1.5 hover:bg-stone-200/50 active:scale-[0.99] transition-all text-left group"
      >
        <div className="w-8 h-8  bg-stone-200 ring-1 ring-stone-300 overflow-hidden flex-shrink-0">
          <img
            alt="User avatar"
            className="w-full h-full object-cover"
            src={user.profile_picture}
          />
        </div>
        <div className="flex items-center justify-between w-full min-w-0 gap-1">
          <p className="text-[13px] font-semibold text-stone-800 truncate">{user.full_name}</p>
          <span className={`material-icons-round text-[18px] text-stone-400 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </div>
      </button>

      {/* Dropdown */}
      {isMenuOpen && (
        <div className="absolute bottom-full mb-2 left-0 right-0 bg-white  ring-1 ring-stone-200 shadow-xl shadow-stone-900/10 overflow-hidden z-50 py-1.5">
          {menuItems.map((item) => {
            const baseClasses =
              "w-full px-3.5 py-2 flex items-center gap-3 text-[13px] font-medium text-stone-600 hover:bg-plum-50 hover:text-plum-800 transition-colors";
            const content = (
              <>
                <span className="material-icons-round text-[18px] text-stone-400">{item.icon}</span>
                <span>{item.label}</span>
              </>
            );

            if (item.href) {
              return (
                <Link key={item.label} to={item.href} onClick={item.onClick} className={baseClasses}>
                  {content}
                </Link>
              );
            }

            return (
              <button key={item.label} onClick={item.onClick} className={baseClasses}>
                {content}
              </button>
            );
          })}
        </div>
      )}

      {/* Click outside to close */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
      )}
    </div>
  );
};

export default UserProfileCard;
