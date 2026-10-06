import React, { useState, useEffect, useRef } from "react";
import Loader from '../globals/Loader';
import { Link } from "react-router-dom";
import NotificationIcon from "../user/NotificationIcon";
import { APP_BASENAME } from "../../utils/basename";
import { shakespearepurple } from "../../assets/assets";

const STATUS_CONFIG = {
    loading: { label: 'Loading', icon: 'hourglass_top',  cls: 'bg-stone-100 text-stone-400' },
    saving:  { label: 'Saving',  icon: 'sync',           cls: 'bg-amber-50  text-amber-600 animate-spin-slow' },
    saved:   { label: 'Saved',   icon: 'cloud_done',     cls: 'bg-emerald-50 text-emerald-600' },
    error:   { label: 'Unsaved', icon: 'cloud_off',      cls: 'bg-red-50    text-red-500' },
    idle:    { label: '',        icon: '',               cls: '' },
};

// ── Voice-to-text hook ────────────────────────────────────────────────────────
function useVoiceToText(onResult) {
    const [voiceState, setVoiceState] = useState('idle'); // idle | countdown | listening | unsupported
    const recognitionRef = useRef(null);
    const countdownRef   = useRef(null);

    const supported = typeof window !== 'undefined' &&
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

    const start = () => {
        if (!supported) { setVoiceState('unsupported'); return; }
        if (voiceState !== 'idle') return;

        setVoiceState('countdown');
        let count = 3;
        countdownRef.current = setInterval(() => {
            count -= 1;
            if (count <= 0) {
                clearInterval(countdownRef.current);
                beginListening();
            }
        }, 1000);
    };

    const playBeep = () => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime);          // A5 — bright ping
            gain.gain.setValueAtTime(0.4, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.25);
        } catch (_) { /* AudioContext unavailable — silent fallback */ }
    };

    const beginListening = () => {
        playBeep();
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SR();
        recognition.continuous      = true;
        recognition.interimResults  = false;
        recognition.lang            = 'en-US';

        recognition.onresult = (e) => {
            // Slice from e.resultIndex so we only process the NEW segment, not the
            // full accumulated results list (which would cause text duplication).
            const transcript = Array.from(e.results)
                .slice(e.resultIndex)
                .map(r => r[0].transcript)
                .join(' ');
            onResult(transcript);
        };

        recognition.onend = () => setVoiceState('idle');
        recognition.onerror = () => setVoiceState('idle');

        recognitionRef.current = recognition;
        recognition.start();
        setVoiceState('listening');
    };

    const stop = () => {
        clearInterval(countdownRef.current);
        recognitionRef.current?.stop();
        setVoiceState('idle');
    };

    const toggle = () => { voiceState === 'idle' ? start() : stop(); };

    return { voiceState, toggle, supported };
}

// ── Countdown overlay ─────────────────────────────────────────────────────────
const VoiceCountdown = ({ voiceState }) => {
    const [count, setCount] = useState(3);

    useEffect(() => {
        if (voiceState !== 'countdown') { setCount(3); return; }
        setCount(3);
        const t = setInterval(() => setCount(c => c - 1), 1000);
        return () => clearInterval(t);
    }, [voiceState]);

    if (voiceState === 'unsupported') return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-stone-900/40 backdrop-blur-sm">
            <div className="bg-paper shadow-2xl border border-stone-200 p-8 max-w-sm text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-plum-50 text-plum-700 flex items-center justify-center">
                    <span className="material-icons-round text-[24px]">mic_off</span>
                </div>
                <p className="font-semibold text-stone-900 text-lg mb-1">Not supported</p>
                <p className="text-stone-500 text-sm">Voice input works in <strong>Chrome</strong> and <strong>Edge</strong>. Safari and Firefox do not support the Web Speech API.</p>
                <button onClick={() => window.location.reload()} className="mt-5 px-5 py-2 bg-plum-600 text-white text-sm font-medium hover:bg-plum-700 transition-colors">OK</button>
            </div>
        </div>
    );

    if (voiceState === 'countdown') return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-stone-900/40 backdrop-blur-sm">
            <div className="bg-paper border border-stone-200 shadow-2xl px-6 md:px-12 py-10 text-center">
                <p className="text-stone-500 text-[12px] md:text-sm mb-2 md:mb-4">Get ready to speak in…</p>
                <p className="text-3xl md:text-8xl font-semibold text-plum-600 leading-none">{count}</p>
                <p className="text-stone-400 text-[10px] md:text-xs mt-4">Works best in Chrome &amp; Edge</p>
            </div>
        </div>
    );

    if (voiceState === 'listening') return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 bg-stone-900 text-white px-4 md:px-5 py-2 md:py-3 shadow-2xl">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span className="text-[11px] md:text-[12px] font-medium">Listening…</span>
            <span className="text-[9px] md:text-[10px] text-stone-400 uppercase tracking-widest">Chrome / Edge</span>
        </div>
    );

    return null;
};

// Shared square action button — keeps the header chromatically quiet.
// `compact` sizes the Schola button to its portrait image and leaves it
// untinted, so it gets no active fill — just an opacity nudge on hover.
const ActionButton = ({ icon, image, title, onClick, active, disabled, listening, compact }) => (
    <button
        onClick={onClick}
        title={title}
        disabled={disabled}
        className={`${compact ? 'w-6 h-6 md:w-7 md:h-7' : 'w-8 h-8 md:w-9 md:h-9'} flex items-center justify-center transition
            ${
                compact
                    ? 'hover:opacity-80'
                    : listening
                        ? 'bg-red-500 text-white animate-pulse'
                        : active
                            ? 'bg-plum-600 text-white'
                            : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'
            }
            ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
    >
        {image ? (
            <img src={image} alt="" aria-hidden="true" className="h-[16px] md:h-[18px] w-auto object-contain" />
        ) : (
            <span className="material-icons-round text-[17px] md:text-[18px]">{icon}</span>
        )}
    </button>
);

const Divider = () => <span className="hidden sm:block w-px h-5 bg-stone-200 mx-0.5 md:mx-1" />;

const MenuButton = ({ icon, label, onClick }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-stone-50 text-stone-700 text-[13px] font-medium transition-colors"
    >
        <span className="material-icons-round text-[17px] text-stone-400">{icon}</span>
        {label}
    </button>
);

export const NoteHeader = ({
    title,
    onTitleChange,
    saveStatus = 'idle',
    onSave,
    onExportPDF,
    onExportImage,
    onCopy,
    onToggleAI,
    isAIOpen,
    onToggleHistory,
    isHistoryOpen,
    canUndo,
    canRedo,
    onUndo,
    onRedo,
    onOpenSettings,
    folderId,
    noteId,
    onVoiceResult,
    onVoiceStateChange,
}) => {
    const status = STATUS_CONFIG[saveStatus] ?? STATUS_CONFIG.idle;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);

    const handleCopyLink = () => {
        if (!noteId) return;
        navigator.clipboard.writeText(`${window.location.origin}${APP_BASENAME}/note/${noteId}`).then(() => {
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        });
    };
    const { voiceState, toggle: toggleVoice } = useVoiceToText((transcript) => {
        onVoiceResult?.(transcript);
    });

    // Notify parent whenever recording state changes
    const prevVoiceStateRef = useRef(null);
    useEffect(() => {
        if (prevVoiceStateRef.current === voiceState) return;
        prevVoiceStateRef.current = voiceState;
        onVoiceStateChange?.(voiceState === 'listening');
    }, [voiceState, onVoiceStateChange]);

    const menuAction = (fn) => () => { fn?.(); setIsMenuOpen(false); };

    return (
        <header className="border-b border-stone-200 bg-paper/95 backdrop-blur-md sticky top-0 z-40">
            {/* Back to folder — shown whenever note belongs to a folder */}
            {folderId && (
                <div className="px-3 md:px-6 pt-2">
                    <Link
                        to={`/lockedin/folders/${folderId}`}
                        className="inline-flex items-center gap-1 text-[10px] md:text-[11px] text-stone-400 hover:text-plum-700 transition-colors"
                    >
                        <span className="material-icons-round text-[11px] md:text-[14px]">arrow_back</span>
                        Back to folder
                    </Link>
                </div>
            )}

            <div className={`flex items-center gap-3 px-3 md:px-6 ${folderId ? 'pt-1 pb-2.5' : 'py-2.5'} md:py-3`}>
                {/* Left: title + save state */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <input
                        className={`bg-transparent border-none focus:ring-0 p-0 m-0 text-[15px] md:text-[17px] font-display font-semibold tracking-tight text-stone-900 placeholder:text-stone-300 w-full max-w-[220px] md:max-w-sm truncate transition-opacity ${saveStatus === 'loading' ? 'opacity-40 cursor-wait pointer-events-none' : ''}`}
                        type="text"
                        value={title}
                        onChange={(e) => onTitleChange(e.target.value)}
                        placeholder="Untitled Note"
                        readOnly={saveStatus === 'loading'}
                    />
                    {status.label && (
                        <span className={`hidden sm:inline-flex shrink-0 items-center gap-1 px-2 py-1 text-[9px] md:text-[10px] font-semibold uppercase tracking-wider ${status.cls}`}>
                            {saveStatus === 'saving' ? <Loader size="xs" /> : <span className="material-icons-round text-[12px] md:text-[13px]">{status.icon}</span>}
                            {saveStatus !== 'loading' && saveStatus !== 'saving' && status.label}
                        </span>
                    )}
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-0.5 md:gap-1 shrink-0">
                    <ActionButton icon="undo" title="Undo (Ctrl+Z)" onClick={onUndo} disabled={!canUndo} />
                    <ActionButton icon="redo" title="Redo (Ctrl+Y)" onClick={onRedo} disabled={!canRedo} />

                    <Divider />

                    <button
                        onClick={onSave}
                        disabled={saveStatus === 'saving'}
                        title="Save now (Ctrl+S)"
                        className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 text-[11px] md:text-xs font-medium transition-colors
                            ${saveStatus === 'saving'
                                ? 'bg-plum-50 text-plum-500 cursor-wait'
                                : 'bg-plum-50 text-plum-700 hover:bg-plum-600 hover:text-white'
                            }`}
                    >
                        <span className="material-icons-round text-[13px] md:text-[14px]">save</span>
                        <span className="hidden sm:inline">Save</span>
                    </button>

                    <Divider />

                    <ActionButton icon="history" title="Version history" onClick={onToggleHistory} active={isHistoryOpen} />
                    <ActionButton image={shakespearepurple} title="Schola AI assistant" onClick={onToggleAI} active={isAIOpen} compact />
                    <ActionButton icon="tune" title="Note preferences" onClick={onOpenSettings} />

                    <div className="relative">
                        <ActionButton icon="more_vert" title="More" onClick={() => setIsMenuOpen(!isMenuOpen)} active={isMenuOpen} />
                        {isMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-20 pointer-events-auto" onClick={() => setIsMenuOpen(false)} />
                                <div className="absolute right-0 top-full mt-2 w-52 bg-white shadow-xl border border-stone-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                                    {noteId && (
                                        <button
                                            onClick={() => { handleCopyLink(); setIsMenuOpen(false); }}
                                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-stone-50 text-stone-700 text-[13px] font-medium transition-colors"
                                        >
                                            <span className={`material-icons-round text-[17px] ${linkCopied ? 'text-emerald-500' : 'text-stone-400'}`}>
                                                {linkCopied ? 'check_circle' : 'link'}
                                            </span>
                                            {linkCopied ? 'Link copied!' : 'Copy Link'}
                                        </button>
                                    )}
                                    <MenuButton icon="content_copy" label="Make a Copy" onClick={menuAction(onCopy)} />
                                    <div className="h-px bg-stone-100 my-1.5" />
                                    <MenuButton icon="picture_as_pdf" label="Export as PDF" onClick={menuAction(onExportPDF)} />
                                    <MenuButton icon="image" label="Export as Image" onClick={menuAction(onExportImage)} />
                                </div>
                            </>
                        )}
                    </div>

                    <Divider />

                    <ActionButton
                        icon={voiceState === 'listening' ? 'stop_circle' : 'mic'}
                        title={voiceState === 'listening' ? 'Stop recording' : 'Voice to text (Chrome / Edge)'}
                        onClick={toggleVoice}
                        listening={voiceState === 'listening'}
                    />
                    <NotificationIcon />
                </div>
            </div>

            <VoiceCountdown voiceState={voiceState} />
        </header>
    );
};
