"use client";

import React from "react";
import { ProjectProvider } from "@/hooks/useProject";
import { DevModeProvider } from "@/hooks/DevModeContext";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ProjectProvider>
            <DevModeProvider>
                {children}
            </DevModeProvider>
        </ProjectProvider>
    );
}
