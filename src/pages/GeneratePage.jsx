import Generate from "../components/generate/Generate";
import { LibraryContent } from "../components/LibraryContent";
import QuizPlay from "../components/quizzes/QuizPlay";
import Quizzes from "../components/quizzes/Quizzes";
import { Sidebar } from "../components/user/Sidebar";
import { StudyPlannerContent } from "../components/user/StudyPlanner";

const GeneratePage = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar activePage="/lockedin/generate" />
      <Generate/>
    </div>
  );
};

export default GeneratePage;



