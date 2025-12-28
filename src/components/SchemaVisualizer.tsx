import React, { useEffect, useState, useRef } from 'react';
import { X, ZoomIn, ZoomOut, Move, Maximize2 } from 'lucide-react';

interface Column {
    name: string;
    type: string;
    isPk: boolean;
    isFk: boolean;
}

interface Node {
    id: string; // Table Name
    x: number;
    y: number;
    columns: Column[];
}

interface Link {
    source: string;
    target: string;
    sourceCol?: string; // Optional: which column is the FK
}

interface SchemaVisualizerProps {
    sql: string;
    isOpen: boolean;
    onClose: () => void;
}

export function SchemaVisualizer({ sql, isOpen, onClose }: SchemaVisualizerProps) {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [links, setLinks] = useState<Link[]>([]);
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState<{ id: string, startX: number, startY: number } | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    // Enhanced Parsing Logic
    useEffect(() => {
        if (!sql) return;

        // Split SQL by statements to handle complexity better
        const statements = sql.split(';');

        const foundNodes: Node[] = [];
        const foundLinks: Link[] = [];

        statements.forEach(stmt => {
            const createTableMatch = stmt.match(/CREATE\s+TABLE\s+([a-zA-Z0-9_]+)\s*\(([\s\S]*?)\)/i);
            if (createTableMatch) {
                const tableName = createTableMatch[1];
                const body = createTableMatch[2];
                const columns: Column[] = [];

                // Parse Columns
                const lines = body.split(',');
                lines.forEach(line => {
                    const cleanLine = line.trim();
                    // Skip constraint lines if possible or parse them separately
                    if (cleanLine.startsWith('CONSTRAINT') || cleanLine.startsWith('PRIMARY KEY') || cleanLine.startsWith('FOREIGN KEY')) {
                        return;
                    }

                    // Simple column parser: name type ...
                    const colParts = cleanLine.split(/\s+/);
                    if (colParts.length >= 2) {
                        const colName = colParts[0];
                        const colType = colParts[1];
                        const isPk = cleanLine.toUpperCase().includes('PRIMARY KEY');
                        const isFk = cleanLine.toUpperCase().includes('REFERENCES'); // Simple check

                        // Extract FK target if inline
                        const fkMatch = cleanLine.match(/REFERENCES\s+([a-zA-Z0-9_]+)/i);
                        if (fkMatch) {
                            foundLinks.push({ source: tableName, target: fkMatch[1], sourceCol: colName });
                        }

                        columns.push({ name: colName, type: colType, isPk, isFk: !!fkMatch });
                    }
                });

                foundNodes.push({ id: tableName, x: 0, y: 0, columns });
            }
        });

        // Smart Initial Layout (Grid-ish)
        const GRID_SPACING_X = 300;
        const GRID_SPACING_Y = 250;
        const COLS = 3;

        const layoutNodes = foundNodes.map((node, i) => ({
            ...node,
            x: 100 + (i % COLS) * GRID_SPACING_X,
            y: 100 + Math.floor(i / COLS) * GRID_SPACING_Y
        }));

        setNodes(layoutNodes);
        setLinks(foundLinks);

    }, [sql, isOpen]);

    // Dragging Logic
    const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
        setDragging({ id: nodeId, startX: e.clientX, startY: e.clientY });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (dragging) {
            const dx = (e.clientX - dragging.startX) / scale;
            const dy = (e.clientY - dragging.startY) / scale;

            setNodes(prev => prev.map(n =>
                n.id === dragging.id
                    ? { ...n, x: n.x + dx, y: n.y + dy }
                    : n
            ));

            setDragging({ id: dragging.id, startX: e.clientX, startY: e.clientY });
        }
    };

    const handleMouseUp = () => {
        setDragging(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-8">
            <div className="bg-[#050505] border border-zinc-800 w-full max-w-7xl h-[90vh] rounded-lg flex flex-col relative overflow-hidden shadow-2xl">

                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-zinc-900 bg-[#0a0a0a]">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                        <h3 className="text-zinc-200 font-mono text-sm tracking-wider uppercase flex items-center gap-2">
                            Schema Visualizer <span className="text-zinc-600">/ Live</span>
                        </h3>
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={() => setScale(s => Math.max(0.2, s - 0.1))} className="p-2 hover:bg-zinc-800 rounded text-zinc-400">
                            <ZoomOut className="w-4 h-4" />
                        </button>
                        <button onClick={() => setScale(s => Math.min(3, s + 0.1))} className="p-2 hover:bg-zinc-800 rounded text-zinc-400">
                            <ZoomIn className="w-4 h-4" />
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-red-900/20 text-zinc-400 hover:text-red-400 rounded transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Canvas */}
                <div className="flex-1 overflow-hidden cursor-move relative bg-[#080808]"
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, #1a1a1a 1px, transparent 0)',
                        backgroundSize: '20px 20px'
                    }}
                >
                    <svg
                        ref={svgRef}
                        className="w-full h-full"
                        viewBox={`0 0 1200 800`}
                    >
                        <g transform={`scale(${scale}) translate(${offset.x}, ${offset.y})`}>
                            {/* Links (Orthogonal-ish Bezier) */}
                            {links.map((link, i) => {
                                const source = nodes.find(n => n.id === link.source);
                                const target = nodes.find(n => n.id === link.target);
                                if (!source || !target) return null;

                                // Node center/header offset for connection points
                                const startX = source.x + 200; // Right side
                                const startY = source.y + 20;
                                const endX = target.x; // Left side
                                const endY = target.y + 20;

                                const cp1x = startX + 50;
                                const cp1y = startY;
                                const cp2x = endX - 50;
                                const cp2y = endY;

                                const d = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;

                                return (
                                    <path
                                        key={i}
                                        d={d}
                                        stroke="#3f3f46"
                                        strokeWidth="2"
                                        fill="none"
                                        markerEnd="url(#arrowhead)"
                                        className="transition-all hover:stroke-emerald-500 hover:stroke-width-2"
                                    />
                                );
                            })}

                            {/* Nodes (Cards) */}
                            {nodes.map(node => (
                                <g
                                    key={node.id}
                                    transform={`translate(${node.x}, ${node.y})`}
                                    onMouseDown={(e) => {
                                        e.stopPropagation();
                                        handleMouseDown(e, node.id);
                                    }}
                                    className="cursor-pointer"
                                >
                                    {/* Card Shadow */}
                                    <rect x="0" y="0" width="200" height={40 + node.columns.length * 20} rx="6" fill="#000" fillOpacity="0.5" transform="translate(4,4)" />

                                    {/* Card Bg */}
                                    <rect
                                        x="0"
                                        y="0"
                                        width="200"
                                        height={40 + node.columns.length * 20}
                                        rx="6"
                                        fill="#18181b"
                                        stroke="#27272a"
                                        strokeWidth="1"
                                        className="hover:stroke-emerald-500/50 transition-colors"
                                    />

                                    {/* Header */}
                                    <rect x="0" y="0" width="200" height="32" rx="6" fill="#27272a" />
                                    <rect x="0" y="28" width="200" height="4" fill="#27272a" /> {/* Square off bottom of header */}

                                    <text
                                        x="10"
                                        y="20"
                                        fill="#e4e4e7"
                                        fontSize="12"
                                        fontWeight="bold"
                                        fontFamily="monospace"
                                        className="select-none pointer-events-none uppercase"
                                    >
                                        {node.id}
                                    </text>

                                    {/* Columns */}
                                    {node.columns.map((col, idx) => (
                                        <g key={idx} transform={`translate(0, ${40 + idx * 20})`}>
                                            <text x="10" y="10" fill={col.isPk ? "#e4e4e7" : "#a1a1aa"} fontSize="10" fontFamily="monospace" fontWeight={col.isPk ? "bold" : "normal"}>
                                                {col.name}
                                            </text>
                                            <text x="190" y="10" textAnchor="end" fill="#52525b" fontSize="9" fontFamily="monospace">
                                                {col.type}
                                            </text>
                                            {col.isPk && <circle cx="180" cy="7" r="2" fill="#fbbf24" />}
                                            {col.isFk && <circle cx="170" cy="7" r="2" fill="#3b82f6" />}
                                        </g>
                                    ))}

                                </g>
                            ))}
                        </g>

                        <defs>
                            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="#3f3f46" />
                            </marker>
                        </defs>
                    </svg>

                    <div className="absolute bottom-4 right-4 text-[10px] text-zinc-600 font-mono pointer-events-none flex flex-col items-end gap-1">
                        <span>YELLOW DOT: Primary Key</span>
                        <span>BLUE DOT: Foreign Key</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
