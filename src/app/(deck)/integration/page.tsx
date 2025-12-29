"use client";

import { Pillar_G_Integration } from "@/components/pillars/Pillar_G_Integration";
import { useRouter } from "next/navigation";

export default function IntegrationPage() {
    const router = useRouter();

    return (
        <div className="h-[calc(100vh-3.5rem)] bg-[#020402] text-zinc-100 overflow-hidden">
            <Pillar_G_Integration
                onComplete={() => console.log("Phase G Complete")}
            />
        </div>
    );
}
