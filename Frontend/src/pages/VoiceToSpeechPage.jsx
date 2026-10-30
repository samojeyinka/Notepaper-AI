import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/user/Sidebar";
import NotificationIcon from "../components/user/NotificationIcon";

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

// ── Waveform ─────────────────────────────────────────────────────────────────
function Waveform() {
    return (
        <div className="flex items-end gap-1 h-10">
            {[...Array(9)].map((_, i) => (
                <div
                    key={i}
                    className="w-1.5 bg-plum-600"
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

    const { voiceState, toggle } = useVoiceToText((segment, isFinal) => {
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
    const handleVoiceToggle = () => {
        if (voiceState === 'idle') {
            setCountdown(3);
            setElapsed(0);
        }
        toggle();
    };

    return (
        <div className="flex min-h-screen bg-paper font-display text-stone-900 antialiased selection:bg-plum-200">
            <Sidebar activePage="/lockedin/voice-to-speech" />

            <main className="flex-1 flex flex-col lg:ml-64 min-w-0">

                {/* Top bar */}
                <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur-md border-b border-stone-200/80 px-6 h-16 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="font-display-serif text-[18px] font-semibold tracking-tight text-stone-900">Voice notes</span>
                        <div className="h-4 w-px bg-stone-300/60" />
                        <span className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                            isListening ? 'bg-red-50 text-red-700' : 'bg-stone-100 text-stone-500'
                        }`}>
                            {isListening ? 'Recording' : 'Ready'}
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        {isListening && (
                            <span className="flex items-center gap-2 text-sm font-mono font-semibold text-stone-600">
                                <span className="w-2 h-2 bg-red-600 animate-pulse" />
                                {formatTime(elapsed)}
                            </span>
                        )}
                        <NotificationIcon />
                    </div>
                </header>

                {/* Canvas */}
                <div className="flex-1 p-4 md:p-8 grid grid-cols-12 gap-5 md:gap-8 items-start">

                    {/* Left — mic control */}
                    <section className="col-span-12 lg:col-span-5 flex flex-col gap-5">

                        {/* Mic card */}
                        <div className="bg-white ring-1 ring-stone-200/70 p-8 md:p-10 flex flex-col items-center gap-7">

                            {/* Mic button */}
                            <div className="relative flex items-center justify-center">
                                {isListening && (
                                    <>
                                        <span className="absolute w-40 h-40 bg-red-200/40 animate-ping" />
                                        <span className="absolute w-52 h-52 bg-red-100/40 animate-ping" style={{ animationDelay: '0.3s' }} />
                                    </>
                                )}
                                <button
                                    onClick={handleVoiceToggle}
                                    disabled={isUnsupported}
                                    className={`relative w-24 h-24 md:w-28 md:h-28 flex items-center justify-center text-white transition-all focus:outline-none border-2
                                        ${isListening
                                            ? 'bg-red-600 hover:bg-red-700 border-red-700'
                                            : isCountdown
                                                ? 'bg-amber-500 border-amber-600 cursor-not-allowed'
                                                : 'bg-plum-600 hover:bg-plum-700 border-plum-700'
                                        }
                                        ${isUnsupported ? 'opacity-40 cursor-not-allowed' : ''}
                                    `}
                                >
                                    <span className="material-icons-round text-[44px] md:text-[50px]">
                                        {isListening ? 'stop' : 'mic'}
                                    </span>
                                </button>
                            </div>

                            {/* Status */}
                            <div className="text-center min-h-[70px] flex flex-col items-center justify-center">
                                {isCountdown && (
                                    <>
                                        <span className="font-display-serif text-[64px] font-semibold text-amber-600 leading-none">{countdown}</span>
                                        <p className="text-stone-500 text-sm mt-2">Get ready…</p>
                                    </>
                                )}
                                {isListening && (
                                    <div className="flex flex-col items-center gap-3">
                                        <Waveform />
                                        <p className="text-sm font-medium text-stone-600">Listening — tap to stop</p>
                                    </div>
                                )}
                                {voiceState === 'idle' && !isUnsupported && (
                                    <>
                                        <p className="font-semibold text-stone-800">Tap to record</p>
                                        <p className="text-xs text-stone-400 mt-1">Speak, words appear as you go</p>
                                    </>
                                )}
                                {isUnsupported && (
                                    <p className="text-red-600 text-sm font-medium">Voice recognition needs Chrome or Edge</p>
                                )}
                            </div>

                            {/* Privacy note */}
                            <div className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-500">
                                <span className="material-icons-round text-[14px]">lock</span>
                                <p className="text-[11px] font-medium">Processed in your browser, nothing is stored</p>
                            </div>
                        </div>

                        {/* How it works */}
                        <div className="bg-stone-900 text-white p-6 md:p-7 flex flex-col gap-5">
                            <p className="font-display-serif text-[18px] font-semibold">How it works</p>
                            <div className="flex flex-col gap-3.5">
                                {[
                                    { n: '1', text: 'Tap the mic and speak naturally' },
                                    { n: '2', text: 'Review and tidy the transcript' },
                                    { n: '3', text: 'Send it into a Note or Paper' },
                                ].map(({ n, text }) => (
                                    <div key={n} className="flex items-center gap-3">
                                        <span className="w-6 h-6 bg-white/10 text-white/80 text-[11px] font-semibold flex items-center justify-center shrink-0">{n}</span>
                                        <p className="text-[12.5px] text-white/70">{text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Right — transcript workspace */}
                    <section className="col-span-12 lg:col-span-7">
                        <div className="bg-white ring-1 ring-stone-200/70 flex flex-col overflow-hidden" style={{ minHeight: '560px' }}>

                            {/* Workspace header */}
                            <div className="px-6 py-4 flex items-center justify-between border-b border-stone-100 shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-plum-50 text-plum-700 flex items-center justify-center">
                                        <span className="material-icons-round text-[14px]">mic</span>
                                    </div>
                                    <span className="text-xs font-semibold text-stone-500 tracking-wide">Live transcription</span>
                                    {isListening && (
                                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-red-600">
                                            <span className="w-1.5 h-1.5 bg-red-600 animate-pulse" />
                                            REC
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={handleCopy}
                                        disabled={!text.trim()}
                                        title={copied ? 'Copied!' : 'Copy text'}
                                        className="p-2 text-stone-400 hover:text-plum-700 hover:bg-plum-50 disabled:opacity-30 transition-colors"
                                    >
                                        <span className="material-icons-round text-[18px]">{copied ? 'check' : 'content_copy'}</span>
                                    </button>
                                    <button
                                        onClick={handleClear}
                                        disabled={!text}
                                        title="Clear transcript"
                                        className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 transition-colors"
                                    >
                                        <span className="material-icons-round text-[18px]">delete_outline</span>
                                    </button>
                                </div>
                            </div>

                            {/* Transcript area */}
                            <div className="flex-1 relative">
                                {!text && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center p-8 pointer-events-none select-none">
                                        <div className="w-16 h-16 bg-plum-50 text-plum-600 flex items-center justify-center">
                                            <span className="material-icons-round text-[30px]">mic_none</span>
                                        </div>
                                        <p className="text-stone-400 text-sm max-w-xs leading-relaxed">
                                            {isListening ? 'Listening for your voice…' : 'Your transcribed words will appear here, ready to edit.'}
                                        </p>
                                    </div>
                                )}
                                <textarea
                                    ref={textareaRef}
                                    value={text}
                                    onChange={e => setText(e.target.value)}
                                    placeholder=""
                                    className="w-full h-full resize-none bg-transparent border-none outline-none p-6 md:p-8 text-stone-700 text-[14px] leading-relaxed focus:outline-0"
                                    style={{ minHeight: '380px' }}
                                />
                            </div>

                            {/* Footer */}
                            <div className="shrink-0 px-6 py-4 bg-stone-50/60 border-t border-stone-100 flex items-center justify-between gap-3 flex-wrap">
                                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                                    {text.trim() ? `${wordCount} word${wordCount !== 1 ? 's' : ''} · ${text.length} chars` : 'No transcript yet'}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleInsertPaper}
                                        disabled={!text.trim()}
                                        className="flex items-center gap-1.5 px-4 py-2 border border-stone-300 text-stone-700 text-xs font-semibold hover:border-stone-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <span className="material-icons-round text-[15px]">article</span>
                                        Into Paper
                                    </button>
                                    <button
                                        onClick={handleInsert}
                                        disabled={!text.trim()}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white text-xs font-semibold hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
