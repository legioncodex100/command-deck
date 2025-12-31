"use client";

import React from 'react';
import { Brain, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PillarPanel, PillarHeader, PillarBody, PillarCard } from '../ui';
import { usePillarTheme } from '../PillarProvider';

interface StrategyDirectivesProps {
    pillars: string[];
    currentPRDTitle?: string;
    className?: string; // StandardPillarLayout prop
    onClose?: () => void; // StandardPillarLayout prop
}

export function StrategyDirectives({ pillars, currentPRDTitle, className, onClose }: StrategyDirectivesProps) {
    const theme = usePillarTheme();

    const PillarItem = ({ label, done }: { label: string, done: boolean }) => (
        <div className={`p-3 border-l-2 flex items-center justify-between transition-colors ${done ? `${theme.bg} ${theme.border}` : 'bg-transparent border-zinc-800'}`}>
            <span className={`text-xs font-mono font-bold tracking-wider ${done ? theme.text : 'text-zinc-600'}`}>{label}</span>
            {done && <ShieldCheck className={`h-4 w-4 ${theme.text}`} />}
        </div>
    );

    return (
        <PillarPanel className={className}>
            <PillarHeader
                icon={Brain}
                title="Strategy Room"
                subtitle="PHASE 12.3 // ACTIVE"
                onClose={onClose}
            />

            <PillarBody>
                <div className="px-4 py-4 flex flex-col gap-1">
                    {["TENANCY", "STATE", "BOUNDARIES", "PRIVACY", "INFRASTRUCTURE"].map(p => (
                        <PillarItem key={p} label={p} done={pillars.some(active => active.toUpperCase() === p.toUpperCase())} />
                    ))}
                </div>

                <div className="p-4 mt-auto shrink-0">
                    <div className={`p-3 border ${theme.border.replace('blue', theme.text.split('-')[1])} ${theme.bg} rounded`}>
                        <div className={`text-[10px] ${theme.textDim} font-bold mb-1 uppercase`}>Context Link</div>
                        <div className={`text-xs ${theme.text} truncate`}>{currentPRDTitle || 'No PRD Linked'}</div>
                    </div>
                </div>
            </PillarBody>
        </PillarPanel>
    );
}
