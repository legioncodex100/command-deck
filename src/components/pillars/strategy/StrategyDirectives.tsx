"use client";

import React from 'react';
import { Brain, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PillarPanel, PillarHeader, PillarBody, PillarCard, PillarRoadmap } from '../ui';
import { usePillarTheme } from '../PillarProvider';

interface StrategyDirectivesProps {
    pillars: string[];
    currentPRDTitle?: string;
    className?: string; // StandardPillarLayout prop
    onClose?: () => void; // StandardPillarLayout prop
}

export function StrategyDirectives({ pillars, currentPRDTitle, className, onClose }: StrategyDirectivesProps) {
    const theme = usePillarTheme();

    const pillarsList = ["TENANCY", "STATE", "BOUNDARIES", "PRIVACY", "INFRASTRUCTURE"];
    const roadmapItems = pillarsList.map((label, index) => {
        const isDone = pillars.some(p => p.toUpperCase() === label.toUpperCase());
        const isNext = !isDone && (index === 0 || pillars.some(p => p.toUpperCase() === pillarsList[index - 1].toUpperCase()));

        return {
            id: label,
            label,
            status: isDone ? 'COMPLETED' : (isNext ? 'ACTIVE' : 'PENDING') as 'COMPLETED' | 'ACTIVE' | 'PENDING'
        };
    });

    return (
        <PillarPanel className={className}>
            <PillarHeader
                icon={Brain}
                title="Strategy Room"
                subtitle="PHASE 12.3 // ACTIVE"
                onClose={onClose}
            />

            <PillarBody>
                <div className="flex flex-col h-full">
                    <PillarRoadmap items={roadmapItems} className="flex-1" />

                    <div className="p-4 shrink-0 mt-auto">
                        <div className={`p-3 border ${theme.border} ${theme.bg} rounded`}>
                            <div className={`text-[10px] ${theme.textDim} font-bold mb-1 uppercase`}>Context Link</div>
                            <div className={`text-xs ${theme.text} truncate`}>{currentPRDTitle || 'No PRD Linked'}</div>
                        </div>
                    </div>
                </div>
            </PillarBody>
        </PillarPanel>
    );
}
