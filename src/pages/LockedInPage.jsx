import { DashboardContent } from "../components/user/DashboardContent";
import { FloatingAIButton } from "../components/user/FloatingAIButton";
import { Sidebar } from "../components/user/Sidebar";

const LockedInPage = () => {
  return (
    <div className="flex min-h-screen">
       <Sidebar activePage="/lockedin" />
      <DashboardContent />
      <FloatingAIButton />
    
    </div>
  );
};

export default LockedInPage;
