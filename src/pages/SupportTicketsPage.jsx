import { SupportTickets } from "../components/SupportTickets";
import { Sidebar } from "../components/user/Sidebar";


const SupportTicketsPage = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar activePage="/lockedin/support-tickets" />
      <SupportTickets />
    </div>
  );
};

export default SupportTicketsPage;
