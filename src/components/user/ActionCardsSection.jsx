

export const ActionCard = ({ icon, label, shapeClass, bgColor }) => {
  return (
    <button className="group flex flex-col items-center justify-center p-4 bg-white rounded-2xl  hover:shadow-sm transition-all hover:-translate-y-1">
      <div className={`${shapeClass} ${bgColor} w-24 h-24 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
        <span className="material-icons-round text-3xl">{icon}</span>
      </div>
      <span className="font-semibold text-lg">{label}</span>
    </button>
  );
};

// Action Cards Section
export const ActionCardsSection = () => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
      <ActionCard
        icon="add"
        label="New Note"
        shapeClass="pentagon-shape"
        bgColor="bg-yellow-400"
      />
      <ActionCard
        icon="mic"
        label="Voice Record"
        shapeClass="rounded-full"
        bgColor="bg-green-500"
      />
      <ActionCard
        icon="auto_awesome"
        label="AI Generate"
        shapeClass="blob-shape"
        bgColor="bg-purple-500"
      />
    </section>
  );
};



export const PolaroidCard = ({ title, content, date, rotation, isQuote = false }) => {
  return (
    <div className={`polaroid-card bg-white p-4 pb-8 transform ${rotation}`}>
      <div className="aspect-[4/5] bg-slate-100 mb-4 overflow-hidden rounded-sm relative">
        <div className={`absolute inset-0 p-4 font-handwriting text-slate-600 text-xl leading-relaxed ${isQuote ? 'italic' : ''}`}>
          {content}
        </div>
      </div>
      <h3 className="font-bold text-slate-800">{title}</h3>
      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">{date}</p>
    </div>
  );
};