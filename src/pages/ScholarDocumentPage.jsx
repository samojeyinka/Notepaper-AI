import { Sidebar } from '../components/user/Sidebar';
import ScholarDocument from '../components/scholar/ScholarDocument';

const ScholarDocumentPage = () => (
    <div className="flex min-h-screen">
        <Sidebar activePage="/lockedin/scholar" />
        <ScholarDocument />
    </div>
);

export default ScholarDocumentPage;
