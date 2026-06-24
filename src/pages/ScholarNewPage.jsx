import { Sidebar } from '../components/user/Sidebar';
import ScholarNew from '../components/scholar/ScholarNew';

const ScholarNewPage = () => (
    <div className="flex min-h-screen">
        <Sidebar activePage="/lockedin/scholar" />
        <ScholarNew />
    </div>
);

export default ScholarNewPage;
