'use client';

import { DispatchAnalysis } from '@/types/dispatch';

interface AnalysisPanelProps {
  analysis: DispatchAnalysis | null;
  isLoading: boolean;
}

const SEVERITY_COLORS = {
  critical: 'bg-red-600',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
};

const HAZARD_ICONS: Record<string, string> = {
  fire: '🔥',
  chemical: '☣️',
  structural: '🏚️',
  electrical: '⚡',
  gas: '💨',
  unknown: '⚠️',
};

export default function AnalysisPanel({ analysis, isLoading }: AnalysisPanelProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 text-center text-gray-500">
        <div className="text-4xl mb-3">📋</div>
        <p className="text-sm sm:text-base">Enter dispatch notes to see the analysis</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(100vh-300px)]">
      {/* Header with Incident Type and Severity */}
      <div className="border-b pb-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">{analysis.incidentType}</h2>
          <span className={`${SEVERITY_COLORS[analysis.incidentSeverity]} text-white text-xs sm:text-sm px-2 py-1 rounded-full font-medium`}>
            {analysis.incidentSeverity.toUpperCase()}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          {new Date(analysis.timestamp).toLocaleString()}
        </p>
      </div>

      {/* Location */}
      <div>
        <h3 className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">📍 Location</h3>
        <p className="text-sm sm:text-base text-gray-800">{analysis.location.address}</p>
        {analysis.location.buildingType && (
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Building: {analysis.location.buildingType}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          {analysis.location.coordinates.lat.toFixed(6)}, {analysis.location.coordinates.lng.toFixed(6)}
        </p>
      </div>

      {/* Hazards */}
      {analysis.hazards.length > 0 && (
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">⚠️ Hazards Detected</h3>
          <div className="space-y-2">
            {analysis.hazards.map((hazard) => (
              <div 
                key={hazard.id} 
                className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl">{HAZARD_ICONS[hazard.type]}</span>
                  <span className="font-medium text-sm sm:text-base text-gray-800 capitalize">{hazard.type}</span>
                  <span className={`${SEVERITY_COLORS[hazard.severity]} text-white text-xs px-2 py-0.5 rounded ml-auto`}>
                    {hazard.severity}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">{hazard.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* People Involved */}
      {analysis.peopleInvolved.length > 0 && (
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">👥 People Involved</h3>
          <div className="space-y-2">
            {analysis.peopleInvolved.map((person, idx) => (
              <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl">👤</span>
                  <span className="font-medium text-sm sm:text-base text-gray-800">
                    {person.count > 0 ? `${person.count} ${person.description}` : person.description}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 capitalize">Status: {person.status}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Entry/Exit Paths */}
      <div>
        <h3 className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">🚪 Entry &amp; Exit Routes</h3>
        <div className="grid grid-cols-1 gap-2">
          {analysis.entryExitPaths.map((path) => (
            <div 
              key={path.id} 
              className={`${path.type === 'entry' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'} border rounded-lg p-2 sm:p-3`}
            >
              <div className="flex items-center gap-2">
                <span className={`${path.type === 'entry' ? 'text-green-600' : 'text-blue-600'} font-bold text-sm`}>
                  {path.type === 'entry' ? '▶ ENTRY' : '◀ EXIT'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">{path.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border-l-4 border-blue-500">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">📋 Summary</h3>
        <p className="text-sm sm:text-base text-gray-700">{analysis.summary}</p>
      </div>
    </div>
  );
}
