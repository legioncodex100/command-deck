"use client";

import React from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PillarPanel, PillarHeader, PillarBody, PillarRoadmap } from '../ui';
import { usePillarTheme } from '../PillarProvider';

interface DesignDirectivesProps {
    pillars: string[];
    staleState: { isStale: boolean; reason?: string | null };
    className?: string; // StandardPillarLayout prop
    onClose?: () => void; // StandardPillarLayout prop
}

export function DesignDirectives({ pillars, staleState, className, onClose }: DesignDirectivesProps) {
    const theme = usePillarTheme();

    const stages = ["PALETTE", "TYPOGRAPHY", "COMPONENTS", "LAYOUTS", "INTERACTIONS"];
    const roadmapItems = stages.map((label, index) => {
        const isDone = pillars.some(p => p.toUpperCase() === label.toUpperCase());
        const isNext = !isDone && (index === 0 || pillars.some(p => p.toUpperCase() === stages[index - 1].toUpperCase()));

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
                title="Design Studio"
                subtitle="PHASE 12.5 // ACTIVE"
                onClose={onClose}
            />

            {staleState.isStale && (
                <div className="mx-4 mt-2 px-3 py-2 text-[9px] bg-amber-950/20 border border-amber-500/20 text-amber-500 flex items-center gap-2 rounded">
                    <AlertCircle className="h-3 w-3" />
                    <span className="font-bold uppercase tracking-wider">Input Updated</span>
                </div>
            )}

            <PillarBody>
                <div className="flex flex-col h-full">
                    <PillarRoadmap items={roadmapItems} className="flex-1" />
                </div>
            </PillarBody>
        </PillarPanel>
    );
}
