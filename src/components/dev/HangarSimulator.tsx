"use client";

import React, { useState } from 'react';
import { Smartphone, Monitor, Tablet, RotateCcw, ZoomIn, ZoomOut, RefreshCw, PanelTop, Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';

type Device = {
    id: string;
    name: string;
    width: number;
    height: number;
    type: 'mobile' | 'tablet' | 'desktop';
};

const DEVICES: Device[] = [
    { id: 'iphone-15-pro', name: 'iPhone 15 Pro', width: 393, height: 852, type: 'mobile' },
    { id: 'pixel-7', name: 'Pixel 7', width: 412, height: 915, type: 'mobile' },
    { id: 'ipad-air', name: 'iPad Air', width: 820, height: 1180, type: 'tablet' },
    { id: 'laptop', name: 'MacBook Air', width: 1280, height: 832, type: 'desktop' },
    { id: 'fhd', name: 'Full HD Desktop', width: 1920, height: 1080, type: 'desktop' },
];

export function HangarSimulator() {
    const [selectedDevice, setSelectedDevice] = useState<Device>(DEVICES[0]);
    const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
    const [scale, setScale] = useState(0.75); // Start at 75% to fit most screens
    const [url, setUrl] = useState('/'); // Default to dashboard root
    const [refreshKey, setRefreshKey] = useState(0);
    const [showAddressBar, setShowAddressBar] = useState(false);
    const [showKeyboard, setShowKeyboard] = useState(false);

    const isLandscape = orientation === 'landscape';
    const effectiveWidth = isLandscape ? selectedDevice.height : selectedDevice.width;
    const effectiveHeight = isLandscape ? selectedDevice.width : selectedDevice.height;

    return (

        <div className="h-full flex flex-col bg-[#050505]">
            {/* Toolbar */}
            <div className="h-14 border-b border-zinc-900 bg-black/80 flex items-center justify-between px-6 shrink-0">
                {/* ... existing header content ... */}
                <div className="flex items-center gap-4">
                    <div className="h-8 w-8 bg-zinc-900 rounded flex items-center justify-center border border-zinc-800">
                        <Smartphone className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold tracking-[0.2em] text-zinc-100">SIMULATOR</h1>
                        <p className="text-[10px] text-zinc-500 uppercase">Device Emulation Module</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Device Selector */}
                    <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                        {DEVICES.map(device => (
                            <button
                                key={device.id}
                                onClick={() => setSelectedDevice(device)}
                                className={cn(
                                    "px-3 py-1.5 rounded text-xs transition-all flex items-center gap-2",
                                    selectedDevice.id === device.id
                                        ? "bg-zinc-800 text-white font-medium shadow-sm"
                                        : "text-zinc-500 hover:text-zinc-300"
                                )}
                            >
                                {device.type === 'mobile' ? <Smartphone className="h-3 w-3" /> :
                                    device.type === 'tablet' ? <Tablet className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
                                <span className="hidden xl:inline">{device.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="h-6 w-px bg-zinc-800" />

                    {/* Address Bar Toggle */}
                    <button
                        onClick={() => setShowAddressBar(prev => !prev)}
                        className={cn(
                            "p-2 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors flex items-center gap-2",
                            showAddressBar && "bg-zinc-800 text-emerald-400"
                        )}
                        title="Toggle Browser Address Bar"
                    >
                        <PanelTop className="h-4 w-4" />
                    </button>

                    {/* Keyboard Toggle */}
                    <button
                        onClick={() => setShowKeyboard(prev => !prev)}
                        className={cn(
                            "p-2 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors flex items-center gap-2",
                            showKeyboard && "bg-zinc-800 text-emerald-400"
                        )}
                        title="Toggle Soft Keyboard"
                    >
                        <Keyboard className="h-4 w-4" />
                    </button>

                    {/* Keyboard Toggle */}
                    <button
                        onClick={() => setShowKeyboard(prev => !prev)}
                        className={cn(
                            "p-2 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors flex items-center gap-2",
                            showKeyboard && "bg-zinc-800 text-emerald-400"
                        )}
                        title="Toggle Soft Keyboard"
                    >
                        <Keyboard className="h-4 w-4" />
                    </button>

                    {/* Orientation */}
                    <button
                        onClick={() => setOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait')}
                        className={cn(
                            "p-2 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors",
                            isLandscape && "bg-zinc-800 text-emerald-400"
                        )}
                        title="Rotate Orientation"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </button>

                    {/* Scale */}
                    <div className="flex items-center bg-zinc-900 rounded border border-zinc-800">
                        <button onClick={() => setScale(s => Math.max(0.25, s - 0.1))} className="p-1.5 hover:bg-zinc-800 text-zinc-400"><ZoomOut className="h-3 w-3" /></button>
                        <span className="text-[10px] w-12 text-center text-zinc-300 font-mono">{Math.round(scale * 100)}%</span>
                        <button onClick={() => setScale(s => Math.min(1.5, s + 0.1))} className="p-1.5 hover:bg-zinc-800 text-zinc-400"><ZoomIn className="h-3 w-3" /></button>
                    </div>

                    {/* Refresh */}
                    <button
                        onClick={() => setRefreshKey(k => k + 1)}
                        className="p-2 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                        title="Reload Frame"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Viewport Area */}
            <div className="flex-1 bg-zinc-950 overflow-hidden relative flex items-center justify-center p-10 bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:16px_16px]">

                <div
                    className="relative bg-black transition-all duration-300 ease-out shadow-2xl overflow-hidden border-8 border-zinc-900 rounded-[2rem] flex flex-col"
                    style={{
                        width: effectiveWidth,
                        height: effectiveHeight,
                        transform: `scale(${scale})`,
                        transformOrigin: 'center center'
                    }}
                >
                    {/* Device Header/Notch Simulation (Just visual flair) */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-xl z-20 pointer-events-none" />

                    {/* Simulated Mobile Address Bar */}
                    {showAddressBar && (
                        <div className="shrink-0 bg-zinc-800 h-14 flex items-center px-3 gap-2 border-b border-zinc-700 z-10 w-full">
                            <div className="flex-1 bg-zinc-900 h-8 rounded-full flex items-center px-3 gap-2 text-zinc-500 text-[10px] font-mono">
                                <span className="text-emerald-500">🔒</span>
                                <span>command-deck.dev</span>
                            </div>
                        </div>
                    )}

                    <iframe
                        key={refreshKey}
                        src={url}
                        className="flex-1 w-full bg-white transition-all duration-300"
                        style={{ border: 'none' }}
                        title="Device Simulator"
                    />

                    {/* Simulated Soft Keyboard */}
                    <div className={cn(
                        "w-full bg-zinc-900 border-t border-zinc-800 transition-all duration-300 ease-in-out shrink-0",
                        showKeyboard ? "h-[35%]" : "h-0"
                    )}>
                        {showKeyboard && (
                            <div className="w-full h-full flex flex-col p-2 gap-1 animate-in slide-in-from-bottom duration-300">
                                <div className="h-8 bg-zinc-800 rounded px-4 flex items-center justify-between text-zinc-500 text-xs">
                                    <span>Suggested 1</span>
                                    <span>Suggested 2</span>
                                    <span>Suggested 3</span>
                                </div>
                                <div className="flex-1 bg-zinc-800/50 rounded grid grid-rows-4 gap-1 p-1">
                                    {/* Visual Mock of Keys */}
                                    <div className="row-span-3 bg-zinc-800/30 rounded flex items-center justify-center text-zinc-600 font-mono text-sm tracking-widest uppercase">
                                        [ Q W E R T Y U I O P ]<br />
                                        [ A S D F G H J K L ]<br />
                                        [ Z X C V B N M ]
                                    </div>
                                    <div className="flex gap-1 h-full">
                                        <div className="w-1/4 bg-zinc-700/50 rounded" />
                                        <div className="flex-1 bg-zinc-700 rounded" />
                                        <div className="w-1/4 bg-emerald-600/20 rounded flex items-center justify-center text-emerald-500 font-bold text-[10px]">GO</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>


                </div>

                <div className="absolute bottom-4 left-4 text-[10px] text-zinc-600 font-mono">
                    Viewport: {effectiveWidth}x{effectiveHeight}px | Scale: {scale.toFixed(2)}x
                </div>
            </div>
        </div>
    );
}
