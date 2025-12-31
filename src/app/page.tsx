"use client";

import { useActionState, useEffect, useState, useRef, useCallback } from "react";
import { requestInvite } from "@/actions/request-invite";
import { CommandDeckLogo } from "@/components/branding/CommandDeckLogo";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// --- Typewriter Effect ---
const Typewriter = ({
    text,
    onComplete,
    speed = 50,
    startDelay = 500
}: {
    text: string,
    onComplete?: () => void,
    speed?: number,
    startDelay?: number
}) => {
    const [displayed, setDisplayed] = useState("");
    const [started, setStarted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setStarted(true), startDelay);
        return () => clearTimeout(timer);
    }, [startDelay]);

    useEffect(() => {
        if (!started) return;

        let index = 0;
        const interval = setInterval(() => {
            if (index <= text.length) {
                setDisplayed(text.substring(0, index)); // Absolute text, no appending
                index++;
            } else {
                clearInterval(interval);
                if (onComplete) onComplete();
            }
        }, speed);

        return () => clearInterval(interval);
    }, [text, speed, started, onComplete]);

    return (
        <span className="inline-block">
            {displayed}
            <span className="animate-blink text-emerald-500 ml-1">_</span>
        </span>
    );
};

// --- Matrix Terminal Component ---
const MatrixTerminal = () => {
    const [lines, setLines] = useState<string[]>([]);
    const bootSequence = [
        " > INITIALIZING_PUBLIC_UPLINK...",
        " > SEARCHING_FOR_SIGNALS...",
        " > WAITING_FOR_INPUT...",
    ];

    useEffect(() => {
        let currentIndex = 0;
        let loopInterval: NodeJS.Timeout;

        const typeLine = () => {
            if (currentIndex < bootSequence.length) {
                setLines(prev => [...prev, bootSequence[currentIndex]]);
                currentIndex++;
                loopInterval = setTimeout(typeLine, 800);
            }
        };

        typeLine();
        return () => clearTimeout(loopInterval);
    }, []);

    return (
        <div className={cn("text-emerald-500/50 text-xs leading-relaxed w-full flex justify-center font-mono")}>
            <div className="flex flex-col items-center">
                {lines.map((line, i) => (
                    <div key={i}>{line}</div>
                ))}
            </div>
        </div>
    );
};

export default function LandingPage() {
    const [state, formAction, isPending] = useActionState(requestInvite, null);
    const [email, setEmail] = useState("");
    const [phase, setPhase] = useState<"typing" | "glitching" | "form">("typing");
    const router = useRouter();

    const handleTypingComplete = useCallback(() => {
        setPhase("glitching");
    }, []);

    useEffect(() => {
        if (phase === "glitching") {
            const timer = setTimeout(() => setPhase("form"), 2500);
            return () => clearTimeout(timer);
        }
    }, [phase]);

    return (
        <div className={cn("min-h-screen bg-[#050505] text-emerald-500 selection:bg-emerald-500 selection:text-black overflow-hidden relative flex flex-col items-center justify-center p-6 font-mono")}>

            {/* --- Background: Muted Emerald Graph --- */}
            <div className="absolute inset-0 z-0">
                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b9810a_1px,transparent_1px),linear-gradient(to_bottom,#10b9810a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
                {/* Radial Vignette (Depth) */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050505_90%)]" />
                {/* CRT Scanline */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5">
                    <div className="w-full h-24 bg-gradient-to-b from-transparent to-emerald-500/20 animate-scanline absolute top-0 left-0" />
                </div>
            </div>

            {/* --- Main Content --- */}
            <div className="relative z-30 w-full max-w-4xl flex flex-col items-center text-center">

                {/* 1. Header Phase (Type -> Glitch -> Vanish) */}
                {(phase === "typing" || phase === "glitching") && (
                    <div className={cn(
                        "min-h-[120px] flex items-center justify-center mb-12",
                        phase === "glitching" ? "animate-glitch" : ""
                    )}>
                        <h1
                            className={cn("text-3xl md:text-5xl uppercase tracking-widest text-shadow-glow leading-tight font-vt323-force whitespace-nowrap")}
                        >
                            <Typewriter
                                text="COMMAND YOUR CODEBASE"
                                speed={150}
                                startDelay={800}
                                onComplete={handleTypingComplete}
                            />
                        </h1>
                    </div>
                )}

                {/* 2. Form Phase (Appears after header vanishes) */}
                {phase === "form" && (
                    <div className="w-full animate-in zoom-in-95 fade-in duration-1000 fill-mode-forwards">

                        <div className="space-y-8">
                            {/* Logo & Branding */}
                            <div className="flex flex-col items-center animate-in zoom-in duration-700 pt-8">
                                <div className="h-12 md:h-14 w-auto text-emerald-500 mb-10">
                                    <CommandDeckLogo showText={false} className="h-full w-auto" />
                                </div>
                                <h2 className="text-4xl md:text-6xl tracking-[0.2em] text-emerald-500 uppercase text-shadow-glow font-vt323-force">
                                    COMMAND_DECK
                                </h2>
                            </div>

                            {/* Subtitle */}
                            <p className="text-emerald-700/80 text-xs md:text-sm uppercase tracking-wider max-w-xl mx-auto">
                                The operating system for high-velocity engineering teams.
                            </p>

                            {/* Form */}
                            <div className="w-full max-w-md mx-auto relative group">
                                {state?.success ? (
                                    <div className="bg-emerald-900/10 border border-emerald-500/30 p-8 rounded flex flex-col items-center gap-4 animate-in zoom-in duration-500">
                                        <div className="text-emerald-400 text-xl font-bold tracking-widest uppercase">SIGNAL RECEIVED</div>
                                        <p className="text-emerald-700 text-sm">You have been added to the priority waitlist.</p>
                                        <MatrixTerminal />
                                    </div>
                                ) : (
                                    <form action={formAction} className="space-y-8 flex flex-col items-center">
                                        {/* Input Field */}
                                        <div className="space-y-4 group/input w-full">
                                            <label className="block text-emerald-700 uppercase tracking-wider text-xs group-focus-within/input:text-emerald-400 transition-colors text-center">
                                                &gt; Enter your email uplink...
                                            </label>
                                            <div className="flex items-center gap-2 border-b-2 border-emerald-900 group-focus-within/input:border-emerald-500 transition-all duration-300 py-2 justify-center bg-emerald-900/5 hover:bg-emerald-900/10">
                                                <span className="text-emerald-500 font-bold text-xl px-2">&gt;</span>
                                                <input
                                                    name="email"
                                                    type="email"
                                                    required
                                                    disabled={isPending}
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className={cn("w-full bg-transparent border-none outline-none text-emerald-500 placeholder-emerald-900/30 py-1 px-2 text-xl text-center font-mono")}
                                                    autoComplete="email"
                                                    placeholder="user@system.com"
                                                />
                                            </div>
                                        </div>

                                        {/* Error Message */}
                                        {state?.message && !state.success && (
                                            <div className="text-emerald-500 bg-emerald-900/20 border border-emerald-500/50 p-2 text-xs font-mono text-center w-full animate-shake">
                                                &gt; ERROR: {state.message}
                                            </div>
                                        )}

                                        {/* Button */}
                                        <button
                                            type="submit"
                                            disabled={isPending}
                                            className="w-full group relative overflow-hidden bg-transparent border border-emerald-800 hover:border-emerald-500 text-emerald-700 hover:text-emerald-400 transition-all duration-300 p-4 text-xs md:text-sm uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                                        >
                                            <div className="absolute inset-0 bg-emerald-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                            <span className="relative z-10 flex items-center justify-center gap-4">
                                                {isPending ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        UPLINKING...
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>REQUEST ACCESS</span>
                                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                    </>
                                                )}
                                            </span>
                                        </button>
                                    </form>
                                )}
                            </div>

                            {/* Footer Link */}
                            <div>
                                <a
                                    href="/login"
                                    className="inline-block text-[10px] uppercase tracking-[0.2em] text-emerald-800 hover:text-emerald-400 transition-colors border-b border-transparent hover:border-emerald-500 py-1"
                                >
                                    [ ALREADY HAVE CLEARANCE? LOGIN ]
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx global>{`
                .text-shadow-glow {
                    text-shadow: 0 0 10px rgba(16, 185, 129, 0.4), 0 0 20px rgba(16, 185, 129, 0.2);
                }
                @keyframes scanline {
                    0% { top: -100%; }
                    100% { top: 100%; }
                }
                .animate-scanline {
                    animation: scanline 4s linear infinite;
                }
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
                .animate-blink {
                    animation: blink 1s step-end infinite;
                }
                @keyframes glitch {
                    0% { transform: scale(1, 1); opacity: 1; filter: brightness(1); }
                    40% { transform: scale(1, 0.002); opacity: 1; filter: brightness(2); }
                    70% { transform: scale(0, 0.002); opacity: 1; filter: brightness(5); }
                    100% { transform: scale(0, 0); opacity: 0; }
                }
                .animate-glitch {
                    animation: glitch 6s ease-out forwards;
                }
                /* Autofill Override */
                input:-webkit-autofill,
                input:-webkit-autofill:hover,
                input:-webkit-autofill:focus,
                input:-webkit-autofill:active {
                    -webkit-box-shadow: 0 0 0 30px black inset !important;
                    -webkit-text-fill-color: #10b981 !important;
                    caret-color: #10b981;
                }
            `}</style>
        </div>
    );
}
