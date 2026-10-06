import React from "react";
import { Sidebar } from "../components/user/Sidebar";
import { Note } from "../components/note/Note";

const NotePage = () => {
    return (
        <div className="flex min-h-screen bg-white">
            {/* Global Sidebar */}
            <Sidebar activePage="/lockedin/notes" />
            
            {/* Editor Area */}
            <Note />
        </div>
    );
};

export default NotePage;
