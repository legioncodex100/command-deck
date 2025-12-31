"use client";

import React from 'react';
import { Database, Eye } from 'lucide-react';
import { PillarPanel, PillarHeader, PillarBody, PillarRoadmap } from '../ui';
import { usePillarTheme } from '../PillarProvider';

interface SubstructurePillarsProps {
    pillars: string[];
    onShowVisualizer: () => void;
    className?: string; // StandardPillarLayout prop
    onClose?: () => void; // StandardPillarLayout prop
}

export function SubstructurePillars({ pillars, onShowVisualizer, className, onClose }: SubstructurePillarsProps) {
    const theme = usePillarTheme();
    const stages = ["TABLES", "RELATIONSHIPS", "INDEXES", "RLS", "FUNCTIONS"];

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
                icon={Database}
                title="Substructure"
                subtitle="PHASE 12.4 // ACTIVE"
                onClose={onClose}
            />

            <PillarBody>
                <div className="flex flex-col h-full">
                    <PillarRoadmap items={roadmapItems} className="flex-1" />

                    <div className="p-4 mt-auto shrink-0">
                        <div className={`p-3 border ${theme.border} ${theme.bg} rounded`}>
                            <button
                                onClick={onShowVisualizer}
                                className={`w-full flex items-center justify-center gap-2 p-2 ${theme.bg.replace('/20', '/40')} hover:${theme.bg.replace('/20', '/60')} border ${theme.border} rounded text-xs ${theme.text} transition-colors uppercase tracking-widest font-bold`}
                            >
                                <Eye className="h-3 w-3" /> Visualizer
                            </button>
                        </div>
                    </div>
                </div>
            </PillarBody>
        </PillarPanel>
    );
}
