import { Sidebar } from '../components/user/Sidebar';
import SprintsList from '../components/sprints/SprintsList';
import SEO from '../components/globals/SEO';

const SprintPage = () => (
    <div className="lockedin-page sprints-page flex min-h-screen font-display text-stone-900 antialiased">
        <SEO title="Sprints" description="Challenge yourself with focused study sprints." path="/lockedin/sprints" noIndex={true} />
        <Sidebar activePage="/lockedin/sprints" />
        <SprintsList />
    </div>
);

export default SprintPage;
