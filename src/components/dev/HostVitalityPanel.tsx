"use client";

import React from 'react';
import { Activity } from 'lucide-react';
import { PillarPanel, PillarHeader, PillarBody } from '@/components/pillars/ui';

export function HostVitalityPanel({ className }: { className?: string }) {
    return (
        <PillarPanel className={className}>
            <PillarHeader
                icon={Activity}
                title="HOST VITALITY"
                subtitle="System Status"
            />
            <PillarBody>
                <div className="p-4 space-y-4">
                    <div className="p-4 rounded bg-zinc-900/30 border border-zinc-800/50">
                        <div className="space-y-3 font-mono">
                            <div className="flex justify-between text-xs">
                                <span className="text-zinc-500 uppercase tracking-wider">Core ID</span>
                                <span className="text-emerald-500 font-bold">CONNECTED</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-zinc-500 uppercase tracking-wider">Memory</span>
                                <span className="text-zinc-300">RW-READY</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-zinc-500 uppercase tracking-wider">Uplink</span>
                                <span className="text-emerald-500 animate-pulse">ACTIVE</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded bg-zinc-900/30 border border-zinc-800/50">
                        <h4 className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">Active Protocol</h4>
                        <div className="text-sm text-zinc-300 font-bold">
                            EVOLUTION MODE
                        </div>
                    </div>
                </div>
            </PillarBody>
        </PillarPanel>
    );
}
