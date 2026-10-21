import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getInspectionHistory } from '../services/api';
import { InspectionSummary, DamageClass, Severity, DAMAGE_CLASSES } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SeverityBadge } from '../components/ui/SeverityBadge';
import { DamageClassChip } from '../components/ui/DamageClassChip';
import { ConfidenceBar } from '../components/ui/ConfidenceBar';
import { LoadingState } from '../components/ui/LoadingState';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import {
  Search,
  LayoutGrid,
  List,
  Video,
  Image as ImageIcon,
  ArrowRight,
  SlidersHorizontal,
  RotateCcw,
  Download,
} from 'lucide-react';

export const InspectionHistory: React.FC = () => {
  const navigate = useNavigate();
  const [inspections, setInspections] = useState<InspectionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMediaType, setSelectedMediaType] = useState<'all' | 'VIDEO' | 'IMAGE'>('all');
  const [selectedDamageClass, setSelectedDamageClass] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInspectionHistory();
      setInspections(data);
    } catch (err: any) {
      console.error('Failed to load inspection history:', err);
      setError(err?.message || 'Failed to load inspection telemetry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtered Inspections
  const filteredInspections = useMemo(() => {
    return inspections.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesId = item.id.toLowerCase().includes(query);
        const label = DAMAGE_CLASSES[item.damageClass]?.label || '';
        const matchesType = item.damageClass.toLowerCase().includes(query) || label.toLowerCase().includes(query);
        if (!matchesId && !matchesType) {
          return false;
        }
      }

      // Media type
      if (selectedMediaType !== 'all' && item.inputType !== selectedMediaType) {
        return false;
      }

      // Damage class
      if (selectedDamageClass !== 'all' && item.damageClass !== selectedDamageClass) {
        return false;
      }

      // Severity
      if (selectedSeverity !== 'all' && item.severity !== selectedSeverity) {
        return false;
      }

      // Status
      if (selectedStatus !== 'all' && item.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [inspections, searchQuery, selectedMediaType, selectedDamageClass, selectedSeverity, selectedStatus]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedMediaType('all');
    setSelectedDamageClass('all');
    setSelectedSeverity('all');
    setSelectedStatus('all');
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Input Type', 'Damage Class', 'Damage Label', 'Confidence', 'Frames Checked', 'Severity', 'Status', 'Date'];
    const rows = filteredInspections.map((i) => [
      i.id,
      i.inputType,
      i.damageClass,
      `"${DAMAGE_CLASSES[i.damageClass]?.label || i.damageClass}"`,
      `${i.confidence}%`,
      i.framesChecked,
      i.severity,
      i.status,
      `"${i.createdAt}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `roadguard_inspections_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // KPI calculations
  const totalCount = inspections.length;
  const highSeverityCount = inspections.filter((i) => i.severity === 'HIGH').length;
  const pendingCount = inspections.filter((i) => i.status === 'WAITING_FOR_APPROVAL').length;
  const approvedCount = inspections.filter((i) => i.status === 'APPROVED').length;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Page Title & KPI Banner */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-border">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-wider text-muted mb-2 font-medium">
            AUDIT ARCHIVE // HISTORICAL TELEMETRY
          </div>
          <h1 className="font-sans font-bold text-4xl sm:text-5xl tracking-tight text-text">
            Inspection History & Audit Trail
          </h1>
          <p className="text-muted text-sm mt-3 font-normal max-w-2xl font-sans leading-relaxed">
            Comprehensive audit registry of all autonomous video runs, still observations, temporal persistence checks, and municipal sign-offs.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-none border border-border bg-surface hover:bg-surface-alt text-text font-mono text-[11px] uppercase tracking-wider transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-muted" />
            EXPORT CSV
          </button>
          <Link
            to="/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-none bg-text text-bg border border-border-strong font-mono text-[11px] font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
          >
            NEW INSPECTION
          </Link>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-none bg-surface border border-border">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted block mb-1 font-medium">
            TOTAL INSPECTIONS
          </span>
          <div className="font-mono font-bold text-3xl text-text">{totalCount}</div>
        </div>
        <div className="p-4 rounded-none bg-surface border border-border">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted block mb-1 font-medium">
            HIGH HAZARDS
          </span>
          <div className="font-mono font-bold text-3xl text-sev-high">
            {highSeverityCount}
          </div>
        </div>
        <div className="p-4 rounded-none bg-surface border border-border">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted block mb-1 font-medium">
            WAITING APPROVAL
          </span>
          <div className="font-mono font-bold text-3xl text-hazard">
            {pendingCount}
          </div>
        </div>
        <div className="p-4 rounded-none bg-surface border border-border">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted block mb-1 font-medium">
            AUTHORIZED SIGNOFFS
          </span>
          <div className="font-mono font-bold text-3xl text-sev-low">
            {approvedCount}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-5 rounded-none bg-surface border border-border space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted stroke-[1.5]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID or damage type..."
              className="w-full pl-10 pr-4 py-2 bg-surface-alt border border-border rounded-none text-sm text-text placeholder:text-muted focus:outline-none focus:border-border-strong font-sans"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-surface-alt border border-border rounded-none self-start md:self-auto">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-none transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-text text-bg' : 'text-muted hover:text-text'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-none transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-text text-bg' : 'text-muted hover:text-text'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Dropdowns Bar */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border text-xs font-mono">
          <div className="flex items-center gap-1.5 text-muted uppercase tracking-wider text-[10px] mr-2 font-medium">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>FILTERS:</span>
          </div>

          {/* Media Type */}
          <select
            value={selectedMediaType}
            onChange={(e) => setSelectedMediaType(e.target.value as any)}
            className="bg-surface-alt border border-border text-text text-[11px] px-3 py-1.5 rounded-none focus:outline-none focus:border-border-strong"
          >
            <option value="all">MEDIA: ALL</option>
            <option value="VIDEO">VIDEO ONLY</option>
            <option value="IMAGE">IMAGE ONLY</option>
          </select>

          {/* Damage Class */}
          <select
            value={selectedDamageClass}
            onChange={(e) => setSelectedDamageClass(e.target.value)}
            className="bg-surface-alt border border-border text-text text-[11px] px-3 py-1.5 rounded-none focus:outline-none focus:border-border-strong"
          >
            <option value="all">CLASS: ALL</option>
            <option value="D00">D00 — LONGITUDINAL</option>
            <option value="D10">D10 — TRANSVERSE</option>
            <option value="D20">D20 — ALLIGATOR</option>
            <option value="D40">D40 — POTHOLE</option>
          </select>

          {/* Severity */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-surface-alt border border-border text-text text-[11px] px-3 py-1.5 rounded-none focus:outline-none focus:border-border-strong"
          >
            <option value="all">SEVERITY: ALL</option>
            <option value="HIGH">HIGH SEVERITY</option>
            <option value="MEDIUM">MEDIUM SEVERITY</option>
            <option value="LOW">LOW SEVERITY</option>
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-surface-alt border border-border text-text text-[11px] px-3 py-1.5 rounded-none focus:outline-none focus:border-border-strong"
          >
            <option value="all">STATUS: ALL</option>
            <option value="WAITING_FOR_APPROVAL">PENDING APPROVAL</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="CLOSED">CLOSED</option>
          </select>

          {/* Reset Filters */}
          {(searchQuery ||
            selectedMediaType !== 'all' ||
            selectedDamageClass !== 'all' ||
            selectedSeverity !== 'all' ||
            selectedStatus !== 'all') && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-[10px] text-muted hover:text-text uppercase tracking-wider ml-auto px-2 py-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              CLEAR FILTERS
            </button>
          )}
        </div>
      </div>

      {/* Main Results Display */}
      {error ? (
        <ErrorState
          title="INSPECTION ARCHIVE OFFLINE"
          reason={error}
          onRetry={loadData}
        />
      ) : loading ? (
        <LoadingState variant={viewMode === 'table' ? 'table' : 'card'} count={5} />
      ) : filteredInspections.length === 0 ? (
        <EmptyState
          title="NO MATCHING INSPECTIONS"
          description="No inspection logs match your current search queries and filter parameters."
          action={{
            label: "RESET ALL FILTERS",
            onClick: resetFilters,
          }}
        />
      ) : viewMode === 'table' ? (
        <div className="rounded-none bg-surface overflow-hidden border border-border">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-strong bg-surface-alt font-mono text-[10px] uppercase tracking-wider text-muted">
                  <th className="py-4 px-5">ID & TIMESTAMP</th>
                  <th className="py-4 px-4">TYPE</th>
                  <th className="py-4 px-4">RDD2022 DAMAGE</th>
                  <th className="py-4 px-4">CONFIDENCE</th>
                  <th className="py-4 px-4">FRAMES CHECKED</th>
                  <th className="py-4 px-4">SEVERITY</th>
                  <th className="py-4 px-4">LIFECYCLE STATUS</th>
                  <th className="py-4 px-5 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs font-sans">
                {filteredInspections.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-surface-alt transition-colors group"
                  >
                    {/* ID & Date */}
                    <td className="py-4 px-5">
                      <div className="font-mono text-xs font-semibold text-text tracking-wider">
                        {item.id}
                      </div>
                      <div className="font-mono text-[10px] text-muted mt-0.5">
                        {item.createdAt}
                      </div>
                    </td>

                    {/* Input Media */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {item.inputType === 'VIDEO' ? (
                          <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-text bg-surface-alt border border-border px-2 py-0.5 rounded-none">
                            <Video className="w-3 h-3 text-muted" />
                            VIDEO
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-text bg-surface-alt border border-border px-2 py-0.5 rounded-none">
                            <ImageIcon className="w-3 h-3 text-muted" />
                            IMAGE
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Damage */}
                    <td className="py-4 px-4">
                      <DamageClassChip
                        damageClass={item.damageClass as DamageClass}
                        size="sm"
                      />
                    </td>

                    {/* Confidence */}
                    <td className="py-4 px-4 font-mono text-xs text-text">
                      <span className="font-bold">{item.confidence}%</span>
                    </td>

                    {/* Frames Checked */}
                    <td className="py-4 px-4 font-mono text-xs text-muted">
                      {item.framesChecked} frames
                    </td>

                    {/* Severity */}
                    <td className="py-4 px-4">
                      <SeverityBadge severity={item.severity as Severity} size="sm" />
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <StatusBadge status={item.status as any} size="sm" />
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/live/${item.id}`}
                          className="px-3 py-1.5 rounded-none border border-border bg-surface hover:bg-surface-alt text-text font-mono text-[10px] uppercase tracking-wider transition-colors"
                        >
                          COCKPIT
                        </Link>
                        <Link
                          to={`/inspection/${item.id}`}
                          className="p-1.5 rounded-none border border-border hover:bg-surface-alt text-muted hover:text-text transition-colors"
                          title="View Telemetry Record"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List (below 768px) */}
          <div className="md:hidden divide-y divide-border p-4 space-y-4">
            {filteredInspections.map((item) => (
              <div key={item.id} className="pt-3 first:pt-0 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-text">{item.id}</span>
                  <span className="font-mono text-[10px] text-muted">{item.createdAt}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <DamageClassChip damageClass={item.damageClass} size="sm" />
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={item.severity} size="sm" />
                    <StatusBadge status={item.status as any} size="sm" />
                  </div>
                </div>
                <div className="flex items-center justify-between font-mono text-[10px] text-muted">
                  <span>Confidence: {item.confidence}%</span>
                  <span>{item.framesChecked} frames</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Link
                    to={`/live/${item.id}`}
                    className="flex-1 text-center py-1.5 rounded-none border border-border bg-surface text-text font-mono text-[10px] uppercase tracking-wider"
                  >
                    Cockpit
                  </Link>
                  <Link
                    to={`/inspection/${item.id}`}
                    className="flex-1 text-center py-1.5 rounded-none bg-text text-bg border border-border-strong font-mono text-[10px] font-bold uppercase tracking-wider"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Table Footer */}
          <div className="p-4 border-t border-border bg-surface-alt flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted">
            <span>
              SHOWING {filteredInspections.length} OF {inspections.length} AUDIT RECORDS
            </span>
            <span>OPENCV 5 COOL HARDWARE ACCELERATED</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInspections.map((item) => (
            <Link
              key={item.id}
              to={`/inspection/${item.id}`}
              className="block rounded-none bg-surface p-5 hover:border-border-strong border border-border transition-colors group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-none border border-border bg-surface-alt text-muted">
                    {item.inputType === 'VIDEO' ? (
                      <Video className="w-3.5 h-3.5 stroke-[1.5]" />
                    ) : (
                      <ImageIcon className="w-3.5 h-3.5 stroke-[1.5]" />
                    )}
                  </div>
                  <div>
                    <span className="font-mono text-xs font-bold text-text transition-colors">
                      {item.id}
                    </span>
                    <div className="font-mono text-[10px] text-muted uppercase tracking-wider mt-0.5">
                      {item.createdAt}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <SeverityBadge severity={item.severity} size="sm" />
                  <StatusBadge status={item.status} size="sm" />
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3 items-center">
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-muted block mb-1 font-medium">
                      CLASSIFICATION
                    </span>
                    <DamageClassChip
                      damageClass={item.damageClass}
                      size="sm"
                    />
                  </div>

                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-muted block mb-1 font-medium">
                      CONFIDENCE
                    </span>
                    <ConfidenceBar confidence={item.confidence} size="sm" />
                  </div>
                </div>

                <div className="flex items-center justify-between font-mono text-[10px] text-muted uppercase tracking-wider pt-2 border-t border-border">
                  <span>{item.framesChecked} FRAMES INGESTED</span>
                  <span className="flex items-center gap-1 text-text group-hover:text-text transition-colors font-bold">
                    OPEN INSPECTION <ArrowRight className="w-3 h-3 stroke-[2]" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default InspectionHistory;
