import { Billing } from "../components/user/Billing";
import { Sidebar } from "../components/user/Sidebar";

const BillingPage = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar activePage="/lockedin/invoices-&-billing" />
      <Billing />
    
    </div>
  );
};

export default BillingPage;
