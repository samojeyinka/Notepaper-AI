import { PricingLayout } from "../components/user/PricingLayout";
import { Sidebar } from "../components/user/Sidebar";
import SEO from "../components/globals/SEO";

const UpgradePage = () => {
  return (
    <div className="flex min-h-screen">
      <SEO title="Upgrade to Pro" description="Unlock unlimited AI generations, advanced features, and more with Notepaper AI Pro." path="/lockedin/upgrade" noIndex={true} />
      <Sidebar activePage="/lockedin/upgrade" />
      <PricingLayout />

    </div>
  );
};

export default UpgradePage;
