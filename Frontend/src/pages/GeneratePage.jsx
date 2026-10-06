import Generate from "../components/generate/Generate";
import { Sidebar } from "../components/user/Sidebar";

const GeneratePage = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar activePage="/lockedin/generate" />
      <Generate/>
    </div>
  );
};

export default GeneratePage;
