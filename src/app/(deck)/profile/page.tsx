"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/services/supabase";
import { uploadAvatar } from "@/services/storage";
import { applyMatrixFilter } from "@/utils/imageProcessing";
import { Loader2, Camera, User, Shield, Zap, Trash2, RotateCcw, Save } from "lucide-react";
import { CommandDeckLogo } from "@/components/branding/CommandDeckLogo";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [displayName, setDisplayName] = useState("");
    const [fullName, setFullName] = useState("");

    // State to hold both versions of the uploaded file
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [filteredFile, setFilteredFile] = useState<File | null>(null);

    // 'file' is what we will actually submit
    const [file, setFile] = useState<File | null>(null);

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isFiltered, setIsFiltered] = useState(false);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }

            setEmail(user.email || "");

            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (profile) {
                setDisplayName(profile.display_name || "");
                setFullName(profile.full_name || "");
                setRole(profile.role || "CIVILIAN");

                const { data: { user: authUser } } = await supabase.auth.getUser();
                if (authUser?.user_metadata?.avatar_url) {
                    setPreviewUrl(authUser.user_metadata.avatar_url);
                }
            } else {
                setRole("CIVILIAN");
            }
        } catch (err: any) {
            console.error("Load Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];

            setOriginalFile(selectedFile);
            setLoading(true); // Short loading state for filter

            try {
                // Auto-apply filter
                const processed = await applyMatrixFilter(selectedFile);
                setFilteredFile(processed);

                // Default to filtered
                setFile(processed);
                setPreviewUrl(URL.createObjectURL(processed));
                setIsFiltered(true);
            } catch (err) {
                console.error("Auto filter failed", err);
                // Fallback to original
                setFile(selectedFile);
                setPreviewUrl(URL.createObjectURL(selectedFile));
                setIsFiltered(false);
            } finally {
                setLoading(false);
            }
        }
    };

    const toggleFilter = () => {
        if (!originalFile || !filteredFile) return;

        if (isFiltered) {
            // Switch to Original
            setFile(originalFile);
            setPreviewUrl(URL.createObjectURL(originalFile));
            setIsFiltered(false);
        } else {
            // Switch to Filtered
            setFile(filteredFile);
            setPreviewUrl(URL.createObjectURL(filteredFile));
            setIsFiltered(true);
        }
    };

    const handleRemoveAvatar = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering upload click
        setFile(null);
        setOriginalFile(null);
        setFilteredFile(null);
        setPreviewUrl(null);
        setIsFiltered(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(false);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No active session");

            let avatarUrl = previewUrl;

            // Upload new avatar if selected
            if (file) {
                const uploadedUrl = await uploadAvatar(file, user.id);
                if (uploadedUrl) avatarUrl = uploadedUrl;
            } else if (previewUrl === null) {
                // Explicit removal
                avatarUrl = null;
            }

            // Update Profile Table
            const { error: updateError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    email: user.email,
                    display_name: displayName,
                    full_name: fullName,
                    avatar_url: avatarUrl,
                    role: role as any,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'id' });

            if (updateError) throw updateError;

            // Sync with Auth Metadata
            await supabase.auth.updateUser({
                data: {
                    full_name: fullName,
                    display_name: displayName,
                    avatar_url: avatarUrl
                }
            });

            // Handle Password Update if inputs exist
            // We use standard form data access for the password fields since we didn't use state for them (to keep it clean)
            const form = e.target as HTMLFormElement;
            const newPassword = (form.elements.namedItem("new-password") as HTMLInputElement)?.value;
            const confirmPassword = (form.elements.namedItem("confirm-password") as HTMLInputElement)?.value;

            if (newPassword || confirmPassword) {
                if (newPassword !== confirmPassword) throw new Error("Passcodes do not match.");
                if (newPassword.length < 6) throw new Error("Passcode must be at least 6 chars.");

                const { updatePassword } = await import("@/app/actions/auth");
                const res = await updatePassword(newPassword);
                if (res.error) throw new Error(res.error);

                // Clear fields on success
                (form.elements.namedItem("new-password") as HTMLInputElement).value = "";
                (form.elements.namedItem("confirm-password") as HTMLInputElement).value = "";
            }

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);

            router.refresh();

        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading && !originalFile) { // Don't show full loader if just processing filter
        return (
            <div className="flex h-full items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    return (
        <div className="h-full w-full overflow-y-auto p-4 md:p-6 pb-32">
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent font-mono uppercase tracking-tight">
                            Identity Protocol
                        </h1>
                        <p className="text-zinc-500 text-sm mt-1 font-mono">
                        // Manage your credentials and clearance
                        </p>
                    </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* ID Card / Preview */}
                    <div className="md:col-span-1 space-y-4">
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 flex flex-col items-center gap-6 text-center">

                            {/* Interactive Avatar Circle */}
                            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                                <div className="h-40 w-40 rounded-full border-4 border-zinc-950 shadow-2xl overflow-hidden bg-black relative transition-all group-hover:border-emerald-500/50 ring-2 ring-zinc-800 group-hover:ring-emerald-500/30">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Avatar" className="h-full w-full object-cover transition-opacity group-hover:opacity-75" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center bg-zinc-900 text-zinc-700 transition-colors group-hover:bg-zinc-800 group-hover:text-emerald-500/50">
                                            <User className="h-16 w-16" />
                                        </div>
                                    )}

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-[2px]">
                                        <Camera className="h-8 w-8 text-white mb-2" />
                                        <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                                            UPLOAD IMAGE
                                        </span>
                                    </div>
                                </div>

                                {/* Remove Button (Floating, inside group) */}
                                {previewUrl && (
                                    <button
                                        onClick={handleRemoveAvatar}
                                        className="absolute -top-2 -right-2 p-2 bg-red-900/90 text-white rounded-full hover:bg-red-600 transition-all shadow-lg border-2 border-black opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100"
                                        title="Remove Avatar"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </div>


                            {/* Filter Toggle Control */}
                            {originalFile && (
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={toggleFilter}
                                        className={cn(
                                            "px-3 py-1.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border transition-all flex items-center gap-2",
                                            isFiltered
                                                ? "bg-emerald-950/50 text-emerald-400 border-emerald-500/50 hover:bg-emerald-900/50"
                                                : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700"
                                        )}
                                    >
                                        {isFiltered ? (
                                            <>
                                                <Zap className="h-3 w-3 fill-emerald-400" />
                                                NEURAL FILTER: ON
                                            </>
                                        ) : (
                                            <>
                                                <RotateCcw className="h-3 w-3" />
                                                ORIGINAL
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}


                            <div>
                                <div className="text-zinc-500 text-[10px] uppercase font-mono mb-0.5">Code Name</div>
                                <div className="text-white font-bold text-lg tracking-wide">{displayName || "UNKNOWN"}</div>
                                <div className="text-emerald-500 text-xs font-mono uppercase tracking-widest mt-1 flex items-center justify-center gap-1">
                                    <Shield className="h-3 w-3" />
                                    {role}
                                </div>
                            </div>
                            <div className="text-zinc-600 text-[10px] font-mono uppercase truncate w-full px-2">
                                ID: {email}
                            </div>
                        </div>
                    </div>

                    {/* Edit Form */}
                    <div className="md:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900/20 border border-zinc-800/50 rounded-lg p-6">

                            {error && (
                                <div className="bg-red-950/20 border-l-2 border-red-500 p-3 text-red-500 text-xs font-mono">
                                    &gt; ERROR: {error}
                                </div>
                            )}

                            {success && (
                                <div className="bg-emerald-950/20 border-l-2 border-emerald-500 p-3 text-emerald-500 text-xs font-mono">
                                    &gt; UPDATE SUCCESSFUL. IDENTITY SYNCED.
                                </div>
                            )}

                            {/* Full Name Input */}
                            <div className="space-y-2">
                                <label className="text-xs font-mono uppercase tracking-wider text-zinc-500">
                                    Full Name (Identity)
                                </label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                                    placeholder="JOHN DOE"
                                />
                            </div>

                            {/* Codename Input */}
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-500">
                                        Code Name
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => import("@/utils/generators").then(m => setDisplayName(m.generateCodename()))}
                                        className="text-[10px] text-emerald-600 hover:text-emerald-400 underline uppercase"
                                    >
                                        Re-Roll
                                    </button>
                                </div>

                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono uppercase"
                                    placeholder="CODENAME"
                                />
                            </div>

                            {/* Email (Read Only) */}
                            <div className="space-y-2 opacity-50">
                                <label className="text-xs font-mono uppercase tracking-wider text-zinc-500">
                                    Secured Frequency (Email)
                                </label>
                                <input
                                    type="text"
                                    value={email}
                                    disabled
                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded px-3 py-2 text-zinc-400 cursor-not-allowed font-mono"
                                />
                            </div>

                            {/* PASSWORD CHANGE SECTION */}
                            <div className="pt-6 border-t border-zinc-800/50 mt-6 space-y-4">
                                <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    Security Encryption
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-mono uppercase tracking-wider text-zinc-500">
                                            New Passcode
                                        </label>
                                        <input
                                            type="password"
                                            name="new-password"
                                            autoComplete="new-password"
                                            className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-mono uppercase tracking-wider text-zinc-500">
                                            Confirm Passcode
                                        </label>
                                        <input
                                            type="password"
                                            name="confirm-password"
                                            autoComplete="new-password"
                                            className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>


                            <div className="pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-black font-bold uppercase tracking-wider text-sm rounded transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Syncing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            <span>Save Changes</span>
                                        </>
                                    )}
                                </button>
                            </div>

                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
}
