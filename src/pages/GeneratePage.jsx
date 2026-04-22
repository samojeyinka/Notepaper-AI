import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/user/Sidebar";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { shakespeare } from "../assets/assets";

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


const SYSTEM_INSTRUCTION = `You are Schola — an expert study-note generator inside a note-taking app called Notepaper.ai.
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

export default function GeneratePage() {
    const navigate = useNavigate();
    const [panelOpen, setPanelOpen] = useState(true);
    const [prompt, setPrompt]   = useState("");
    const [tone, setTone]       = useState("academic");
    const [length, setLength]   = useState("long");
    const [output, setOutput]   = useState("");
    const [status, setStatus]   = useState("idle"); // idle | streaming | done | error
    const [copied, setCopied]   = useState(false);
    const [wordCount, setWordCount] = useState(0);

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
        } catch (err) {
            if (err.name === "AbortError") {
                setStatus(output ? "done" : "idle");
            } else {
                console.error("[Generate]", err);
                setStatus("error");
            }
        }
    };

    const handleGenerate = () => {
        if (!prompt.trim() || status === "streaming") return;
        if (window.innerWidth < 1024) setPanelOpen(false);
        runGenerate(buildUserMessage());
    };

    const handleStop = () => abortRef.current?.abort();

    const handleReset = () => {
        setOutput("");
        setStatus("idle");
        setPrompt("");
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
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar activePage="/lockedin/generate" />

            <main className="flex-1 flex flex-col overflow-hidden lg:ml-64">

                {/* ── Top bar ──────────────────────────────────────────────── */}
                <div className="shrink-0 bg-white border-b border-slate-100 px-4 py-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center shadow shadow-primary/20 shrink-0 overflow-hidden">
                        <img src={shakespeare} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div>
                        <h1 className="font-bold text-slate-800 text-base leading-tight">AI Generate</h1>
                        <p className="text-xs text-slate-400">Powered by Gemini 2.5 Pro — deep reasoning, rich output</p>
                    </div>

                    {isDone && (
                        <div className="ml-auto flex items-center gap-2 text-xs text-slate-400">
                            <span className="material-icons-round text-[14px] text-emerald-500">check_circle</span>
                            {wordCount.toLocaleString()} words generated
                        </div>
                    )}
                    {isStreaming && (
                        <div className="ml-auto flex items-center gap-1.5 text-xs text-primary animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                            Generating…
                        </div>
                    )}
                </div>

                {/* ── Content ─────────────────────────────────────────────── */}
                <div className="flex-1 flex overflow-hidden">

                    {/* Left panel wrapper — collapses to w-0, inner content fixed at w-80 */}
                    <div className={`shrink-0 overflow-hidden transition-all duration-300 ease-in-out ${panelOpen ? "w-80" : "w-0"}`}>
                        <div className="w-80 h-full border-r border-slate-100 bg-white flex flex-col overflow-y-auto sticky top-0 max-h-screen">
                        <div className="flex flex-col gap-5 p-5">

                            {/* Topic input */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-600">Topic / Prompt</label>
                                <textarea
                                    ref={promptRef}
                                    rows={5}
                                    value={prompt}
                                    onChange={e => setPrompt(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={isStreaming}
                                    placeholder="e.g. Explain the water cycle with diagrams and real-world examples…"
                                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition disabled:opacity-50"
                                />
                                <p className="text-[10px] text-slate-400 text-right">{prompt.length} chars · Ctrl+Enter to generate</p>
                            </div>

                            {/* Tone */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-semibold text-slate-600">Tone</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {TONES.map(t => (
                                        <button
                                            key={t.value}
                                            onClick={() => setTone(t.value)}
                                            disabled={isStreaming}
                                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition
                                                ${tone === t.value
                                                    ? "bg-primary/10 border-primary/30 text-primary"
                                                    : "bg-slate-50 border-slate-200 text-slate-600 hover:border-primary/30"
                                                } disabled:opacity-50`}
                                        >
                                            <span className="material-icons-round text-[15px]">{t.icon}</span>
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Length */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-semibold text-slate-600">Length</label>
                                <div className="flex flex-col gap-1.5">
                                    {LENGTHS.map(l => (
                                        <button
                                            key={l.value}
                                            onClick={() => setLength(l.value)}
                                            disabled={isStreaming}
                                            className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-medium transition
                                                ${length === l.value
                                                    ? "bg-primary/10 border-primary/30 text-primary"
                                                    : "bg-slate-50 border-slate-200 text-slate-600 hover:border-primary/30"
                                                } disabled:opacity-50`}
                                        >
                                            <span>{l.label}</span>
                                            <span className="text-[10px] opacity-60">{l.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Generate / Stop */}
                            <div className="flex flex-col gap-2 mt-auto pt-2">
                                {isStreaming ? (
                                    <button
                                        onClick={handleStop}
                                        className="w-full py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-500 text-sm font-medium flex items-center justify-center gap-2 hover:bg-red-100 transition"
                                    >
                                        <span className="material-icons-round text-[18px]">stop_circle</span>
                                        Stop
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleGenerate}
                                        disabled={!prompt.trim()}
                                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary to-indigo-500 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <span className="material-icons-round text-[18px]">auto_awesome</span>
                                        {isDone ? "Regenerate" : "Generate"}
                                    </button>
                                )}
                                {isDone && (
                                    <button
                                        onClick={handleReset}
                                        className="w-full py-2 rounded-xl border border-slate-200 text-slate-500 text-sm font-medium hover:bg-slate-50 transition"
                                    >
                                        Start Over
                                    </button>
                                )}
                            </div>
                        </div>
                        </div>
                    </div>

                    {/* Toggle tab — sits on the seam, always visible */}
                    <button
                        onClick={() => setPanelOpen(v => !v)}
                        title={panelOpen ? "Hide options" : "Show options"}
                        className="self-start mt-6 shrink-0 w-4 h-10 bg-white border border-l-0 border-slate-200 rounded-r-lg flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <span className="material-icons-round text-[14px] text-slate-400">
                            {panelOpen ? "chevron_left" : "chevron_right"}
                        </span>
                    </button>

                    {/* Right panel — output */}
                    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">

                        {/* Output area */}
                        <div
                            ref={outputRef}
                            className="flex-1 overflow-y-auto p-6 custom-scrollbar"
                        >
                            {isIdle && !output && (
                                <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                                        <span className="material-icons-round text-primary text-3xl">auto_awesome</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-700">Ready to generate</p>
                                        <p className="text-sm text-slate-400 mt-1">Enter a topic on the left and hit <strong>Generate</strong></p>
                                    </div>
                                </div>
                            )}

                            {isStreaming && !output && <Skeleton />}

                            {output && (
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-[11px]">
                                    <div dangerouslySetInnerHTML={{ __html: markdownToHtml(output) }} />
                                    {isStreaming && (
                                        <span className="inline-block w-0.5 h-3.5 bg-primary ml-0.5 animate-pulse align-text-bottom" />
                                    )}
                                </div>
                            )}

                            {status === "error" && (
                                <div className="flex items-center gap-2 text-red-500 text-sm">
                                    <span className="material-icons-round text-[18px]">error_outline</span>
                                    Something went wrong. Check your API key or try again.
                                </div>
                            )}
                        </div>

                        {/* Action bar — only visible when there's output */}
                        {output && (
                            <div className="shrink-0 border-t border-slate-200 bg-white px-6 py-3 flex items-center justify-between gap-3">
                                <p className="text-xs text-slate-400">
                                    {wordCount.toLocaleString()} word{wordCount !== 1 ? "s" : ""}
                                    {isStreaming && " · still writing…"}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCopy}
                                        disabled={isStreaming}
                                        className="flex items-center gap-1.5 px-2 py-1 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 disabled:opacity-40 transition"
                                    >
                                        <span className="material-icons-round text-[16px]">
                                            {copied ? "check" : "content_copy"}
                                        </span>
                                        {copied ? "Copied" : "Copy"}
                                    </button>
                                    <button
                                        onClick={handleInsert}
                                        disabled={isStreaming || !output.trim()}
                                        className="flex items-center gap-1.5 px-2 py-1 rounded bg-primary text-white text-sm font-normal hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition shadow shadow-primary/20"
                                    >
                                        <span className="material-icons-round text-[16px]">arrow_forward</span>
                                        Insert into Note
                                    </button>


                                    <button
                                        onClick={handleInsertPaper}
                                        disabled={isStreaming || !output.trim()}
                                        className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-800 text-white text-sm font-normal hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition shadow shadow-primary/20"
                                    >
                                        <span className="material-icons-round text-[16px]">arrow_forward</span>
                                        Insert into Paper
                                    </button>

                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
