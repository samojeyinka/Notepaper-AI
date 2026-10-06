import { ProfileSettings } from "../components/ProfileSettings";
import { Sidebar } from "../components/user/Sidebar";

const ProfileSettingsPage = () => {
  return (
    <div className="flex min-h-screen bg-paper font-display text-stone-900 antialiased selection:bg-plum-200">
      <Sidebar activePage="/lockedin/profile-settings" />
      <ProfileSettings />
    </div>
  );
};

export default ProfileSettingsPage;
