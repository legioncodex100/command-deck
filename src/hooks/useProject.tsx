"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/services/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Project } from "@/types/database";

// Basic document interface based on usage (PRD, STRATEGY, BACKLOG, etc.)
interface DeckDocument {
    id: string;
    project_id: string;
    type: string; // DocumentType in types/database.ts is more strict, but string is fine here for now
    content: string;
    title?: string;
    created_at: string;
    updated_at?: string;
}

interface ProjectContextType {
    projects: Project[];
    activeProject: Project | null;
    project: Project | null; // Alias
    activeProjectId: string | null;
    documents: DeckDocument[];
    isLoading: boolean;
    createProject: (name: string, description?: string) => Promise<Project | undefined>;
    switchProject: (projectId: string) => void;
    updateStage: (stage: any) => Promise<void>;
    renameProject: (projectId: string, newName: string) => Promise<void>;
    deleteProject: (projectId: string) => Promise<void>;
    refreshProject: () => Promise<void>;
    saveDocument: (doc: any) => Promise<void>;
    fetchDocuments: () => Promise<void>;
    missionStatus: any;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [documents, setDocuments] = useState<DeckDocument[]>([]);
    // Default to null initially, load from localStorage if available
    const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initial project load
    const fetchProjects = useCallback(async () => {
        if (!user) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        const { data } = await supabase
            .from("projects")
            .select("*")
            .order("created_at", { ascending: false });

        if (data) {
            // STEALTH PROTOCOL: Hide Hangar Core from standard project list
            const visibleProjects = data.filter(p => p.id !== 'c0de0000-0000-0000-0000-000000000000');
            setProjects(visibleProjects);

            // Restore active project from storage or default to the most recent one
            const storedId = localStorage.getItem("command_deck_active_project");
            const isValidStored = visibleProjects.find(p => p.id === storedId);

            if (isValidStored) {
                setActiveProjectId(isValidStored.id);
            } else if (visibleProjects.length > 0) {
                setActiveProjectId(visibleProjects[0].id);
            } else {
                // No projects exist, handled by UI generally, or can create one here if needed
            }
        }
        setIsLoading(false);
    }, [user]);

    // Fetch projects on mount/user change
    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    // Fetch documents when active project changes
    useEffect(() => {
        if (!activeProjectId) {
            setDocuments([]);
            return;
        }

        const fetchDocs = async () => {
            const { data } = await supabase
                .from("documents")
                .select("*")
                .eq("project_id", activeProjectId);

            if (data) {
                setDocuments(data);
            }
        };

        fetchDocs();
    }, [activeProjectId]);

    // Refreshes the current project's data (both project list and documents)
    const refreshProject = async () => {
        await fetchProjects();
        // Also re-fetch docs if there is an active project
        if (activeProjectId) {
            const { data } = await supabase
                .from("documents")
                .select("*")
                .eq("project_id", activeProjectId);
            if (data) setDocuments(data);
        }
    };

    // Persist active project selection
    useEffect(() => {
        if (activeProjectId) {
            localStorage.setItem("command_deck_active_project", activeProjectId);
        }
    }, [activeProjectId]);

    const createProject = async (name: string, description: string = "") => {
        if (!user) return;

        const { data, error } = await supabase
            .from("projects")
            .insert([{
                name,
                description,
                user_id: user.id,
                current_stage: 'DISCOVERY' // Default stage
            }])
            .select()
            .single();

        if (error) {
            console.error("Error creating project:", error);
            throw error;
        }

        if (data) {
            setProjects((prev) => [data, ...prev]);
            setActiveProjectId(data.id);

            // AUTO-ADMOTION: Check rank and upgrade to PILOT if CIVILIAN
            try {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (profile && profile.role === 'CIVILIAN') {
                    console.log("Promoting user to PILOT...");
                    await supabase
                        .from('profiles')
                        .update({ role: 'PILOT' })
                        .eq('id', user.id);

                    // Refresh auth session to reflect new role if needed (though UI usually fetches from DB)
                    await supabase.auth.refreshSession();
                }
            } catch (err) {
                console.error("Error promoting user:", err);
            }
        }
        return data;
    };

    const switchProject = (projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        if (project) {
            setActiveProjectId(project.id);
        }
    };

    const updateStage = async (stage: any) => {
        if (!activeProjectId || !user) return;

        const { error } = await supabase
            .from("projects")
            .update({ current_stage: stage })
            .eq("id", activeProjectId);

        if (error) {
            console.error("Error updating stage:", error);
            throw error;
        }

        // Optimistic update
        setProjects(prev => prev.map(p =>
            p.id === activeProjectId ? { ...p, current_stage: stage } : p
        ));
    };

    const renameProject = async (projectId: string, newName: string) => {
        if (!user) return;

        const { error } = await supabase
            .from("projects")
            .update({ name: newName })
            .eq("id", projectId);

        if (error) {
            console.error("Error renaming project:", error);
            throw error;
        }

        setProjects(prev => prev.map(p =>
            p.id === projectId ? { ...p, name: newName } : p
        ));
    };

    const deleteProject = async (projectId: string) => {
        if (!user) return;

        const { error } = await supabase
            .from("projects")
            .delete()
            .eq("id", projectId);

        if (error) {
            console.error("Error deleting project:", error);
            throw error;
        }

        const newProjects = projects.filter(p => p.id !== projectId);
        setProjects(newProjects);

        // If we deleted the active project, switch to another one or null
        if (activeProjectId === projectId) {
            const nextProject = newProjects.length > 0 ? newProjects[0] : null;
            setActiveProjectId(nextProject ? nextProject.id : null);
        }
    };

    const activeProject = projects.find(p => p.id === activeProjectId) || null;

    // Mission Status Logic (Workbench Mode)
    const missionStatus = (() => {
        const status = {
            isLocked: (stageName: string) => false,
            nextBestAction: "Review Project Status", // default
            isRecommended: false,
            nextActionLink: "",
            nextActionLabel: "",
            progress: 0
        };

        if (activeProject) {
            const STAGE_ORDER = ['DISCOVERY', 'STRATEGY', 'DESIGN', 'SUBSTRUCTURE', 'CONSTRUCTION', 'AUDIT', 'HANDOVER', 'MAINTENANCE'];
            const currentIdx = STAGE_ORDER.indexOf(activeProject.current_stage);
            status.progress = Math.round(((currentIdx + 1) / STAGE_ORDER.length) * 100);

            switch (activeProject.current_stage) {
                case 'DISCOVERY':
                    status.nextBestAction = "Draft your PRD in the Discovery Lab.";
                    status.isRecommended = true;
                    status.nextActionLink = "/discovery";
                    status.nextActionLabel = "Go to Discovery";
                    break;
                case 'STRATEGY':
                    status.nextBestAction = "PRD Locked. Conduct Technical Strategy Consultation with the Systems Architect.";
                    status.isRecommended = true;
                    status.nextActionLink = "/strategy"; // Assume this route will be built next
                    status.nextActionLabel = "Enter Strategy Room";
                    break;
                case 'DESIGN':
                    status.nextBestAction = "Extract Design Tokens from Google Stitch.";
                    status.isRecommended = true;
                    status.nextActionLink = "/facade";
                    status.nextActionLabel = "Go to Facade";
                    break;
                case 'SUBSTRUCTURE':
                    status.nextBestAction = "Generate SQL Schema for your data layer.";
                    status.isRecommended = true;
                    status.nextActionLink = "/substructure";
                    status.nextActionLabel = "Go to Substructure";
                    break;
                case 'CONSTRUCTION':
                    status.nextBestAction = "Create Work Orders for your agents.";
                    status.isRecommended = true;
                    status.nextActionLink = "/construction";
                    status.nextActionLabel = "Go to Construction";
                    break;
                case 'AUDIT':
                    status.nextBestAction = "Verify structural integrity before handover.";
                    status.isRecommended = true;
                    status.nextActionLink = "/audit";
                    status.nextActionLabel = "Go to Audit";
                    break;
                case 'HANDOVER':
                    status.nextBestAction = "Generate Documentation and Archive context.";
                    status.isRecommended = true;
                    status.nextActionLink = "/handover";
                    status.nextActionLabel = "Go to Handover";
                    break;
                case 'MAINTENANCE':
                    status.nextBestAction = "System operational. Monitor for drifts.";
                    status.isRecommended = false;
                    break;
                default:
                    status.nextBestAction = "Project looks good.";
            }
        }
        return status;
    })();

    // Generic save document function
    const saveDocument = async ({ project_id, type, content, title, summary }: any) => {
        if (!user) return;

        try {
            // Check for existing doc of this type for this project
            const { data: existing, error: fetchError } = await supabase
                .from("documents")
                .select("id")
                .eq("project_id", project_id)
                .eq("type", type)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
                // Ignore 'Row not found' (PGRST116), log others
                console.error("Error fetching existing doc:", fetchError);
            }

            if (existing) {
                // Update
                const { error } = await supabase
                    .from("documents")
                    .update({
                        content,
                        title,
                        summary,
                        updated_at: new Date().toISOString()
                    })
                    .eq("id", existing.id);

                if (error) console.error("Error updating doc:", JSON.stringify(error, null, 2));

            } else {
                // Insert
                const { error } = await supabase
                    .from("documents")
                    .insert([{
                        project_id,
                        type,
                        content,
                        title,
                        summary,
                        updated_at: new Date().toISOString()
                    }]);

                if (error) console.error("Error inserting doc:", JSON.stringify(error, null, 2));
            }

            // Refresh docs
            refreshProject();

        } catch (err: any) {
            console.error("Unexpected error in saveDocument:", err);
        }
    };

    // Explicit fetch trigger
    const fetchDocuments = async () => {
        await refreshProject();
    };

    return (
        <ProjectContext.Provider value={{
            projects,
            activeProject,
            project: activeProject, // Alias for backward compatibility/ease
            activeProjectId,
            documents,
            isLoading,
            createProject,
            switchProject,
            updateStage,
            renameProject,
            deleteProject,
            refreshProject,
            saveDocument, // New export
            fetchDocuments, // New export
            missionStatus
        }
        }>
            {children}
        </ProjectContext.Provider>
    );
}

export function useProject() {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error("useProject must be used within a ProjectProvider");
    }
    return context;
}
