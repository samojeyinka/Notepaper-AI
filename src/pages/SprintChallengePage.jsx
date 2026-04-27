import { Sidebar } from '../components/user/Sidebar';
import ChallengeInterface from '../components/sprints/ChallengeInterface';

const SprintChallengePage = () => (
    <div className="flex min-h-screen">
        <Sidebar activePage="/lockedin/sprints" />
        <ChallengeInterface />
    </div>
);

export default SprintChallengePage;
