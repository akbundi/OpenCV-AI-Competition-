/**
 * Generates inline SVG data URIs representing simulated road camera inspection frames.
 */

export function generateRoadFrameSvg(
  frameNumber: number,
  damageType: 'pothole' | 'longitudinal' | 'transverse' | 'alligator' = 'pothole',
  options?: { showOverlay?: boolean; confidence?: number }
): string {
  const showOverlay = options?.showOverlay ?? false;
  const confidence = options?.confidence ?? 85;

  const width = 1280;
  const height = 720;

  // Road lane markings
  const centerLineX = width / 2;

  // Damage anomaly geometry based on type
  let anomalySvg = '';
  let bboxSvg = '';

  if (damageType === 'pothole') {
    // Pothole void centered in lane 2
    anomalySvg = `
      <!-- Pothole cavity -->
      <ellipse cx="580" cy="430" rx="90" ry="55" fill="#0d0d0f" stroke="#252528" stroke-width="4" />
      <ellipse cx="585" cy="435" rx="70" ry="40" fill="#050507" />
      <!-- Fractured asphalt edges -->
      <path d="M 495 425 Q 520 405 555 410 Q 580 395 620 405 Q 655 415 665 435 Q 660 465 625 480 Q 580 485 540 475 Q 500 460 495 425 Z" fill="#131316" opacity="0.8" />
    `;

    if (showOverlay) {
      bboxSvg = `
        <!-- Detection Bounding Box -->
        <rect x="480" y="370" width="200" height="130" fill="none" stroke="#E5484D" stroke-width="3" stroke-dasharray="8 4" />
        <rect x="480" y="340" width="160" height="28" fill="#E5484D" rx="2" />
        <text x="490" y="359" fill="#FFFFFF" font-family="monospace" font-size="14" font-weight="bold">D40 POTHOLE ${confidence}%</text>
      `;
    }
  } else if (damageType === 'longitudinal') {
    anomalySvg = `
      <path d="M 570 200 L 585 360 L 575 520 L 590 680" stroke="#16161a" stroke-width="8" stroke-linecap="round" fill="none" />
      <path d="M 572 200 L 587 360 L 577 520 L 592 680" stroke="#0a0a0c" stroke-width="4" stroke-linecap="round" fill="none" />
    `;
    if (showOverlay) {
      bboxSvg = `
        <rect x="540" y="240" width="90" height="380" fill="none" stroke="#38BDF8" stroke-width="3" stroke-dasharray="8 4" />
        <rect x="540" y="210" width="180" height="28" fill="#38BDF8" rx="2" />
        <text x="550" y="229" fill="#000000" font-family="monospace" font-size="14" font-weight="bold">D00 LONGITUDINAL ${confidence}%</text>
      `;
    }
  } else if (damageType === 'transverse') {
    anomalySvg = `
      <path d="M 320 460 L 500 455 L 680 465 L 860 458" stroke="#141418" stroke-width="8" fill="none" />
      <path d="M 320 461 L 500 456 L 680 466 L 860 459" stroke="#08080a" stroke-width="4" fill="none" />
    `;
    if (showOverlay) {
      bboxSvg = `
        <rect x="360" y="420" width="460" height="85" fill="none" stroke="#2DD4BF" stroke-width="3" stroke-dasharray="8 4" />
        <rect x="360" y="390" width="170" height="28" fill="#2DD4BF" rx="2" />
        <text x="370" y="409" fill="#000000" font-family="monospace" font-size="14" font-weight="bold">D10 TRANSVERSE ${confidence}%</text>
      `;
    }
  } else {
    // Alligator
    anomalySvg = `
      <path d="M 500 400 L 540 430 L 520 460 L 480 440 Z M 540 430 L 600 420 L 590 465 L 520 460 Z M 590 465 L 630 490 L 580 520 L 520 460 Z" stroke="#121216" stroke-width="5" fill="#18181e" />
    `;
    if (showOverlay) {
      bboxSvg = `
        <rect x="460" y="380" width="190" height="150" fill="none" stroke="#F59E0B" stroke-width="3" stroke-dasharray="8 4" />
        <rect x="460" y="350" width="160" height="28" fill="#F59E0B" rx="2" />
        <text x="470" y="369" fill="#000000" font-family="monospace" font-size="14" font-weight="bold">D20 ALLIGATOR ${confidence}%</text>
      `;
    }
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <defs>
        <linearGradient id="asphaltGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#2a2b2f" />
          <stop offset="60%" stop-color="#1f2024" />
          <stop offset="100%" stop-color="#18191c" />
        </linearGradient>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0a0f18" />
          <stop offset="100%" stop-color="#1a202c" />
        </linearGradient>
      </defs>

      <!-- Horizon Sky -->
      <rect x="0" y="0" width="${width}" height="180" fill="url(#skyGrad)" />

      <!-- Road Surface Perspective -->
      <polygon points="0,${height} ${width},${height} ${centerLineX + 160},180 ${centerLineX - 160},180" fill="url(#asphaltGrad)" />

      <!-- Road Shoulders -->
      <polygon points="0,${height} 140,${height} ${centerLineX - 160},180 0,180" fill="#141518" />
      <polygon points="${width - 140},${height} ${width},${height} ${width},180 ${centerLineX + 160},180" fill="#141518" />

      <!-- Road Lane Markings (White Dashed Centerline) -->
      <polygon points="${centerLineX - 6},650 ${centerLineX + 6},650 ${centerLineX + 3},550 ${centerLineX - 3},550" fill="#FFFFFF" opacity="0.85" />
      <polygon points="${centerLineX - 4},480 ${centerLineX + 4},480 ${centerLineX + 2},410 ${centerLineX - 2},410" fill="#FFFFFF" opacity="0.8" />
      <polygon points="${centerLineX - 3},360 ${centerLineX + 3},360 ${centerLineX + 1.5},310 ${centerLineX - 1.5},310" fill="#FFFFFF" opacity="0.7" />
      <polygon points="${centerLineX - 2},270 ${centerLineX + 2},270 ${centerLineX + 1},230 ${centerLineX - 1},230" fill="#FFFFFF" opacity="0.6" />

      <!-- Edge Solid Striping -->
      <polygon points="140,${height} 150,${height} ${centerLineX - 150},180 ${centerLineX - 155},180" fill="#F59E0B" opacity="0.8" />
      <polygon points="${width - 150},${height} ${width - 140},${height} ${centerLineX + 155},180 ${centerLineX + 150},180" fill="#FFFFFF" opacity="0.8" />

      <!-- Road Damage Anomaly -->
      ${anomalySvg}

      <!-- Optical Camera Telemetry Overlay -->
      <rect x="20" y="20" width="300" height="50" fill="#080808" fill-opacity="0.75" rx="6" stroke="#FFFFFF" stroke-opacity="0.1" />
      <text x="35" y="42" fill="#E2E8F0" font-family="monospace" font-size="12" font-weight="bold">CAM-01 [4K 60FPS HDR]</text>
      <text x="35" y="58" fill="#94A3B8" font-family="monospace" font-size="11">FRAME #${String(frameNumber).padStart(4, '0')} • 2026-10-07 10:00:0${frameNumber}</text>

      ${bboxSvg}
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}
