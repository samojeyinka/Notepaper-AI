import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { naomi } from "../../assets/assets";
import { usePlan } from '../../hooks/usePlan';
import { generateService } from '../../api/generateService';
import { quizService } from '../../api/quizService';
import { invalidateQuizzesCache } from '../quizzes/Quizzes';

const Q_TYPE_MAP = { multiple: 'multiple_choice', input: 'short_answer', both: 'mixed' };

const DIFFICULTIES = [
    { id: 'easy',   label: 'Easy'   },
    { id: 'medium', label: 'Medium' },
    { id: 'hard',   label: 'Hard'   },
];

const Q_TYPES = [
    { id: 'multiple', label: 'Multiple Choice', icon: 'check_box'  },
    { id: 'input',    label: 'Short Answer',    icon: 'edit_note'   },
    { id: 'both',     label: 'Mixed',           icon: 'shuffle'     },
];

const CONFIG = {
    note: {
        defaultTitle:        'Untitled Note',
        quizDesc:            'Turn this note into a personalised practice test.',
        expandIcon:          'unfold_more',
        expandDesc:          'Schola writes a deep companion note on this topic.',
        expandDetailDesc:    'Schola reads this note and creates a detailed separate note with deeper research, examples, and explanations.',
        expandBtnClass:      'bg-gray-900 hover:bg-gray-600',
        expandSpinnerText:   'Writing expanded note…',
        simplifyDesc:        'Schola writes a concise, simplified note on this topic.',
        simplifyDetailDesc:  'Schola reads this note and creates a simplified version, reducing it by 60% while keeping the key points.',
        simplifySpinnerText: 'Writing simplified note…',
        quizCountOptions:    [5, 10, 15, 20, 50, 100, 150],
        maxQDefault:         150,
    },
    paper: {
        defaultTitle:        'Untitled Paper',
        quizDesc:            'Turn this paper into a personalised practice test.',
        expandIcon:          'lightbulb',
        expandDesc:          'Schola writes a deep companion paper on this topic.',
        expandDetailDesc:    'Schola reads this paper and creates a detailed separate paper with deeper research, examples, and explanations. Title is AI-determined.',
        expandBtnClass:      'bg-amber-500 hover:bg-amber-600',
        expandSpinnerText:   'Writing expanded paper…',
        simplifyDesc:        'Schola rewrites this paper in simpler, easier-to-understand language.',
        simplifyDetailDesc:  'Schola reads this paper and creates a new, simplified version with clearer language, shorter sentences, and easier explanations.',
        simplifySpinnerText: 'Simplifying paper…',
        quizCountOptions:    [5, 10, 15, 20],
        maxQDefault:         20,
    },
};

export const AISidebar = ({ sourceType, sourceId, sourceTitle }) => {
    const cfg = CONFIG[sourceType];
    const title = sourceTitle || cfg.defaultTitle;

    const navigate = useNavigate();
    const { isPaid, canUseAI, increment, planLimit, loaded } = usePlan();
    const [scholaOpen, setScholaOpen] = useState(true);
    const [activeFeature, setActiveFeature] = useState(null);

    // ── Quiz state ──────────────────────────────────────────────────────────────
    const [quizCount,      setQuizCount]      = useState(10);
    const [quizDifficulty, setQuizDifficulty] = useState('medium');
    const [quizType,       setQuizType]       = useState('multiple');
    const [quizStatus,     setQuizStatus]     = useState('idle');
    const [quizGenerated,  setQuizGenerated]  = useState(null);
    const [quizError,      setQuizError]      = useState(null);

    // ── Expand state ────────────────────────────────────────────────────────────
    const [expandStatus, setExpandStatus] = useState('idle');
    const [expandError,  setExpandError]  = useState(null);

    // ── Simplify state ──────────────────────────────────────────────────────────
    const [simplifyStatus, setSimplifyStatus] = useState('idle');
    const [simplifyError,  setSimplifyError]  = useState(null);

    // ── Study plan state ────────────────────────────────────────────────────────
    const [planName, setPlanName] = useState('');
    const [planDate, setPlanDate] = useState('');

    const maxQuestions = planLimit('max_quiz_count') ?? cfg.maxQDefault;
    const QUIZ_COUNTS  = cfg.quizCountOptions.filter(n => n <= maxQuestions);
    const noQuizUses   = loaded && !canUseAI('ai_quiz');
    const noAIUses     = loaded && !canUseAI('ai_use');

    const toggleFeature = (id) => {
        if (!isPaid) return;
        setActiveFeature(prev => prev === id ? null : id);
    };

    // ── Generate Quiz ───────────────────────────────────────────────────────────
    const handleGenerateQuiz = async () => {
        if (!sourceId || noQuizUses) return;
        setQuizError(null);
        setQuizGenerated(null);
        setQuizStatus('generating');
        try {
            const res = await generateService.quiz({
                materialIds:   [{ type: sourceType, id: sourceId }],
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
                title:          `${title} Quiz`,
                subject:        'auto',
                difficulty:     quizDifficulty,
                question_type:  quizType,
                question_count: normalised.length,
                questions:      normalised,
            });
            invalidateQuizzesCache();
            const id = res?.data?.id ?? res?.id;
            window.open(`/lockedin/quizzes/${id}/play`, '_blank');
        } catch {
            setQuizStatus('ready');
        }
    };

    // ── Expand Topic ────────────────────────────────────────────────────────────
    const handleExpandTopic = async () => {
        if (!sourceId || noAIUses) return;
        setExpandError(null);
        setExpandStatus('generating');
        try {
            const res = await generateService.expand({ source_type: sourceType, source_id: sourceId });
            const newId = res?.data?.id ?? res?.id;
            window.open(`/lockedin/ai-generating/${sourceType}/${newId}?action=expand`, '_blank');
            setExpandStatus('opened');
            setTimeout(() => setExpandStatus('idle'), 4000);
        } catch (err) {
            setExpandError(err?.message ?? 'Failed to expand topic. Please try again.');
            setExpandStatus('error');
        }
    };

    // ── Simplify Topic ──────────────────────────────────────────────────────────
    const handleSimplifyTopic = async () => {
        if (!sourceId || noAIUses) return;
        setSimplifyError(null);
        setSimplifyStatus('generating');
        try {
            const res = await generateService.simplify({ source_type: sourceType, source_id: sourceId });
            const newId = res?.data?.id ?? res?.id;
            window.open(`/lockedin/ai-generating/${sourceType}/${newId}?action=simplify`, '_blank');
            setSimplifyStatus('opened');
            setTimeout(() => setSimplifyStatus('idle'), 4000);
        } catch (err) {
            setSimplifyError(err?.message ?? 'Failed to simplify topic. Please try again.');
            setSimplifyStatus('error');
        }
    };

    // ── Study Plan ──────────────────────────────────────────────────────────────
    const handleCreatePlan = () => {
        navigate('/lockedin/study-plan', {
            state: {
                startCreate:  true,
                planName:     planName || title,
                examDate:     planDate,
                sourceId,
                sourceType,
                sourceTitle:  title,
            },
        });
    };

    // ── Feature card wrapper ────────────────────────────────────────────────────
    const FeatureCard = ({ id, icon, title: cardTitle, desc, color }) => {
        const isActive  = activeFeature === id;
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
                            <p className="md:font-medium text-[10.5px] md:text-xs text-slate-800">{cardTitle}</p>
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
                                desc={cfg.quizDesc}
                                color="bg-primary/15 text-primary"
                            />

                            {activeFeature === 'quiz' && isPaid && (
                                <div className="bg-white border border-slate-100 rounded-xl p-3 flex flex-col gap-3">

                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Questions</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {QUIZ_COUNTS.map(n => (
                                                <button key={n} onClick={() => setQuizCount(n)}
                                                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all ${quizCount === n ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                                                    {n}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Difficulty</p>
                                        <div className="flex rounded-lg overflow-hidden border border-slate-200">
                                            {DIFFICULTIES.map(d => (
                                                <button key={d.id} onClick={() => setQuizDifficulty(d.id)}
                                                    className={`flex-1 py-1 text-[10px] font-semibold transition-all border-r last:border-r-0 border-slate-200 ${quizDifficulty === d.id ? 'bg-primary text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                                                    {d.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

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

                                    {(quizStatus === 'idle' || quizStatus === 'error') && (
                                        <button onClick={handleGenerateQuiz}
                                            disabled={!sourceId || noQuizUses}
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
                                id="expand" icon={cfg.expandIcon} title="Expand Topic"
                                desc={cfg.expandDesc}
                                color="bg-amber-100 text-amber-500"
                            />

                            {activeFeature === 'expand' && isPaid && (
                                <div className="bg-white border border-slate-100 rounded-xl p-3 flex flex-col gap-2.5">
                                    <p className="text-[10px] text-slate-500 leading-relaxed">{cfg.expandDetailDesc}</p>

                                    {noAIUses && (
                                        <p className="text-[10px] text-amber-700 bg-amber-50 rounded-lg px-2 py-1.5 flex items-center gap-1">
                                            <span className="material-icons-round text-[12px]">warning</span>
                                            AI limit reached. Upgrade for more.
                                        </p>
                                    )}

                                    {(expandStatus === 'idle' || expandStatus === 'error') && (
                                        <button onClick={handleExpandTopic}
                                            disabled={!sourceId || noAIUses}
                                            className={`w-full py-2 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${cfg.expandBtnClass}`}>
                                            <span className="material-icons-round text-[13px]">{cfg.expandIcon}</span>
                                            Expand This Topic
                                        </button>
                                    )}

                                    {expandStatus === 'generating' && (
                                        <div className="flex flex-col items-center gap-2 py-3 bg-amber-50 rounded-xl">
                                            <div className="flex items-center gap-2">
                                                <span className="w-3.5 h-3.5 border-2 border-amber-300 border-t-amber-500 rounded-full animate-spin" />
                                                <span className="text-[11px] text-amber-700 font-semibold">{cfg.expandSpinnerText}</span>
                                            </div>
                                            <p className="text-[9px] text-amber-400">This may take a moment</p>
                                        </div>
                                    )}

                                    {expandStatus === 'opened' && (
                                        <div className="bg-primary/5 rounded-xl p-2.5 flex items-center gap-2">
                                            <span className="material-icons-round text-primary text-[16px]">open_in_new</span>
                                            <p className="text-[11px] font-semibold text-primary">Generating in new tab…</p>
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

                            {/* ── Simplify Topic ── */}
                            <FeatureCard
                                id="simplify" icon="filter_alt" title="Simplify Topic"
                                desc={cfg.simplifyDesc}
                                color="bg-green-100 text-green-500"
                            />

                            {activeFeature === 'simplify' && isPaid && (
                                <div className="bg-white border border-slate-100 rounded-xl p-3 flex flex-col gap-2.5">
                                    <p className="text-[10px] text-slate-500 leading-relaxed">{cfg.simplifyDetailDesc}</p>

                                    {noAIUses && (
                                        <p className="text-[10px] text-amber-700 bg-amber-50 rounded-lg px-2 py-1.5 flex items-center gap-1">
                                            <span className="material-icons-round text-[12px]">warning</span>
                                            AI limit reached. Upgrade for more.
                                        </p>
                                    )}

                                    {(simplifyStatus === 'idle' || simplifyStatus === 'error') && (
                                        <button onClick={handleSimplifyTopic}
                                            disabled={!sourceId || noAIUses}
                                            className="w-full py-2 bg-green-600 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 hover:bg-green-700 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                                            <span className="material-icons-round text-[13px]">filter_alt</span>
                                            Simplify This Topic
                                        </button>
                                    )}

                                    {simplifyStatus === 'generating' && (
                                        <div className="flex flex-col items-center gap-2 py-3 bg-green-50 rounded-xl">
                                            <div className="flex items-center gap-2">
                                                <span className="w-3.5 h-3.5 border-2 border-green-300 border-t-green-500 rounded-full animate-spin" />
                                                <span className="text-[11px] text-green-700 font-semibold">{cfg.simplifySpinnerText}</span>
                                            </div>
                                            <p className="text-[9px] text-green-400">This may take a moment</p>
                                        </div>
                                    )}

                                    {simplifyStatus === 'opened' && (
                                        <div className="bg-green-50 rounded-xl p-2.5 flex items-center gap-2">
                                            <span className="material-icons-round text-green-600 text-[16px]">open_in_new</span>
                                            <p className="text-[11px] font-semibold text-green-700">Generating in new tab…</p>
                                        </div>
                                    )}

                                    {simplifyStatus === 'error' && simplifyError && (
                                        <p className="text-[10px] text-red-500 flex items-center gap-1">
                                            <span className="material-icons-round text-[12px]">error_outline</span>
                                            {simplifyError}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* ── Study Plan (commented out) ── */}
                            {activeFeature === 'plan' && isPaid && (
                                <div className="bg-white border border-slate-100 rounded-xl p-3 flex flex-col gap-2.5">
                                    <div>
                                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Exam / Plan Title</label>
                                        <input
                                            type="text"
                                            value={planName}
                                            onChange={e => setPlanName(e.target.value)}
                                            placeholder={title}
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
