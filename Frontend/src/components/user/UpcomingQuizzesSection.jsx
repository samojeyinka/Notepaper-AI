import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sprintService } from '../../api/sprintService';
import { workspaceCache } from '../../api/workspaceCache';
import Loader from '../globals/Loader';

const CHALLENGE_META = {
    quiz:        { icon: 'quiz' },
    concept:     { icon: 'lightbulb' },
    quickpoints: { icon: 'format_list_bulleted' },
    reading:     { icon: 'auto_stories' },
};

const STATUS_BADGE = {
    active: 'bg-emerald-50 text-emerald-700',
    ready:  'bg-plum-50 text-plum-700',
};

const STATUS_LABEL = {
    active: 'In progress',
    ready:  'Up next',
};

const ChallengeCard = ({ challenge, onClick }) => {
    const meta = CHALLENGE_META[challenge.type] ?? CHALLENGE_META.quiz;

    return (
        <button
            onClick={onClick}
            className="w-full text-left bg-white p-4  ring-1 ring-stone-200/70 hover:ring-stone-300 hover:shadow-[0_16px_34px_-22px_rgba(28,25,23,0.25)] hover:-translate-y-0.5 transition-all"
        >
            <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8  bg-stone-100 flex items-center justify-center text-stone-600">
                    <span className="material-icons-round text-[17px]">{meta.icon}</span>
                </div>
                <span className={`${STATUS_BADGE[challenge.status] ?? 'bg-stone-100 text-stone-500'} text-[10px] font-medium px-2 py-0.5 `}>
                    {STATUS_LABEL[challenge.status] ?? challenge.status}
                </span>
            </div>

            <h4 className="font-semibold text-[14px] text-stone-900 line-clamp-1">{challenge.title}</h4>
            <p className="text-stone-500 text-[12.5px] leading-relaxed mt-1 line-clamp-2">{challenge.description}</p>

            <div className="mt-3.5 flex items-center gap-1.5 text-[11px] text-stone-400">
                <span className="material-icons-round text-[14px]">calendar_today</span>
                Day {challenge.challenge_order}
            </div>
        </button>
    );
};

const UpcomingQuizzesSection = () => {
    const navigate = useNavigate();
    const [sprint,     setSprint]     = useState(null);
    const [challenges, setChallenges] = useState([]);
    const [loading,    setLoading]    = useState(true);

    useEffect(() => {
        const cached = workspaceCache.getActiveSprint();
        if (cached) {
            setSprint(cached.sprint);
            setChallenges(cached.challenges);
            setLoading(false);
            return;
        }

        sprintService.list()
            .then(res => {
                const sprints = res.data ?? [];
                const active  = sprints.find(s => s.status === 'active');
                if (!active) { setLoading(false); return; }

                return sprintService.show(active.id).then(detail => {
                    const data = detail.data ?? detail;
                    const upcoming = (data.challenges ?? [])
                        .filter(c => c.status === 'active' || c.status === 'ready')
                        .sort((a, b) => a.challenge_order - b.challenge_order)
                        .slice(0, 3);
                    workspaceCache.setActiveSprint(data, upcoming);
                    setSprint(data);
                    setChallenges(upcoming);
                });
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="xl:col-span-1">
            <div className="mb-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-stone-400 mb-1.5">Practice</p>
                <h2 className="font-display-serif text-[20px] font-semibold tracking-tight text-stone-900">Upcoming challenges</h2>
            </div>

            <div className="space-y-4">
                {loading && (
                    <div className="flex justify-center py-12">
                        <Loader />
                    </div>
                )}

                {/* No active sprint */}
                {!loading && !sprint && (
                    <div className="bg-white p-6  ring-1 ring-stone-200/70 text-center">
                        <div className="w-11 h-11  bg-plum-50 text-plum-700 flex items-center justify-center mx-auto mb-3">
                            <span className="material-icons-round text-[22px]">event_note</span>
                        </div>
                        <p className="text-stone-600 text-[13.5px] font-medium">No active sprint</p>
                        <p className="text-stone-400 text-[12px] mt-1 leading-relaxed">
                            A sprint keeps your study on track, one day at a time.
                        </p>
                        <button
                            onClick={() => navigate('/lockedin/sprints/create')}
                            className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-semibold text-plum-700 hover:text-plum-600 transition-colors"
                        >
                            Start a sprint
                            <span className="material-icons-round text-[15px]">arrow_forward</span>
                        </button>
                    </div>
                )}

                {/* All done */}
                {!loading && sprint && challenges.length === 0 && (
                    <div className="bg-white p-6  ring-1 ring-stone-200/70 text-center">
                        <div className="w-11 h-11  bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                            <span className="material-icons-round text-[22px]">check_circle</span>
                        </div>
                        <p className="text-stone-700 text-[13.5px] font-medium">All caught up</p>
                        <p className="text-stone-400 text-[12px] mt-1">No pending challenges right now.</p>
                    </div>
                )}

                {/* Challenge cards */}
                {!loading && challenges.map(challenge => (
                    <ChallengeCard
                        key={challenge.id}
                        challenge={challenge}
                        onClick={() => navigate(`/lockedin/sprints/${sprint.id}/challenges/${challenge.id}`)}
                    />
                ))}

                {/* Footer CTA */}
                {!loading && sprint && (
                    <button
                        onClick={() => navigate('/lockedin/sprints')}
                        className="w-full flex items-center justify-center gap-1 pt-1 text-[13px] font-semibold text-plum-700 hover:text-plum-600 transition-colors"
                    >
                        View all sprints
                        <span className="material-icons-round text-[15px]">arrow_forward</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default UpcomingQuizzesSection;
