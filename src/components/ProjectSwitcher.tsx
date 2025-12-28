"use client";

import { useProject } from "@/hooks/useProject";
import { useRouter } from "next/navigation";
import { ChevronDown, Box } from "lucide-react";

export function ProjectSwitcher() {
    const { projects, activeProjectId, switchProject, isLoading } = useProject();
    const router = useRouter();

    const handleSwitch = (projectId: string) => {
        switchProject(projectId);
        router.push('/dashboard');
    };

    if (isLoading) {
        return <div className="h-8 w-32 bg-zinc-900 rounded animate-pulse" />;
    }

    return (
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Box className="h-4 w-4 text-emerald-500" />
            </div>

            <select
                value={activeProjectId || ""}
                onChange={(e) => handleSwitch(e.target.value)}
                className="appearance-none bg-[#020402] border border-zinc-800 hover:border-emerald-500/50 text-zinc-300 text-sm rounded-md pl-9 pr-10 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer font-mono min-w-[200px]"
            >
                {projects.map((p) => (
                    <option key={p.id} value={p.id} className="bg-zinc-950 text-zinc-300">
                        {p.name}
                    </option>
                ))}
                {projects.length === 0 && <option disabled>No Projects</option>}
            </select>

            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-zinc-500 group-hover:text-emerald-500 transition-colors" />
            </div>
        </div>
    );
}
