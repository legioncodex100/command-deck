"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { HangarSidebar } from '@/components/dev/HangarSidebar';
import { MobileNavbar } from '@/components/MobileNavbar';
import { supabase } from "@/services/supabase";

const ADMIN_EMAIL = 'mohammed@legiongrappling.com';

export default function HangarLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
        const checkAccess = async () => {
            if (loading) return;

            if (!user) {
                router.push('/');
                return;
            }

            // 1. Check Email Hardcode
            if (user.email === ADMIN_EMAIL) {
                setIsAuthorized(true);
                setCheckingAuth(false);
                return;
            }

            // 2. Check Role in DB
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profile?.role === 'ADMIN' || profile?.role === 'COMMANDER') {
                setIsAuthorized(true);
            } else {
                router.push('/');
            }
            setCheckingAuth(false);
        };

        checkAccess();
    }, [user, loading, router]);

    if (loading || checkingAuth) {
        return (
            <div className="h-screen w-full bg-black flex items-center justify-center text-zinc-500 font-mono">
                <Loader2 className="h-6 w-6 animate-spin mr-3" />
                VERIFYING CLEARANCE...
            </div>
        );
    }

    if (!isAuthorized) return null;

    return (
        <div className="h-screen w-screen bg-black overflow-hidden flex flex-col lg:flex-row">
            {/* Desktop Sidebar (Hidden on Mobile) */}
            <div className="hidden lg:block">
                <HangarSidebar />
            </div>

            {/* Mobile Navigation */}
            <MobileNavbar mode="hangar" />

            {/* Main Content Area (Universal Style) */}
            <main className="flex-1 lg:ml-16 h-[calc(100dvh-5rem)] lg:h-screen w-full lg:w-[calc(100vw-4rem)] bg-black md:p-6 overflow-hidden flex flex-col mb-20 lg:mb-0">
                <div className="w-full h-full flex flex-col bg-[#0a0a0a] rounded-none md:rounded-xl border-x-0 md:border border-zinc-900 md:border-zinc-800 shadow-2xl overflow-hidden relative">
                    {children}
                </div>
            </main>
        </div>
    );
}

