"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/services/supabase";
import { CommandDeckLogo } from "@/components/branding/CommandDeckLogo";
import { Loader2 } from "lucide-react";

export default function UpdatePasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            });

            if (updateError) throw updateError;

            setSuccess(true);
            setTimeout(() => {
                router.push("/setup-profile");
            }, 2000);

        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-black font-vt323 p-6">

            {/* Background */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-0" />

            <div className="w-full max-w-md relative z-10 space-y-8">

                {/* Header */}
                <div className="flex flex-col items-center gap-4 animate-fadeIn">
                    <div className="h-16 w-auto text-emerald-500 opacity-80">
                        <CommandDeckLogo showText={false} />
                    </div>
                    <h1 className="text-2xl text-emerald-500 uppercase tracking-widest text-shadow-glow">
                        Secure Uplink
                    </h1>
                    <p className="text-emerald-900 text-sm uppercase tracking-wider font-mono">
                        Establish Personal Access Key
                    </p>
                </div>

                {/* Form */}
                <div className="bg-emerald-950/10 border border-emerald-900/50 p-8 rounded-lg backdrop-blur-sm">
                    {success ? (
                        <div className="text-center space-y-4 animate-pulse">
                            <div className="text-emerald-500 text-xl uppercase tracking-widest">
                                KEY ESTABLISHED
                            </div>
                            <div className="text-emerald-800 text-sm font-mono">
                                Redirecting to Bridge...
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleUpdate} className="space-y-6">

                            {error && (
                                <div className="bg-red-950/20 border-l-2 border-red-500 p-3 text-red-500 text-xs font-mono">
                                    &gt; ERROR: {error}
                                </div>
                            )}

                            <div className="space-y-2 group">
                                <label className="block text-emerald-700 uppercase tracking-wider text-xs font-mono group-focus-within:text-emerald-400 transition-colors">
                                    &gt; Set New Passcode:
                                </label>
                                <div className="relative flex items-center gap-2 border-b border-emerald-800 group-focus-within:border-emerald-500 transition-colors py-1">
                                    <span className="text-emerald-500 animate-pulse">_</span>
                                    <div className="relative w-full">
                                        {/* VISUAL OVERLAY */}
                                        <div className="absolute inset-0 flex items-center pointer-events-none text-emerald-500 font-mono">
                                            {password.split('').map((_, i) => (
                                                <span key={i}>*</span>
                                            ))}
                                        </div>
                                        {/* INPUT */}
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-transparent text-transparent caret-emerald-500 focus:outline-none font-mono relative z-10"
                                            autoComplete="new-password"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || password.length < 6}
                                className="w-full py-3 bg-emerald-900/30 hover:bg-emerald-500 text-emerald-500 hover:text-black border border-emerald-500/30 transition-all font-mono uppercase tracking-widest text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Encrypting...
                                    </>
                                ) : (
                                    <>
                                        <span>Confirm Key</span>
                                        <span>→</span>
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>

                <div className="text-emerald-900 text-[10px] text-center font-mono uppercase">
                    Transmission Secured via TLS v1.3
                </div>
            </div>
        </div>
    );
}
