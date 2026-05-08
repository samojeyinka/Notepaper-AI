import { Sidebar } from '../components/user/Sidebar';
import SprintsList from '../components/sprints/SprintsList';

const SprintPage = () => (
    <div className="flex min-h-screen">
        <Sidebar activePage="/lockedin/sprints" />
        <SprintsList />
    </div>
);

export default SprintPage;
