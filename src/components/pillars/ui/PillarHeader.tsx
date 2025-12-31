"use client";

import React from 'react';
import { X, LucideIcon } from 'lucide-react';
import { usePillar, usePillarTheme } from '../PillarProvider';

interface PillarHeaderProps {
    icon?: LucideIcon;
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
    onClose?: () => void; // Optional override
}

export function PillarHeader({ icon: Icon, title, subtitle, actions, onClose }: PillarHeaderProps) {
    const { isMobileDrawer, onCloseDrawer } = usePillar();
    const theme = usePillarTheme();

    // Use the explicit onClose if provided, otherwise fallback to context drawer closer
    const handleClose = onClose || onCloseDrawer;

    return (
        <header className="p-4 flex items-center justify-between shrink-0 border-b border-zinc-900/50 bg-black/20">
            <div className="flex items-center gap-2">
                {Icon && (
                    <div className={`h-8 w-8 rounded ${theme.iconBg} border ${theme.border} flex items-center justify-center`}>
                        <Icon className={`h-4 w-4 ${theme.text}`} />
                    </div>
                )}
                <div>
                    <h2 className={`text-sm font-bold ${theme.text.replace('400', '100')} uppercase tracking-widest`}>{title}</h2>
                    {subtitle && <p className={`text-[10px] ${theme.textDim} font-mono`}>{subtitle}</p>}
                </div>
            </div>

            <div className="flex items-center gap-2">
                {actions}

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
