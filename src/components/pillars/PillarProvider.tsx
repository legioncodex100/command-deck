"use client";

import React, { createContext, useContext } from 'react';
import { PillarThemeColor } from './StandardPillarLayout';

interface PillarContextType {
    themeColor: PillarThemeColor;
    isMobileDrawer: boolean;
    onCloseDrawer?: () => void;
}

const PillarContext = createContext<PillarContextType | undefined>(undefined);

interface PillarProviderProps {
    children: React.ReactNode;
    themeColor: PillarThemeColor;
    isMobileDrawer?: boolean;
    onCloseDrawer?: () => void;
}

export function PillarProvider({ children, themeColor, isMobileDrawer = false, onCloseDrawer }: PillarProviderProps) {
    return (
        <PillarContext.Provider value={{ themeColor, isMobileDrawer, onCloseDrawer }}>
            {children}
        </PillarContext.Provider>
    );
}

export function usePillar() {
    const context = useContext(PillarContext);
    if (!context) {
        throw new Error("usePillar must be used within a PillarProvider");
    }
    return context;
}

// Helper to get theme-specific classes
export function usePillarTheme() {
    const { themeColor } = usePillar();

    const colors = {
        emerald: {
            border: 'border-emerald-500/20',
            bg: 'bg-emerald-950/20',
            text: 'text-emerald-400',
            textDim: 'text-emerald-500/60',
            iconBg: 'bg-emerald-900/20',
            scrollbar: 'scrollbar-thumb-emerald-900/50',
            hoverBorder: 'hover:border-emerald-500/30'
        },
        blue: {
            border: 'border-blue-500/20',
            bg: 'bg-blue-950/20',
            text: 'text-blue-400',
            textDim: 'text-blue-500/60',
            iconBg: 'bg-blue-900/20',
            scrollbar: 'scrollbar-thumb-blue-900/50',
            hoverBorder: 'hover:border-blue-500/30'
        },
        indigo: {
            border: 'border-indigo-500/20',
            bg: 'bg-indigo-950/20',
            text: 'text-indigo-400',
            textDim: 'text-indigo-500/60',
            iconBg: 'bg-indigo-900/20',
            scrollbar: 'scrollbar-thumb-indigo-900/50',
            hoverBorder: 'hover:border-indigo-500/30'
        },
        purple: {
            border: 'border-purple-500/20',
            bg: 'bg-purple-950/20',
            text: 'text-purple-400',
            textDim: 'text-purple-500/60',
            iconBg: 'bg-purple-900/20',
            scrollbar: 'scrollbar-thumb-purple-900/50',
            hoverBorder: 'hover:border-purple-500/30'
        },
        amber: {
            border: 'border-amber-500/20',
            bg: 'bg-amber-950/20',
            text: 'text-amber-400',
            textDim: 'text-amber-500/60',
            iconBg: 'bg-amber-900/20',
            scrollbar: 'scrollbar-thumb-amber-900/50',
            hoverBorder: 'hover:border-amber-500/30'
        },
        rose: {
            border: 'border-rose-500/20',
            bg: 'bg-rose-950/20',
            text: 'text-rose-400',
            textDim: 'text-rose-500/60',
            iconBg: 'bg-rose-900/20',
            scrollbar: 'scrollbar-thumb-rose-900/50',
            hoverBorder: 'hover:border-rose-500/30'
        }
    };

    return { ...colors[themeColor], color: themeColor };
}
