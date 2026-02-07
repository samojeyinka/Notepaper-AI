import { PricingLayout } from "../components/user/PricingLayout";
import { Sidebar } from "../components/user/Sidebar";
import { StudyPlannerContent } from "../components/user/StudyPlanner";

const StudyPlanPage = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <StudyPlannerContent/>
    </div>
  );
};

export default StudyPlanPage;
