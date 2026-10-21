/**
 * RoadGuard Application Configuration
 */

export const USE_MOCK = true;

export const MOCK_STEP_MS = 1500;

export const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'https://api.roadguard.internal/v1';

export const APP_CONFIG = {
  name: 'RoadGuard',
  tagline: 'Autonomous Pavement Inspection System',
  version: '2.4.0',
  autonomousThreshold: 75, // Confidence threshold % for automated promotion
};
