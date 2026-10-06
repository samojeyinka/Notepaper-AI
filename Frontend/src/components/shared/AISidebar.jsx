import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { naomi } from "../../assets/assets";
import { generateService } from '../../api/generateService';
import { quizService } from '../../api/quizService';
import { useAIKeys, openAIKeyModal } from '../../hooks/useAIKeys';
import { NO_AI_KEY_MESSAGE } from '../../utils/aiRuntime';
import { invalidateQuizzesCache } from '../quizzes/Quizzes';
import { APP_BASENAME } from '../../utils/basename';

const Q_TYPE_MAP = { multiple: 'multiple_choice', input: 'short_answer', both: 'mixed' };

const DIFFICULTIES = [
    { id: 'easy',   label: 'Easy'   },
    { id: 'medium', label: 'Medium' },
    { id: 'hard',   label: 'Hard'   },
];

const Q_TYPES = [
    { id: 'multiple', label: 'Multiple Choice', icon: 'check_box'  },
    { id: 'input',    label: 'Short Answer',    icon: 'edit_note'  },
    { id: 'both',     label: 'Mixed',           icon: 'shuffle'    },
];

const CONFIG = {
    note: {
        defaultTitle:        'Untitled Note',
        quizDesc:            'Turn this note into a personalised practice test.',
        expandIcon:          'unfold_more',
        expandDesc:          'Schola writes a deep companion note on this topic.',
        expandDetailDesc:    'Schola reads this note and creates a detailed separate note with deeper research, examples, and explanations.',
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
        expandSpinnerText:   'Writing expanded paper…',
        simplifyDesc:        'Schola rewrites this paper in simpler, easier-to-understand language.',
        simplifyDetailDesc:  'Schola reads this paper and creates a new, simplified version with clearer language, shorter sentences, and easier explanations.',
        simplifySpinnerText: 'Simplifying paper…',
        quizCountOptions:    [5, 10, 15, 20],
        maxQDefault:         20,
    },
};

// Shared feature card — kept at module scope so it isn't recreated on each render.
const FeatureCard = ({ icon, title, desc, isActive, onToggle }) => (
    <div
        onClick={onToggle}
        className={`relative group p-3 border transition-colors overflow-hidden ${
            isActive
                ? 'border-plum-400 bg-plum-50'
                : 'bg-white border-stone-200 hover:border-plum-300 cursor-pointer'
        }`}
    >
        <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-plum-50 text-plum-700 flex items-center justify-center shrink-0">
                <span className="material-icons-round text-[14px]">{icon}</span>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                    <p className="text-xs font-medium text-stone-800">{title}</p>
                    <span className={`ml-auto material-icons-round text-[15px] text-stone-400 transition-transform duration-200 ${isActive ? 'rotate-180' : ''}`}>
                        expand_more
                    </span>
                </div>
                <p className="text-[10px] text-stone-500 mt-0.5 leading-relaxed">{desc}</p>
            </div>
        </div>
    </div>
);

const Spinner = ({ text }) => (
    <div className="flex items-center justify-center gap-2 py-3 bg-plum-50">
        <span className="w-3.5 h-3.5 border-2 border-plum-200 border-t-plum-600 rounded-full animate-spin" />
        {text && <span className="text-[11px] text-plum-700 font-medium">{text}</span>}
    </div>
);

export const AISidebar = ({ sourceType, sourceId, sourceTitle }) => {
    const cfg = CONFIG[sourceType];
    const title = sourceTitle || cfg.defaultTitle;

    const navigate = useNavigate();
    const { hasKeys } = useAIKeys();
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

    const QUIZ_COUNTS = cfg.quizCountOptions;

    const toggleFeature = (id) => {
        setActiveFeature(prev => prev === id ? null : id);
    };

    /**
     * Every Schola action runs on the user's own provider key, so open the
     * key modal instead of firing a request that can only fail with 428.
     */
    const hasUsableKey = (setError, setStatus) => {
        if (hasKeys) return true;

        openAIKeyModal();
        setError(NO_AI_KEY_MESSAGE);
        setStatus('error');

        return false;
    };

    /**
     * Fallback for when the key list is stale (e.g. removed in another tab).
     */
    const handleError = (err, setError, setStatus, message) => {
        if (err?.status === 428) {
            openAIKeyModal();
            setError(NO_AI_KEY_MESSAGE);
        } else {
            setError(message);
        }

        setStatus('error');
    };

    // ── Generate Quiz ───────────────────────────────────────────────────────────
    const handleGenerateQuiz = async () => {
        if (!sourceId) return;
        if (!hasUsableKey(setQuizError, setQuizStatus)) return;

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
        } catch (err) {
            handleError(
                err,
                setQuizError,
                setQuizStatus,
                Object.values(err?.errors ?? {})?.[0]?.[0] ?? err?.message ?? 'Generation failed.'
            );
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
            window.open(`${APP_BASENAME}/lockedin/quizzes/${id}/play`, '_blank');
        } catch {
            setQuizStatus('ready');
        }
    };

    // ── Expand Topic ────────────────────────────────────────────────────────────
    const handleExpandTopic = async () => {
        if (!sourceId) return;
        if (!hasUsableKey(setExpandError, setExpandStatus)) return;

        setExpandError(null);
        setExpandStatus('generating');
        try {
            const res = await generateService.expand({ source_type: sourceType, source_id: sourceId });
            const newId = res?.data?.id ?? res?.id;
            window.open(`${APP_BASENAME}/lockedin/ai-generating/${sourceType}/${newId}?action=expand`, '_blank');
            setExpandStatus('opened');
            setTimeout(() => setExpandStatus('idle'), 4000);
        } catch (err) {
            handleError(err, setExpandError, setExpandStatus, err?.message ?? 'Failed to expand topic. Please try again.');
        }
    };

    // ── Simplify Topic ──────────────────────────────────────────────────────────
    const handleSimplifyTopic = async () => {
        if (!sourceId) return;
        if (!hasUsableKey(setSimplifyError, setSimplifyStatus)) return;

        setSimplifyError(null);
        setSimplifyStatus('generating');
        try {
            const res = await generateService.simplify({ source_type: sourceType, source_id: sourceId });
            const newId = res?.data?.id ?? res?.id;
            window.open(`${APP_BASENAME}/lockedin/ai-generating/${sourceType}/${newId}?action=simplify`, '_blank');
            setSimplifyStatus('opened');
            setTimeout(() => setSimplifyStatus('idle'), 4000);
        } catch (err) {
            handleError(err, setSimplifyError, setSimplifyStatus, err?.message ?? 'Failed to simplify topic. Please try again.');
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

    return (
        <aside className="w-64 md:w-80 border-l border-stone-200 bg-paper flex flex-col overflow-hidden relative z-30 shrink-0">
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 flex flex-col gap-3">

                {/* ── Schola section ── */}
                <div className="border border-stone-200 bg-white overflow-hidden">

                    <button
                        onClick={() => setScholaOpen(v => !v)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-stone-50 transition-colors"
                    >
                        <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 bg-plum-600 flex items-center justify-center shrink-0 overflow-hidden">
                                <img src={naomi} className="w-full h-full object-cover" alt="Schola AI assistant" />
                            </div>
                            <div className="text-left">
                                <p className="font-display font-semibold text-[13px] text-stone-900 leading-tight">Schola</p>
                                <p className="text-[9px] text-stone-400">Study smarter. Stay motivated.</p>
                            </div>
                        </div>
                        <span className={`material-icons-round text-[18px] text-stone-400 transition-transform duration-200 ${scholaOpen ? 'rotate-180' : ''}`}>
                            expand_more
                        </span>
                    </button>

                    {scholaOpen && (
                        <div className="px-3 pb-3 flex flex-col gap-2 border-t border-stone-100 relative">
                            <p className="text-[9px] font-semibold text-stone-400 uppercase tracking-[0.18em] px-1 pt-2.5">Powered by Schola</p>

                            {/* ── Generate Quiz ── */}
                            <FeatureCard
                                icon="quiz" title="Generate Quiz"
                                desc={cfg.quizDesc}
                                isActive={activeFeature === 'quiz'}
                                onToggle={() => toggleFeature('quiz')}
                            />

                            {activeFeature === 'quiz' && (
                                <div className="bg-white border border-stone-200 p-3 flex flex-col gap-3">

                                    <div>
                                        <p className="text-[9px] font-semibold text-stone-400 uppercase tracking-[0.16em] mb-1.5">Questions</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {QUIZ_COUNTS.map(n => (
                                                <button key={n} onClick={() => setQuizCount(n)}
                                                    className={`px-2 py-0.5 text-[10px] font-semibold transition-colors ${quizCount === n ? 'bg-plum-600 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}>
                                                    {n}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-[9px] font-semibold text-stone-400 uppercase tracking-[0.16em] mb-1.5">Difficulty</p>
                                        <div className="flex border border-stone-200">
                                            {DIFFICULTIES.map(d => (
                                                <button key={d.id} onClick={() => setQuizDifficulty(d.id)}
                                                    className={`flex-1 py-1 text-[10px] font-semibold transition-colors border-r last:border-r-0 border-stone-200 ${quizDifficulty === d.id ? 'bg-plum-600 text-white' : 'bg-white text-stone-500 hover:bg-stone-50'}`}>
                                                    {d.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-[9px] font-semibold text-stone-400 uppercase tracking-[0.16em] mb-1.5">Question Type</p>
                                        <div className="flex flex-col gap-1">
                                            {Q_TYPES.map(t => (
                                                <button key={t.id} onClick={() => setQuizType(t.id)}
                                                    className={`flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-semibold transition-colors text-left ${quizType === t.id ? 'bg-plum-50 text-plum-700' : 'bg-stone-50 text-stone-500 hover:bg-stone-100'}`}>
                                                    <span className={`material-icons-round text-[12px] ${quizType === t.id ? 'text-plum-600' : 'text-stone-400'}`}>{t.icon}</span>
                                                    {t.label}
                                                    {quizType === t.id && <span className="ml-auto material-icons-round text-[11px] text-plum-600">check</span>}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {(quizStatus === 'idle' || quizStatus === 'error') && (
                                        <button onClick={handleGenerateQuiz}
                                            disabled={!sourceId}
                                            className="w-full py-2 bg-plum-600 text-white text-[11px] font-medium flex items-center justify-center gap-1.5 hover:bg-plum-700 active:scale-95 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                                            <span className="material-icons-round text-[13px]">quiz</span>
                                            Generate Quiz
                                        </button>
                                    )}

                                    {quizStatus === 'generating' && <Spinner text={`Generating ${quizCount} questions…`} />}

                                    {quizStatus === 'ready' && quizGenerated && (
                                        <div className="flex flex-col gap-2">
                                            <div className="bg-emerald-50 border border-emerald-200 p-3 flex flex-col items-center gap-2 text-center">
                                                <div className="w-9 h-9 bg-emerald-100 flex items-center justify-center">
                                                    <span className="material-icons-round text-emerald-600 text-[18px]">check_circle</span>
                                                </div>
                                                <p className="text-[12px] font-semibold text-stone-800">{quizGenerated.length} Questions Ready</p>
                                                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                                                    <span className={`text-[9px] font-semibold px-2 py-0.5 uppercase ${quizDifficulty === 'easy' ? 'bg-emerald-100 text-emerald-700' : quizDifficulty === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                                                        {quizDifficulty}
                                                    </span>
                                                    <span className="text-[9px] font-semibold px-2 py-0.5 uppercase bg-plum-50 text-plum-700">
                                                        {quizGenerated.length} Qs
                                                    </span>
                                                </div>
                                            </div>
                                            <button onClick={handleSaveQuiz}
                                                className="w-full py-2 bg-plum-600 text-white text-[11px] font-medium flex items-center justify-center gap-1.5 hover:bg-plum-700 active:scale-95 transition-colors">
                                                <span className="material-icons-round text-[13px]">save</span>
                                                Save & Play
                                            </button>
                                            <button onClick={() => { setQuizStatus('idle'); setQuizGenerated(null); }}
                                                className="w-full py-1.5 border border-stone-200 text-stone-500 text-[10px] font-medium hover:bg-stone-50 transition-colors">
                                                Regenerate
                                            </button>
                                        </div>
                                    )}

                                    {quizStatus === 'saving' && <Spinner />}

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
                                icon={cfg.expandIcon} title="Expand Topic"
                                desc={cfg.expandDesc}
                                isActive={activeFeature === 'expand'}
                                onToggle={() => toggleFeature('expand')}
                            />

                            {activeFeature === 'expand' && (
                                <div className="bg-white border border-stone-200 p-3 flex flex-col gap-2.5">
                                    <p className="text-[10px] text-stone-500 leading-relaxed">{cfg.expandDetailDesc}</p>

                                    {(expandStatus === 'idle' || expandStatus === 'error') && (
                                        <button onClick={handleExpandTopic}
                                            disabled={!sourceId}
                                            className="w-full py-2 bg-plum-600 text-white text-[11px] font-medium flex items-center justify-center gap-1.5 hover:bg-plum-700 active:scale-95 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                                            <span className="material-icons-round text-[13px]">{cfg.expandIcon}</span>
                                            Expand This Topic
                                        </button>
                                    )}

                                    {expandStatus === 'generating' && (
                                        <div className="flex flex-col items-center gap-2 py-3 bg-plum-50">
                                            <div className="flex items-center gap-2">
                                                <span className="w-3.5 h-3.5 border-2 border-plum-200 border-t-plum-600 rounded-full animate-spin" />
                                                <span className="text-[11px] text-plum-700 font-medium">{cfg.expandSpinnerText}</span>
                                            </div>
                                            <p className="text-[9px] text-stone-400">This may take a moment</p>
                                        </div>
                                    )}

                                    {expandStatus === 'opened' && (
                                        <div className="bg-plum-50 p-2.5 flex items-center gap-2">
                                            <span className="material-icons-round text-plum-600 text-[16px]">open_in_new</span>
                                            <p className="text-[11px] font-medium text-plum-700">Generating in new tab…</p>
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
                                icon="filter_alt" title="Simplify Topic"
                                desc={cfg.simplifyDesc}
                                isActive={activeFeature === 'simplify'}
                                onToggle={() => toggleFeature('simplify')}
                            />

                            {activeFeature === 'simplify' && (
                                <div className="bg-white border border-stone-200 p-3 flex flex-col gap-2.5">
                                    <p className="text-[10px] text-stone-500 leading-relaxed">{cfg.simplifyDetailDesc}</p>

                                    {(simplifyStatus === 'idle' || simplifyStatus === 'error') && (
                                        <button onClick={handleSimplifyTopic}
                                            disabled={!sourceId}
                                            className="w-full py-2 bg-stone-900 text-white text-[11px] font-medium flex items-center justify-center gap-1.5 hover:bg-stone-800 active:scale-95 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                                            <span className="material-icons-round text-[13px]">filter_alt</span>
                                            Simplify This Topic
                                        </button>
                                    )}

                                    {simplifyStatus === 'generating' && (
                                        <div className="flex flex-col items-center gap-2 py-3 bg-plum-50">
                                            <div className="flex items-center gap-2">
                                                <span className="w-3.5 h-3.5 border-2 border-plum-200 border-t-plum-600 rounded-full animate-spin" />
                                                <span className="text-[11px] text-plum-700 font-medium">{cfg.simplifySpinnerText}</span>
                                            </div>
                                            <p className="text-[9px] text-stone-400">This may take a moment</p>
                                        </div>
                                    )}

                                    {simplifyStatus === 'opened' && (
                                        <div className="bg-plum-50 p-2.5 flex items-center gap-2">
                                            <span className="material-icons-round text-plum-600 text-[16px]">open_in_new</span>
                                            <p className="text-[11px] font-medium text-plum-700">Generating in new tab…</p>
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
                            {activeFeature === 'plan' && (
                                <div className="bg-white border border-stone-200 p-3 flex flex-col gap-2.5">
                                    <div>
                                        <label className="text-[9px] font-semibold text-stone-400 uppercase tracking-[0.16em] block mb-1">Exam / Plan Title</label>
                                        <input
                                            type="text"
                                            value={planName}
                                            onChange={e => setPlanName(e.target.value)}
                                            placeholder={title}
                                            className="w-full bg-stone-50 border border-stone-200 px-2.5 py-2 text-[11px] text-stone-700 placeholder-stone-300 outline-none focus:border-plum-400 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-semibold text-stone-400 uppercase tracking-[0.16em] block mb-1">Exam Date</label>
                                        <input
                                            type="date"
                                            value={planDate}
                                            onChange={e => setPlanDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full bg-stone-50 border border-stone-200 px-2.5 py-2 text-[11px] text-stone-700 outline-none focus:border-plum-400 transition-colors"
                                        />
                                    </div>
                                    <button
                                        onClick={handleCreatePlan}
                                        disabled={!planDate}
                                        className="w-full py-2 bg-plum-600 text-white text-[11px] font-medium flex items-center justify-center gap-1.5 hover:bg-plum-700 active:scale-95 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                                        <span className="material-icons-round text-[13px]">event_note</span>
                                        Set Up Study Plan
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};
