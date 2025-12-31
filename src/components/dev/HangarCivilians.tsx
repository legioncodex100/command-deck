"use client";

import { useState, useEffect } from "react";
import { Users, UserPlus, Shield, Mail, Trash2, RefreshCw, Send, Sparkles, KeyRound, ChevronDown, ChevronUp } from "lucide-react";
import { inviteCivilian, resendInvite, sendMagicLink, triggerPasswordReset, listCiviliansWithAuth } from "@/app/actions/admin";
import { ExtendedProfile } from "@/types/database";
import StandardPillarLayout from "../pillars/StandardPillarLayout";
import { PillarPanel, PillarHeader, PillarBody } from "../pillars/ui";
import { supabase } from "@/services/supabase";

export function HangarCivilians() {
    const [email, setEmail] = useState("");
    const [inviting, setInviting] = useState(false);
    const [status, setStatus] = useState("");
    const [civilians, setCivilians] = useState<ExtendedProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [resendingEmail, setResendingEmail] = useState<string | null>(null);
    const [expandedUser, setExpandedUser] = useState<string | null>(null);

    const loadCivilians = async () => {
        setLoading(true);
        const { data, error } = await listCiviliansWithAuth();

        if (data) setCivilians(data as ExtendedProfile[]);
        if (error) console.error("Error loading civilians:", error);
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

    const InvitePanel = (
        <PillarPanel>
            <PillarHeader title="Issue Credentials" icon={UserPlus} />
            <PillarBody>
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
            </PillarBody>
        </PillarPanel>
    );

    const PopulationPanel = (
        <PillarPanel>
            <PillarHeader
                title="Active Population"
                icon={Users}
                actions={
                    <button onClick={loadCivilians} className="p-1 hover:bg-zinc-800 rounded">
                        <RefreshCw className={`h-3 w-3 text-zinc-500 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                }
            />
            <PillarBody>
                {/* Table Header */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-8 text-center text-zinc-600 text-xs animate-pulse">Scanning database...</div>
                    ) : civilians.length === 0 ? (
                        <div className="p-8 text-center text-zinc-700 text-xs italic">No entries found. Start recruiting.</div>
                    ) : (
                        civilians.map(profile => (
                            <div key={profile.id} className="border-b border-zinc-800/30 bg-zinc-900/10 hover:bg-zinc-900/40 transition-colors">
                                <div
                                    className="flex items-center justify-between p-4 cursor-pointer select-none"
                                    onClick={() => setExpandedUser(expandedUser === profile.id ? null : profile.id)}
                                >
                                    <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                                        {/* Avatar */}
                                        <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold text-xs overflow-hidden relative border border-zinc-700 shrink-0">
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

                                        {/* Info */}
                                        <div className="flex flex-col min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-zinc-200 font-bold truncate">
                                                    {profile.full_name || <span className="text-zinc-600 italic font-normal">Unknown</span>}
                                                </span>
                                                {profile.role === 'COMMANDER' && <Shield className="h-3 w-3 text-amber-500" />}
                                            </div>
                                            <div className="text-[10px] text-zinc-500 font-mono truncate">{profile.email}</div>
                                        </div>
                                    </div>

                                    {/* Right Side: Role & Toggle */}
                                    <div className="flex items-center gap-3 shrink-0 pl-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${profile.role === 'COMMANDER'
                                            ? 'bg-amber-950/30 text-amber-500 border-amber-900/50'
                                            : 'bg-emerald-950/30 text-emerald-500 border-emerald-900/50'
                                            }`}>
                                            {profile.role?.substring(0, 3)}
                                        </span>
                                        {expandedUser === profile.id ? (
                                            <ChevronUp className="h-4 w-4 text-zinc-500" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4 text-zinc-500" />
                                        )}
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                {expandedUser === profile.id && (
                                    <div className="px-4 pb-4 pt-0 animate-in slide-in-from-top-1 fade-in duration-200">
                                        <div className="bg-zinc-950/50 border border-zinc-800/50 rounded-lg p-2 flex items-center justify-between gap-2 overflow-x-auto">

                                            <div className="text-[10px] text-zinc-600 font-mono pl-2">
                                                Active: {profile.last_sign_in_at ? new Date(profile.last_sign_in_at).toLocaleDateString() : 'Never'}
                                            </div>

                                            <div className="flex items-center gap-1">
                                                {(!profile.full_name || !profile.display_name || profile.display_name.includes('@') || profile.display_name === profile.email.split('@')[0]) && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (!confirm("Auto-generate identity?")) return;
                                                            import("@/utils/generators").then(async (m) => {
                                                                const newCode = m.generateCodename();
                                                                const derivedName = profile.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                                                const { error } = await supabase.from('profiles').update({ display_name: newCode, full_name: derivedName }).eq('id', profile.id);
                                                                if (error) alert("Error: " + error.message); else loadCivilians();
                                                            });
                                                        }}
                                                        className="p-2 hover:bg-amber-950/30 text-zinc-400 hover:text-amber-500 rounded transition-colors"
                                                        title="Generate Identity"
                                                    >
                                                        <Shield className="h-4 w-4" />
                                                    </button>
                                                )}

                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleResend(profile.email); }}
                                                    className="p-2 hover:bg-emerald-950/30 text-zinc-400 hover:text-emerald-500 rounded transition-colors"
                                                    title="Resend Invite"
                                                >
                                                    <Send className="h-4 w-4" />
                                                </button>

                                                <button
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        if (confirm(`Send MAGIC LINK to ${profile.email}?`)) {
                                                            const res = await sendMagicLink(profile.email);
                                                            if (res.error) alert("Error: " + res.error); else alert("Magic Link sent.");
                                                        }
                                                    }}
                                                    className="p-2 hover:bg-emerald-950/30 text-zinc-400 hover:text-emerald-400 rounded transition-colors"
                                                    title="Send Magic Link"
                                                >
                                                    <Sparkles className="h-4 w-4" />
                                                </button>

                                                <div className="w-px h-6 bg-zinc-800 mx-1" />

                                                <button
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        if (confirm(`REVOKE ACCESS for ${profile.email}?`)) {
                                                            const { deleteUser } = await import("@/app/actions/admin");
                                                            const res = await deleteUser(profile.id);
                                                            if (res?.error) alert("Error: " + res.error); else loadCivilians();
                                                        }
                                                    }}
                                                    className="p-2 hover:bg-red-950/30 text-zinc-400 hover:text-red-500 rounded transition-colors"
                                                    title="Revoke Access"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </PillarBody>
        </PillarPanel>
    );

    const AnalyticsPanel = (
        <PillarPanel>
            <PillarHeader title="Registry Analytics" icon={Shield} />
            <PillarBody>
                <div className="p-6 text-center text-zinc-600 text-xs italic">
                    Population Telemetry Offline
                </div>
            </PillarBody>
        </PillarPanel>
    );

    return (
        <StandardPillarLayout
            themeColor="emerald"
            leftContent={InvitePanel}
            mainContent={PopulationPanel}
            rightContent={AnalyticsPanel}
        />
    );
}
