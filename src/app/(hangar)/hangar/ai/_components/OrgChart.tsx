'use client';

import { AICrewMember, PILLARS } from '@/services/crew';
import { useRouter } from 'next/navigation';
import { Cpu, User, Shield, Hexagon, Activity } from 'lucide-react';
import { useState, useMemo } from 'react';

// Definitions for the tooltip/header info
const PILLAR_INTEL: Record<string, string> = {
    'Discovery': 'Market research, user interviews, and initial problem space exploration.',
    'Strategy': 'Roadmap definition, product requirements (PRD), and high-level architectural decisions.',
    'Substructure': 'Core database schema, API design, and backend foundation.',
    'Design': 'UI/UX interface design, component library, and visual systems.',
    'Planning': 'Task breakdown, sprint planning, and project management.',
    'Construction': 'Implementation, coding, and feature development.',
    'Integration': 'Testing, QA, deployment, and release management.',
    'Operations': 'General maintenance, support, and unassigned units.'
};

const PILLAR_COLORS: Record<string, string> = {
    'Discovery': 'text-emerald-400 border-emerald-500/50 bg-emerald-900/20',
    'Strategy': 'text-emerald-400 border-emerald-500/50 bg-emerald-900/20',
    'Substructure': 'text-emerald-400 border-emerald-500/50 bg-emerald-900/20',
    'Design': 'text-emerald-400 border-emerald-500/50 bg-emerald-900/20',
    'Planning': 'text-emerald-400 border-emerald-500/50 bg-emerald-900/20',
    'Construction': 'text-emerald-400 border-emerald-500/50 bg-emerald-900/20',
    'Integration': 'text-emerald-400 border-emerald-500/50 bg-emerald-900/20',
    'Operations': 'text-emerald-400 border-emerald-500/50 bg-emerald-900/20'
};

const LINE_COLORS: Record<string, string> = {
    'Discovery': '#10b981',
    'Strategy': '#10b981',
    'Substructure': '#10b981',
    'Design': '#10b981',
    'Planning': '#10b981',
    'Construction': '#10b981',
    'Integration': '#10b981',
    'Operations': '#10b981'
};

export default function OrgChart({ crew }: { crew: AICrewMember[] }) {
    const router = useRouter();
    const [hoveredNode, setHoveredNode] = useState<{ type: 'PILLAR' | 'AGENT', id: string, desc?: string } | null>(null);

    // --- GEOMETRY CONSTANTS ---
    const WIDTH = 1000;
    const HEIGHT = 800;
    const CENTER_X = WIDTH / 2;
    const CENTER_Y = HEIGHT / 2;

    const PILLAR_RADIUS = 220; // Distance of pillars from center
    const AGENT_RADIUS_OFFSET = 120; // How far agents are from their pillar

    // --- NODE CALCULATION ---
    const nodes = useMemo(() => {
        const pillarNodes: any[] = [];
        const agentNodes: any[] = [];
        const links: any[] = [];

        const allPillars = [...PILLARS];
        const angleStep = (2 * Math.PI) / allPillars.length;

        allPillars.forEach((pillar, i) => {
            // Calculate Pillar Position (Circle)
            // Twist slightly so 'Strategy' isn't dead bottom? -Math.PI/2 starts at top (12 o clock)
            const angle = i * angleStep - Math.PI / 2;
            const px = CENTER_X + PILLAR_RADIUS * Math.cos(angle);
            const py = CENTER_Y + PILLAR_RADIUS * Math.sin(angle);

            pillarNodes.push({
                id: pillar,
                x: px,
                y: py,
                color: PILLAR_COLORS[pillar]
            });

            // Link Core -> Pillar
            links.push({
                x1: CENTER_X, y1: CENTER_Y,
                x2: px, y2: py,
                color: LINE_COLORS[pillar],
                opacity: 0.2
            });

            // Calculate Agents for this Pillar
            const agentsInPillar = crew.filter(c => (c.pillar || 'Operations') === pillar);

            if (agentsInPillar.length > 0) {
                // Fan them out around the pillar, facing OUTWARDS from center
                const fanAngle = Math.PI / 2.5; // Spread of the fan (approx 70 degrees)
                const startAgentAngle = angle - fanAngle / 2;
                const agentAngleStep = agentsInPillar.length > 1
                    ? fanAngle / (agentsInPillar.length - 1)
                    : 0;

                agentsInPillar.forEach((agent, j) => {
                    const aAngle = agentsInPillar.length === 1
                        ? angle // If only 1, put it straight out
                        : startAgentAngle + (j * agentAngleStep);

                    const ax = px + AGENT_RADIUS_OFFSET * Math.cos(aAngle);
                    const ay = py + AGENT_RADIUS_OFFSET * Math.sin(aAngle);

                    agentNodes.push({
                        ...agent,
                        x: ax,
                        y: ay,
                        pillarColor: PILLAR_COLORS[pillar]
                    });

                    // Link Pillar -> Agent
                    links.push({
                        x1: px, y1: py,
                        x2: ax, y2: ay,
                        color: LINE_COLORS[pillar],
                        opacity: 0.5
                    });
                });
            }
        });

        return { pillarNodes, agentNodes, links };
    }, [crew]);

    return (
        <div className="w-full flex justify-center bg-[#020202] rounded-xl border border-zinc-900 overflow-hidden shadow-inner cursor-grab active:cursor-grabbing">
            <div className="relative shrink-0" style={{ width: WIDTH, height: HEIGHT }}>

                {/* SVG Layer for Connections */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
                    {/* Central Pulse */}
                    <circle cx={CENTER_X} cy={CENTER_Y} r="40" fill="url(#coreGradient)" opacity="0.1">
                        <animate attributeName="r" values="30;50;30" dur="4s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.1;0.05;0.1" dur="4s" repeatCount="indefinite" />
                    </circle>

                    <defs>
                        <radialGradient id="coreGradient">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="transparent" />
                        </radialGradient>
                    </defs>

                    {nodes.links.map((link, i) => (
                        <line
                            key={i}
                            x1={link.x1} y1={link.y1}
                            x2={link.x2} y2={link.y2}
                            stroke={link.color}
                            strokeWidth="2"
                            strokeOpacity={link.opacity * 1.5} // Boost visibility
                        />
                    ))}
                </svg>

                {/* --- NODES LAYER --- */}

                {/* Central Node: COMMAND */}
                <div
                    className="absolute w-20 h-20 bg-zinc-950 border-2 border-emerald-500/50 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)] z-10"
                    style={{ top: CENTER_Y - 40, left: CENTER_X - 40 }}
                >
                    <div className="text-center">
                        <Hexagon size={24} className="mx-auto text-emerald-500 mb-1" />
                        <div className="text-[8px] font-bold text-emerald-100 tracking-widest">
                            COMMAND<br />CORE
                        </div>
                    </div>
                </div>

                {/* Pillar Nodes */}
                {nodes.pillarNodes.map((node) => (
                    <div
                        key={node.id}
                        className={`
                        absolute w-28 h-10 -ml-14 -mt-5 flex items-center justify-center rounded border backdrop-blur-md z-20 hover:scale-110 transition-transform duration-300
                        ${node.color}
                    `}
                        style={{ left: node.x, top: node.y }}
                        onMouseEnter={() => setHoveredNode({ type: 'PILLAR', id: node.id, desc: PILLAR_INTEL[node.id] })}
                        onMouseLeave={() => setHoveredNode(null)}
                    >
                        <span className="text-[10px] font-bold uppercase tracking-wider">{node.id}</span>
                    </div>
                ))}

                {/* Agent Nodes */}
                {nodes.agentNodes.map((agent) => (
                    <div
                        key={agent.id}
                        onClick={() => router.push(`/hangar/ai/${agent.key}`)}
                        className={`
                        absolute w-12 h-12 -ml-6 -mt-6 rounded-full border-2 bg-black z-30 cursor-pointer overflow-hidden transition-all duration-300 hover:scale-125 hover:z-40 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]
                        ${agent.is_active ? 'border-zinc-700 grayscale-0' : 'border-zinc-900 opacity-60 grayscale'}
                    `}
                        style={{ left: agent.x, top: agent.y }}
                        onMouseEnter={() => setHoveredNode({ type: 'AGENT', id: agent.name, desc: agent.designation })}
                        onMouseLeave={() => setHoveredNode(null)}
                    >
                        {agent.avatar_url ? (
                            <img src={agent.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                                {agent.is_locked ? <Shield size={16} className="text-zinc-600" /> : <User size={16} className="text-zinc-600" />}
                            </div>
                        )}

                        {/* Active Pip */}
                        {agent.is_active && (
                            <div className="absolute bottom-1 right-2 w-1.5 h-1.5 bg-emerald-500 rounded-full border border-black shadow-[0_0_5px_#10b981]" />
                        )}
                    </div>
                ))}


                {/* --- HOVER INFO PANEL (Fixed Position) --- */}
                {hoveredNode && (
                    <div className="absolute bottom-6 left-6 p-4 bg-black/80 backdrop-blur border border-white/10 rounded-lg max-w-sm shadow-2xl z-50">
                        <div className="flex items-center gap-2 mb-1">
                            {hoveredNode.type === 'PILLAR' && <Activity size={16} className="text-emerald-400" />}
                            {hoveredNode.type === 'AGENT' && <User size={16} className="text-emerald-400" />}
                            <span className="text-sm font-bold text-white uppercase tracking-wider">
                                {hoveredNode.id}
                            </span>
                        </div>
                        <div className="text-xs text-zinc-400 font-mono leading-relaxed">
                            {hoveredNode.desc}
                        </div>
                    </div>
                )}

                {/* Legend / Instructions */}
                <div className="absolute top-4 right-4 text-[10px] text-zinc-600 font-mono text-right">
                    <p>NEURAL TOPOLOGY v1.0</p>
                    <p>Drag to Pan (Simulated)</p>
                </div>

            </div>
        </div>
    );
}
