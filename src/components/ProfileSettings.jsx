import { useState } from 'react';
import { Link } from 'react-router-dom';

// Header Component
export const ProfileHeader = () => {
  const handleSaveChanges = () => {
    console.log('Changes saved');
  };

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Profile Settings</h1>
        <p className="text-slate-500 mt-1 font-handwriting text-[14px]">Personalize your creative space...</p>
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
        <button
          onClick={handleSaveChanges}
          className="px-4 py-1.5 bg-slate-900 text-white font-normal text-[15px] rounded-md shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          Save Changes
        </button>
      </div>
    </header>
  );
};

// Personal Info Section
export const PersonalInfoSection = () => {
  const [formData, setFormData] = useState({
    fullName: 'Alex Rivers',
    email: 'alex.rivers@design.com',
    userType: 'Student',
  });

  const userTypes = ['Student', 'Professional', 'Teacher', 'Developer', 'Designer', 'Other'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <section className="paper-scrap p-8 rounded-lg col-span-1 md:col-span-2">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Profile Photo */}
        <div className="flex flex-col items-center gap-4 relative">
          <div className="photo-clip"></div>
          <div className="w-20 h-20 rounded-sm bg-white p-2 shadow-md ring-1 ring-slate-200 rotate-2">
            <img
              alt="Profile photo"
              className="w-full h-full object-cover grayscale-[0.2]"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfwFEm61BzUfsX3444htAmss6f6_gw--m8DZk11lTspBnqU_X4Qja0vQJXRUtwFmp-aU-_RRgtktT9MhNP0uTfUsMLfhHIuH0j9Iksl4fl76NbIRRWtTmL2mxBgjHkigKBqgus4qIhkAvtl99SVLEuYZJcKyLprZMxEI4kqKY-AYnWoj5PG1GBzG09tcnvgM00FBHEcvTQOY69z4JuFB3yVIgEUhDLIDjPutKlRc3kqJJGoJDCFJrvuooGOFYqHPyQpZ2x8WBO4hHG"
            />
          </div>
          <button className="mt-2 text-xs font-bold text-primary hover:underline font-sketch uppercase tracking-wider">
            Update Portrait
          </button>
          <p className="font-handwriting text-slate-400 text-[12px] mt-1">Snapshot from June '23</p>
        </div>

        {/* Form Fields */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-slate-400">person</span>
            <h2 className="text-[17px] font-medium">Personal Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-normal text-slate-400 uppercase tracking-widest mb-1">
                Full Name
              </label>
              <input
                type="text"
                className="w-full bg-transparent border-none focus:ring-0 paper-lined-input font-handwriting text-[14px] text-ink-blue"
                placeholder="Your name"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-normal text-slate-400 uppercase tracking-widest mb-1">
                Email Address
              </label>
              <input
                type="email"
                className="w-full bg-transparent border-none focus:ring-0 paper-lined-input font-handwriting text-[14px] text-ink-blue"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled
              />
            </div>

            {/* User Type Select */}
            <div className="md:col-span-2">
              <label className="block text-xs font-normal text-slate-400 uppercase tracking-widest mb-1">
                User Type
              </label>
              <select
                className="w-full bg-white border-2 border-slate-200 rounded-xl px-2 py-1.5 font-handwriting text-[14px] text-ink-blue focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                value={formData.userType}
                onChange={(e) => handleInputChange('userType', e.target.value)}
              >
                {userTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Subscription Section
export const SubscriptionSection = () => {
 

  return (
    <section className="paper-scrap p-4 rounded-lg">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-400">card_membership</span>
          <h2 className="text-[17px] font-medium">Subscription</h2>
        </div>
        <span className="px-2 py-1 bg-primary text-white text-[12px] font-normal rounded-md border-2 border-primary -rotate-2 shadow-sm font-sketch tracking-wider">
          PREMIUM
        </span>
      </div>

      <div className="space-y-3">
        <div className="p-5 rounded-xl bg-paper-cream border border-slate-200">
          <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest mb-2">Active Plan</p>
          <p className="font-semibold text-[15px]">Pro Annual Plan</p>
          <p className="text-2xl font-black text-primary">
            $99<span className="text-sm font-normal text-slate-400">/year</span>
          </p>
          <p className="text-xs text-slate-400 mt-2 italic font-handwriting">
            Next billing: June 15, 2024
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
           to={`/lockedin/invoices-&-billing?tab=subscription`}
            className="flex-1 px-2 py-1.5 bg-white border-2 border-slate-100 rounded-xl font-medium text-sm hover:border-primary transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">settings_suggest</span>
            Manage
          </Link>
        <Link
            to={`/lockedin/invoices-&-billing?tab=billing-history`}
            className="flex-1 px-2 py-1.5 bg-white border-2 border-slate-100 rounded-xl font-medium text-sm hover:border-primary transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">receipt_long</span>
            Invoices
          </Link>
        </div>
      </div>
    </section>
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

// Security Section
export const SecuritySection = () => {
  const [twoFAEnabled, setTwoFAEnabled] = useState(true);

  const handleResetPassword = () => {
    console.log('Password reset initiated');
  };

  const handle2FAToggle = (value) => {
    setTwoFAEnabled(value);
    console.log('2FA toggled:', value);
  };

  return (
    <section className="paper-scrap p-4 rounded-lg">
      <div className="flex items-center gap-2 mb-8">
        <span className="material-symbols-outlined text-slate-400">security</span>
        <h2 className="text-[17px] font-medium">Security</h2>
      </div>

      <div className="space-y-3">
        {/* Password */}
        <div className="flex items-center justify-between group">
          <div>
            <p className="font-medium">Password</p>
            <p className="text-xs text-slate-400">Updated 3 months ago</p>
          </div>
          <Link
            to={`/lockedin/change-password`}
            className="text-primary font-bold text-sm hover:underline font-sketch"
          >
            Reset
          </Link>
        </div>

        <hr className="border-dashed border-slate-200" />

        {/* 2FA Authentication */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">2FA Authentication</p>
            <p className="text-xs text-slate-400">Recommended for Pro accounts</p>
          </div>
          <ToggleSwitch
            checked={twoFAEnabled}
            onChange={(e) => handle2FAToggle(e.target.checked)}
            label="2FA"
          />
        </div>

        {/* Status */}
        <div className="pt-4 flex items-center gap-3 bg-green-50 p-3 rounded-xl border border-green-100">
          <span className="material-symbols-outlined text-green-500">verified_user</span>
          <p className="font-handwriting text-[14px] text-green-700">Status: Protected & Synced</p>
        </div>
      </div>
    </section>
  );
};

// Footer Message
export const ProfileFooter = () => {
  return (
    <div className="mt-4 text-center pb-12">
      <div className="inline-block relative">
        <p className="font-sketch text-slate-400 text-sm max-w-xs mx-auto">
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
    <main className="flex-1 lg:ml-64 p-3 lg:p-8 pt-20 lg:pt-8  flex flex-col gap-4 overflow-y-auto max-w-5xl mx-auto w-full z-10 relative">
      <ProfileHeader />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <PersonalInfoSection />
        <SubscriptionSection />
        <SecuritySection />
      </div>

      <ProfileFooter />
    </main>
  );
};

