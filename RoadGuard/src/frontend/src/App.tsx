import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { NewInspection } from './pages/NewInspection';
import { LiveInspection } from './pages/LiveInspection';
import { InspectionHistory } from './pages/InspectionHistory';
import { InspectionDetail } from './pages/InspectionDetail';
import { Reports } from './pages/Reports';
import { ReportDetail } from './pages/ReportDetail';
import { PerformanceBenchmark } from './pages/PerformanceBenchmark';
import { ModelEvaluation } from './pages/ModelEvaluation';
import { SystemArchitecture } from './pages/SystemArchitecture';
import { AIAssistant } from './pages/AIAssistant';
import { NotFound } from './pages/NotFound';
import { ComponentShowcase } from './components/demo/ComponentShowcase';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="new" element={<NewInspection />} />
          <Route path="live/:id" element={<LiveInspection />} />
          <Route path="live" element={<Navigate to="/live/RG-0001" replace />} />
          <Route path="history" element={<InspectionHistory />} />
          <Route path="inspection/:id" element={<InspectionDetail />} />
          <Route path="assistant" element={<AIAssistant />} />
          <Route path="reports" element={<Reports />} />
          <Route path="reports/:id" element={<ReportDetail />} />
          <Route path="performance" element={<PerformanceBenchmark />} />
          <Route path="evaluation" element={<ModelEvaluation />} />
          <Route path="architecture" element={<SystemArchitecture />} />
          <Route path="components-demo" element={<ComponentShowcase />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
