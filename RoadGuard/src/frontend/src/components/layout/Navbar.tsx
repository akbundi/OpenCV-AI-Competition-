import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useThemeStore } from '../../store/useThemeStore';
import {
  ChevronDown,
  Menu,
  X,
  Sun,
  Moon,
  ArrowUpRight,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useThemeStore();

  const [inspectionsOpen, setInspectionsOpen] = useState(false);
  const [performanceOpen, setPerformanceOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const inspectionsRef = useRef<HTMLDivElement>(null);
  const performanceRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on route change
  useEffect(() => {
    setInspectionsOpen(false);
    setPerformanceOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inspectionsRef.current && !inspectionsRef.current.contains(event.target as Node)) {
        setInspectionsOpen(false);
      }
      if (performanceRef.current && !performanceRef.current.contains(event.target as Node)) {
        setPerformanceOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isInspectionsActive =
    location.pathname === '/new' ||
    location.pathname.startsWith('/live') ||
    location.pathname === '/history' ||
    location.pathname.startsWith('/inspection');

  const isPerformanceActive =
    location.pathname === '/performance' || location.pathname === '/evaluation';

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-surface border-b border-border transition-colors">
        <div className="w-[92vw] mx-auto py-3.5 flex items-center justify-between gap-6">
          {/* LEFT: Brand */}
          <NavLink to="/" className="flex items-center gap-2 shrink-0 group">
            <span className="font-mono text-xs font-bold px-1.5 py-0.5 bg-accent text-black tracking-wider">
              DOT
            </span>
            <span className="font-mono text-sm tracking-[0.25em] uppercase text-text font-bold">
              ROADGUARD
            </span>
          </NavLink>

          {/* CENTER: Desktop Nav Links (hidden below 900px) */}
          <nav className="hidden min-[900px]:flex items-center gap-7">
            {/* Dashboard Link */}
            <NavLink
              to="/"
              className={({ isActive }) =>
                `font-mono text-[11px] uppercase tracking-[0.18em] transition-colors relative py-1 ${
                  isActive ? 'text-text font-semibold' : 'text-muted hover:text-text'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span>Dashboard</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent" />
                  )}
                </>
              )}
            </NavLink>

            {/* Inspections Dropdown */}
            <div className="relative" ref={inspectionsRef}>
              <button
                type="button"
                onClick={() => {
                  setInspectionsOpen(!inspectionsOpen);
                  setPerformanceOpen(false);
                }}
                className={`font-mono text-[11px] uppercase tracking-[0.18em] transition-colors flex items-center gap-1.5 py-1 ${
                  isInspectionsActive ? 'text-text font-semibold' : 'text-muted hover:text-text'
                }`}
              >
                <span>Inspections</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-150 stroke-[1.5] ${
                    inspectionsOpen ? 'rotate-180' : ''
                  }`}
                />
                {isInspectionsActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent" />
                )}
              </button>

              {/* Dropdown Menu */}
              {inspectionsOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 p-1 bg-surface border border-border-strong rounded-none shadow-none z-50">
                  <NavLink
                    to="/new"
                    className="block px-3 py-2 text-text hover:bg-surface-alt transition-colors"
                  >
                    <div className="font-mono text-[11px] uppercase tracking-[0.15em] font-medium">New Inspection</div>
                    <div className="text-[10px] text-muted font-mono mt-0.5">Upload image or video</div>
                  </NavLink>
                  <NavLink
                    to="/live/RG-0001"
                    className="block px-3 py-2 text-text hover:bg-surface-alt transition-colors"
                  >
                    <div className="font-mono text-[11px] uppercase tracking-[0.15em] font-medium flex items-center justify-between">
                      <span>Live Inspection</span>
                      <span className="text-[9px] px-1 py-0.2 border border-border text-muted">DEMO</span>
                    </div>
                    <div className="text-[10px] text-muted font-mono mt-0.5">Real-time agent driver</div>
                  </NavLink>
                  <NavLink
                    to="/history"
                    className="block px-3 py-2 text-text hover:bg-surface-alt transition-colors"
                  >
                    <div className="font-mono text-[11px] uppercase tracking-[0.15em] font-medium">Inspection History</div>
                    <div className="text-[10px] text-muted font-mono mt-0.5">Archive & search log</div>
                  </NavLink>
                </div>
              )}
            </div>

            {/* Assistant Link */}
            <NavLink
              to="/assistant"
              className={({ isActive }) =>
                `font-mono text-[11px] uppercase tracking-[0.18em] transition-colors relative py-1 ${
                  isActive ? 'text-text font-semibold' : 'text-muted hover:text-text'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span>Assistant</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent" />
                  )}
                </>
              )}
            </NavLink>

            {/* Reports Link */}
            <NavLink
              to="/reports"
              className={({ isActive }) =>
                `font-mono text-[11px] uppercase tracking-[0.18em] transition-colors relative py-1 ${
                  isActive ? 'text-text font-semibold' : 'text-muted hover:text-text'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span>Reports</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent" />
                  )}
                </>
              )}
            </NavLink>

            {/* Performance Dropdown */}
            <div className="relative" ref={performanceRef}>
              <button
                type="button"
                onClick={() => {
                  setPerformanceOpen(!performanceOpen);
                  setInspectionsOpen(false);
                }}
                className={`font-mono text-[11px] uppercase tracking-[0.18em] transition-colors flex items-center gap-1.5 py-1 ${
                  isPerformanceActive ? 'text-text font-semibold' : 'text-muted hover:text-text'
                }`}
              >
                <span>Performance</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-150 stroke-[1.5] ${
                    performanceOpen ? 'rotate-180' : ''
                  }`}
                />
                {isPerformanceActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent" />
                )}
              </button>

              {/* Dropdown Menu */}
              {performanceOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 p-1 bg-surface border border-border-strong rounded-none shadow-none z-50">
                  <NavLink
                    to="/performance"
                    className="block px-3 py-2 text-text hover:bg-surface-alt transition-colors"
                  >
                    <div className="font-mono text-[11px] uppercase tracking-[0.15em] font-medium">COOL Benchmark</div>
                    <div className="text-[10px] text-muted font-mono mt-0.5">ARM Graviton vs x86</div>
                  </NavLink>
                  <NavLink
                    to="/evaluation"
                    className="block px-3 py-2 text-text hover:bg-surface-alt transition-colors"
                  >
                    <div className="font-mono text-[11px] uppercase tracking-[0.15em] font-medium">Model Evaluation</div>
                    <div className="text-[10px] text-muted font-mono mt-0.5">RDD2022 confusion matrix</div>
                  </NavLink>
                </div>
              )}
            </div>

            {/* Architecture Link */}
            <NavLink
              to="/architecture"
              className={({ isActive }) =>
                `font-mono text-[11px] uppercase tracking-[0.18em] transition-colors relative py-1 ${
                  isActive ? 'text-text font-semibold' : 'text-muted hover:text-text'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span>Architecture</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent" />
                  )}
                </>
              )}
            </NavLink>
          </nav>

          {/* RIGHT: Header widgets & CTA */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light (DOT Manual)' : 'Switch to Dark'}
              className="p-2 rounded-none border border-border bg-surface hover:bg-surface-alt text-text transition-colors"
            >
              {isDark ? (
                <Sun className="w-4 h-4 stroke-[1.5]" />
              ) : (
                <Moon className="w-4 h-4 stroke-[1.5]" />
              )}
            </button>

            {/* Primary CTA (Desktop) */}
            <button
              type="button"
              onClick={() => navigate('/new')}
              className="hidden min-[900px]:inline-flex items-center gap-2 px-4 py-2 rounded-none bg-text text-bg border border-border-strong font-mono text-[11px] font-bold uppercase tracking-[0.18em] hover:opacity-90 transition-opacity"
            >
              <span>NEW INSPECTION</span>
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2]" />
            </button>

            {/* Mobile Menu Hamburger (Below 900px) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="min-[900px]:hidden p-2 rounded-none border border-border bg-surface text-text"
            >
              <Menu className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay (Below 900px) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-bg flex flex-col justify-between p-6">
          {/* Mobile Overlay Header */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <span className="font-mono text-xs tracking-[0.25em] uppercase text-text font-bold flex items-center gap-2">
              <span className="px-1.5 py-0.5 bg-accent text-black font-bold">DOT</span>
              ROADGUARD NAVIGATION
            </span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-none border border-border text-muted hover:text-text bg-surface"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>

          {/* Route Links */}
          <div className="flex-1 flex flex-col justify-center space-y-4 py-6 font-mono uppercase tracking-[0.18em]">
            <NavLink
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm text-muted hover:text-text hover:font-bold transition-all py-1 border-b border-border/50"
            >
              01 — DASHBOARD
            </NavLink>
            <NavLink
              to="/new"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm text-muted hover:text-text hover:font-bold transition-all py-1 border-b border-border/50"
            >
              02 — NEW INSPECTION
            </NavLink>
            <NavLink
              to="/live/RG-0001"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm text-muted hover:text-text hover:font-bold transition-all py-1 border-b border-border/50"
            >
              03 — LIVE INSPECTION (DEMO)
            </NavLink>
            <NavLink
              to="/history"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm text-muted hover:text-text hover:font-bold transition-all py-1 border-b border-border/50"
            >
              04 — INSPECTION HISTORY
            </NavLink>
            <NavLink
              to="/assistant"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm text-muted hover:text-text hover:font-bold transition-all py-1 border-b border-border/50"
            >
              05 — ASSISTANT
            </NavLink>
            <NavLink
              to="/reports"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm text-muted hover:text-text hover:font-bold transition-all py-1 border-b border-border/50"
            >
              06 — MAINTENANCE REPORTS
            </NavLink>
            <NavLink
              to="/performance"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm text-muted hover:text-text hover:font-bold transition-all py-1 border-b border-border/50"
            >
              07 — COOL BENCHMARK
            </NavLink>
            <NavLink
              to="/evaluation"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm text-muted hover:text-text hover:font-bold transition-all py-1 border-b border-border/50"
            >
              08 — MODEL EVALUATION
            </NavLink>
            <NavLink
              to="/architecture"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm text-muted hover:text-text hover:font-bold transition-all py-1 border-b border-border/50"
            >
              09 — SYSTEM ARCHITECTURE
            </NavLink>
          </div>

          {/* Mobile Overlay Footer */}
          <div className="border-t border-border pt-4 flex items-center justify-between font-mono text-[10px] text-muted uppercase tracking-[0.18em]">
            <span>DOT FIELD MANUAL</span>
            <span>OPENCV 5 + COOL</span>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
