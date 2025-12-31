"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { usePillarTheme } from '../PillarProvider';

interface PillarCardProps {
    children: React.ReactNode;
    className?: string;
    active?: boolean;
    onClick?: () => void;
}

export function PillarCard({ children, className, active, onClick }: PillarCardProps) {
    const theme = usePillarTheme();

    return (
        <div
            onClick={onClick}
            className={cn(
                "p-3 border rounded transition-all group relative",
                active
                    ? `bg-zinc-950/20 ${theme.border} ${theme.textDim}`
                    : "bg-black/40 border-zinc-800 text-zinc-400 hover:border-zinc-700",
                onClick && "cursor-pointer hover:bg-zinc-900/40",
                className
            )}
        >
            {children}
        </div>
    );
}
