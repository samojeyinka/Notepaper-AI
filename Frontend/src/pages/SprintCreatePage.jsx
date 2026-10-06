import { Sidebar } from '../components/user/Sidebar';
import SprintCreate from '../components/sprints/SprintCreate';

const SprintCreatePage = () => (
    <div className="flex min-h-screen bg-paper font-display text-stone-900 antialiased selection:bg-plum-200">
        <Sidebar activePage="/lockedin/sprints" />
        <SprintCreate />
    </div>
);

export default SprintCreatePage;
