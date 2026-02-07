import { useState } from 'react';

// Header Component
export const StudyPlannerHeader = () => {
  return (
    <header className="p-4 flex md:items-center justify-between flex-col md:flex-row">
      <div>
        <h1 className="text-xl font-display font-semibold">Study Planner</h1>
        <p className="text-slate-400 text-[14px] mt-1">AI-optimized schedule for your exams.</p>
      </div>
      <div className="flex items-center gap-4">
      
        <button className="bg-purple-500 hover:bg-purple-600 mt-2 md:mt-0 text-[12px] md:text-[13px] text-white px-3 py-1.5 rounded-xl font-medium flex items-center gap-2 shadow-sm shadow-purple-500/20 transition-all">
          <span className="material-icons-round ">auto_awesome</span>
          Generate Plan
        </button>
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

// Storage Card Component
export const StorageCard = ({ percentage, usedGB, totalGB }) => {
  return (
    <div className="bg-indigo-600 p-4 rounded-[1.5rem] text-white relative overflow-hidden hover:shadow-lg transition-all">
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider">Storage Used</p>
            <h3 className="text-3xl font-display font-bold mt-1">{percentage}%</h3>
          </div>
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md hover:bg-white/30 transition-all">
            <span className="material-icons-round">cloud_upload</span>
          </div>
        </div>
        <div className="w-full bg-white/20 h-2 rounded-full mb-2">
          <div className="bg-white h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
        </div>
        <p className="text-xs text-indigo-100 opacity-80">
          {usedGB.toFixed(1)} GB of {totalGB} GB used
        </p>
      </div>
      <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-blob rotate-45"></div>
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
      <StorageCard percentage={72} usedGB={3.4} totalGB={5} />
    </div>
  );
};


// Main Planner Content
export const StudyPlannerContent = () => {
  return (
    <main className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50 lg:ml-64 p-3 lg:p-8 pt-20 lg:pt-8">
      <StudyPlannerHeader />
      <div className="px-4 pb-4 grid grid-cols-12 gap-6">
        {/* Left Column - Calendar and Tasks */}
        <div className="col-span-12 xl:col-span-8 space-y-4">
          <StudyCalendar />
          <TodayTasksSection />
        </div>

        {/* Right Column - Alerts and Up Next */}
        <div className="col-span-12 xl:col-span-4">
          <RightSidebarSection />
        </div>
      </div>

    </main>
  );
};

