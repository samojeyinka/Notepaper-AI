import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Sidebar } from '../components/user/Sidebar';
import { sprintService } from '../api/sprintService';
import Loader from '../components/globals/Loader';
import SprintGenerating from '../components/sprints/SprintGenerating';
import SprintRoadmap from '../components/sprints/SprintRoadmap';

const SprintDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [sprint,  setSprint]  = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(null);

    useEffect(() => {
        sprintService.show(id)
            .then(res => setSprint(res.data))
            .catch(() => setError('Sprint not found or could not be loaded.'))
            .finally(() => setLoading(false));
    }, [id]);

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex-1 lg:ml-64 flex items-center justify-center min-h-screen" style={{ background: '#F8F9FA' }}>
                    <div className="flex flex-col items-center gap-3">
                        <Loader size="xl" />
                    </div>
                </div>
            );
        }

        if (error || !sprint) {
            return (
                <div className="flex-1 lg:ml-64 flex items-center justify-center min-h-screen" style={{ background: '#F8F9FA' }}>
                    <div className="text-center">
                        <p className="text-slate-500 mb-4">{error ?? 'Sprint not found.'}</p>
                        <button onClick={() => navigate('/lockedin/sprints')} className="text-primary font-semibold text-sm hover:underline">Back to Sprints</button>
                    </div>
                </div>
            );
        }

        if (sprint.status === 'generating') {
            return <SprintGenerating sprint={sprint} onReady={() => {
                sprintService.show(id).then(res => setSprint(res.data)).catch(() => {});
            }} />;
        }

        return <SprintRoadmap sprint={sprint} />;
    };

    return (
        <div className="flex min-h-screen">
            <Sidebar activePage="/lockedin/sprints" />
            {renderContent()}
        </div>
    );
};

export default SprintDetailPage;
