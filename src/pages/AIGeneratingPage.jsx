import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { noteService } from '../api/noteService';
import { paperService } from '../api/paperService';
import { useExpandTopicChannel } from '../hooks/useExpandTopicChannel';
import { useSimplifyTopicChannel } from '../hooks/useSimplifyTopicChannel';

const PHASES = {
    expand: [
        'Reading your content…',
        'Researching the topic in depth…',
        'Writing the expanded version…',
        'Adding examples and explanations…',
        'Almost done…',
    ],
    simplify: [
        'Reading your content…',
        'Identifying the key points…',
        'Simplifying the language…',
        'Polishing the result…',
        'Almost done…',
    ],
};

export default function AIGeneratingPage() {
    const { type, id } = useParams();           // type = 'note' | 'paper'
    const [searchParams]  = useSearchParams();
    const action          = searchParams.get('action') ?? 'expand'; // 'expand' | 'simplify'
    const navigate        = useNavigate();

    const phases    = PHASES[action] ?? PHASES.expand;
    const isNote    = type === 'note';
    const typeLabel = isNote ? 'Note' : 'Paper';
    const actionLabel = action === 'simplify' ? 'Simplified' : 'Expanded';
    const targetPath  = isNote ? `/lockedin/notes/${id}` : `/lockedin/papers/${id}`;

    const [phase,       setPhase]       = useState(0);
    const [elapsed,     setElapsed]     = useState(0);
    const [status,      setStatus]      = useState('generating'); // 'generating' | 'done' | 'error'
    const [resultTitle, setResultTitle] = useState(null);

    const pollRef = useRef(null);
    const doneRef = useRef(false); // guard against WS + poll double-fire

    const handleDone = useCallback((receivedTitle) => {
        if (doneRef.current) return;
        doneRef.current = true;
        clearInterval(pollRef.current);
        setResultTitle(receivedTitle ?? null);
        setStatus('done');
        // Browser notification
        try {
            if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                new Notification('Schola is done! ✓', {
                    body: `Your ${actionLabel} ${typeLabel} is ready to open.`,
                    icon: '/favicon.ico',
                });
            }
        } catch { /* notifications not supported */ }
    }, [actionLabel, typeLabel]);

    // WebSocket channels — only one will be active depending on action
    useExpandTopicChannel(action === 'expand' && status === 'generating' ? id : null, (e) => {
        handleDone(e?.title);
    });
    useSimplifyTopicChannel(action === 'simplify' && status === 'generating' ? id : null, (e) => {
        handleDone(e?.title);
    });

    // Polling fallback every 3s (catches missed WebSocket events)
    useEffect(() => {
        if (!id || status !== 'generating') return;
        const svc = isNote ? noteService : paperService;
        let attempts = 0;
        pollRef.current = setInterval(async () => {
            attempts++;
            if (attempts > 60) {
                clearInterval(pollRef.current);
                if (!doneRef.current) setStatus('error');
                return;
            }
            try {
                const res = await svc.get(id);
                if (!res.data.ai_generating && res.data.content) {
                    handleDone(res.data.title);
                }
            } catch { /* keep polling */ }
        }, 3000);
        return () => clearInterval(pollRef.current);
    }, [id, isNote, status, handleDone]);

    // Phase text advancement every 30s
    useEffect(() => {
        if (status !== 'generating') return;
        const t = setInterval(() => setPhase(p => Math.min(p + 1, phases.length - 1)), 30000);
        return () => clearInterval(t);
    }, [status, phases.length]);

    // Elapsed seconds ticker
    useEffect(() => {
        if (status !== 'generating') return;
        const t = setInterval(() => setElapsed(s => s + 1), 1000);
        return () => clearInterval(t);
    }, [status]);

    // Request browser notification permission once
    useEffect(() => {
        if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const estimated = 180;
    const pct = Math.min(Math.round((elapsed / estimated) * 100), 95);

    // ── Done ──────────────────────────────────────────────────────────────────
    if (status === 'done') {
        return (
            <div className="flex-1 lg:ml-64 min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 pt-16 lg:pt-6">
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-10 -left-10 w-60 h-60 bg-primary/8 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 w-full max-w-md text-center">
                    <div className="relative w-20 h-20 md:w-28 md:h-28 mx-auto mb-8">
                        <div className="absolute inset-0 bg-emerald-400/25 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
                        <div className="relative w-20 h-20 md:w-28 md:h-28 bg-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/30">
                            <span className="material-icons-round text-white text-[44px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                        </div>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-semibold md:font-bold text-slate-900 mb-2">Schola is done!</h2>
                    <p className="text-[14px] text-slate-500 mb-1">
                        Your {actionLabel.toLowerCase()} {typeLabel.toLowerCase()} is ready.
                    </p>
                    {resultTitle && (
                        <p className="text-[13px] font-medium md:font-semibold text-slate-700 mb-8 px-4 truncate">"{resultTitle}"</p>
                    )}
                    {!resultTitle && <div className="mb-4 md:mb-8" />}

                    <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-6 flex flex-col gap-3" style={{ boxShadow: '0 10px 30px rgba(44,47,50,0.07)' }}>
                        <button
                            onClick={() => navigate(targetPath)}
                            className="w-full py-2 md:py-3 bg-primary text-white rounded-md md:rounded-lg text-[14px] font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
                        >
                      
                            Open {typeLabel}
                        </button>
                        <button
                            onClick={() => window.close()}
                            className="w-full py-1.5 md:py-2 border border-slate-200 text-slate-500 rounded-md md:rounded-lg text-[13px] font-medium hover:bg-slate-50 transition-all"
                        >
                            Close this tab
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Error ─────────────────────────────────────────────────────────────────
    if (status === 'error') {
        return (
            <div className="flex-1 lg:ml-64 min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 pt-16 lg:pt-6">
                <div className="relative z-10 w-full max-w-md text-center">
                    <div className="w-20 h-20 md:w-28 md:h-28 mx-auto mb-8 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="material-icons-round text-red-400 text-[44px]">error_outline</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h2>
                    <p className="text-[14px] text-slate-500 mb-8">Generation timed out. Please go back and try again.</p>
                    <div className="bg-white rounded-2xl p-6 flex flex-col gap-3" style={{ boxShadow: '0 10px 30px rgba(44,47,50,0.07)' }}>
                        <button
                            onClick={() => navigate(-1)}
                            className="w-full py-3 bg-slate-900 text-white rounded-xl text-[13px] font-bold hover:bg-black active:scale-[0.98] transition-all"
                        >
                            Go Back
                        </button>
                        <button
                            onClick={() => window.close()}
                            className="w-full py-2.5 border border-slate-200 text-slate-500 rounded-xl text-[13px] font-medium hover:bg-slate-50 transition-all"
                        >
                            Close this tab
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Generating ────────────────────────────────────────────────────────────
    return (
        <div className="flex-1 lg:ml-64 min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 pt-16 lg:pt-6">
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/8 rounded-full blur-3xl" />
                <div className="absolute bottom-10 -left-10 w-60 h-60 bg-indigo-400/8 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-md text-center">
                {/* Animated icon */}
                <div className="relative w-20 h-20 md:w-24 md:h-24 mx-auto mb-8">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                    <div className="relative w-20 h-20 md:w-24 md:h-24 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
                        <span
                            className="material-icons-round text-white text-[40px]"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                            {action === 'simplify' ? 'filter_alt' : 'lightbulb'}
                        </span>
                    </div>
                </div>

                <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-1">
                    Schola is {action === 'simplify' ? 'simplifying' : 'expanding'} your {typeLabel.toLowerCase()}
                </h2>
                <p className="text-[12px] md:text-[14px] text-primary font-medium mb-6 md:mb-8">{phases[phase]}</p>

                {/* Progress bar */}
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                    <div
                        className="h-full bg-primary rounded-full transition-all duration-1000"
                        style={{ width: `${pct}%` }}
                    />
                </div>
             

                {/* Info card */}
                <div
                    className="bg-white rounded-xl md:rounded-2xl p-5 md:p-6 text-left space-y-3"
                    style={{ boxShadow: '0 10px 30px rgba(44,47,50,0.06)' }}
                >
                    <div className="flex items-start gap-3">
                        <span className="material-icons-round text-primary text-[20px] mt-0.5 shrink-0">info</span>
                        <p className="text-[12px] md:text-[13px] text-slate-600 leading-relaxed">
                            This usually takes <span className="font-semibold text-slate-800">1–3 minutes</span>. This page will update automatically — you'll also get a browser notification when it's ready.
                        </p>
                    </div>
                    <button
                        onClick={() => window.close()}
                        className="w-full py-2 md:py-2.5 rounded-lg md:rounded-xl border border-slate-200 text-slate-500 font-medium text-[12px] md:text-[13px] hover:bg-slate-50 transition-all active:scale-[0.98]"
                    >
                        Close this tab (generation continues)
                    </button>
                </div>
            </div>
        </div>
    );
}
