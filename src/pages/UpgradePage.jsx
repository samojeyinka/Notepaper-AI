import { PricingLayout } from "../components/user/PricingLayout";
import { Sidebar } from "../components/user/Sidebar";

const UpgradePage = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <PricingLayout />
    
    </div>
  );
};

export default UpgradePage;
