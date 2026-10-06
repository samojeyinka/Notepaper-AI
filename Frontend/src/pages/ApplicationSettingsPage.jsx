import { ApplicationSettings } from "../components/ApplicationSettings";
import { Sidebar } from "../components/user/Sidebar";

const ApplicationSettingsPage = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar activePage="/lockedin/application-settings" />
      <ApplicationSettings />
    </div>
  );
};

export default ApplicationSettingsPage;
