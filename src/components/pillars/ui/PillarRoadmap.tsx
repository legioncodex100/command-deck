"use client";

import React from 'react';
import { Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePillarTheme } from '../PillarProvider';

interface PillarRoadmapItem {
    id: string;
    label: string;
    status: 'ACTIVE' | 'COMPLETED' | 'PENDING';
}

interface PillarRoadmapProps {
    items: PillarRoadmapItem[];
    className?: string;
    onItemClick?: (id: string) => void;
}

export function PillarRoadmap({ items, className, onItemClick }: PillarRoadmapProps) {
    const theme = usePillarTheme();

    return (
        <div className={cn("space-y-4 px-4 pt-0 pb-4", className)}>
            {items.map((item) => {
                const isActive = item.status === 'ACTIVE' || item.status === 'COMPLETED';
                const isCompleted = item.status === 'COMPLETED';

                return (
                    <div
                        key={item.id}
                        onClick={() => onItemClick && onItemClick(item.id)}
                        className={cn(
                            "p-4 rounded border flex items-center justify-between transition-all relative group",
                            // Active/Completed Status
                            // Active/Completed Status
                            isActive
                                ? `bg-zinc-950/80 ${theme.text} border-current`
                                : "bg-zinc-950/40 border-zinc-800 text-zinc-500 hover:border-zinc-700",

                            // Dynamic Border/Text from theme
                            isActive && theme.border.replace('/20', '/50'), // Stronger border for active
                            isActive && theme.text,

                            onItemClick && "cursor-pointer"
                        )}
                    >
                        <span className={cn(
                            "text-xs font-mono uppercase tracking-widest",
                            isActive ? theme.text : "text-zinc-600"
                        )}>
                            {item.label}
                        </span>

                        {/* Status Indicator */}
                        {isActive && (
                            <Activity className={cn(
                                "h-4 w-4",
                                theme.text,
                                // Pulse animation only for ACTIVE (not completed) if desired, but user image shows active having icon
                                item.status === 'ACTIVE' && "animate-pulse"
                            )} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
