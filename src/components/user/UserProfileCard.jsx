import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// User Profile Card with Dropdown Menu
export const UserProfileCard = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // If user object isn't ready yet, show a simple loading state or return null
  if (!user) return null;

  const menuItems = [
    {
      icon: 'person',
      label: 'Profile Settings',
      href:'lockedin/profile-settings',
      onClick: () => setIsMenuOpen(false),
    },
    // {
    //   icon: 'receipt',
    //   label: 'Invoices & Billing',Unlock AI Insights
    //   href:'lockedin/invoices-&-billing',
    //   onClick: () => setIsMenuOpen(false),
    // },
    {
      icon: 'help',
      label: 'Help & Support',
      href:'help-&-support',
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
    <div className="mt-auto mb-4 px-4 w-full relative">
      {/* Main Profile Card */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="bg-gray-100 p-2 rounded-xl flex items-center jus gap-1.5 w-full hover:bg-slate-200 transition-colors active:scale-95"
      >
        <div className="w-7 h-7 rounded-full bg-slate-300 overflow-hidden flex-shrink-0">
          <img
            alt="User avatar"
            className="w-full h-full object-cover"
            src={user.profile_picture}
          />
        </div>

        <div className='flex items-center justify-between w-full'>
        <div className="text-left min-w-0">
          <p className="text-[12px] font-medium truncate">{user.full_name}</p>
          <p className="text-[10px] text-slate-500 capitalize">{user.plan || 'Free Plan'}</p>
        </div>
        <span className={`material-icons-round text-slate-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}>
          expand_more
        </span>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute bottom-full mb-1.5 left-6 right-6 bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2">
         

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item, index) => {
              const content = (
                <>
                  <span className="material-icons-round text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </>
              );

              const baseClasses = "w-full px-3 py-1.5 flex items-center gap-3 text-slate-500 hover:bg-slate-50 transition-colors text-sm font-normal";

              if (item.href) {
                return (
                  <Link
                    key={index}
                    to={`/${item.href}`}
                    onClick={item.onClick}
                    className={baseClasses}
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <button
                  key={index}
                  onClick={item.onClick}
                  className={baseClasses}
                >
                  {content}
                </button>
              );
            })}
          </div>

          
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