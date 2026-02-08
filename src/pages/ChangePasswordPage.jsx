
import { ChangePassword } from "../components/ChangePassword";
import { Sidebar } from "../components/user/Sidebar";

const ChangePasswordPage = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar activePage="/lockedin/change-password" />
      <ChangePassword />
    </div>
  );
};

export default ChangePasswordPage;
