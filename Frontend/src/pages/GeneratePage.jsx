import Generate from "../components/generate/Generate";
import { Sidebar } from "../components/user/Sidebar";

const GeneratePage = () => {
  return (
    <div className="lockedin-page studio-page flex min-h-screen">
      <Sidebar activePage="/lockedin/generate" />
      <Generate/>
    </div>
  );
};

export default GeneratePage;
