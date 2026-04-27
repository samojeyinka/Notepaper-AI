import { Sidebar } from '../components/user/Sidebar';
import SprintCreate from '../components/sprints/SprintCreate';

const SprintCreatePage = () => (
    <div className="flex min-h-screen">
        <Sidebar activePage="/lockedin/sprints" />
        <SprintCreate />
    </div>
);

export default SprintCreatePage;
