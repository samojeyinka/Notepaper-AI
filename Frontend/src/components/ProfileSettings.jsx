import { Link } from 'react-router-dom';
import SecuritySection from './SecuritySection';
import { PersonalInfoSection } from './PersonalInfoSection';
import DeleteAccountSection from './profile-settings/DeleteAccountSection';
import NotificationIcon from './user/NotificationIcon';
import { AIKeysSection } from './profile-settings/AIKeysSection';

// Header Component
export const ProfileHeader = () => {
  return (
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-plum-700 mb-1.5">Account</p>
        <h1 className="font-display-serif text-[28px] md:text-[34px] font-semibold tracking-tight text-stone-900 leading-tight">
          Profile settings
        </h1>
        <p className="text-stone-500 text-[13px] md:text-sm mt-1.5">Your name, photo and sign-in options.</p>
      </div>
      <NotificationIcon />
    </header>
  );
};

// Square toggle switch — reusable
export const ToggleSwitch = ({ checked, onChange, label }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange?.(!checked)}
      className="inline-flex items-center gap-2.5 cursor-pointer group"
    >
      <span className={`relative w-11 h-6 transition-colors ${checked ? 'bg-plum-600' : 'bg-stone-300 group-hover:bg-stone-400'}`}>
        <span
          className={`absolute top-1 left-1 w-4 h-4 bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-5' : ''}`}
        />
      </span>
      {label && <span className="text-sm font-medium text-stone-600">{label}</span>}
    </button>
  );
};

// Footer Message
export const ProfileFooter = () => {
  return (
    <p className="mt-10 text-center text-[12px] text-stone-400 leading-relaxed max-w-sm mx-auto">
      Your details are encrypted and never shared. Need help?{' '}
      <Link to="/lockedin/support-tickets/new" className="text-plum-700 font-semibold hover:text-plum-600 transition-colors">
        Contact support
      </Link>
      .
    </p>
  );
};

// Main Profile Page
export const ProfileSettings = () => {
  return (
    <main className="flex-1 lg:ml-64 px-4 sm:px-6 lg:px-10 pt-20 lg:pt-10 pb-32 min-w-0 overflow-x-hidden">
      <div className="max-w-5xl mx-auto">
        <ProfileHeader />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <PersonalInfoSection />
          </div>
          <div className="lg:col-span-2">
            <SecuritySection />
          </div>
        </div>

        <div className="mt-6">
          <AIKeysSection />
        </div>

        <div className="mt-6">
          <DeleteAccountSection />
        </div>

        <ProfileFooter />
      </div>
    </main>
  );
};
