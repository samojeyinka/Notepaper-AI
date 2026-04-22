import { useState, useRef, useEffect } from 'react';

// Header Component
export const StudyPlannerHeader = () => {
  return (
    <header className="p-4 flex md:items-center justify-between flex-col md:flex-row">
      <div>
        <h1 className="text-xl font-display font-semibold">Study Planner</h1>
        <p className="text-slate-400 text-[14px] mt-1">AI-optimized schedule for your exams.</p>
      </div>
    </header>
  );
};

// Calendar Day Cell Component - Reusable
export const CalendarDay = ({
  day,
  isCurrentMonth,
  isToday = false,
  hasEvent = false,
  eventType = 'quiz',
  eventColor = 'bg-green-500',
  onClick,
}) => {
  if (!day) {
    return <div className="aspect-square p-1 border border-slate-100  rounded-xl opacity-30">{''}</div>;
  }

  // Today's cell
  if (isToday) {
    return (
      <div className="aspect-square p-2 bg-purple-500/5 border-2 border-purple-500 rounded-3xl relative cursor-pointer hover:bg-purple-500/10 transition-all" onClick={onClick}>
        <span className="font-bold text-purple-500">{day}</span>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 bg-purple-500 text-white pentagon flex items-center justify-center">
            <span className="material-icons-round text-sm">history_edu</span>
          </div>
        </div>
      </div>
    );
  }

  // Event cells
  if (hasEvent && eventType === 'quiz') {
    return (
      <div className="aspect-square p-1 border border-slate-100  rounded-2xl relative cursor-pointer hover:border-slate-200  transition-all" onClick={onClick}>
        <span>{day}</span>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-7 h-7 bg-green-500/20 blob-shape-1 flex items-center justify-center">
            <span className="material-icons-round text-green-500 text-xs">quiz</span>
          </div>
        </div>
      </div>
    );
  }

  if (hasEvent && eventType === 'study') {
    return (
      <div className="aspect-square p-1 border border-slate-100  rounded-xl relative cursor-pointer hover:border-slate-200  transition-all" onClick={onClick}>
        <span>{day}</span>
        <div className="absolute inset-x-2 bottom-2">
          <div className="h-1 bg-purple-500 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (hasEvent && eventType === 'task') {
    return (
      <div className="aspect-square p-2 border border-slate-100  rounded-xl relative cursor-pointer hover:border-slate-200  transition-all" onClick={onClick}>
        <span>{day}</span>
        <div className="absolute -right-2 -bottom-2 w-8 h-8 bg-yellow-400/20 hexagon"></div>
      </div>
    );
  }

  // Default cell
  return (
    <div className="aspect-square p-2 border border-slate-100  rounded-xl cursor-pointer hover:bg-slate-50  transition-all" onClick={onClick}>
      <span>{day}</span>
    </div>
  );
};

// Main Calendar Component - Functional with state
export const StudyCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2023, 9, 1)); // October 2023

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentDate);
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);

  // Generate array of days
  const days = [];
  // Previous month days
  const prevMonthDays = getDaysInMonth(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    days.push(null);
  }
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  // Events mapping
  const eventDays = {
    2: { type: 'quiz', color: 'bg-green-500' },
    5: { type: 'study', color: 'bg-purple-500' },
    9: { type: 'task', color: 'bg-yellow-400' },
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="bg-white  rounded-[2rem] p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[15px] font-display font-semibold">{monthName}</h2>
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-slate-100  rounded-xl transition-all"
          >
            <span className="material-icons-round">chevron_left</span>
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-slate-100  rounded-xl transition-all"
          >
            <span className="material-icons-round">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day names */}
        {weekDays.map((day) => (
          <div key={day} className="text-center text-[10px] font-medium text-slate-400 uppercase tracking-widest pb-4">
            {day}
          </div>
        ))}

        {/* Days */}
        {days.map((day, index) => (
          <CalendarDay
            key={index}
            day={day}
            isCurrentMonth={day !== null}
            isToday={day === 7}
            hasEvent={day ? day in eventDays : false}
            eventType={day && day in eventDays ? eventDays[day].type : 'quiz'}
            onClick={() => {
              if (day) console.log(`Clicked day ${day}`);
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Task Card Component - Reusable
export const TaskCard = ({
  icon,
  title,
  description,
  buttonText,
  bgColor,
  borderColor,
  buttonColor,
  textColor,
  onClick,
}) => {
  const shapeClass = buttonText.includes('QUIZ') ? 'rounded-full' : 'blob-shape-2';

  return (
    <div className={`${bgColor} p-3 rounded-[1rem] border-2 border-dashed ${borderColor} flex gap-4 items-start hover:shadow-md transition-all`}>
      <div className={`w-8 h-8 ${buttonColor} text-white ${shapeClass} flex items-center justify-center flex-shrink-0`}>
        <span className="material-icons-round">{icon}</span>
      </div>
      <div>
        <h3 className="font-semibold text-[16px]">{title}</h3>
        <p className="text-[13px] text-slate-600  mt-1">{description}</p>
        <button
          onClick={onClick}
          className={`mt-4 text-[11px] font-medium ${textColor} flex items-center gap-1 hover:gap-2 transition-all`}
        >
          {buttonText} <span className="material-icons-round text-xs">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

// Task Cards Section
export const TodayTasksSection = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <TaskCard
        icon="lightbulb"
        title="Daily Concept Review"
        description="Focus on Mitochondria structure for 20 mins."
        buttonText="START NOW"
        bgColor="bg-yellow-400/10"
        borderColor="border-yellow-400/20"
        buttonColor="bg-yellow-400"
        textColor="text-yellow-400"
        onClick={() => console.log('Start concept review')}
      />
      <TaskCard
        icon="psychology"
        title="AI Practice Quiz"
        description="Generated from your 'Cell Biology' note."
        buttonText="TAKE QUIZ"
        bgColor="bg-green-500/10"
        borderColor="border-green-500/20"
        buttonColor="bg-green-500"
        textColor="text-green-500"
        onClick={() => console.log('Take quiz')}
      />
    </div>
  );
};

// Alert Card Component
export const MissedQuizAlert = ({ title, message, onReschedule, onClose }) => {
  return (
    <div className="bg-rose-50  border-2 border-rose-100  p-3 rounded-[1rem] relative overflow-hidden hover:shadow-md transition-all">
      <div className="absolute -right-4 -top-4 text-rose-100 ">
        <span className="material-icons-round text-8xl">error_outline</span>
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 text-rose-500 mb-1.5">
          <span className="material-icons-round text-[12px]">notification_important</span>
          <span className="text-[10px] font-normal uppercase tracking-wider">Missed Quiz Alert</span>
        </div>
        <h3 className="font-semibold text-[15px] mb-2">{title}</h3>
        <p className="text-[12px] text-slate-600  leading-relaxed mb-3">{message}</p>
        <div className="flex gap-2">
          <button
            onClick={onReschedule}
            className="flex-1 bg-rose-500 text-white py-1.5 rounded-xl font-bold text-[12px] shadow-md shadow-rose-200 hover:bg-rose-600 transition-all"
          >
            Reschedule
          </button>
          <button
            onClick={onClose}
            className="p-1.5 bg-whi rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
          >
            <span className="material-icons-round">close</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Up Next Task Item Component - Reusable
export const UpNextTask = ({ icon, title, time, isActive = false, bgColor, iconColor }) => {
  return (
    <div className="flex items-center gap-4 group">
      <div
        className={`w-7 h-7 ${bgColor} rounded-xl flex items-center justify-center ${iconColor} group-hover:text-white transition-all duration-300 ${
          isActive ? bgColor + ' text-white' : ''
        }`}
      >
        <span className="material-icons-round">{icon}</span>
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-[13px]">{title}</h4>
        <p className="text-[10px] font-normal text-slate-400">{time}</p>
      </div>
      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-slate-200'}`}></div>
    </div>
  );
};

// Up Next Section
export const UpNextSection = () => {
  return (
    <div className="bg-white  p-4 rounded-[1.5rem] shadow-sm">
      <h2 className="text-[16px] font-display font-semibold mb-3">Up Next</h2>
      <div className="space-y-3">
        <UpNextTask
          icon="menu_book"
          title="Reading: Macroeconomics"
          time="14:00 - 15:30"
          bgColor="bg-purple-500/10"
          iconColor="text-purple-500"
        />
        <UpNextTask
          icon="edit"
          title="Summary Drafting"
          time="16:00 - 17:00"
          bgColor="bg-yellow-400/10"
          iconColor="text-yellow-400"
        />
        <UpNextTask
          icon="groups"
          title="Study Group Sync"
          time="18:30 - 19:30"
          bgColor="bg-green-500/10"
          iconColor="text-green-500"
          isActive={true}
        />
      </div>
      <button className="w-full text-[13px] font-normal mt-7 py-2 border-2 border-dashed border-slate-200  rounded-xl text-slate-400 hover:border-purple-500 hover:text-purple-500 transition-all flex items-center justify-center gap-2">
        <span className="material-icons-round text-sm">add</span> Add Custom Task
      </button>
    </div>
  );
};


// Complete Right Sidebar Section
export const RightSidebarSection = () => {
  const [showAlert, setShowAlert] = useState(true);

  return (
    <div className="space-y-3">
      {showAlert && (
        <MissedQuizAlert
          title="Organic Chem Basics"
          message="You missed yesterday's scheduled quiz. AI suggests rescheduling for tomorrow morning when your focus is highest."
          onReschedule={() => console.log('Rescheduled')}
          onClose={() => setShowAlert(false)}
        />
      )}
      <UpNextSection />
    </div>
  );
};


// ── Mock plans data ───────────────────────────────────────────────────────────
const MOCK_PLANS = [
  {
    id: 1,
    name: 'Finals Week — Biology',
    subject: 'Biology',
    desc: 'Cell structure, respiration & photosynthesis deep dive',
    icon: 'science',
    dateRange: 'Apr 21 – Apr 27',
    sessionsLeft: 5,
    sessionsTotal: 14,
    progress: 68,
    status: 'active',
    statusLabel: 'Active Now',
    hex: '#10b981',
    bannerBg: '#6bfb91',
    bannerText: '#00481e',
    iconContainerBg: 'rgba(0,72,30,0.12)',
    progressBarColor: '#005d29',
  },
  {
    id: 2,
    name: 'Midterm Prep — Macroeconomics',
    subject: 'Economics',
    desc: 'Mastering Market Dynamics & Fiscal Policy',
    icon: 'trending_up',
    dateRange: 'Apr 28 – May 3',
    sessionsLeft: 12,
    sessionsTotal: 12,
    progress: 42,
    status: 'upcoming',
    statusLabel: 'Upcoming',
    hex: '#f59e0b',
    bannerBg: '#fdc003',
    bannerText: '#3d2b00',
    iconContainerBg: 'rgba(61,43,0,0.12)',
    progressBarColor: '#755700',
  },
  {
    id: 3,
    name: 'Organic Chemistry Catch-up',
    subject: 'Chemistry',
    desc: 'Carbon-based reactions & functional groups',
    icon: 'biotech',
    dateRange: 'May 5 – May 10',
    sessionsLeft: 8,
    sessionsTotal: 8,
    progress: 15,
    status: 'upcoming',
    statusLabel: 'Starting Soon',
    hex: '#6541c4',
    bannerBg: '#6541c4',
    bannerText: '#f7f0ff',
    iconContainerBg: 'rgba(247,240,255,0.15)',
    progressBarColor: '#ab8eff',
  },
  {
    id: 4,
    name: 'World History — Renaissance',
    subject: 'History',
    desc: 'The Renaissance and Scientific Revolution',
    icon: 'history_edu',
    dateRange: 'May 12 – May 16',
    sessionsLeft: 2,
    sessionsTotal: 18,
    progress: 88,
    status: 'almost',
    statusLabel: 'Almost Done',
    hex: '#006a2f',
    bannerBg: '#006a2f',
    bannerText: '#ceffd1',
    iconContainerBg: 'rgba(206,255,209,0.15)',
    progressBarColor: '#6bfb91',
  },
];

const STATUS_META = {
  active:   { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  upcoming: { bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-400'   },
  almost:   { bg: 'bg-blue-100',    text: 'text-blue-700',    dot: 'bg-blue-500'    },
  paused:   { bg: 'bg-red-100',     text: 'text-red-600',     dot: 'bg-red-500'     },
  completed:{ bg: 'bg-slate-100',   text: 'text-slate-500',   dot: 'bg-slate-400'   },
};

// ── Auto-sliding banner ───────────────────────────────────────────────────────
const HeroBanner = ({ plans, onOpen }) => {
  const featured = plans.filter(p => p.progress > 0 || p.status === 'active');
  const slides   = featured.length ? featured : plans;
  const [idx, setIdx]         = useState(0);
  const [fade, setFade]       = useState(true);
  const [style, setStyle]     = useState(0); // 0 = green card style, 1 = bold purple style
  const intervalRef           = useRef(null);

  const goTo = (next, newStyle) => {
    setFade(false);
    setTimeout(() => {
      setIdx(next);
      setStyle(newStyle ?? (next % 2));
      setFade(true);
    }, 250);
  };

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      goTo((idx + 1) % slides.length, (idx + 1) % 2);
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, [idx, slides.length]);

  const plan = slides[idx];

  return (
    <div className="mb-10 relative">
      {/* Banner */}
      <div
        className="rounded-2xl overflow-hidden shadow-lg relative cursor-pointer"
        style={{
          transition: 'opacity 250ms ease',
          opacity: fade ? 1 : 0,
          background: style === 0 ? plan.bannerBg : plan.hex,
        }}
        onClick={() => onOpen(plan)}
      >
        {/* Style 0 — soft card (like HTML1 green) */}
        {style === 0 && (
          <div className="p-8 md:p-10 relative overflow-hidden">
            {/* Glow blob */}
            <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ background: plan.progressBarColor }} />
            <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest"
                    style={{ background: 'rgba(0,0,0,0.12)', color: plan.bannerText }}>
                    {plan.statusLabel}
                  </span>
                  <span className="text-[13px] font-medium opacity-70" style={{ color: plan.bannerText }}>
                    {plan.dateRange}
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight" style={{ color: plan.bannerText }}>
                  {plan.name}
                </h2>
                <div className="mb-8 max-w-sm">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[13px] font-bold" style={{ color: plan.bannerText }}>Overall Progress</span>
                    <span className="text-2xl font-black" style={{ color: plan.bannerText }}>{plan.progress}%</span>
                  </div>
                  <div className="h-3 w-full rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.12)' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${plan.progress}%`, background: plan.progressBarColor }} />
                  </div>
                </div>
                <span className="inline-flex items-center gap-2 font-bold text-[15px]" style={{ color: plan.bannerText }}>
                  Open Full Plan
                  <span className="material-icons-round text-[18px]">arrow_forward</span>
                </span>
              </div>
              <div className="hidden md:flex w-40 h-40 rounded-2xl items-center justify-center border rotate-3 shadow-2xl"
                style={{ background: plan.iconContainerBg, borderColor: 'rgba(255,255,255,0.3)' }}>
                <span className="material-icons-round text-[72px]" style={{ color: plan.bannerText }}>{plan.icon}</span>
              </div>
            </div>
          </div>
        )}

        {/* Style 1 — bold hero (like HTML2 purple) */}
        {style === 1 && (
          <div className="p-8 md:p-10 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none"
              style={{ background: 'radial-gradient(circle at 80% 50%, #fff 0%, transparent 60%)' }} />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1 max-w-2xl">
                <span className="px-4 py-1 rounded-full text-[12px] font-bold uppercase tracking-widest mb-4 inline-block"
                  style={{ background: 'rgba(255,255,255,0.2)', color: plan.bannerText }}>
                  Priority Mission
                </span>
                <h1 className="text-3xl md:text-5xl font-extrabold mt-3 leading-tight" style={{ color: plan.bannerText }}>
                  {plan.name}
                </h1>
                <p className="text-[15px] mt-4 font-normal opacity-80" style={{ color: plan.bannerText }}>
                  {plan.desc}. Prepare with a tailored review schedule designed for high retention.
                </p>
                <div className="flex gap-3 mt-7">
                  <button
                    className="px-6 py-2.5 rounded-xl font-bold text-[13px] hover:scale-105 transition-transform shadow"
                    style={{ background: plan.bannerText, color: plan.hex }}
                  >
                    Start Review
                  </button>
                  <button
                    className="px-6 py-2.5 rounded-xl font-bold text-[13px] border hover:opacity-80 transition-opacity"
                    style={{ borderColor: 'rgba(255,255,255,0.3)', color: plan.bannerText, background: 'rgba(255,255,255,0.1)' }}
                  >
                    Edit Schedule
                  </button>
                </div>
              </div>
              <div className="hidden md:flex w-40 h-40 rounded-2xl items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}>
                <span className="material-icons-round text-[80px]" style={{ color: plan.bannerText }}>{plan.icon}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-2 mt-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); goTo(i, i % 2); }}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === idx ? 20 : 6,
              height: 6,
              background: i === idx ? '#6541c4' : '#d1d5da',
            }}
          />
        ))}
      </div>
    </div>
  );
};

// ── Plan grid card ────────────────────────────────────────────────────────────
const PlanGridCard = ({ plan, onOpen, onGenerate }) => {
  if (!plan) {
    return (
      <button onClick={onGenerate}
        className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-slate-400 hover:border-purple-400 hover:text-purple-500 transition-all group min-h-[220px]">
        <div className="w-14 h-14 rounded-full bg-slate-100 group-hover:bg-purple-50 flex items-center justify-center mb-4 transition-colors">
          <span className="material-icons-round text-3xl">add_circle</span>
        </div>
        <span className="text-[15px] font-bold">New Study Plan</span>
        <p className="text-[12px] text-center mt-1.5 opacity-60">Create a custom schedule for your next big goal.</p>
      </button>
    );
  }
  const sm = STATUS_META[plan.status] ?? STATUS_META.upcoming;
  return (
    <button onClick={() => onOpen(plan)}
      className="bg-white p-7 rounded-2xl shadow-[0_10px_30px_rgba(44,47,50,0.06)] hover:-translate-y-1 transition-all duration-300 text-left group">
      {/* Icon */}
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
        style={{ background: plan.hex + '22', boxShadow: `0 8px 20px ${plan.hex}22` }}>
        <span className="material-icons-round text-[22px]" style={{ color: plan.hex }}>{plan.icon}</span>
      </div>
      <h4 className="text-[17px] font-bold mb-1.5 text-slate-800">{plan.name}</h4>
      <p className="text-[12px] text-slate-500 mb-5 leading-relaxed">{plan.desc}</p>
      {/* Progress */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Progress</span>
        <span className="text-[12px] font-bold" style={{ color: plan.hex }}>{plan.progress}%</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-5">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${plan.progress}%`, background: plan.hex }} />
      </div>
      <div className="flex justify-between items-center text-[12px] font-medium text-slate-400">
        <span>{plan.sessionsLeft} Sessions Left</span>
        <span className={`${sm.bg} ${sm.text} px-2.5 py-1 rounded-lg font-bold text-[11px] uppercase tracking-wide`}>
          {plan.statusLabel}
        </span>
      </div>
    </button>
  );
};

// ── Plan list row ─────────────────────────────────────────────────────────────
const PlanListRow = ({ plan, onOpen }) => {
  const sm = STATUS_META[plan.status] ?? STATUS_META.upcoming;
  const actionLabel = plan.status === 'active' ? 'Resume' : plan.status === 'almost' ? 'Finalize' : 'View Plan';
  return (
    <button onClick={() => onOpen(plan)}
      className="bg-white p-5 rounded-2xl shadow-[0_10px_30px_rgba(44,47,50,0.06)] hover:-translate-y-0.5 transition-transform flex flex-col md:flex-row items-center gap-6 group text-left w-full">
      {/* Icon */}
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
        style={{ background: plan.hex + '18' }}>
        <span className="material-icons-round text-[28px]" style={{ color: plan.hex }}>{plan.icon}</span>
      </div>
      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="text-[16px] font-bold text-slate-800">{plan.name}</h3>
          <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${sm.bg} ${sm.text} hidden md:block`}>
            {plan.statusLabel.toUpperCase()}
          </span>
        </div>
        <p className="text-[12px] text-slate-500 mb-3">{plan.desc}</p>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${plan.progress}%`, background: plan.hex }} />
          </div>
          <span className="text-[13px] font-bold text-slate-700 shrink-0">{plan.progress}%</span>
        </div>
      </div>
      {/* Right section */}
      <div className="flex flex-row md:flex-col items-center md:items-end gap-3 md:gap-1.5 md:pl-6 md:border-l border-slate-100 shrink-0 w-full md:w-auto justify-between md:justify-start">
        <div className="text-right hidden md:block">
          <span className="text-[11px] text-slate-400 font-medium block">Sessions Left</span>
          <span className="text-[17px] font-bold text-slate-800">{plan.sessionsLeft}</span>
        </div>
        <span className={`text-[12px] font-bold flex items-center gap-1 group-hover:underline`} style={{ color: plan.hex }}>
          {actionLabel}
          <span className="material-icons-round text-[15px]">arrow_forward</span>
        </span>
      </div>
    </button>
  );
};

// ── Plans landing screen ──────────────────────────────────────────────────────
const PlansLandingScreen = ({ onOpen, onGenerate }) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  return (
    <main className="flex-1 h-full overflow-y-auto bg-slate-50 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8">

      {/* Hero header */}
      <section className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">Study Planner</h1>
          <p className="text-[15px] text-slate-500 font-medium mt-1">AI-optimized schedules for your creative peak.</p>
        </div>
        <button
          onClick={onGenerate}
          className="px-6 py-3 rounded-xl font-bold text-[13px] text-white shadow-xl flex items-center gap-2.5 hover:scale-105 active:scale-95 transition-transform"
          style={{ background: '#6541c4', boxShadow: '0 8px 24px rgba(101,65,196,0.3)' }}
        >
          <span className="material-icons-round text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          Generate Plan
        </button>
      </section>

      {/* Auto-sliding hero banner */}
      <HeroBanner plans={MOCK_PLANS} onOpen={onOpen} />

      {/* Collection header */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-[22px] font-bold text-slate-900">Your Curated Collection</h3>
            <p className="text-[13px] text-slate-500 mt-0.5">Managed study tracks and active research plans</p>
          </div>
          {/* Grid / List toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-purple-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <span className="material-icons-round text-[20px]">grid_view</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-purple-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <span className="material-icons-round text-[20px]">view_list</span>
            </button>
          </div>
        </div>

        {/* Grid view */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_PLANS.map(plan => (
              <PlanGridCard key={plan.id} plan={plan} onOpen={onOpen} onGenerate={onGenerate} />
            ))}
            <PlanGridCard plan={null} onOpen={onOpen} onGenerate={onGenerate} />
          </div>
        )}

        {/* List view */}
        {viewMode === 'list' && (
          <div className="flex flex-col gap-4">
            {MOCK_PLANS.map(plan => (
              <PlanListRow key={plan.id} plan={plan} onOpen={onOpen} />
            ))}
          </div>
        )}
      </section>

      {/* Bottom action row */}
      <section className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
        <button
          onClick={onGenerate}
          className="bg-white p-7 rounded-2xl border-2 border-dashed border-slate-200 flex items-center gap-5 group cursor-pointer hover:border-purple-300 transition-colors"
        >
          <div className="w-12 h-12 rounded-full bg-purple-50 group-hover:bg-purple-100 flex items-center justify-center text-purple-500 transition-colors shrink-0">
            <span className="material-icons-round text-[22px]">add</span>
          </div>
          <div className="text-left">
            <h4 className="font-bold text-[15px] text-slate-800">Create New Study Track</h4>
            <p className="text-[12px] text-slate-500 mt-0.5">Organise your next academic module</p>
          </div>
        </button>
        <button
          onClick={onGenerate}
          className="bg-white p-7 rounded-2xl border-2 border-dashed border-slate-200 flex items-center gap-5 group cursor-pointer hover:border-emerald-300 transition-colors"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center text-emerald-500 transition-colors shrink-0">
            <span className="material-icons-round text-[22px]">auto_awesome</span>
          </div>
          <div className="text-left">
            <h4 className="font-bold text-[15px] text-slate-800">AI Plan Generator</h4>
            <p className="text-[12px] text-slate-500 mt-0.5">Build a schedule based on your syllabus</p>
          </div>
        </button>
      </section>
    </main>
  );
};

// ── Plan detail screen (calendar + tasks + sidebar) ───────────────────────────
const PlanDetailScreen = ({ plan, onBack }) => (
  <main className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50 lg:ml-64 p-3 lg:p-6 pt-20 lg:pt-6">

    {/* Detail header */}
    <div className="flex items-center gap-3 mb-5 px-1">
      <button
        onClick={onBack}
        className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors shadow-sm shrink-0"
      >
        <span className="material-icons-round text-[20px]">arrow_back</span>
      </button>
      <div className="flex-1 min-w-0">
        <h1 className="text-[16px] font-display font-semibold text-slate-800 truncate">{plan.name}</h1>
        <p className="text-[12px] text-slate-400 flex items-center gap-1 mt-0.5">
          <span className="material-icons-round text-[13px]">date_range</span>
          {plan.dateRange}
        </p>
      </div>
      {/* Progress pill */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${plan.progress}%`, background: plan.hex }} />
        </div>
        <span className="text-[12px] font-semibold text-slate-500">{plan.progress}%</span>
      </div>
    </div>

    <div className="grid grid-cols-12 gap-4">
      {/* Left — Calendar + Tasks */}
      <div className="col-span-12 xl:col-span-8 space-y-4">
        <StudyCalendar />
        <TodayTasksSection />
      </div>
      {/* Right — Alerts + Up Next */}
      <div className="col-span-12 xl:col-span-4">
        <RightSidebarSection />
      </div>
    </div>
  </main>
);

// ── Create Study Plan ─────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Basics',      icon: 'edit_note'          },
  { id: 2, label: 'Materials',   icon: 'library_books'      },
  { id: 3, label: 'Schedule',    icon: 'schedule'           },
  { id: 4, label: 'Activities',  icon: 'psychology'         },
];

const MOCK_LIBRARY = {
  Notes: [
    { id: 'n1', title: 'Cell Biology — Chapter 7',       sub: 'Updated 2 days ago' },
    { id: 'n2', title: 'Macroeconomics Overview',         sub: 'Updated 5 days ago' },
    { id: 'n3', title: 'Organic Chemistry Basics',        sub: 'Updated 1 week ago' },
    { id: 'n4', title: 'History: World War II Timeline',  sub: 'Updated 3 days ago' },
    { id: 'n5', title: 'Physics — Newton\'s Laws',        sub: 'Updated today'      },
  ],
  Papers: [
    { id: 'p1', title: 'Essay: Climate Change Impact',    sub: '4 pages'  },
    { id: 'p2', title: 'Research: Genetics & DNA',        sub: '7 pages'  },
    { id: 'p3', title: 'Case Study: Supply Chains',       sub: '3 pages'  },
  ],
  Slides: [
    { id: 's1', title: 'Cell Respiration Presentation',   sub: '12 slides' },
    { id: 's2', title: 'Macro Policy Overview',           sub: '8 slides'  },
  ],
  Flashcards: [
    { id: 'f1', title: 'Biology Terms Deck',              sub: '34 cards' },
    { id: 'f2', title: 'Economics Vocabulary',            sub: '20 cards' },
    { id: 'f3', title: 'Organic Chemistry Reactions',     sub: '28 cards' },
  ],
};

const TAB_ICONS = { Notes: 'description', Papers: 'article', Slides: 'present_to_all', Flashcards: 'style' };
const TAB_COLORS = { Notes: 'text-purple-500', Papers: 'text-blue-500', Slides: 'text-indigo-500', Flashcards: 'text-pink-500' };
const TAB_BG    = { Notes: 'bg-purple-500/10', Papers: 'bg-blue-500/10', Slides: 'bg-indigo-500/10', Flashcards: 'bg-pink-500/10' };

const MaterialPickerModal = ({ tab, setTab, search, setSearch, selected, onToggle, onClose }) => {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const items = (MOCK_LIBRARY[tab] ?? []).filter(i =>
    i.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
      <div ref={ref}
        className="bg-white w-full sm:max-w-md rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: '85vh' }}>

        {/* Modal header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100 shrink-0">
          <h3 className="font-display font-semibold text-[15px]">Add Materials</h3>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
            <span className="material-icons-round text-[18px]">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pt-3 pb-2 shrink-0 overflow-x-auto">
          {Object.keys(MOCK_LIBRARY).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold whitespace-nowrap transition-all ${
                tab === t ? `${TAB_BG[t]} ${TAB_COLORS[t]}` : 'text-slate-400 hover:bg-slate-50'
              }`}>
              <span className="material-icons-round text-[14px]">{TAB_ICONS[t]}</span>
              {t}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="px-4 pb-2 shrink-0">
          <div className="relative">
            <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-[16px]">search</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={`Search ${tab.toLowerCase()}…`}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-[13px] outline-none focus:border-purple-400 transition-colors" />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1.5">
          {items.length === 0 && (
            <div className="py-10 flex flex-col items-center gap-2 text-slate-300">
              <span className="material-icons-round text-4xl">search_off</span>
              <p className="text-[13px]">Nothing found</p>
            </div>
          )}
          {items.map(item => {
            const checked = selected[tab]?.includes(item.id);
            return (
              <button key={item.id} onClick={() => onToggle(tab, item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${
                  checked
                    ? `${TAB_BG[tab]} border-current/20 ring-1 ring-inset ${TAB_COLORS[tab].replace('text-','ring-')}`
                    : 'border-slate-100 hover:bg-slate-50'
                }`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${checked ? TAB_BG[tab] : 'bg-slate-100'}`}>
                  <span className={`material-icons-round text-[16px] ${checked ? TAB_COLORS[tab] : 'text-slate-400'}`}>
                    {TAB_ICONS[tab]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-slate-800 truncate">{item.title}</p>
                  <p className="text-[11px] text-slate-400">{item.sub}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  checked ? 'bg-purple-500 border-purple-500' : 'border-slate-300'
                }`}>
                  {checked && <span className="material-icons-round text-white text-[12px]">check</span>}
                </div>
              </button>
            );
          })}
        </div>

        {/* Done */}
        <div className="px-4 py-3 border-t border-slate-100 shrink-0">
          <button onClick={onClose}
            className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold text-[14px] transition-all active:scale-[0.98]">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const ACTIVITY_TYPES = [
  { id: 'quiz',       label: 'Quiz',          icon: 'quiz',                   desc: 'Questions to test recall',        color: 'text-green-600',  bg: 'bg-green-500/10'  },
  { id: 'concepts',   label: 'Key Concepts',  icon: 'lightbulb',              desc: 'Core ideas from your materials',  color: 'text-yellow-600', bg: 'bg-yellow-400/10' },
  { id: 'quickpoints',label: 'Quick Points',  icon: 'format_list_bulleted',   desc: 'Bite-sized bullet summaries',     color: 'text-blue-600',   bg: 'bg-blue-500/10'   },
  { id: 'flashreview',label: 'Flash Review',  icon: 'style',                  desc: 'Rapid card-based recall',         color: 'text-pink-600',   bg: 'bg-pink-500/10'   },
];

const Toggle = ({ on, onChange, label }) => (
  <button onClick={() => onChange(!on)}
    className={`relative flex items-center w-11 h-6 rounded-full transition-colors shrink-0 ${on ? 'bg-purple-500' : 'bg-slate-200'}`}>
    <div className={`absolute w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${on ? 'right-1' : 'left-1'}`} />
    <span className="sr-only">{label}</span>
  </button>
);

const StepDots = ({ current, total }) => (
  <div className="flex items-center gap-1.5">
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} className={`rounded-full transition-all duration-300 ${
        i + 1 === current ? 'w-5 h-2 bg-purple-500' :
        i + 1 < current  ? 'w-2 h-2 bg-purple-300' :
                           'w-2 h-2 bg-slate-200'
      }`} />
    ))}
  </div>
);

const CreateStudyPlanScreen = ({ onBack, onCreated }) => {
  const [step, setStep] = useState(1);

  // Step 1 — Basics
  const [name, setName]             = useState('');
  const [description, setDescription] = useState('');
  const [aiPrompt, setAiPrompt]     = useState('');
  const [deepResearch, setDeepResearch] = useState(false);

  // Step 2 — Materials
  const [selected, setSelected]     = useState({ Notes: [], Papers: [], Slides: [], Flashcards: [] });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTab, setPickerTab]   = useState('Notes');
  const [pickerSearch, setPickerSearch] = useState('');

  const toggleMaterial = (tab, id) => {
    setSelected(prev => {
      const list = prev[tab];
      return { ...prev, [tab]: list.includes(id) ? list.filter(x => x !== id) : [...list, id] };
    });
  };
  // Step 3 — Schedule
  const [startDate, setStartDate]   = useState('');
  const [endDate, setEndDate]       = useState('');
  const [studyFrom, setStudyFrom]   = useState('20:00');
  const [studyTo, setStudyTo]       = useState('23:00');
  const [activeDays, setActiveDays] = useState(['Mon','Tue','Wed','Thu','Fri']);
  const [reminderEmail, setReminderEmail] = useState('');
  const toggleDay = (d) => setActiveDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  // Step 4 — Activities
  const [enabledActivities, setEnabledActivities] = useState({ quiz: true, concepts: true, quickpoints: false, flashreview: false });
  const [quizMode, setQuizMode]     = useState('options');
  const [quizCount, setQuizCount]   = useState(5);
  const [conceptCount, setConceptCount] = useState(5);
  const [quickCount, setQuickCount] = useState(5);
  const [flashCount, setFlashCount] = useState(10);
  const [schedInterval, setSchedInterval] = useState('daily');
  const [shuffleTypes, setShuffleTypes] = useState(true);
  const [shuffleDays, setShuffleDays]   = useState(false);

  const toggleActivity = (id) => setEnabledActivities(prev => ({ ...prev, [id]: !prev[id] }));

  const canNext = step === 1 ? name.trim().length > 0 : true;
  const isLast = step === STEPS.length;
  const selectedCount = (tab) => selected[tab]?.length ?? 0;
  const totalSelected = Object.values(selected).reduce((a, b) => a + b.length, 0);

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#f5f6fa] lg:ml-64 pt-16 lg:pt-0">

      {/* Minimal sticky top bar */}
      <div className="sticky top-0 z-20 bg-[#f5f6fa]/90 backdrop-blur px-6 py-4 flex items-center justify-between border-b border-[#e0e2e8]/60">
        <button onClick={onBack}
          className="flex items-center gap-2 text-[#2c2f32] hover:opacity-70 transition-opacity font-semibold text-[14px]">
          <span className="material-icons-round text-[20px]">arrow_back</span>
          <span className="hidden sm:inline">Study Planner</span>
        </button>
        <span className="text-[13px] font-extrabold text-[#6541c4] tracking-wide">
          Step {step} of 4
        </span>
      </div>

      {/* Page content */}
      <div className="max-w-4xl mx-auto w-full px-4 md:px-6 py-8 pb-36">

        {/* ── Step 1: Basics ── */}
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left panel */}
            <div className="md:col-span-5 space-y-6">
              <div className="space-y-3">
                <span className="inline-block px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase"
                  style={{ background: '#ab8eff', color: '#290070' }}>Step 1 of 4</span>
                <h1 className="text-4xl md:text-5xl font-extrabold text-[#2c2f32] leading-tight tracking-tight">
                  Let's set the foundation.
                </h1>
                <p className="text-[#595c5f] text-[17px] leading-relaxed">
                  Give your study plan a clear identity. Our AI will use these details to curate the perfect learning path for you.
                </p>
              </div>
              {/* Decorative card */}
              <div className="relative rounded-2xl overflow-hidden h-56 shadow-2xl">
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,#6541c4 0%,#9f7dff 100%)' }} />
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E\")" }} />
                <div className="absolute top-6 right-6 w-20 h-20 rounded-2xl flex items-center justify-center opacity-25"
                  style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <span className="material-icons-round text-white text-[48px]">edit_note</span>
                </div>
                <div className="absolute bottom-6 left-6 text-white">
                  <p className="text-sm font-medium opacity-80">Current Focus</p>
                  <p className="text-2xl font-extrabold">Plan Basics</p>
                </div>
              </div>
            </div>

            {/* Right panel — form */}
            <div className="md:col-span-7 bg-white rounded-2xl p-8 md:p-10 shadow-[0_10px_30px_rgba(44,47,50,0.06)]">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#2c2f32] ml-1">
                    Plan Name <span className="text-red-400">*</span>
                  </label>
                  <input value={name} onChange={e => setName(e.target.value)}
                    placeholder='e.g., "Finals Week — Biology"'
                    className="w-full bg-[#eff1f5] border-none rounded-2xl px-6 py-4 text-[#2c2f32] placeholder-[#75777a] focus:ring-2 focus:ring-[#ab8eff] transition-all outline-none text-[15px] font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#2c2f32] ml-1">Short Description</label>
                  <input value={description} onChange={e => setDescription(e.target.value)}
                    placeholder="What is this plan for?"
                    className="w-full bg-[#eff1f5] border-none rounded-2xl px-6 py-4 text-[#2c2f32] placeholder-[#75777a] focus:ring-2 focus:ring-[#ab8eff] transition-all outline-none text-[15px] font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#2c2f32] ml-1">AI Context &amp; Goals</label>
                  <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                    placeholder="Mention specific topics, exam dates, or learning styles you prefer..."
                    rows={4}
                    className="w-full bg-[#eff1f5] border-none rounded-2xl px-6 py-4 text-[#2c2f32] placeholder-[#75777a] focus:ring-2 focus:ring-[#ab8eff] transition-all outline-none resize-none text-[14px] font-medium" />
                </div>
                <div className="flex items-center justify-between p-5 bg-[#eff1f5] rounded-2xl">
                  <div>
                    <span className="block text-sm font-bold text-[#2c2f32]">Research beyond my materials</span>
                    <span className="block text-xs text-[#595c5f] mt-0.5">Allow AI to pull external academic sources</span>
                  </div>
                  <Toggle on={deepResearch} onChange={setDeepResearch} label="Deep research" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Materials ── */}
        {step === 2 && (
          <div className="space-y-8">
            <div className="space-y-3">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase"
                style={{ background: '#ab8eff', color: '#290070' }}>Step 2 of 4</span>
              <h1 className="text-4xl md:text-5xl font-extrabold text-[#2c2f32] leading-tight tracking-tight">
                Add your materials
              </h1>
              <p className="text-[#595c5f] text-[17px] leading-relaxed max-w-xl">
                Choose the types of study materials you'd like the AI to base your plan on.
              </p>
            </div>

            {/* Bento grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              {[
                { tab: 'Notes',      bg: '#6541c4', text: '#f7f0ff', blob: '#ab8eff', icon: 'description'   },
                { tab: 'Papers',     bg: '#006a2f', text: '#ceffd1', blob: '#6bfb91', icon: 'article'        },
                { tab: 'Slides',     bg: '#755700', text: '#fff1db', blob: '#fdc003', icon: 'present_to_all' },
                { tab: 'Flashcards', bg: '#5933b7', text: '#f7f0ff', blob: '#ab8eff', icon: 'style'          },
              ].map(({ tab, bg, text, blob, icon }) => {
                const cnt = selectedCount(tab);
                return (
                  <button key={tab}
                    onClick={() => { setPickerTab(tab); setPickerSearch(''); setPickerOpen(true); }}
                    className="group relative overflow-hidden bg-white rounded-2xl p-7 shadow-[0_10px_30px_rgba(44,47,50,0.06)] transition-all duration-300 hover:-translate-y-1 active:scale-95 text-left md:col-span-2">
                    <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-20 group-hover:scale-110 transition-transform duration-500"
                      style={{ background: blob }} />
                    <div className="mb-5 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                      style={{ background: bg, color: text }}>
                      <span className="material-icons-round text-[28px]">{icon}</span>
                    </div>
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className="text-xl font-bold text-[#2c2f32]">{tab}</h3>
                      {cnt > 0 && (
                        <span className="w-6 h-6 rounded-full text-white text-[11px] font-black flex items-center justify-center"
                          style={{ background: bg }}>{cnt}</span>
                      )}
                    </div>
                    <p className="text-sm text-[#595c5f] leading-relaxed">
                      {tab === 'Notes'      && 'Import PDFs, text files, or handwritten scans.'}
                      {tab === 'Papers'     && 'Add research journals and academic publications.'}
                      {tab === 'Slides'     && 'Lecture decks and presentation files.'}
                      {tab === 'Flashcards' && 'Ready-made decks or create from scratch.'}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Empty state / selected chips */}
            {totalSelected === 0 ? (
              <div className="bg-[#eff1f5] rounded-2xl p-12 text-center border-2 border-dashed border-[#abadb1]/30">
                <div className="max-w-xs mx-auto">
                  <div className="relative w-28 h-28 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-md">
                    <span className="material-icons-round text-[48px] text-[#abadb1]">inventory_2</span>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center shadow-md"
                      style={{ background: '#6bfb91', color: '#005d29' }}>
                      <span className="material-icons-round text-xl">add</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-[#2c2f32] mb-2">No materials added yet</h3>
                  <p className="text-[#595c5f] text-sm">Start by choosing a category above.</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 shadow-[0_10px_30px_rgba(44,47,50,0.06)]">
                <p className="text-[11px] font-black uppercase tracking-widest text-[#6541c4] mb-3">
                  {totalSelected} item{totalSelected !== 1 ? 's' : ''} selected
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(selected).flatMap(([tab, ids]) =>
                    ids.map(id => {
                      const item = MOCK_LIBRARY[tab].find(i => i.id === id);
                      if (!item) return null;
                      return (
                        <div key={id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold ${TAB_BG[tab]} ${TAB_COLORS[tab]}`}>
                          <span className="material-icons-round text-[13px]">{TAB_ICONS[tab]}</span>
                          <span className="truncate max-w-[140px]">{item.title}</span>
                          <button onClick={() => toggleMaterial(tab, id)} className="opacity-60 hover:opacity-100 transition-opacity">
                            <span className="material-icons-round text-[13px]">close</span>
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Step 3: Schedule ── */}
        {step === 3 && (
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-end justify-between gap-4">
              <div>
                <span className="text-[#6541c4] font-black text-sm tracking-widest uppercase mb-2 block">Step 3 of 4</span>
                <h1 className="text-4xl font-extrabold tracking-tight text-[#2c2f32]">Define Your Study Cycle</h1>
              </div>
              {/* Step progress pills */}
              <div className="hidden md:flex gap-2 items-center shrink-0">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-2 rounded-full transition-all duration-300"
                    style={{ width: i === 3 ? 64 : 32, background: i < 3 ? '#ab8eff' : i === 3 ? '#6541c4' : '#dadde2' }} />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left — dates + mini calendar */}
              <div className="lg:col-span-7">
                <div className="bg-white p-7 rounded-2xl shadow-[0_10px_30px_rgba(44,47,50,0.04)]">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#ab8eff44' }}>
                      <span className="material-icons-round text-[#6541c4]">calendar_month</span>
                    </div>
                    <h2 className="text-[18px] font-bold text-[#2c2f32]">Study Duration</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Start Date', val: startDate, set: setStartDate },
                      { label: 'End Date',   val: endDate,   set: setEndDate   },
                    ].map(({ label, val, set }) => (
                      <div key={label} className="space-y-1.5">
                        <label className="text-sm font-medium text-[#595c5f] px-1">{label}</label>
                        <div className="relative">
                          <input type="date" value={val} onChange={e => set(e.target.value)}
                            className="w-full bg-[#eff1f5] border-none rounded-2xl py-3.5 px-5 text-[#2c2f32] focus:ring-2 focus:ring-[#ab8eff] outline-none text-[14px] font-medium" />
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Mini calendar */}
                  <div className="mt-6 bg-[#e6e8ed] p-5 rounded-2xl">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-[15px] text-[#2c2f32]">October 2023</span>
                      <div className="flex gap-3">
                        <span className="material-icons-round text-[#595c5f] cursor-pointer text-[20px]">chevron_left</span>
                        <span className="material-icons-round text-[#595c5f] cursor-pointer text-[20px]">chevron_right</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-[#595c5f] mb-2">
                      {['S','M','T','W','T','F','S'].map((d, i) => <span key={i}>{d}</span>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-[12px] font-medium">
                      {['','','','','','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31'].map((d, i) => (
                        <div key={i} className={`py-1.5 rounded-full text-[11px] ${
                          d === '12' ? 'bg-[#6541c4] text-white font-bold' :
                          ['13','14','15','16','17','18','19','20'].includes(d) ? 'bg-[#ab8eff]/30 text-[#290070] font-semibold' :
                          d === '' ? '' : 'text-[#2c2f32]'
                        }`}>{d}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right — time window + days */}
              <div className="lg:col-span-5 space-y-5">
                {/* Daily window */}
                <div className="bg-white p-7 rounded-2xl shadow-[0_10px_30px_rgba(44,47,50,0.04)]">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#6bfb9144' }}>
                      <span className="material-icons-round text-[#005d29]">schedule</span>
                    </div>
                    <h2 className="text-[18px] font-bold text-[#2c2f32]">Daily Study Window</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <span className="text-[10px] font-black text-[#595c5f] uppercase tracking-widest block mb-2">From</span>
                      <input type="time" value={studyFrom} onChange={e => setStudyFrom(e.target.value)}
                        className="w-full bg-[#eff1f5] border-none rounded-xl px-4 py-3 text-[18px] font-bold text-[#2c2f32] outline-none focus:ring-2 focus:ring-[#ab8eff]" />
                    </div>
                    <span className="material-icons-round text-[#abadb1] pt-6">arrow_forward</span>
                    <div className="flex-1">
                      <span className="text-[10px] font-black text-[#595c5f] uppercase tracking-widest block mb-2">To</span>
                      <input type="time" value={studyTo} onChange={e => setStudyTo(e.target.value)}
                        className="w-full bg-[#eff1f5] border-none rounded-xl px-4 py-3 text-[18px] font-bold text-[#2c2f32] outline-none focus:ring-2 focus:ring-[#ab8eff]" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 px-1">
                    <span className="material-icons-round text-[#006a2f] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                    <p className="text-sm text-[#595c5f]">AI schedules activities within this window.</p>
                  </div>
                </div>

                {/* Active days */}
                <div className="bg-white p-7 rounded-2xl shadow-[0_10px_30px_rgba(44,47,50,0.04)] relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10 pointer-events-none"
                    style={{ background: '#fdc003' }} />
                  <div className="flex items-center gap-3 mb-7 relative z-10">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#fdc00344' }}>
                      <span className="material-icons-round text-[#553e00]">calendar_view_week</span>
                    </div>
                    <h2 className="text-[18px] font-bold text-[#2c2f32]">Active Study Days</h2>
                  </div>
                  <div className="flex justify-between items-center gap-1 relative z-10">
                    {[['S','Sun'],['M','Mon'],['T','Tue'],['W','Wed'],['T','Thu'],['F','Fri'],['S','Sat']].map(([label, day], i) => {
                      const on = activeDays.includes(day);
                      return (
                        <button key={i} onClick={() => toggleDay(day)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            on ? 'text-white shadow-lg' : 'border-2 border-[#e6e8ed] text-[#595c5f] hover:border-[#6541c4]'
                          }`}
                          style={on ? { background: '#6541c4', boxShadow: '0 4px 12px rgba(101,65,196,0.3)' } : {}}>
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-6 flex justify-between items-center px-3 py-3 bg-[#eff1f5] rounded-xl relative z-10">
                    <span className="text-sm font-medium text-[#595c5f]">Include Weekends</span>
                    <Toggle
                      on={activeDays.includes('Sat') && activeDays.includes('Sun')}
                      onChange={(v) => {
                        if (v) setActiveDays(prev => [...new Set([...prev, 'Sat', 'Sun'])]);
                        else setActiveDays(prev => prev.filter(d => d !== 'Sat' && d !== 'Sun'));
                      }}
                      label="Include weekends" />
                  </div>
                </div>

                {/* Reminder email */}
                <div className="bg-white p-7 rounded-2xl shadow-[0_10px_30px_rgba(44,47,50,0.04)]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#ab8eff44' }}>
                      <span className="material-icons-round text-[#6541c4]">mark_email_unread</span>
                    </div>
                    <h2 className="text-[18px] font-bold text-[#2c2f32]">Reminder Email</h2>
                  </div>
                  <div className="relative">
                    <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-[#abadb1] text-[18px]">mail_outline</span>
                    <input type="email" value={reminderEmail} onChange={e => setReminderEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="w-full bg-[#eff1f5] border-none rounded-2xl pl-11 pr-4 py-3.5 text-[14px] font-medium text-[#2c2f32] placeholder-[#75777a] outline-none focus:ring-2 focus:ring-[#ab8eff]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Consistency card */}
            <div className="rounded-2xl overflow-hidden flex flex-col md:flex-row items-stretch text-white shadow-xl"
              style={{ background: '#6541c4' }}>
              <div className="p-8 md:p-10 md:w-3/5">
                <h3 className="text-2xl font-extrabold mb-3">Consistency is Key</h3>
                <p className="text-white/80 leading-relaxed text-[14px]">
                  "Success is the sum of small efforts, repeated day in and day out." Based on your schedule, we'll build targeted sessions to ensure you master the curriculum before your deadline.
                </p>
              </div>
              <div className="md:w-2/5 h-36 md:h-auto flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.1)' }}>
                <span className="material-icons-round text-[80px] text-white/25">event_available</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 4: Activities ── */}
        {step === 4 && (
          <div className="space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[#6541c4] font-black text-sm tracking-widest uppercase">Step 4 of 4</span>
                <div className="h-1 w-12 bg-[#6541c4] rounded-full" />
                <div className="h-1 w-4 bg-[#dadde2] rounded-full" />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#2c2f32] mb-3">Activities Hub</h1>
              <p className="text-[#595c5f] text-[17px] leading-relaxed max-w-2xl">
                Customize how the AI generates and presents your study materials. Each activity can be tuned to your current learning pace.
              </p>
            </div>

            {/* 2×2 activity cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { ...ACTIVITY_TYPES[0], iconBg: '#ab8eff33', iconColor: '#6541c4', activeColor: '#6541c4' },
                { ...ACTIVITY_TYPES[1], iconBg: '#6bfb9133', iconColor: '#006a2f', activeColor: '#006a2f' },
                { ...ACTIVITY_TYPES[2], iconBg: '#fdc00333', iconColor: '#755700', activeColor: '#755700' },
                { ...ACTIVITY_TYPES[3], iconBg: '#fee2e2',   iconColor: '#ef4444', activeColor: '#ef4444' },
              ].map((act) => {
                const on  = enabledActivities[act.id];
                const cur = act.id === 'quiz' ? quizCount : act.id === 'concepts' ? conceptCount : act.id === 'quickpoints' ? quickCount : flashCount;
                const setCur = act.id === 'quiz' ? setQuizCount : act.id === 'concepts' ? setConceptCount : act.id === 'quickpoints' ? setQuickCount : setFlashCount;
                return (
                  <div key={act.id}
                    className={`bg-white p-7 rounded-2xl shadow-[0_10px_30px_rgba(44,47,50,0.06)] hover:-translate-y-0.5 transition-all duration-300 ${!on ? 'opacity-60' : ''}`}>
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: act.iconBg, color: act.iconColor }}>
                          <span className="material-icons-round text-[28px]">{act.icon}</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-[#2c2f32]">{act.label}</h3>
                          <p className="text-sm text-[#595c5f]">{act.desc}</p>
                        </div>
                      </div>
                      <button onClick={() => toggleActivity(act.id)}
                        className="relative flex items-center w-11 h-6 rounded-full transition-colors shrink-0 mt-1"
                        style={{ background: on ? act.activeColor : '#dadde2' }}>
                        <div className={`absolute w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${on ? 'right-0.5' : 'left-0.5'}`} />
                      </button>
                    </div>
                    <div className={`space-y-4 ${!on ? 'pointer-events-none grayscale' : ''}`}>
                      <label className="text-sm font-semibold text-[#2c2f32] block">Quantity per session</label>
                      <div className="flex flex-wrap gap-2">
                        {[5, 10, 15, 20].map(n => (
                          <button key={n} onClick={() => setCur(n)}
                            className="px-5 py-2 rounded-full text-sm font-semibold transition-all"
                            style={cur === n
                              ? { background: act.activeColor, color: '#fff', boxShadow: `0 4px 12px ${act.activeColor}44` }
                              : { background: '#e6e8ed', color: '#595c5f' }
                            }>
                            {n}
                          </button>
                        ))}
                      </div>
                      {act.id === 'quiz' && on && (
                        <div>
                          <label className="text-sm font-semibold text-[#2c2f32] block mb-2">Answer mode</label>
                          <div className="flex rounded-xl overflow-hidden bg-[#eff1f5] w-fit">
                            {[['options','Multiple choice'],['input','Open input'],['both','Both']].map(([val, lbl]) => (
                              <button key={val} onClick={() => setQuizMode(val)}
                                className="px-4 py-2 text-[12px] font-semibold transition-all"
                                style={quizMode === val ? { background: '#6541c4', color: '#fff' } : { color: '#595c5f' }}>
                                {lbl}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Global settings */}
            <div className="bg-white rounded-2xl p-7 shadow-[0_10px_30px_rgba(44,47,50,0.06)]">
              <h3 className="text-[12px] font-black uppercase tracking-widest text-[#6541c4] mb-6">Global Settings</h3>
              <div className="space-y-4">
                {[
                  {
                    title: 'Delivery interval',
                    sub: 'How often to schedule activities',
                    control: (
                      <div className="flex rounded-xl overflow-hidden bg-[#eff1f5] border border-[#e0e2e8] shrink-0">
                        {[['daily','Daily'],['every2','Every 2d'],['weekly','Weekly']].map(([val, lbl]) => (
                          <button key={val} onClick={() => setSchedInterval(val)}
                            className="px-3 py-2 text-[12px] font-semibold transition-all"
                            style={schedInterval === val ? { background: '#6541c4', color: '#fff' } : { color: '#595c5f' }}>
                            {lbl}
                          </button>
                        ))}
                      </div>
                    ),
                  },
                  { title: 'Shuffle activity types', sub: 'Randomly mix quizzes, concepts and reviews', control: <Toggle on={shuffleTypes} onChange={setShuffleTypes} label="Shuffle types" /> },
                  { title: 'Shuffle days',            sub: 'Vary the schedule day-by-day',              control: <Toggle on={shuffleDays}  onChange={setShuffleDays}  label="Shuffle days"  /> },
                ].map(({ title, sub, control }, i) => (
                  <div key={i} className="flex items-center justify-between gap-4 p-5 bg-[#eff1f5] rounded-2xl">
                    <div>
                      <p className="text-[14px] font-bold text-[#2c2f32]">{title}</p>
                      <p className="text-[12px] text-[#595c5f] mt-0.5">{sub}</p>
                    </div>
                    {control}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Fixed bottom nav (matches HTML design) ── */}
      <div className="fixed bottom-0 left-0 lg:left-64 right-0 z-50 flex justify-between items-center px-8 py-5 bg-white/90 backdrop-blur-xl rounded-t-[2rem] shadow-[0_-4px_20px_rgba(44,47,50,0.08)]">
        <button
          onClick={step > 1 ? () => setStep(s => s - 1) : onBack}
          className="flex items-center gap-2 text-[#2c2f32] px-5 py-3 rounded-xl font-semibold text-[14px] hover:bg-[#ab8eff] hover:text-white transition-all duration-300 active:scale-90">
          <span className="material-icons-round text-[20px]">arrow_back</span>
          Back
        </button>
        {!isLast ? (
          <button onClick={() => setStep(s => s + 1)} disabled={!canNext}
            className="flex items-center gap-2 text-white rounded-full px-8 py-3 font-bold text-[14px] shadow-lg transition-all duration-300 active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
            style={{ background: '#6541c4', boxShadow: '0 8px 20px rgba(101,65,196,0.25)' }}>
            Continue
            <span className="material-icons-round text-[20px]">arrow_forward</span>
          </button>
        ) : (
          <button onClick={onCreated}
            className="flex items-center gap-2 text-white rounded-full px-8 py-3 font-bold text-[14px] shadow-lg transition-all duration-300 active:scale-90 hover:opacity-90"
            style={{ background: '#6541c4', boxShadow: '0 8px 20px rgba(101,65,196,0.25)' }}>
            <span className="material-icons-round text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            Generate Plan
          </button>
        )}
      </div>

      {/* Material picker modal */}
      {pickerOpen && (
        <MaterialPickerModal
          tab={pickerTab} setTab={setPickerTab}
          search={pickerSearch} setSearch={setPickerSearch}
          selected={selected}
          onToggle={toggleMaterial}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
};

// ── Main orchestrator ─────────────────────────────────────────────────────────
export const StudyPlannerContent = () => {
  const [screen, setScreen] = useState('list'); // 'list' | 'create' | 'detail'
  const [activePlan, setActivePlan] = useState(null);

  if (screen === 'create') {
    return (
      <CreateStudyPlanScreen
        onBack={() => setScreen('list')}
        onCreated={() => setScreen('list')}
      />
    );
  }

  if (screen === 'detail' && activePlan) {
    return <PlanDetailScreen plan={activePlan} onBack={() => setScreen('list')} />;
  }

  return (
    <PlansLandingScreen
      onOpen={(plan) => { setActivePlan(plan); setScreen('detail'); }}
      onGenerate={() => setScreen('create')}
    />
  );
};

