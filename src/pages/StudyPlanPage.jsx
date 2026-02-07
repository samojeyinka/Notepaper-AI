import { Sidebar } from "../components/user/Sidebar";
import { StudyPlannerContent } from "../components/user/StudyPlanner";

const StudyPlanPage = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar activePage="/lockedin/study-plan" />
      <StudyPlannerContent/>
    </div>
  );
};

export default StudyPlanPage;