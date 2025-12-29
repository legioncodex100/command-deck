"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface DevModeContextType {
    isDevMode: boolean;
    toggleDevMode: () => void;
    debugFlags: {
        showContextInspector: boolean;
        showSLSScanner: boolean;
        showRippleTrigger: boolean;
        staleSimulation: boolean;
        xRayMode: boolean;
    };
    setDebugFlags: React.Dispatch<React.SetStateAction<{
        showContextInspector: boolean;
        showSLSScanner: boolean;
        showRippleTrigger: boolean;
        staleSimulation: boolean;
        xRayMode: boolean;
    }>>;
    selectedElement: {
        component: string | null;
        tag: string;
        id?: string;
        classes?: string;
    } | null;
    setSelectedElement: (info: { component: string | null; tag: string; id?: string; classes?: string; } | null) => void;
}

const DevModeContext = createContext<DevModeContextType | undefined>(undefined);

export function DevModeProvider({ children }: { children: ReactNode }) {
    const [isDevMode, setIsDevMode] = useState(false);
    const [debugFlags, setDebugFlags] = useState({
        showContextInspector: false,
        showSLSScanner: true,
        showRippleTrigger: false,
        staleSimulation: false,
        xRayMode: false,
    });
    const [selectedElement, setSelectedElement] = useState<{
        component: string | null;
        tag: string;
        id?: string;
        classes?: string;
    } | null>(null);

    const toggleDevMode = () => setIsDevMode(prev => !prev);

    // Keyboard Listener: Cmd + Shift + D
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'd') {
                e.preventDefault();
                toggleDevMode();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <DevModeContext.Provider value={{ isDevMode, toggleDevMode, debugFlags, setDebugFlags, selectedElement, setSelectedElement }}>
            {children}
        </DevModeContext.Provider>
    );
}

export function useDevMode() {
    const context = useContext(DevModeContext);
    if (context === undefined) {
        throw new Error('useDevMode must be used within a DevModeProvider');
    }
    return context;
}
