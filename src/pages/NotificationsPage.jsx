import { Notifications } from "../components/Notifications";
import { PricingLayout } from "../components/user/PricingLayout";
import { Sidebar } from "../components/user/Sidebar";


const NotificationsPage = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar activePage="/lockedin/notifications" />
      <Notifications />
    </div>
  );
};

export default NotificationsPage;
