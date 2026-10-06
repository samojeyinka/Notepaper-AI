import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAIKeys } from '../../hooks/useAIKeys';
import { generateWithUserKey, NO_AI_KEY_MESSAGE } from '../../utils/aiRuntime';
import { quizService } from '../../api/quizService';
import { generateService } from '../../api/generateService';
import { friendlyAIError } from '../../utils/aiErrors';
import GenerateFromContent from './GenerateFromContent';
import { TAB_CONFIG } from './tabConfig';
import { invalidateQuizzesCache } from '../quizzes/Quizzes';

const EMPTY_SELECTED = { Notes: [], Papers: [], Slides: [], Flashcards: [] };

// ── Constants ─────────────────────────────────────────────────────────────────
const ALL_QUESTION_COUNTS = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100, 150, 200, 300, 400, 500, 600, 750, 1000];

const DIFFICULTIES = [
    { id: 'easy',   label: 'Easy',   active: 'bg-stone-900 text-white', rest: 'bg-stone-100 text-stone-600 hover:bg-stone-200' },
    { id: 'medium', label: 'Medium', active: 'bg-stone-900 text-white', rest: 'bg-stone-100 text-stone-600 hover:bg-stone-200' },
    { id: 'hard',   label: 'Hard',   active: 'bg-stone-900 text-white', rest: 'bg-stone-100 text-stone-600 hover:bg-stone-200' },
];

const SUBJECTS = [
    { id: 'auto',      label: 'Auto-detect'},
    { id: 'science',   label: 'Science' },
    { id: 'history',   label: 'History'},
    { id: 'math',      label: 'Math' },
    { id: 'english',   label: 'English'},
    { id: 'geography', label: 'Geography' },
];

const QUESTION_TYPES = [
    { id: 'multiple', label: 'Multiple Choice', icon: 'check_box' },
    { id: 'input',    label: 'Short Answer',    icon: 'edit_note'  },
    { id: 'both',     label: 'Mixed',           icon: 'shuffle'    },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const countWords = (str) => str.trim().split(/\s+/).filter(Boolean).length;

// ── Hidden quiz ready panel ───────────────────────────────────────────────────
const QuizReadyPanel = ({ count, difficulty, subject }) => {
    const diffStyle =
        'bg-stone-100 text-stone-600';

    const subjectLabel = SUBJECTS.find(s => s.id === subject)?.label ?? 'General';

    return (
        <div className="h-full flex flex-col items-center justify-center gap-6 text-center py-10 px-4">
            {/* Lock icon */}
            <div className="relative">
                <div className="relative w-20 h-12 md:w-28 md:h-28 bg-stone-50  flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
                    <span className="material-icons-round text-stone-300 text-5xl">lock</span>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-emerald-100 p-2  shadow-sm">
                    <span className="material-icons-round text-emerald-600 text-[15px]">check</span>
                </div>
            </div>

            {/* Message */}
            <div>
                <h3 className="text-xl md:text-2xl font-medium md:font-semibold text-stone-800 mb-2 tracking-tight">
                    {count} Questions Ready
                </h3>
                <p className="text-[12px] md:text-sm text-stone-400 max-w-xs leading-relaxed">
                    Questions are hidden so you get a genuine test. Save your quiz and start playing to reveal them.
                </p>
            </div>

            {/* Tags */}
            <div className="flex items-center gap-2">
                <span className={`px-3 py-1  text-[10px] font-bold uppercase tracking-wider ${diffStyle}`}>
                    {difficulty}
                </span>
                <span className="px-3 py-1  text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-500">
                    {subjectLabel}
                </span>
                <span className="px-3 py-1  text-[10px] font-bold uppercase tracking-wider bg-plum-50 text-plum-800">
                    {count} questions
                </span>
            </div>

            {/* Faint locked card previews */}
            <div className="w-full max-w-sm space-y-2 opacity-20 pointer-events-none select-none mt-2">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-14 bg-stone-100  flex items-center justify-center gap-2">
                        <span className="material-icons-round text-stone-400 text-[14px]">lock</span>
                        <div className="flex-1 h-2 bg-stone-200  max-w-[60%]" />
                    </div>
                ))}
            </div>
        </div>
    );
};

// ── Main component ────────────────────────────────────────────────────────────
export default function AutoQuizTab() {
    const navigate = useNavigate();
    const { hasKeys, openModal, loaded } = useAIKeys();

    const [topic,         setTopic]         = useState('');
    const [details,       setDetails]       = useState('');
    const [questionCount, setQuestionCount] = useState(10);
    const [qType,         setQType]         = useState('multiple');
    const [difficulty,    setDifficulty]    = useState('medium');
    const [subject,       setSubject]       = useState('auto');

    const [status,       setStatus]       = useState('idle'); // idle | generating | done | saving | error
    const [generated,   setGenerated]   = useState(null);  // raw parsed questions array
    const [error,       setError]       = useState(null);
    const [saveError,   setSaveError]   = useState(null);
    const [mobilePreview, setMobilePreview] = useState(false);

    // Content sources (paid only)
    const [selected,      setSelected]      = useState(EMPTY_SELECTED);
    const [uploadedFiles, setUploadedFiles] = useState([]);

    const totalSelected = Object.values(selected).reduce((a, b) => a + b.length, 0);
    const hasContent    = totalSelected > 0 || uploadedFiles.length > 0;

    const maxDetails        = 200;
    const detailsWords      = countWords(details);
    const detailsOver       = detailsWords > maxDetails;
    const QUESTION_COUNTS   = ALL_QUESTION_COUNTS;

    const isGenerating = status === 'generating';
    const isSaving     = status === 'saving';
    const isDone       = status === 'done';

    // ── Generation ────────────────────────────────────────────────────────────
    const handleGenerate = async () => {
        if ((!topic.trim() && !hasContent) || detailsOver) return;
        setError(null);
        setSaveError(null);
        setGenerated(null);
        setStatus('generating');
        setMobilePreview(true);

        // ── Backend: generate from selected content ───────────────────────────
        if (hasContent) {
            const materialIds = Object.entries(selected).flatMap(([tab, items]) =>
                items.map(item => ({ type: TAB_CONFIG[tab].type, id: item.id }))
            );
            const questionTypeMap = { multiple: 'multiple_choice', input: 'short_answer', both: 'mixed' };
            try {
                const topicWithDetails = [topic.trim(), details.trim()].filter(Boolean).join(' — ') || undefined;
                const res = await generateService.quiz({
                    materialIds,
                    uploads:       uploadedFiles,
                    count:         questionCount,
                    difficulty,
                    question_type: questionTypeMap[qType] ?? 'multiple_choice',
                    topic:         topicWithDetails,
                });
                const result = res?.data?.questions ?? res?.questions ?? [];
                setGenerated(result);
                setStatus('done');
            } catch (err) {
                const msg = Object.values(err?.errors ?? {})?.[0]?.[0] ?? err?.message ?? 'Generation failed. Please try again.';
                setError(msg);
                setStatus('error');
            }
            return;
        }

        // ── Frontend: generate from topic only ────────────────────────────────
        const typeInstruction =
            qType === 'multiple' ? 'All questions must be multiple choice with exactly 4 options.' :
            qType === 'input'    ? 'All questions must be short-answer (no options).' :
                                   'Mix multiple choice and short-answer questions roughly 50/50.';

        const detailsClause = details.trim() ? `\nAdditional context: ${details.trim()}` : '';
        const subjectLabel  = SUBJECTS.find(s => s.id === subject)?.label ?? '';
        const subjectClause = subject !== 'auto' ? ` The subject is ${subjectLabel}.` : '';

        const prompt = `Generate exactly ${questionCount} quiz questions on this topic: "${topic.trim()}"${detailsClause}${subjectClause}
Difficulty: ${difficulty}.
${typeInstruction}

Return ONLY a valid JSON array, no markdown fences, no explanation:
[
  {"type":"multiple","question":"...","options":["A","B","C","D"],"correct":0,"explanation":"..."},
  {"type":"input","question":"...","correct":"exact answer","explanation":"..."}
]

Rules:
- "correct" for multiple choice is the 0-based index of the right option
- "correct" for input is a short exact string answer
- "explanation" is 1–2 sentences explaining the answer
- Vary difficulty within the ${difficulty} range
- Never repeat questions`;

        try {
            if (!hasKeys) {
                openModal();
                setError(NO_AI_KEY_MESSAGE);
                setStatus('error');
                return;
            }

            const { text } = await generateWithUserKey({ prompt });

            let raw = text.trim();
            if (raw.startsWith('```')) raw = raw.replace(/^```[a-z]*\n?/, '').replace(/```$/, '').trim();

            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Invalid response');

            setGenerated(parsed.slice(0, questionCount));
            setStatus('done');
        } catch (err) {
            console.error('[AutoQuizTab]', err);
            setError(err.message?.includes('JSON') ? 'AI returned unexpected format — try again.' : friendlyAIError(err, 'Generation failed. Please try again.'));
            setStatus('error');
        }
    };

    // ── Save to backend ───────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!generated?.length) return;
        setSaveError(null);
        setStatus('saving');

        // Normalise both frontend (correct/type present) and backend-agent
        // (correct_index, no type) shapes to what QuizRequest expects.
        const normalised = generated.map(q => {
            const hasOptions = Array.isArray(q.options) && q.options.length > 0;
            return {
                type:        q.type ?? (hasOptions ? 'multiple' : 'input'),
                question:    q.question,
                options:     q.options ?? [],
                correct:     q.correct ?? q.correct_index ?? 0,
                explanation: q.explanation ?? '',
            };
        });

        try {
            const res = await quizService.create({
                title:          topic.trim() || 'AI Quiz',
                subject,
                difficulty,
                question_type:  qType,
                question_count: normalised.length,
                questions:      normalised,
            });

            invalidateQuizzesCache();
            const id = res?.data?.id ?? res?.id;
            navigate(`/lockedin/quizzes/${id}/play`);
        } catch (err) {
            console.error('[AutoQuizTab save]', err);
            setSaveError('Could not save. Please try again.');
            setStatus('done');
        }
    };

    return (
        <>
        <div className="flex-1 p-4 md:p-6 grid grid-cols-12 gap-4 md:gap-6 items-start w-full">

            {/* ── Left — config ──────────────────────────────────────────── */}
            <section className="col-span-12 md:col-span-4 flex flex-col gap-4">

                <div className="bg-white ring-1 ring-stone-200/70 p-6 flex flex-col gap-5">

                    {/* Header */}
                    <div className="flex items-center gap-3">
                      
                        <div>
                            <h2 className="font-display-serif text-[17px] font-semibold text-stone-900 leading-tight">Quiz studio</h2>
                            <p className="text-[10px] text-stone-400">Questions, made from any topic</p>
                        </div>
                    </div>

                    {/* Topic */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Topic *</label>
                        <input
                            type="text"
                            value={topic}
                            onChange={e => setTopic(e.target.value)}
                            disabled={isGenerating || isSaving}
                            placeholder="e.g. Cell biology, French Revolution…"
                            className="w-full  placeholder:text-[12px] bg-stone-50 border-none text-[12px] px-2 md:px-4 py-1.5 md:py-3 text-sm text-stone-700 placeholder-stone-400 outline-none focus:ring-2 focus:ring-plum-200 transition disabled:opacity-50"
                        />
                    </div>

                    {/* Details */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Additional Context</label>
                            <span className={`text-[10px] font-bold ${detailsOver ? 'text-red-500' : 'text-stone-400'}`}>
                                {detailsWords}/{maxDetails} words
                            </span>
                        </div>
                        <textarea
                            rows={3}
                            value={details}
                            onChange={e => setDetails(e.target.value)}
                            disabled={isGenerating || isSaving}
                            placeholder="Specify scope, key concepts to include, or chapter/unit…"
                            className={`w-full resize-none placeholder:text-[12px]  bg-stone-50 border-none px-2 md:px-4 py-1.5 md:py-3 text-sm text-stone-700 placeholder-stone-400 outline-none focus:ring-2 transition disabled:opacity-50 ${
                                detailsOver ? 'ring-2 ring-red-300 focus:ring-red-400' : 'focus:ring-plum-200'
                            }`}
                        />
                        {detailsOver && (
                            <p className="text-[10px] text-red-500">Keep context under {maxDetails} words.</p>
                        )}
                    </div>

                    {/* Question count */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                            Number of Questions
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {QUESTION_COUNTS.map(n => (
                                <button
                                    key={n}
                                    onClick={() => setQuestionCount(n)}
                                    disabled={isGenerating || isSaving}
                                    className={`p-1  text-[8px] md:text-[10px] md:font-medium transition-all disabled:opacity-50 ${
                                        questionCount === n
                                            ? 'bg-stone-900 text-white'
                                            : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                                    }`}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Question type */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Question Type</label>
                        <div className="flex flex-col gap-1.5">
                            {QUESTION_TYPES.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setQType(t.id)}
                                    disabled={isGenerating || isSaving}
                                    className={`flex items-center gap-2.5 px-3 py-2.5  text-xs font-semibold transition-all disabled:opacity-50 text-left ${
                                        qType === t.id
                                            ? 'bg-plum-50 text-plum-800 ring-1 ring-plum-200'
                                            : 'bg-stone-50 text-stone-500 hover:bg-stone-100'
                                    }`}
                                >
                                    <span className={`material-icons-round text-[15px] ${qType === t.id ? 'text-plum-700' : 'text-stone-400'}`}>
                                        {t.icon}
                                    </span>
                                    {t.label}
                                    {qType === t.id && (
                                        <span className="ml-auto material-icons-round text-[14px] text-plum-700">check</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Difficulty */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Difficulty</label>
                        <div className="flex gap-2">
                            {DIFFICULTIES.map(d => (
                                <button
                                    key={d.id}
                                    onClick={() => setDifficulty(d.id)}
                                    disabled={isGenerating || isSaving}
                                    className={`flex-1 py-1 md:py-2  text-[11px] md:text-xs font-medium transition-all disabled:opacity-50 ${
                                        difficulty === d.id ? d.active : d.rest
                                    }`}
                                >
                                    {d.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Subject */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Subject</label>
                        <div className="grid grid-cols-3 gap-1.5">
                            {SUBJECTS.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => setSubject(s.id)}
                                    disabled={isGenerating || isSaving}
                                    className={`flex flex-col items-center gap-1 py-2 px-1  text-[9px] font-bold transition-all disabled:opacity-50 ${
                                        subject === s.id
                                            ? 'bg-plum-50 text-plum-800 ring-1 ring-plum-200'
                                            : 'bg-stone-50 text-stone-400 hover:bg-stone-100'
                                    }`}
                                >
                                   
                                    <span className="leading-none text-center">{s.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Generate button */}
                    {isGenerating ? (
                        <div className="flex items-center justify-center gap-3 py-4 bg-plum-50/70 ">
                            <span className="w-5 h-5 border-2 border-plum-600/30 border-t-primary  animate-spin" />
                            <span className="text-sm font-semibold text-plum-700">Generating {questionCount} questions…</span>
                        </div>
                    ) : (
                        <button
                            onClick={handleGenerate}
                            disabled={(!topic.trim() && !hasContent) || detailsOver || !loaded || isSaving}
                            className="w-full py-2 md:py-4 bg-stone-900 text-white  font-semibold text-sm flex items-center justify-center gap-2 hover:scale-[0.98] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
                        >
                            {!loaded ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white  animate-spin" />
                            ) : (
                                <>
                                  
                                    {isDone ? 'Regenerate' : hasContent ? 'Generate from Content' : 'Generate'}
                                </>
                            )}
                        </button>
                    )}
                </div>

                <GenerateFromContent
                    description="Generate a quiz directly from your existing Notepaper content."
                    sources={[
                        { icon: 'description', label: 'From a Note' },
                        { icon: 'article',     label: 'From a Paper' },
                        { icon: 'folder_open', label: 'From a Folder' },
                        { icon: 'style',       label: 'From a Flashcard Set' },
                    ]}
                    selected={selected}
                    onSelectedChange={setSelected}
                    uploadedFiles={uploadedFiles}
                    onUploadedFilesChange={setUploadedFiles}
                />
            </section>

            {/* ── Right — preview workspace ──────────────────────────────── */}
            <section className="hidden md:block md:col-span-8">
                <div className="bg-white ring-1 ring-stone-200/70 flex flex-col overflow-hidden relative" style={{ minHeight: '600px' }}>

                    {/* Header */}
                    <div className="px-6 py-4 flex items-center justify-between border-b border-stone-50 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                            </div>
                            <span className="text-xs font-bold text-stone-400 tracking-wide">Question Preview</span>
                            {isDone && generated && (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700  text-[10px] font-bold">
                                    {generated.length} questions ready
                                </span>
                            )}
                        </div>
                        {isDone && (
                            <span className={`px-2 py-0.5  text-[10px] md:font-bold uppercase tracking-wider ${
                                'bg-stone-100 text-stone-600'
                            }`}>
                                {difficulty}
                            </span>
                        )}
                    </div>

                    {/* Content area */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8">

                        {/* Idle empty state */}
                        {status === 'idle' && (
                            <div className="h-full flex flex-col items-center justify-center gap-6 text-center py-10">
                                <div className="relative">
                                    <div className="absolute inset-0 " />
                                    <div className="relative w-28 h-28 bg-stone-50  flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
                                        <span className="material-icons-round text-plum-700 text-5xl">quiz</span>
                                    </div>
                                 
                                </div>
                                <div>
                                    <h3 className="font-display-serif text-[22px] font-semibold text-stone-900 mb-2 tracking-tight">Turn a topic into questions</h3>
                                    <p className="text-sm text-stone-400 max-w-sm leading-relaxed">
                                        Enter a topic on the left, choose your settings, and hit{' '}
                                        <strong className="text-stone-600">Generate Quiz</strong> to build your quiz instantly.
                                    </p>
                                </div>
                                <div className="w-full max-w-sm space-y-2 opacity-20 pointer-events-none select-none mt-2">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="h-20 bg-stone-100  border-2 border-dashed border-stone-200" />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Generating skeleton */}
                        {isGenerating && (
                            <div className="space-y-3 animate-pulse">
                                {[...Array(Math.min(questionCount, 5))].map((_, i) => (
                                    <div key={i} className=" bg-stone-100 p-5" style={{ opacity: 1 - i * 0.12 }}>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="h-2.5 w-8 bg-stone-200 " />
                                            <div className="h-2.5 w-20 bg-stone-200 " />
                                        </div>
                                        <div className="h-4 w-4/5 bg-stone-200  mb-2" />
                                        <div className="h-3 w-3/5 bg-stone-200  mb-4" />
                                        <div className="grid grid-cols-2 gap-2">
                                            {[...Array(4)].map((_, j) => (
                                                <div key={j} className="h-8 bg-stone-200 " />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Error */}
                        {status === 'error' && (
                            <div className="flex items-center gap-2 text-red-500 text-sm mt-4">
                                <span className="material-icons-round text-[18px]">error_outline</span>
                                {error}
                            </div>
                        )}

                        {/* Ready — hidden preview (no questions shown) */}
                        {isDone && generated && (
                            <QuizReadyPanel
                                count={generated.length}
                                difficulty={difficulty}
                                subject={subject}
                            />
                        )}

                        {saveError && (
                            <p className="mt-3 text-xs text-red-500 text-center">{saveError}</p>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="shrink-0 px-6 py-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-3">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                            {isDone && generated
                                ? `${generated.length} questions · ${SUBJECTS.find(s => s.id === subject)?.label ?? 'General'} · ${difficulty}`
                                : 'Status: Idle'
                            }
                        </span>
                        <button
                            onClick={handleSave}
                            disabled={!isDone || !generated || isSaving}
                            className="flex items-center gap-2 px-5 py-2.5  bg-stone-900 text-white text-xs font-bold hover:scale-[0.98] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition "
                        >
                            {isSaving ? (
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white  animate-spin" />
                            ) : (
                                <>
                                    <span className="material-icons-round text-[16px]">save</span>
                                    Save & Play
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </section>
        </div>

        {/* ── Mobile bottom-sheet ── */}
        {mobilePreview && (
            <div className="md:hidden fixed inset-0 z-50 flex flex-col">
                <div className="absolute inset-0 bg-black/40" onClick={() => !isGenerating && !isSaving && setMobilePreview(false)} />
                <div className="relative mt-auto bg-white flex flex-col shadow-[0_-12px_36px_rgba(28,25,23,0.18)] max-h-[85vh]">

                    <div className="px-4 pt-3 pb-3 flex items-center justify-between border-b border-stone-100 shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-1 bg-stone-200  absolute left-1/2 -translate-x-1/2 top-2" />
                            <span className="text-sm font-semibold text-stone-700 mt-1">Quiz Preview</span>
                            {isGenerating && (
                                <span className="flex items-center gap-1 text-[11px] text-plum-700 font-medium animate-pulse">
                                    <span className="w-1.5 h-1.5  bg-primary" />
                                    Generating {questionCount} questions…
                                </span>
                            )}
                            {isDone && generated && (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700  text-[10px] font-bold">{generated.length} questions ready</span>
                            )}
                        </div>
                        {!isGenerating && !isSaving && (
                            <button onClick={() => setMobilePreview(false)} className="p-1.5  text-stone-400 hover:text-stone-600 transition-colors">
                                <span className="material-icons-round text-[20px]">close</span>
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        {isGenerating && (
                            <div className="space-y-2 md:space-y-3 animate-pulse">
                                {[...Array(Math.min(questionCount, 4))].map((_, i) => (
                                    <div key={i} className=" bg-stone-100 p-4" style={{ opacity: 1 - i * 0.15 }}>
                                        <div className="h-3 w-3/4 bg-stone-200  mb-3" />
                                        <div className="grid grid-cols-2 gap-2">
                                            {[...Array(4)].map((_, j) => <div key={j} className="h-7 bg-stone-200 " />)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {status === 'error' && (
                            <div className="flex items-center gap-2 text-red-500 text-sm mt-4">
                                <span className="material-icons-round text-[18px]">error_outline</span>
                                {error}
                            </div>
                        )}
                        {isDone && generated && (
                            <QuizReadyPanel
                                count={generated.length}
                                difficulty={difficulty}
                                subject={subject}
                            />
                        )}
                        {saveError && <p className="mt-3 text-xs text-red-500 text-center">{saveError}</p>}
                    </div>

                    {isDone && generated && (
                        <div className="shrink-0 px-4 pb-6 pt-3 border-t border-stone-100 flex gap-2">
                            <button onClick={() => setMobilePreview(false)} className="flex-1 py-1 md:py-2  border border-stone-200 text-stone-500 text-sm font-semibold">
                                Back
                            </button>
                            <button onClick={handleSave} disabled={isSaving} className="flex-1 py-1 md:py-2  bg-stone-900 text-white text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-40">
                                {isSaving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white  animate-spin" /> : <><span className="material-icons-round text-[14px] md:text-[16px]">save</span>Save & Play</>}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )}
        </>
    );
}
