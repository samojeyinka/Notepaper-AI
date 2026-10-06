
import { ChangePassword } from "../components/ChangePassword";
import { Sidebar } from "../components/user/Sidebar";

const ChangePasswordPage = () => {
  return (
    <div className="flex min-h-screen bg-paper font-display text-stone-900 antialiased selection:bg-plum-200">
      <Sidebar activePage="/lockedin/change-password" />
      <ChangePassword />
    </div>
  );
};

export default ChangePasswordPage;
