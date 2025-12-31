'use client';

import StandardPillarLayout from '../pillars/StandardPillarLayout';
import { PillarPanel, PillarHeader, PillarBody } from '../pillars/ui';
import AgentGrid from '@/app/(hangar)/hangar/ai/_components/AgentGrid';
import { AICrewMember } from '@/services/crew';
import { Bot, Cpu, Activity, ShieldCheck } from 'lucide-react';

interface HangarSyntheticProps {
    crew: AICrewMember[];
    activeCount: number;
    reserveCount: number;
}

export default function HangarSynthetic({ crew, activeCount, reserveCount }: HangarSyntheticProps) {
    const FleetStatus = (
        <PillarPanel>
            <PillarHeader title="Fleet Status" icon={Activity} />
            <PillarBody>
                <div className="p-4 space-y-6">
                    <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
                        <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Active Units</div>
                        <div className="text-3xl font-bold text-emerald-400 font-mono">{activeCount}</div>
                    </div>
                    <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
                        <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Reserve Units</div>
                        <div className="text-3xl font-bold text-zinc-500 font-mono">{reserveCount}</div>
                    </div>

                    <div className="pt-4 border-t border-zinc-800">
                        <h4 className="text-xs font-bold text-emerald-600 uppercase mb-3">System Health</h4>
                        <div className="space-y-2 text-xs font-mono text-zinc-400">
                            <div className="flex justify-between">
                                <span>Neural Link</span>
                                <span className="text-emerald-500">OPTIMAL</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Memory Banks</span>
                                <span className="text-emerald-500">92% FREE</span>
                            </div>
                            <div className="flex justify-between">
                                <span>API Latency</span>
                                <span className="text-emerald-500">42ms</span>
                            </div>
                        </div>
                    </div>
                </div>
            </PillarBody>
        </PillarPanel>
    );

    const OperationsPanel = (
        <PillarPanel>
            <PillarHeader title="Operations" icon={Cpu} />
            <PillarBody>
                <div className="p-6 text-center text-zinc-600 text-xs italic">
                    <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    Automated Maintenance Protocols Active
                </div>
            </PillarBody>
        </PillarPanel>
    );

    return (
        <StandardPillarLayout
            themeColor="emerald"
            leftContent={FleetStatus}
            mainContent={
                <div className="h-full flex flex-col">
                    {/* Inject padding for scroll if needed, but AgentGrid handles its own scrolling/layout usually. 
                        AgentGrid in its current form is a page-level grid. 
                        We need to wrap it in a scrollable container if it doesn't have one.
                    */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
                        <AgentGrid crew={crew} />
                    </div>
                </div>
            }
            rightContent={OperationsPanel}
        />
    );
}
