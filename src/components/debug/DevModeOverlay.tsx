"use client";

import React from 'react';
import { useDevMode } from '@/hooks/DevModeContext';
import { AlertTriangle, Terminal, Eye, Activity, LayoutDashboard, MousePointerClick } from 'lucide-react';
import { DebugPanel } from './DebugPanel';
import { useEffect } from 'react';

export function DevModeOverlay({ children }: { children: React.ReactNode }) {
    const { isDevMode, toggleDevMode, debugFlags, setDebugFlags, setSelectedElement } = useDevMode();

    // --- React Fiber Traversal to find component name ---
    const getComponentName = (node: any): string | null => {
        // 1. Try to find the internal React Fiber key on the DOM node
        const fiberKey = Object.keys(node).find(key => key.startsWith('__reactFiber$'));

        if (fiberKey) {
            let fiber = node[fiberKey];

            // Traverse up the return path to find a named component
            while (fiber) {
                if (fiber.type && typeof fiber.type === 'function' && fiber.type.name) {
                    return fiber.type.name;
                }
                if (fiber.type && typeof fiber.type === 'object' && fiber.type.displayName) {
                    return fiber.type.displayName;
                }
                fiber = fiber.return;
            }
        }
        return null;
    };

    useEffect(() => {
        if (!isDevMode || !debugFlags.xRayMode) return;

        const handleClick = (e: MouseEvent) => {
            if (e.target && e.shiftKey) { // Require Shift+Click to avoid breaking UI interactions completely
                e.preventDefault();
                e.stopPropagation();

                const target = e.target as HTMLElement;
                const componentName = getComponentName(target);

                setSelectedElement({
                    component: componentName,
                    tag: target.tagName.toLowerCase(),
                    id: target.id || undefined,
                    classes: target.className && typeof target.className === 'string' ? target.className : undefined
                });
            }
        };

        window.addEventListener('click', handleClick, true); // Capture phase
        return () => window.removeEventListener('click', handleClick, true);
    }, [isDevMode, debugFlags.xRayMode, setSelectedElement]);

    if (!isDevMode) return <>{children}</>;

    return (
        <div className="relative w-full h-full">
            {/* X-Ray Mode Data Attribute for CSS targeting if needed, or just inline styles */}
            {debugFlags.xRayMode && (
                <style>{`
                    * {
                        outline: 1px solid rgba(16, 185, 129, 0.2) !important; /* Emerald-500 @ 20% */
                    }
                    div:hover {
                        outline: 1px solid rgba(16, 185, 129, 0.8) !important;
                        background-color: rgba(16, 185, 129, 0.05);
                    }
                `}</style>
            )}

            {/* Amber Border Overlay */}
            <div className="absolute inset-0 border-[3px] border-amber-500 pointer-events-none z-50 animate-pulse-slow" />

            {/* Dev Mode Badge */}
            <div className="absolute top-0 right-1/2 translate-x-1/2 bg-amber-500 text-black px-3 py-1 rounded-b font-mono text-[10px] font-bold tracking-widest z-50 shadow-lg shadow-amber-900/20 flex items-center gap-2">
                <AlertTriangle className="h-3 w-3" />
                DEVELOPER MODE // HOST DEBUGGER
            </div>

            {/* Debug Panel Toggle (Floating) */}
            <div className="absolute bottom-4 right-4 z-50 flex flex-col gap-2">
                <button
                    onClick={() => setDebugFlags(prev => ({ ...prev, staleSimulation: !prev.staleSimulation }))}
                    className={`p-2 rounded-full border shadow-xl transition-all ${debugFlags.staleSimulation ? 'bg-amber-600 border-amber-400 text-black' : 'bg-black border-zinc-800 text-zinc-500 hover:text-amber-500'}`}
                    title="Simulate Stale State (Ripple)"
                >
                    <Activity className="h-4 w-4" />
                </button>
                <button
                    onClick={() => setDebugFlags(prev => ({ ...prev, showContextInspector: !prev.showContextInspector }))}
                    className={`p-2 bg-black border rounded-full shadow-xl transition-all ${debugFlags.showContextInspector ? 'border-amber-500 text-amber-500' : 'border-amber-500/30 text-amber-500/50 hover:text-amber-500'}`}
                    title="Toggle Debug Panel"
                >
                    <Terminal className="h-4 w-4" />
                </button>
            </div>

            {children}

            {/* Conditionally Render Debug Panel */}
            {debugFlags.showContextInspector && <DebugPanel />}
        </div>
    );
}
