import { ActionCardsSection } from "./ActionCardsSection";
import { DashboardHeader } from "./DashboardHeader";
import ElevateProSection from "./ElevateProSection";
import RecentNotesSection from "./RecentNotesSection";
import { UpcomingQuizzesSection } from "./UpcomingQuizzesSection";

export const DashboardContent = () => {
  return (
    <main className="flex-1 ml-64 p-8 ">
      <DashboardHeader />
      <ActionCardsSection />
      <ElevateProSection/>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <RecentNotesSection />
        <UpcomingQuizzesSection />
      </div>
    </main>
  );
};