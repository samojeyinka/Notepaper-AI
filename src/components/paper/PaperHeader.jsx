import React, { useState, useEffect, useRef } from "react";
import Loader from '../globals/Loader';
import { Link } from "react-router-dom";

const STATUS_CONFIG = {
    loading: { label: 'Loading...', icon: 'hourglass_top',  cls: 'bg-slate-100 text-slate-400' },
    saving:  { label: 'Saving...',  icon: 'sync',           cls: 'bg-amber-50  text-amber-500' },
    saved:   { label: 'Saved',      icon: 'cloud_done',     cls: 'bg-green-50  text-green-600' },
    error:   { label: 'Unsaved',    icon: 'cloud_off',      cls: 'bg-red-50    text-red-500' },
    idle:    { label: '',           icon: '',               cls: '' },
};

function useVoiceToText(onResult) {
    const [voiceState, setVoiceState] = useState('idle');
    const recognitionRef = useRef(null);
    const countdownRef   = useRef(null);
    const supported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

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

    const playBeep = () => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator(), gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.type = 'sine'; osc.frequency.setValueAtTime(880, ctx.currentTime);
            gain.gain.setValueAtTime(0.4, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
            osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.25);
        } catch (_) { /* silent */ }
    };

    const beginListening = () => {
        playBeep();
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SR();
        recognition.continuous = true; recognition.interimResults = false; recognition.lang = 'en-US';
        recognition.onresult = (e) => {
            const transcript = Array.from(e.results).slice(e.resultIndex).map(r => r[0].transcript).join(' ');
            onResult(transcript);
        };
        recognition.onend = () => setVoiceState('idle');
        recognition.onerror = () => setVoiceState('idle');
        recognitionRef.current = recognition;
        recognition.start();
        setVoiceState('listening');
    };

    const stop   = () => { clearInterval(countdownRef.current); recognitionRef.current?.stop(); setVoiceState('idle'); };
    const toggle = () => { voiceState === 'idle' ? start() : stop(); };

    return { voiceState, toggle, supported };
}

const VoiceCountdown = ({ voiceState }) => {
    const [count, setCount] = useState(3);
    useEffect(() => {
        if (voiceState !== 'countdown') { setCount(3); return; }
        setCount(3);
        const t = setInterval(() => setCount(c => c - 1), 1000);
        return () => clearInterval(t);
    }, [voiceState]);

    if (voiceState === 'unsupported') return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm text-center">
                <span className="material-icons-round text-4xl text-slate-300 mb-3 block">mic_off</span>
                <p className="font-bold text-slate-800 text-lg mb-1">Not supported</p>
                <p className="text-slate-500 text-sm">Voice input works in <strong>Chrome</strong> and <strong>Edge</strong>.</p>
                <button onClick={() => window.location.reload()} className="mt-5 px-5 py-2 bg-primary text-white rounded-xl text-sm font-semibold">OK</button>
            </div>
        </div>
    );

    if (voiceState === 'countdown') return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white mt-20 md:mt-52 rounded-xl md:rounded-3xl shadow-2xl px-6 md:px-12 py-10 text-center">
                <p className="text-slate-500 text-[12px] md:text-sm mb-2 md:mb-4">Get ready to speak in…</p>
                <p className="text-3xl md:text-8xl font-semibold md:font-bold text-primary leading-none">{count}</p>
                <p className="text-slate-400 text-[10px] md:text-xs mt-4">Works best in Chrome &amp; Edge</p>
            </div>
        </div>
    );

    if (voiceState === 'listening') return (
        <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 bg-slate-900 text-white px-2.5 md:px-5 py-1.5 md:py-3 rounded-xl md:rounded-2xl shadow-2xl">
            <span className="w-1.5 h-1.5 md:w-2.5 md:h-2.5 rounded-full bg-red-400 animate-pulse" />
            <span className="text-[10px] md:text-[12px] font-normal">Listening…</span>
        </div>
    );

    return null;
};

export const PaperHeader = ({
    title,
    onTitleChange,
    saveStatus = 'idle',
    onSave,
    onExportPDF,
    onExportDOCX,
    onExportPPTX,
    onCopy,
    onToggleAI,
    isAIOpen,
    onToggleHistory,
    isHistoryOpen,
    canUndo,
    canRedo,
    onUndo,
    onRedo,
    folderId,
    onVoiceResult,
    onVoiceStateChange,
    onGeneratePresentation,
    presentationCount = 0,
    onTogglePresentations,
    isPresentationsOpen,
}) => {
    const status  = STATUS_CONFIG[saveStatus] ?? STATUS_CONFIG.idle;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        });
    };
    const { voiceState, toggle: toggleVoice } = useVoiceToText((transcript) => { onVoiceResult?.(transcript); });

    const prevVoiceStateRef = useRef(null);
    useEffect(() => {
        if (prevVoiceStateRef.current === voiceState) return;
        prevVoiceStateRef.current = voiceState;
        onVoiceStateChange?.(voiceState === 'listening');
    }, [voiceState, onVoiceStateChange]);

    const MenuButton = ({ icon, label, onClick, badge }) => (
        <button
            onClick={() => { onClick(); setIsMenuOpen(false); }}
            className="w-full flex items-center gap-1.5 md:gap-3 px-2 py-1 md:px-4 md:py-2 hover:bg-slate-50 text-slate-700 text-[11px] md:text-sm font-normal md:font-medium transition-all"
        >
            <span className="material-icons-round text-[11px] md:text-[18px] text-slate-400">{icon}</span>
            {label}
            {badge != null && badge > 0 && (
                <span className="ml-auto text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-full">{badge}</span>
            )}
        </button>
    );

    return (
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40">
            {folderId && (
                <div className="px-3 md:px-6 pt-1 md:pt-2">
                    <Link to={`/lockedin/folders/${folderId}`} className="inline-flex items-center gap-1 text-[10px] md:text-[11px] text-slate-400 hover:text-primary transition-colors">
                        <span className="material-icons-round text-[11px] md:text-[14px]">arrow_back</span>
                        Back to folder
                    </Link>
                </div>
            )}
            <div className="h-auto md:h-14 flex items-center flex-wrap md:flex-nowrap justify-between px-3 md:px-8 py-1.5 md:py-0">
                {/* Left */}
                <div className="flex items-center gap-2 md:gap-4">
                    <input
                        className={`bg-transparent border-none text-[12px] md:text-[14px] font-display font-medium md:font-semibold focus:ring-0 w-32 md:w-96 text-slate-900 transition-opacity ${saveStatus === 'loading' ? 'opacity-40 cursor-wait pointer-events-none' : ''}`}
                        type="text"
                        value={title}
                        onChange={(e) => onTitleChange(e.target.value)}
                        placeholder="Untitled Paper"
                        readOnly={saveStatus === 'loading'}
                    />
                    {status.label && (
                        <span className={`flex items-center gap-0.5 md:gap-1 px-1 md:px-2 py-0.5 md:py-1 rounded-lg text-[8px] md:text-[10px] font-medium uppercase tracking-wider transition-all duration-300 ${status.cls}`}>
                            {saveStatus === 'saving' ? <Loader size="xs" /> : <span className="material-icons-round text-[10px] md:text-[14px]">{status.icon}</span>}
                            {status.label}
                        </span>
                    )}
                    <button
                        onClick={onSave}
                        disabled={saveStatus === 'saving'}
                        title="Save now (Ctrl+S)"
                        className={`flex items-center gap-1 md:gap-1.5 px-1.5 md:px-3 py-1 md:py-1.5 rounded-lg text-[9px] md:text-xs font-normal transition-all duration-200
                            ${saveStatus === 'saving' ? 'bg-amber-50 text-amber-400 cursor-wait' : 'bg-primary/10 text-primary hover:bg-primary hover:text-white active:scale-95'}`}
                    >
                        <span className="material-icons-round text-[10px] md:text-[14px]">save</span>
                        Save
                    </button>
                    <div className="flex items-center gap-1">
                        <button onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)" className="w-6 h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90">
                            <span className="material-icons-round text-[14px] md:text-[17px]">undo</span>
                        </button>
                        <button onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Y)" className="w-6 h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90">
                            <span className="material-icons-round text-[14px] md:text-[17px]">redo</span>
                        </button>
                    </div>
                </div>

                {/* Right */}
                <div className="flex items-center justify-between w-full gap-1.5 md:gap-3">
                    {/* Generate presentation button */}
                    <button
                        onClick={onGeneratePresentation}
                        title="Generate Presentation from this Paper"
                        className="md:ml-3 flex items-center gap-1 md:gap-1.5 px-1.5 md:px-3 py-1 md:py-1.5 rounded md:rounded-md text-[9px] md:text-[10px] font-medium bg-gradient-to-r from-primary to-indigo-500 text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all"
                    >
                        <span className="material-icons-round text-[12px] md:text-[15px]">slideshow</span>
                        <span className="inline">Generate Slides</span>
                        {presentationCount > 0 && <span className="bg-white/20 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{presentationCount}</span>}
                    </button>

                    <div className="flex items-center bg-slate-100 rounded-full px-0.5 md:p-1 mr-2 md:mr-4 relative">
                        <button
                            onClick={onToggleHistory}
                            title="Version history"
                            className={`p-0.5 md:p-1 rounded-full transition-all duration-200 flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95
                                ${isHistoryOpen ? 'bg-primary text-white shadow-md shadow-primary/40' : 'text-slate-400 hover:bg-white hover:text-primary hover:shadow-lg'}`}
                        >
                            <span className="material-icons-round text-[13px] md:text-[17px]">history</span>
                        </button>
                        <button
                            onClick={onTogglePresentations}
                            title="Presentations"
                            className={`relative p-0.5 md:p-1 rounded-full transition-all duration-200 flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95
                                ${isPresentationsOpen ? 'bg-primary text-white shadow-md shadow-primary/40' : 'text-slate-400 hover:bg-white hover:text-primary hover:shadow-lg'}`}
                        >
                            <span className="material-icons-round text-[13px] md:text-[17px]">slideshow</span>
                            {presentationCount > 0 && (
                                <span className={`absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full text-[8px] font-bold flex items-center justify-center leading-none ${isPresentationsOpen ? 'bg-white text-primary' : 'bg-primary text-white'}`}>
                                    {presentationCount}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={onToggleAI}
                            className={`p-0.5 md:p-1 rounded-full transition-all duration-500 relative flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95
                                ${isAIOpen ? 'bg-primary text-white shadow-xl shadow-primary/40' : 'text-slate-400 hover:bg-white hover:text-primary hover:shadow-lg animate-glow'}`}
                        >
                            <span className="material-icons-round text-[13px] md:text-[17px]">auto_awesome</span>
                            {!isAIOpen && <span className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping opacity-30 pointer-events-none" />}
                        </button>
                        <style>{`@keyframes glow{0%{box-shadow:0 0 0 0 rgba(167,139,250,0)}50%{box-shadow:0 0 15px 2px rgba(167,139,250,0.3)}100%{box-shadow:0 0 0 0 rgba(167,139,250,0)}}.animate-glow{animation:glow 2.5s infinite ease-in-out}`}</style>
                        <div className="relative">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`p-0.5 md:p-1 hover:bg-white rounded-full text-slate-600 transition-all ${isMenuOpen ? 'bg-white shadow-sm' : ''}`}>
                                <span className="material-icons-round text-[13px] md:text-[17px]">more_vert</span>
                            </button>
                            {isMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-20 pointer-events-auto" onClick={() => setIsMenuOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-36 md:w-56 bg-white rounded-md md:rounded-2xl shadow-xl border border-slate-100 py-2 z-30 animate-in fade-in zoom-in-95 duration-150">
                                        <button
                                            onClick={() => { handleCopyLink(); setIsMenuOpen(false); }}
                                            className="w-full flex items-center gap-1.5 md:gap-3 px-2 py-1 md:px-4 md:py-2 hover:bg-slate-50 text-slate-700 text-[11px] md:text-sm font-normal md:font-medium transition-all"
                                        >
                                            <span className={`material-icons-round text-[11px] md:text-[18px] ${linkCopied ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                {linkCopied ? 'check_circle' : 'link'}
                                            </span>
                                            {linkCopied ? 'Link copied!' : 'Copy Link'}
                                        </button>
                                        <MenuButton icon="content_copy" label="Make a Copy" onClick={onCopy} />
                                        <div className="h-px bg-slate-100 my-2" />
                                        <MenuButton icon="picture_as_pdf" label="Export as PDF" onClick={onExportPDF} />
                                        <MenuButton icon="description" label="Export as DOCX" onClick={onExportDOCX} />
                                        <MenuButton icon="slideshow" label="Export as PPTX" onClick={onExportPPTX} />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={toggleVoice}
                        title={voiceState === 'listening' ? 'Stop recording' : 'Voice to text'}
                        className={`flex items-center gap-1 text-[13px] text-white px-1 py-1 md:px-1.5 md:py-1.5 rounded-full font-medium shadow-lg hover:scale-105 active:scale-95 transition-all
                            ${voiceState === 'listening' ? 'bg-red-500 shadow-red-400/30 animate-pulse' : 'bg-accent-green shadow-accent-green/20'}`}
                    >
                        <span className="material-icons-round text-[13px] md:text-[17px]">{voiceState === 'listening' ? 'stop_circle' : 'mic'}</span>
                    </button>
                </div>
            </div>
            <VoiceCountdown voiceState={voiceState} />
        </header>
    );
};
