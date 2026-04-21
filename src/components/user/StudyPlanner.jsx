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
    icon: 'science',
    dateRange: 'Apr 21 – Apr 27',
    daysTotal: 7,
    tasksTotal: 14,
    progress: 40,
    status: 'active',
    hex: '#10b981',
    color: 'bg-green-500',
    lightBg: 'bg-green-500/10',
    accent: 'text-green-600',
    ring: 'ring-green-200',
  },
  {
    id: 2,
    name: 'Midterm Prep — Macroeconomics',
    subject: 'Economics',
    icon: 'trending_up',
    dateRange: 'Apr 28 – May 3',
    daysTotal: 6,
    tasksTotal: 10,
    progress: 10,
    status: 'upcoming',
    hex: '#8b5cf6',
    color: 'bg-purple-500',
    lightBg: 'bg-purple-500/10',
    accent: 'text-purple-600',
    ring: 'ring-purple-200',
  },
  {
    id: 3,
    name: 'Organic Chemistry Catch-up',
    subject: 'Chemistry',
    icon: 'biotech',
    dateRange: 'May 5 – May 10',
    daysTotal: 6,
    tasksTotal: 8,
    progress: 0,
    status: 'upcoming',
    hex: '#f59e0b',
    color: 'bg-yellow-400',
    lightBg: 'bg-yellow-400/10',
    accent: 'text-yellow-600',
    ring: 'ring-yellow-200',
  },
  {
    id: 4,
    name: 'History Essay Prep',
    subject: 'History',
    icon: 'history_edu',
    dateRange: 'May 12 – May 16',
    daysTotal: 5,
    tasksTotal: 9,
    progress: 0,
    status: 'upcoming',
    hex: '#f43f5e',
    color: 'bg-rose-500',
    lightBg: 'bg-rose-500/10',
    accent: 'text-rose-600',
    ring: 'ring-rose-200',
  },
];

const STATUS_LABEL = {
  active:    { text: 'Active',     cls: 'bg-green-100 text-green-700' },
  upcoming:  { text: 'Upcoming',   cls: 'bg-slate-100 text-slate-500' },
  completed: { text: 'Completed',  cls: 'bg-blue-100 text-blue-600'   },
};

// ── Plans landing screen ──────────────────────────────────────────────────────
const PlansLandingScreen = ({ onOpen, onGenerate }) => (
  <main className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50 lg:ml-64 p-3 lg:p-6 pt-20 lg:pt-6">

    {/* Page header */}
    <div className="flex items-start justify-between mb-6 px-1">
      <div>
        <h1 className="text-xl font-display font-semibold text-slate-800">Study Planner</h1>
        <p className="text-slate-400 text-[13px] mt-0.5">AI-optimized schedules for every exam.</p>
      </div>
      <button
        onClick={onGenerate}
        className="bg-purple-500 hover:bg-purple-600 active:scale-95 text-[12px] text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 shadow-md shadow-purple-500/25 transition-all"
      >
        <span className="material-icons-round text-[16px]">auto_awesome</span>
        Generate Plan
      </button>
    </div>

    {/* Active plan highlight */}
    {(() => {
      const active = MOCK_PLANS.find(p => p.status === 'active');
      if (!active) return null;
      return (
        <button
          onClick={() => onOpen(active)}
          className="w-full text-left mb-6 rounded-[1.5rem] overflow-hidden shadow-md hover:shadow-xl transition-all hover:-translate-y-0.5 active:scale-[0.99]"
          style={{ background: `linear-gradient(135deg, ${active.hex}dd, ${active.hex}99)` }}
        >
          <div className="p-5 flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Currently Active</span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
              </div>
              <h2 className="text-white font-display font-bold text-[18px] leading-tight mb-1">{active.name}</h2>
              <p className="text-white/70 text-[12px] flex items-center gap-1.5">
                <span className="material-icons-round text-[13px]">date_range</span>
                {active.dateRange}
              </p>
              {/* Progress */}
              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full transition-all" style={{ width: `${active.progress}%` }} />
                </div>
                <span className="text-white font-bold text-[13px]">{active.progress}%</span>
              </div>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0">
              <span className="material-icons-round text-white text-3xl">{active.icon}</span>
            </div>
          </div>
          {/* Stats strip */}
          <div className="border-t border-white/15 px-5 py-3 flex items-center gap-6">
            <span className="text-white/70 text-[11px] flex items-center gap-1.5">
              <span className="material-icons-round text-[13px]">calendar_today</span>
              {active.daysTotal} days
            </span>
            <span className="text-white/70 text-[11px] flex items-center gap-1.5">
              <span className="material-icons-round text-[13px]">task_alt</span>
              {active.tasksTotal} tasks
            </span>
            <span className="ml-auto text-white/80 text-[11px] font-semibold flex items-center gap-1">
              Open plan <span className="material-icons-round text-[14px]">arrow_forward</span>
            </span>
          </div>
        </button>
      );
    })()}

    {/* All plans grid */}
    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3 px-1">All Plans</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {MOCK_PLANS.map(plan => {
        const statusMeta = STATUS_LABEL[plan.status];
        return (
          <button
            key={plan.id}
            onClick={() => onOpen(plan)}
            className={`group bg-white rounded-[1.25rem] border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.99] transition-all text-left overflow-hidden`}
          >
            {/* Coloured top strip */}
            <div className="h-1.5 w-full" style={{ background: plan.hex }} />

            <div className="p-4">
              {/* Icon + badge row */}
              <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 rounded-2xl ${plan.lightBg} flex items-center justify-center`}>
                  <span className={`material-icons-round text-[20px] ${plan.accent}`}>{plan.icon}</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusMeta.cls}`}>
                  {statusMeta.text}
                </span>
              </div>

              {/* Name + subject */}
              <h3 className="font-display font-semibold text-[14px] text-slate-800 leading-snug mb-0.5">{plan.name}</h3>
              <p className="text-[11px] text-slate-400 flex items-center gap-1 mb-3">
                <span className="material-icons-round text-[12px]">date_range</span>
                {plan.dateRange}
              </p>

              {/* Progress */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${plan.progress}%`, background: plan.hex }} />
                </div>
                <span className="text-[11px] text-slate-400 shrink-0">{plan.progress}%</span>
              </div>

              {/* Stats + arrow */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <span className="material-icons-round text-[12px]">calendar_today</span>
                    {plan.daysTotal}d
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <span className="material-icons-round text-[12px]">task_alt</span>
                    {plan.tasksTotal} tasks
                  </span>
                </div>
                <span className={`material-icons-round text-[18px] text-slate-200 group-hover:${plan.accent} group-hover:translate-x-0.5 transition-all`}>
                  arrow_forward
                </span>
              </div>
            </div>
          </button>
        );
      })}

      {/* Empty card — new plan */}
      <button
        onClick={onGenerate}
        className="bg-white rounded-[1.25rem] border-2 border-dashed border-slate-200 hover:border-purple-300 hover:bg-purple-500/5 transition-all group flex flex-col items-center justify-center gap-2 p-8 min-h-[160px]"
      >
        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
          <span className="material-icons-round text-purple-400 text-2xl">add</span>
        </div>
        <p className="text-[13px] font-semibold text-slate-400 group-hover:text-purple-500 transition-colors">New Study Plan</p>
      </button>
    </div>
  </main>
);

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
  const totalSelected = Object.values(selected).reduce((a, b) => a + b.length, 0);

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
  const [quizMode, setQuizMode]     = useState('options'); // 'options' | 'input' | 'both'
  const [quizCount, setQuizCount]   = useState(5);
  const [conceptCount, setConceptCount] = useState(5);
  const [quickCount, setQuickCount] = useState(5);
  const [flashCount, setFlashCount] = useState(10);
  const [interval, setInterval]     = useState('daily'); // 'daily' | 'every2' | 'weekly'
  const [shuffleTypes, setShuffleTypes] = useState(true);
  const [shuffleDays, setShuffleDays]   = useState(false);

  const toggleActivity = (id) => setEnabledActivities(prev => ({ ...prev, [id]: !prev[id] }));

  const canNext = step === 1 ? name.trim().length > 0 : true;
  const isLast = step === STEPS.length;

  const selectedCount = (tab) => selected[tab]?.length ?? 0;

  return (
    <main className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50 lg:ml-64 pt-20 lg:pt-0">

      {/* Top bar */}
      <div className="sticky top-0 lg:top-0 z-10 bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <button onClick={onBack}
          className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors shadow-sm">
          <span className="material-icons-round text-[20px]">arrow_back</span>
        </button>
        <div className="flex flex-col items-center gap-1">
          <p className="text-[13px] font-display font-semibold text-slate-700">{STEPS[step - 1].label}</p>
          <StepDots current={step} total={STEPS.length} />
        </div>
        <div className="w-9" />
      </div>

      {/* Step header */}
      <div className="px-5 pt-6 pb-2">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center">
            <span className="material-icons-round text-purple-500 text-[20px]">{STEPS[step - 1].icon}</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step {step} of {STEPS.length}</p>
            <h2 className="text-[18px] font-display font-bold text-slate-800">{STEPS[step - 1].label}</h2>
          </div>
        </div>
      </div>

      {/* ── Step 1: Basics ───────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="px-5 pb-6 space-y-4 flex-1">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Plan Name <span className="text-red-400">*</span></label>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Finals Week — Biology"
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-[14px] text-slate-800 placeholder-slate-300 outline-none focus:border-purple-400 transition-colors shadow-sm" />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
              Description <span className="text-slate-300 normal-case font-normal">(optional)</span>
            </label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="What is this study plan for?"
              rows={3}
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-[14px] text-slate-800 placeholder-slate-300 outline-none focus:border-purple-400 transition-colors shadow-sm resize-none" />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
              Extra Context for AI <span className="text-slate-300 normal-case font-normal">(optional)</span>
            </label>
            <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
              placeholder="e.g. Focus on essay questions, avoid calculations, I struggle with photosynthesis…"
              rows={3}
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-[14px] text-slate-800 placeholder-slate-300 outline-none focus:border-purple-400 transition-colors shadow-sm resize-none" />
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-start justify-between gap-4">
            <div>
              <p className="text-[13px] font-semibold text-slate-800">Research beyond my materials</p>
              <p className="text-[12px] text-slate-400 mt-0.5">AI will look up additional context and examples beyond your added notes and papers.</p>
            </div>
            <Toggle on={deepResearch} onChange={setDeepResearch} label="Deep research" />
          </div>
        </div>
      )}

      {/* ── Step 2: Materials ────────────────────────────────────────────── */}
      {step === 2 && (
        <div className="px-5 pb-6 flex-1 space-y-3">
          <p className="text-[13px] text-slate-400">Add the notes, papers, slides or flashcards you want the AI to base this plan on.</p>

          {/* Type buttons */}
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(MOCK_LIBRARY).map(tab => (
              <button key={tab} onClick={() => { setPickerTab(tab); setPickerSearch(''); setPickerOpen(true); }}
                className="bg-white border border-slate-200 rounded-2xl p-3.5 flex items-center gap-3 hover:border-purple-300 hover:shadow-sm transition-all text-left shadow-sm">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${TAB_BG[tab]}`}>
                  <span className={`material-icons-round text-[18px] ${TAB_COLORS[tab]}`}>{TAB_ICONS[tab]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-slate-700">{tab}</p>
                  <p className="text-[11px] text-slate-400">
                    {selectedCount(tab) > 0 ? `${selectedCount(tab)} added` : 'None added'}
                  </p>
                </div>
                {selectedCount(tab) > 0
                  ? <span className="w-5 h-5 rounded-full bg-purple-500 text-white text-[10px] font-bold flex items-center justify-center">{selectedCount(tab)}</span>
                  : <span className="material-icons-round text-slate-300 text-[18px]">add</span>
                }
              </button>
            ))}
          </div>

          {/* Selected chips */}
          {totalSelected > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">{totalSelected} item{totalSelected !== 1 ? 's' : ''} added</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(selected).flatMap(([tab, ids]) =>
                  ids.map(id => {
                    const item = MOCK_LIBRARY[tab].find(i => i.id === id);
                    if (!item) return null;
                    return (
                      <div key={id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium ${TAB_BG[tab]} ${TAB_COLORS[tab]}`}>
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

          {totalSelected === 0 && (
            <div className="flex flex-col items-center py-8 gap-2 text-slate-300">
              <span className="material-icons-round text-5xl">library_add</span>
              <p className="text-[13px]">No materials added yet</p>
            </div>
          )}
        </div>
      )}

      {/* ── Step 3: Schedule ─────────────────────────────────────────────── */}
      {step === 3 && (
        <div className="px-5 pb-6 flex-1 space-y-4">

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-[13px] text-slate-700 outline-none focus:border-purple-400 transition-colors shadow-sm" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">End Date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-[13px] text-slate-700 outline-none focus:border-purple-400 transition-colors shadow-sm" />
            </div>
          </div>

          {/* Daily study window */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <p className="text-[13px] font-semibold text-slate-800 mb-0.5">Daily Study Window</p>
            <p className="text-[11px] text-slate-400 mb-3">AI will schedule and deliver activities within this time window.</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">From</label>
                <input type="time" value={studyFrom} onChange={e => setStudyFrom(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[13px] text-slate-700 outline-none focus:border-purple-400 transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">To</label>
                <input type="time" value={studyTo} onChange={e => setStudyTo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[13px] text-slate-700 outline-none focus:border-purple-400 transition-colors" />
              </div>
            </div>
          </div>

          {/* Active days */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <p className="text-[13px] font-semibold text-slate-800 mb-3">Active Study Days</p>
            <div className="flex gap-2 flex-wrap">
              {DAYS_OF_WEEK.map(d => (
                <button key={d} onClick={() => toggleDay(d)}
                  className={`w-10 h-10 rounded-xl text-[12px] font-bold transition-all ${
                    activeDays.includes(d)
                      ? 'bg-purple-500 text-white shadow-sm shadow-purple-500/30'
                      : 'bg-slate-50 text-slate-400 border border-slate-200 hover:border-purple-300'
                  }`}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Email reminder */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
              Reminder Email
            </label>
            <div className="relative">
              <span className="material-icons-round absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-[18px]">mail</span>
              <input type="email" value={reminderEmail} onChange={e => setReminderEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-[14px] text-slate-800 placeholder-slate-300 outline-none focus:border-purple-400 transition-colors shadow-sm" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">We'll email you when quizzes, concepts or reviews are ready — even if you're sleeping.</p>
          </div>
        </div>
      )}

      {/* ── Step 4: Activities ───────────────────────────────────────────── */}
      {step === 4 && (
        <div className="px-5 pb-6 flex-1 space-y-4">

          {/* Activity cards */}
          <div className="space-y-2">
            {ACTIVITY_TYPES.map(act => {
              const on = enabledActivities[act.id];
              return (
                <div key={act.id}
                  className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${on ? 'border-purple-200' : 'border-slate-200'}`}>
                  {/* Header row */}
                  <div className="flex items-center gap-3 p-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${act.bg}`}>
                      <span className={`material-icons-round text-[20px] ${act.color}`}>{act.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold text-slate-800">{act.label}</p>
                      <p className="text-[11px] text-slate-400">{act.desc}</p>
                    </div>
                    <Toggle on={on} onChange={() => toggleActivity(act.id)} label={act.label} />
                  </div>

                  {/* Expanded config */}
                  {on && (
                    <div className="border-t border-slate-100 px-4 py-3 bg-slate-50/50 space-y-3">
                      {/* Count */}
                      <div className="flex items-center justify-between">
                        <p className="text-[12px] text-slate-600">
                          {act.id === 'flashreview' ? 'Cards per session' : `${act.label} per session`}
                        </p>
                        <div className="flex items-center gap-2">
                          {[3, 5, 10, 15].map(n => {
                            const cur = act.id === 'quiz' ? quizCount : act.id === 'concepts' ? conceptCount : act.id === 'quickpoints' ? quickCount : flashCount;
                            const set = act.id === 'quiz' ? setQuizCount : act.id === 'concepts' ? setConceptCount : act.id === 'quickpoints' ? setQuickCount : setFlashCount;
                            return (
                              <button key={n} onClick={() => set(n)}
                                className={`w-8 h-8 rounded-xl text-[12px] font-bold transition-all ${
                                  cur === n ? 'bg-purple-500 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-purple-300'
                                }`}>
                                {n}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Quiz-specific: answer mode */}
                      {act.id === 'quiz' && (
                        <div className="flex items-center justify-between">
                          <p className="text-[12px] text-slate-600">Answer mode</p>
                          <div className="flex rounded-xl overflow-hidden border border-slate-200 bg-white">
                            {[['options', 'Multiple choice'], ['input', 'Open input'], ['both', 'Both']].map(([val, lbl]) => (
                              <button key={val} onClick={() => setQuizMode(val)}
                                className={`px-3 py-1.5 text-[11px] font-semibold transition-all ${
                                  quizMode === val ? 'bg-purple-500 text-white' : 'text-slate-500 hover:bg-slate-50'
                                }`}>
                                {lbl}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Global settings */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
            <p className="text-[12px] font-bold uppercase tracking-widest text-slate-400">Global Settings</p>

            {/* Interval */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-slate-800">Delivery interval</p>
                <p className="text-[11px] text-slate-400">How often to schedule activities</p>
              </div>
              <div className="flex rounded-xl overflow-hidden border border-slate-200">
                {[['daily','Daily'], ['every2','Every 2d'], ['weekly','Weekly']].map(([val, lbl]) => (
                  <button key={val} onClick={() => setInterval(val)}
                    className={`px-3 py-1.5 text-[11px] font-semibold transition-all ${
                      interval === val ? 'bg-purple-500 text-white' : 'text-slate-500 hover:bg-slate-50'
                    }`}>
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            {/* Shuffle activity types */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-slate-800">Shuffle activity types</p>
                <p className="text-[11px] text-slate-400">Randomly mix quizzes, concepts and reviews per session</p>
              </div>
              <Toggle on={shuffleTypes} onChange={setShuffleTypes} label="Shuffle types" />
            </div>

            {/* Shuffle days */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-slate-800">Shuffle days</p>
                <p className="text-[11px] text-slate-400">Vary the schedule day-by-day instead of a fixed pattern</p>
              </div>
              <Toggle on={shuffleDays} onChange={setShuffleDays} label="Shuffle days" />
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom nav ───────────────────────────────────────────────────── */}
      <div className="sticky bottom-0 bg-white border-t border-slate-100 px-5 py-4 flex items-center gap-3">
        {step > 1 && (
          <button onClick={() => setStep(s => s - 1)}
            className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-600 font-semibold text-[14px] hover:bg-slate-200 transition-colors active:scale-[0.98]">
            Back
          </button>
        )}
        {!isLast ? (
          <button onClick={() => setStep(s => s + 1)} disabled={!canNext}
            className="flex-1 py-3 rounded-2xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-[14px] shadow-md shadow-purple-500/25 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            Continue <span className="material-icons-round text-[18px]">arrow_forward</span>
          </button>
        ) : (
          <button onClick={onCreated}
            className="flex-1 py-3 rounded-2xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-[14px] shadow-md shadow-purple-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
            <span className="material-icons-round text-[18px]">auto_awesome</span>
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
    </main>
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

