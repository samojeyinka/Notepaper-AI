import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sprintService } from '../../api/sprintService';
import SprintCard from './SprintCard';
import Loader from '../globals/Loader';

const SprintsList = () => {
    const navigate = useNavigate();
    const [sprints,  setSprints]  = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState(null);

    useEffect(() => {
        sprintService.list()
            .then(res => setSprints(res.data ?? []))
            .catch(() => setError('Failed to load sprints.'))
            .finally(() => setLoading(false));
    }, []);

    const active    = sprints.filter(s => s.status === 'active' || s.status === 'generating');
    const completed = sprints.filter(s => s.status === 'completed');
    const totalDone = sprints.reduce((sum, s) => sum + (s.completed_challenges_count ?? 0), 0);

    return (
        <div className="flex-1 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8 min-w-0 overflow-x-hidden pb-28" style={{ background: '#F8F9FA' }}>

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-[15px] md:text-2xl font-semibold text-slate-900 mb-1">Sprints</h1>
                    <p className="text-[10px] md:text-[11px] text-slate-400 uppercase tracking-widest font-semibold">AI-powered learning challenges</p>
                </div>
                <button
                    onClick={() => navigate('/lockedin/sprints/create')}
                    className="flex items-center gap-2 px-3 md:px-5 py-2 md:py-3 rounded-full bg-primary text-white text-sm font-semibold shadow-md shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
                >
                    <span className="material-icons-round text-[16px]">add_circle</span>
                    <span className="hidden sm:inline">New Sprint</span>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 md:gap-6 mb-8">
                {[
                    { label: 'Active Sprints',  value: active.length,    icon: 'bolt',          bg: 'bg-violet-100',  text: 'text-violet-600'  },
                    { label: 'Completed',        value: completed.length, icon: 'military_tech', bg: 'bg-emerald-100', text: 'text-emerald-600' },
                    { label: 'Challenges Done',  value: totalDone,        icon: 'check_circle',  bg: 'bg-amber-100',   text: 'text-amber-600'   },
                ].map(stat => (
                    <div key={stat.label} className="bg-white rounded-xl md:rounded-2xl p-3 md:p-5 flex flex-col md:flex-row md:items-center gap-2 md:gap-4" style={{ boxShadow: '0 10px 30px rgba(44,47,50,0.06)' }}>
                        <div className={`w-8 h-8 md:w-12 md:h-12 ${stat.bg} rounded-xl flex items-center justify-center shrink-0`}>
                            <span className={`material-icons-round text-[16px] md:text-[22px] ${stat.text}`}>{stat.icon}</span>
                        </div>
                        <div>
                            <p className="text-[8px] md:text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-xl md:text-2xl font-semibold text-slate-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <Loader size="xl" />
                    <p className="text-slate-400 text-sm">Loading sprints…</p>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                    <span className="material-icons-round text-red-400 text-[36px]">error_outline</span>
                    <p className="text-slate-500 text-sm">{error}</p>
                    <button onClick={() => { setError(null); setLoading(true); sprintService.list().then(r => setSprints(r.data ?? [])).catch(() => setError('Failed to load sprints.')).finally(() => setLoading(false)); }}
                        className="text-primary text-sm font-semibold hover:underline">Retry</button>
                </div>
            )}

            {/* Empty state */}
            {!loading && !error && sprints.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-4">
                        <span className="material-icons-round text-primary text-[40px]">bolt</span>
                    </div>
                    <h3 className="text-slate-800 font-semibold text-xl mb-2">No sprints yet</h3>
                    <p className="text-slate-400 text-sm max-w-xs leading-relaxed mb-6">Create your first AI-powered sprint and start a structured learning journey.</p>
                    <button
                        onClick={() => navigate('/lockedin/sprints/create')}
                        className="flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-white text-sm font-semibold shadow-md shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
                    >
                        <span className="material-icons-round text-[16px]">add_circle</span>
                        Create Sprint
                    </button>
                </div>
            )}

            {!loading && !error && active.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-4">Active</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {active.map(s => <SprintCard key={s.id} sprint={s} />)}
                    </div>
                </div>
            )}

            {!loading && !error && completed.length > 0 && (
                <div>
                    <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-4">Completed</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {completed.map(s => <SprintCard key={s.id} sprint={s} />)}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SprintsList;
