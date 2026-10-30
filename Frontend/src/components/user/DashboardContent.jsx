import { ActionCardsSection } from "./ActionCardsSection";
import { DashboardHeader } from "./DashboardHeader";
import RecentNotesSection from "./RecentNotesSection";
import UpcomingQuizzesSection from "./UpcomingQuizzesSection";

export const DashboardContent = () => {
  return (
    <main className="dashboard-content flex-1 lg:ml-64 px-4 sm:px-6 lg:px-10 pt-20 lg:pt-10 pb-32 min-w-0">
      <div className="dashboard-content-inner max-w-[1400px] mx-auto">
        <DashboardHeader />

        <div className="dashboard-sections space-y-12 lg:space-y-16">
          {/* Quick create strip */}
          <ActionCardsSection />

          {/* Recent work + practice */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-x-10 gap-y-12">
            <RecentNotesSection />
            <UpcomingQuizzesSection />
          </div>
        </div>
      </div>
    </main>
  );
};
