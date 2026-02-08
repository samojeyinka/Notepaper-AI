import { useState } from 'react';

// Header Component
export const NotificationsHeader = () => {
  const handleMarkAllAsRead = () => {
    console.log('Marked all as read');
  };

  return (
    <header className="flex justify-between md:items-end mb-8 flex-col md:flex-row">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 mb-2 font-display">Notifications</h1>
        <p className="font-handwriting text-[15px] text-slate-500 italic">Stay on top of your digital paper trail...</p>
      </div>
      <div className="relative pb-4 mt-2 md:mt-0">
        <button
          onClick={handleMarkAllAsRead}
          className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors font-medium text-[14px] group"
        >
          <span className="material-symbols-outlined">done_all</span>
          <span>Mark all as read</span>
        </button>
        <div className="absolute -left-12 top-10 scribble-arrow-n text-primary pointer-events-none select-none">
          <svg className="rotate-[120deg]" fill="none" height="40" viewBox="0 0 40 40" width="40">
            <path
              d="M5 5 C 10 20, 30 20, 35 35 M 35 35 L 25 35 M 35 35 L 35 25"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            ></path>
          </svg>
          <span className="absolute -left-20 top-8 whitespace-nowrap -rotate-6">clean slate!</span>
        </div>
      </div>
    </header>
  );
};

// Notification Card Component - Reusable
export const NotificationCard = ({
  icon,
  iconBgColor,
  iconColor,
  title,
  description,
  timestamp,
  isUnread = false,
  actions = [],
  rotation = 'rotate-1',
  hasClip = false,
  hasPin = false,
  onDismiss,
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div
      className={`paper-scrap-n relative p-3 rounded-lg ${rotation} flex items-start space-x-3 ${
        isUnread ? 'unread-blob-n' : ''
      }`}
    >
      {hasPin && <div className="pin-n"></div>}
     

      {/* Icon Container */}
      <div
        className={`w-9 h-9 flex-shrink-0 rounded-xl shadow-sm border border-slate-100 flex items-center justify-center relative overflow-hidden ${iconBgColor}`}
      >
        <span className={`material-symbols-outlined text-3xl ${iconColor}`}>{icon}</span>
        {isUnread && (
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <path d="M10 10 Q 50 20 90 10" fill="none" stroke="black" strokeWidth="2"></path>
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-[16px] text-slate-800">{title}</h3>
          {isUnread && (
            <span className="text-[10px] font-normal text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              NEW
            </span>
          )}
        </div>
        <p className={`mt-1 text-[13px] ${isUnread ? '' : 'text-slate-600 italic'}`}>{description}</p>

        {/* Timestamp for older notifications */}
        {timestamp && !isUnread && (
          <div className="mt-1 text-[10px] text-slate-400 font-normal uppercase tracking-wider">{timestamp}</div>
        )}

        {/* Action Buttons */}
        {actions.length > 0 && (
          <div className="mt-4 flex space-x-3">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={`text-xs font-normal px-2 py-1 rounded-md transition-all ${
                  action.variant === 'primary'
                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Dismiss Button for older notifications */}
      {!isUnread && (
        <button
          onClick={handleDismiss}
          className="text-slate-300 hover:text-slate-500 transition-colors flex-shrink-0"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      )}
    </div>
  );
};

// Today Section
export const TodaySection = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      icon: 'alarm_on',
      iconBgColor: 'bg-white',
      iconColor: 'text-orange-400',
      title: 'Quiz Reminder',
      description: 'Biology 101: Cellular Respiration quiz starts in 15 minutes. Good luck!',
      isUnread: true,
      hasPin: true,
      rotation: 'rotate-1',
      actions: [
        {
          label: 'Start Quiz',
          variant: 'primary',
          onClick: () => console.log('Start quiz clicked'),
        },
        {
          label: 'Dismiss',
          variant: 'secondary',
          onClick: () => handleDismissNotification(1),
        },
      ],
    },
    {
      id: 2,
      icon: 'auto_fix_high',
      iconBgColor: 'bg-slate-50',
      iconColor: 'text-primary',
      title: 'Note Generated',
      description: '"Modern Architecture History" has been summarized by AI. Check your library.',
      isUnread: false,
      hasClip: true,
      rotation: '-rotate-1',
      timestamp: '2 hours ago',
    },
  ]);

  const handleDismissNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <section>
      <div className="flex items-center space-x-4 mb-4">
        <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Today</h2>
        <div className="h-[1px] flex-1 bg-slate-200"></div>
      </div>
      <div className="grid gap-4">
        {notifications.map((notif) => (
          <NotificationCard
            key={notif.id}
            icon={notif.icon}
            iconBgColor={notif.iconBgColor}
            iconColor={notif.iconColor}
            title={notif.title}
            description={notif.description}
            timestamp={notif.timestamp}
            isUnread={notif.isUnread}
            actions={notif.actions}
            rotation={notif.rotation}
            hasClip={notif.hasClip}
            hasPin={notif.hasPin}
            onDismiss={() => handleDismissNotification(notif.id)}
          />
        ))}
      </div>
    </section>
  );
};

// Yesterday Section
export const YesterdaySection = () => {
  return (
    <section>
      <div className="flex items-center space-x-4 mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Yesterday</h2>
        <div className="h-[1px] flex-1 bg-slate-200"></div>
      </div>
      <div className="grid gap-4">
        <div className="paper-scrap-n relative p-3 rounded-lg rotate-1 flex items-start space-x-3">
          <div className="w-9 h-9 flex-shrink-0 bg-blue-50 rounded-xl border border-slate-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-blue-500 text-3xl">group_add</span>
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-[16px] text-slate-800">Study Collaboration</h3>
            <p className="text-slate-600 mt-1 text-[13px]">
              <span className="font-normal text-slate-900">Sarah Jenkins</span> invited you to the "Final Exams
              Prep" folder.
            </p>
            <div className="mt-4 flex space-x-3">
              <button className="bg-blue-500 text-white text-xs font-normal px-2 py-1 rounded-md hover:bg-blue-600 transition-all">
                Accept Invite
              </button>
              <button className="border border-slate-200 text-slate-500 text-xs font-normal px-2 py-1 rounded-md hover:border-slate-300 transition-all">
                View Details
              </button>
            </div>
          </div>
          <div className="absolute -right-24 top-0 scribble-arrow-n text-slate-400 font-handwriting text-lg w-24 leading-tight pointer-events-none select-none">
            <svg className="mb-1" fill="none" height="30" viewBox="0 0 40 40" width="30">
              <path
                d="M35 5 Q 10 5 5 35"
                fill="none"
                stroke="currentColor"
                strokeDasharray="2 2"
                strokeWidth="1"
              ></path>
            </svg>
            Check this!
          </div>
        </div>
      </div>
    </section>
  );
};

// Last Week Section
export const LastWeekSection = () => {
  const [items, setItems] = useState([
    {
      id: 1,
      icon: 'verified_user',
      title: 'Password updated successfully',
      date: 'Oct 24, 2023',
    },
    {
      id: 2,
      icon: 'cloud_done',
      title: 'Backup complete',
      date: 'Oct 22, 2023',
    },
  ]);

  const handleDismiss = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <section>
      <div className="flex items-center space-x-4 mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Last Week</h2>
        <div className="h-[1px] flex-1 bg-slate-200"></div>
      </div>
      <div className="grid gap-4 opacity-70">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`paper-scrap-n p-4 rounded-lg ${index % 2 === 0 ? '-rotate-1' : 'rotate-1'} flex items-center justify-between`}
          >
            <div className="flex items-center space-x-4">
              <span className="material-symbols-outlined text-slate-400">{item.icon}</span>
              <div>
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="text-[10px] text-slate-400 uppercase">{item.date}</p>
              </div>
            </div>
            <button
              onClick={() => handleDismiss(item.id)}
              className="text-slate-300 hover:text-slate-500 transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

// Footer Section
export const NotificationsFooter = () => {
  return (
    <div className="mt-20 pt-10 border-t border-slate-200 border-dashed flex justify-between items-center text-slate-400">
      <p className="font-handwriting text-xl rotate-2">End of the roll...</p>
      
    </div>
  );
};



// Main Notifications Page
export const Notifications = () => {
  return (
    <main className="flex-1 lg:ml-64 p-3 lg:p-8 pt-20 lg:pt-8 min-h-screen relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-20 right-20 opacity-10 pointer-events-none rotate-12">
        <span className="material-symbols-outlined text-[120px]">coffee</span>
      </div>
      <div className="absolute bottom-10 left-10 opacity-10 pointer-events-none -rotate-12">
        <span className="material-symbols-outlined text-[80px]">gesture</span>
      </div>

      <div className="max-w-4xl mx-auto">
        <NotificationsHeader />

        <div className="space-y-12">
          <TodaySection />
          <YesterdaySection />
          <LastWeekSection />
        </div>

        <NotificationsFooter />
      </div>
    </main>
  );
};

