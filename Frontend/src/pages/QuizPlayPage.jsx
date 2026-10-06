import QuizPlay from "../components/quizzes/QuizPlay";
import { Sidebar } from "../components/user/Sidebar";

const QuizPlayPage = () => {
  return (
    <div className="flex min-h-screen bg-paper font-display text-stone-900 antialiased selection:bg-plum-200">
      <Sidebar activePage="/lockedin/quizzes" />
      <QuizPlay />
    </div>
  );
};

export default QuizPlayPage;
