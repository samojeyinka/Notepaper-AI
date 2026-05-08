import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sprintService } from '../../api/sprintService';
import { workspaceCache } from '../../api/workspaceCache';
import Loader from '../globals/Loader';

const CHALLENGE_META = {
    quiz:        { icon: 'quiz',                 bg: 'bg-violet-100', color: 'text-violet-600' },
    concept:     { icon: 'lightbulb',            bg: 'bg-amber-100',  color: 'text-amber-600'  },
    quickpoints: { icon: 'format_list_bulleted', bg: 'bg-blue-100',   color: 'text-blue-600'   },
    reading:     { icon: 'auto_stories',         bg: 'bg-teal-100',   color: 'text-teal-600'   },
};

const STATUS_BADGE = {
    active: 'bg-emerald-100 text-emerald-700',
    ready:  'bg-blue-100 text-blue-700',
};

const STATUS_LABEL = {
    active: 'In Progress',
    ready:  'Up Next',
};

const ChallengeCard = ({ challenge, onClick }) => {
    const meta = CHALLENGE_META[challenge.type] ?? CHALLENGE_META.quiz;

    return (
        <button
            onClick={onClick}
            className="w-full text-left bg-white p-4 rounded-xl border border-slate-100 hover:border-purple-500/50 transition-colors"
        >
            <div className="flex items-center justify-between mb-3">
                <div className={`w-5 h-5 md:w-7 md:h-7 rounded-2xl ${meta.bg} flex items-center justify-center ${meta.color}`}>
                    <span className="material-icons-round text-[12px] md:text-base">{meta.icon}</span>
                </div>
                <span className={`${STATUS_BADGE[challenge.status] ?? 'bg-slate-100 text-slate-500'} text-[9px] md:text-[10px] font-normal md:font-medium px-1.5 py-0.5 rounded-md md:rounded-lg`}>
                    {STATUS_LABEL[challenge.status] ?? challenge.status}
                </span>
            </div>

            <h4 className="font-medium text-[13px] md:text-[15px] text-slate-900 line-clamp-1">{challenge.title}</h4>
            <p className="text-slate-500 font-light text-[10.5px] md:text-[12px] mt-1 line-clamp-2">{challenge.description}</p>

            <div className="mt-4 flex items-center text-[10.5px] md:text-xs text-slate-400">
                <span className="material-icons-round text-sm mr-1">bolt</span>
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
        <div className="xl:col-span-1 mb-[10rem]">
            <h2 className="text-[15px] md:text-xl font-medium md:font-semibold mb-3 md:mb-6">Upcoming Challenges</h2>

            <div className="space-y-4">

                {loading && (
                    <div className="flex justify-center py-8">
                        <Loader size="lg" />
                    </div>
                )}

                {/* No active sprint */}
                {!loading && !sprint && (
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 text-center">
                        <span className="material-icons-round text-slate-300 text-4xl">bolt</span>
                        <p className="text-slate-400 text-[13px] mt-2">No active sprint</p>
                        <button
                            onClick={() => navigate('/lockedin/sprints/create')}
                            className="mt-3 text-[12px] font-semibold text-primary hover:underline"
                        >
                            Start a Sprint →
                        </button>
                    </div>
                )}

                {/* All done */}
                {!loading && sprint && challenges.length === 0 && (
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 text-center">
                        <span className="material-icons-round text-emerald-400 text-4xl">check_circle</span>
                        <p className="text-slate-600 text-[13px] font-medium mt-2">All caught up!</p>
                        <p className="text-slate-400 text-[11px] mt-1">No pending challenges right now.</p>
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
                {!loading && (
                    <button
                        onClick={() => navigate('/lockedin/sprints')}
                        className="w-full py-1 border-2 border-dashed border-slate-200 rounded-lg md:rounded-xl text-slate-400 hover:text-purple-500 hover:border-purple-500 transition-all flex items-center justify-center space-x-2"
                    >
                    
                        <span className="text-[12px] md:text-[14px]">All Sprints</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default UpcomingQuizzesSection;
