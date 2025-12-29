"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { HangarSidebar } from '@/components/dev/HangarSidebar';

const ADMIN_EMAIL = 'mohammed@legiongrappling.com';

export default function HangarLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user || user.email !== ADMIN_EMAIL) {
                // Access Denied - Redirect to Deck
                router.push('/');
            }
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="h-screen w-full bg-black flex items-center justify-center text-zinc-500 font-mono">
                <Loader2 className="h-6 w-6 animate-spin mr-3" />
                VERIFYING CLEARANCE...
            </div>
        );
    }

    if (!user || user.email !== ADMIN_EMAIL) return null; // Prevent flash

    return (
        <div className="h-screen w-screen bg-black overflow-hidden flex">
            <HangarSidebar />
            <main className="flex-1 h-full overflow-hidden bg-[#050505] pl-16">
                {children}
            </main>
        </div>
    );
}
