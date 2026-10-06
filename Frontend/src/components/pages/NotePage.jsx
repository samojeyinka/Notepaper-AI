import React from "react";
import { Sidebar } from "../components/user/Sidebar";
import { Note } from "../components/note/Note";

const NotePage = () => {
    return (
        <div className="flex min-h-screen bg-paper font-display text-stone-900 antialiased selection:bg-plum-200">
            {/* Global Sidebar */}
            <Sidebar activePage="/lockedin/library" />

            {/* Editor Area */}
            <Note />
        </div>
    );
};

export default NotePage;
