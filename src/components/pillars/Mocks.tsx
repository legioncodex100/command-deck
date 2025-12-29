
import React from 'react';

// Shared Placeholder Component
const PillarPlaceholder = ({ name, letter }: { name: string, letter: string }) => (
    <div className="h-full w-full flex flex-col items-center justify-center bg-black text-emerald-500/50 p-12 text-center">
        <div className="text-[120px] font-bold opacity-10 leading-none">{letter}</div>
        <h2 className="text-2xl font-bold mt-4 uppercase tracking-widest text-emerald-400">{name}</h2>
        <p className="mt-2 text-sm text-zinc-500 max-w-md">
            This workbench is currently under construction.
            Initialize the <strong>{name}</strong> sequence to begin.
        </p>
    </div>
);

export const DiscoveryLab = () => <PillarPlaceholder name="Discovery Lab" letter="A" />;
export const StrategyRoom = () => <PillarPlaceholder name="Strategy Room" letter="B" />;
export const SubstructureArchitect = () => <PillarPlaceholder name="Substructure Architect" letter="C" />;
export const DesignStudio = () => <PillarPlaceholder name="Design Studio" letter="D" />;
export const PlanningHub = () => <PillarPlaceholder name="Planning Hub" letter="E" />;
export const ConstructionFactory = () => <PillarPlaceholder name="Construction Factory" letter="F" />;
export const IntegrationBridge = () => <PillarPlaceholder name="Integration Bridge" letter="G" />;
export const StructuralAuditor = () => <PillarPlaceholder name="Structural Auditor" letter="H" />;
export const ContextBridge = () => <PillarPlaceholder name="Context Bridge" letter="I" />;
export const DocumentationEngine = () => <PillarPlaceholder name="Documentation Engine" letter="J" />;
export const MissionMural = () => <PillarPlaceholder name="Mission Mural" letter="K" />;
