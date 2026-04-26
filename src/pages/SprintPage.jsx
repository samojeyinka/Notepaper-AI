import { Sidebar } from '../components/user/Sidebar';
import Sprint from '../components/sprints/Sprint';

const SprintPage = () => (
    <div className="flex min-h-screen">
        <Sidebar activePage="/lockedin/sprints" />
        <Sprint />
    </div>
);

export default SprintPage;
