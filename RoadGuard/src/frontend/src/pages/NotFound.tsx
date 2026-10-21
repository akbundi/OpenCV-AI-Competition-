import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[72vh] flex items-center justify-center py-12 px-4 animate-in fade-in duration-500">
      <div className="relative max-w-xl w-full p-8 md:p-12 rounded-none bg-surface border border-border flex flex-col items-center text-center">
        {/* Decorative Icon */}
        <div className="w-16 h-16 rounded-none border border-border bg-surface-alt flex items-center justify-center mb-6 text-muted">
          <Compass className="w-8 h-8 stroke-[1.5]" />
        </div>

        {/* Mono Label */}
        <div className="font-mono text-[10px] uppercase tracking-wider text-muted mb-3 px-3 py-1 rounded-none border border-border bg-surface-alt font-medium">
          404 // ROUTE ANOMALY
        </div>

        {/* Headline */}
        <h1 className="font-sans font-bold text-4xl sm:text-5xl text-text tracking-tight mb-4">
          Sector not found.
        </h1>

        {/* Subhead */}
        <p className="text-muted text-sm font-normal max-w-md mx-auto leading-relaxed mb-8 font-sans">
          The requested roadway telemetry coordinate, inspection run, or sector log does not exist within the active patrol grid.
        </p>

        {/* Two CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
          <Link
            to="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-none bg-text text-bg border border-border-strong font-mono text-[11px] font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
            RETURN TO DASHBOARD
          </Link>
          <Link
            to="/history"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-none border border-border bg-surface hover:bg-surface-alt text-text font-mono text-[11px] uppercase tracking-wider transition-colors"
          >
            VIEW ALL INSPECTIONS
          </Link>
        </div>

        {/* Technical Footer */}
        <div className="mt-8 pt-6 border-t border-border flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-muted w-full font-medium">
          <span>GRID: LAT 34.0522° N // LON 118.2437° W</span>
          <span>STATUS: UNMAPPED ROUTE</span>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
