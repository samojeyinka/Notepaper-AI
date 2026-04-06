import React from "react";

export const NoteAISidebar = () => {
    const aiPrompts = [
        {
            id: 'quiz',
            icon: 'quiz',
            title: 'Generate Quiz',
            description: 'Transform your notes into a personalized practice test.',
            color: 'bg-primary/20 text-primary'
        },
        {
            id: 'plan',
            icon: 'event_note',
            title: 'Create Study Plan',
            description: 'Get a weekly roadmap based on these lecture topics.',
            color: 'bg-accent-green/20 text-accent-green'
        },
        {
            id: 'expand',
            icon: 'lightbulb',
            title: 'Expand Topic',
            description: 'Let AI research and add related details to your note.',
            color: 'bg-accent-yellow/20 text-accent-yellow'
        }
    ];

    return (
        <aside className="w-80 border-l border-slate-200 bg-white p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar relative z-30 shrink-0">
            <div className="flex items-center gap-2 mb-2">
                <span className="material-icons-round text-primary">auto_awesome</span>
                <h3 className="font-display font-bold text-lg text-slate-900">AI Assistant</h3>
            </div>

            <div className="flex flex-col gap-4">
                {aiPrompts.map((prompt) => (
                    <button key={prompt.id} className="group p-4 rounded-2xl bg-white border border-slate-100 hover:border-primary/50 text-left transition-all hover:shadow-md">
                        <div className={`w-10 h-10 rounded-lg ${prompt.color} flex items-center justify-center mb-3`}>
                            <span className="material-icons-round">{prompt.icon}</span>
                        </div>
                        <p className="font-bold text-sm mb-1 text-slate-800">{prompt.title}</p>
                        <p className="text-xs text-slate-500">{prompt.description}</p>
                    </button>
                ))}
            </div>

            <div className="mt-auto pt-6 border-t border-slate-100">
                <div className="bg-gradient-to-br from-primary/20 to-indigo-500/20 p-5 rounded-2xl border border-primary/20">
                    <p className="text-sm font-semibold mb-2 text-slate-900">Pro Feature</p>
                    <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                        Unlock unlimited AI generations and cloud sync across all your devices.
                    </p>
                    <button className="w-full bg-slate-900 text-white py-2 rounded-xl text-sm font-bold shadow-lg transition-transform active:scale-95">
                        Learn More
                    </button>
                </div>
            </div>
        </aside>
    );
};
