import Quizzes from "../components/quizzes/Quizzes";
import { Sidebar } from "../components/user/Sidebar";
import SEO from "../components/globals/SEO";

const QuizzesPage = () => {
  return (
    <div className="lockedin-page quizzes-page flex min-h-screen font-display text-stone-900 antialiased">
      <SEO title="Quizzes" description="Test yourself with AI-generated quizzes from your study material." path="/lockedin/quizzes" noIndex={true} />
      <Sidebar activePage="/lockedin/quizzes" />
      <Quizzes/>
    </div>
  );
};

export default QuizzesPage;
