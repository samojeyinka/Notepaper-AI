import { LibraryContent } from "../components/LibraryContent";
import { Sidebar } from "../components/user/Sidebar";
import SEO from "../components/globals/SEO";

const LibraryPage = () => {
  return (
    <div className="flex min-h-screen">
      <SEO title="Library" description="All your notes, papers, and flashcards in one place." path="/lockedin/library" noIndex={true} />
      <Sidebar activePage="/lockedin/library" />
      <LibraryContent/>
    </div>
  );
};

export default LibraryPage;