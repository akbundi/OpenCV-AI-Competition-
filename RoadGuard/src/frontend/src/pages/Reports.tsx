import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getInspectionHistory, getInspectionDetail, getReport } from '../services/api';
import { Severity, Report } from '../types';
import { ReportPreview } from '../components/inspection/ReportPreview';
import { LoadingState } from '../components/ui/LoadingState';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import {
  Search,
  SlidersHorizontal,
} from 'lucide-react';

export const Reports: React.FC = () => {
  const navigate = useNavigate();
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | Severity>('all');

  const loadReports = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const summaries = await getInspectionHistory();
      const fullInspections = await Promise.all(
        summaries.map(async (s) => {
          const insp = await getInspectionDetail(s.id);
          if (insp.reportId) {
            try {
              const rep = await getReport(insp.id);
              return { ...insp, report: rep };
            } catch {
              return insp;
            }
          }
          return insp;
        })
      );
      const withReports = fullInspections.filter(
        (insp) => insp.reportId || ['WAITING_FOR_APPROVAL', 'APPROVED', 'REJECTED'].includes(insp.status)
      );
      setInspections(withReports);
    } catch (err: any) {
      console.error('Failed to load reports:', err);
      setError(err?.message || 'Failed to retrieve maintenance reports.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const filteredInspections = useMemo(() => {
    return inspections.filter((insp) => {
      // Tab filter
      if (activeTab === 'pending' && insp.status !== 'WAITING_FOR_APPROVAL') return false;
      if (activeTab === 'approved' && insp.status !== 'APPROVED') return false;
      if (activeTab === 'rejected' && insp.status !== 'REJECTED') return false;

      // Severity filter
      if (severityFilter !== 'all' && insp.severity !== severityFilter) return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesId = (insp.report?.id || '').toLowerCase().includes(query) || insp.id.toLowerCase().includes(query);
        const matchesTitle = insp.title.toLowerCase().includes(query);
        const matchesLocation = (insp.roadPosition || insp.location || '').toLowerCase().includes(query);
        const matchesRecommendation = (insp.report?.recommendation || '').toLowerCase().includes(query);
        if (!matchesId && !matchesTitle && !matchesLocation && !matchesRecommendation) {
          return false;
        }
      }

      return true;
    });
  }, [inspections, activeTab, severityFilter, searchQuery]);

  // Counts
  const totalCount = inspections.length;
  const pendingCount = inspections.filter((i) => i.status === 'WAITING_FOR_APPROVAL').length;
  const approvedCount = inspections.filter((i) => i.status === 'APPROVED').length;
  const highSeverityCount = inspections.filter((i) => i.severity === 'HIGH').length;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-border">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-wider text-muted mb-2 font-medium">
            MUNICIPAL WORK ORDERS // CERTIFIED ENGINEERING BRIEFS
          </div>
          <h1 className="font-sans font-bold text-4xl sm:text-5xl tracking-tight text-text">
            Maintenance Reports
          </h1>
          <p className="text-muted text-sm mt-3 font-normal max-w-2xl font-sans leading-relaxed">
            Official pavement repair briefs generated with multi-frame OpenCV 5 evidence packets, engineering recommendations, and municipal sign-off status.
          </p>
        </div>

        {/* Header Action */}
        <div className="flex items-center gap-3">
          <Link
            to="/history"
            className="flex items-center gap-2 px-4 py-2.5 rounded-none border border-border bg-surface hover:bg-surface-alt text-text font-mono text-[11px] uppercase tracking-wider transition-colors"
          >
            INSPECTION ARCHIVE
          </Link>
          <Link
            to="/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-none bg-text text-bg border border-border-strong font-mono text-[11px] font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
          >
            NEW INSPECTION
          </Link>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-none bg-surface border border-border">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted block mb-1 font-medium">
            ACTIVE BRIEFS
          </span>
          <div className="font-mono font-bold text-3xl text-text">{totalCount}</div>
        </div>
        <div className="p-4 rounded-none bg-surface border border-border">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted block mb-1 font-medium">
            AWAITING SIGN-OFF
          </span>
          <div className="font-mono font-bold text-3xl text-hazard">
            {pendingCount}
          </div>
        </div>
        <div className="p-4 rounded-none bg-surface border border-border">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted block mb-1 font-medium">
            AUTHORIZED DISPATCH
          </span>
          <div className="font-mono font-bold text-3xl text-sev-low">
            {approvedCount}
          </div>
        </div>
        <div className="p-4 rounded-none bg-surface border border-border">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted block mb-1 font-medium">
            HIGH HAZARD REPAIRS
          </span>
          <div className="font-mono font-bold text-3xl text-sev-high">
            {highSeverityCount}
          </div>
        </div>
      </div>

      {/* Filter and Tab Bar */}
      <div className="space-y-4">
        {/* Primary Status Tabs */}
        <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-border">
          {[
            { id: 'all', label: `ALL WORK ORDERS (${totalCount})` },
            { id: 'pending', label: `AWAITING SIGN-OFF (${pendingCount})` },
            { id: 'approved', label: `AUTHORIZED (${approvedCount})` },
            { id: 'rejected', label: `REJECTED (${inspections.filter((i) => i.status === 'REJECTED').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`font-mono text-[11px] uppercase tracking-wider px-4 py-2 rounded-none transition-colors cursor-pointer border ${
                activeTab === tab.id
                  ? 'bg-text text-bg border-border-strong font-bold'
                  : 'bg-surface text-muted hover:text-text border-border'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Secondary Search & Severity Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted stroke-[1.5]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by ID, location, or repair type..."
              className="w-full pl-10 pr-4 py-2 bg-surface-alt border border-border rounded-none text-sm text-text placeholder:text-muted focus:outline-none focus:border-border-strong font-sans"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted font-medium">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>SEVERITY:</span>
            </div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              className="bg-surface-alt border border-border text-text text-[11px] font-mono px-3 py-1.5 rounded-none focus:outline-none focus:border-border-strong"
            >
              <option value="all">ALL SEVERITIES</option>
              <option value="HIGH">HIGH SEVERITY</option>
              <option value="MEDIUM">MEDIUM SEVERITY</option>
              <option value="LOW">LOW SEVERITY</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      {error ? (
        <ErrorState
          title="WORK ORDERS TELEMETRY OFFLINE"
          reason={error}
          onRetry={loadReports}
        />
      ) : loading ? (
        <LoadingState variant="card" count={6} />
      ) : filteredInspections.length === 0 ? (
        <EmptyState
          title="NO WORK ORDERS FOUND"
          description="No maintenance reports match your current filter and search criteria."
          action={{
            label: "RESET FILTERS",
            onClick: () => {
              setActiveTab('all');
              setSearchQuery('');
              setSeverityFilter('all');
            },
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInspections.map((insp) => {
            const rep: Report = insp.report || {
              id: insp.reportId || `REP-${insp.id.replace('INSP-', '')}`,
              inspectionId: insp.id,
              status: (insp.status === 'APPROVED' ? 'APPROVED' : insp.status === 'REJECTED' ? 'REJECTED' : 'PENDING'),
              severity: insp.severity || 'LOW',
              damageClass: insp.damageClass || 'D00',
              confidence: insp.confidence || 0,
              roadPosition: insp.roadPosition || insp.location || 'Unknown',
              persistenceFrames: insp.persistenceFrames || 0,
              recommendation: 'Standard autonomous pavement assessment work order.',
              evidence: insp.evidence || [],
              generatedAt: insp.createdAt || new Date().toISOString(),
            };
            return (
              <ReportPreview
                key={insp.id}
                report={rep}
                onClick={() => navigate(`/reports/${insp.id}`)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Reports;
