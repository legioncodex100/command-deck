"use client";

import React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PillarPanel, PillarHeader, PillarBody } from '../ui';
import { PillarRoadmap } from '../ui/PillarRoadmap';
import { usePillarTheme } from '../PillarProvider';

interface DiscoveryRoadmapProps {
    phases: string[];
    className?: string; // For compatibility
    onClose?: () => void;
}

export function DiscoveryRoadmap({ phases, className, onClose }: DiscoveryRoadmapProps) {
    const theme = usePillarTheme();
    const roadmapItems = ["VISION", "AUDIENCE", "LOGIC", "FEATURES", "EDGE_CASES"].map(label => ({
        id: label,
        label,
        status: phases.some(p => p.toUpperCase() === label.toUpperCase()) ? 'COMPLETED' as const : 'PENDING' as const
    }));

    // Logic to determine "Current" active item (first pending, or all completed)
    // Actually, in the image, "active" seems to imply the *current phase being worked on*.
    // For now, let's treat "COMPLETED" items as active style for consistency with "phases done".
    // Or we can assume the last "done" one is active?
    // Let's stick to the user's logic: if it's in the list, it's done. 
    // Wait, the user image shows all items. "Active" might mean the pillar itself is active.
    // I will map 'phases' (which are completed phases) to COMPLETED. 
    // And possibly highlight the *next* one as ACTIVE? 
    // Let's simpler: If it's in `phases`, it's COMPLETED. 
    // Use `phases` to determine status.

    // Improved Status Logic:
    // If "VISION" is in phases -> COMPLETED.
    // If "VISION" is NOT in phases, but it's the first one not done -> ACTIVE.
    // Others -> PENDING.

    const strategies = ["VISION", "AUDIENCE", "LOGIC", "FEATURES", "EDGE_CASES"];
    const mappedItems = strategies.map((label, index) => {
        const isDone = phases.some(p => p.toUpperCase() === label.toUpperCase());
        const isNext = !isDone && (index === 0 || phases.some(p => p.toUpperCase() === strategies[index - 1].toUpperCase()));

        return {
            id: label,
            label,
            status: isDone ? 'COMPLETED' : (isNext ? 'ACTIVE' : 'PENDING') as 'COMPLETED' | 'ACTIVE' | 'PENDING'
        };
    });

    return (
        <PillarPanel className={className}>
            <PillarHeader
                icon={Sparkles}
                title="Discovery Lab"
                subtitle="PHASE 12.2 // ACTIVE"
                onClose={onClose}
            />
            <PillarBody>
                <PillarRoadmap items={mappedItems} />
            </PillarBody>
        </PillarPanel>
    );
}
