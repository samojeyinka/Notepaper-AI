import React from "react";
import { Sidebar } from "../components/user/Sidebar";
import { Presentation } from "../components/paper/Presentation";

const PresentationPage = () => {
    return (
        <div className="flex min-h-screen bg-slate-100">
            <Sidebar activePage="/lockedin/papers" />
            <Presentation />
        </div>
    );
};

export default PresentationPage;
