import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AccountMenu = ({ compact = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const initials = user?.full_name?.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase() || '?';
  const signOut = async () => {
    setOpen(false);
    await logout();
    navigate('/signin');
  };

  return (
    <div className="relative shrink-0" ref={rootRef}>
      <button
        type="button"
        aria-label="Open account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={`flex items-center justify-center rounded-full border border-stone-200 bg-white p-0.5 shadow-sm transition hover:border-[#8da99d] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8da99d] ${compact ? 'h-9 w-9' : 'h-10 w-10'}`}
      >
        {user?.profile_picture ? (
          <img src={user.profile_picture} alt="" className="h-full w-full rounded-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center rounded-full bg-[#e9efeb] text-xs font-semibold text-[#355c53]">{initials}</span>
        )}
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-[70] mt-2 w-52 overflow-hidden rounded-xl border border-stone-200 bg-white p-1.5 shadow-xl shadow-stone-900/10">
          <div className="truncate border-b border-stone-100 px-3 py-2 text-xs font-medium text-stone-500">{user?.full_name || 'Your account'}</div>
          <Link role="menuitem" to="/lockedin" onClick={() => setOpen(false)} className="flex min-h-10 items-center gap-2.5 rounded-lg px-3 text-sm text-stone-700 transition hover:bg-[#e9efeb] hover:text-[#355c53]">
            <span className="material-icons-round text-[18px]">dashboard</span>Dashboard
          </Link>
          <Link role="menuitem" to="/lockedin/profile-settings" onClick={() => setOpen(false)} className="flex min-h-10 items-center gap-2.5 rounded-lg px-3 text-sm text-stone-700 transition hover:bg-[#e9efeb] hover:text-[#355c53]">
            <span className="material-icons-round text-[18px]">settings</span>Settings
          </Link>
          <button role="menuitem" type="button" onClick={signOut} className="flex min-h-10 w-full items-center gap-2.5 rounded-lg px-3 text-left text-sm text-stone-700 transition hover:bg-[#e9efeb] hover:text-[#355c53]">
            <span className="material-icons-round text-[18px]">logout</span>Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default AccountMenu;
