import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg text-text flex flex-col antialiased selection:bg-accent selection:text-black">
      {/* Horizontal Top Navigation */}
      <Navbar />

      {/* Main Content Viewport: Fluid 92vw Width */}
      <main className="flex-1 w-[92vw] mx-auto py-10 md:py-14">
        <Outlet />
      </main>

      {/* DOT Field Manual Footer */}
      <footer className="w-full border-t border-border py-6 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-muted bg-surface">
        <div className="w-[92vw] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>ROADGUARD — AUTONOMOUS ROAD INSPECTION SYSTEM</span>
          <span>ARM GRAVITON3 × OPENCV 5 COOL × RDD2022</span>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
