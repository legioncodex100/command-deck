"use client";

import React from 'react';
import MissionControl from '@/components/MissionControl';

// Simplified Index: 
// The real routing is handled by Next.js App Router (/(deck)/[page]/page.tsx).
// The real sidebar is handled by /(deck)/layout.tsx.
// This component now just renders the Dashboard Grid (Mission Control) for the root path.

export default function CommandDeckIndex() {
    return <MissionControl />;
}
