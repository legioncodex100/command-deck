"use client";

import { useAuth } from "@/hooks/useAuth";
import { Loader2, ArrowRight } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { CommandDeckLogo } from "@/components/branding/CommandDeckLogo";

// --- Matrix Terminal Component (Advanced) ---
const MatrixTerminal = ({ orientation = 'vertical' }: { orientation?: 'vertical' | 'horizontal' }) => {
    const [lines, setLines] = useState<string[]>([]);
    const [phase, setPhase] = useState<'glitch' | 'typing' | 'loop'>('glitch');
    const bottomRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initial "Boot" Sequence
    const bootSequence = [
        " > SYSTEM_BOOT_SEQUENCE_INITIATED",
        " > VERIFYING_KERNEL_INTEGRITY...",
        " > LOAD_MODULE: [AUTH_Guard_v9]",
        " > LOAD_MODULE: [Visual_Cortex_Render]",
        " > ESTABLISHING_SECURE_UPLINK",
        " > HANDSHAKE_COMPLETE [200 OK]",
        "----------------------------------------",
        "COMMAND DECK ENVIRONMENTAL CONTROL: ACTIVE",
        "----------------------------------------",
    ];

    // Infinite Random Log Generator
    const generateLog = () => {
        const actions = ["SCANNING", "VERIFYING", "ENCRYPTING", "COMPILING", "ROUTING", "PING"];
        const targets = ["SECTOR_7", "USER_DB", "MAIN_FRAME", "PROXY_NODE", "FIREWALL", "QUANTUM_CORE"];
        const statuses = ["OK", "PENDING", "SECURE", "OPTIMIZED", "LOCKED"];

        const action = actions[Math.floor(Math.random() * actions.length)];
        const target = targets[Math.floor(Math.random() * targets.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const id = Math.floor(Math.random() * 9999);

        return ` > [${id}] ${action} ${target}: ${status}`;
    };

    // Auto-scroll logic
    useEffect(() => {
        if (orientation === 'vertical' && bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        } else if (orientation === 'horizontal' && containerRef.current) {
            containerRef.current.scrollLeft = containerRef.current.scrollWidth;
        }
    }, [lines, orientation]);

    // Phase 1: Glitch Effect
    useEffect(() => {
        let glitchInterval: NodeJS.Timeout;
        const glitchDuration = 1500; // 1.5s glitch
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890@#$%^&*";

        const runGlitch = () => {
            const randomLine = () => Array(orientation === 'horizontal' ? 40 : 20).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join("");
            setLines(orientation === 'horizontal' ? [randomLine()] : [randomLine(), randomLine(), randomLine()]);
        };

        glitchInterval = setInterval(runGlitch, 50);

        setTimeout(() => {
            clearInterval(glitchInterval);
            setLines([]);
            setPhase('typing');
        }, glitchDuration);

        return () => clearInterval(glitchInterval);
    }, [orientation]);

    // Phase 2 & 3: Typing & Loop
    useEffect(() => {
        if (phase === 'glitch') return;

        let currentIndex = 0;
        let loopInterval: NodeJS.Timeout;

        const typeLine = () => {
            // Typing Boot Sequence
            if (currentIndex < bootSequence.length) {
                setLines(prev => [...prev, bootSequence[currentIndex]]);
                currentIndex++;

                // Variable typing speed for realism
                loopInterval = setTimeout(typeLine, Math.random() * 200 + 50);
            }
            // Loop Phase: Infinite Logs
            else {
                if (phase !== 'loop') setPhase('loop');
                setLines(prev => {
                    const newLines = [...prev, generateLog()];
                    const maxLines = orientation === 'horizontal' ? 5 : 15; // Fewer lines for horizontal to prevent too much buildup
                    if (newLines.length > maxLines) return newLines.slice(1);
                    return newLines;
                });
                loopInterval = setTimeout(typeLine, Math.random() * 1000 + 500); // Slower updates for logs
            }
        };

        typeLine();

        return () => clearTimeout(loopInterval);
    }, [phase, orientation]);

    // Helper for typing effect
    const TypewriterLine = ({ text }: { text: string }) => {
        const [displayed, setDisplayed] = useState("");

        useEffect(() => {
            setDisplayed("");
            let i = 0;
            const timer = setInterval(() => {
                if (i < text.length) {
                    setDisplayed(prev => prev + text.charAt(i));
                    i++;
                } else {
                    clearInterval(timer);
                }
            }, 40); // Typing speed (slower)
            return () => clearInterval(timer);
        }, [text]);

        return (
            <span className="flex items-center">
                {displayed}
                <span className="inline-block w-2 h-4 bg-emerald-500 ml-1 animate-pulse" />
            </span>
        );
    };

    // Horizontal (Single Line Command Mode) - Typing Effect
    if (orientation === 'horizontal') {
        const currentLine = lines.length > 0 ? lines[lines.length - 1] : "INITIALIZING...";

        return (
            <div className="font-mono text-emerald-500 text-xs leading-relaxed font-vt323 w-full overflow-hidden whitespace-nowrap flex items-center">
                <span className="opacity-50 mr-2 shrink-0">&gt;</span>
                <TypewriterLine text={currentLine} />
            </div>
        );
    }

    // Default Vertical Layout
    return (
        <div className={`font-mono text-emerald-500 text-sm md:text-base leading-relaxed space-y-1 font-vt323 min-h-[300px] w-full max-w-md overflow-hidden ${phase === 'glitch' ? 'animate-pulse blur-[1px]' : ''}`}>
            <div className="flex flex-col justify-end min-h-full">
                {lines.map((line, i) => (
                    <div key={i} className="break-words border-l-2 border-transparent hover:border-emerald-500/50 pl-2 transition-colors">
                        <span className="opacity-50 mr-2 text-xs">{`0${(i + 1) % 99}>`}</span>
                        {line}
                    </div>
                ))}
                <div ref={bottomRef} className="animate-pulse text-emerald-500">_</div>
            </div>
        </div>
    );
};


export default function LoginPage() {
    const { user, loading: authLoading, signInWithEmail } = useAuth();
    const router = useRouter();

    // Auth State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [resetSent, setResetSent] = useState(false);

    const emailInputRef = useRef<HTMLInputElement>(null);

    // Auto-focus email on load
    useEffect(() => {
        if (!authLoading && !user && emailInputRef.current) {
            emailInputRef.current.focus();
        }
    }, [authLoading, user]);

    useEffect(() => {
        if (!authLoading && user) {
            router.push("/");
        }
    }, [user, authLoading, router]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSigningIn(true);

        try {
            await signInWithEmail(email, password);
            console.log("Login successful, refreshing router...");
            router.refresh();
            router.push("/");
        } catch (err: any) {
            console.error("Login error:", err);
            setError(err.message || "Authentication failed.");
            setIsSigningIn(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-emerald-500 font-vt323">
                <Loader2 className="animate-spin h-8 w-8" />
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full lg:grid lg:grid-cols-2 bg-black selection:bg-emerald-500 selection:text-black font-vt323 overflow-hidden">

            {/* --- LEFT PANE: FORM + TOP-RIGHT LOGO --- */}
            <div className="flex flex-col justify-center p-6 md:p-12 lg:p-16 relative z-10 border-r border-emerald-900/30 shadow-[10px_0_50px_-20px_rgba(0,0,0,1)] min-h-screen">

                {/* 1. TOP-LEFT LOGO (ABSOLUTE) - Desktop Only */}
                <div className="hidden lg:block absolute top-12 left-12 z-50">
                    <div className="w-auto h-16 opacity-80 hover:opacity-100 transition-opacity">
                        <CommandDeckLogo showText={false} />
                    </div>
                </div>

                {/* CRT Effect */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-20" />

                <div className="w-full max-w-lg mx-auto space-y-8 lg:space-y-12 relative z-30 mt-0 lg:mt-0">

                    {/* 2. Login Form (Centered) */}
                    <div className="space-y-8">

                        <div className="border-b border-emerald-500/20 pb-4 mb-8">
                            {/* Mobile Logo - Centered in Flow */}
                            <div className="lg:hidden flex justify-center mb-6">
                                <div className="w-auto h-16 opacity-90">
                                    <CommandDeckLogo showText={false} />
                                </div>
                            </div>

                            <h1 className="text-2xl lg:text-3xl text-emerald-500 uppercase tracking-widest text-shadow-glow text-center lg:text-left">
                                COMMAND_DECK
                            </h1>
                        </div>

                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            setError(null);

                            if (isForgotPassword) {
                                if (!email) return setError("EMAIL_REQUIRED");
                                setIsSigningIn(true);
                                const { forgotPassword } = await import("@/app/actions/auth");
                                const res = await forgotPassword(email);
                                setIsSigningIn(false);
                                if (res.error) setError(res.error);
                                else setResetSent(true);
                                return;
                            }

                            // Normal Login
                            handleSubmit(e);
                        }} className="space-y-6">

                            {error && (
                                <div className="bg-emerald-900/20 text-emerald-400 p-4 border-l-2 border-emerald-500 font-mono text-sm">
                                    &gt; ERROR: {error}
                                </div>
                            )}

                            {resetSent ? (
                                <div className="space-y-6 text-center">
                                    <div className="bg-emerald-900/10 border border-emerald-500/30 p-6 rounded">
                                        <div className="text-emerald-400 font-bold mb-2">RECOVERY SIGNAL BROADCASTED</div>
                                        <p className="text-emerald-700 text-sm">Check your secure frequency (email) for the reset token.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsForgotPassword(false);
                                            setResetSent(false);
                                            setError(null);
                                        }}
                                        className="text-emerald-500 hover:text-emerald-400 underline text-sm tracking-widest uppercase"
                                    >
                                        [RETURN TO LOGIN]
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-6 font-mono text-base">
                                        {/* EMAIL FLIED (ALWAYS VISIBLE) */}
                                        <div className="space-y-2 group">
                                            <label className="block text-emerald-700 uppercase tracking-wider text-xs group-focus-within:text-emerald-400 transition-colors">
                                                &gt; Enter Identity [Email]:
                                            </label>
                                            <div className="flex items-center gap-2 border-b border-emerald-800 group-focus-within:border-emerald-500 transition-colors py-1">
                                                <span className="text-emerald-500 animate-pulse">_</span>
                                                <input
                                                    ref={emailInputRef}
                                                    type="email"
                                                    disabled={isSigningIn}
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full bg-black text-emerald-500 focus:outline-none placeholder:text-emerald-900 uppercase"
                                                    autoComplete="off"
                                                />
                                            </div>
                                        </div>

                                        {/* PASSWORD FIELD (HIDDEN IN FORGOT PASSWORD MODE) */}
                                        {!isForgotPassword && (
                                            <div className="space-y-2 group animate-in slide-in-from-top-2 fade-in duration-300">
                                                <div className="flex justify-between items-center">
                                                    <label className="block text-emerald-700 uppercase tracking-wider text-xs group-focus-within:text-emerald-400 transition-colors">
                                                        &gt; Enter Passcode [Key]:
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setIsForgotPassword(true);
                                                            setError(null);
                                                        }}
                                                        className="text-[10px] text-zinc-600 hover:text-emerald-500 uppercase tracking-widest transition-colors font-mono"
                                                    >
                                                        [FORGOT KEY?]
                                                    </button>
                                                </div>
                                                <div className="relative flex items-center gap-2 border-b border-emerald-800 group-focus-within:border-emerald-500 transition-colors py-1">
                                                    <span className="text-emerald-500 animate-pulse">_</span>
                                                    <div className="relative w-full">
                                                        <div className="absolute inset-0 flex items-center pointer-events-none text-emerald-500 font-mono">
                                                            {password.split('').map((_, i) => (
                                                                <span key={i}>*</span>
                                                            ))}
                                                        </div>
                                                        <input
                                                            type="password"
                                                            disabled={isSigningIn}
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                            className="w-full bg-transparent text-transparent caret-emerald-500 focus:outline-none font-mono relative z-10"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSigningIn}
                                        className="mt-8 w-full group relative overflow-hidden bg-emerald-900/20 border border-emerald-500/50 hover:bg-emerald-500 text-emerald-500 hover:text-black transition-all duration-300 p-4 text-base uppercase tracking-[0.2em]"
                                    >
                                        {isSigningIn ? (
                                            <span className="flex items-center justify-center gap-3">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Processing...
                                            </span>
                                        ) : (
                                            <span className="flex items-center justify-center gap-4">
                                                <span>{isForgotPassword ? "INITIATE RECOVERY" : "INITIALIZE LINK"}</span>
                                                <span className="group-hover:translate-x-2 transition-transform">→</span>
                                            </span>
                                        )}
                                    </button>

                                    {isForgotPassword && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsForgotPassword(false);
                                                setError(null);
                                            }}
                                            className="block w-full text-center text-[10px] text-zinc-600 hover:text-emerald-500 uppercase tracking-widest mt-4 transition-colors font-mono"
                                        >
                                            [CANCEL RECOVERY]
                                        </button>
                                    )}
                                </>
                            )}

                            {/* MOBILE ANIMATION: Compact Matrix Terminal - INLINE BELOW BUTTON */}
                            <div className="block lg:hidden mt-4 border-t border-emerald-900/30 pt-4">
                                <MatrixTerminal orientation="horizontal" />
                            </div>

                        </form>
                        <div className="text-emerald-900 text-xs pt-8 text-center font-mono">
                            USE OF THIS SYSTEM IS RESTRICTED TO AUTHORIZED PERSONNEL.
                        </div>
                    </div>
                </div>
            </div>

            {/* --- RIGHT PANE: DESKTOP ANIMATIONS ONLY --- */}
            <div className="hidden lg:flex relative bg-black flex-col items-center justify-center p-12 overflow-hidden border-l border-emerald-900/10">

                {/* 1. Background Effects */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#052e16_1px,transparent_1px),linear-gradient(to_bottom,#052e16_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30 animate-pulse" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-80" />

                {/* 2. The Matrix Terminal Sequence */}
                <div className="relative z-10 w-full max-w-lg p-8 border border-emerald-900/40 bg-black/50 backdrop-blur-sm rounded-lg shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                    <MatrixTerminal />
                </div>

            </div>

            <style jsx global>{`
                .font-vt323 {
                     font-family: var(--font-vt323), monospace;
                }
                .text-shadow-glow {
                    text-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
                }
                /* Autofill Override */
                input:-webkit-autofill,
                input:-webkit-autofill:hover, 
                input:-webkit-autofill:focus, 
                input:-webkit-autofill:active{
                    -webkit-box-shadow: 0 0 0 30px black inset !important;
                    -webkit-text-fill-color: #10b981 !important;
                    caret-color: #10b981;
                }
            `}</style>

            {/* FULL SCREEN LOADING OVERLAY */}
            {isSigningIn && (
                <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center animate-fadeIn">
                    <div className="text-center space-y-4">
                        <div className="text-emerald-500 font-mono text-3xl md:text-5xl uppercase tracking-widest text-shadow-glow animate-pulse">
                            &gt; SYSTEM_INITIALIZED
                        </div>
                        <div className="text-emerald-900 font-mono text-sm uppercase tracking-[0.5em]">
                            stand by for uplink...
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
