import { Link } from "react-router-dom";


export const ActionCard = ({ icon, label, shapeClass, bgColor,url }) => {
  return (
    <a href={`/lockedin/${url}`} className="group flex flex-col items-center justify-center p-2 md:p-4 bg-white rounded-2xl  hover:shadow-sm transition-all hover:-translate-y-1">
      <div className={`${shapeClass} ${bgColor} w-10 h-10 md:w-24 md:h-24 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
        <span className="material-icons-round text-[16px] md:text-3xl">{icon}</span>
      </div>
      <span className="font-semibold text-[14px] md:text-lg">{label}</span>
    </a>
  );
};

// Action Cards Section
export const ActionCardsSection = () => {
  return (
    <section className="grid grid-cols-3 md:grid-cols-3 gap-3 md:gap-8 mb-4">
      <ActionCard
        icon="add"
        label="New Note"
        shapeClass="pentagon-shape"
        bgColor="bg-yellow-400"
        url="notes/new"
      />
      <ActionCard
        icon="mic"
        label="Voice Record"
        shapeClass="rounded-full"
        bgColor="bg-green-500"
        url="voice-to-speech"
      />
      <ActionCard
        icon="auto_awesome"
        label="AI Generate"
        shapeClass="blob-shape"
        bgColor="bg-purple-500"
        url="generate"
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