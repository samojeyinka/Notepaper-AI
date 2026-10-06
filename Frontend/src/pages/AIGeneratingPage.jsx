import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { noteService } from '../api/noteService';
import { paperService } from '../api/paperService';
import { useExpandTopicChannel } from '../hooks/useExpandTopicChannel';
import { useSimplifyTopicChannel } from '../hooks/useSimplifyTopicChannel';
import { Sidebar } from '../components/user/Sidebar';

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

// Shared centred shell — keeps all three states on the same stationery system.
const Shell = ({ children }) => (
    <div className="flex min-h-screen bg-paper font-display text-stone-900 antialiased selection:bg-plum-200">
        <Sidebar activePage="/lockedin/library" />
        <main className="relative flex-1 lg:ml-64 min-h-screen flex flex-col items-center justify-center p-6 pt-16 lg:pt-6 overflow-hidden">
            <div className="absolute inset-0 dot-grid opacity-60 pointer-events-none" />
            <div className="relative z-10 w-full max-w-md text-center">{children}</div>
        </main>
    </div>
);

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
            <Shell>
                <p className="eyebrow text-plum-700 mb-6">Schola</p>

                <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-7 bg-emerald-500 flex items-center justify-center">
                    <span className="material-icons-round text-white text-[34px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                </div>

                <h2 className="font-display-serif text-[26px] md:text-[32px] font-semibold tracking-tight text-stone-900 leading-tight mb-2">
                    Your {actionLabel.toLowerCase()} {typeLabel.toLowerCase()} is ready
                </h2>
                {resultTitle && (
                    <p className="text-[13px] font-medium text-plum-700 mb-7 px-4 truncate">"{resultTitle}"</p>
                )}
                {!resultTitle && <div className="mb-7" />}

                <div className="bg-white border border-stone-200 p-3 md:p-6 flex flex-col gap-3 text-left">
                    <button
                        onClick={() => navigate(targetPath)}
                        className="w-full py-3 bg-plum-600 text-white text-[14px] font-medium flex items-center justify-center gap-2 hover:bg-plum-700 active:scale-[0.98] transition-colors"
                    >
                        <span className="material-icons-round text-[18px]">open_in_new</span>
                        Open {typeLabel}
                    </button>
                    <button
                        onClick={() => window.close()}
                        className="w-full py-2.5 border border-stone-200 text-stone-500 text-[13px] font-medium hover:bg-stone-50 transition-colors"
                    >
                        Close this tab
                    </button>
                </div>
            </Shell>
        );
    }

    // ── Error ─────────────────────────────────────────────────────────────────
    if (status === 'error') {
        return (
            <Shell>
                <p className="eyebrow text-plum-700 mb-6">Schola</p>

                <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-7 bg-red-50 border border-red-200 flex items-center justify-center">
                    <span className="material-icons-round text-red-500 text-[34px]">error_outline</span>
                </div>

                <h2 className="font-display-serif text-[26px] md:text-[32px] font-semibold tracking-tight text-stone-900 leading-tight mb-2">
                    Something went wrong
                </h2>
                <p className="text-[14px] text-stone-500 mb-7">Generation timed out. Please go back and try again.</p>

                <div className="bg-white border border-stone-200 p-3 md:p-6 flex flex-col gap-3 text-left">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full py-3 bg-plum-600 text-white text-[13px] font-medium hover:bg-plum-700 active:scale-[0.98] transition-colors"
                    >
                        Go Back
                    </button>
                    <button
                        onClick={() => window.close()}
                        className="w-full py-2.5 border border-stone-200 text-stone-500 text-[13px] font-medium hover:bg-stone-50 transition-colors"
                    >
                        Close this tab
                    </button>
                </div>
            </Shell>
        );
    }

    // ── Generating ────────────────────────────────────────────────────────────
    return (
        <Shell>
            <p className="eyebrow text-plum-700 mb-6">
                {action === 'simplify' ? 'Simplifying' : 'Expanding'} {typeLabel}
            </p>

            {/* Action tile */}
            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-7 bg-plum-600 flex items-center justify-center">
                <span
                    className="material-icons-round text-white text-[32px] md:text-[38px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                >
                    {action === 'simplify' ? 'filter_alt' : 'lightbulb'}
                </span>
            </div>

            <h2 className="font-display-serif text-[24px] md:text-[30px] font-semibold tracking-tight text-stone-900 leading-tight mb-2">
                Schola is {action === 'simplify' ? 'simplifying' : 'expanding'} your {typeLabel.toLowerCase()}
            </h2>
            <p className="text-[13px] text-plum-700 font-medium mb-7">{phases[phase]}</p>

            {/* Progress */}
            <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-400 mb-2">
                <span>Progress</span>
                <span className="text-plum-700 tabular-nums">{pct}%</span>
            </div>
            <div className="h-1.5 bg-stone-200 overflow-hidden">
                <div
                    className="h-full bg-plum-600 transition-all duration-1000"
                    style={{ width: `${pct}%` }}
                />
            </div>

            {/* Info card */}
            <div className="bg-white border border-stone-200 p-5 md:p-6 text-left mt-7">
                <div className="flex items-start gap-3">
                    <span className="material-icons-round text-plum-600 text-[20px] mt-0.5 shrink-0">info</span>
                    <p className="text-[12px] md:text-[13px] text-stone-600 leading-relaxed">
                        This usually takes <span className="font-semibold text-stone-800">1–3 minutes</span>. This page updates automatically — you'll also get a browser notification when it's ready.
                    </p>
                </div>
                <button
                    onClick={() => window.close()}
                    className="mt-4 w-full py-2.5 border border-stone-200 text-stone-500 font-medium text-[12px] md:text-[13px] hover:bg-stone-50 transition-colors active:scale-[0.98]"
                >
                    Close this tab (generation continues)
                </button>
            </div>
        </Shell>
    );
}
