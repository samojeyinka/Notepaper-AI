import { LibraryContent } from "../components/LibraryContent";
import Quizzes from "../components/quizzes/Quizzes";
import { Sidebar } from "../components/user/Sidebar";
import { StudyPlannerContent } from "../components/user/StudyPlanner";

const QuizzesPage = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar activePage="/lockedin/quizzes" />
      <Quizzes/>
    </div>
  );
};

export default QuizzesPage;