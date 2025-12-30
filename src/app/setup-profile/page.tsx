"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/services/supabase";
import { CommandDeckLogo } from "@/components/branding/CommandDeckLogo";
import { uploadAvatar } from "@/services/storage"; // Import our new helper
import { Loader2, Camera, Upload, User, ChevronRight } from "lucide-react";

export default function SetupProfilePage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [fullName, setFullName] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Auto-generate codename on mount
    useEffect(() => {
        import("@/utils/generators").then(mod => {
            setDisplayName(mod.generateCodename());
        });
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No active session");

            let avatarUrl = null;
            if (file) {
                avatarUrl = await uploadAvatar(file, user.id);
            }

            // Update Profile
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    display_name: displayName,
                    full_name: fullName,
                    avatar_url: avatarUrl // Optimistically try to update
                })
                .eq('id', user.id);

            // Also update Auth Metadata
            await supabase.auth.updateUser({
                data: {
                    full_name: fullName,
                    display_name: displayName, // Store codename here too
                    avatar_url: avatarUrl
                }
            });

            if (updateError) {
                console.warn("Profile table update warning:", updateError);
            }

            router.push("/");

        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-black font-vt323 p-6 text-emerald-500">
            <div className="w-full max-w-md space-y-8 animate-fadeIn">

                {/* Header */}
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-auto opacity-80">
                        <CommandDeckLogo showText={false} />
                    </div>
                    <div>
                        <h1 className="text-2xl uppercase tracking-widest text-shadow-glow text-center">
                            Identity Protocol
                        </h1>
                        <p className="text-emerald-900 text-xs uppercase tracking-wider font-mono text-center">
                            Establish Civilian Profile
                        </p>
                    </div>
                </div>

                <div className="bg-emerald-950/10 border border-emerald-900/50 p-8 rounded-lg backdrop-blur-sm">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {error && (
                            <div className="bg-red-950/20 border-l-2 border-red-500 p-3 text-red-500 text-xs font-mono">
                                &gt; ERROR: {error}
                            </div>
                        )}

                        {/* Avatar Upload */}
                        <div className="flex flex-col items-center gap-4">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="h-24 w-24 rounded-full border-2 border-dashed border-emerald-800 hover:border-emerald-500 cursor-pointer flex items-center justify-center relative overflow-hidden group transition-all"
                            >
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                                ) : (
                                    <Camera className="h-8 w-8 text-emerald-800 group-hover:text-emerald-500 transition-colors" />
                                )}

                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Upload className="h-4 w-4 text-white" />
                                </div>
                            </div>
                            <span className="text-[10px] uppercase tracking-widest text-emerald-800">Upload Identification</span>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>

                        <div className="space-y-4">
                            {/* Full Name Input */}
                            <div className="space-y-2 group">
                                <label className="block text-emerald-700 uppercase tracking-wider text-xs font-mono group-focus-within:text-emerald-400 transition-colors">
                                    &gt; Full Name:
                                </label>
                                <div className="flex items-center gap-3 border-b border-emerald-800 py-2 group-focus-within:border-emerald-500 transition-colors">
                                    <User className="h-4 w-4 text-emerald-800" />
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full bg-transparent text-emerald-100 focus:outline-none font-mono placeholder-emerald-900"
                                        placeholder="JOHN DOE"
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {/* Codename Input */}
                            <div className="space-y-2 group">
                                <label className="block text-emerald-700 uppercase tracking-wider text-xs font-mono group-focus-within:text-emerald-400 transition-colors flex justify-between">
                                    <span>&gt; Assigned Codename:</span>
                                    <button
                                        type="button"
                                        onClick={() => import("@/utils/generators").then(m => setDisplayName(m.generateCodename()))}
                                        className="text-[10px] text-emerald-600 hover:text-emerald-400 underline"
                                    >
                                        RE-ROLL
                                    </button>
                                </label>
                                <div className="flex items-center gap-3 border-b border-emerald-800 py-2 group-focus-within:border-emerald-500 transition-colors">
                                    <span className="text-emerald-500 font-bold">#</span>
                                    <input
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        className="w-full bg-transparent text-emerald-100 focus:outline-none font-mono placeholder-emerald-900 uppercase"
                                        placeholder="CODENAME"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-emerald-900/30 hover:bg-emerald-500 text-emerald-500 hover:text-black border border-emerald-500/30 transition-all font-mono uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <span>Initialize Identity</span>
                                    <ChevronRight className="h-4 w-4" />
                                </>
                            )}
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
}
