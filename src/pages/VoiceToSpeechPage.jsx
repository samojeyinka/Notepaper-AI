import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/user/Sidebar";

// ── Shared voice-to-text hook ─────────────────────────────────────────────────
function useVoiceToText(onResult) {
    const [voiceState, setVoiceState] = useState('idle'); // idle | countdown | listening | unsupported
    const recognitionRef = useRef(null);
    const countdownRef   = useRef(null);

    const supported = typeof window !== 'undefined' &&
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

    const playBeep = () => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            gain.gain.setValueAtTime(0.4, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.25);
        } catch (_) {}
    };

    const beginListening = () => {
        playBeep();
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SR();
        recognition.continuous     = true;
        recognition.interimResults = true;
        recognition.lang           = 'en-US';

        recognition.onresult = (e) => {
            const newSegment = Array.from(e.results)
                .slice(e.resultIndex)
                .map(r => r[0].transcript)
                .join('');
            const isFinal = e.results[e.results.length - 1].isFinal;
            onResult(newSegment, isFinal);
        };

        recognition.onend  = () => setVoiceState('idle');
        recognition.onerror = () => setVoiceState('idle');

        recognitionRef.current = recognition;
        recognition.start();
        setVoiceState('listening');
    };

    const start = () => {
        if (!supported) { setVoiceState('unsupported'); return; }
        if (voiceState !== 'idle') return;
        setVoiceState('countdown');
        let count = 3;
        countdownRef.current = setInterval(() => {
            count -= 1;
            if (count <= 0) { clearInterval(countdownRef.current); beginListening(); }
        }, 1000);
    };

    const stop = () => {
        clearInterval(countdownRef.current);
        recognitionRef.current?.stop();
        setVoiceState('idle');
    };

    const toggle = () => { voiceState === 'idle' ? start() : stop(); };

    return { voiceState, toggle, supported };
}

// ── Waveform (uses primary purple) ───────────────────────────────────────────
function Waveform() {
    return (
        <div className="flex items-end gap-1 h-10">
            {[...Array(9)].map((_, i) => (
                <div
                    key={i}
                    className="w-1.5 rounded-full bg-primary"
                    style={{
                        animation: `wave 0.9s ease-in-out ${i * 0.08}s infinite alternate`,
                        height: '100%',
                    }}
                />
            ))}
            <style>{`
                @keyframes wave {
                    from { transform: scaleY(0.15); opacity: 0.5; }
                    to   { transform: scaleY(1);    opacity: 1; }
                }
            `}</style>
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function VoiceToSpeechPage() {
    const navigate = useNavigate();
    const [text, setText] = useState('');
    const interimRef = useRef('');
    const textareaRef = useRef(null);
    const [countdown, setCountdown] = useState(3);
    const countdownIntervalRef = useRef(null);
    const [copied, setCopied] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const elapsedRef = useRef(null);

    const { voiceState, toggle, supported } = useVoiceToText((segment, isFinal) => {
        if (isFinal) {
            setText(prev => {
                const base = prev.slice(0, prev.length - interimRef.current.length);
                interimRef.current = '';
                return base + segment + ' ';
            });
        } else {
            setText(prev => {
                const base = prev.slice(0, prev.length - interimRef.current.length);
                interimRef.current = segment;
                return base + segment;
            });
        }
    });

    // Countdown display
    useEffect(() => {
        if (voiceState === 'countdown') {
            setCountdown(3);
            countdownIntervalRef.current = setInterval(() => {
                setCountdown(c => c - 1);
            }, 1000);
        } else {
            clearInterval(countdownIntervalRef.current);
        }
        return () => clearInterval(countdownIntervalRef.current);
    }, [voiceState]);

    // Elapsed timer while listening
    useEffect(() => {
        if (voiceState === 'listening') {
            setElapsed(0);
            elapsedRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
        } else {
            clearInterval(elapsedRef.current);
        }
        return () => clearInterval(elapsedRef.current);
    }, [voiceState]);

    // Auto-scroll textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
        }
    }, [text]);

    const formatTime = (s) => {
        const m = Math.floor(s / 60).toString().padStart(2, '0');
        const sec = (s % 60).toString().padStart(2, '0');
        return `${m}:${sec}`;
    };

    const handleInsert = () => {
        const trimmed = text.trim();
        if (!trimmed) return;
        navigate('/lockedin/notes/new', { state: { voiceText: trimmed } });
    };

    const handleInsertPaper = () => {
        const trimmed = text.trim();
        if (!trimmed) return;
        navigate('/lockedin/papers/new', { state: { voiceText: trimmed } });
    };

    const handleClear = () => {
        setText('');
        interimRef.current = '';
    };

    const handleCopy = () => {
        if (!text.trim()) return;
        navigator.clipboard.writeText(text.trim()).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

    const isListening   = voiceState === 'listening';
    const isCountdown   = voiceState === 'countdown';
    const isUnsupported = voiceState === 'unsupported';

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar activePage="/lockedin/voice-to-speech" />

            <main className="flex-1 flex flex-col lg:ml-64">

                {/* ── Top bar ──────────────────────────────────────────── */}
                <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100/80 px-6 h-16 flex items-center justify-between shadow-[0_4px_24px_rgba(0,0,0,0.04)] shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="text-base font-black text-slate-900 tracking-tight">Voice Studio</span>
                        <div className="h-4 w-px bg-slate-200" />
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                            isListening
                                ? 'bg-red-100 text-red-600'
                                : 'bg-slate-100 text-slate-500'
                        }`}>
                            {isListening ? 'Recording' : 'Ready'}
                        </span>
                    </div>
                    {isListening && (
                        <span className="flex items-center gap-2 text-sm font-mono font-bold text-slate-500">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            {formatTime(elapsed)}
                        </span>
                    )}
                </header>

                {/* ── Canvas ──────────────────────────────────────────── */}
                <div className="flex-1 p-4 md:p-6 grid grid-cols-12 gap-4 md:gap-6 items-start">

                    {/* ── Left — mic control ──────────────────────────── */}
                    <section className="col-span-12 lg:col-span-5 flex flex-col gap-4">

                        {/* Mic card */}
                        <div className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] p-8 flex flex-col items-center gap-6">

                            {/* Mic button */}
                            <div className="relative flex items-center justify-center">
                                {isListening && (
                                    <>
                                        <span className="absolute w-36 h-36 rounded-full bg-red-400/15 animate-ping" />
                                        <span className="absolute w-44 h-44 rounded-full bg-red-400/8 animate-ping" style={{ animationDelay: '0.3s' }} />
                                    </>
                                )}
                                <button
                                    onClick={toggle}
                                    disabled={isUnsupported}
                                    className={`relative w-28 h-28 rounded-full flex items-center justify-center text-white transition-all focus:outline-none
                                        ${isListening
                                            ? 'bg-red-500 hover:bg-red-600 shadow-[0_8px_32px_rgba(239,68,68,0.4)]'
                                            : isCountdown
                                                ? 'bg-amber-400 cursor-not-allowed shadow-[0_8px_32px_rgba(251,191,36,0.4)]'
                                                : 'bg-primary hover:scale-[0.97] active:scale-95 shadow-[0_8px_32px_rgba(101,65,196,0.35)]'
                                        }
                                        ${isUnsupported ? 'opacity-40 cursor-not-allowed' : ''}
                                    `}
                                >
                                    <span className="material-icons-round text-[52px]">
                                        {isListening ? 'stop' : 'mic'}
                                    </span>
                                </button>
                            </div>

                            {/* Status label */}
                            <div className="text-center min-h-[64px] flex flex-col items-center justify-center">
                                {isCountdown && (
                                    <>
                                        <span className="text-6xl font-black text-amber-500 leading-none">{countdown}</span>
                                        <p className="text-slate-400 text-sm mt-2">Get ready…</p>
                                    </>
                                )}
                                {isListening && (
                                    <div className="flex flex-col items-center gap-3">
                                        <Waveform />
                                        <p className="text-sm font-semibold text-slate-600">Listening — tap to stop</p>
                                    </div>
                                )}
                                {voiceState === 'idle' && !isUnsupported && (
                                    <>
                                        <p className="font-bold text-slate-700">Tap to Record</p>
                                        <p className="text-xs text-slate-400 mt-1">Speak — words appear instantly</p>
                                    </>
                                )}
                                {isUnsupported && (
                                    <p className="text-red-500 text-sm font-medium">Requires Chrome or Edge</p>
                                )}
                            </div>

                            {/* Privacy badge */}
                            <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 rounded-full">
                                <span className="material-icons-round text-slate-400 text-[14px]">lock</span>
                                <p className="text-[10px] text-slate-400 font-medium">Processed in-browser · never stored</p>
                            </div>
                        </div>

                        {/* How it works */}
                        <div className="bg-slate-900 rounded-2xl p-6 flex flex-col gap-4">
                            <p className="text-sm font-bold text-white">How it works</p>
                            <div className="flex flex-col gap-3">
                                {[
                                    { icon: 'mic',      text: 'Tap the mic and speak naturally' },
                                    { icon: 'edit',     text: 'Review and edit the transcript' },
                                    { icon: 'note_add', text: 'Insert into a Note or Paper' },
                                ].map(({ icon, text }) => (
                                    <div key={icon} className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                            <span className="material-icons-round text-[14px] text-white/60">{icon}</span>
                                        </div>
                                        <p className="text-xs text-white/60">{text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ── Right — transcript workspace ─────────────────── */}
                    <section className="col-span-12 lg:col-span-7">
                        <div className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] flex flex-col overflow-hidden" style={{ minHeight: '560px' }}>

                            {/* Workspace header */}
                            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-50 shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-400" />
                                        <div className="w-3 h-3 rounded-full bg-amber-400" />
                                        <div className="w-3 h-3 rounded-full bg-green-400" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-400 tracking-wide">Live Transcription</span>
                                    {isListening && (
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-red-500">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                            REC
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={handleCopy}
                                        disabled={!text.trim()}
                                        title={copied ? 'Copied!' : 'Copy text'}
                                        className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 disabled:opacity-30 transition-colors"
                                    >
                                        <span className="material-icons-round text-[18px]">{copied ? 'check' : 'content_copy'}</span>
                                    </button>
                                    <button
                                        onClick={handleClear}
                                        disabled={!text}
                                        title="Clear transcript"
                                        className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-50 disabled:opacity-30 transition-colors"
                                    >
                                        <span className="material-icons-round text-[18px]">delete_outline</span>
                                    </button>
                                </div>
                            </div>

                            {/* Transcript area */}
                            <div className="flex-1 relative">
                                {!text && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-8 pointer-events-none select-none">
                                        <span className="material-icons-round text-slate-200 text-[56px]">mic_none</span>
                                        <p className="text-slate-300 text-sm">
                                            {isListening ? 'Listening for your voice…' : 'Your transcribed text will appear here'}
                                        </p>
                                    </div>
                                )}
                                <textarea
                                    ref={textareaRef}
                                    value={text}
                                    onChange={e => setText(e.target.value)}
                                    placeholder=""
                                    className="w-full h-full resize-none bg-transparent border-none outline-none p-6 text-slate-700 text-sm leading-relaxed focus:outline-0"
                                    style={{ minHeight: '380px' }}
                                />
                            </div>

                            {/* Footer */}
                            <div className="shrink-0 px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {text.trim() ? `${wordCount} word${wordCount !== 1 ? 's' : ''} · ${text.length} chars` : 'No transcript yet'}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleInsertPaper}
                                        disabled={!text.trim()}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                    >
                                        <span className="material-icons-round text-[15px]">article</span>
                                        Into Paper
                                    </button>
                                    <button
                                        onClick={handleInsert}
                                        disabled={!text.trim()}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-white text-xs font-bold hover:scale-[0.97] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-[0_4px_12px_rgba(101,65,196,0.3)]"
                                    >
                                        <span className="material-icons-round text-[15px]">note_add</span>
                                        Into Note
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
