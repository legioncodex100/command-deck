
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/services/supabase";
import { Task, Sprint } from "@/types/planning";

// Define Task interface matching the DB
interface DbTask {
    id: string;
    project_id: string;
    title: string;
    description: string | null;
    priority: 'P0' | 'P1' | 'P2';
    status: 'todo' | 'in_progress' | 'done';
    created_at: string;
}

export function useSprint(projectId: string | null) {
    const [tasks, setTasks] = useState<DbTask[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    // supabase is imported directly

    // Load Tasks
    const refresh = useCallback(async () => {
        if (!projectId) return;

        setIsLoading(true);
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setTasks(data as DbTask[]);
        } else if (error) {
            console.error("Failed to load tasks", error);
        }
        setIsLoading(false);
    }, [projectId]);

    useEffect(() => {
        refresh();

        // Subscribe to changes
        const channel = supabase
            .channel('tasks_channel')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'tasks', filter: `project_id=eq.${projectId}` },
                () => refresh()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [refresh, projectId]);

    // Derived State
    const todoTasks = tasks.filter(t => t.status === 'todo');
    const activeTask = tasks.find(t => t.status === 'in_progress');
    const doneTasks = tasks.filter(t => t.status === 'done');

    // Actions
    const startTask = async (taskId: string) => {
        // Enforce WIP limit: only 1 active task
        if (activeTask) return;

        // Optimistic update
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'in_progress' } : t));

        await supabase.from('tasks').update({ status: 'in_progress' }).eq('id', taskId);
    };

    const completeTask = async (taskId: string) => {
        // Optimistic update
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'done' } : t));

        await supabase.from('tasks').update({ status: 'done' }).eq('id', taskId);
    };

    const stopTask = async (taskId: string) => {
        // Only if it's the active task
        if (activeTask && activeTask.id !== taskId) return;

        // Optimistic update
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'todo' } : t));

        await supabase.from('tasks').update({ status: 'todo' }).eq('id', taskId);
    };

    const createTask = async (task: { title: string, priority: 'P0' | 'P1' | 'P2' }) => {
        if (!projectId) return;

        await supabase.from('tasks').insert({
            project_id: projectId,
            title: task.title,
            priority: task.priority,
            status: 'todo'
        });
        // Subscription will trigger refresh
    };

    return {
        todoTasks,
        activeTask,
        doneTasks,
        startTask,
        stopTask,
        completeTask,
        createTask,
        isLoading,
        refresh
    };
}
