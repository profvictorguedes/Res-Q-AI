'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DispatchAnalysis, Hazard, PathPoint } from '@/types/dispatch';

interface IncidentMapProps {
  analysis: DispatchAnalysis | null;
}

const HAZARD_COLORS: Record<Hazard['type'], string> = {
  fire: '#FF4444',
  chemical: '#9932CC',
  structural: '#FF8C00',
  electrical: '#FFD700',
  gas: '#00CED1',
  unknown: '#808080',
};

const HAZARD_ICONS: Record<Hazard['type'], string> = {
  fire: '🔥',
  chemical: '☣️',
  structural: '🏚️',
  electrical: '⚡',
  gas: '💨',
  unknown: '⚠️',
};

const SEVERITY_RADIUS: Record<Hazard['severity'], number> = {
  low: 30,
  medium: 50,
  high: 70,
  critical: 100,
};

export default function IncidentMap({ analysis }: IncidentMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Layer[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        center: [40.7128, -74.0060],
        zoom: 17,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !analysis) return;

    const map = mapInstanceRef.current;

    markersRef.current.forEach(layer => map.removeLayer(layer));
    markersRef.current = [];

    const { coordinates } = analysis.location;
    map.setView([coordinates.lat, coordinates.lng], 17);

    const incidentIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        background: #E53935;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
      ">📍</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const incidentMarker = L.marker([coordinates.lat, coordinates.lng], { icon: incidentIcon })
      .addTo(map)
      .bindPopup(`
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; color: #E53935; font-weight: bold;">${analysis.incidentType}</h3>
          <p style="margin: 0 0 4px 0;"><strong>Address:</strong> ${analysis.location.address}</p>
          ${analysis.location.buildingType ? `<p style="margin: 0 0 4px 0;"><strong>Building:</strong> ${analysis.location.buildingType}</p>` : ''}
          <p style="margin: 0; color: ${getSeverityColor(analysis.incidentSeverity)};"><strong>Severity:</strong> ${analysis.incidentSeverity.toUpperCase()}</p>
        </div>
      `);
    markersRef.current.push(incidentMarker);

    analysis.hazards.forEach((hazard) => {
      const color = HAZARD_COLORS[hazard.type];
      const radius = SEVERITY_RADIUS[hazard.severity];

      const circle = L.circle([hazard.location.lat, hazard.location.lng], {
        color: color,
        fillColor: color,
        fillOpacity: 0.3,
        radius: radius,
        weight: 2,
      }).addTo(map);
      markersRef.current.push(circle);

      const hazardIcon = L.divIcon({
        className: 'hazard-marker',
        html: `<div style="
          background: ${color};
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        ">${HAZARD_ICONS[hazard.type]}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const hazardMarker = L.marker([hazard.location.lat, hazard.location.lng], { icon: hazardIcon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width: 180px;">
            <h3 style="margin: 0 0 8px 0; color: ${color};">
              ${HAZARD_ICONS[hazard.type]} ${hazard.type.toUpperCase()} HAZARD
            </h3>
            <p style="margin: 0 0 4px 0;">${hazard.description}</p>
            <p style="margin: 0; color: ${getSeverityColor(hazard.severity)};">
              <strong>Severity:</strong> ${hazard.severity.toUpperCase()}
            </p>
          </div>
        `);
      markersRef.current.push(hazardMarker);
    });

    analysis.entryExitPaths.forEach((path) => {
      addPathMarker(map, path, markersRef.current);
    });

    if (analysis.entryExitPaths.length >= 2) {
      const entryPoints = analysis.entryExitPaths.filter(p => p.type === 'entry');
      const exitPoints = analysis.entryExitPaths.filter(p => p.type === 'exit');

      entryPoints.forEach(entry => {
        const entryLine = L.polyline([
          [entry.location.lat, entry.location.lng],
          [coordinates.lat, coordinates.lng]
        ], {
          color: '#4CAF50',
          weight: 3,
          opacity: 0.7,
          dashArray: '10, 10',
        }).addTo(map);
        markersRef.current.push(entryLine);
      });

      exitPoints.forEach(exit => {
        const exitLine = L.polyline([
          [coordinates.lat, coordinates.lng],
          [exit.location.lat, exit.location.lng]
        ], {
          color: '#2196F3',
          weight: 3,
          opacity: 0.7,
          dashArray: '10, 10',
        }).addTo(map);
        markersRef.current.push(exitLine);
      });
    }

  }, [analysis]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      {analysis && (
        <div className="absolute bottom-4 left-4 bg-white/95 p-3 rounded-lg shadow-lg text-xs sm:text-sm max-w-[200px] sm:max-w-xs">
          <h4 className="font-bold mb-2 text-gray-800">Legend</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-green-500 flex-shrink-0"></span>
              <span className="text-gray-700">Entry Point</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-blue-500 flex-shrink-0"></span>
              <span className="text-gray-700">Exit Point</span>
            </div>
            {analysis.hazards.map((hazard, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span 
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: HAZARD_COLORS[hazard.type] }}
                ></span>
                <span className="text-gray-700">{hazard.type.charAt(0).toUpperCase() + hazard.type.slice(1)} Hazard</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function addPathMarker(map: L.Map, path: PathPoint, markers: L.Layer[]) {
  const isEntry = path.type === 'entry';
  const color = isEntry ? '#4CAF50' : '#2196F3';
  const symbol = isEntry ? '▶' : '◀';

  const pathIcon = L.divIcon({
    className: 'path-marker',
    html: `<div style="
      background: ${color};
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 14px;
      font-weight: bold;
    ">${symbol}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

  const marker = L.marker([path.location.lat, path.location.lng], { icon: pathIcon })
    .addTo(map)
    .bindPopup(`
      <div style="min-width: 150px;">
        <h3 style="margin: 0 0 8px 0; color: ${color};">
          ${isEntry ? '▶ ENTRY POINT' : '◀ EXIT POINT'}
        </h3>
        <p style="margin: 0;">${path.description}</p>
      </div>
    `);
  markers.push(marker);
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical': return '#D32F2F';
    case 'high': return '#F57C00';
    case 'medium': return '#FBC02D';
    case 'low': return '#388E3C';
    default: return '#757575';
  }
}
