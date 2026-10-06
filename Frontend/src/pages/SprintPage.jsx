import { Sidebar } from '../components/user/Sidebar';
import SprintsList from '../components/sprints/SprintsList';
import SEO from '../components/globals/SEO';

const SprintPage = () => (
    <div className="flex min-h-screen bg-paper font-display text-stone-900 antialiased selection:bg-plum-200">
        <SEO title="Sprints" description="Challenge yourself with focused study sprints." path="/lockedin/sprints" noIndex={true} />
        <Sidebar activePage="/lockedin/sprints" />
        <SprintsList />
    </div>
);

export default SprintPage;
