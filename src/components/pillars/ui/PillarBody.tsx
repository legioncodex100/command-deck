"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { usePillarTheme } from '../PillarProvider';

interface PillarBodyProps {
    children: React.ReactNode;
    className?: string; // For padding overrides
    scrollable?: boolean; // Default true
}

export function PillarBody({ children, className, scrollable = true }: PillarBodyProps) {
    const theme = usePillarTheme();

    return (
        <div className={cn(
            "flex-1 min-h-0 relative", // min-h-0 is critical for flex child scrolling
            scrollable && `overflow-y-auto scrollbar-thin ${theme.scrollbar}`,
            !scrollable && "overflow-hidden",
            className
        )}>
            {children}
        </div>
    );
}
