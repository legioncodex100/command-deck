
"use client";

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Zap, Activity, FileText, Brain, Terminal, ShieldCheck, Trash2, Play, Sparkles, CheckCircle2, ArrowRight, CheckCheck, AlertCircle } from 'lucide-react';
import { checkStaleState } from '@/services/ripple';
import { useProject } from '@/hooks/useProject';
import { sendStrategyMessage } from '@/services/strategy';
import { loadStrategySession, saveStrategySession, deleteStrategySession } from '@/services/strategy_persistence';
import { ComplexitySelector, ComplexityLevel } from '@/components/ComplexitySelector';
import { generateRelayArtifact } from '@/services/relay';

import { StrategyDirectives } from './strategy/StrategyDirectives';
import { StrategyChat } from './strategy/StrategyChat';
import { StrategyArtifactViewer } from './strategy/StrategyArtifactViewer';
import { useStrategyLogic } from './strategy/useStrategyLogic';

export default function Pillar_B_Strategy() {
    const {
        messages, input, setInput, isProcessing, liveStrategy, pillars,
        complexity, setComplexity, relayGenerated, staleState,
        handleSend, handleClear, handleCompletePhase, handleInit,
        currentPRDTitle
    } = useStrategyLogic();

    return (
        <div className="h-full w-full grid grid-cols-12 gap-0 bg-[#020402] text-zinc-300 font-mono">
            <StrategyDirectives
                pillars={pillars}
                currentPRDTitle={currentPRDTitle}
            />

            <StrategyChat
                messages={messages}
                input={input}
                setInput={setInput}
                isProcessing={isProcessing}
                complexity={complexity}
                setComplexity={setComplexity}
                onSend={handleSend}
                onClear={handleClear}
                onInit={handleInit}
            />

            <StrategyArtifactViewer
                liveStrategy={liveStrategy}
                relayGenerated={relayGenerated}
                staleState={staleState}
                isProcessing={isProcessing}
                onCompletePhase={handleCompletePhase}
            />
        </div>
    );
}
