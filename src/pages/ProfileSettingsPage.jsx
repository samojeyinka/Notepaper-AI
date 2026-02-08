import { ProfileSettings } from "../components/ProfileSettings";
import { PricingLayout } from "../components/user/PricingLayout";
import { Sidebar } from "../components/user/Sidebar";

const ProfileSettingsPage = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar activePage="/lockedin/profile-settings" />
      <ProfileSettings />
    </div>
  );
};

export default ProfileSettingsPage;
