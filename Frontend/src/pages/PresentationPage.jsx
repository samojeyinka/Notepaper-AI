import React from "react";
import { Sidebar } from "../components/user/Sidebar";
import { Presentation } from "../components/paper/Presentation";

const PresentationPage = () => {
    return (
        <div className="flex min-h-screen bg-paper font-display text-stone-900 antialiased selection:bg-plum-200">
            <Sidebar activePage="/lockedin/library" />
            <Presentation />
        </div>
    );
};

export default PresentationPage;
