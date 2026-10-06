import { useNavigate } from 'react-router-dom';
import Loader from '../globals/Loader';

const STATUS_META = {
    active:     { label: 'Active',     badge: 'bg-emerald-50 text-emerald-700' },
    generating: { label: 'Generating', badge: 'bg-amber-50 text-amber-700'    },
    completed:  { label: 'Completed',  badge: 'bg-slate-100 text-slate-500'   },
    failed:     { label: 'Failed',     badge: 'bg-red-50 text-red-600'        },
};

const fmt = (d) => {
    if (!d) return '';
    const dt = new Date(d);
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const SprintCard = ({ sprint }) => {
    const navigate = useNavigate();
    const total     = sprint.challenges_count ?? 0;
    const completed = sprint.completed_challenges_count ?? 0;
    const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;
    const meta      = STATUS_META[sprint.status] ?? STATUS_META.active;

    return (
        <div
            onClick={() => navigate(`/lockedin/sprints/${sprint.id}`)}
            className="group bg-white rounded-2xl p-5 cursor-pointer border border-transparent hover:border-primary/10 hover:-translate-y-1 transition-all duration-200"
            style={{ boxShadow: '0 10px 30px rgba(44,47,50,0.06)' }}
        >
            <div className="flex items-start justify-between mb-4">
               
                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide ${meta.badge}`}>{meta.label}</span>
            </div>
            <h3 className="text-[15px] font-semibold text-slate-900 leading-snug mb-1 group-hover:text-primary transition-colors">{sprint.title}</h3>
            <p className="text-[11px] text-slate-400 mb-4">
                {fmt(sprint.start_date)} – {fmt(sprint.end_date)} · {total} challenge{total !== 1 ? 's' : ''}
            </p>
            {sprint.status !== 'generating' && (
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Progress</span>
                        <span className="text-[10px] font-semibold text-primary">{completed}/{total}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                </div>
            )}
            {sprint.status === 'generating' && (
                <div className="flex items-center gap-2 text-amber-600">
                    <Loader size="xs" />
                    <span className="text-[11px] font-semibold">AI is building your sprint…</span>
                </div>
            )}
        </div>
    );
};

export default SprintCard;
