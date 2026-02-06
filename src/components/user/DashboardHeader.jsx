export const DashboardHeader = () => {
  return (
    <header className="flex justify-between items-center mb-10">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Creative Hub</h1>
        <p className="text-slate-500  mt-1">Your artistic space for digital thoughts.</p>
      </div>

      {/* Right Section - Search, Notifications, Profile */}
      <div className="flex items-center space-x-4">
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

        {/* Notifications */}
        <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-600 hover:text-purple-500 transition-colors">
          <span className="material-icons-round">notifications</span>
        </button>

        {/* Profile Picture */}
        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-purple-500">
          <img
            alt="User Profile"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHdJM_IMxFny9z7zuCwC5G3fA4cSdflQJCZ0oXsjNmvii6OpAxNxz85wKVeKDROwx_AJQ1dIAYh-ayH4r9SNVH6FU8DFzjEdOKhhMbylDqhjNrW0DI_7b2Az66SNvIOIE4wpVHwmcXgI8a3bqW7lYnE9O3LywNyVoY3hJ4hdcRcKIGIgJmd939vyINbr7NqwWTY4PT0mhjYB9RaZajxt1ocASHOaeQv-eCEQ2wPYlYQa4smpAp_fdkUpVD9T6l3smacr_vcy3_mSzi"
          />
        </div>
      </div>
    </header>
  );
};