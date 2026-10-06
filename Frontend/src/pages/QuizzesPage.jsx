import Quizzes from "../components/quizzes/Quizzes";
import { Sidebar } from "../components/user/Sidebar";
import SEO from "../components/globals/SEO";

const QuizzesPage = () => {
  return (
    <div className="flex min-h-screen bg-paper font-display text-stone-900 antialiased selection:bg-plum-200">
      <SEO title="Quizzes" description="Test yourself with AI-generated quizzes from your study material." path="/lockedin/quizzes" noIndex={true} />
      <Sidebar activePage="/lockedin/quizzes" />
      <Quizzes/>
    </div>
  );
};

export default QuizzesPage;