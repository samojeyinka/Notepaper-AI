import React from "react";
import { Sidebar } from "../components/user/Sidebar";
import { Paper } from "../components/paper/Paper";

const PaperPage = () => {
    return (
        <div className="lockedin-page flex min-h-screen font-display text-stone-900 antialiased selection:bg-plum-200">
            <Sidebar activePage="/lockedin/library" />
            <Paper />
        </div>
    );
};

export default PaperPage;
