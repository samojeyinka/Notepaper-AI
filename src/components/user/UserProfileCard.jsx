import { useState } from 'react';
import { href, Link } from 'react-router-dom';

// User Profile Card with Dropdown Menu
export const UserProfileCard = ({ userName = 'Ojeyinka Samuel', userStatus = 'Pro Member', avatarUrl }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    {
      icon: 'person',
      label: 'Profile Settings',
      href:'profile-settings',
      onClick: () => {
        console.log('Profile settings clicked');
        setIsMenuOpen(false);
      },
    },
    {
      icon: 'receipt',
      label: 'Invoices & Billing',
      href:'invoices-&-billing',
      onClick: () => {
        console.log('Invoices clicked');
        setIsMenuOpen(false);
      },
    },
    {
      icon: 'help',
      label: 'Help & Support',
      href:'help-&-support',
      onClick: () => {
        console.log('Help clicked');
        setIsMenuOpen(false);
      },
    },
    {
      icon: 'logout',
      label: 'Sign Out',
      onClick: () => {
        console.log('Sign out clicked');
        setIsMenuOpen(false);
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
            src={
              avatarUrl ||
              'https://lh3.googleusercontent.com/aida-public/AB6AXuAfwFEm61BzUfsX3444htAmss6f6_gw--m8DZk11lTspBnqU_X4Qja0vQJXRUtwFmp-aU-_RRgtktT9MhNP0uTfUsMLfhHIuH0j9Iksl4fl76NbIRRWtTmL2mxBgjHkigKBqgus4qIhkAvtl99SVLEuYZJcKyLprZMxEI4kqKY-AYnWoj5PG1GBzG09tcnvgM00FBHEcvTQOY69z4JuFB3yVIgEUhDLIDjPutKlRc3kqJJGoJDCFJrvuooGOFYqHPyQpZ2x8WBO4hHG'
            }
          />
        </div>

        <div className='flex items-center justify-between w-full'>
        <div className="text-left min-w-0">
          <p className="text-[12px] font-medium truncate">{userName}</p>
          <p className="text-[10px] text-slate-500">{userStatus}</p>
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
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={`/lockedin/${item.href}`}
                onClick={item.onClick}
                className="w-full px-3 py-1.5 flex items-center gap-3 text-slate-500 hover:bg-slate-50 transition-colors text-sm font-normal"
              >
                <span className="material-icons-round text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
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