"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { usePillarTheme } from '../PillarProvider';

interface PillarPanelProps {
    children: React.ReactNode;
    className?: string; // Allow override for col-span logic
}

export function PillarPanel({ children, className }: PillarPanelProps) {
    // const theme = usePillarTheme(); // Panel frame is now neutral standard

    return (
        <div className={cn(
            "flex flex-col h-full overflow-hidden bg-black border-r border-zinc-900 last:border-r-0 last:border-l",
            // theme.border, 
            className
        )}>
            {children}
        </div>
    );
}
