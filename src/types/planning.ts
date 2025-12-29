
export type TaskPriority = "P0" | "P1" | "P2" | "P3";
export type TaskPhase = "Foundation" | "Core Features" | "Polish" | "Unknown";
export type TaskStatus = "BACKLOG" | "TODO" | "IN_PROGRESS" | "DONE";

export interface Task {
    id: string;
    title: string;
    priority: TaskPriority;
    phase: string;
    description?: string;
    status: TaskStatus; // Added for Kanban
}

export interface Sprint {
    id: string; // usually just 'active' or timestamp
    title: string;
    status: 'PLANNING' | 'ACTIVE' | 'COMPLETED';
    tasks: Task[];
    startedAt?: string;
}
