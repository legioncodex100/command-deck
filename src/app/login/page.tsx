"use client";

import { useAuth } from "@/hooks/useAuth";
import { Loader2, Command, LogIn, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function LoginPage() {
    const { user, loading, signInWithEmail } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSigningIn, setIsSigningIn] = useState(false);

    useEffect(() => {
        if (!loading && user) {
            router.push("/");
        }
    }, [user, loading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSigningIn(true);

        try {
            await signInWithEmail(email, password);
            // Redirect handled by useEffect
        } catch (err: any) {
            setError(err.message || "Authentication failed. Please check your credentials.");
            setIsSigningIn(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-foreground relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-grid-zinc-900/[0.02] bg-[bottom_1px_center] dark:bg-grid-white/[0.02]" />

            <div className="z-10 w-full max-w-[350px] space-y-6">

                {/* Header */}
                <div className="flex flex-col items-center space-y-2 text-center">
                    <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                        <Command className="h-5 w-5" />
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight">Command Deck</h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your credentials to access the terminal.
                    </p>
                </div>

                {/* Login Form */}
                <div className="grid gap-6">
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4">
                            {error && (
                                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md border border-destructive/20 flex items-center gap-2">
                                    <span className="font-semibold">Error:</span> {error}
                                </div>
                            )}

                            <div className="grid gap-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="email">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="pilot@command-deck.com"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    autoCorrect="off"
                                    disabled={isSigningIn}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all font-mono"
                                />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="password">
                                        Password
                                    </label>
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    disabled={isSigningIn}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all font-mono"
                                />
                            </div>

                            <button
                                type="button" /* Make this button actually submit */
                                onClick={handleSubmit} /* Or just use type="submit" in the form but this button is inside form so type=submit is standard */
                                disabled={isSigningIn}
                                className={cn(
                                    "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                                    "bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full shadow-sm"
                                )}
                            >
                                {isSigningIn ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <LogIn className="mr-2 h-4 w-4" />
                                )}
                                Sign In
                            </button>
                        </div>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Authorized Personnel Only
                            </span>
                        </div>
                    </div>
                </div>

                <p className="px-8 text-center text-sm text-muted-foreground">
                    By clicking continue, you agree to the flight deck protocols and security clearance levels.
                </p>
            </div>
        </div>
    );
}
