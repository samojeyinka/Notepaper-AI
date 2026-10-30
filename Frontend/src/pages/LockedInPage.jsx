import { DashboardContent } from "../components/user/DashboardContent";
import { FloatingAIButton } from "../components/user/FloatingAIButton";
import { Sidebar } from "../components/user/Sidebar";
import SEO from "../components/globals/SEO";

const LockedInPage = () => {
  return (
    <div className="lockedin-page flex min-h-screen font-display text-stone-900 antialiased">
      <SEO title="Dashboard" description="Your Notepaper AI workspace." path="/lockedin" noIndex={true} />
       <Sidebar activePage="/lockedin" />
      <DashboardContent />
      <FloatingAIButton />

    </div>
  );
};

export default LockedInPage;
