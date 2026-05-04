import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { naomi } from "../../assets/assets";
import { usePlan } from '../../hooks/usePlan';
import { generateService } from '../../api/generateService';
import { quizService } from '../../api/quizService';
import { noteService } from '../../api/noteService';
import { invalidateQuizzesCache } from '../quizzes/Quizzes';
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

const google = createGoogleGenerativeAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const Q_TYPE_MAP = { multiple: 'multiple_choice', input: 'short_answer', both: 'mixed' };

function mdToHtml(md) {
    const lines = md.split('\n');
    const out = [];
    let inUl = false, inOl = false;
    const close = () => { if (inUl) { out.push('</ul>'); inUl = false; } if (inOl) { out.push('</ol>'); inOl = false; } };
    const esc = t => t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>');
    for (const raw of lines) {
        const line = raw.trimEnd();
        if (/^### /.test(line))        { close(); out.push(`<h3>${esc(line.slice(4))}</h3>`); }
        else if (/^## /.test(line))    { close(); out.push(`<h2>${esc(line.slice(3))}</h2>`); }
        else if (/^# /.test(line))     { close(); out.push(`<h1>${esc(line.slice(2))}</h1>`); }
        else if (/^[-*] /.test(line))  { if (!inUl) { close(); out.push('<ul>'); inUl = true; } out.push(`<li>${esc(line.slice(2))}</li>`); }
        else if (/^\d+\. /.test(line)) { if (!inOl) { close(); out.push('<ol>'); inOl = true; } out.push(`<li>${esc(line.replace(/^\d+\. /,''))}</li>`); }
        else if (line.trim() === '')   { close(); out.push('<br>'); }
        else { close(); out.push(`<div>${esc(line)}</div>`); }
    }
    close();
    return out.join('');
}

const DIFFICULTIES = [
    { id: 'easy',   label: 'Easy',   active: 'bg-emerald-500 text-white' },
    { id: 'medium', label: 'Medium', active: 'bg-amber-500 text-white'   },
    { id: 'hard',   label: 'Hard',   active: 'bg-rose-500 text-white'    },
];

const Q_TYPES = [
    { id: 'multiple', label: 'Multiple Choice', icon: 'check_box'     },
    { id: 'input',    label: 'Short Answer',    icon: 'edit_note'      },
    { id: 'both',     label: 'Mixed',           icon: 'shuffle'        },
];

export const NoteAISidebar = ({ noteId, noteTitle = 'Untitled Note' }) => {
    const navigate = useNavigate();
    const { isPaid, canUseAI, increment, planLimit, loaded } = usePlan();
    const [scholaOpen, setScholaOpen] = useState(true);
    const [activeFeature, setActiveFeature] = useState(null);

    // ── Quiz state ──────────────────────────────────────────────────────────────
    const [quizCount,      setQuizCount]      = useState(10);
    const [quizDifficulty, setQuizDifficulty] = useState('medium');
    const [quizType,       setQuizType]       = useState('multiple');
    const [quizStatus,     setQuizStatus]     = useState('idle'); // idle|generating|ready|saving|error
    const [quizGenerated,  setQuizGenerated]  = useState(null);
    const [quizError,      setQuizError]      = useState(null);

    // ── Expand state ────────────────────────────────────────────────────────────
    const [expandStatus, setExpandStatus] = useState('idle'); // idle|generating|done|error
    const [expandError,  setExpandError]  = useState(null);

    // ── Study plan state ────────────────────────────────────────────────────────
    const [planName, setPlanName] = useState('');
    const [planDate, setPlanDate] = useState('');

    const maxQuestions   = planLimit('max_quiz_count') ?? 20;
    const QUIZ_COUNTS    = [5, 10, 15, 20].filter(n => n <= maxQuestions);
    const noQuizUses     = loaded && !canUseAI('ai_quiz');
    const noAIUses       = loaded && !canUseAI('ai_use');

    const toggleFeature = (id) => {
        if (!isPaid) return;
        setActiveFeature(prev => prev === id ? null : id);
    };

    // ── Generate Quiz ───────────────────────────────────────────────────────────
    const handleGenerateQuiz = async () => {
        if (!noteId || noQuizUses) return;
        setQuizError(null);
        setQuizGenerated(null);
        setQuizStatus('generating');
        try {
            const res = await generateService.quiz({
                materialIds:   [{ type: 'note', id: noteId }],
                count:         quizCount,
                difficulty:    quizDifficulty,
                question_type: Q_TYPE_MAP[quizType],
            });
            const questions = res?.data?.questions ?? res?.questions ?? [];
            setQuizGenerated(questions);
            setQuizStatus('ready');
            increment('ai_quiz');
        } catch (err) {
            setQuizError(Object.values(err?.errors ?? {})?.[0]?.[0] ?? err?.message ?? 'Generation failed.');
            setQuizStatus('error');
        }
    };

    const handleSaveQuiz = async () => {
        if (!quizGenerated?.length) return;
        setQuizStatus('saving');
        const normalised = quizGenerated.map(q => ({
            type:        q.type ?? (Array.isArray(q.options) && q.options.length > 0 ? 'multiple' : 'input'),
            question:    q.question,
            options:     q.options ?? [],
            correct:     q.correct ?? q.correct_index ?? 0,
            explanation: q.explanation ?? '',
        }));
        try {
            const res = await quizService.create({
                title:          `${noteTitle} Quiz`,
                subject:        'auto',
                difficulty:     quizDifficulty,
                question_type:  quizType,
                question_count: normalised.length,
                questions:      normalised,
            });
            invalidateQuizzesCache();
            const id = res?.data?.id ?? res?.id;
            navigate(`/lockedin/quizzes/${id}/play`);
        } catch {
            setQuizStatus('ready');
        }
    };

    // ── Expand Topic ────────────────────────────────────────────────────────────
    const handleExpandTopic = async () => {
        if (!noteId || noAIUses) return;
        setExpandError(null);
        setExpandStatus('generating');
        try {
            const contentRes = await generateService.notes({
                materialIds: [{ type: 'note', id: noteId }],
                length: 'detailed',
            });
            const rawContent = contentRes?.data?.content ?? contentRes?.content ?? '';

            let newTitle = `Expanded: ${noteTitle}`;
            try {
                const titleRes = await generateText({
                    model: google('gemini-2.5-flash-lite'),
                    prompt: `Write a short, specific academic title (max 8 words) for an in-depth companion note that expands on "${noteTitle}". Return only the title, nothing else.`,
                    maxTokens: 30,
                });
                const t = titleRes.text.trim().replace(/^["']|["']$/g, '');
                if (t) newTitle = t;
            } catch { /* keep fallback title */ }

            const res = await noteService.create({
                title:   newTitle,
                content: JSON.stringify({
                    pages:       [mdToHtml(rawContent)],
                    fontSize:    18,
                    lineSpacing: 32,
                    drawingData: [''],
                }),
            });
            increment('ai_use');
            const newId = res?.data?.id ?? res?.id;
            setExpandStatus('done');
            navigate(`/lockedin/notes/${newId}`);
        } catch (err) {
            setExpandError(err?.message ?? 'Failed to expand topic. Please try again.');
            setExpandStatus('error');
        }
    };

    // ── Study Plan ──────────────────────────────────────────────────────────────
    const handleCreatePlan = () => {
        navigate('/lockedin/study-plan', {
            state: {
                startCreate:  true,
                planName:     planName || noteTitle,
                examDate:     planDate,
                sourceId:     noteId,
                sourceType:   'note',
                sourceTitle:  noteTitle,
            },
        });
    };

    // ── Feature card wrapper ────────────────────────────────────────────────────
    const FeatureCard = ({ id, icon, title, desc, color }) => {
        const isActive = activeFeature === id;
        const clickable = isPaid;
        return (
            <div
                onClick={() => toggleFeature(id)}
                className={`relative group p-2 md:p-3 rounded-md md:rounded-xl border transition-all overflow-hidden ${
                    isActive
                        ? 'border-primary/30 bg-primary/5'
                        : clickable
                        ? 'bg-white border-slate-100 hover:border-primary/20 hover:bg-slate-50 cursor-pointer'
                        : 'bg-white border-slate-100 opacity-80 cursor-not-allowed select-none'
                }`}
            >
                {!clickable && (
                    <div className="absolute inset-0 rounded md:rounded-xl bg-white/60 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <div className="flex items-center gap-1.5 bg-slate-900/80 text-white text-[10px] font-medium px-2 py-1 rounded-full">
                            <span className="material-icons-round text-[11px]">lock</span>
                            Upgrade to unlock
                        </div>
                    </div>
                )}
                <div className="flex items-start gap-2 md:gap-3">
                    <div className={`w-5 h-5 md:w-6 md:h-6 rounded-md ${color} flex items-center justify-center shrink-0`}>
                        <span className="material-icons-round text-[12px] md:text-[14px]">{icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                            <p className="md:font-medium text-[10.5px] md:text-xs text-slate-800">{title}</p>
                            {!isPaid && <span className="material-icons-round text-[12px] text-amber-400">workspace_premium</span>}
                            {clickable && (
                                <span className={`ml-auto material-icons-round text-[14px] text-slate-400 transition-transform duration-200 ${isActive ? 'rotate-180' : ''}`}>
                                    expand_more
                                </span>
                            )}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <aside className="w-64 md:w-80 border-l border-slate-200 bg-white flex flex-col overflow-hidden relative z-30 shrink-0">
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 flex flex-col gap-3">

                {/* ── Schola section ── */}
                <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-indigo-500/5 overflow-hidden">

                    <button
                        onClick={() => setScholaOpen(v => !v)}
                        className="w-full flex items-center justify-between px-4 py-1.5 hover:bg-primary/5 transition-colors"
                    >
                        <div className="flex items-center gap-2.5">
                            <div className="w-4 h-4 md:w-6 md:h-6 rounded md:rounded-lg bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center shadow-sm shadow-primary/30 shrink-0 overflow-hidden">
                                <img src={naomi} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div className="text-left">
                                <p className="font-display font-medium md:font-semibold text-[11px] md:text-[13px] text-slate-900 leading-tight">Schola</p>
                                <p className="text-[8px] md:text-[9px] text-slate-400">Study smarter. Stay motivated.</p>
                            </div>
                        </div>
                        <span className={`material-icons-round text-[18px] text-slate-400 transition-transform duration-200 ${scholaOpen ? 'rotate-180' : ''}`}>
                            expand_more
                        </span>
                    </button>

                    {scholaOpen && (
                        <div className="px-2 md:px-3 pb-2 md:pb-3 flex flex-col gap-2 border-t border-primary/10">
                            <p className="text-[8px] md:text-[9px] font-normal text-primary/60 uppercase tracking-widest px-1 pt-2.5">Powered by Schola</p>

                            {/* ── Generate Quiz ── */}
                            <FeatureCard
                                id="quiz" icon="quiz" title="Generate Quiz"
                                desc="Turn this note into a personalised practice test."
                                color="bg-primary/15 text-primary"
                            />

                            {activeFeature === 'quiz' && isPaid && (
                                <div className="bg-white border border-slate-100 rounded-xl p-3 flex flex-col gap-3">

                                    {/* Count */}
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Questions</p>
                                        <div className="flex flex-wrap gap-1">
                                            {QUIZ_COUNTS.map(n => (
                                                <button key={n} onClick={() => setQuizCount(n)}
                                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-all ${quizCount === n ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                                                    {n}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Difficulty */}
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Difficulty</p>
                                        <div className="flex gap-1">
                                            {DIFFICULTIES.map(d => (
                                                <button key={d.id} onClick={() => setQuizDifficulty(d.id)}
                                                    className={`flex-1 py-1 rounded-lg text-[10px] font-semibold transition-all ${quizDifficulty === d.id ? d.active : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                                                    {d.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Type */}
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Question Type</p>
                                        <div className="flex flex-col gap-1">
                                            {Q_TYPES.map(t => (
                                                <button key={t.id} onClick={() => setQuizType(t.id)}
                                                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-semibold transition-all text-left ${quizType === t.id ? 'bg-primary/10 text-primary' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                                                    <span className={`material-icons-round text-[12px] ${quizType === t.id ? 'text-primary' : 'text-slate-400'}`}>{t.icon}</span>
                                                    {t.label}
                                                    {quizType === t.id && <span className="ml-auto material-icons-round text-[11px] text-primary">check</span>}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {noQuizUses && (
                                        <p className="text-[10px] text-amber-700 bg-amber-50 rounded-lg px-2 py-1.5 flex items-center gap-1">
                                            <span className="material-icons-round text-[12px]">warning</span>
                                            Quiz limit reached. Upgrade for more.
                                        </p>
                                    )}

                                    {/* Actions */}
                                    {(quizStatus === 'idle' || quizStatus === 'error') && (
                                        <button onClick={handleGenerateQuiz}
                                            disabled={!noteId || noQuizUses}
                                            className="w-full py-2 bg-primary text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                                            <span className="material-icons-round text-[13px]">quiz</span>
                                            Generate Quiz
                                        </button>
                                    )}

                                    {quizStatus === 'generating' && (
                                        <div className="flex items-center justify-center gap-2 py-2.5 bg-primary/5 rounded-lg">
                                            <span className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                            <span className="text-[11px] text-primary font-semibold">Generating {quizCount} questions…</span>
                                        </div>
                                    )}

                                    {quizStatus === 'ready' && quizGenerated && (
                                        <div className="flex flex-col gap-2">
                                            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex flex-col items-center gap-2 text-center">
                                                <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center">
                                                    <span className="material-icons-round text-emerald-600 text-[18px]">check_circle</span>
                                                </div>
                                                <p className="text-[12px] font-bold text-slate-800">{quizGenerated.length} Questions Ready</p>
                                                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${quizDifficulty === 'easy' ? 'bg-emerald-100 text-emerald-700' : quizDifficulty === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                                                        {quizDifficulty}
                                                    </span>
                                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase bg-primary/10 text-primary">
                                                        {quizGenerated.length} Qs
                                                    </span>
                                                </div>
                                            </div>
                                            <button onClick={handleSaveQuiz}
                                                className="w-full py-2 bg-primary text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 hover:bg-primary/90 active:scale-95 transition-all">
                                                <span className="material-icons-round text-[13px]">save</span>
                                                Save & Play
                                            </button>
                                            <button onClick={() => { setQuizStatus('idle'); setQuizGenerated(null); }}
                                                className="w-full py-1.5 border border-slate-200 text-slate-500 rounded-lg text-[10px] font-semibold hover:bg-slate-50 transition-all">
                                                Regenerate
                                            </button>
                                        </div>
                                    )}

                                    {quizStatus === 'saving' && (
                                        <div className="flex items-center justify-center gap-2 py-2.5 bg-primary/5 rounded-lg">
                                            <span className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                            <span className="text-[11px] text-primary font-semibold">Saving quiz…</span>
                                        </div>
                                    )}

                                    {quizStatus === 'error' && quizError && (
                                        <p className="text-[10px] text-red-500 flex items-center gap-1 mt-0.5">
                                            <span className="material-icons-round text-[12px]">error_outline</span>
                                            {quizError}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* ── Expand Topic ── */}
                            <FeatureCard
                                id="expand" icon="lightbulb" title="Expand Topic"
                                desc="Schola writes a deep companion note on this topic."
                                color="bg-amber-100 text-amber-500"
                            />

                            {activeFeature === 'expand' && isPaid && (
                                <div className="bg-white border border-slate-100 rounded-xl p-3 flex flex-col gap-2.5">
                                    <p className="text-[10px] text-slate-500 leading-relaxed">
                                        Schola reads this note and creates a detailed separate note with deeper research, examples, and explanations. Title is AI-determined.
                                    </p>

                                    {noAIUses && (
                                        <p className="text-[10px] text-amber-700 bg-amber-50 rounded-lg px-2 py-1.5 flex items-center gap-1">
                                            <span className="material-icons-round text-[12px]">warning</span>
                                            AI limit reached. Upgrade for more.
                                        </p>
                                    )}

                                    {(expandStatus === 'idle' || expandStatus === 'error') && (
                                        <button onClick={handleExpandTopic}
                                            disabled={!noteId || noAIUses}
                                            className="w-full py-2 bg-amber-500 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 hover:bg-amber-600 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                                            <span className="material-icons-round text-[13px]">lightbulb</span>
                                            Expand This Topic
                                        </button>
                                    )}

                                    {expandStatus === 'generating' && (
                                        <div className="flex flex-col items-center gap-2 py-3 bg-amber-50 rounded-xl">
                                            <div className="flex items-center gap-2">
                                                <span className="w-3.5 h-3.5 border-2 border-amber-300 border-t-amber-500 rounded-full animate-spin" />
                                                <span className="text-[11px] text-amber-700 font-semibold">Writing expanded note…</span>
                                            </div>
                                            <p className="text-[9px] text-amber-400">This may take a moment</p>
                                        </div>
                                    )}

                                    {expandStatus === 'done' && (
                                        <div className="bg-emerald-50 rounded-xl p-2.5 flex items-center gap-2">
                                            <span className="material-icons-round text-emerald-600 text-[16px]">check_circle</span>
                                            <p className="text-[11px] font-semibold text-emerald-700">Note created! Opening…</p>
                                        </div>
                                    )}

                                    {expandStatus === 'error' && expandError && (
                                        <p className="text-[10px] text-red-500 flex items-center gap-1">
                                            <span className="material-icons-round text-[12px]">error_outline</span>
                                            {expandError}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* ── Study Plan ── */}
                            <FeatureCard
                                id="plan" icon="event_note" title="Create Study Plan"
                                desc="Build a day-by-day schedule for your upcoming exam."
                                color="bg-emerald-100 text-emerald-600"
                            />

                            {activeFeature === 'plan' && isPaid && (
                                <div className="bg-white border border-slate-100 rounded-xl p-3 flex flex-col gap-2.5">
                                    <div>
                                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Exam / Plan Title</label>
                                        <input
                                            type="text"
                                            value={planName}
                                            onChange={e => setPlanName(e.target.value)}
                                            placeholder={noteTitle}
                                            className="w-full bg-slate-50 rounded-lg px-2.5 py-2 text-[11px] text-slate-700 placeholder-slate-300 outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-slate-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Exam Date</label>
                                        <input
                                            type="date"
                                            value={planDate}
                                            onChange={e => setPlanDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full bg-slate-50 rounded-lg px-2.5 py-2 text-[11px] text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-slate-100"
                                        />
                                    </div>
                                    <button
                                        onClick={handleCreatePlan}
                                        disabled={!planDate}
                                        className="w-full py-2 bg-emerald-500 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-600 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                                        <span className="material-icons-round text-[13px]">event_note</span>
                                        Set Up Study Plan
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Footer (free plan only) ── */}
            {!isPaid && (
                <div className="px-2 md:px-4 pb-2 md:pb-4 pt-2 md:pt-3 border-t border-slate-100">
                    <div className="bg-gradient-to-br from-primary/10 to-indigo-500/10 rounded-lg md:rounded-xl p-4 border border-primary/15">
                        <div className="flex items-center gap-1 md:gap-2 mb-2">
                            <span className="material-icons-round text-primary text-[16px]">bolt</span>
                            <p className="text-[11px] md:text-xs font-medium md:font-bold text-slate-800">Unlock the full Schola</p>
                        </div>
                        <p className="text-[9.5px] md:text-[11px] text-slate-500 mb-3 leading-relaxed">
                            Quizzes, study plans &amp; topic expansion — Schola works in the background so you stay focused.
                        </p>
                        <button
                            onClick={() => navigate('/lockedin/upgrade')}
                            className="w-full bg-slate-900 text-white py-1.5 md:py-2.5 rounded-md md:rounded-xl text-[11px] md:text-[12px] font-bold shadow hover:bg-black active:scale-[0.98] transition-all">
                            Upgrade to Pro
                        </button>
                    </div>
                </div>
            )}
        </aside>
    );
};
