"use client";

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { PillarProvider } from './PillarProvider';

export type PillarThemeColor = 'emerald' | 'indigo' | 'purple' | 'amber' | 'blue' | 'rose';

interface StandardPillarLayoutProps {
    leftContent: React.ReactNode;
    mainContent: React.ReactNode;
    rightContent: React.ReactNode;
    themeColor: PillarThemeColor;
    className?: string;
}

export default function StandardPillarLayout({
    leftContent,
    mainContent,
    rightContent,
    themeColor,
    className
}: StandardPillarLayoutProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const activeDrawer = searchParams.get('mobile_view'); // 'roadmap' | 'artifacts' | null

    const closeDrawer = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('mobile_view');
        router.replace(`?${params.toString()}`);
    };

    // Theme Mappings
    const borderColor = {
        emerald: 'border-emerald-500/20',
        indigo: 'border-indigo-500/20',
        purple: 'border-purple-500/20',
        amber: 'border-amber-500/20',
        blue: 'border-blue-500/20',
        rose: 'border-rose-500/20',
    }[themeColor];

    const scrollbarColor = {
        emerald: 'scrollbar-thumb-emerald-900/50',
        indigo: 'scrollbar-thumb-indigo-900/50',
        purple: 'scrollbar-thumb-purple-900/50',
        amber: 'scrollbar-thumb-amber-900/50',
        blue: 'scrollbar-thumb-blue-900/50',
        rose: 'scrollbar-thumb-rose-900/50',
    }[themeColor];

    return (
        <PillarProvider themeColor={themeColor} isMobileDrawer={!!activeDrawer} onCloseDrawer={closeDrawer}>
            <div className={cn("h-full w-full relative flex lg:grid lg:grid-cols-12 gap-0 bg-black text-zinc-300 font-mono overflow-hidden", className)}>

                {/* Mobile Overlay Backdrop */}
                {activeDrawer && (
                    <div
                        className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                        onClick={closeDrawer}
                    />
                )}

                {/* Left Panel: Roadmap/Context (Drawer on Mobile, Col 1-3 on Desktop) */}
                <div className={cn(
                    "transition-transform duration-300 ease-in-out z-50 flex flex-col overflow-hidden bg-[#020402] max-h-full min-h-0",
                    // Desktop
                    "lg:col-span-3 lg:static lg:translate-x-0 lg:w-auto lg:border-r",
                    borderColor,
                    // Mobile
                    "fixed inset-y-0 left-0 w-[85vw] border-r border-zinc-800",
                    activeDrawer === 'roadmap' ? "translate-x-0" : "-translate-x-full"
                )}>
                    {/* Clone element to inject onClose if it's a valid React element */}
                    {React.isValidElement(leftContent)
                        ? React.cloneElement(leftContent as React.ReactElement<any>, {
                            onClose: closeDrawer,
                            className: cn("h-full flex flex-col", (leftContent as React.ReactElement<any>).props.className)
                        })
                        : leftContent
                    }
                </div>

                {/* Center Panel: Chat/Main (Always Visible, Full Width on Mobile, Col 4-9 on Desktop) */}
                <div className="lg:col-span-6 w-full h-full z-0 flex flex-col relative bg-black border-r border-zinc-900/50 overflow-hidden min-h-0 max-h-full">
                    {React.isValidElement(mainContent)
                        ? React.cloneElement(mainContent as React.ReactElement<any>, {
                            className: cn("h-full w-full", (mainContent as React.ReactElement<any>).props.className)
                        })
                        : mainContent
                    }
                </div>

                {/* Right Panel: Artifacts/Tools (Drawer on Mobile, Col 10-12 on Desktop) */}
                <div className={cn(
                    "transition-transform duration-300 ease-in-out z-50 flex flex-col overflow-hidden bg-[#050505] max-h-full min-h-0",
                    // Desktop
                    "lg:col-span-3 lg:static lg:translate-x-0 lg:w-auto lg:border-l",
                    borderColor,
                    // Mobile
                    "fixed inset-y-0 right-0 w-[85vw] border-l border-zinc-800",
                    activeDrawer === 'artifacts' ? "translate-x-0" : "translate-x-full"
                )}>
                    {/* Clone element to inject onClose if it's a valid React element */}
                    {React.isValidElement(rightContent)
                        ? React.cloneElement(rightContent as React.ReactElement<any>, {
                            onClose: closeDrawer,
                            className: cn("h-full flex flex-col", (rightContent as React.ReactElement<any>).props.className)
                        })
                        : rightContent
                    }
                </div>
            </div>
        </PillarProvider>
    );
}
