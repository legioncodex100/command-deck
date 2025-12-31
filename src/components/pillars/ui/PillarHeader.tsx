"use client";

import React from 'react';
import { X, LucideIcon, Menu, PanelRight } from 'lucide-react';
import { usePillar, usePillarTheme } from '../PillarProvider';

interface PillarHeaderProps {
    icon?: LucideIcon;
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
    onClose?: () => void; // Optional override
    onToggleLeft?: () => void;
    onToggleRight?: () => void;
}

export function PillarHeader({ icon: Icon, title, subtitle, actions, onClose, onToggleLeft, onToggleRight }: PillarHeaderProps) {
    const { isMobileDrawer, onCloseDrawer } = usePillar();
    // const theme = usePillarTheme(); // Header is now neutral standard (Zinc)

    // Use the explicit onClose if provided, otherwise fallback to context drawer closer
    const handleClose = onClose || onCloseDrawer;

    return (
        <header className="p-3 flex items-center justify-between shrink-0 border-b border-zinc-900 bg-zinc-950/50">
            <div className="flex items-center gap-2 pl-2">
                {/* Mobile Left Toggle */}
                {onToggleLeft && !isMobileDrawer && (
                    <button onClick={onToggleLeft} className="lg:hidden p-1 mr-1 text-zinc-500 hover:text-white">
                        <Menu className="h-5 w-5" />
                    </button>
                )}

                {Icon && <Icon className="h-4 w-4 text-zinc-500" />}
                <div>
                    <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        {title}
                    </h2>
                    {subtitle && <p className="text-[10px] text-zinc-600 font-mono">{subtitle}</p>}
                </div>
            </div>

            <div className="flex items-center gap-3">
                {actions}

                {/* Mobile Right Toggle */}
                {onToggleRight && !isMobileDrawer && (
                    <button onClick={onToggleRight} className="lg:hidden p-1 text-zinc-500 hover:text-white">
                        <PanelRight className="h-5 w-5" />
                    </button>
                )}

                {/* Mobile Close Button - Only show if in a drawer */}
                {isMobileDrawer && handleClose && (
                    <button onClick={handleClose} className="lg:hidden p-2 text-zinc-500 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>
        </header>
    );
}
