
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/services/supabase";
import { Task, Sprint, TaskStatus } from "@/types/planning";

export function useSprint(projectId: string | null) {
    const [backlogTasks, setBacklogTasks] = useState<Task[]>([]);
    const [activeSprint, setActiveSprint] = useState<Sprint | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Load Sprint & Backlog
    const refresh = useCallback(async () => {
        if (!projectId) return;

        setIsLoading(true);
        try {
            // 1. Load Backlog
            const { data: bData } = await supabase
                .from('documents')
                .select('content')
                .eq('project_id', projectId)
                .eq('type', 'BACKLOG')
                .single();

            if (bData?.content) {
                const lines = bData.content.split('\n');
                const parsed: Task[] = [];
                let currentPhase = 'General';

                lines.forEach((line: string) => {
                    if (line.trim().startsWith('## ')) {
                        currentPhase = line.replace('## ', '').trim();
                    } else if (line.trim().startsWith('- [ ]')) {
                        // Regex to extract: Title (ID) Priority
                        // Example: - [ ] Implement Login (AUTH-001) P0
                        const match = line.match(/- \[ \] (.*?) \((\w+-\d+|\w+)\) (P[0-3])/);
                        const simpleMatch = line.match(/- \[ \] (.*)/);

                        if (match) {
                            parsed.push({
                                id: match[2],
                                title: match[1].trim(),
                                priority: match[3] as any,
                                status: 'TODO',
                                phase: currentPhase
                            });
                        } else if (simpleMatch) {
                            parsed.push({
                                id: `TASK-${Math.floor(Math.random() * 100000)}`,
                                title: simpleMatch[1].trim(),
                                priority: 'P2',
                                status: 'TODO',
                                phase: currentPhase
                            });
                        }
                    }
                });
                setBacklogTasks(parsed);
            }

            // 2. Load Active Sprint
            const { data: sData } = await supabase
                .from('documents')
                .select('content')
                .eq('project_id', projectId)
                .eq('type', 'SPRINT')
                .single();

            if (sData?.content) {
                try {
                    const parsedSprint = JSON.parse(sData.content);
                    setActiveSprint(parsedSprint);
                } catch (e) {
                    console.error("Failed to parse Sprint JSON", e);
                }
            } else {
                setActiveSprint(null);
            }

        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    // Actions
    const startSprint = async (projectId: string, title: string, goal: string, start: Date, end: Date, taskIds: string[]) => {
        if (!projectId) return;

        // Filter tasks from backlog
        const selected = backlogTasks.filter(t => taskIds.includes(t.id));

        const newSprint: Sprint = {
            id: new Date().toISOString(),
            title: title || `Sprint ${new Date().toLocaleDateString()}`,
            status: 'ACTIVE',
            tasks: selected.map(t => ({ ...t, status: 'TODO' })), // Set initial status
            startedAt: new Date().toISOString()
        };

        // Save as JSON in the SPRINT doc
        await supabase.from('documents').upsert({
            project_id: projectId,
            type: 'SPRINT',
            content: JSON.stringify(newSprint, null, 2),
            title: newSprint.title,
            summary: goal || `Active Sprint with ${selected.length} tasks.`
        }, { onConflict: 'project_id, type' });

        setActiveSprint(newSprint);
    };

    const updateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
        if (!activeSprint || !projectId) return;

        const updatedTasks = activeSprint.tasks.map(t =>
            t.id === taskId ? { ...t, status: newStatus } : t
        );

        const updatedSprint = { ...activeSprint, tasks: updatedTasks };

        // Optimistic Update
        setActiveSprint(updatedSprint);

        // Persist
        await supabase.from('documents').update({
            content: JSON.stringify(updatedSprint, null, 2)
        }).eq('project_id', projectId).eq('type', 'SPRINT');
    };

    const completeSprint = async () => {
        if (!projectId) return;
        // In a real app, we might archive this. For now, we just delete the SPRINT doc 
        // or mark it completed. Let's delete it to "clear the board" for next batch.
        await supabase.from('documents').delete().eq('project_id', projectId).eq('type', 'SPRINT');
        setActiveSprint(null);
    };

    // Derived State
    const sprintTasks = activeSprint?.tasks || [];
    const todoTasks = sprintTasks.filter(t => t.status === 'TODO');
    const activeTask = sprintTasks.find(t => t.status === 'IN_PROGRESS');
    const doneTasks = sprintTasks.filter(t => t.status === 'DONE');

    // Mapped Actions
    const startTask = async (taskId: string) => {
        await updateTaskStatus(taskId, 'IN_PROGRESS');
    };

    const completeTask = async (taskId: string) => {
        await updateTaskStatus(taskId, 'DONE');
    };

    const createTask = async (task: Partial<Task>) => {
        if (!projectId) return;

        // 1. Append to Backlog Doc
        const line = `\n- [ ] ${task.title} (TASK-${Math.floor(Math.random() * 10000)}) ${task.priority || 'P2'}`;

        // Fetch current backlog to append
        const { data } = await supabase.from('documents').select('content').eq('project_id', projectId).eq('type', 'BACKLOG').single();
        const currentContent = data?.content || "# Backlog\n";

        await supabase.from('documents').upsert({
            project_id: projectId,
            type: 'BACKLOG',
            content: currentContent + line,
            title: 'Backlog',
            summary: 'Project Backlog'
        }, { onConflict: 'project_id, type' });

        // 2. If valid active sprint, also add it there for immediate feedback (Hotfix style)
        if (activeSprint) {
            const newTask: Task = {
                id: `TASK-${Math.floor(Math.random() * 10000)}`,
                title: task.title || "Untitled",
                priority: (task.priority as any) || 'P2',
                status: 'TODO',
                phase: 'Ad-Hoc'
            };
            const updatedTasks = [...activeSprint.tasks, newTask];
            const updatedSprint = { ...activeSprint, tasks: updatedTasks };
            setActiveSprint(updatedSprint);
            await supabase.from('documents').update({
                content: JSON.stringify(updatedSprint, null, 2)
            }).eq('project_id', projectId).eq('type', 'SPRINT');
        } else {
            // If no sprint, refresh backlog to show it (if we were falling back, but we aren't yet)
            refresh();
        }
    };

    return {
        activeSprint,
        backlogTasks,
        isLoading,
        startSprint,
        updateTaskStatus,
        completeSprint,
        refresh,
        // New exports for HangarFlightDeck
        todoTasks,
        activeTask,
        doneTasks,
        startTask,
        completeTask,
        createTask
    };
}
