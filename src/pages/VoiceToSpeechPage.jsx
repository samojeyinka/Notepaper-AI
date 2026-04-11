import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/user/Sidebar";

// ── Shared voice-to-text hook (mirrors NoteHeader's implementation) ───────────
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

// ── Animated waveform shown while listening ───────────────────────────────────
function Waveform() {
    return (
        <div className="flex items-center gap-1 h-8">
            {[...Array(7)].map((_, i) => (
                <div
                    key={i}
                    className="w-1 rounded-full bg-green-500"
                    style={{
                        animation: `wave 1s ease-in-out ${i * 0.1}s infinite alternate`,
                        height: '100%',
                    }}
                />
            ))}
            <style>{`
                @keyframes wave {
                    from { transform: scaleY(0.2); }
                    to   { transform: scaleY(1); }
                }
            `}</style>
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function VoiceToSpeechPage() {
    const navigate = useNavigate();
    const [text, setText] = useState('');
    const interimRef = useRef(''); // holds the in-progress (non-final) segment
    const textareaRef = useRef(null);
    const [countdown, setCountdown] = useState(3);
    const countdownIntervalRef = useRef(null);
    const [copied, setCopied] = useState(false);

    const { voiceState, toggle, supported } = useVoiceToText((segment, isFinal) => {
        if (isFinal) {
            // Commit the final segment; clear interim placeholder
            setText(prev => {
                const base = prev.slice(0, prev.length - interimRef.current.length);
                interimRef.current = '';
                return base + segment + ' ';
            });
        } else {
            // Show interim text live, replacing previous interim segment
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

    // Auto-scroll textarea to bottom as text grows
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
        }
    }, [text]);

    const handleInsert = () => {
        const trimmed = text.trim();
        if (!trimmed) return;
        navigate('/lockedin/notes/new', { state: { voiceText: trimmed } });
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

    const isListening  = voiceState === 'listening';
    const isCountdown  = voiceState === 'countdown';
    const isUnsupported = voiceState === 'unsupported';

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar activePage="/lockedin/voice-to-speech" />

            <main className="flex-1 flex flex-col items-center justify-center px-4 py-10 lg:ml-64">
                <div className="w-full max-w-2xl">

                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                            <span className="material-icons-round text-green-600 text-3xl">mic</span>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800">Voice to Text</h1>
                        <p className="text-slate-500 text-sm mt-1">
                            Speak freely — your words will appear below. Edit, then insert into a new note.
                        </p>
                        {isUnsupported && (
                            <p className="mt-2 text-red-500 text-sm font-medium">
                                Voice input is only supported in Chrome and Edge.
                            </p>
                        )}
                        <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full bg-slate-100 text-slate-500 text-xs">
                            <span className="material-icons-round text-[14px] text-slate-400">lock</span>
                            Your voice is never recorded or stored — processing happens entirely in your browser.
                        </div>
                    </div>

                    {/* Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-5">

                        {/* Mic button + status */}
                        <div className="flex flex-col items-center gap-3">
                            <button
                                onClick={toggle}
                                disabled={isUnsupported}
                                className={`relative w-20 h-20 rounded-full flex items-center justify-center text-white transition-all shadow-lg focus:outline-none
                                    ${isListening
                                        ? 'bg-red-500 hover:bg-red-600 scale-105'
                                        : isCountdown
                                            ? 'bg-amber-400 cursor-not-allowed'
                                            : 'bg-green-500 hover:bg-green-600'
                                    }
                                    ${isUnsupported ? 'opacity-40 cursor-not-allowed' : ''}
                                `}
                            >
                                {isListening && (
                                    <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-40" />
                                )}
                                <span className="material-icons-round text-4xl">
                                    {isListening ? 'stop_circle' : 'mic'}
                                </span>
                            </button>

                            {isCountdown && (
                                <div className="text-center">
                                    <span className="text-5xl font-bold text-amber-500">{countdown}</span>
                                    <p className="text-slate-400 text-sm mt-1">Get ready…</p>
                                </div>
                            )}
                            {isListening && (
                                <div className="flex flex-col items-center gap-2">
                                    <Waveform />
                                    <span className="text-sm text-slate-500">Listening — tap the button to stop</span>
                                </div>
                            )}
                            {voiceState === 'idle' && !isUnsupported && (
                                <span className="text-sm text-slate-400">Tap the mic to start recording</span>
                            )}
                        </div>

                        {/* Textarea */}
                        <div className="relative">
                            <textarea
                                ref={textareaRef}
                                value={text}
                                onChange={e => setText(e.target.value)}
                                placeholder="Your transcribed text will appear here. You can also type or edit directly."
                                rows={10}
                                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-700 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                            />
                            {text && (
                                <button
                                    onClick={handleClear}
                                    title="Clear text"
                                    className="absolute top-3 right-3 text-slate-400 hover:text-red-400 transition"
                                >
                                    <span className="material-icons-round text-[18px]">close</span>
                                </button>
                            )}
                        </div>

                        {/* Character count */}
                        <p className="text-xs text-slate-400 -mt-2 text-right">
                            {text.length} character{text.length !== 1 ? 's' : ''}
                        </p>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleClear}
                                disabled={!text}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                                Clear
                            </button>
                            <button
                                onClick={handleCopy}
                                disabled={!text.trim()}
                                title="Copy to clipboard"
                                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1.5"
                            >
                                <span className="material-icons-round text-[18px]">
                                    {copied ? 'check' : 'content_copy'}
                                </span>
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                            <button
                                onClick={handleInsert}
                                disabled={!text.trim()}
                                className="flex-1 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                            >
                                <span className="material-icons-round text-[18px]">arrow_forward</span>
                                Insert into Note
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
