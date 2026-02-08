import { SupportTicket } from "../components/SupportTicket";
import { Sidebar } from "../components/user/Sidebar";


const SupportTicketPage = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar activePage="/lockedin/support-tickets" />
      <SupportTicket />
    </div>
  );
};

export default SupportTicketPage;
