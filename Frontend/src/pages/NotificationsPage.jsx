import { Notifications } from "../components/Notifications";
import { Sidebar } from "../components/user/Sidebar";

const NotificationsPage = () => {
  return (
    <div className="lockedin-page flex min-h-screen font-display text-stone-900 antialiased selection:bg-plum-200">
      <Sidebar activePage="/lockedin/notifications" />
      <Notifications />
    </div>
  );
};

export default NotificationsPage;
