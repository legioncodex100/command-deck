
import React from 'react';
import { Brain, GraduationCap, Zap } from 'lucide-react';

export type ComplexityLevel = 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT';

interface ComplexitySelectorProps {
    value: ComplexityLevel;
    onChange: (next: ComplexityLevel) => void;
}

export const ComplexitySelector: React.FC<ComplexitySelectorProps> = ({ value, onChange }) => {
    const levels: { id: ComplexityLevel, label: string, icon: React.ReactNode, color: string }[] = [
        { id: 'BEGINNER', label: 'Mentor', icon: <GraduationCap className="h-3 w-3" />, color: 'text-blue-400' },
        { id: 'INTERMEDIATE', label: 'Analyst', icon: <Brain className="h-3 w-3" />, color: 'text-emerald-400' },
        { id: 'EXPERT', label: 'Executive', icon: <Zap className="h-3 w-3" />, color: 'text-purple-400' },
    ];

    return (
        <div className="flex items-center gap-1 bg-zinc-900/50 p-1 rounded-lg border border-zinc-800">
            {levels.map((level) => {
                const isActive = value === level.id;
                return (
                    <button
                        key={level.id}
                        onClick={() => onChange(level.id)}
                        className={`
                            px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all
                            ${isActive ? 'bg-zinc-800 shadow-sm ' + level.color : 'text-zinc-600 hover:text-zinc-400'}
                        `}
                        title={`Switch to ${level.id} mode`}
                    >
                        {level.icon}
                        {isActive && <span>{level.label}</span>}
                    </button>
                );
            })}
        </div>
    );
};
