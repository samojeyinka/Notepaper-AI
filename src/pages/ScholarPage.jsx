import { Sidebar } from '../components/user/Sidebar';
import Scholar from '../components/scholar/Scholar';

const ScholarPage = () => {
    return (
        <div className="flex min-h-screen">
            <Sidebar activePage="/lockedin/scholar" />
            <Scholar />
        </div>
    );
};

export default ScholarPage;
