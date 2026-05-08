import { Link } from 'react-router-dom';
import SecuritySection from './SecuritySection';
import { PersonalInfoSection } from './PersonalInfoSection';
import { SubscriptionSection } from './profile-settings/SubscriptionSection';
import DeleteAccountSection from './profile-settings/DeleteAccountSection';

// Header Component
export const ProfileHeader = () => {
 

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2 md:mb-4">
      <div>
        <h1 className="text-[16px] md:text-xl font-medium md:font-semibold tracking-tight">Profile Settings</h1>
        <p className="text-slate-500 md:mt-1 font-handwriting text-[12px] md:text-[14px]">Personalize your creative space...</p>
      </div>
      <div className="flex items-center gap-4 relative">
        <div className="absolute -left-36 top-1/2 -translate-y-1/2 text-slate-400 hidden xl:block">
          <p className="font-sketch text-base rotate-[-8deg] w-32 leading-tight text-primary/70">
            Don't forget to save your edits!
          </p>
          <svg className="w-10 h-10 rotate-[20deg] translate-x-20 -mt-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M3 10h11m4 4l-4-4 4-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
          </svg>
        </div>
      
      </div>
    </header>
  );
};




// Toggle Switch Component - Reusable
export const ToggleSwitch = ({ checked, onChange, label }) => {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
    </label>
  );
};

// Security Section — moved to SecuritySection.jsx
// (imported above as <SecuritySection />)

// Footer Message
export const ProfileFooter = () => {
  return (
    <div className="mt-4 text-center pb-12">
      <div className="inline-block relative">
        <p className="font-sketch text-slate-400 text-[10px] md:text-sm max-w-xs mx-auto">
          All changes are secured with end-to-end encryption. Your privacy is our priority.
        </p>
        <div className="absolute -left-16 top-0 text-primary opacity-30">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M7 16V4M7 4L3 8M7 4l4 4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            ></path>
          </svg>
        </div>
      </div>
    </div>
  );
};



// Main Profile Page
export const ProfileSettings = () => {
  return (
    <main className="flex-1 lg:ml-64 p-3 lg:p-8 pt-20 lg:pt-8">
      <ProfileHeader />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mb-4 md:mb-8">
        <PersonalInfoSection />
        {/* <SubscriptionSection /> */}
        <SecuritySection />
      </div>

      <DeleteAccountSection />

      <ProfileFooter />
    </main>
  );
};

