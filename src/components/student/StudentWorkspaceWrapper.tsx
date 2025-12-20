"use client";

import dynamic from "next/dynamic";
import React from "react";
import { Lesson } from "@/lib/db";

// Dynamically import the actual workspace with SSR disabled
const StudentWorkspace = dynamic(() => import("./StudentWorkspace"), {
    ssr: false,
    loading: () => (
        <div className="h-screen w-full flex items-center justify-center bg-[#1e1e2e] text-gray-400">
            Loading Workspace...
        </div>
    ),
});

interface StudentWorkspaceWrapperProps {
    lesson: Lesson;
    allLessons?: Lesson[];
}

export default function StudentWorkspaceWrapper(props: StudentWorkspaceWrapperProps) {
    return <StudentWorkspace {...props} />;
}
