import { NewSupportTickets } from "../components/NewSupportTickets";
import { Sidebar } from "../components/user/Sidebar";


const NewSupportTicketsPage = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar activePage="/lockedin/support-tickets" />
      <NewSupportTickets />
    </div>
  );
};

export default NewSupportTicketsPage;
