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

    if (user) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        if (!profile) {
            redirect("/setup-profile");
        }
    }

    return (
        <DevModeOverlay>
            <div className="hidden lg:block">
                <Sidebar />
            </div>
            <MobileNavbar />
            <main className="flex-1 lg:ml-16 h-[calc(100vh-4rem)] lg:h-screen w-full lg:w-[calc(100vw-4rem)] bg-black p-4 md:p-6 overflow-hidden flex flex-col mb-16 lg:mb-0">
                <div className="w-full h-full flex flex-col bg-[#0a0a0a] rounded-xl border border-zinc-800 shadow-2xl overflow-hidden relative">
                    <GlobalHeader />
                    <div className="flex-1 overflow-y-auto min-h-0 relative scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                        {children}
                    </div>
                </div>
            </main>
        </DevModeOverlay>
    );
}
