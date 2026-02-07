import { DashboardContent } from "../components/user/DashboardContent";
import { FloatingAIButton } from "../components/user/FloatingAIButton";
import { PricingLayout } from "../components/user/PricingLayout";
import { Sidebar } from "../components/user/Sidebar";

const LockedInPage = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <PricingLayout />
    
    </div>
  );
};

export default LockedInPage;
