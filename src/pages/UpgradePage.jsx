import { PricingLayout } from "../components/user/PricingLayout";
import { Sidebar } from "../components/user/Sidebar";

const UpgradePage = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar activePage="/lockedin/upgrade" />
      <PricingLayout />
    
    </div>
  );
};

export default UpgradePage;
