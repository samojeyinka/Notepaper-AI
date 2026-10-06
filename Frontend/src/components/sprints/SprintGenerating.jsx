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
        <div className="relative flex-1 lg:ml-64 min-h-screen flex flex-col items-center justify-center p-6 bg-paper font-display text-stone-900 overflow-hidden">
            <div className="absolute inset-0 dot-grid opacity-60 pointer-events-none" />

            <div className="relative z-10 w-full max-w-md text-center">
                {/* Action tile */}
                
                <p className="eyebrow text-plum-700 mb-2">Building your sprint</p>
                <h2 className="font-display-serif text-[24px] md:text-[30px] font-semibold tracking-tight text-stone-900 leading-tight mb-2">
                    {sprint.title}
                </h2>
                <p className="text-[13px] text-plum-700 font-medium mb-7">{PHASES[phase]}</p>

                {/* Progress */}
                <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-400 mb-2">
                    <span>Progress</span>
                    <span className="text-plum-700 tabular-nums">{pct}%</span>
                </div>
                <div className="h-1.5 bg-stone-200 overflow-hidden">
                    <div className="h-full bg-plum-600 transition-all duration-1000" style={{ width: `${pct}%` }} />
                </div>

                {/* Info card */}
                <div className="bg-white border border-stone-200 p-5 md:p-6 text-left mt-7">
                    <div className="flex items-start gap-3">
                        <span className="material-icons-round text-plum-600 text-[20px] mt-0.5 shrink-0">info</span>
                        <p className="text-[13px] text-stone-600 leading-relaxed">
                            This usually takes <span className="font-semibold text-stone-800">2–4 minutes</span>. You can safely go back — come back to this sprint when you're ready.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/lockedin/sprints')}
                        className="mt-4 w-full py-2.5 border border-stone-200 text-stone-500 font-medium text-[13px] hover:bg-stone-50 transition-colors active:scale-[0.98]"
                    >
                        Back to Sprints
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SprintGenerating;
