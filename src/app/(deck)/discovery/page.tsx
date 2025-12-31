import { Suspense } from 'react';
import Pillar_A_Discovery from "@/components/pillars/Pillar_A_Discovery";

export default function DiscoveryPage() {
    return (
        <Suspense fallback={<div className="h-full w-full bg-black flex items-center justify-center text-emerald-500 font-mono text-xs">INITIALIZING DISCOVERY LAB...</div>}>
            <Pillar_A_Discovery />
        </Suspense>
    );
}
