
import React from 'react';
import { Rocket, Box, Brain, Cpu, Database, FileText, Layers, Layout, ShieldCheck, GitBranch } from 'lucide-react';

const Card = ({ title, icon: Icon, desc, status }: any) => (
    <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-emerald-500/30 transition-all group flex flex-col gap-3">
        <div className="flex justify-between items-start">
            <div className="p-2 rounded bg-zinc-900 group-hover:bg-emerald-950/30 transition-colors">
                <Icon className="h-5 w-5 text-zinc-500 group-hover:text-emerald-400" />
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${status === 'Active' ? 'bg-emerald-950 text-emerald-400 border-emerald-900' : 'bg-zinc-900 text-zinc-600 border-zinc-800'
                }`}>
                {status}
            </span>
        </div>
        <div>
            <h3 className="text-sm font-bold text-zinc-300 group-hover:text-emerald-300">{title}</h3>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{desc}</p>
        </div>
    </div>
);

export default function MissionControl() {
    const steps = [
        { title: "Discovery Lab", icon: Rocket, status: "Active", desc: "Define Business Intent & User Needs." },
        { title: "Strategy Room", icon: Brain, status: "Active", desc: "Establish Technical Directive." },
        { title: "Substruct. Architect", icon: Database, status: "Active", desc: "Design SQL Schema & RLS." },
        { title: "Design Studio", icon: Layout, status: "Active", desc: "Synthesize Visual DNA & UI Tokens." },
        { title: "Planning Hub", icon: Layers, status: "Active", desc: "Breakdown Roadmap to Backlog." },
        { title: "Construction Factory", icon: Cpu, status: "Active", desc: "Generate Pilot Scripts & Code." },
        { title: "Integration Bridge", icon: GitBranch, status: "Pending", desc: "Zero-Paste Sync to Local Disk." },
        { title: "Structural Auditor", icon: ShieldCheck, status: "Pending", desc: "Enforce SLS & Integrity." },
        { title: "Documentation", icon: FileText, status: "Pending", desc: "Auto-Generate Technical Specs." },
    ];

    return (
        <div className="h-full w-full p-8 overflow-y-auto bg-black">
            <div className="max-w-5xl mx-auto">
                <header className="mb-8 border-b border-zinc-800 pb-6">
                    <h1 className="text-2xl font-bold text-white tracking-tight">Mission Control</h1>
                    <p className="text-zinc-500 mt-2 text-sm font-mono">System Integrity: 100% // All Systems Nominal</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {steps.map((s) => <Card key={s.title} {...s} />)}
                </div>
            </div>
        </div>
    );
}
