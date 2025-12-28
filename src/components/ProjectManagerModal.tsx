"use client";

import { useProject } from "@/hooks/useProject";
import { X, Trash2, Edit2, Check, Folder } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProjectManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ProjectManagerModal({ isOpen, onClose }: ProjectManagerModalProps) {
    const { projects, renameProject, deleteProject, activeProjectId } = useProject();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleStartEdit = (id: string, currentName: string) => {
        setEditingId(id);
        setEditName(currentName);
        setDeletingId(null);
    };

    const handleSaveEdit = async () => {
        if (editingId && editName.trim()) {
            await renameProject(editingId, editName.trim());
            setEditingId(null);
        }
    };

    const handleDeleteClick = (id: string) => {
        setDeletingId(id);
        setEditingId(null);
    };

    const confirmDelete = async (id: string) => {
        await deleteProject(id);
        setDeletingId(null);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div
                className="w-full max-w-md bg-[#0a0a0a] border border-zinc-800 rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-4 py-3 bg-[#020402] border-b border-zinc-800">
                    <h3 className="text-sm font-semibold text-zinc-200">Manage Projects</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
                    {projects.map(project => (
                        <div
                            key={project.id}
                            className={cn(
                                "flex items-center justify-between p-3 rounded-md border transition-all",
                                project.id === activeProjectId
                                    ? "bg-emerald-950/10 border-emerald-500/20"
                                    : "bg-zinc-900/30 border-zinc-800 hover:bg-zinc-900/50"
                            )}
                        >
                            {editingId === project.id ? (
                                <div className="flex items-center gap-2 flex-1 mr-2">
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="flex-1 bg-black border border-emerald-500/50 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        autoFocus
                                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                                    />
                                    <button onClick={handleSaveEdit} className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded hover:bg-emerald-500/20">
                                        <Check className="w-3 h-3" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <Folder className={cn("w-4 h-4 shrink-0", project.id === activeProjectId ? "text-emerald-500" : "text-zinc-500")} />
                                    <span className={cn("text-sm truncate", project.id === activeProjectId ? "text-emerald-100 font-medium" : "text-zinc-300")}>
                                        {project.name}
                                    </span>
                                    {project.id === activeProjectId && <span className="text-[10px] bg-emerald-500/20 text-emerald-500 px-1.5 py-0.5 rounded border border-emerald-500/20">ACTIVE</span>}
                                </div>
                            )}

                            <div className="flex items-center gap-1 shrink-0">
                                {deletingId === project.id ? (
                                    <div className="flex items-center gap-2 animate-in slide-in-from-right-5 duration-200">
                                        <span className="text-[10px] text-red-400 font-medium">Sure?</span>
                                        <button
                                            onClick={() => confirmDelete(project.id)}
                                            className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 font-medium"
                                        >
                                            Delete
                                        </button>
                                        <button
                                            onClick={() => setDeletingId(null)}
                                            className="px-2 py-1 bg-zinc-800 text-zinc-400 text-xs rounded hover:bg-zinc-700"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    !editingId && (
                                        <>
                                            <button
                                                onClick={() => handleStartEdit(project.id, project.name)}
                                                className="p-1.5 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors"
                                                title="Rename"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(project.id)}
                                                className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </>
                                    )
                                )}
                            </div>
                        </div>
                    ))}

                    {projects.length === 0 && (
                        <div className="text-center py-8 text-zinc-500 text-sm">
                            No projects found.
                        </div>
                    )}
                </div>
            </div>

            {/* Backdrop click to close */}
            <div className="absolute inset-0 -z-10" onClick={onClose} />
        </div>
    );
}
