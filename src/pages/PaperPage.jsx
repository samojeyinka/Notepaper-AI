import React from "react";
import { Sidebar } from "../components/user/Sidebar";
import { Paper } from "../components/paper/Paper";

const PaperPage = () => {
    return (
        <div className="flex min-h-screen bg-white">
            <Sidebar activePage="/lockedin/papers" />
            <Paper />
        </div>
    );
};

export default PaperPage;
