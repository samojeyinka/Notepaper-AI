import React from "react";
import { Sidebar } from "../components/user/Sidebar";
import { Paper } from "../components/paper/Paper";

const PaperPage = () => {
    return (
        <div className="flex min-h-screen bg-paper font-display text-stone-900 antialiased selection:bg-plum-200">
            <Sidebar activePage="/lockedin/library" />
            <Paper />
        </div>
    );
};

export default PaperPage;
