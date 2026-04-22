

export const QuizCard = ({
  icon,
  iconBgColor,
  iconColor,
  badgeColor,
  badgeText,
  title,
  subtitle,
  time,
}) => {
  return (
    <div className="bg-white  p-4 rounded-3xl border border-slate-100 hover:border-purple-500/50 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className={`w-7 h-7 rounded-2xl ${iconBgColor} flex items-center justify-center ${iconColor}`}>
          <span className="material-icons-round text-base">{icon}</span>
        </div>
        <span className={`${badgeColor} text-[10px] font-normal px-1.5 py-0.5 rounded-lg`}>{badgeText}</span>
      </div>

      {/* Content */}
      <h4 className="font-medium text-[13.5px] md:text-[15px] text-slate-900">{title}</h4>
      <p className="text-slate-500 font-light text-[10.5px] md:text-[12px] mt-1">{subtitle}</p>

      {/* Time */}
      <div className="mt-4 flex items-center text-[10.5px] md:text-xs text-slate-400">
        <span className="material-icons-round text-sm mr-1">schedule</span>
        {time}
      </div>
    </div>
  );
};

// Upcoming Quizzes Section
export const UpcomingQuizzesSection = () => {
  return (
    <div className="xl:col-span-1 mb-[10rem]">
      <h2 className="text-[16px] md:text-xl font-medium md:font-semibold mb-3 md:mb-6">Upcoming Quizzes</h2>
      <div className="space-y-4">
        {/* Chemistry Quiz */}
        <QuizCard
          icon="science"
          iconBgColor="bg-orange-100"
          iconColor="text-orange-600"
          badgeColor="bg-orange-100 text-orange-600"
          badgeText="Tomorrow"
          title="Organic Chemistry"
          subtitle="Chapter 4: Molecular Bonds"
          time="10:00 AM • 45 mins"
        />

        {/* History Quiz */}
        <QuizCard
          icon="history_edu"
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          badgeColor="bg-blue-100 text-blue-600"
          badgeText="Oct 15"
          title="World History"
          subtitle="The Renaissance Period"
          time="2:30 PM • 30 mins"
        />

        {/* Add Study Plan Button */}
        <button className="w-full py-1 md:py-2 border-2 border-dashed border-slate-200 rounded-lg md:rounded-3xl text-slate-400 hover:text-purple-500 hover:border-purple-500 transition-all flex items-center justify-center space-x-2">
          <span className="material-icons-round text-[13px] md:text-[16px]">add</span>
          <span className="text-[12px] md:font-medium md:text-[16px]">Add Study Plan</span>
        </button>
      </div>
    </div>
  );
};
