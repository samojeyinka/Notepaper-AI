

export function PolaroidCard({ title, content, date, rotation, isQuote = false }){
  return (
    <div className={`polaroid-card bg-white p-2 pb-4 transform ${rotation}`}>
      <div className="aspect-[4/1] md:aspect-[4/3] bg-slate-100 mb-2 overflow-hidden rounded-sm relative">
        <div className={`absolute inset-0 p-2 font-handwriting2 text-slate-600 text-[13px] leading-relaxed ${isQuote ? 'italic' : ''}`}>
          {content}
        </div>
      </div>
      <h3 className="text-[14px] font-medium text-slate-800">{title}</h3>
      <p className="text-[10px] text-slate-400 uppercase font-normal tracking-widest mt-1">{date}</p>
    </div>
  );
};

// Recent Notes Section
export default function RecentNotesSection() {
  const notes = [
    {
      title: "Weekly Supplies",
      content: "buy more oil paints and the new canvas for the sunset series.",
      date: "October 12, 2023",
      rotation: "-rotate-1",
    },
    {
      title: "Project Concept",
      content: "dashboard that feels like a physical desk with scraps of...",
      date: "October 10, 2023",
      rotation: "rotate-2",
    },
    {
      title: "Coffee Chat",
      content: "for coffee at 3pm to discuss the upcoming semester plan.",
      date: "October 09, 2023",
      rotation: "-rotate-2",
    },
    {
      title: "Daily Quote",
      content: '"The only way to do great work is to love what you do."',
      date: "October 08, 2023",
      rotation: "rotate-1",
      isQuote: true,
    },
  ];

  return (
    <div className="xl:col-span-3">
      {/* Header */}
      <div className="flex justify-between items-center mb-3 md:mb-6">
        <h2 className="text-[15px] md:text-xl font-semibold flex items-center">
          Recent Notes
          <span className="material-icons-round ml-2 text-purple-500">north_east</span>
        </h2>
        <a className="text-purple-500 text-[14px] md:text-xl font-medium hover:underline" href="#">
          View All Library
        </a>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {notes.map((note, index) => (
          <PolaroidCard
            key={index}
            title={note.title}
            content={note.content}
            date={note.date}
            rotation={note.rotation}
            isQuote={note.isQuote}
          />
        ))}
      </div>
    </div>
  );
};
