"use client";

import { useState, useEffect } from "react";
import { Users, UserPlus, Shield, Mail, Search, Trash2, RefreshCw, Send } from "lucide-react";
import { inviteCivilian, resendInvite } from "@/app/actions/admin";
import { supabase } from "@/services/supabase";
import { Profile } from "@/types/database";

export function HangarCivilians() {
    const [email, setEmail] = useState("");
    const [inviting, setInviting] = useState(false);
    const [status, setStatus] = useState("");
    const [civilians, setCivilians] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [resendingEmail, setResendingEmail] = useState<string | null>(null);

    const loadCivilians = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setCivilians(data as Profile[]);
        setLoading(false);
    };

    useEffect(() => {
        loadCivilians();
    }, []);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setInviting(true);
        setStatus("Sending secure packet...");

        const res = await inviteCivilian(email);

        if (res.error) {
            setStatus("Error: " + res.error);
        } else {
            setStatus("Invitation Dispatched");
            setEmail("");
            loadCivilians();
        }
        setInviting(false);
    };

    const handleResend = async (emailToResend: string) => {
        if (confirm(`Resend invitation to ${emailToResend}?`)) {
            setResendingEmail(emailToResend);
            const res = await resendInvite(emailToResend);
            if (res.error) {
                alert("Failed to resend: " + res.error);
            } else {
                alert("Invitation resent successfully.");
            }
            setResendingEmail(null);
        }
    };

    return (
        <div className="h-full w-full bg-[#050505] text-zinc-300 font-mono flex flex-col">
            {/* Header */}
            <div className="h-14 border-b border-zinc-900 bg-black/80 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="h-8 w-8 bg-zinc-900 rounded flex items-center justify-center border border-zinc-800">
                        <Users className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold tracking-[0.2em] text-zinc-100">CIVILIAN REGISTRY</h1>
                        <p className="text-[10px] text-zinc-500 uppercase">Access Control & Population</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={loadCivilians} className="p-2 hover:bg-zinc-800 rounded">
                        <RefreshCw className={`h-4 w-4 text-zinc-500 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden grid grid-cols-12 p-6 gap-6">

                {/* 1. Invite Terminal */}
                <div className="col-span-4 bg-zinc-900/20 border border-zinc-800/50 rounded-lg flex flex-col h-fit">
                    <div className="p-3 border-b border-zinc-800/50 bg-zinc-900/30 font-bold text-xs text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Issue Credentials
                    </div>
                    <div className="p-4 space-y-4">
                        <p className="text-xs text-zinc-500">
                            Generate a secure access token for a new civilian pilot. They will be granted Level 1 clearance.
                        </p>
                        <form onSubmit={handleInvite} className="space-y-4">
                            <div>
                                <label className="text-[10px] uppercase font-bold text-zinc-600 block mb-1">Civilian Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-600" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full bg-black border border-zinc-800 rounded py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-emerald-500 text-zinc-200"
                                        placeholder="pilot@agency.com"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={inviting || !email}
                                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-widest rounded transition-all"
                            >
                                {inviting ? 'Encrypting...' : 'Dispatch Invite'}
                            </button>
                            {status && (
                                <div className="p-2 bg-zinc-900 rounded border border-zinc-800 text-[10px] font-mono text-emerald-400 text-center">
                                    {status}
                                </div>
                            )}
                        </form>
                    </div>
                </div>

                {/* 2. Population Grid */}
                <div className="col-span-8 bg-zinc-900/20 border border-zinc-800/50 rounded-lg flex flex-col overflow-hidden">
                    <div className="p-3 border-b border-zinc-800/50 bg-zinc-900/30 font-bold text-xs text-zinc-400 uppercase tracking-widest flex items-center justify-between">
                        <span>Active Population</span>
                        <span className="bg-zinc-900 px-2 py-0.5 rounded text-[10px] text-zinc-500">{civilians.length} Records</span>
                    </div>

                    {/* Table Header */}
                    <div className="grid grid-cols-12 px-4 py-2 border-b border-zinc-800/50 text-[10px] uppercase font-bold text-zinc-600">
                        <div className="col-span-4">Identity</div>
                        <div className="col-span-3">Codename / Name</div>
                        <div className="col-span-2">Role</div>
                        <div className="col-span-2">Joined</div>
                        <div className="col-span-1 text-right">Action</div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="p-8 text-center text-zinc-600 text-xs animate-pulse">Scanning database...</div>
                        ) : civilians.length === 0 ? (
                            <div className="p-8 text-center text-zinc-700 text-xs italic">No entries found. Start recruiting.</div>
                        ) : (
                            civilians.map(profile => (
                                <div key={profile.id} className="grid grid-cols-12 px-4 py-3 border-b border-zinc-800/30 items-center hover:bg-zinc-900/40 transition-colors group">
                                    <div className="col-span-4 flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold text-xs overflow-hidden relative border border-zinc-700 shrink-0">
                                            {profile.avatar_url ? (
                                                <img
                                                    src={`${profile.avatar_url}?t=${new Date(profile.updated_at).getTime()}`}
                                                    alt={profile.display_name || "Avatar"}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <span>{profile.email[0].toUpperCase()}</span>
                                            )}
                                        </div>
                                        <div className="overflow-hidden min-w-0">
                                            <div className="text-sm text-zinc-200 truncate">{profile.email}</div>
                                            <div className="text-[10px] text-zinc-500 font-mono">{profile.id.slice(0, 8)}...</div>
                                        </div>
                                    </div>
                                    <div className="col-span-3">
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="text-sm text-zinc-300 truncate font-bold text-shadow-glow">
                                                {profile.display_name || <span className="text-zinc-600 italic font-normal">Unknown</span>}
                                            </span>
                                            {profile.full_name && (
                                                <span className="text-[10px] text-zinc-500 uppercase tracking-tight truncate">
                                                    {profile.full_name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${profile.role === 'COMMANDER'
                                            ? 'bg-amber-950/30 text-amber-500 border-amber-900/50'
                                            : 'bg-emerald-950/30 text-emerald-500 border-emerald-900/50'
                                            }`}>
                                            {profile.role}
                                        </span>
                                    </div>
                                    <div className="col-span-2 text-xs text-zinc-500 font-mono">
                                        {new Date(profile.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="col-span-1 text-right flex items-center justify-end gap-1">
                                        {(!profile.full_name || !profile.display_name || profile.display_name.includes('@') || profile.display_name === profile.email.split('@')[0]) && (
                                            <button
                                                onClick={async () => {
                                                    if (!confirm("Auto-generate identity for this operative?")) return;
                                                    const { generateCodename } = await import("@/utils/generators");
                                                    const newCode = generateCodename();
                                                    // Simple format: email user part to Title Case
                                                    const derivedName = profile.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                                                    const { error } = await supabase
                                                        .from('profiles')
                                                        .update({
                                                            display_name: newCode,
                                                            full_name: derivedName
                                                        })
                                                        .eq('id', profile.id);

                                                    if (error) alert("Error: " + error.message);
                                                    else loadCivilians();
                                                }}
                                                className="p-1.5 hover:bg-amber-950/30 text-zinc-600 hover:text-amber-500 rounded transition-colors group/fix"
                                                title="Initialize Identity Protocol (Fix Missing Data)"
                                            >
                                                <Shield className="h-4 w-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleResend(profile.email)}
                                            className="p-1.5 hover:bg-emerald-950/30 text-zinc-600 hover:text-emerald-500 rounded transition-colors"
                                            title="Resend Invite"
                                            disabled={resendingEmail === profile.email}
                                        >
                                            <Send className={`h-4 w-4 ${resendingEmail === profile.email ? 'animate-pulse opacity-50' : ''}`} />
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (confirm(`REVOKE ACCESS for ${profile.email}? This cannot be undone.`)) {
                                                    const { deleteUser } = await import("@/app/actions/admin");
                                                    const res = await deleteUser(profile.id);
                                                    if (res?.error) alert("Error: " + res.error);
                                                    else loadCivilians();
                                                }
                                            }}
                                            className="p-1.5 hover:bg-red-950/30 text-zinc-600 hover:text-red-500 rounded transition-colors"
                                            title="Revoke Access"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
