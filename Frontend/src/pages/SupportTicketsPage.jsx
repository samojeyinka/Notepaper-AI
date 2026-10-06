import { SupportTickets } from "../components/SupportTickets";
import { Sidebar } from "../components/user/Sidebar";


const SupportTicketsPage = () => {
  return (
    <div className="flex min-h-screen bg-paper font-display text-stone-900 antialiased selection:bg-plum-200">
      <Sidebar activePage="/lockedin/support-tickets" />
      <SupportTickets />
    </div>
  );
};

export default SupportTicketsPage;
