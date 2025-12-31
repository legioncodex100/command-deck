"use client";

import React, { useState } from 'react';
import { Terminal, Activity } from 'lucide-react';
import { UnifiedChatInterface, Message } from '../pillars/ui/UnifiedChatInterface';
import { PillarProvider } from '../pillars/PillarProvider';
import { HostVitalityPanel } from './HostVitalityPanel';

// const CORE_PROJECT_ID = 'c0de0000-0000-0000-0000-000000000000';

export function HangarConsole() {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', text: 'Evolution Protocol Initialized. Ready for architectural directives.' }
    ]);
    const [input, setInput] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSend = (text: string) => {
        setMessages(prev => [...prev, { role: 'user', text }]);
        setIsProcessing(true);
        setInput("");

        // Mock response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                role: 'model',
                text: `**Directive Received:** ${text}\n\n*Processing architectural implications...*`
            }]);
            setIsProcessing(false);
        }, 1000);
    };

    return (
        <PillarProvider themeColor="emerald">
            <div className="h-full w-full bg-[#050505] flex flex-col lg:grid lg:grid-cols-12 overflow-hidden">

                {/* Left Panel: Host Stats (Hidden on Mobile) */}
                <div className="hidden lg:block lg:col-span-3 h-full overflow-hidden">
                    <HostVitalityPanel className="h-full border-r border-zinc-900" />
                </div>

                {/* Main Console: Unified Chat */}
                <div className="flex-1 lg:col-span-9 h-full overflow-hidden flex flex-col">
                    <UnifiedChatInterface
                        title="HANGAR CONSOLE"
                        subtitle="Host Governance v1.0"
                        icon={Terminal}
                        messages={messages}
                        isProcessing={isProcessing}
                        input={input}
                        setInput={setInput}
                        onSend={handleSend}
                        onClear={() => setMessages([])}
                        headerActions={
                            <div className="flex items-center gap-2 px-2 py-1 bg-emerald-950/20 rounded border border-emerald-500/20">
                                <Activity className="h-3 w-3 text-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">System Online</span>
                            </div>
                        }
                        className="h-full border-r-0"
                    />
                </div>
            </div>
        </PillarProvider>
    );
}

