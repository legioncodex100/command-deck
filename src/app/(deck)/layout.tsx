import { Sidebar } from "@/components/Sidebar";
import { GlobalHeader } from "@/components/GlobalHeader";
import { DevModeOverlay } from "@/components/debug/DevModeOverlay";
import { MobileNavbar } from "@/components/MobileNavbar";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function DeckLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Profile fetching moved to client components
    if (user) {
        // We still check auth but don't need to fetch profile here for the navbar
    }

    return (
        <DevModeOverlay>
            <div className="flex h-screen w-full bg-black overflow-hidden">
                <div className="hidden lg:block shrink-0">
                    <Sidebar />
                </div>
                <div className="flex-1 flex flex-col min-w-0">
                    <MobileNavbar />
                    <main className="flex-1 bg-black px-4 pb-4 pt-[calc(env(safe-area-inset-top)+3rem+7px)] md:p-6 overflow-hidden flex flex-col mb-24 lg:mb-0">
                        <div className="w-full h-full flex flex-col bg-[#0a0a0a] rounded-xl border border-zinc-800 shadow-2xl overflow-hidden relative">
                            <GlobalHeader />
                            <div className="flex-1 overflow-hidden min-h-0 relative">
                                {children}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </DevModeOverlay>
    );
}
