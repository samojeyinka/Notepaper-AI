import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sprintService } from '../../api/sprintService';

const PHASES = [
    'Reading your materials…',
    'Analysing key concepts…',
    'Planning your challenge roadmap…',
    'Building the first 5 challenges…',
    'Almost done…',
];

const POLL_MS = 5000;

const SprintGenerating = ({ sprint, onReady }) => {
    const navigate    = useNavigate();
    const [phase, setPhase]     = useState(0);
    const [elapsed, setElapsed] = useState(0);
    const intervalRef = useRef(null);
    const pollRef     = useRef(null);

    // Advance phase text every 36s
    useEffect(() => {
        intervalRef.current = setInterval(() => setPhase(p => Math.min(p + 1, PHASES.length - 1)), 36000);
        return () => clearInterval(intervalRef.current);
    }, []);

    // Tick elapsed seconds
    useEffect(() => {
        const t = setInterval(() => setElapsed(s => s + 1), 1000);
        return () => clearInterval(t);
    }, []);

    // Poll sprint status
    useEffect(() => {
        pollRef.current = setInterval(async () => {
            try {
                const res = await sprintService.show(sprint.id);
                const updated = res.data;
                if (updated.status !== 'generating') {
                    clearInterval(pollRef.current);
                    onReady(updated);
                }
            } catch {
                // keep polling
            }
        }, POLL_MS);
        return () => clearInterval(pollRef.current);
    }, [sprint.id, onReady]);

    const estimated = 180; // seconds
    const pct = Math.min(Math.round((elapsed / estimated) * 100), 95);

    return (
        <div className="flex-1 lg:ml-64 min-h-screen flex flex-col items-center justify-center p-6" style={{ background: '#F8F9FA' }}>
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/8 rounded-full blur-3xl" />
                <div className="absolute bottom-10 -left-10 w-60 h-60 bg-indigo-400/8 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-md text-center">
                <div className="relative w-16 h-16 md:w-24 md:h-24 mx-auto mb-8">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                    <div className="relative w-16 h-16 md:w-24 md:h-24 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
                        <span className="material-icons-round text-white text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                    </div>
                </div>

                <h2 className="text-[18px] md:text-2xl font-semibold text-slate-900 mb-1">Building your sprint</h2>
                <p className="text-[14px] text-slate-500 mb-1">{sprint.title}</p>
                <p className="text-[12px] md:text-[13px] text-primary font-medium mb-4 md:mb-8">{PHASES[phase]}</p>

                <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
                </div>

                <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 text-left space-y-4" style={{ boxShadow: '0 10px 30px rgba(44,47,50,0.06)' }}>
                    <p className="text-[13px] text-slate-600 leading-relaxed">
                        This usually takes <span className="font-semibold text-slate-800">2–4 minutes</span>. You can safely go back — come back to this sprint when you're ready.
                    </p>
                    <button
                        onClick={() => navigate('/lockedin/sprints')}
                        className="w-full py-1 md:py-2.5 rounded-lg md:rounded-xl border border-slate-200 text-slate-600 font-medium text-[13px] hover:bg-slate-50 transition-all active:scale-95"
                    >
                        Back to Sprints
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SprintGenerating;
