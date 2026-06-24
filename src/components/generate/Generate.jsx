import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { usePlan } from "../../hooks/usePlan";
import { generateService } from "../../api/generateService";
import AutoFlashcardTab from "./AutoFlashcardTab";
import AutoPresentationTab from "./AutoPresentationTab";
import AutoQuizTab from "./AutoQuizTab";
import AutoDiagramTab from "./AutoDiagramTab";
import GenerateFromContent, { TAB_CONFIG } from "./GenerateFromContent";
import LimitBanner from "./LimitBanner";

const EMPTY_SELECTED = { Notes: [], Papers: [], Slides: [], Flashcards: [] };

const google = createGoogleGenerativeAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

// ── Markdown → HTML ───────────────────────────────────────────────────────────
function escapeHtml(t) {
    return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}
function inlineFormat(text) {
    return escapeHtml(text)
        .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
        .replace(/\*\*(.+?)\*\*/g,     "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g,         "<em>$1</em>")
        .replace(/_(.+?)_/g,           "<em>$1</em>")
        .replace(/`(.+?)`/g,           "<code class='bg-slate-100 px-1 rounded font-mono'>$1</code>");
}
function markdownToHtml(md) {
    const lines = md.split("\n");
    const out = [];
    let inUl = false, inOl = false;
    const closeList = () => {
        if (inUl) { out.push("</ul>"); inUl = false; }
        if (inOl) { out.push("</ol>"); inOl = false; }
    };
    for (const raw of lines) {
        const line = raw.trimEnd();
        if      (/^### /.test(line)) { closeList(); out.push(`<h3 class="font-bold text-slate-800 mt-3 mb-0.5">${inlineFormat(line.slice(4))}</h3>`); }
        else if (/^## /.test(line))  { closeList(); out.push(`<h2 class="font-bold text-slate-800 mt-4 mb-1">${inlineFormat(line.slice(3))}</h2>`); }
        else if (/^# /.test(line))   { closeList(); out.push(`<h1 class="font-bold text-slate-800 mt-5 mb-1">${inlineFormat(line.slice(2))}</h1>`); }
        else if (/^[-*] /.test(line)) {
            if (!inUl) { closeList(); out.push('<ul class="list-disc list-inside space-y-0.5 my-1.5 text-slate-700">'); inUl = true; }
            out.push(`<li>${inlineFormat(line.slice(2))}</li>`);
        } else if (/^\d+\. /.test(line)) {
            if (!inOl) { closeList(); out.push('<ol class="list-decimal list-inside space-y-0.5 my-1.5 text-slate-700">'); inOl = true; }
            out.push(`<li>${inlineFormat(line.replace(/^\d+\. /, ""))}</li>`);
        } else if (/^-{3,}$/.test(line.trim())) {
            closeList(); out.push('<hr class="my-3 border-slate-200">');
        } else if (line.trim() === "") {
            closeList(); out.push('<div class="h-1.5"></div>');
        } else {
            closeList(); out.push(`<p class="leading-relaxed text-slate-700">${inlineFormat(line)}</p>`);
        }
    }
    closeList();
    return out.join("");
}


const SYSTEM_INSTRUCTION = `You are Schola — an expert study-note generator inside a note-taking app called Notepaper-ai.
Your job is to produce thorough, well-structured, deeply informative content on any topic the student gives you.

Rules:
- NEVER add preamble like "Here is your content:" or "Sure!" — start immediately with the content.
- Use clear headings, bullet points, and numbered lists where appropriate.
- Provide real depth: explanations, examples, analogies, key facts, and important nuances.
- Write in plain, readable English unless a different style is requested.
- Match the requested length. Default to comprehensive — do not cut short unless told to be brief.
- Never refuse a reasonable academic or writing task.`;

const TONES = [
    { value: "academic",    label: "Academic",    icon: "school" },
    { value: "simple",      label: "Simple",      icon: "child_care" },
    { value: "bullet",      label: "Bullet Notes", icon: "format_list_bulleted" },
    { value: "storytelling",label: "Story",        icon: "auto_stories" },
];

const LENGTHS = [
    { value: "short",    label: "Short",        desc: "~200 words" },
    { value: "medium",   label: "Medium",       desc: "~500 words" },
    { value: "long",     label: "Long",         desc: "~1000 words" },
    { value: "detailed", label: "Very Detailed", desc: "~2000+ words" },
];

const TOKEN_MAP = { short: 512, medium: 1200, long: 2800, detailed: 6000 };

// ── Animated shimmer skeleton ─────────────────────────────────────────────────
function Skeleton() {
    return (
        <div className="flex flex-col gap-3 animate-pulse">
            {[80, 60, 95, 50, 75, 65, 90].map((w, i) => (
                <div key={i} className="h-3 rounded-full bg-slate-200" style={{ width: `${w}%` }} />
            ))}
        </div>
    );
}

const TABS = [
    { id: 'generate',      label: 'AI Generate',   icon: 'auto_awesome' },
    { id: 'flashcards',    label: 'Flashcards',     icon: 'style'        },
    { id: 'quizzes',       label: 'Quizzes',        icon: 'quiz'         },
    { id: 'presentations', label: 'Presentations',  icon: 'slideshow'    },
    { id: 'diagrams',      label: 'Diagrams',       icon: 'account_tree' },
];

export default function Generate() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') ?? 'generate';

    const setTab = (id) => setSearchParams({ tab: id }, { replace: true });

    const { canUseAI, increment, loaded } = usePlan();
    const [prompt, setPrompt]   = useState("");
    const [tone, setTone]       = useState("academic");
    const [length, setLength]   = useState("long");
    const [output, setOutput]   = useState("");
    const [status, setStatus]   = useState("idle"); // idle | streaming | done | error
    const [copied, setCopied]   = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const [mobilePreview, setMobilePreview] = useState(false);
    const [contentSelected, setContentSelected] = useState(EMPTY_SELECTED);
    const [contentFiles, setContentFiles] = useState([]);

    const totalSelected = Object.values(contentSelected).reduce((sum, arr) => sum + arr.length, 0);
    const hasContent = totalSelected > 0 || contentFiles.length > 0;

    const limitReached = loaded && !canUseAI('ai_use');

    const abortRef   = useRef(null);
    const outputRef  = useRef(null);
    const promptRef  = useRef(null);

    useEffect(() => { promptRef.current?.focus(); }, []);

    // Auto-scroll output while streaming
    useEffect(() => {
        if (outputRef.current && status === "streaming") {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [output, status]);

    // Live word count
    useEffect(() => {
        const words = output.trim().split(/\s+/).filter(Boolean).length;
        setWordCount(output.trim() ? words : 0);
    }, [output]);

    const buildUserMessage = () => {
        const toneLabel = TONES.find(t => t.value === tone)?.label ?? tone;
        const lengthLabel = LENGTHS.find(l => l.value === length)?.label ?? length;
        return `Topic: ${prompt.trim()}\nTone: ${toneLabel}\nLength: ${lengthLabel}`;
    };

    const runGenerate = async (userMessage) => {
        setOutput("");
        setStatus("streaming");
        abortRef.current = new AbortController();

        try {
            const result = streamText({
                model: google("gemini-2.5-flash-lite"),
                system: SYSTEM_INSTRUCTION,
                messages: [{ role: "user", content: userMessage }],
                temperature: 0.7,
                maxTokens: TOKEN_MAP[length] ?? 2800,
                abortSignal: abortRef.current.signal,
            });

            for await (const chunk of result.textStream) {
                setOutput(prev => prev + chunk);
            }
            setStatus("done");
            increment('ai_use');
        } catch (err) {
            if (err.name === "AbortError") {
                setStatus(output ? "done" : "idle");
            } else {
                console.error("[Generate]", err);
                setStatus("error");
            }
        }
    };

    const handleGenerate = async () => {
        if ((!prompt.trim() && !hasContent) || status === "streaming") return;
        setMobilePreview(true);

        if (hasContent) {
            setOutput("");
            setStatus("streaming");
            const materialIds = Object.entries(contentSelected).flatMap(([tab, items]) =>
                items.map(item => ({ type: TAB_CONFIG[tab].type, id: item.id }))
            );
            try {
                const res = await generateService.notes({
                    materialIds,
                    uploads: contentFiles,
                    topic: prompt.trim() || undefined,
                    tone,
                    length,
                });
                setOutput(res?.data?.content ?? res?.content ?? '');
                setStatus("done");
                increment('ai_use');
            } catch (err) {
                console.error("[Generate]", err);
                setStatus("error");
            }
            return;
        }

        runGenerate(buildUserMessage());
    };

    const handleStop = () => abortRef.current?.abort();

    const handleReset = () => {
        setOutput("");
        setStatus("idle");
        setPrompt("");
        setMobilePreview(false);
        setTimeout(() => promptRef.current?.focus(), 50);
    };

    const handleCopy = () => {
        if (!output.trim()) return;
        navigator.clipboard.writeText(output.trim()).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleInsert = () => {
        if (!output.trim()) return;
        navigate("/lockedin/notes/new", { state: { voiceText: output.trim() } });
    };

      const handleInsertPaper = () => {
        if (!output.trim()) return;
        navigate("/lockedin/papers/new", { state: { voiceText: output.trim() } });
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleGenerate();
    };

    const isStreaming = status === "streaming";
    const isDone      = status === "done";
    const isIdle      = status === "idle";

    return (
        <div className="flex-1 flex min-h-screen bg-surface-light">
            <main className="flex-1 flex flex-col lg:ml-64 min-h-screen">

                {/* ── Top bar ──────────────────────────────────────────────── */}
                <header className="hidden ticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100/80 px-6 h-16 md:flex items-center justify-between shadow-[0_2px_12px_rgba(0,0,0,0.02)] shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="text-base font-semibold text-slate-900 tracking-tight">AI Studio</span>     
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                        {isStreaming && (
                            <span className="flex items-center gap-1.5 text-primary animate-pulse font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                Generating…
                            </span>
                        )}
                        {isDone && (
                            <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                                <span className="material-icons-round text-[14px]">check_circle</span>
                                {wordCount.toLocaleString()} words
                            </span>
                        )}
                    </div>
                </header>

                {/* ── Tab strip ──────────────────────────────────────────── */}
                <div className="shrink-0 bg-white border-b border-slate-100 pt-2 px-4 md:px-6 flex items-center gap-1 overflow-x-auto scrollbar-none mt-16 md:mt-0">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setTab(tab.id)}
                            className={`flex items-center gap-1.5 px-2 md:px-4 py-1.5 md:py-3.5 text-[10px] md:text-xs font-medium md:font-bold whitespace-nowrap border-b-2 transition-all shrink-0 ${
                                activeTab === tab.id
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200'
                            }`}
                        >
                            <span className="material-icons-round text-[13px] md:text-[15px]">{tab.icon}</span>
                            {tab.label}
                            {tab.soon && (
                                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-400 rounded-full text-[8px] font-bold uppercase tracking-wider">Soon</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* ── Tab content ─────────────────────────────────────────── */}

                {/* Flashcards tab */}
                {activeTab === 'flashcards' && <AutoFlashcardTab />}

                {/* Presentations tab */}
                {activeTab === 'presentations' && <AutoPresentationTab />}

                {/* Quizzes tab */}
                {activeTab === 'quizzes' && <AutoQuizTab />}

                {/* Diagrams tab */}
                {activeTab === 'diagrams' && <AutoDiagramTab />}

                {/* Generate tab (default) */}
                {activeTab === 'generate' && (
                <div className="flex-1 p-4 md:p-6 grid grid-cols-12 gap-4 md:gap-6 items-start">

                    {/* ── Left — config panel ──────────────────────────────── */}
                    <section className="col-span-12 md:col-span-4 flex flex-col gap-4">

                        {/* Settings card */}
                        <div className="bg-white rounded-xl md:rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.03)] p-3 md:p-6 flex flex-col gap-5">

                            <div className="flex items-center gap-3">
                                <div className="p-1 md:p-2.5 bg-amber-100 rounded-lg md:rounded-xl shrink-0">
                                    <span className="material-icons-round text-amber-600 text-[20px]">psychology</span>
                                </div>
                                <div>
                                    <h2 className="text-[15px] md:text-base font-medium md:font-semibold text-slate-800 leading-tight">AI Settings</h2>
                                </div>
                            </div>

                            {/* Prompt */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-semibold md:font-bold text-slate-400 uppercase tracking-widest">Topic / Prompt</label>
                                <textarea
                                    ref={promptRef}
                                    rows={5}
                                    value={prompt}
                                    onChange={e => setPrompt(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={isStreaming}
                                    placeholder="What are we writing about today?"
                                    className="w-full resize-none  rounded-lg md:rounded-xl bg-slate-50 border-none px-4 py-3 text-[12px] md:text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-primary/25 transition disabled:opacity-50"
                                />
                            </div>

                            {/* Tone */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-semibold md:font-bold text-slate-400 uppercase tracking-widest">Tone</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {TONES.map(t => (
                                        <button
                                            key={t.value}
                                            onClick={() => setTone(t.value)}
                                            disabled={isStreaming}
                                            className={`py-1.5 px-1.5 md:py-2.5 md:px-3 rounded-full text-[10px] md:text-xs font-medium md:font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50
                                                ${tone === t.value
                                                    ? "bg-primary/15 text-primary"
                                                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                                }`}
                                        >
                                            <span className="material-icons-round text-[13px]">{t.icon}</span>
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Length */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-semibold md:font-bold text-slate-400 uppercase tracking-widest">Length</label>
                                <div className="flex flex-wrap gap-2">
                                    {LENGTHS.map(l => (
                                        <button
                                            key={l.value}
                                            onClick={() => setLength(l.value)}
                                            disabled={isStreaming}
                                            className={`px-3 py-2 rounded-full text-[10px] md:text-xs font-medium md:font-semibold transition-all disabled:opacity-50
                                                ${length === l.value
                                                    ? "bg-primary/15 text-primary"
                                                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                                }`}
                                        >
                                            {l.label}
                                            <span className="text-[9px] opacity-60 ml-1">{l.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {limitReached && <LimitBanner message="Daily AI limit reached. Upgrade to Pro for more generations." />}

                            {/* Generate / Stop */}
                            {isStreaming ? (
                                <button
                                    onClick={handleStop}
                                    className="w-full py-4 rounded-full bg-red-50 border border-red-200 text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition"
                                >
                                    <span className="material-icons-round text-[20px]">stop_circle</span>
                                    Stop Generating
                                </button>
                            ) : (
                                <button
                                    onClick={handleGenerate}
                                    disabled={(!prompt.trim() && !hasContent) || limitReached || !loaded}
                                    className="w-full py-2 md:py-3 bg-primary text-white rounded-lg font-medium md:font-bold text-[12px] md:text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(51,33,95,0.3)] hover:scale-[0.98] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
                                >
                                    {!loaded ? (
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            {isDone ? "Regenerate" : hasContent ? "Generate from Content" : "Generate"}
                                        </>
                                    )}
                                </button>
                            )}

                            {isDone && (
                                <button
                                    onClick={handleReset}
                                    className="w-full py-2.5 rounded-full border border-slate-200 text-slate-500 text-sm font-semibold hover:bg-slate-50 transition"
                                >
                                    Start Over
                                </button>
                            )}
                        </div>

                        <GenerateFromContent
                            description="Generate content directly from your existing Notepaper notes and papers."
                            sources={[
                                { icon: 'description', label: 'From a Note' },
                                { icon: 'article',     label: 'From a Paper' },
                                { icon: 'folder_open', label: 'From a Folder' },
                            ]}
                            selected={contentSelected}
                            onSelectedChange={setContentSelected}
                            uploadedFiles={contentFiles}
                            onUploadedFilesChange={setContentFiles}
                        />
                    </section>

                    {/* ── Right — output workspace ─────────────────────────── */}
                    <section className="hidden md:block md:col-span-8">
                        <div className="bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex flex-col overflow-hidden relative md:min-h-[500px]">

                            {/* Workspace header */}
                            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-50 shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-red-400" />
                                        <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-amber-400" />
                                        <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-400" />
                                    </div>
                                    <span className="text-xs font-medium md:font-bold text-slate-400 tracking-wide">Output Preview</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={handleCopy}
                                        disabled={!output.trim() || isStreaming}
                                        title={copied ? "Copied!" : "Copy text"}
                                        className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 disabled:opacity-30 transition-colors"
                                    >
                                        <span className="material-icons-round text-[18px]">{copied ? "check" : "content_copy"}</span>
                                    </button>
                                    <button
                                        onClick={handleInsert}
                                        disabled={!output.trim() || isStreaming}
                                        title="Insert into Note"
                                        className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 disabled:opacity-30 transition-colors"
                                    >
                                        <span className="material-icons-round text-[18px]">note_add</span>
                                    </button>
                                    <button
                                        onClick={handleInsertPaper}
                                        disabled={!output.trim() || isStreaming}
                                        title="Insert into Paper"
                                        className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 disabled:opacity-30 transition-colors"
                                    >
                                        <span className="material-icons-round text-[18px]">article</span>
                                    </button>
                                </div>
                            </div>

                            {/* Content area */}
                            <div ref={outputRef} className="flex-1 overflow-y-auto p-6 md:p-8">

                                {/* Empty state */}
                                {isIdle && !output && (
                                    <div className="h-full flex flex-col items-center justify-center gap-6 text-center py-10">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-150 animate-pulse pointer-events-none" />
                                            <div className="relative w-28 h-28 bg-slate-50 rounded-full flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
                                                <span className="material-icons-round text-primary text-5xl">auto_awesome</span>
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 bg-emerald-100 p-2 rounded-full shadow-sm">
                                                <span className="material-icons-round text-emerald-600 text-[15px]">check_circle</span>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-semibold text-slate-800 mb-2 tracking-tight">Ready to generate</h3>
                                            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                                                Fill out the settings panel and hit <strong className="text-slate-600">Generate Content</strong> to craft your next piece.
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 w-full max-w-xs opacity-20 pointer-events-none select-none mt-2">
                                            <div className="h-24 bg-slate-100 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center">
                                                <span className="material-icons-round text-3xl text-slate-400">description</span>
                                            </div>
                                            <div className="h-24 bg-slate-100 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center">
                                                <span className="material-icons-round text-3xl text-slate-400">draw</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {isStreaming && !output && <Skeleton />}

                                {output && (
                                    <div className="text-[13px] leading-relaxed text-slate-700">
                                        <div dangerouslySetInnerHTML={{ __html: markdownToHtml(output) }} />
                                        {isStreaming && (
                                            <span className="inline-block w-0.5 h-3.5 bg-primary ml-0.5 animate-pulse align-text-bottom" />
                                        )}
                                    </div>
                                )}

                                {status === "error" && (
                                    <div className="flex items-center gap-2 text-red-500 text-sm mt-4">
                                        <span className="material-icons-round text-[18px]">error_outline</span>
                                        Something went wrong. Check your API key or try again.
                                    </div>
                                )}
                            </div>

                          

                            {/* Decorative glow */}
                            <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                        </div>
                    </section>
                </div>
                )}

                {/* ── Mobile output bottom-sheet (md and below only) ── */}
                {mobilePreview && (
                    <div className="md:hidden fixed inset-0 z-50 flex flex-col">
                        {/* Backdrop */}
                        <div className="absolute inset-0 bg-black/40" onClick={() => !isStreaming && setMobilePreview(false)} />

                        {/* Sheet */}
                        <div className="relative mt-auto bg-white rounded-t-2xl flex flex-col shadow-2xl max-h-[85vh]">

                            {/* Handle + header */}
                            <div className="px-4 pt-3 pb-3 flex items-center justify-between border-b border-slate-100 shrink-0">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-1 bg-slate-200 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
                                    <span className="text-sm font-semibold text-slate-700 mt-1">Output</span>
                                    {isStreaming && (
                                        <span className="flex items-center gap-1 text-[11px] text-primary font-medium animate-pulse">
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            Generating…
                                        </span>
                                    )}
                                    {isDone && (
                                        <span className="text-[11px] text-emerald-600 font-medium">{wordCount.toLocaleString()} words</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={handleCopy} disabled={!output.trim() || isStreaming} className="p-1.5 rounded-lg text-slate-400 hover:text-primary disabled:opacity-30 transition-colors">
                                        <span className="material-icons-round text-[18px]">{copied ? "check" : "content_copy"}</span>
                                    </button>
                                    <button onClick={handleInsert} disabled={!output.trim() || isStreaming} className="p-1.5 rounded-lg text-slate-400 hover:text-primary disabled:opacity-30 transition-colors">
                                        <span className="material-icons-round text-[18px]">note_add</span>
                                    </button>
                                    <button onClick={handleInsertPaper} disabled={!output.trim() || isStreaming} className="p-1.5 rounded-lg text-slate-400 hover:text-primary disabled:opacity-30 transition-colors">
                                        <span className="material-icons-round text-[18px]">article</span>
                                    </button>
                                    {!isStreaming && (
                                        <button onClick={() => setMobilePreview(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition-colors ml-1">
                                            <span className="material-icons-round text-[20px]">close</span>
                                        </button>
                                    )}
                                    {isStreaming && (
                                        <button onClick={handleStop} className="p-1.5 rounded-lg text-red-400 hover:text-red-600 transition-colors ml-1">
                                            <span className="material-icons-round text-[20px]">stop_circle</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div ref={outputRef} className="flex-1 overflow-y-auto p-5">
                                {isStreaming && !output && <Skeleton />}
                                {output && (
                                    <div className="text-[13px] leading-relaxed text-slate-700">
                                        <div dangerouslySetInnerHTML={{ __html: markdownToHtml(output) }} />
                                        {isStreaming && (
                                            <span className="inline-block w-0.5 h-3.5 bg-primary ml-0.5 animate-pulse align-text-bottom" />
                                        )}
                                    </div>
                                )}
                                {status === "error" && (
                                    <div className="flex items-center gap-2 text-red-500 text-sm mt-4">
                                        <span className="material-icons-round text-[18px]">error_outline</span>
                                        Something went wrong. Try again.
                                    </div>
                                )}
                            </div>

                            {/* Footer actions */}
                            {isDone && (
                                <div className="shrink-0 px-5 pb-6 pt-3 border-t border-slate-100 flex gap-2">
                                    <button onClick={handleReset} className="flex-1 py-2.5 rounded-full border border-slate-200 text-slate-500 text-sm font-semibold hover:bg-slate-50 transition">
                                        Start Over
                                    </button>
                                    <button onClick={() => setMobilePreview(false)} className="flex-1 py-2.5 rounded-full bg-primary text-white text-sm font-semibold transition">
                                        Back to Settings
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
