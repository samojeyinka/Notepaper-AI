import { SupportTickets } from "../components/SupportTickets";
import { Sidebar } from "../components/user/Sidebar";


const SupportTicketsPage = () => {
  return (
    <div className="lockedin-page support-page flex min-h-screen font-display text-stone-900 antialiased">
      <Sidebar activePage="/lockedin/support-tickets" />
      <SupportTickets />
    </div>
  );
};

export default SupportTicketsPage;
