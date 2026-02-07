import { LibraryContent } from "../components/LibraryContent";
import { Sidebar } from "../components/user/Sidebar";
import { StudyPlannerContent } from "../components/user/StudyPlanner";

const LibraryPage = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar activePage="/lockedin/library" />
      <LibraryContent/>
    </div>
  );
};

export default LibraryPage;